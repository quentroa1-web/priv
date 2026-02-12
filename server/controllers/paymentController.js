const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');
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
    try {
        const { recipientId, amount, reason, messageId } = req.body;
        const coinsToTransfer = parseInt(amount);
        if (isNaN(coinsToTransfer) || coinsToTransfer <= 0) return res.status(400).json({ success: false, error: 'Invalid amount' });

        const sender = await User.findById(req.user.id);
        const recipient = await User.findById(recipientId);

        if (!recipient) return res.status(404).json({ success: false, error: 'Recipient not found' });

        // Ensure wallets exist
        if (!sender.wallet) sender.wallet = { coins: 0 };
        if (!recipient.wallet) recipient.wallet = { coins: 0 };

        if (sender.wallet.coins < coinsToTransfer) return res.status(400).json({ success: false, error: 'Insufficient funds' });

        // Decrease Sender
        sender.wallet.coins -= coinsToTransfer;
        await sender.save();

        // Increase Recipient (Apply commission if needed)
        const commission = Math.floor(coinsToTransfer * 0.20); // 20% commission
        const finalAmount = coinsToTransfer - commission;

        recipient.wallet.coins += finalAmount;
        await recipient.save();

        // If messageId provided and it's a valid ObjectId, unlock it
        const mongoose = require('mongoose');
        if (messageId && mongoose.Types.ObjectId.isValid(messageId)) {
            await Message.findByIdAndUpdate(messageId, {
                $addToSet: { unlockedBy: sender._id }
            });
        }

        // Create Transactions
        await Transaction.create({
            user: sender._id,
            type: 'spend',
            amount: coinsToTransfer, // Value in coins
            currency: 'COINS',
            status: 'completed',
            recipient: recipient._id,
            description: reason || 'Transfer to user'
        });

        await Transaction.create({
            user: recipient._id,
            type: 'receive',
            amount: finalAmount,
            currency: 'COINS',
            status: 'completed',
            recipient: sender._id,
            description: reason || 'Received from user'
        });

        // Send holographic system notifications directly into their private chat
        try {
            // 1. Message from Sender to Recipient (The "Verified Receipt" the advertiser sees)
            await Message.create({
                sender: sender._id,
                recipient: recipient._id,
                content: `💎 [TRANSACCIÓN VERIFICADA]\nHe pagado ${coinsToTransfer} monedas por tu servicio.\nConcepto: ${reason || 'Servicio'}\nID de Operación: ${Date.now().toString().slice(-8)}`,
                isSystem: true
            });

            // 2. Also keep a copy for the system log or notifications if preferred, 
            // but for now, making it appear in their chat is what the user wants.
            // We can also send a duplicate from a "System Admin" if we want it to look like a bot intervention.
            // Let's use the systemAdmin as the sender BUT it won't appear in the {sender, recipient} chat.
            // If the user wants it "in the chat with the advertiser", the partners must be sender/recipient.
        } catch (msgErr) {
            console.error('Error sending holographic notifications:', msgErr);
        }

        res.status(200).json({
            success: true,
            data: {
                newBalance: sender.wallet.coins
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Transfer Failed' });
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

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        if (user.role !== 'announcer' && user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Solo los anunciantes pueden retirar dinero' });
        }

        // Ensure wallet exists
        if (!user.wallet) {
            user.wallet = { coins: 0 };
        }

        if (user.wallet.coins < coinsToWithdraw) {
            return res.status(400).json({ success: false, error: 'Saldo insuficiente' });
        }

        if (!targetAccount || targetAccount.trim() === '') {
            return res.status(400).json({ success: false, error: 'Debe proporcionar una cuenta de destino' });
        }

        // 1 Coin = 80 COP (Payout Rate)
        const amountCop = coinsToWithdraw * 80;

        // Create Withdrawal Transaction (Pending)
        const transaction = await Transaction.create({
            user: user._id,
            type: 'withdrawal',
            amount: amountCop,
            coinsAmount: coinsToWithdraw,
            currency: 'COP',
            status: 'pending',
            description: `Solicitud de retiro a cuenta: ${targetAccount}`,
            bankName: targetAccount || 'Retiro manual'
        });

        // Deduct coins immediately (reserve them)
        user.wallet.coins -= coinsToWithdraw;
        await user.save();

        res.status(200).json({
            success: true,
            data: transaction,
            newBalance: user.wallet.coins
        });

    } catch (error) {
        console.error('Withdrawal Error:', error);
        const isDevelopment = process.env.NODE_ENV !== 'production';
        res.status(500).json({
            success: false,
            error: 'Error al procesar el retiro',
            ...(isDevelopment && { details: error.message })
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

        const user = await User.findById(req.user.id);

        // Ensure wallet exists
        if (!user.wallet) {
            user.wallet = { coins: 0 };
        }

        if (user.wallet.coins < cost) {
            return res.status(400).json({ success: false, error: 'Monedas insuficientes. Necesitas ' + cost + ' monedas.' });
        }

        // Deduct coins
        user.wallet.coins -= cost;
        user.premium = true;
        user.premiumPlan = planId;

        // Set expiry (30 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        user.premiumUntil = expiryDate;

        await user.save();

        // Log transaction
        await Transaction.create({
            user: user._id,
            type: 'spend',
            amount: cost,
            currency: 'COINS',
            status: 'completed',
            description: `Suscripción ${planId} (30 días)`
        });

        res.status(200).json({
            success: true,
            message: `Plan ${planId} activado correctamente`,
            newBalance: user.wallet.coins
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

        const user = await User.findById(req.user.id);

        // Ensure wallet exists
        if (!user.wallet) {
            user.wallet = { coins: 0 };
        }

        if (user.wallet.coins < BOOST_COST) {
            return res.status(400).json({ success: false, error: 'Necesitas 100 monedas para un boost de 12 horas' });
        }

        // Find the ad and verify ownership
        const Ad = require('../models/Ad'); // Assuming Ad model exists
        const ad = await Ad.findById(adId);
        if (!ad || ad.user.toString() !== user._id.toString()) {
            return res.status(403).json({ success: false, error: 'No tienes permiso sobre este anuncio' });
        }

        // Deduct coins
        user.wallet.coins -= BOOST_COST;
        await user.save();

        // Apply Boost (12 hours)
        const boostExpires = new Date();
        boostExpires.setHours(boostExpires.getHours() + 12);

        ad.boostedUntil = boostExpires;
        ad.isBoosted = true;
        ad.lastBumpDate = Date.now();
        await ad.save();

        // Log transaction
        await Transaction.create({
            user: user._id,
            type: 'spend',
            amount: BOOST_COST,
            currency: 'COINS',
            status: 'completed',
            description: `Boost de 12 horas para anuncio ${ad.title}`
        });

        res.status(200).json({
            success: true,
            message: 'Anuncio impulsado por 12 horas',
            newBalance: user.wallet.coins
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al aplicar el boost' });
    }
};
