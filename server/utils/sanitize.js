/**
 * Security utility to sanitize inputs and prevent XSS
 */

/**
 * Strips HTML tags and trims whitespace
 * @param {string} str - Input string
 * @param {number} maxLength - Optional max length
 * @returns {string} - Sanitized string
 */
const sanitizeString = (str, maxLength = 2000) => {
    if (!str || typeof str !== 'string') return '';

    // 1. Strip all HTML tags
    let result = str.replace(/<[^>]*>?/gm, '');

    // 2. Trim and limit length
    result = result.trim().slice(0, maxLength);

    return result;
};

/**
 * Deep sanitization for priceList items
 * @param {Array} priceList - User's price list
 * @returns {Array} - Sanitized price list
 */
const sanitizePriceList = (priceList) => {
    if (!Array.isArray(priceList)) return [];

    return priceList.slice(0, 50).map(item => ({
        label: sanitizeString(item.label, 100),
        price: Math.floor(Math.abs(Number(item.price) || 0)),
        description: sanitizeString(item.description, 200),
        type: ['photos', 'videos', 'service'].includes(item.type) ? item.type : 'service',
        quantity: Math.min(100, Math.max(1, Math.floor(Number(item.quantity) || 1))),
        content: Array.isArray(item.content)
            ? item.content.filter(url => typeof url === 'string' && url.startsWith('http'))
            : []
    }));
};

module.exports = {
    sanitizeString,
    sanitizePriceList
};
