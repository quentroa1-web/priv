const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['deposit', 'subscription', 'spend', 'receive', 'withdrawal'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        enum: ['COP', 'USD', 'COINS'],
        default: 'COP'
    },
    coinsAmount: {
        type: Number, // Amount of coins involved if applicable
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded', 'approved', 'rejected'],
        default: 'pending'
    },
    paymentMethod: {
        type: String, // 'stripe', 'paypal', 'manual', 'wallet'
        default: 'stripe'
    },
    transactionId: {
        type: String, // Stripe PaymentIntent ID or similar
        sparse: true
    },
    description: String,

    // Manual Payment Details
    bankName: {
        type: String,
        default: 'Nequi'
    },
    referenceId: String, // Transaction ID from bank
    paymentDate: Date,
    rejectionReason: String,
    recipient: {
        type: mongoose.Schema.Types.ObjectId, // If type is 'spend'/'receive'
        ref: 'User'
    },
    proofUrl: String,
    packageId: String,
    planDetails: {
        plan: String,
        months: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
