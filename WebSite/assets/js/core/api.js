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

        // Automatically append authentication token to FormData (except for Login.ashx)
        if (data instanceof FormData && url.indexOf('Login.ashx') === -1) {
            const session = Auth.getStoredSession();

            if (session && session.token) {
                data.append('token', session.token);
            } else {
                console.warn('[ApiClient] ⚠️ No authentication token found. Request may fail if auth is required.');
            }
        } else if (!(data instanceof FormData) && url.indexOf('Login.ashx') === -1) {
            console.warn('[ApiClient] ⚠️ Cannot append token: data is not FormData');
        }

        xhr.open(method, url, true);
        xhr.send(data);

        return xhr;
    },

    /**
     * Make a POST request with FormData
     *
     * Supports two signatures:
     * 1. Object signature: post({url, data, onSuccess, onError})
     * 2. Individual parameters: post(url, formData, onSuccess, onError)
     *
     * @param {string|Object} url - Request URL OR options object
     * @param {FormData} formData - Form data to send (if using individual params)
     * @param {Function} onSuccess - Success callback (if using individual params)
     * @param {Function} onError - Error callback (if using individual params)
     * @returns {XMLHttpRequest} The XHR object
     */
    post: function(url, formData, onSuccess, onError) {
        // Detect signature type: object vs individual parameters
        if (typeof url === 'object' && url !== null && !url.append) {
            // Object signature: post({url, data, onSuccess, onError})
            const options = url;
            return this.request({
                url: options.url,
                method: 'POST',
                data: options.data || null,
                onSuccess: options.onSuccess || (() => {}),
                onError: options.onError || (() => {})
            });
        }

        // Individual parameters signature: post(url, formData, onSuccess, onError)
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
     * Get filtered ACTIVE invoices (InvoiceActive = "Y")
     * @param {Object} filters - Filter parameters
     * @param {number} filters.year - Year filter
     * @param {number} filters.month - Month filter (optional)
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    getFiltered: function(filters = {}, onSuccess, onError) {
        const formData = new FormData();

        // ========== CRITICAL: ALWAYS SEND InvoiceActive = "Y" ==========
        // This ensures we ALWAYS get active invoices (never deleted ones)
        formData.append('InvoiceActive', 'Y');

        if (filters.year) {
            formData.append('Year', filters.year);
        }
        if (filters.month !== undefined) {
            formData.append('Month', filters.month);
        }

        return ApiClient.post(API.invoices.getFiltered, formData, onSuccess, onError);
    },

    /**
     * Get DELETED invoices (InvoiceActive = "N")
     * Uses same endpoint as getFiltered but with InvoiceActive = "N"
     * @param {Object} filters - Filter parameters
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    getDeleted: function(filters = {}, onSuccess, onError) {
        const formData = new FormData();

        // ========== CRITICAL: ALWAYS SEND InvoiceActive = "N" ==========
        // This ensures we ALWAYS get deleted invoices (never active ones)
        formData.append('InvoiceActive', 'N');

        // Add optional filters (same as getFiltered)
        if (filters.year) formData.append('Year', filters.year);
        if (filters.month !== undefined) formData.append('Month', filters.month);
        if (filters.statusId) formData.append('StatusID', filters.statusId);
        if (filters.customerId) formData.append('CustomerID', filters.customerId);
        if (filters.invoiceNumber) formData.append('InvoiceNumber', filters.invoiceNumber);
        if (filters.invoiceOrderNumber) formData.append('InvoiceOrderNumber', filters.invoiceOrderNumber);

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
    },

    /**
     * Restore soft-deleted invoice (set InvoiceActive = "Y")
     * @param {number} invoiceId - Invoice ID
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    restore: function(invoiceId, onSuccess, onError) {
        const formData = new FormData();
        formData.append('InvoiceID', invoiceId);

        return ApiClient.post(API.invoices.restore, formData, onSuccess, onError);
    },

    /**
     * Permanently delete invoice (hard delete - irreversible)
     * @param {number} invoiceId - Invoice ID
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    hardDelete: function(invoiceId, onSuccess, onError) {
        const formData = new FormData();
        formData.append('InvoiceID', invoiceId);

        return ApiClient.post(API.invoices.hardDelete, formData, onSuccess, onError);
    },

    /**
     * Batch hard delete multiple invoices (permanent deletion)
     * @param {Array<number>} invoiceIds - Array of invoice IDs
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    batchHardDelete: function(invoiceIds, onSuccess, onError) {
        const formData = new FormData();
        // Convert array to comma-separated string
        formData.append('InvoiceIDs', invoiceIds.join(','));

        return ApiClient.post(API.invoices.batchHardDelete, formData, onSuccess, onError);
    },

    // ═══════════════════════════════════════════════════════════════════
    // EXPORT METHODS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Export invoices to CSV format (fully functional)
     * Downloads CSV file directly to browser
     * @param {Array<number>} invoiceIds - Array of invoice IDs to export
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    exportCSV: function(invoiceIds, onSuccess, onError) {
        const formData = new FormData();
        const session = Auth.getStoredSession();
        if (session && session.token) {
            formData.append('token', session.token);
        }
        formData.append('invoiceIds', invoiceIds.join(',')); // "1,2,3,4,5"

        // IMPORTANT: Use fetch API instead of ApiClient because response is binary file, not JSON
        fetch('Services/InvoiceHandlers/ExportInvoicesCSV.ashx', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                // CSV download successful - trigger file download
                return response.blob().then(blob => {
                    // Create download link
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `fatture_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.csv`;
                    document.body.appendChild(a);
                    a.click();

                    // Cleanup
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);

                    // Call success callback
                    if (onSuccess) {
                        onSuccess({ Code: 'Ok', Data: { count: invoiceIds.length } });
                    }
                });
            } else {
                // Server error
                throw new Error('Export failed');
            }
        })
        .catch(error => {
            console.error('CSV export error:', error);
            if (onError) {
                onError(error);
            }
        });
    },

    /**
     * Export invoices to Excel format (Phase 2 - shows info popup for now)
     * Currently returns ServiceException with "in sviluppo" message
     * @param {Array<number>} invoiceIds - Array of invoice IDs to export
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    exportExcel: function(invoiceIds, onSuccess, onError) {
        const formData = new FormData();
        formData.append('invoiceIds', invoiceIds.join(','));

        // Use ApiClient because response will be JSON error (not file)
        ApiClient.post(
            'Services/InvoiceHandlers/ExportInvoicesExcel.ashx',
            formData,
            onSuccess,
            onError
        );
    },

    /**
     * Export invoices to PDF format (Phase 3 - shows info popup for now)
     * Currently returns ServiceException with "in sviluppo" message
     * @param {Array<number>} invoiceIds - Array of invoice IDs to export
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    exportPDF: function(invoiceIds, onSuccess, onError) {
        const formData = new FormData();
        formData.append('invoiceIds', invoiceIds.join(','));

        // Use ApiClient because response will be JSON error (not file)
        ApiClient.post(
            'Services/InvoiceHandlers/ExportInvoicesPDF.ashx',
            formData,
            onSuccess,
            onError
        );
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
        const formData = new FormData();
        return ApiClient.post(API.customers.all, formData, onSuccess, onError);
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
        // Use CustomerName parameter (PascalCase standard)
        formData.append('CustomerName', searchTerm);

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
        const formData = new FormData();
        return ApiClient.post(API.statuses.all, formData, onSuccess, onError);
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

/**
 * User API
 * Handles all user management operations
 */
const UserAPI = {
    /**
     * Get all users
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    getAll: function(onSuccess, onError) {
        const formData = new FormData();
        return ApiClient.post(API.users.all, formData, onSuccess, onError);
    },

    /**
     * Create new user
     * @param {string} username - Username
     * @param {string} password - Password
     * @param {number} roleId - Role ID
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    create: function(username, password, roleId, onSuccess, onError) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('roleId', roleId);
        return ApiClient.post(API.users.create, formData, onSuccess, onError);
    },

    /**
     * Delete user
     * @param {number} userId - User ID to delete
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    delete: function(userId, onSuccess, onError) {
        const formData = new FormData();
        formData.append('userId', userId);
        return ApiClient.post(API.users.delete, formData, onSuccess, onError);
    },

    /**
     * Reset user password
     * @param {number} userId - User ID
     * @param {string} newPassword - New password
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    resetPassword: function(userId, newPassword, onSuccess, onError) {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('newPassword', newPassword);
        return ApiClient.post(API.users.resetPassword, formData, onSuccess, onError);
    }
};

// Export API modules
// ES6 Module Export (Commented out - only works with type="module")
// export {
//     ApiClient,
//     AuthAPI,
//     InvoiceAPI,
//     CustomerAPI,
//     StatusAPI,
//     UserAPI
// };
