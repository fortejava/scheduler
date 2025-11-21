// ====================================
// USER MANAGEMENT MODULE (ADMIN ONLY)
// ====================================

/**
 * User Manager
 * Handles user CRUD operations for admin users
 * Admin-only functionality: Create, Delete, Reset Password
 */
const Users = {
    // State management
    state: {
        allUsers: [],
        currentUser: null
    },

    /**
     * Initialize user management view
     */
    initialize: function() {
        this._wireEventHandlers();
        this.loadUsers();
        UI.showView(VIEWS.USERS);
    },

    /**
     * Wire up event handlers for buttons and modals
     * @private
     */
    _wireEventHandlers: function() {
        // Create user button
        const btnCreateUser = document.getElementById('btn-create-user');
        if (btnCreateUser) {
            btnCreateUser.addEventListener('click', () => this.showCreateUserModal());
        }

        // Save user button (in create modal)
        const btnSaveUser = document.getElementById('btn-save-user');
        if (btnSaveUser) {
            btnSaveUser.addEventListener('click', () => this.createUser());
        }

        // Confirm reset password button
        const btnConfirmReset = document.getElementById('btn-confirm-reset');
        if (btnConfirmReset) {
            btnConfirmReset.addEventListener('click', () => this.resetPassword());
        }

        // Event delegation for table row buttons
        this._setupTableButtonDelegation();

        // Form validation on password fields
        this._setupFormValidation();
    },

    /**
     * Setup event delegation for table buttons
     * @private
     */
    _setupTableButtonDelegation: function() {
        const tableBody = document.getElementById('users-table-body');
        if (!tableBody) return;

        // Remove existing handler if present
        if (this._tableButtonHandler) {
            tableBody.removeEventListener('click', this._tableButtonHandler);
        }

        this._tableButtonHandler = (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const row = e.target.closest('tr');
            if (!row) return;

            const userId = parseInt(row.dataset.userId);
            const username = row.dataset.username;

            if (button.classList.contains('btn-delete-user')) {
                this.confirmDeleteUser(userId, username);
            } else if (button.classList.contains('btn-reset-password')) {
                this.showResetPasswordModal(userId, username);
            }
        };

        tableBody.addEventListener('click', this._tableButtonHandler);
    },

    /**
     * Setup form validation
     * @private
     */
    _setupFormValidation: function() {
        // Password match validation for create user
        const password = document.getElementById('user-password');
        const confirmPassword = document.getElementById('user-confirm-password');

        if (password && confirmPassword) {
            confirmPassword.addEventListener('input', function() {
                if (this.value !== password.value) {
                    this.setCustomValidity('Le password non corrispondono');
                } else {
                    this.setCustomValidity('');
                }
            });

            password.addEventListener('input', function() {
                if (confirmPassword.value && confirmPassword.value !== this.value) {
                    confirmPassword.setCustomValidity('Le password non corrispondono');
                } else {
                    confirmPassword.setCustomValidity('');
                }
            });
        }
    },

    /**
     * Load all users from server
     */
    loadUsers: function() {
        UI.showLoading();

        UserAPI.getAll(
            (response) => {
                ApiClient.handleResponse(response, {
                    onOk: (data) => {
                        this.state.allUsers = data.Users || [];
                        this._renderUsersTable();
                        UI.hideLoading();
                    },
                    onKo: (message) => {
                        UI.hideLoading();
                        UI.showPopup('Errore', 'Errore durante il caricamento degli utenti: ' + message, { type: 'error' });
                    },
                    onOut: (message) => {
                        UI.hideLoading();
                        UI.showPopup('Non Autorizzato', 'Non autorizzato: ' + message, { type: 'error' });
                    }
                });
            },
            (error) => {
                UI.hideLoading();
                UI.showPopup('Errore di Connessione', 'Errore di rete durante il caricamento degli utenti', { type: 'error' });
                console.error('Error loading users:', error);
            }
        );
    },

    /**
     * Render users table
     * @private
     */
    _renderUsersTable: function() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) {
            console.error('Users table body not found');
            return;
        }

        if (this.state.allUsers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="bi bi-people"></i> Nessun utente trovato
                    </td>
                </tr>
            `;
            return;
        }

        const rows = this.state.allUsers.map(user => {
            // SECURITY: Validate UserID is a valid positive integer
            // Protects against XSS in HTML attributes (data-user-id) and table cell display
            const userId = parseInt(user.UserID, 10);
            if (!Number.isInteger(userId) || userId < 1) {
                InvoiceLogger.invalidUser(user.UserID);
                return ''; // Skip this corrupted user, continue with others
            }

            const roleBadgeClass = this._getRoleBadgeClass(user.RoleName);

            return `
                <tr data-user-id="${userId}" data-username="${this._escapeHtml(user.Username)}">
                    <td>${userId}</td>
                    <td><strong>${this._escapeHtml(user.Username)}</strong></td>
                    <td>
                        <span class="badge ${roleBadgeClass}">
                            <i class="bi ${this._getRoleIcon(user.RoleID)}"></i>
                            ${this._escapeHtml(user.RoleName)}
                        </span>
                    </td>
                    <td class="align-middle">
                        <button type="button" class="btn btn-outline-warning btn-reset-password" title="Reimposta Password">
                            <i class="bi bi-key-fill"></i>
                        </button>
                    </td>
                    <td class="align-middle">
                        <button type="button" class="btn btn-outline-danger btn-delete-user" title="Elimina Utente">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rows;
    },

    /**
     * Get badge class for role
     * Uses same custom color classes as UI.js (black, dark teal, dark gray)
     * @private
     */
    _getRoleBadgeClass: function(roleName) {
        // Admin: BLACK #000000, User: DARK TEAL #004d66, Visitor: DARK GRAY #4d5257
        switch(roleName) {
            case 'Admin': return 'role-admin';      // Black
            case 'User': return 'role-user';        // Dark Teal
            case 'Visitor': return 'role-visitor';  // Dark Gray
            default: return 'role-visitor';
        }
    },

    /**
     * Get icon for role
     * @private
     */
    _getRoleIcon: function(roleId) {
        switch(roleId) {
            case 1: return 'bi-shield-fill-check'; // Admin
            case 2: return 'bi-person-fill'; // User
            case 3: return 'bi-eye-fill'; // Visitor
            default: return 'bi-person';
        }
    },

    /**
     * Show create user modal
     */
    showCreateUserModal: function() {
        const modal = new bootstrap.Modal(document.getElementById('createUserModal'));

        // Reset form
        const form = document.getElementById('create-user-form');
        if (form) {
            form.reset();
        }

        modal.show();
    },

    /**
     * Create new user
     */
    createUser: function() {
        const form = document.getElementById('create-user-form');

        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const username = document.getElementById('user-username').value.trim();
        const password = document.getElementById('user-password').value;
        const confirmPassword = document.getElementById('user-confirm-password').value;
        const roleId = document.getElementById('user-role').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            UI.showPopup('Errore', 'Le password non corrispondono', { type: 'error' });
            return;
        }

        // Validate password length
        if (password.length < 8) {
            UI.showPopup('Errore', 'La password deve essere di almeno 8 caratteri', { type: 'error' });
            return;
        }

        // Validate role selected
        if (!roleId) {
            UI.showPopup('Errore', 'Seleziona un ruolo', { type: 'error' });
            return;
        }

        // Show loading
        const btnSave = document.getElementById('btn-save-user');
        const originalText = btnSave.innerHTML;
        btnSave.disabled = true;
        btnSave.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creazione...';

        UserAPI.create(username, password, roleId,
            (response) => {
                ApiClient.handleResponse(response, {
                    onOk: (data) => {
                        UI.showPopup('Successo', data.Message || 'Utente creato con successo', { type: 'success' });

                        // Close modal
                        const modal = bootstrap.Modal.getInstance(document.getElementById('createUserModal'));
                        modal.hide();

                        // Reload users
                        this.loadUsers();

                        // Highlight newly created user if UserID is available
                        if (data.UserID) {
                            // SECURITY: Validate UserID before using in querySelector
                            const newUserId = parseInt(data.UserID, 10);
                            if (Number.isInteger(newUserId) && newUserId > 0) {
                                setTimeout(() => {
                                    const userRow = document.querySelector(`[data-user-id="${newUserId}"]`);
                                if (userRow) {
                                    userRow.classList.add('user-row-highlight');
                                    setTimeout(() => {
                                        userRow.classList.remove('user-row-highlight');
                                    }, 3000);
                                }
                            }, 500);
                            }
                        }

                        // Reset button
                        btnSave.disabled = false;
                        btnSave.innerHTML = originalText;
                    },
                    onKo: (message) => {
                        UI.showPopup('Errore', 'Errore: ' + message, { type: 'error' });
                        btnSave.disabled = false;
                        btnSave.innerHTML = originalText;
                    },
                    onOut: (message) => {
                        UI.showPopup('Non Autorizzato', 'Non autorizzato: ' + message, { type: 'error' });
                        btnSave.disabled = false;
                        btnSave.innerHTML = originalText;
                    }
                });
            },
            (error) => {
                UI.showPopup('Errore di Connessione', 'Errore di rete durante la creazione dell\'utente', { type: 'error' });
                console.error('Error creating user:', error);
                btnSave.disabled = false;
                btnSave.innerHTML = originalText;
            }
        );
    },

    /**
     * Confirm delete user
     */
    confirmDeleteUser: function(userId, username) {
        if (confirm(`Sei sicuro di voler eliminare l'utente "${username}"?\n\nQuesta azione eliminerà anche tutte le sessioni associate e non può essere annullata.`)) {
            this.deleteUser(userId);
        }
    },

    /**
     * Delete user
     */
    deleteUser: function(userId) {
        UI.showLoading();

        UserAPI.delete(userId,
            (response) => {
                ApiClient.handleResponse(response, {
                    onOk: (data) => {
                        UI.showPopup('Successo', data.Message || 'Utente eliminato con successo', { type: 'success' });
                        this.loadUsers();
                    },
                    onKo: (message) => {
                        UI.hideLoading();
                        UI.showPopup('Errore', 'Errore: ' + message, { type: 'error' });
                    },
                    onOut: (message) => {
                        UI.hideLoading();
                        UI.showPopup('Non Autorizzato', 'Non autorizzato: ' + message, { type: 'error' });
                    }
                });
            },
            (error) => {
                UI.hideLoading();
                UI.showPopup('Errore di Connessione', 'Errore di rete durante l\'eliminazione dell\'utente', { type: 'error' });
                console.error('Error deleting user:', error);
            }
        );
    },

    /**
     * Show reset password modal
     */
    showResetPasswordModal: function(userId, username) {
        const modal = new bootstrap.Modal(document.getElementById('resetPasswordModal'));

        // Set user info
        document.getElementById('reset-username').textContent = username;
        document.getElementById('reset-user-id').value = userId;

        // Reset password field
        const passwordField = document.getElementById('new-password');
        if (passwordField) {
            passwordField.value = '';
        }

        modal.show();
    },

    /**
     * Reset user password
     */
    resetPassword: function() {
        const form = document.getElementById('reset-password-form');

        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const userId = document.getElementById('reset-user-id').value;
        const newPassword = document.getElementById('new-password').value;

        // Validate password length
        if (newPassword.length < 8) {
            UI.showPopup('Errore', 'La password deve essere di almeno 8 caratteri', { type: 'error' });
            return;
        }

        // Show loading
        const btnReset = document.getElementById('btn-confirm-reset');
        const originalText = btnReset.innerHTML;
        btnReset.disabled = true;
        btnReset.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Reimpostazione...';

        UserAPI.resetPassword(userId, newPassword,
            (response) => {
                ApiClient.handleResponse(response, {
                    onOk: (data) => {
                        UI.showPopup('Successo', data.Message || 'Password reimpostata con successo', { type: 'success' });

                        // Close modal
                        const modal = bootstrap.Modal.getInstance(document.getElementById('resetPasswordModal'));
                        modal.hide();

                        // Reset button
                        btnReset.disabled = false;
                        btnReset.innerHTML = originalText;
                    },
                    onKo: (message) => {
                        UI.showPopup('Errore', 'Errore: ' + message, { type: 'error' });
                        btnReset.disabled = false;
                        btnReset.innerHTML = originalText;
                    },
                    onOut: (message) => {
                        UI.showPopup('Non Autorizzato', 'Non autorizzato: ' + message, { type: 'error' });
                        btnReset.disabled = false;
                        btnReset.innerHTML = originalText;
                    }
                });
            },
            (error) => {
                UI.showPopup('Errore di Connessione', 'Errore di rete durante il ripristino della password', { type: 'error' });
                console.error('Error resetting password:', error);
                btnReset.disabled = false;
                btnReset.innerHTML = originalText;
            }
        );
    },

    /**
     * Escape HTML to prevent XSS
     * @private
     */
    _escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Export for global access (backwards compatibility)
window.Users = Users;

// ES6 Module Export (Commented out - only works with type="module")
// export { Users };
