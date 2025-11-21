/**
 * AutocompleteCustomer - Reusable Customer Autocomplete Component
 *
 * Features:
 * - Event Delegation (optimized for 1000+ customers)
 * - Search/Filter with highlighting
 * - Clear/X button after selection
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Loading spinner for API calls
 * - Empty field click shows all
 * - Mobile responsive
 * - Accessible (ARIA attributes)
 *
 * Performance:
 * - 1 event listener (not N listeners per item)
 * - Debounced input (prevents excessive filtering)
 * - Zero memory leaks
 *
 * Usage:
 *
 *   const autocomplete = new AutocompleteCustomer({
 *       inputId: 'customer-search',
 *       dropdownId: 'customer-dropdown',
 *       clearButtonId: 'customer-clear',
 *       arrowId: 'customer-arrow',
 *       spinnerId: 'customer-spinner',
 *       hiddenInputId: 'CustomerID',  // Optional: for hidden ID field
 *
 *       onSelect: function(customer) {
 *           console.log('Selected:', customer);
 *       },
 *
 *       onClear: function() {
 *           console.log('Cleared');
 *       },
 *
 *       apiEndpoint: null,  // Optional: API URL for fetching customers
 *       minChars: 0,        // Min characters before search (0 = show all on click)
 *       debounceDelay: 300  // ms to wait before filtering
 *   });
 *
 *   autocomplete.init();
 *   autocomplete.setCustomers([...]);  // For static data
 *
 * @version 1.0.0
 * @date 2025-11-10
 */

class AutocompleteCustomer {

    /**
     * Constructor
     * @param {Object} config - Configuration object
     */
    constructor(config) {
        // Validate required config
        if (!config.inputId || !config.dropdownId) {
            throw new Error('AutocompleteCustomer: inputId and dropdownId are required');
        }

        this.config = {
            inputId: config.inputId,
            dropdownId: config.dropdownId,
            clearButtonId: config.clearButtonId || null,
            arrowId: config.arrowId || null,
            spinnerId: config.spinnerId || null,
            hiddenInputId: config.hiddenInputId || null,  // For storing CustomerID

            placeholder: config.placeholder || 'Digita per cercare...',

            onSelect: config.onSelect || function() {},
            onClear: config.onClear || function() {},

            apiEndpoint: config.apiEndpoint || null,
            minChars: config.minChars !== undefined ? config.minChars : 0,
            debounceDelay: config.debounceDelay || 300
        };

        // State
        this.customers = [];
        this.selectedCustomer = null;
        this.debounceTimer = null;

        // DOM references (will be set in init)
        this.input = null;
        this.dropdown = null;
        this.clearButton = null;
        this.arrow = null;
        this.spinner = null;
        this.hiddenInput = null;

        // Event handlers (store references for cleanup)
        this.dropdownClickHandler = null;
        this.inputHandler = null;
        this.clickHandler = null;
        this.focusHandler = null;
        this.keydownHandler = null;
        this.clearClickHandler = null;
        this.arrowClickHandler = null;
        this.documentClickHandler = null;
    }

    /**
     * Initialize autocomplete
     * Sets up DOM references and event listeners
     */
    init() {
        // Get DOM elements
        this.input = document.getElementById(this.config.inputId);
        this.dropdown = document.getElementById(this.config.dropdownId);

        if (!this.input || !this.dropdown) {
            console.error('AutocompleteCustomer: Required DOM elements not found');
            return;
        }

        // Optional elements
        if (this.config.clearButtonId) {
            this.clearButton = document.getElementById(this.config.clearButtonId);
        }
        if (this.config.arrowId) {
            this.arrow = document.getElementById(this.config.arrowId);
        }
        if (this.config.spinnerId) {
            this.spinner = document.getElementById(this.config.spinnerId);
        }
        if (this.config.hiddenInputId) {
            this.hiddenInput = document.getElementById(this.config.hiddenInputId);
        }

        // Set placeholder
        this.input.placeholder = this.config.placeholder;

        // Initialize Event Delegation
        this._setupEventDelegation();
    }

    /**
     * Set customer data (for static data, not API)
     * @param {Array} customers - Array of customer objects [{CustomerID, CustomerName}, ...]
     */
    setCustomers(customers) {
        if (!Array.isArray(customers)) {
            console.error('AutocompleteCustomer: setCustomers() expects an array');
            return;
        }

        this.customers = customers;
    }

    /**
     * Get currently selected customer
     * @returns {Object|null} Selected customer object or null
     */
    getSelectedCustomer() {
        return this.selectedCustomer;
    }

    /**
     * Get selected customer name (useful for filters)
     * @returns {string} Customer name or empty string
     */
    getSelectedCustomerName() {
        return this.selectedCustomer ? this.selectedCustomer.CustomerName : '';
    }

    /**
     * Set selected customer programmatically
     * @param {Object} customer - Customer object {CustomerID, CustomerName}
     */
    setSelectedCustomer(customer) {
        if (!customer || !customer.CustomerName) {
            console.error('AutocompleteCustomer: Invalid customer object');
            return;
        }

        this.selectedCustomer = customer;
        this.input.value = customer.CustomerName;

        // Update hidden field if exists
        if (this.hiddenInput && customer.CustomerID) {
            this.hiddenInput.value = customer.CustomerID;
        }

        this._updateClearButton();
    }

    /**
     * Clear selection programmatically
     */
    clearSelection() {
        this.input.value = '';
        this.selectedCustomer = null;

        if (this.hiddenInput) {
            this.hiddenInput.value = '';
        }

        this._hideDropdown();
        this._updateClearButton();

        // Trigger callback
        this.config.onClear();
    }

    /**
     * Destroy autocomplete (cleanup)
     * Removes all event listeners
     */
    destroy() {
        if (this.dropdown && this.dropdownClickHandler) {
            this.dropdown.removeEventListener('click', this.dropdownClickHandler);
        }
        if (this.input && this.inputHandler) {
            this.input.removeEventListener('input', this.inputHandler);
        }
        if (this.input && this.clickHandler) {
            this.input.removeEventListener('click', this.clickHandler);
        }
        if (this.input && this.focusHandler) {
            this.input.removeEventListener('focus', this.focusHandler);
        }
        if (this.input && this.keydownHandler) {
            this.input.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.clearButton && this.clearClickHandler) {
            this.clearButton.removeEventListener('click', this.clearClickHandler);
        }
        if (this.arrow && this.arrowClickHandler) {
            this.arrow.removeEventListener('click', this.arrowClickHandler);
        }
        if (this.documentClickHandler) {
            document.removeEventListener('click', this.documentClickHandler);
        }
    }

    // ========================================
    // PRIVATE METHODS
    // ========================================

    /**
     * Setup Event Delegation for dropdown items
     * This is the performance optimization - ONE listener for ALL items
     * @private
     */
    _setupEventDelegation() {
        // ========================================
        // DROPDOWN CLICK DELEGATION
        // ========================================
        this.dropdownClickHandler = (e) => {
            // Find the closest .autocomplete-item ancestor
            // This works even if user clicks on <mark> tag inside the item
            const item = e.target.closest('.autocomplete-item');

            // If click wasn't on an autocomplete item, ignore it
            if (!item) return;

            // Extract customer data from data attributes
            const customerName = item.getAttribute('data-value');
            const customerId = item.getAttribute('data-id');

            // Create customer object
            const customer = {
                CustomerID: customerId || null,
                CustomerName: customerName
            };

            // Update input and state
            this.input.value = customerName;
            this.selectedCustomer = customer;

            // Update hidden field if exists
            if (this.hiddenInput && customerId) {
                this.hiddenInput.value = customerId;
            }

            this._hideDropdown();
            this._updateClearButton();

            // Trigger callback
            this.config.onSelect(customer);
        };

        this.dropdown.addEventListener('click', this.dropdownClickHandler);

        // ========================================
        // INPUT CHANGE (TYPING)
        // ========================================
        this.inputHandler = (e) => {
            const query = this.input.value.toLowerCase().trim();

            // Reset selection when user types
            this.selectedCustomer = null;
            this._updateClearButton();

            // Clear hidden field
            if (this.hiddenInput) {
                this.hiddenInput.value = '';
            }

            // If below minimum characters, hide dropdown
            if (query.length < this.config.minChars && this.config.minChars > 0) {
                this._hideDropdown();
                return;
            }

            // Debounce filtering
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                if (query === '' && this.config.minChars === 0) {
                    this._hideDropdown();
                } else {
                    this._filterAndShow(query);
                }
            }, this.config.debounceDelay);
        };

        this.input.addEventListener('input', this.inputHandler);

        // ========================================
        // CLEAR BUTTON CLICK
        // ========================================
        if (this.clearButton) {
            this.clearClickHandler = (e) => {
                e.stopPropagation();
                this.clearSelection();
                this.input.focus();
            };

            this.clearButton.addEventListener('click', this.clearClickHandler);
        }

        // ========================================
        // ARROW CLICK (SHOW ALL)
        // ========================================
        if (this.arrow) {
            this.arrowClickHandler = (e) => {
                e.stopPropagation();

                if (this.dropdown.classList.contains('hidden')) {
                    // Show all customers
                    this._showDropdown(this.customers, '');
                    this.input.focus();
                } else {
                    // Hide dropdown
                    this._hideDropdown();
                }
            };

            this.arrow.addEventListener('click', this.arrowClickHandler);
        }

        // ========================================
        // EMPTY FIELD CLICK (SHOW ALL)
        // ========================================
        this.clickHandler = (e) => {
            const query = this.input.value.toLowerCase().trim();

            // If input is empty and dropdown is hidden, show all customers
            if (query === '' && this.dropdown.classList.contains('hidden')) {
                this._showDropdown(this.customers, '');
            }
        };

        this.input.addEventListener('click', this.clickHandler);

        // ========================================
        // FOCUS (CLEAR IF NO SELECTION)
        // ========================================
        this.focusHandler = () => {
            if (!this.selectedCustomer) {
                this.input.value = '';
            }
        };

        this.input.addEventListener('focus', this.focusHandler);

        // ========================================
        // KEYBOARD NAVIGATION
        // ========================================
        this.keydownHandler = (e) => {
            const items = this.dropdown.querySelectorAll('.autocomplete-item');
            const activeItem = this.dropdown.querySelector('.autocomplete-item.active');
            let index = Array.from(items).indexOf(activeItem);

            if (e.key === 'ArrowDown') {
                e.preventDefault();

                // If dropdown hidden, show all
                if (this.dropdown.classList.contains('hidden')) {
                    this._showDropdown(this.customers, '');
                    return;
                }

                index = Math.min(index + 1, items.length - 1);
                items.forEach(item => item.classList.remove('active'));
                if (items[index]) items[index].classList.add('active');

            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                index = Math.max(index - 1, 0);
                items.forEach(item => item.classList.remove('active'));
                if (items[index]) items[index].classList.add('active');

            } else if (e.key === 'Enter' && activeItem) {
                e.preventDefault();
                activeItem.click();

            } else if (e.key === 'Escape') {
                this._hideDropdown();
            }
        };

        this.input.addEventListener('keydown', this.keydownHandler);

        // ========================================
        // CLICK OUTSIDE (CLOSE DROPDOWN)
        // ========================================
        this.documentClickHandler = (e) => {
            const wrapper = this.input.closest('.autocomplete-wrapper');

            if (wrapper && !wrapper.contains(e.target)) {
                this._hideDropdown();

                // If no valid selection was made, clear the input
                if (!this.selectedCustomer || this.input.value !== this.selectedCustomer.CustomerName) {
                    this.input.value = '';
                    this.selectedCustomer = null;

                    if (this.hiddenInput) {
                        this.hiddenInput.value = '';
                    }

                    this._updateClearButton();
                }
            }
        };

        document.addEventListener('click', this.documentClickHandler);
    }

    /**
     * Filter customers and show dropdown
     * @param {string} query - Search query
     * @private
     */
    _filterAndShow(query) {
        if (this.config.apiEndpoint) {
            // Use API
            this._fetchCustomers(query);
        } else {
            // Use static data
            const filtered = this._filterCustomers(query);
            this._showDropdown(filtered, query);
        }
    }

    /**
     * Filter customers (static data)
     * @param {string} query - Search query
     * @returns {Array} Filtered customers
     * @private
     */
    _filterCustomers(query) {
        if (!query) {
            return this.customers;
        }

        return this.customers.filter(customer =>
            customer.CustomerName.toLowerCase().includes(query)
        );
    }

    /**
     * Fetch customers from API
     * @param {string} query - Search query
     * @private
     */
    _fetchCustomers(query) {
        this._showLoading();

        const url = `${this.config.apiEndpoint}/search?query=${encodeURIComponent(query)}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(customers => {
                this._hideLoading();
                this._showDropdown(customers, query);
            })
            .catch(error => {
                this._hideLoading();
                console.error('AutocompleteCustomer API error:', error);
                this._showError('Errore di caricamento. Riprova.');
            });
    }

    /**
     * Build dropdown HTML
     * @param {Array} customers - Customers to display
     * @param {string} query - Search query (for highlighting)
     * @returns {string} HTML string
     * @private
     */
    _buildDropdownItems(customers, query = '') {
        if (customers.length === 0) {
            return '<div class="no-results">Nessun cliente trovato</div>';
        }

        let html = '';
        const usedIds = new Set(); // Track used IDs to prevent collisions

        customers.forEach((customer, index) => {
            // ========================================
            // STABLE ID GENERATION (not index-based!)
            // ========================================
            // Use CustomerID when available (Invoice Creation)
            // Use sanitized CustomerName when not (Invoice Filter)
            // Fallback to index only if collision detected
            let uniqueId;
            let validatedCustomerId = null;

            // SECURITY: Validate CustomerID if present
            if (customer.CustomerID) {
                const tempId = parseInt(customer.CustomerID, 10);
                if (Number.isInteger(tempId) && tempId > 0) {
                    validatedCustomerId = tempId;
                    // Use CustomerID for stable, unique IDs (Invoice Creation)
                    uniqueId = validatedCustomerId;
                } else {
                    safeLog('warn', customer.CustomerID, 'Invalid CustomerID, using fallback');
                    // Fall through to CustomerName-based ID
                }
            }

            if (!uniqueId) {
                // Use sanitized CustomerName (Invoice Filter)
                let baseName = customer.CustomerName
                    .replace(/[^a-zA-Z0-9]/g, '-')  // Replace special chars with dash
                    .toLowerCase()
                    .replace(/-+/g, '-')  // Replace multiple dashes with single
                    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes

                // Handle rare collision case (duplicate names)
                if (usedIds.has(baseName)) {
                    uniqueId = `${baseName}-${index}`;
                } else {
                    uniqueId = baseName;
                }
            }

            usedIds.add(uniqueId);
            const id = `${this.config.dropdownId}-option-${uniqueId}`;

            // Escape customer name FIRST (prevent XSS from database content)
            let displayName = escapeHtml(customer.CustomerName);

            // Highlight matching text (query also escaped for safety)
            if (query) {
                const escapedQuery = escapeHtml(query);
                // Escape regex special characters to prevent ReDoS attacks
                const safeQuery = escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${safeQuery})`, 'gi');
                displayName = displayName.replace(regex, '<mark>$1</mark>');
            }

            html += `<div class="autocomplete-item"
                          role="option"
                          id="${id}"
                          data-value="${escapeHtml(customer.CustomerName)}"
                          data-id="${validatedCustomerId || ''}">
                        ${displayName}
                     </div>`;
        });

        return html;
    }

    /**
     * Show dropdown with customers
     * @param {Array} customers - Customers to display
     * @param {string} query - Search query
     * @private
     */
    _showDropdown(customers, query) {
        this.dropdown.innerHTML = this._buildDropdownItems(customers, query);
        this.dropdown.classList.remove('hidden');

        // Update ARIA
        this.input.setAttribute('aria-expanded', 'true');
    }

    /**
     * Hide dropdown
     * @private
     */
    _hideDropdown() {
        this.dropdown.classList.add('hidden');

        // Update ARIA
        this.input.setAttribute('aria-expanded', 'false');
    }

    /**
     * Show loading spinner
     * @private
     */
    _showLoading() {
        if (this.spinner) {
            this.spinner.classList.add('visible');
        }
        if (this.arrow) {
            this.arrow.style.display = 'none';
        }
    }

    /**
     * Hide loading spinner
     * @private
     */
    _hideLoading() {
        if (this.spinner) {
            this.spinner.classList.remove('visible');
        }
        if (this.arrow) {
            this.arrow.style.display = 'block';
        }
    }

    /**
     * Show error message in dropdown
     * @param {string} message - Error message
     * @private
     */
    _showError(message) {
        this.dropdown.innerHTML = `
            <div class="autocomplete-error">
                <i class="bi bi-exclamation-triangle text-danger"></i>
                ${escapeHtml(message)}
            </div>
        `;
        this.dropdown.classList.remove('hidden');
    }

    /**
     * Update clear button visibility
     * @private
     */
    _updateClearButton() {
        if (!this.clearButton) return;

        if (this.selectedCustomer) {
            this.clearButton.classList.add('visible');
        } else {
            this.clearButton.classList.remove('visible');
        }
    }
}

// Make class globally available (for backwards compatibility)
window.AutocompleteCustomer = AutocompleteCustomer;

// ES6 Module Export (Commented out - only works with type="module")
// export { AutocompleteCustomer };
