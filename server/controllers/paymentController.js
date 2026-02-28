const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');
const Ad = require('../models/Ad');
const mongoose = require('mongoose');
const stripe = null; // Stripe removed
const packages = {
    'coins_100': { coins: 100, amount: 12000, type: 'deposit', currency: 'COP' },
    'coins_500': { coins: 500, amount: 55000, type: 'deposit', currency: 'COP' },
    'coins_1000': { coins: 1000, amount: 100000, type: 'deposit', currency: 'COP' },
    'premium_gold': { days: 30, plan: 'gold', amount: 60000, type: 'subscription', currency: 'COP' },
    'premium_diamond': { days: 30, plan: 'diamond', amount: 110000, type: 'subscription', currency: 'COP' }
};

// @desc    Get current wallet balance and transaction history
// @route   GET /api/payment/wallet
// @access  Private
exports.getWallet = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const transactions = await Transaction.find({
            $or: [{ user: req.user.id }, { recipient: req.user.id }]
        }).sort({ createdAt: -1 });

        // Ensure wallet exists
        if (!user.wallet) {
            user.wallet = { coins: 0 };
            await user.save();
        }

        res.status(200).json({
            success: true,
            data: {
                coins: user.wallet.coins,
                premiumPlan: user.premiumPlan,
                premiumUntil: user.premiumUntil,
                transactions
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Submit Manual Payment Proof
// @route   POST /api/payment/submit-proof
// @access  Private
exports.submitPaymentProof = async (req, res, next) => {
    try {
        const { packageId, proofUrl, bankName, referenceId, paymentDate } = req.body;

        if (!proofUrl) {
            return res.status(400).json({ success: false, error: 'Comprobante de pago requerido' });
        }

        const details = packages[packageId];
        if (!details) {
            return res.status(400).json({ success: false, error: 'Paquete inválido' });
        }

        // Prevent duplicate submissions with same reference ID for this user
        if (referenceId) {
            const existing = await Transaction.findOne({
                user: req.user.id,
                referenceId: referenceId,
                status: 'pending' // Only check pending to allow resubmission if rejected
            });

            if (existing) {
                return res.status(400).json({ success: false, error: 'Ya existe una solicitud pendiente con esta referencia.' });
            }

            // Also check if reference was used in a completed transaction (replay attack)
            const usedRef = await Transaction.findOne({
                referenceId: referenceId,
                status: 'completed'
            });
            if (usedRef) {
                return res.status(400).json({ success: false, error: 'Esta referencia ya ha sido utilizada.' });
            }
        }

        // Create Pending Transaction
        const transaction = await Transaction.create({
            user: req.user.id,
            type: details.type,
            amount: details.amount,
            currency: details.currency || 'COP',
            coinsAmount: details.coins || 0,
            status: 'pending',
            paymentMethod: 'manual',
            proofUrl: proofUrl,
            packageId: packageId,
            planDetails: details.type === 'subscription' ? { plan: details.plan, months: 1 } : undefined,
            description: `Solicitud compra ${details.type === 'subscription' ? details.plan : details.coins + ' coins'}`,

            // Manual Details
            bankName: bankName || 'Nequi',
            referenceId: referenceId || 'N/A',
            paymentDate: paymentDate || Date.now()
        });

        res.status(200).json({
            success: true,
            data: transaction
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al enviar comprobante' });
    }
};

// @desc    Get my transactions
// @route   GET /api/payment/history
exports.getMyTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: transactions.length, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener historial' });
    }
};

// @desc    Transfer Coins / Unlock Content
// @route   POST /api/payment/transfer
// @access  Private
exports.transferCoins = async (req, res, next) => {
    let coinsToTransfer = 0; // Declared outside try for catch-block access
    try {
        const { recipientId, amount, reason, messageId, packId } = req.body;
        coinsToTransfer = parseInt(amount);
        if (isNaN(coinsToTransfer) || coinsToTransfer <= 0) return res.status(400).json({ success: false, error: 'Invalid amount' });

        // SECURITY: Block self-transfer
        if (recipientId === req.user.id || recipientId === req.user._id?.toString()) {
            return res.status(400).json({ success: false, error: 'No puedes transferirte monedas a ti mismo' });
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(recipientId)) {
            return res.status(400).json({ success: false, error: 'ID de destinatario inválido' });
        }

        // Atomic update for sender: Decrement coins ONLY if balance is sufficient
        const sender = await User.findOneAndUpdate(
            { _id: req.user.id, 'wallet.coins': { $gte: coinsToTransfer } },
            { $inc: { 'wallet.coins': -coinsToTransfer } },
            { new: true }
        );

        if (!sender) {
            return res.status(400).json({ success: false, error: 'Insufficient funds' });
        }

        const recipient = await User.findById(recipientId).select('+priceList.content');
        if (!recipient) {
            // Refund sender if recipient not found (though this is rare)
            await User.findByIdAndUpdate(req.user.id, { $inc: { 'wallet.coins': coinsToTransfer } });
            return res.status(404).json({ success: false, error: 'Recipient not found' });
        }

        // Increase Recipient (Apply commission if needed)
        const commission = Math.floor(coinsToTransfer * 0.20); // 20% commission
        const finalAmount = coinsToTransfer - commission;

        // Atomic update for recipient
        await User.findByIdAndUpdate(recipientId, {
            $inc: { 'wallet.coins': finalAmount }
        });

        // 1. If messageId provided and it's a valid ObjectId, unlock it
        if (messageId && mongoose.Types.ObjectId.isValid(messageId)) {
            await Message.findByIdAndUpdate(messageId, {
                $addToSet: { unlockedBy: sender._id }
            });
        }

        // 2. AUTOMATIC CONTENT DELIVERY (for priceList packs)
        if (packId && mongoose.Types.ObjectId.isValid(packId)) {
            const pack = recipient.priceList.id(packId);
            if (pack && pack.content && pack.content.length > 0) {
                for (const url of pack.content) {
                    await Message.create({
                        sender: recipient._id,
                        recipient: sender._id,
                        content: url
                    });
                }
            }
        }

        // Create Transactions
        try {
            await Transaction.create({
                user: sender._id,
                type: 'spend',
                amount: coinsToTransfer,
                coinsAmount: coinsToTransfer,
                currency: 'COINS',
                status: 'completed',
                recipient: recipient._id,
                description: reason || 'Transfer to user'
            });

            await Transaction.create({
                user: recipient._id,
                type: 'receive',
                amount: finalAmount,
                coinsAmount: finalAmount,
                currency: 'COINS',
                status: 'completed',
                recipient: sender._id,
                description: reason || 'Received from user'
            });

            // Send holographic system notifications
            await Message.create({
                sender: sender._id,
                recipient: recipient._id,
                content: `💎 [TRANSACCIÓN VERIFICADA]\nHe pagado ${coinsToTransfer} monedas por tu servicio.\nConcepto: ${reason || 'Servicio'}\nID de Operación: ${Date.now().toString().slice(-8)}\n\nEl contenido se ha enviado automáticamente si correspondía a un pack.`,
                isSystem: true
            });
        } catch (innerError) {
            console.error('Non-critical transfer error (logging/notif):', innerError);
            // We don't fail the whole transfer if just the notification or history log fails
        }

        res.status(200).json({
            success: true,
            data: {
                newBalance: sender.wallet.coins
            }
        });

    } catch (error) {
        console.error('Transfer Critical Error:', error);

        // Fail-safe: Refund sender if coins were deducted
        try {
            if (coinsToTransfer > 0) {
                await User.findByIdAndUpdate(req.user.id, { $inc: { 'wallet.coins': coinsToTransfer } });
                console.log('Safe-Refund: Monedas devueltas satisfactoriamente tras error crítico.');
            }
        } catch (refundError) {
            console.error('CRITICAL: Falla masiva en reembolso de seguridad:', refundError);
        }

        res.status(500).json({ success: false, error: 'Transfer Failed: ' + error.message });
    }
};

// @desc    Submit Withdrawal Request
// @route   POST /api/payment/withdraw
// @access  Private (Announcers)
exports.withdraw = async (req, res) => {
    try {
        const { amount, targetAccount } = req.body;
        const coinsToWithdraw = parseInt(amount);
        const MIN_WITHDRAWAL = 100;

        if (isNaN(coinsToWithdraw) || coinsToWithdraw <= 0) {
            return res.status(400).json({ success: false, error: 'Monto inválido' });
        }

        if (coinsToWithdraw < MIN_WITHDRAWAL) {
            return res.status(400).json({ success: false, error: `El retiro mínimo es de ${MIN_WITHDRAWAL} monedas` });
        }

        if (!targetAccount || targetAccount.trim() === '') {
            return res.status(400).json({ success: false, error: 'Debe proporcionar una cuenta de destino' });
        }

        // Atomic Deduction: Check role and balance in one go
        const user = await User.findOneAndUpdate(
            {
                _id: req.user.id,
                $or: [{ role: 'announcer' }, { role: 'admin' }],
                'wallet.coins': { $gte: coinsToWithdraw }
            },
            { $inc: { 'wallet.coins': -coinsToWithdraw } },
            { new: true }
        );

        if (!user) {
            // Check why it failed (role or balance)
            const checkUser = await User.findById(req.user.id);
            if (!checkUser) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            if (checkUser.role !== 'announcer' && checkUser.role !== 'admin') {
                return res.status(403).json({ success: false, error: 'Solo los anunciantes pueden retirar dinero' });
            }
            if (!checkUser.wallet || checkUser.wallet.coins < coinsToWithdraw) {
                return res.status(400).json({ success: false, error: 'Saldo insuficiente' });
            }
            return res.status(500).json({ success: false, error: 'Error al procesar el retiro' });
        }

        // 1 Coin = 80 COP (Payout Rate)
        const amountCop = coinsToWithdraw * 80;

        // Create Withdrawal Transaction (Pending)
        try {
            const { bankName } = req.body;
            const transaction = await Transaction.create({
                user: user._id,
                type: 'withdrawal',
                amount: amountCop,
                coinsAmount: coinsToWithdraw,
                currency: 'COP',
                status: 'pending',
                description: `Solicitud de retiro a cuenta: ${targetAccount}`,
                bankName: bankName || 'Retiro manual'
            });

            res.status(200).json({
                success: true,
                data: transaction,
                newBalance: user.wallet.coins
            });
        } catch (txError) {
            // If transaction creation fails, we MUST refund the coins!
            console.error('Transaction creation failed, refunding coins:', txError);
            await User.findByIdAndUpdate(user._id, { $inc: { 'wallet.coins': coinsToWithdraw } });
            res.status(500).json({ success: false, error: 'Error al crear la transacción, los fondos han sido devueltos.' });
        }

    } catch (error) {
        console.error('Withdrawal Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error al procesar el retiro'
        });
    }
};

// @desc    Buy Subscription with Coins
// @route   POST /api/payment/buy-subscription
// @access  Private
exports.buySubscriptionWithCoins = async (req, res) => {
    try {
        const { planId } = req.body;
        const planRates = {
            'gold': 500, // 500 coins = $50.000 COP
            'diamond': 900 // 900 coins = $90.000 COP
        };

        const cost = planRates[planId];
        if (!cost) return res.status(400).json({ success: false, error: 'Plan inválido' });

        // 1. Fetch user to check current plan status
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        let newExpiryDate = new Date();
        // If already has this plan and it's active, extend it
        if (user.premium && user.premiumPlan === planId && user.premiumUntil > new Date()) {
            newExpiryDate = new Date(user.premiumUntil);
            newExpiryDate.setDate(newExpiryDate.getDate() + 30);
        } else {
            // New plan or expired, start from now + 30 days
            newExpiryDate.setDate(newExpiryDate.getDate() + 30);
        }

        // 2. Atomic Deduction and Update
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.id, 'wallet.coins': { $gte: cost } },
            {
                $inc: { 'wallet.coins': -cost },
                $set: {
                    premium: true,
                    premiumPlan: planId,
                    premiumUntil: newExpiryDate,
                    isVip: true,
                    diamondBoosts: planId === 'diamond' ? 5 : user.diamondBoosts || 0
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ success: false, error: 'Monedas insuficientes. Necesitas ' + cost + ' monedas.' });
        }

        // Log transaction
        await Transaction.create({
            user: updatedUser._id,
            type: 'spend',
            amount: cost,
            coinsAmount: cost,
            currency: 'COINS',
            status: 'completed',
            description: `Suscripción ${planId} (30 días)`
        });

        res.status(200).json({
            success: true,
            message: `Plan ${planId} activado correctamente`,
            newBalance: updatedUser.wallet.coins
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al procesar la suscripción' });
    }
};

// @desc    Boost Ad with Coins
// @route   POST /api/payment/boost-ad
// @access  Private
exports.boostAdWithCoins = async (req, res) => {
    try {
        const { adId } = req.body;
        const BOOST_COST = 100; // 100 coins = $10.000 COP for 12 hours

        const ad = await Ad.findById(adId);
        if (!ad) return res.status(404).json({ success: false, error: 'Anuncio no encontrado' });
        if (ad.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'No tienes permiso sobre este anuncio' });
        }

        // Check once-per-day limit (24 hours)
        const now = new Date();
        if (ad.lastBoostDate && (now - new Date(ad.lastBoostDate)) < 24 * 60 * 60 * 1000) {
            const nextAvailable = new Date(new Date(ad.lastBoostDate).getTime() + 24 * 60 * 60 * 1000);
            const hoursLeft = Math.ceil((nextAvailable.getTime() - now.getTime()) / (60 * 60 * 1000));
            return res.status(400).json({
                success: false,
                error: `Ya has impulsado este anuncio hoy. Podrás impulsarlo de nuevo en aproximadamente ${hoursLeft} horas.`
            });
        }

        // Check for Diamond free boosts
        const user = await User.findById(req.user.id);
        const isDiamond = user.premiumPlan === 'diamond' && user.premiumUntil && new Date(user.premiumUntil) > new Date();
        const hasFreeBoosts = isDiamond && (user.diamondBoosts > 0);
        const boostCost = hasFreeBoosts ? 0 : BOOST_COST;

        // Atomic Deduction
        const updateQuery = { _id: req.user.id };
        if (boostCost > 0) {
            updateQuery['wallet.coins'] = { $gte: boostCost };
        }

        const updateOps = { $inc: {} };
        if (boostCost > 0) {
            updateOps.$inc['wallet.coins'] = -boostCost;
        }
        if (hasFreeBoosts) {
            updateOps.$inc['diamondBoosts'] = -1;
        }

        const updatedUser = await User.findOneAndUpdate(updateQuery, updateOps, { new: true });

        if (!updatedUser) {
            return res.status(400).json({ success: false, error: `Necesitas ${boostCost} monedas para un boost.` });
        }

        // Apply Boost (Normal: 12h, Diamond Free: 12h)
        const boostDurationHours = 12;
        const boostExpires = new Date();
        boostExpires.setHours(boostExpires.getHours() + boostDurationHours);

        ad.boostedUntil = boostExpires;
        ad.isBoosted = true;
        ad.lastBumpDate = now;
        ad.lastBoostDate = now;
        await ad.save();

        // Log transaction ONLY if it cost coins
        if (boostCost > 0) {
            await Transaction.create({
                user: updatedUser._id,
                type: 'spend',
                amount: boostCost,
                coinsAmount: boostCost,
                currency: 'COINS',
                status: 'completed',
                description: `Boost de ${boostDurationHours} horas para anuncio ${ad.title}`
            });
        }

        res.status(200).json({
            success: true,
            message: hasFreeBoosts ? `¡Boost GRATUITO de ${boostDurationHours}h aplicado!` : `Anuncio impulsado por ${boostDurationHours} horas`,
            newBalance: updatedUser.wallet.coins,
            diamondBoosts: updatedUser.diamondBoosts
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al aplicar el boost' });
    }
};
