const express = require('express');
const { protect } = require('../middleware/auth');
const {
    getWallet,
    submitPaymentProof,
    transferCoins,
    getMyTransactions,
    withdraw,
    buySubscriptionWithCoins,
    boostAdWithCoins
} = require('../controllers/paymentController');
const {
    validate,
    transferSchema,
    withdrawSchema,
    submitProofSchema,
    buySubscriptionSchema,
    boostAdPaymentSchema
} = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/wallet', getWallet);
router.get('/history', getMyTransactions);
router.post('/submit-proof', validate(submitProofSchema), submitPaymentProof);
router.post('/transfer', validate(transferSchema), transferCoins);
router.post('/withdraw', validate(withdrawSchema), withdraw);
router.post('/buy-subscription', validate(buySubscriptionSchema), buySubscriptionWithCoins);
router.post('/boost-ad', validate(boostAdPaymentSchema), boostAdWithCoins);

module.exports = router;
