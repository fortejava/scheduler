// ====================================
// AUTHENTICATION MODULE
// ====================================

/**
 * Authentication Manager
 * Handles user login, logout, session management, and autologin
 */
const Auth = {
    // Form submission protection (prevents double-submit)
    _isSubmittingLogin: false,

    /**
     * Perform login (manual or autologin)
     * @param {Object} credentials - Login credentials
     * @param {string} credentials.username - Username
     * @param {string} credentials.password - Password (for manual login)
     * @param {string} credentials.token - Token (for autologin)
     * @param {boolean} isAutologin - Whether this is an autologin attempt
     * @param {Event|null} event - Form event (for manual login)
     */
    login: function (credentials, isAutologin = false, event = null) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Show loading indicator for manual login
        if (!isAutologin) {
            UI.showLoading();
        }

        const { username, password = '', token = '' } = credentials;

        // Make login API call
        AuthAPI.login(
            username,
            password,
            token,
            (response) => this._handleLoginResponse(response, username, isAutologin),
            (error) => this._handleLoginError(error, isAutologin)
        );
    },

    /**
     * Handle successful login API response
     * @private
     * @param {Object} response - API response
     * @param {string} username - Username used for login
     * @param {boolean} isAutologin - Whether this is an autologin attempt
     */
    _handleLoginResponse: function (response, username, isAutologin) {
        if (!isAutologin) {
            UI.hideLoading();
            this._resetLoginButton();
        }

        ApiClient.handleResponse(response, {
            onOk: (data) => {
                // UNLOCK: Reset submission flag on success
                this._isSubmittingLogin = false;
                this._onLoginSuccess(data, username, isAutologin);
            },
            onKo: (message) => {
                // UNLOCK: Reset submission flag on error
                this._isSubmittingLogin = false;
                this._onLoginFailure(message, isAutologin);
            },
            onOut: (message) => {
                // UNLOCK: Reset submission flag on session expired
                this._isSubmittingLogin = false;
                this._onSessionExpired(message, isAutologin);
            },
            onDefault: (res) => {
                // UNLOCK: Reset submission flag on unknown response
                this._isSubmittingLogin = false;
                console.error('Unknown login response code:', res.Code);
                UI.showView(VIEWS.LOGIN);
            }
        });
    },

    /**
     * Handle login API error (network/server errors)
     * @private
     * @param {Object} error - Error object
     * @param {boolean} isAutologin - Whether this is an autologin attempt
     */
    _handleLoginError: function (error, isAutologin) {
        if (!isAutologin) {
            UI.hideLoading();
            this._resetLoginButton();
        }

        // UNLOCK: Reset submission flag on network/server error
        this._isSubmittingLogin = false;

        console.error('Login error:', error);
        UI.showView(VIEWS.LOGIN);

        if (!isAutologin) {
            UI.showPopup(
                'Errore di Connessione',
                'Si è verificato un errore durante il login. Riprova più tardi.',
                { type: 'error' }
            );
        }
    },

    /**
     * Handle successful login
     * @private
     * @param {Object} data - Login response data (Token, Username, Role)
     * @param {string} username - Username
     * @param {boolean} isAutologin - Whether this is an autologin attempt
     */
    _onLoginSuccess: function (data, username, isAutologin) {
        // Save credentials to localStorage
        if (!isAutologin && data.Token) {
            // Manual login: Save all credentials including role
            this.saveSession(username, data.Token, data.Role);
        } else if (isAutologin) {
            // Autologin: Token already stored, but update username and role
            // (in case user role changed or username needs refresh)
            const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
            this.saveSession(data.Username, storedToken, data.Role);
        }

        // Show authenticated UI
        UI.showMenu();

        // Show/hide menu items based on role
        const userManagementMenu = document.getElementById('nav-users-view');
        if (userManagementMenu) {
            if (data.Role && data.Role === 'Admin') {
                // Admin user - show User Management menu
                userManagementMenu.style.display = 'block';
            } else {
                // Non-admin user - hide User Management menu
                userManagementMenu.style.display = 'none';
            }
        }

        Calendar.show();
    },

    /**
     * Handle failed login
     * @private
     * @param {string} message - Error message from server
     * @param {boolean} isAutologin - Whether this is an autologin attempt
     */
    _onLoginFailure: function (message, isAutologin) {

        // Clear stored credentials
        this.clearSession();

        // Show login view
        UI.showView(VIEWS.LOGIN);

        // Show error message only for manual login
        if (!isAutologin) {
            UI.showPopup(
                'Login Fallito',
                'Nome utente o password non corretti',
                { type: 'error' }
            );
        }
    },

    /**
     * Handle expired session
     * @private
     * @param {string} message - Message from server
     * @param {boolean} isAutologin - Whether this is an autologin attempt
     */
    _onSessionExpired: function (message, isAutologin) {
        // Clear stored credentials
        this.clearSession();

        // Show login view
        UI.showView(VIEWS.LOGIN);

        // Show alert only for autologin attempts
        if (isAutologin) {
            UI.showPopup(
                'Sessione Scaduta',
                'La tua sessione è scaduta. Per favore, effettua nuovamente il login.',
                { type: 'warning' }
            );
        }
    },

    /**
     * Perform logout
     */
    logout: function () {
        // Clear session data
        this.clearSession();

        // Reset UI to guest state
        UI.hideMenu();
        UI.showView(VIEWS.LOGIN);

        // Show confirmation
        UI.showPopup(
            'Logout Effettuato',
            'Hai effettuato il logout con successo.',
            { type: 'success' }
        );
    },

    /**
     * Save session to localStorage
     * @param {string} username - Username
     * @param {string} token - Authentication token
     * @param {string} role - User role (Admin, User, Visitor)
     */
    saveSession: function (username, token, role) {
        localStorage.setItem(STORAGE_KEYS.USERNAME, username);
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.TOKEN_TIMESTAMP, Date.now().toString());
        localStorage.setItem(STORAGE_KEYS.ROLE, role);  // Store role for account display
    },

    /**
     * Clear session from localStorage
     */
    clearSession: function () {
        localStorage.removeItem(STORAGE_KEYS.USERNAME);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.TOKEN_TIMESTAMP);
        localStorage.removeItem(STORAGE_KEYS.ROLE);  // Clear role on logout
    },

    /**
     * Get stored session credentials
     * @returns {Object|null} Session object with username, token, and role, or null if not found
     */
    getStoredSession: function () {
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const role = localStorage.getItem(STORAGE_KEYS.ROLE);

        if (notEmptyString(username) && notEmptyString(token)) {
            return { username, token, role };
        }

        return null;
    },

    /**
     * Check if session is expired
     * @param {number} maxAgeHours - Maximum session age in hours (default: 24)
     * @returns {boolean} True if session is expired
     */
    isSessionExpired: function (maxAgeHours = 24) {
        const timestamp = localStorage.getItem(STORAGE_KEYS.TOKEN_TIMESTAMP);

        if (!timestamp) {
            return true;
        }

        const ageMs = Date.now() - parseInt(timestamp, 10);
        const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

        return ageMs > maxAgeMs;
    },

    /**
     * Attempt autologin on page load
     * @param {Function} onSuccess - Callback on successful autologin
     * @param {Function} onFailure - Callback on failed autologin
     */
    attemptAutologin: function (onSuccess = null, onFailure = null) {
        const session = this.getStoredSession();

        if (session && !this.isSessionExpired()) {
            this.login(
                {
                    username: session.username,
                    token: session.token
                },
                true, // isAutologin
                null  // no event
            );

            if (onSuccess) onSuccess();
        } else {
            UI.showView(VIEWS.LOGIN);

            if (onFailure) onFailure();
        }
    },

    /**
     * Handle manual login form submission
     * @param {Event} event - Form submit event
     */
    handleLoginFormSubmit: function (event) {
        // Prevent default form submission
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // GUARD: Prevent double submission
        if (this._isSubmittingLogin) {
            console.warn('Login already in progress, ignoring duplicate submit');
            return;
        }

        const form = document.forms.loginForm;
        const username = form.username.value;
        const password = form.password.value;

        // Basic validation
        if (!notEmptyString(username) || !notEmptyString(password)) {
            UI.showPopup(
                'Campi Mancanti',
                'Inserisci nome utente e password',
                { type: 'warning' }
            );
            return;
        }

        // LOCK: Set submission flag
        this._isSubmittingLogin = true;

        // VISUAL FEEDBACK: Disable submit button
        const submitBtn = document.getElementById('send-data');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.value = 'Accesso in corso...';
        }

        // Perform login
        this.login(
            { username, password },
            false, // not autologin
            event
        );
    },

    /**
     * Reset login button to original state
     * Re-enables button and restores original text
     * @private
     */
    _resetLoginButton: function() {
        const submitBtn = document.getElementById('send-data');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.value = 'Login';
        }
    }
};

// Export Auth module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Auth };
}


//// ====================================
//// AUTHENTICATION MODULE
//// ====================================

///**
// * Authentication Manager
// * Handles user login, logout, session management, and autologin
// */
//const Auth = {
//    /**
//     * Perform login (manual or autologin)
//     * @param {Object} credentials - Login credentials
//     * @param {string} credentials.username - Username
//     * @param {string} credentials.password - Password (for manual login)
//     * @param {string} credentials.token - Token (for autologin)
//     * @param {boolean} isAutologin - Whether this is an autologin attempt
//     * @param {Event|null} event - Form event (for manual login)
//     */
//    login: function(credentials, isAutologin = false, event = null) {
//        if (event) {
//            event.preventDefault();
//            event.stopPropagation();
//        }

//        // Show loading indicator for manual login
//        if (!isAutologin) {
//            UI.showLoading();
//        }

//        const { username, password = '', token = '' } = credentials;

//        // Make login API call
//        AuthAPI.login(
//            username,
//            password,
//            token,
//            (response) => this._handleLoginResponse(response, username, isAutologin),
//            (error) => this._handleLoginError(error, isAutologin)
//        );
//    },

//    /**
//     * Handle successful login API response
//     * @private
//     * @param {Object} response - API response
//     * @param {string} username - Username used for login
//     * @param {boolean} isAutologin - Whether this is an autologin attempt
//     */
//    _handleLoginResponse: function(response, username, isAutologin) {
//        if (!isAutologin) {
//            UI.hideLoading();
//        }

//        ApiClient.handleResponse(response, {
//            onOk: (data) => {
//                this._onLoginSuccess(data, username, isAutologin);
//            },
//            onKo: (message) => {
//                this._onLoginFailure(message, isAutologin);
//            },
//            onOut: (message) => {
//                this._onSessionExpired(message, isAutologin);
//            },
//            onDefault: (res) => {
//                console.error('Unknown login response code:', res.Code);
//                UI.showView(VIEWS.LOGIN);
//            }
//        });
//    },

//    /**
//     * Handle login API error
//     * @private
//     * @param {Object} error - Error object
//     * @param {boolean} isAutologin - Whether this is an autologin attempt
//     */
//    _handleLoginError: function(error, isAutologin) {
//        if (!isAutologin) {
//            UI.hideLoading();
//        }

//        console.error('Login error:', error);
//        UI.showView(VIEWS.LOGIN);
        
//        if (!isAutologin) {
//            UI.showPopup(
//                'Errore di Connessione',
//                'Si è verificato un errore durante il login. Riprova più tardi.',
//                { type: 'error' }
//            );
//        }
//    },

//    /**
//     * Handle successful login
//     * @private
//     * @param {Object} data - Login response data
//     * @param {string} username - Username
//     * @param {boolean} isAutologin - Whether this is an autologin attempt
//     */
//    _onLoginSuccess: function(data, username, isAutologin) {
//        console.log('Login successful');

//        // Save credentials to localStorage for autologin (only on manual login)
//        if (!isAutologin && data.Token) {
//            this.saveSession(username, data.Token);
//        }

//        // Show authenticated UI
//        UI.showMenu();
//        UI.showView(VIEWS.CALENDAR);

//        // Initialize calendar with current month/year
//        const { month, year } = getCurrentDateInfo();
//        Calendar.loadInvoices(month, year);
//    },

//    /**
//     * Handle failed login
//     * @private
//     * @param {string} message - Error message from server
//     * @param {boolean} isAutologin - Whether this is an autologin attempt
//     */
//    _onLoginFailure: function(message, isAutologin) {
//        console.log('Login failed:', message);

//        // Clear stored credentials
//        this.clearSession();

//        // Show login view
//        UI.showView(VIEWS.LOGIN);

//        // Show error message only for manual login
//        if (!isAutologin) {
//            UI.showPopup(
//                'Login Fallito',
//                'Nome utente o password non corretti',
//                { type: 'error' }
//            );
//        }
//    },

//    /**
//     * Handle expired session
//     * @private
//     * @param {string} message - Message from server
//     * @param {boolean} isAutologin - Whether this is an autologin attempt
//     */
//    _onSessionExpired: function(message, isAutologin) {
//        console.log('Session expired:', message);

//        // Clear stored credentials
//        this.clearSession();

//        // Show login view
//        UI.showView(VIEWS.LOGIN);

//        // Show alert only for autologin attempts
//        if (isAutologin) {
//            UI.showPopup(
//                'Sessione Scaduta',
//                'La tua sessione è scaduta. Per favore, effettua nuovamente il login.',
//                { type: 'warning' }
//            );
//        }
//    },

//    /**
//     * Perform logout
//     */
//    logout: function() {
//        // Clear session data
//        this.clearSession();

//        // Reset UI to guest state
//        UI.hideMenu();
//        UI.showView(VIEWS.LOGIN);

//        // Show confirmation
//        UI.showPopup(
//            'Logout Effettuato',
//            'Hai effettuato il logout con successo.',
//            { type: 'success' }
//        );
//    },

//    /**
//     * Save session to localStorage
//     * @param {string} username - Username
//     * @param {string} token - Authentication token
//     */
//    saveSession: function(username, token) {
//        localStorage.setItem(STORAGE_KEYS.USERNAME, username);
//        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
//        localStorage.setItem(STORAGE_KEYS.TOKEN_TIMESTAMP, Date.now().toString());
//    },

//    /**
//     * Clear session from localStorage
//     */
//    clearSession: function() {
//        localStorage.removeItem(STORAGE_KEYS.USERNAME);
//        localStorage.removeItem(STORAGE_KEYS.TOKEN);
//        localStorage.removeItem(STORAGE_KEYS.TOKEN_TIMESTAMP);
//    },

//    /**
//     * Get stored session credentials
//     * @returns {Object|null} Session object with username and token, or null if not found
//     */
//    getStoredSession: function() {
//        const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
//        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

//        if (notEmptyString(username) && notEmptyString(token)) {
//            return { username, token };
//        }

//        return null;
//    },

//    /**
//     * Check if session is expired
//     * @param {number} maxAgeHours - Maximum session age in hours (default: 24)
//     * @returns {boolean} True if session is expired
//     */
//    isSessionExpired: function(maxAgeHours = 24) {
//        const timestamp = localStorage.getItem(STORAGE_KEYS.TOKEN_TIMESTAMP);
        
//        if (!timestamp) {
//            return true;
//        }

//        const ageMs = Date.now() - parseInt(timestamp, 10);
//        const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

//        return ageMs > maxAgeMs;
//    },

//    /**
//     * Attempt autologin on page load
//     * @param {Function} onSuccess - Callback on successful autologin
//     * @param {Function} onFailure - Callback on failed autologin
//     */
//    attemptAutologin: function(onSuccess = null, onFailure = null) {
//        const session = this.getStoredSession();

//        if (session && !this.isSessionExpired()) {
//            console.log('Attempting autologin...');
            
//            this.login(
//                {
//                    username: session.username,
//                    token: session.token
//                },
//                true, // isAutologin
//                null  // no event
//            );

//            if (onSuccess) onSuccess();
//        } else {
//            console.log('No valid session found, showing login view');
//            UI.showView(VIEWS.LOGIN);
            
//            if (onFailure) onFailure();
//        }
//    },

//    /**
//     * Handle manual login form submission
//     * @param {Event} event - Form submit event
//     */
//    handleLoginFormSubmit: function(event) {
//        event.preventDefault();
//        event.stopPropagation();

//        const form = document.forms.loginForm;
//        const username = form.username.value;
//        const password = form.password.value;

//        // Basic validation
//        if (!notEmptyString(username) || !notEmptyString(password)) {
//            UI.showPopup(
//                'Campi Mancanti',
//                'Inserisci nome utente e password',
//                { type: 'warning' }
//            );
//            return;
//        }

//        // Perform login
//        this.login(
//            { username, password },
//            false, // not autologin
//            event
//        );
//    }
//};

// ES6 Module Export (Commented out - only works with type="module")
// export { Auth };
