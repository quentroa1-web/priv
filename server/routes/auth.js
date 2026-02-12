const express = require('express');
const router = express.Router();
const { register, login, getMe, updateDetails, updatePassword, heartbeat } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, registerSchema, loginSchema, updateDetailsSchema } = require('../middleware/validate');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, validate(updateDetailsSchema), updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/heartbeat', protect, heartbeat);

module.exports = router;
