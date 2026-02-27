const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const compression = require('compression');
const logger = require('./utils/logger');

// Load env vars if file exists (local development)
const envPath = path.join(__dirname, '../.env');
if (require('fs').existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
// In production, process.env is populated by the hosting provider (Vercel)


// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const ads = require('./routes/ads');
const messages = require('./routes/messages');
const admin = require('./routes/admin');
const upload = require('./routes/upload');
const payment = require('./routes/payment');
const appointments = require('./routes/appointments');
const reviews = require('./routes/reviews');

// Connect to database
const connectDB = require('./config/db');
console.log('Server initializing...');
connectDB();


const app = express();

// Trust proxy for Vercel/proxies (Required for express-rate-limit)
// Set to 1 to only trust the first proxy (prevents X-Forwarded-For spoofing)
app.set('trust proxy', 1);


// Debug middleware for production
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url} - IP: ${req.ip}`);
    next();
  });
}


// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security headers
app.use(helmet());

// Set static folder
// Set static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Compress all responses
app.use(compression());

// Sanitize data
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Prevent http param pollution
app.use(hpp());

// Enable CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como apps móviles o curl)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:5000'
    ].filter(Boolean);

    // Allow if CLIENT_URL matches, or if it's our specific Vercel deploy
    if (allowedOrigins.indexOf(origin) !== -1 || origin.match(/^https:\/\/(safeconnect|priv)[\w-]*\.vercel\.app$/)) {
      callback(null, true);
    } else if (process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));


// DB Connection Middleware for Serverless
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 0) {
    console.log('DB connection dead, reconnecting...');
    try {
      await connectDB();
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Database connection failed' });
    }
  }
  next();
});

// General Rate limiting
// SECURITY: Relying on trust proxy (line 44) for safe IP detection via req.ip
const generalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 1000, // Increased to allow high-frequency polling for chat
  standardHeaders: true,
  legacyHeaders: false,
  validate: false // COMPLETELY disable all validation checks
});
app.use('/api', generalLimiter);

// Auth Rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    error: 'Demasiados intentos, intente más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false // COMPLETELY disable all validation checks
});

// Sensitive operations Rate limiting (strictest)
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    error: 'Demasiados intentos en operaciones sensibles, intente más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/updatepassword', sensitiveLimiter);
app.use('/api/payment/transfer', sensitiveLimiter);
app.use('/api/payment/withdraw', sensitiveLimiter);
app.use('/api/payment/submit-proof', sensitiveLimiter);
// Mount routers
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/ads', ads);
app.use('/api/messages', messages);
app.use('/api/admin', admin);
app.use('/api/upload', upload);
app.use('/api/payment', payment);
app.use('/api/appointments', appointments);
app.use('/api/reviews', reviews);

// Error handler
app.use((err, req, res, next) => {
  logger('error', `Error 500: ${err.message}\nStack: ${err.stack}`);
  // In production, don't leak internal error details
  const message = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : (err.message || 'Error interno del servidor');
  res.status(500).json({ success: false, error: message });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    logger('activity', `Servidor iniciado en puerto ${PORT} en modo ${process.env.NODE_ENV || 'development'}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

module.exports = app;

