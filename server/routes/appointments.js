const express = require('express');
const router = express.Router();
const {
    createAppointment,
    updateAppointmentStatus,
    getMyAppointments
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

const { validate, appointmentSchema } = require('../middleware/validate');
const rateLimit = require('express-rate-limit');

// Rate limiter: 5 attempts per hour per IP for creating appointments
const createAppointmentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { success: false, error: 'Demasiadas solicitudes de cita. Inténtalo de nuevo en una hora.' }
});

router.use(protect);

router.post('/', createAppointmentLimiter, validate(appointmentSchema), createAppointment);
router.get('/', getMyAppointments);
router.put('/:id', updateAppointmentStatus);

module.exports = router;
