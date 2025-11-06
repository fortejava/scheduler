// ====================================
// API REQUEST HANDLER
// ====================================

/**
 * Centralized XHR request handler
 * Provides a consistent interface for making AJAX requests
 */
const ApiClient = {
    /**
     * Make a generic XHR request
     * @param {Object} options - Request configuration
     * @param {string} options.url - Request URL
     * @param {string} options.method - HTTP method (GET, POST, etc.)
     * @param {FormData|null} options.data - Request data (FormData for POST)
     * @param {Function} options.onSuccess - Success callback (receives parsed response)
     * @param {Function} options.onError - Error callback (receives error info)
     * @param {boolean} options.parseJSON - Whether to parse response as JSON (default: true)
     * @returns {XMLHttpRequest} The XHR object for potential abortion
     */
    request: function(options) {
        const {
            url,
            method = 'POST',
            data = null,
            onSuccess = () => {},
            onError = () => {},
            parseJSON = true
        } = options;

        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    try {
                        const response = parseJSON ? JSON.parse(this.responseText) : this.responseText;
                        onSuccess(response, xhr);
                    } catch (error) {
                        console.error('Response parsing error:', error);
                        onError({
                            type: 'parse_error',
                            message: 'Errore nel parsing della risposta',
                            error: error,
                            responseText: this.responseText
                        }, xhr);
                    }
                } else {
                    console.error(`Request failed with status ${this.status}`);
                    onError({
                        type: 'http_error',
                        status: this.status,
                        message: `Errore HTTP: ${this.status}`,
                        responseText: this.responseText
                    }, xhr);
                }
            }
        };

        xhr.onerror = function() {
            console.error('Network error occurred');
            onError({
                type: 'network_error',
                message: 'Errore di rete durante la richiesta'
            }, xhr);
        };

        xhr.ontimeout = function() {
            console.error('Request timeout');
            onError({
                type: 'timeout',
                message: 'Timeout della richiesta'
            }, xhr);
        };

        xhr.open(method, url, true);
        xhr.send(data);

        return xhr;
    },

    /**
     * Make a GET request
     * @param {string} url - Request URL
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     * @returns {XMLHttpRequest} The XHR object
     */
    get: function(url, onSuccess, onError) {
        return this.request({
            url,
            method: 'GET',
            data: null,
            onSuccess,
            onError
        });
    },

    /**
     * Make a POST request with FormData
     * @param {string} url - Request URL
     * @param {FormData} formData - Form data to send
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     * @returns {XMLHttpRequest} The XHR object
     */
    post: function(url, formData, onSuccess, onError) {
        return this.request({
            url,
            method: 'POST',
            data: formData,
            onSuccess,
            onError
        });
    },

    /**
     * Handle standard API response with Code/Message structure
     * @param {Object} response - API response object
     * @param {Object} handlers - Handler functions for different response codes
     * @param {Function} handlers.onOk - Handler for 'Ok' response
     * @param {Function} handlers.onKo - Handler for 'Ko' response
     * @param {Function} handlers.onOut - Handler for 'OUT' response (session expired)
     * @param {Function} handlers.onDefault - Handler for unknown response codes
     */
    handleResponse: function(response, handlers = {}) {
        const {
            onOk = () => {},
            onKo = () => {},
            onOut = () => {},
            onDefault = () => {}
        } = handlers;

        switch (response.Code) {
            case RESPONSE_CODES.OK:
                onOk(response.Message);
                break;

            case RESPONSE_CODES.KO:
                onKo(response.Message);
                break;

            case RESPONSE_CODES.OUT:
                onOut(response.Message);
                break;

            default:
                console.error('Unknown response code:', response.Code);
                onDefault(response);
                break;
        }
    }
};

/**
 * Authentication API calls
 */
const AuthAPI = {
    /**
     * Perform login
     * @param {string} username - Username
     * @param {string} password - Password (optional for token login)
     * @param {string} token - Auth token (optional for token login)
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    login: function(username, password, token, onSuccess, onError) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password || '');
        formData.append('token', token || '');

        return ApiClient.post(API.auth.login, formData, onSuccess, onError);
    }
};

/**
 * Invoice API calls
 */
const InvoiceAPI = {
    /**
     * Get filtered invoices
     * @param {Object} filters - Filter parameters
     * @param {number} filters.year - Year filter
     * @param {number} filters.month - Month filter (optional)
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    getFiltered: function(filters = {}, onSuccess, onError) {
        const formData = new FormData();
        
        if (filters.year) {
            formData.append('Year', filters.year);
        }
        if (filters.month !== undefined) {
            formData.append('Month', filters.month);
        }

        return ApiClient.post(API.invoices.getFiltered, formData, onSuccess, onError);
    },

    /**
     * Get invoice by ID
     * @param {number} invoiceId - Invoice ID
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    getById: function(invoiceId, onSuccess, onError) {
        const formData = new FormData();
        formData.append('InvoiceID', invoiceId);

        return ApiClient.post(API.invoices.getByIdDTO, formData, onSuccess, onError);
    },

    /**
     * Create or update invoice
     * @param {Object} invoiceData - Invoice data object
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    createOrUpdate: function(invoiceData, onSuccess, onError) {
        const formData = new FormData();
        
        // Append all invoice fields to FormData
        Object.keys(invoiceData).forEach(key => {
            const value = invoiceData[key];
            formData.append(key, value !== null && value !== undefined ? value : '');
        });

        return ApiClient.post(API.invoices.createOrUpdate, formData, onSuccess, onError);
    },

    /**
     * Delete invoice (soft delete)
     * @param {number} invoiceId - Invoice ID
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    delete: function(invoiceId, onSuccess, onError) {
        const formData = new FormData();
        formData.append('InvoiceID', invoiceId);

        return ApiClient.post(API.invoices.delete, formData, onSuccess, onError);
    }
};

/**
 * Customer API calls
 */
const CustomerAPI = {
    /**
     * Get all customers
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    getAll: function(onSuccess, onError) {
        return ApiClient.get(API.customers.all, onSuccess, onError);
    },

    /**
     * Get customer by ID
     * @param {number} customerId - Customer ID
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    getById: function(customerId, onSuccess, onError) {
        const formData = new FormData();
        formData.append('CustomerID', customerId);

        return ApiClient.post(API.customers.byId, formData, onSuccess, onError);
    },

    /**
     * Create or update customer
     * @param {Object} customerData - Customer data
     * @param {number|null} customerData.CustomerID - Customer ID (null for new)
     * @param {string} customerData.CustomerName - Customer name
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    createOrUpdate: function(customerData, onSuccess, onError) {
        const formData = new FormData();
        
        if (customerData.CustomerID) {
            formData.append('CustomerID', customerData.CustomerID);
        }
        formData.append('CustomerName', customerData.CustomerName);

        return ApiClient.post(API.customers.createOrUpdate, formData, onSuccess, onError);
    },

    /**
     * Search customers by name
     * @param {string} searchTerm - Search term
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    search: function(searchTerm, onSuccess, onError) {
        const formData = new FormData();
        formData.append('searchTerm', searchTerm);

        return ApiClient.post(API.customers.search, formData, onSuccess, onError);
    },

    /**
     * Delete customer (hard delete)
     * NOTE: Only succeeds if customer has NO invoices (active or soft-deleted)
     * @param {number} customerId - Customer ID
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    delete: function(customerId, onSuccess, onError) {
        const formData = new FormData();
        formData.append('CustomerID', customerId);

        return ApiClient.post(API.customers.delete, formData, onSuccess, onError);
    }
};

/**
 * Status API calls
 */
const StatusAPI = {
    /**
     * Get all statuses
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    getAll: function(onSuccess, onError) {
        return ApiClient.get(API.statuses.all, onSuccess, onError);
    },

    /**
     * Get status by ID
     * @param {number} statusId - Status ID
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    getById: function(statusId, onSuccess, onError) {
        const formData = new FormData();
        formData.append('StatusID', statusId);

        return ApiClient.post(API.statuses.byId, formData, onSuccess, onError);
    }
};

// Export API modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ApiClient,
        AuthAPI,
        InvoiceAPI,
        CustomerAPI,
        StatusAPI
    };
}
