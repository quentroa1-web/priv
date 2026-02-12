const express = require('express');
const router = express.Router();
const { getAds, getAd, createAd, updateAd, deleteAd, getMyAds, boostAd } = require('../controllers/adController');
const { protect, announcerOnly } = require('../middleware/auth');

const { validate, adSchema } = require('../middleware/validate');

router.get('/', getAds);
router.get('/myads', protect, announcerOnly, getMyAds);
router.get('/:id', getAd);
router.post('/', protect, announcerOnly, validate(adSchema), createAd);
router.put('/:id', protect, announcerOnly, validate(adSchema), updateAd);
router.delete('/:id', protect, announcerOnly, deleteAd);
router.post('/:id/boost', protect, announcerOnly, boostAd);

module.exports = router;
