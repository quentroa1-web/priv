const Ad = require('../models/Ad');
const User = require('../models/User');
const { saveBase64Image } = require('../utils/fileHandler');
const logger = require('../utils/logger');

// @desc    Get all ads
// @route   GET /api/ads
// @access  Public
exports.getAds = async (req, res) => {
  try {
    let query = { isActive: true };

    // Filter by category (sex)
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by location
    if (req.query.department) {
      query['location.department'] = req.query.department;
    }
    if (req.query.city) {
      query['location.city'] = req.query.city;
    }

    // Filter by age range
    if (req.query.minAge || req.query.maxAge) {
      query.age = {};
      if (req.query.minAge) query.age.$gte = parseInt(req.query.minAge);
      if (req.query.maxAge) query.age.$lte = parseInt(req.query.maxAge);
    }

    // Filter by plan (for VIP section)
    if (req.query.plan) {
      query.plan = req.query.plan;
    }

    // We can't easily filter by user.status in the Ad.find query without a join/lookup,
    // so we'll populate and then filter, or better, use a more complex query if needed.
    // However, for simplicity and performance in this scale, we'll populate and then filter in JS
    // OR just ensure the population includes the status for the frontend to handle if they slipped through.
    // Actually, let's stick to populating first.

    const ads = await Ad.find(query)
      .populate({
        path: 'user',
        select: 'name avatar lastSeen role priceList verified isVip premiumPlan rating reviewCount status premiumUntil diamondBoosts',
        options: { virtuals: true }
      })
      .sort({
        boostedUntil: -1, // Active/recent boosts first
        priority: -1,
        lastBumpDate: -1,
        createdAt: -1
      });

    // Post-filter banned users
    const activeAds = ads.filter(ad => ad.user && ad.user.status !== 'banned');

    res.status(200).json({
      success: true,
      count: activeAds.length,
      data: activeAds
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single ad
// @route   GET /api/ads/:id
// @access  Public
exports.getAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id).populate('user', 'name avatar bio role priceList verified wallet');

    if (!ad) {
      return res.status(404).json({ success: false, error: 'Ad not found' });
    }

    // Increment views atomically
    await Ad.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      data: ad
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new ad
// @route   POST /api/ads
// @access  Private (Announcer only)
exports.createAd = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Check if premium has expired
    if (user.premium && user.premiumUntil && new Date() > new Date(user.premiumUntil)) {
      user.premium = false;
      user.premiumPlan = 'none';
      user.isVip = false;
      await user.save();
    }

    // Check user's premium status and ad count
    const adCount = await Ad.countDocuments({ user: userId });

    // Limits based on plan
    let limit = 1;
    if (user.premiumPlan === 'gold') limit = 2;
    if (user.premiumPlan === 'diamond') limit = 3;

    if (adCount >= limit) {
      return res.status(400).json({
        success: false,
        error: `Has alcanzado el límite de anuncios (${limit}) para tu plan ${user.premiumPlan}. Mejora tu plan para publicar más.`
      });
    }

    // Determine priority based on plan
    let priority = 1;
    let plan = 'free';

    if (user.premiumPlan === 'gold') {
      priority = 2;
      plan = 'gold';
    } else if (user.premiumPlan === 'diamond') {
      priority = 3;
      plan = 'diamond';
    }

    // Process Photos: Convert Base64 to Files (Cloudinary or Local)
    let processedPhotos = [];
    if (req.body.photos && Array.isArray(req.body.photos)) {
      processedPhotos = await Promise.all(req.body.photos.map(async (photo, index) => {
        try {
          const url = await saveBase64Image(photo.url || photo, 'ads');
          return {
            url,
            isMain: photo.isMain || index === 0
          };
        } catch (err) {
          logger('error', `Error saving photo for user ${userId}: ${err.message}`);
          return photo; // Keep original if error
        }
      }));
    }

    const {
      title, description, category, age, phone, whatsapp, location,
      services, customServices, pricing, attendsTo, availability, photos
    } = req.body;

    const adData = {
      title, description, category, age, phone, whatsapp, location,
      services, customServices, pricing, attendsTo, availability,
      photos: processedPhotos,
      user: userId,
      isVerified: false,
      isActive: true,
      plan: plan,
      priority: priority,
      lastBumpDate: Date.now()
    };

    const ad = await Ad.create(adData);
    logger('activity', `Nuevo anuncio creado por el usuario ${userId}: ${ad.title}`);

    res.status(201).json({
      success: true,
      data: ad
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update ad
// @route   PUT /api/ads/:id
// @access  Private (Owner or Admin)
exports.updateAd = async (req, res) => {
  try {
    let ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ success: false, error: 'Ad not found' });
    }

    // Make sure user is ad owner or admin
    if (ad.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this ad' });
    }

    // Protected fields that shouldn't be updated by owner directly
    const updates = { ...req.body };
    delete updates.user;

    // Si no es admin, no puede modificar estos campos sensibles
    if (req.user.role !== 'admin') {
      delete updates.plan;
      delete updates.priority;
      delete updates.lastBumpDate;
      delete updates.isVerified;
      delete updates.views;
      delete updates.isBoosted;
      delete updates.boostedUntil;
      delete updates.lastBoostDate;
      delete updates.createdAt;
      delete updates.expiresAt;
    }

    // Process Photos if updated
    if (updates.photos && Array.isArray(updates.photos)) {
      updates.photos = await Promise.all(updates.photos.map(async (photo, index) => {
        try {
          // If it's already a URL (local or cloudinary), don't re-save
          const photoUrl = typeof photo === 'string' ? photo : (photo.url || '');
          if (photoUrl.startsWith('/uploads') || photoUrl.startsWith('http')) {
            return typeof photo === 'string' ? { url: photo, isMain: index === 0 } : photo;
          }

          const url = await saveBase64Image(photoUrl, 'ads');
          return {
            url,
            isMain: photo.isMain || index === 0
          };
        } catch (err) {
          logger('error', `Error updating photo for ad ${ad._id}: ${err.message}`);
          return photo;
        }
      }));
    }

    ad = await Ad.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: ad
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete ad
// @route   DELETE /api/ads/:id
// @access  Private (Owner or Admin)
exports.deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ success: false, error: 'Ad not found' });
    }

    // Make sure user is ad owner or admin
    if (ad.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this ad' });
    }

    await ad.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get my ads (for logged in announcer)
// @route   GET /api/ads/myads
// @access  Private
exports.getMyAds = async (req, res) => {
  try {
    const ads = await Ad.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ads.length,
      data: ads
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Boost Ad (Pay with coins)
// @route   POST /api/ads/:id/boost
// @access  Private
exports.boostAd = async (req, res) => {
  try {
    const BOOST_COST = 100; // Fixed: Match with paymentController
    const ad = await Ad.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!ad) {
      return res.status(404).json({ success: false, error: 'Ad not found' });
    }

    if (ad.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Check once-per-day limit (24 hours) — MUST be checked BEFORE deducting coins
    const now = new Date();
    if (ad.lastBoostDate && (now - new Date(ad.lastBoostDate)) < 24 * 60 * 60 * 1000) {
      const nextAvailable = new Date(new Date(ad.lastBoostDate).getTime() + 24 * 60 * 60 * 1000);
      const hoursLeft = Math.ceil((nextAvailable.getTime() - now.getTime()) / (60 * 60 * 1000));
      return res.status(400).json({
        success: false,
        error: `Ya has impulsado este anuncio hoy. Podrás impulsarlo de nuevo en aproximadamente ${hoursLeft} horas.`
      });
    }

    // Check if already boosted
    if (ad.isBoosted && ad.boostedUntil && new Date(ad.boostedUntil) > new Date()) {
      return res.status(400).json({ success: false, error: 'Este anuncio ya tiene un Boost activo.' });
    }

    // Check if user already has an active boost on ANY ad
    const activeBoost = await Ad.findOne({
      user: req.user.id,
      isBoosted: true,
      boostedUntil: { $gt: new Date() }
    });

    if (activeBoost) {
      return res.status(400).json({ success: false, error: 'Ya tienes un anuncio con un Boost activo. Espera a que termine para activar otro.' });
    }

    // Check for Diamond free boosts
    const isDiamond = user.premiumPlan === 'diamond' && user.premiumUntil && new Date(user.premiumUntil) > new Date();
    const hasFreeBoosts = isDiamond && (user.diamondBoosts > 0);
    const boostCost = hasFreeBoosts ? 0 : BOOST_COST;

    // Ensure wallet exists
    if (!user.wallet) {
      user.wallet = { coins: 0 };
    }

    if (user.wallet.coins < boostCost) {
      return res.status(400).json({ success: false, error: `Saldo insuficiente. Necesitas ${boostCost} monedas.` });
    }

    // Deduct coins or free boost
    if (hasFreeBoosts) {
      user.diamondBoosts -= 1;
    } else {
      user.wallet.coins -= boostCost;
    }
    await user.save();

    // Update Ad
    ad.lastBumpDate = now;
    ad.lastBoostDate = now;

    // Apply Boost (Normal: 12h, Diamond Free: 12h)
    const boostDurationHours = 12;
    const boostExpires = new Date();
    boostExpires.setHours(boostExpires.getHours() + boostDurationHours);
    ad.boostedUntil = boostExpires;
    ad.isBoosted = true;

    await ad.save();

    // Create Transaction Record ONLY if it cost coins
    if (boostCost > 0) {
      const Transaction = require('../models/Transaction');
      await Transaction.create({
        user: user._id,
        type: 'spend',
        amount: boostCost,
        currency: 'COINS',
        status: 'completed',
        description: `Boost Ad: ${ad.title}`,
        metadata: { adId: ad._id }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        coins: user.wallet.coins,
        diamondBoosts: user.diamondBoosts,
        lastBumpDate: ad.lastBumpDate,
        message: hasFreeBoosts ? `¡Boost GRATUITO de ${boostDurationHours}h aplicado!` : `¡Anuncio impulsado por ${boostDurationHours} horas!`
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
