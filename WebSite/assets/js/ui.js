// ====================================
// UI HELPER FUNCTIONS
// ====================================

/**
 * UI Manager - Handles all UI-related operations
 */
const UI = {
    // Modal instance reuse (prevents backdrop stacking issues)
    _modalInstance: null,

    // Modal queue system (prevents modal overwrites)
    _modalQueue: [],
    _isShowingModal: false,

    /**
     * Show a specific view and hide all others
     * @param {string} viewId - ID of the view to show
     */
    showView: function(viewId) {
        // Hide all views
        const viewsList = document.querySelectorAll('.view');
        viewsList.forEach(el => {
            el.classList.add('view-hidden');
            el.classList.remove('view-visible');
        });

        // Show requested view
        const visibleElement = document.querySelector(`#${viewId}`);
        if (visibleElement) {
            visibleElement.classList.remove('view-hidden');
            visibleElement.classList.add('view-visible');

            // Update active menu item
            const menuItem = document.querySelector(`[data-viewport="${viewId}"]`);
            if (menuItem) {
                this.setActiveMenuItem(menuItem.id);
            }
        } else {
            console.error(`View with ID "${viewId}" not found`);
        }
    },

    /**
     * Show loading overlay
     */
    showLoading: function() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'block';
        }
    },

    /**
     * Hide loading overlay
     */
    hideLoading: function() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    },

    /**
     * Show popup/modal with title and message (queued)
     * Adds modal to queue and processes sequentially
     * @param {string} title - Popup title
     * @param {string} message - Popup message content
     * @param {Object} options - Additional options
     * @param {string} options.type - Popup type ('info', 'success', 'warning', 'error')
     * @param {Function} options.onClose - Callback when popup is closed
     */
    showPopup: function(title, message, options = {}) {
        // Add to queue
        this._modalQueue.push({ title, message, options });

        // Process queue
        this._processModalQueue();
    },

    /**
     * Show modal immediately (internal use only)
     * @private
     * @param {string} title - Popup title
     * @param {string} message - Popup message content
     * @param {Object} options - Additional options
     */
    _showModalNow: function(title, message, options = {}) {
        const { type = 'info', onClose = null } = options;

        // Update popup content
        const titleElement = document.getElementById('popup-label');
        const contentElement = document.getElementById('popup-content');

        if (titleElement) titleElement.innerText = title;
        if (contentElement) contentElement.innerText = message;

        // Add type-specific styling if needed
        const modalElement = document.getElementById('exampleModal');
        if (modalElement) {
            // Remove previous type classes
            modalElement.classList.remove('popup-info', 'popup-success', 'popup-warning', 'popup-error');
            // Add current type class
            modalElement.classList.add(`popup-${type}`);
        }

        // FIXED: Reuse single modal instance to prevent backdrop stacking
        if (!this._modalInstance) {
            this._modalInstance = new bootstrap.Modal(document.getElementById('exampleModal'));
        }
        this._modalInstance.show();

        // Attach close callback AND queue processor
        const modalEl = document.getElementById('exampleModal');
        const closeHandler = () => {
            // Call user's onClose callback if provided
            if (onClose) {
                onClose();
            }

            // Mark as not showing
            this._isShowingModal = false;

            // Remove this handler
            modalEl.removeEventListener('hidden.bs.modal', closeHandler);

            // Process next in queue (with small delay for smooth transition)
            setTimeout(() => this._processModalQueue(), 300);
        };
        modalEl.addEventListener('hidden.bs.modal', closeHandler);
    },

    /**
     * Show confirmation dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {Function} onConfirm - Callback when confirmed
     * @param {Function} onCancel - Callback when cancelled
     */
    showConfirmation: function(title, message, onConfirm, onCancel = null) {
        const confirmed = confirm(`${title}\n\n${message}`);
        if (confirmed && onConfirm) {
            onConfirm();
        } else if (!confirmed && onCancel) {
            onCancel();
        }
    },

    /**
     * Emergency cleanup for orphaned modal backdrops
     * Removes all modal backdrops and resets body state
     * Call this if modals are blocking the UI
     */
    cleanupModalBackdrops: function() {
        // Remove all modal backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
            backdrop.remove();
        });

        // Ensure body doesn't have modal-open class
        document.body.classList.remove('modal-open');

        // Reset body padding and overflow
        document.body.style.paddingRight = '';
        document.body.style.overflow = '';

        console.log(`Cleaned up ${backdrops.length} orphaned modal backdrop(s)`);
    },

    /**
     * Process modal queue - shows next modal in queue
     * @private
     */
    _processModalQueue: function() {
        // If queue is empty, mark as not showing and return
        if (this._modalQueue.length === 0) {
            this._isShowingModal = false;
            return;
        }

        // If already showing a modal, wait for it to finish
        if (this._isShowingModal) {
            return;
        }

        // Mark as showing
        this._isShowingModal = true;

        // Get next modal from queue
        const nextModal = this._modalQueue.shift();
        const { title, message, options } = nextModal;

        // Show the modal
        this._showModalNow(title, message, options);
    },

    /**
     * Show authenticated menu items
     */
    showMenu: function() {
        // Show all hidden menu items
        const menuItems = document.querySelectorAll('.guest-hidden');
        menuItems.forEach(el => {
            el.classList.remove('guest-hidden');
        });

        // Hide login menu item
        const loginItem = document.querySelector('#nav-login');
        if (loginItem) {
            loginItem.style.display = 'none';
        }
    },

    /**
     * Hide authenticated menu items (for guest/logout state)
     */
    hideMenu: function() {
        // Hide authenticated menu items
        const menuItems = document.querySelectorAll('.nav-item:not(.guest-hidden)');
        menuItems.forEach(el => {
            el.classList.add('guest-hidden');
        });

        // Show login menu item
        const loginItem = document.querySelector('#nav-login');
        if (loginItem) {
            loginItem.style.display = 'block';
        }
    },

    /**
     * Set active menu item by ID
     * @param {string} menuItemId - Menu item element ID
     */
    setActiveMenuItem: function(menuItemId) {
        // Remove 'active' class from all menu links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(el => {
            el.classList.remove('active');
        });

        // Add 'active' class to specified menu item
        if (notEmptyString(menuItemId)) {
            const parent = document.getElementById(menuItemId);
            if (parent) {
                const navLink = parent.querySelector('.nav-link');
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        }
    },

    /**
     * Enable/disable form elements
     * @param {string} formId - Form element ID
     * @param {boolean} enabled - Whether to enable (true) or disable (false)
     * @param {Array<string>} excludeIds - IDs of elements to exclude from enable/disable
     */
    setFormEnabled: function(formId, enabled, excludeIds = []) {
        const form = document.getElementById(formId);
        if (!form) {
            console.error(`Form with ID "${formId}" not found`);
            return;
        }

        const elements = form.querySelectorAll('input:not([type="hidden"]), select, textarea');
        elements.forEach(el => {
            if (!excludeIds.includes(el.id)) {
                el.disabled = !enabled;
            }
        });
    },

    /**
     * Clear form values
     * @param {string} formId - Form element ID
     * @param {Array<string>} excludeIds - IDs of fields to exclude from clearing
     */
    clearForm: function(formId, excludeIds = []) {
        const form = document.getElementById(formId);
        if (!form) {
            console.error(`Form with ID "${formId}" not found`);
            return;
        }

        const elements = form.querySelectorAll('input, select, textarea');
        elements.forEach(el => {
            if (!excludeIds.includes(el.id)) {
                if (el.type === 'checkbox' || el.type === 'radio') {
                    el.checked = false;
                } else if (el.tagName === 'SELECT') {
                    el.selectedIndex = 0;
                } else {
                    el.value = '';
                }
            }
        });
    },

    /**
     * Scroll element into view smoothly
     * @param {string|HTMLElement} element - Element or element ID
     * @param {string} block - Scroll alignment ('start', 'center', 'end')
     */
    scrollToElement: function(element, block = 'start') {
        const el = typeof element === 'string' 
            ? document.getElementById(element) || document.querySelector(element)
            : element;

        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block });
        }
    },

    /**
     * Show/hide element by ID
     * @param {string} elementId - Element ID
     * @param {boolean} visible - Whether to show (true) or hide (false)
     */
    setElementVisible: function(elementId, visible) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = visible ? 'block' : 'none';
        }
    },

    /**
     * Add CSS class to element
     * @param {string} elementId - Element ID
     * @param {string} className - CSS class name
     */
    addClass: function(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add(className);
        }
    },

    /**
     * Remove CSS class from element
     * @param {string} elementId - Element ID
     * @param {string} className - CSS class name
     */
    removeClass: function(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove(className);
        }
    },

    /**
     * Toggle CSS class on element
     * @param {string} elementId - Element ID
     * @param {string} className - CSS class name
     */
    toggleClass: function(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.toggle(className);
        }
    },

    /**
     * Update text content of element
     * @param {string} elementId - Element ID
     * @param {string} text - Text content
     */
    setText: function(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    },

    /**
     * Update HTML content of element
     * @param {string} elementId - Element ID
     * @param {string} html - HTML content
     */
    setHtml: function(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    },

    /**
     * Get form data as object
     * @param {string} formId - Form element ID
     * @returns {Object} Form data as key-value pairs
     */
    getFormData: function(formId) {
        const form = document.getElementById(formId);
        if (!form) {
            console.error(`Form with ID "${formId}" not found`);
            return {};
        }

        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    },

    /**
     * Set form data from object
     * @param {string} formId - Form element ID
     * @param {Object} data - Data object with key-value pairs
     */
    setFormData: function(formId, data) {
        const form = document.getElementById(formId);
        if (!form) {
            console.error(`Form with ID "${formId}" not found`);
            return;
        }

        Object.keys(data).forEach(key => {
            const element = form.elements[key];
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = !!data[key];
                } else if (element.type === 'radio') {
                    const radio = form.querySelector(`input[name="${key}"][value="${data[key]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    element.value = data[key];
                }
            }
        });
    }
};

// Export UI module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UI };
}
