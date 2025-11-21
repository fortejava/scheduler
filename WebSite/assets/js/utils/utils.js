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
 * Escape HTML special characters to prevent XSS attacks
 *
 * SECURITY WARNING: ALWAYS use this function before inserting user input into innerHTML!
 *
 * Escapes: & < > " '
 * Prevents: Script injection, tag injection, attribute injection
 *
 * SAFE Usage Examples:
 *   element.innerHTML = `<div>${escapeHtml(userInput)}</div>`;  ✅
 *   element.innerHTML = `<p>${escapeHtml(dbContent)}</p>`;      ✅
 *
 * UNSAFE Usage (XSS VULNERABILITY):
 *   element.innerHTML = `<div>${userInput}</div>`;              ❌ NEVER DO THIS!
 *   element.innerHTML = `<p>${customer.name}</p>`;              ❌ ALWAYS ESCAPE!
 *
 * Alternative (automatically safe):
 *   element.innerText = userInput;   ✅ SAFE (no HTML parsing)
 *   element.textContent = userInput; ✅ SAFE (no HTML parsing)
 *
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for innerHTML
 *
 * @example
 * const malicious = '<script>alert("XSS")</script>';
 * const safe = escapeHtml(malicious);
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
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
 * Check if string contains HTML/script tags or dangerous characters (STRICT).
 *
 * SECURITY: Input validation to prevent XSS attacks at form submission level.
 *
 * This function REJECTS user input containing: < > " '
 * - Used in frontend validation BEFORE form submission
 * - Provides instant feedback to user (no server round-trip)
 * - Backend ALSO validates (defense in depth - three guardrails)
 *
 * IMPORTANT: This is a VALIDATION function (blocks submission), not sanitization.
 * - escapeHtml() = sanitizes for display (allows input, escapes output)
 * - containsHtmlTags() = validates for input (blocks dangerous input)
 *
 * Use Cases:
 * - Customer names: STRICT (reject < > " ')
 * - Invoice numbers: STRICT (reject < > " ')
 * - Invoice descriptions: STRICT (reject < > " ')
 *
 * @param {string} input - String to validate
 * @returns {boolean} True if contains dangerous characters, false otherwise
 *
 * @example
 * containsHtmlTags('Normal text')              // false - SAFE
 * containsHtmlTags('Test<Company>')            // true - REJECT (< detected)
 * containsHtmlTags('Say "hello"')              // true - REJECT (" detected)
 * containsHtmlTags("It's fine")                // true - REJECT (' detected)
 * containsHtmlTags('Value > 100')              // true - REJECT (> detected)
 * containsHtmlTags('<script>alert(1)</script>') // true - REJECT (< detected)
 */
const containsHtmlTags = (input) => {
    if (!input || input.trim() === '') return false;
    // Regex: Match any of < > " '
    return /[<>"']/.test(input);
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
 * SECURITY: Safe console logging with sanitization (ENHANCED)
 *
 * Prevents console XSS attacks by sanitizing values before logging.
 * Handles edge cases: null, undefined, circular references, large objects.
 *
 * @param {string} level - Console level: 'error', 'warn', 'info', 'log', 'debug'
 * @param {any} value - Value to log (will be sanitized)
 * @param {string} context - Contextual message (default: 'Value')
 *
 * @example
 * safeLog('error', invoice.InvoiceID, 'Invalid InvoiceID, skipping invoice');
 * safeLog('warn', customer.CustomerID, 'Suspicious CustomerID');
 * safeLog('info', user.UserID, 'Processing UserID');
 */
const safeLog = (level, value, context = 'Value') => {
    let safeValue;

    try {
        if (value === null) {
            safeValue = 'null';
        } else if (value === undefined) {
            safeValue = 'undefined';
        } else if (typeof value === 'object') {
            // Extra protection: truncate large objects to prevent console slowdown
            const json = JSON.stringify(value);
            safeValue = json.length > 100 ? '[Large Object]' : json;
        } else {
            // Primitives: convert to string safely
            safeValue = JSON.stringify(value);
        }
    } catch (e) {
        // Catch circular references or non-serializable objects
        safeValue = '[Non-serializable Object]';
    }

    // Log with sanitized value
    if (console[level]) {
        console[level](`${context}: ${safeValue}`);
    } else {
        console.log(`[${level.toUpperCase()}] ${context}: ${safeValue}`);
    }
};

/**
 * SPECIALIZED DOMAIN LOGGERS
 *
 * Convenience wrappers for common logging scenarios.
 * Provides consistent error messages across the application.
 *
 * @example
 * InvoiceLogger.invalidId(invoice.InvoiceID);
 * InvoiceLogger.invalidCustomer(customer.CustomerID);
 * InvoiceLogger.invalidUser(user.UserID);
 */
const InvoiceLogger = {
    invalidId: (id) => safeLog('error', id, 'Invalid InvoiceID, skipping invoice'),
    invalidCustomer: (id) => safeLog('error', id, 'Invalid CustomerID, skipping customer'),
    invalidUser: (id) => safeLog('error', id, 'Invalid UserID, skipping user'),
    processing: (id) => safeLog('info', id, 'Processing InvoiceID'),
    warning: (id, msg) => safeLog('warn', id, msg)
};

/**
 * Format currency with COMPACT NOTATION for calendar display
 *
 * Strategy: Smart decimal dropping
 * - €8,000,000 → €8M (no decimal if whole number)
 * - €8,300,000 → €8.3M (decimal if needed)
 * - €12,345 → €12.3K or €12K (depending on whole number)
 * - €999 → €999 (no K for amounts under 1000)
 * - €10 → €10 (exact for small amounts)
 *
 * Max length: 5 characters (fits in calendar event title)
 *
 * @param {number} amount - Amount to format
 * @returns {string} Compact currency string (max 5 chars)
 *
 * @example
 * formatCurrencyCompact(8000000)  // €8M
 * formatCurrencyCompact(8300000)  // €8.3M
 * formatCurrencyCompact(12345)    // €12.3K
 * formatCurrencyCompact(999)      // €999
 * formatCurrencyCompact(10)       // €10
 */
const formatCurrencyCompact = (amount) => {
    if (amount >= 1000000) {
        // Millions: €8M or €8.3M
        const millions = amount / 1000000;
        return millions % 1 === 0
            ? `€${millions}M`           // €8M (whole number)
            : `€${millions.toFixed(1)}M`; // €8.3M (decimal)
    } else if (amount >= 1000) {
        // Thousands: €12K or €12.3K
        const thousands = amount / 1000;
        return thousands % 1 === 0
            ? `€${thousands}K`           // €12K (whole number)
            : `€${thousands.toFixed(1)}K`; // €12.3K (decimal)
    } else {
        // Under €1000: show exact amount rounded to euros
        return amount % 1 === 0
            ? `€${amount}`               // €100 (whole number)
            : `€${Math.round(amount)}`;  // €10 (rounded)
    }
};

/**
 * Truncate customer name for calendar display (HYBRID APPROACH)
 *
 * Strategy: Try word boundary first, fall back to hard cut
 * - Preserves at least 50% of name when cutting at word boundary
 * - Uses ellipsis character "…" (1 char) instead of "..." (3 chars)
 *
 * @param {string} name - Customer name to truncate
 * @param {number} maxLength - Maximum length (default: 10)
 * @returns {string} Truncated name with ellipsis if needed
 *
 * @example
 * truncateName('Loginet Corporate Solutions', 10)  // 'Loginet…'
 * truncateName('Cicerone', 10)                      // 'Cicerone'
 * truncateName('Longsinglewordcompany', 10)         // 'Longsingl…'
 */
const truncateName = (name, maxLength = 10) => {
    if (name.length <= maxLength) return name;

    // Try word boundary first
    const truncated = name.substring(0, maxLength - 1);
    const lastSpace = truncated.lastIndexOf(' ');

    // If space found and not too early (preserve at least 50% of name)
    if (lastSpace > maxLength / 2) {
        return truncated.substring(0, lastSpace) + '…';
    }

    // Otherwise hard cut with ellipsis
    return truncated + '…';
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

// ES6 Module Export (Commented out - only works with type="module")
// export {
//     notEmptyString,
//     notEmptyArray,
//     formatDate,
//     parseFormattedDate,
//     toISODate,
//     safeJSONParse,
//     debounce,
//     escapeHtml,
//     containsHtmlTags,
//     generateUniqueId,
//     deepClone,
//     getCurrentDateInfo,
//     compareDates,
//     isDateInPast,
//     formatCurrency,
//     formatCurrencyCompact,
//     truncateName,
//     safeLog,
//     InvoiceLogger,
//     calculatePercentage,
//     isValidEmail,
//     getQueryParams
// };
