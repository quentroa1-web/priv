const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Ad = require('../models/Ad');
const Message = require('../models/Message');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const { sanitizeString } = require('../utils/sanitize');
const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID || '6989549ede1ca80e285692a8';

// @desc    Create appointment request
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
    try {
        const { announcerId, adId, date, time, location, details } = req.body;

        const safeLocation = sanitizeString(location, 200);
        const safeDetails = sanitizeString(details, 500);
        const safeTime = sanitizeString(time, 50);

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(announcerId)) {
            return res.status(400).json({ success: false, error: 'ID de anunciante inválido' });
        }

        if (req.user.id === announcerId) {
            return res.status(400).json({ success: false, error: 'No puedes solicitar una cita contigo mismo.' });
        }

        // Validate date is not in the past (allow today)
        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (appointmentDate < today) {
            return res.status(400).json({ success: false, error: 'No puedes programar citas para fechas pasadas.' });
        }

        // Ad is optional, but if provided, must be valid and belong to announcer
        if (adId) {
            const ad = await Ad.findById(adId);
            if (!ad) {
                return res.status(404).json({ success: false, error: 'Anuncio no encontrado.' });
            }

            if (ad.user.toString() !== announcerId) {
                return res.status(400).json({ success: false, error: 'El anuncio no pertenece al anunciante registrado.' });
            }
        }

        // Check if there's already a pending appointment for the same announcer
        const existingAppointment = await Appointment.findOne({
            client: req.user.id,
            announcer: announcerId,
            ad: adId || { $exists: false },
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointment) {
            return res.status(400).json({ success: false, error: 'Ya tienes una solicitud de cita pendiente o confirmada con este anunciante.' });
        }

        const appointment = await Appointment.create({
            client: req.user.id,
            announcer: announcerId,
            ad: adId || null,
            date,
            time: safeTime,
            location: safeLocation,
            details: safeDetails
        });

        // Send a system message to the announcer
        await Message.create({
            sender: SYSTEM_USER_ID,
            recipient: announcerId,
            content: `📅 Solicitud de Cita: El usuario ${req.user.name} ha solicitado una cita para el ${new Date(date).toLocaleDateString()} a las ${safeTime}. Lugar: ${safeLocation}.`,
            isSystem: true
        });

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update appointment status (Confirm/Complete/Cancel)
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Cita no encontrada' });
        }

        const isClient = appointment.client.toString() === req.user.id;
        const isAnnouncer = appointment.announcer.toString() === req.user.id;

        // Authorization: only participant can update status
        if (!isClient && !isAnnouncer) {
            return res.status(403).json({ success: false, error: 'No autorizado' });
        }

        // Logic validation for status transitions
        if (status === 'confirmed' && !isAnnouncer) {
            return res.status(400).json({ success: false, error: 'Solo el anunciante puede confirmar la cita' });
        }

        if (status === 'completed' && appointment.status !== 'confirmed') {
            return res.status(400).json({ success: false, error: 'Solo se pueden finalizar citas que han sido confirmadas' });
        }

        if (status === 'cancelled' && appointment.status === 'completed') {
            return res.status(400).json({ success: false, error: 'No se puede cancelar una cita ya completada' });
        }

        appointment.status = status;
        await appointment.save();

        // Trigger system message notification
        const partnerId = isClient ? appointment.announcer : appointment.client;
        const statusText = status === 'confirmed' ? 'CONFIRMADA' : status === 'completed' ? 'COMPLETADA' : 'CANCELADA';

        await Message.create({
            sender: SYSTEM_USER_ID,
            recipient: partnerId,
            content: `📅 Actualización de Cita: Tu cita ha sido marcada como ${statusText}.`,
            isSystem: true
        });

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get my appointments
// @route   GET /api/appointments
// @access  Private
exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            $or: [{ client: req.user.id }, { announcer: req.user.id }]
        }).populate('client announcer ad', 'name avatar title');

        res.status(200).json({
            success: true,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
