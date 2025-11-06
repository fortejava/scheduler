// ====================================
// UTILITY FUNCTIONS
// ====================================

/**
 * Check if a value is a non-empty string
 * @param {*} s - Value to check
 * @returns {boolean} True if non-empty string
 */
const notEmptyString = (s) => {
    return s != null && typeof s === 'string' && s.trim() !== "";
};

/**
 * Check if a value is a non-empty array
 * @param {*} arr - Value to check
 * @returns {boolean} True if non-empty array
 */
const notEmptyArray = (arr) => {
    return arr && Array.isArray(arr) && arr.length > 0;
};

/**
 * Format date string to DD/MM/YYYY
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
};

/**
 * Parse date from DD/MM/YYYY to Date object
 * @param {string} dateString - Date in DD/MM/YYYY format
 * @returns {Date|null} Date object or null if invalid
 */
const parseFormattedDate = (dateString) => {
    if (!notEmptyString(dateString)) return null;
    
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    
    return new Date(year, month, day);
};

/**
 * Get ISO date string (YYYY-MM-DD) from date
 * @param {Date} date - Date object
 * @returns {string} ISO date string
 */
const toISODate = (date) => {
    if (!(date instanceof Date)) return '';
    return date.toISOString().split('T')[0];
};

/**
 * Safely parse JSON with error handling
 * @param {string} jsonString - JSON string to parse
 * @returns {Object|null} Parsed object or null if invalid
 */
const safeJSONParse = (jsonString) => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('JSON Parse Error:', error);
        return null;
    }
};

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
};

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
const generateUniqueId = () => {
    // Modern browsers support crypto.randomUUID()
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // Fallback for older browsers
    return `id_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Get current date/time information
 * @returns {Object} Current date information
 */
const getCurrentDateInfo = () => {
    const now = new Date();
    return {
        date: now,
        year: now.getFullYear(),
        month: now.getMonth(), // 0-indexed
        day: now.getDate(),
        isoDate: toISODate(now)
    };
};

/**
 * Compare two dates (ignoring time)
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
const compareDates = (date1, date2) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    
    if (d1 < d2) return -1;
    if (d1 > d2) return 1;
    return 0;
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
const isDateInPast = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dateObj < today;
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: '€')
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = '€') => {
    return `${amount.toFixed(2)} ${currency}`;
};

/**
 * Calculate percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number} Percentage (0-100)
 */
const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return (value / total) * 100;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Extract query parameters from URL
 * @param {string} url - URL string
 * @returns {Object} Query parameters as key-value pairs
 */
const getQueryParams = (url = window.location.href) => {
    const params = {};
    const queryString = url.split('?')[1];
    
    if (queryString) {
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
    }
    
    return params;
};

// Export utilities for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        notEmptyString,
        notEmptyArray,
        formatDate,
        parseFormattedDate,
        toISODate,
        safeJSONParse,
        debounce,
        escapeHtml,
        generateUniqueId,
        deepClone,
        getCurrentDateInfo,
        compareDates,
        isDateInPast,
        formatCurrency,
        calculatePercentage,
        isValidEmail,
        getQueryParams
    };
}
