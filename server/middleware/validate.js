const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ success: false, error: errorMessage });
        }
        next();
    };
};

/**
 * AUTH SCHEMAS
 */
const registerSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
        .messages({
            'string.pattern.base': 'La contraseña debe incluir mayúsculas, minúsculas y números'
        }),
    role: Joi.string().valid('user', 'announcer', 'admin').default('user'),
    phone: Joi.string().allow('', null),
    age: Joi.number().min(18).required(),
    gender: Joi.string().valid('woman', 'man', 'transgender', 'gigolo', 'other').required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

/**
 * USER SCHEMAS
 */
const updateDetailsSchema = Joi.object({
    name: Joi.string().min(3).max(50),
    displayName: Joi.string().max(50),
    email: Joi.string().email(),
    phone: Joi.string().allow('', null),
    bio: Joi.string().max(500).allow('', null),
    languages: Joi.array().items(Joi.string()),
    location: Joi.alternatives().try(
        Joi.string().allow('', null),
        Joi.object({
            department: Joi.string().allow('', null),
            city: Joi.string().allow('', null),
            neighborhood: Joi.string().allow('', null),
            specificZone: Joi.string().allow('', null)
        })
    ),
    age: Joi.number().min(18).max(99),
    gender: Joi.string().valid('woman', 'man', 'transgender', 'gigolo', 'other'),
    avatar: Joi.string().uri().allow('', null),
    priceList: Joi.array().items(Joi.object({
        label: Joi.string().required(),
        price: Joi.number().min(0).required(),
        description: Joi.string().allow('', null),
        type: Joi.string().valid('photos', 'videos', 'service').default('service'),
        quantity: Joi.number().min(1).max(100).default(1),
        _id: Joi.any(),
        id: Joi.any()
    }).unknown(true)),
    paymentMethods: Joi.array().items(Joi.object({
        type: Joi.string().required(),
        details: Joi.string().required(),
        _id: Joi.any(),
        id: Joi.any()
    }).unknown(true))
});

/**
 * AD SCHEMAS
 */
const adSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(20).max(2000).required(),
    category: Joi.string().valid('woman', 'man', 'transgender', 'gigolo', 'mujer', 'hombre', 'trans').required(),
    age: Joi.number().min(18).max(99).required(),
    location: Joi.object({
        department: Joi.string().required(),
        city: Joi.string().required(),
        neighborhood: Joi.string().allow('', null),
        specificZone: Joi.string().allow('', null),
        placeType: Joi.array().items(Joi.string())
    }).required(),
    phone: Joi.string().required(),
    whatsapp: Joi.string().allow('', null),
    services: Joi.array().items(Joi.string()),
    customServices: Joi.array().items(Joi.string()),
    images: Joi.array().items(Joi.string().uri()),
    photos: Joi.array().items(Joi.object({
        url: Joi.string().required(),
        isMain: Joi.boolean()
    })),
    pricing: Joi.object({
        basePrice: Joi.number().min(0),
        priceType: Joi.string().valid('hour', 'service', 'negotiable', 'hora', 'sesion', 'negociable')
    }),
    attendsTo: Joi.array().items(Joi.string()),
    availability: Joi.object({
        days: Joi.array().items(Joi.string()),
        hours: Joi.object({
            start: Joi.string(),
            end: Joi.string()
        })
    }),
    plan: Joi.string().valid('free', 'premium', 'vip', 'gratis')
}).unknown(true);

/**
 * ADMIN SCHEMAS
 */
const adminUpdateUserSchema = Joi.object({
    role: Joi.string().valid('user', 'announcer', 'admin'),
    status: Joi.string().valid('active', 'banned'),
    verified: Joi.boolean(),
    idVerified: Joi.boolean(),
    photoVerified: Joi.boolean(),
    premium: Joi.boolean(),
    isVip: Joi.boolean(),
    premiumUntil: Joi.date().allow(null)
});

/**
 * MESSAGE SCHEMAS
 */
const messageSchema = Joi.object({
    recipientId: Joi.string().required(),
    content: Joi.string().min(1).max(2000).required(),
    isLocked: Joi.boolean(),
    price: Joi.number().min(0)
});

/**
 * APPOINTMENT SCHEMAS
 */
const appointmentSchema = Joi.object({
    announcerId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    adId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    date: Joi.date().iso().required(),
    time: Joi.string().required(),
    location: Joi.string().max(200).required(),
    details: Joi.string().max(500).allow('', null)
});

/**
 * REVIEW SCHEMAS
 */
const reviewSchema = Joi.object({
    appointmentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().min(5).max(1000).required(),
    categories: Joi.object({
        // Client → Announcer criteria
        service: Joi.number().min(1).max(5),
        hygiene: Joi.number().min(1).max(5),
        // Announcer → Client criteria
        respect: Joi.number().min(1).max(5),
        tidiness: Joi.number().min(1).max(5),
        // Shared criteria
        punctuality: Joi.number().min(1).max(5),
        communication: Joi.number().min(1).max(5)
    }).required()
});

const reviewResponseSchema = Joi.object({
    content: Joi.string().min(5).max(1000).required()
});

module.exports = {
    validate,
    registerSchema,
    loginSchema,
    updateDetailsSchema,
    adSchema,
    adminUpdateUserSchema,
    messageSchema,
    appointmentSchema,
    reviewSchema,
    reviewResponseSchema
};
