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

const router = express.Router();

router.use(protect);

router.get('/wallet', getWallet);
router.get('/history', getMyTransactions);
router.post('/submit-proof', submitPaymentProof);
router.post('/transfer', transferCoins);
router.post('/withdraw', withdraw);
router.post('/buy-subscription', buySubscriptionWithCoins);
router.post('/boost-ad', boostAdWithCoins);

module.exports = router;
