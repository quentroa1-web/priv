const fs = require('fs');
const path = require('path');

/**
 * Organizes logs by folder and date
 * @param {string} type - The type of log (e.g., 'chat', 'error', 'activity')
 * @param {string} message - The message to log
 */
const logger = (type, message) => {
    const now = new Date();
    const timestamp = now.toISOString();

    // In production (Vercel), we only log to console. 
    // Vercel records these console logs automatically.
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        console.log(`[${timestamp}][${type.toUpperCase()}] ${message}`);
        return;
    }

    // Development local logging to files
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const logDir = path.join(__dirname, '../logs', String(year), month, day);

    try {
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const logFile = path.join(logDir, `${type}.log`);
        const safeMessage = message.toString().replace(/\n|\r/g, ' ');
        const logEntry = `[${timestamp}] ${safeMessage}\n`;

        fs.appendFileSync(logFile, logEntry);
    } catch (err) {
        console.error(`Error writing to log file: ${err.message}`);
    }

    console.log(`[LOG][${type.toUpperCase()}] ${message}`);
};


module.exports = logger;
