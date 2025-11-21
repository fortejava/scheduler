/**
 * Setup Wizard JavaScript
 * Handles first-time setup wizard for creating initial admin user
 *
 * This is a standalone script with no dependencies on main.js or api.js
 * It directly calls CompleteSetup.ashx to create the admin user
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeSetupWizard();
    });

    /**
     * Initialize the setup wizard
     */
    function initializeSetupWizard() {
        const form = document.getElementById('setup-form');
        const submitBtn = document.getElementById('submit-btn');

        // Handle form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Clear previous alerts
            clearAlerts();

            // Get form values
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Validate inputs
            if (!validateInputs(username, password, confirmPassword)) {
                return;
            }

            // Submit setup
            submitSetup(username, password, submitBtn);
        });

        // Real-time password match validation
        const confirmPasswordInput = document.getElementById('confirm-password');
        confirmPasswordInput.addEventListener('input', function() {
            const password = document.getElementById('password').value;
            const confirmPassword = this.value;

            if (confirmPassword.length > 0 && password !== confirmPassword) {
                this.setCustomValidity('Le password non corrispondono');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    /**
     * Validate form inputs
     * @param {string} username - Username
     * @param {string} password - Password
     * @param {string} confirmPassword - Confirm password
     * @returns {boolean} - True if valid
     */
    function validateInputs(username, password, confirmPassword) {
        // Username validation
        if (username.length < 3) {
            showAlert('danger', 'Il nome utente deve essere di almeno 3 caratteri');
            return false;
        }

        if (username.length > 100) {
            showAlert('danger', 'Il nome utente non può superare 100 caratteri');
            return false;
        }

        // Password validation
        if (password.length < 8) {
            showAlert('danger', 'La password deve essere di almeno 8 caratteri');
            return false;
        }

        // Password match validation
        if (password !== confirmPassword) {
            showAlert('danger', 'Le password non corrispondono');
            return false;
        }

        return true;
    }

    /**
     * Submit setup to backend
     * @param {string} username - Username
     * @param {string} password - Password
     * @param {HTMLElement} submitBtn - Submit button element
     */
    function submitSetup(username, password, submitBtn) {
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Configurazione in corso...';

        // Prepare form data
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        // Call CompleteSetup.ashx
        fetch('Services/Setup/CompleteSetup.ashx', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            handleResponse(data, submitBtn);
        })
        .catch(error => {
            console.error('Setup error:', error);
            showAlert('danger', 'Errore di rete durante la configurazione. Riprova.');
            resetSubmitButton(submitBtn);
        });
    }

    /**
     * Handle API response
     * @param {object} data - Response data
     * @param {HTMLElement} submitBtn - Submit button element
     */
    function handleResponse(data, submitBtn) {
        if (data.Status === 'OK') {
            // Success
            showAlert('success', data.Message || 'Configurazione completata con successo!');

            // Redirect to login page after 2 seconds
            setTimeout(function() {
                window.location.href = 'Index.html';
            }, 2000);

        } else if (data.Status === 'KO') {
            // Business error
            showAlert('danger', data.Message || 'Errore durante la configurazione');
            resetSubmitButton(submitBtn);

        } else if (data.Status === 'OUT') {
            // Should never happen for anonymous endpoint
            showAlert('warning', data.Message || 'Errore imprevisto');
            resetSubmitButton(submitBtn);

        } else {
            // Unknown status
            showAlert('danger', 'Risposta imprevista dal server');
            resetSubmitButton(submitBtn);
        }
    }

    /**
     * Reset submit button to original state
     * @param {HTMLElement} submitBtn - Submit button element
     */
    function resetSubmitButton(submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> Completa Configurazione';
    }

    /**
     * Show alert message
     * @param {string} type - Alert type (success, danger, warning, info)
     * @param {string} message - Alert message
     */
    function showAlert(type, message) {
        const alertContainer = document.getElementById('alert-container');

        const icon = type === 'success' ? 'check-circle-fill' :
                     type === 'danger' ? 'exclamation-triangle-fill' :
                     type === 'warning' ? 'exclamation-circle-fill' :
                     'info-circle-fill';

        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="bi bi-${icon} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        alertContainer.innerHTML = alertHTML;

        // Auto-dismiss after 5 seconds (except for success messages)
        if (type !== 'success') {
            setTimeout(function() {
                const alert = alertContainer.querySelector('.alert');
                if (alert) {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                }
            }, 5000);
        }
    }

    /**
     * Clear all alerts
     */
    function clearAlerts() {
        const alertContainer = document.getElementById('alert-container');
        alertContainer.innerHTML = '';
    }

})();
