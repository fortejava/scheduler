// ====================================
// CUSTOMER MANAGEMENT MODULE
// ====================================

/**
 * Customer Manager
 * Handles customer CRUD operations, search, and UI rendering
 */
const Customers = {
    // State management
    state: {
        allCustomers: []
    },

    // Form submission protection (prevents double-submit)
    _isSubmittingAdd: false,

    /**
     * Initialize customer list view
     */
    showList: function() {
        UI.showLoading();
        
        CustomerAPI.getAll(
            (response) => this._handleCustomerListResponse(response),
            (error) => this._handleCustomerListError(error)
        );

        UI.showView(VIEWS.CUSTOMERS);
    },

    /**
     * Handle customer list API response
     * @private
     */
    _handleCustomerListResponse: function(response) {
        ApiClient.handleResponse(response, {
            onOk: (data) => {
                this.state.allCustomers = data;
                this.renderList(data);
                UI.hideLoading();
            },
            onKo: (message) => {
                console.error('Failed to load customers:', message);
                UI.hideLoading();
                UI.showPopup('Errore', 'Impossibile caricare i clienti', { type: 'error' });
            }
        });
    },

    /**
     * Handle customer list error
     * @private
     */
    _handleCustomerListError: function(error) {
        console.error('Customer list error:', error);
        UI.hideLoading();
        UI.showPopup('Errore di Connessione', 'Impossibile caricare i clienti', { type: 'error' });
    },

    /**
     * Render customer list
     * @param {Array} customers - Array of customer objects
     */
    renderList: function(customers) {
        const container = document.getElementById('customers-list-container');
        if (!container) return;

        if (!notEmptyArray(customers)) {
            container.innerHTML = '<p class="text-muted text-center">Nessun cliente presente.</p>';
            return;
        }

        let html = this._buildListHeader();
        
        customers.forEach((customer, index) => {
            html += this._buildCustomerItem(customer, index + 1);
        });

        container.innerHTML = html;
    },

    /**
     * Build list header
     * @private
     */
    _buildListHeader: function() {
        return `
            <div class="row mb-2 px-3">
                <div class="col-8">
                    <label class="form-label text-muted small fw-bold">NOME CLIENTE</label>
                </div>
                <div class="col-4 text-end">
                    <label class="form-label text-muted small fw-bold">AZIONI</label>
                </div>
            </div>`;
    },

    /**
     * Build single customer item
     * @private
     */
    _buildCustomerItem: function(customer, index) {
        return `
            <div class="customer-item mb-3 p-3 border rounded bg-white shadow-sm" 
                 id="customer-${index}" 
                 data-customer-name="${escapeHtml(customer.CustomerName)}">
                <div class="row align-items-center">
                    <div class="col-8">
                        <input 
                            readonly 
                            class="form-control-plaintext customer-name-input" 
                            id="customer-input-${index}" 
                            data-customer-id="${customer.CustomerID}" 
                            data-customer-name="${escapeHtml(customer.CustomerName)}" 
                            value="${escapeHtml(customer.CustomerName)}"
                        />
                    </div>
                    <div class="col-4 text-end">
                        <!-- View mode buttons -->
                        <button class="btn btn-sm btn-outline-primary me-2 edit-button" 
                                onclick="Customers.edit(${index})" 
                                id="customer-edit-button-${index}" 
                                title="Modifica">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-button" 
                                onclick="Customers.confirmDelete(${index})" 
                                id="customer-delete-button-${index}" 
                                title="Elimina">
                            <i class="bi bi-trash"></i>
                        </button>
                        
                        <!-- Edit mode buttons (hidden by default) -->
                        <button class="btn btn-sm btn-success me-2 save-button hidden" 
                                onclick="Customers.save(${index})" 
                                id="customer-save-button-${index}" 
                                title="Salva">
                            <i class="bi bi-check-lg"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary cancel-button hidden" 
                                onclick="Customers.cancel(${index})" 
                                id="customer-cancel-button-${index}" 
                                title="Annulla">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
            </div>`;
    },

    /**
     * Filter customers by search term
     */
    search: function() {
        const searchInput = document.getElementById('customer-search');
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const customerItems = document.querySelectorAll('.customer-item');

        customerItems.forEach(item => {
            const customerName = item.getAttribute('data-customer-name');
            if (!customerName || customerName.toLowerCase().includes(query)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    },

    /**
     * Enter edit mode for customer
     * @param {number} index - Customer index in list
     */
    edit: function(index) {
        // Hide view buttons
        UI.addClass(`customer-edit-button-${index}`, 'hidden');
        UI.addClass(`customer-delete-button-${index}`, 'hidden');

        // Show edit buttons
        UI.removeClass(`customer-save-button-${index}`, 'hidden');
        UI.removeClass(`customer-cancel-button-${index}`, 'hidden');

        // Make input editable
        const input = document.getElementById(`customer-input-${index}`);
        if (input) {
            input.removeAttribute('readonly');
            input.classList.remove('form-control-plaintext');
            input.classList.add('form-control');
            input.focus();
        }
    },

    /**
     * Cancel edit mode for customer
     * @param {number} index - Customer index in list
     */
    cancel: function(index) {
        // Show view buttons
        UI.removeClass(`customer-edit-button-${index}`, 'hidden');
        UI.removeClass(`customer-delete-button-${index}`, 'hidden');

        // Hide edit buttons
        UI.addClass(`customer-save-button-${index}`, 'hidden');
        UI.addClass(`customer-cancel-button-${index}`, 'hidden');

        // Make input readonly and restore original value
        const input = document.getElementById(`customer-input-${index}`);
        if (input) {
            input.setAttribute('readonly', 'readonly');
            input.classList.remove('form-control');
            input.classList.add('form-control-plaintext');
            input.value = input.getAttribute('data-customer-name');
        }
    },

    /**
     * Save customer changes
     * @param {number} index - Customer index in list
     * @param {Event} event - Optional event object
     */
    save: function(index, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const input = document.getElementById(`customer-input-${index}`);
        if (!input) return;

        const customerId = input.getAttribute('data-customer-id');
        const customerName = input.value;
        const originalName = input.getAttribute('data-customer-name');

        // Validation
        if (!notEmptyString(customerName)) {
            UI.showPopup('Errore di Compilazione', 'Il nome del cliente non può essere vuoto', { type: 'warning' });
            return;
        }

        if (customerName === originalName) {
            UI.showPopup('Nessuna Modifica', 'Il nome del cliente non è stato modificato', { type: 'info' });
            return;
        }

        UI.showLoading();

        // Submit to API
        CustomerAPI.createOrUpdate(
            { CustomerID: customerId, CustomerName: customerName },
            (response) => this._handleSaveResponse(response, index, input, customerName),
            (error) => this._handleSaveError(error)
        );
    },

    /**
     * Handle save response
     * @private
     */
    _handleSaveResponse: function(response, index, input, customerName) {
        UI.hideLoading();

        ApiClient.handleResponse(response, {
            onOk: (data) => {
                UI.showPopup('Cliente Aggiornato', 'Il cliente è stato aggiornato correttamente', { type: 'success' });
                
                // Update data attribute
                input.setAttribute('data-customer-name', customerName);
                
                // Exit edit mode
                this._exitEditMode(index);
            },
            onKo: (message) => {
                UI.showPopup('Errore', message, { type: 'error' });
            }
        });
    },

    /**
     * Handle save error
     * @private
     */
    _handleSaveError: function(error) {
        UI.hideLoading();
        console.error('Customer save error:', error);
        UI.showPopup('Errore di Connessione', 'Impossibile aggiornare il cliente', { type: 'error' });
    },

    /**
     * Exit edit mode programmatically
     * @private
     */
    _exitEditMode: function(index) {
        // Show view buttons
        UI.removeClass(`customer-edit-button-${index}`, 'hidden');
        UI.removeClass(`customer-delete-button-${index}`, 'hidden');

        // Hide edit buttons
        UI.addClass(`customer-save-button-${index}`, 'hidden');
        UI.addClass(`customer-cancel-button-${index}`, 'hidden');

        // Make input readonly
        const input = document.getElementById(`customer-input-${index}`);
        if (input) {
            input.setAttribute('readonly', 'readonly');
            input.classList.remove('form-control');
            input.classList.add('form-control-plaintext');
        }
    },

    /**
     * Add new customer
     * @param {Event} event - Form submit event
     */
    add: function(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // GUARD: Prevent double submission
        if (this._isSubmittingAdd) {
            console.warn('Customer add already in progress, ignoring duplicate submit');
            return;
        }

        const customerNameInput = document.getElementById('addCustomerName');
        if (!customerNameInput) return;

        const customerName = customerNameInput.value;

        // Validation
        if (!notEmptyString(customerName)) {
            UI.showPopup('Errore di Compilazione', 'Il nome del cliente non può essere vuoto', { type: 'warning' });
            return;
        }

        // LOCK: Set submission flag
        this._isSubmittingAdd = true;

        // VISUAL FEEDBACK: Disable submit button
        const submitBtn = document.querySelector('#addCustomer button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Aggiunta in corso...';
        }

        UI.showLoading();

        // Submit to API
        CustomerAPI.createOrUpdate(
            { CustomerName: customerName },
            (response) => this._handleAddResponse(response, customerNameInput),
            (error) => this._handleAddError(error)
        );
    },

    /**
     * Handle add response
     * @private
     */
    _handleAddResponse: function(response, input) {
        UI.hideLoading();
        this._resetAddButton();

        ApiClient.handleResponse(response, {
            onOk: (data) => {
                // UNLOCK: Reset submission flag on success
                this._isSubmittingAdd = false;

                UI.showPopup('Cliente Aggiunto', 'Un nuovo cliente è stato aggiunto', { type: 'success' });

                // Clear input
                input.value = '';

                // Reload customer list
                this.showList();
            },
            onKo: (message) => {
                // UNLOCK: Reset submission flag on error
                this._isSubmittingAdd = false;

                UI.showPopup('Errore', message, { type: 'error' });
            }
        });
    },

    /**
     * Handle add error (network/server errors)
     * @private
     */
    _handleAddError: function(error) {
        UI.hideLoading();
        this._resetAddButton();

        // UNLOCK: Reset submission flag on network/server error
        this._isSubmittingAdd = false;

        console.error('Customer add error:', error);
        UI.showPopup('Errore di Connessione', 'Impossibile aggiungere il cliente', { type: 'error' });
    },

    /**
     * Reset add customer button to original state
     * Re-enables button and restores original text
     * @private
     */
    _resetAddButton: function() {
        const submitBtn = document.querySelector('#addCustomer button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Aggiungi';
        }
    },

    /**
     * Confirm and delete customer
     * @param {number} index - Customer index in list
     */
    confirmDelete: function(index) {
        UI.showConfirmation(
            'Conferma Eliminazione',
            'Sei sicuro di voler eliminare questo cliente? Questa azione non può essere annullata.',
            () => this.delete(index)
        );
    },

    /**
     * Delete customer (hard delete)
     * NOTE: Only succeeds if customer has NO invoices (active or soft-deleted)
     * @param {number} index - Customer index in list
     */
    delete: function(index) {
        const input = document.getElementById(`customer-input-${index}`);
        if (!input) return;

        const customerId = input.getAttribute('data-customer-id');

        CustomerAPI.delete(
            customerId,
            (response) => {
                // Success handler
                if (response.Code === 'Ok') {
                    UI.showPopup(
                        'Successo',
                        response.Message || 'Cliente eliminato correttamente',
                        {
                            type: 'success',
                            onClose: () => {
                                // Refresh the customer list
                                this.showList();
                            }
                        }
                    );
                } else {
                    // Backend returned Ko
                    let errorMsg = 'Impossibile eliminare il cliente';

                    // Handle error messages (can be array or string)
                    if (Array.isArray(response.Message)) {
                        errorMsg = response.Message.join('; ');
                    } else if (response.Message) {
                        errorMsg = response.Message;
                    }

                    UI.showPopup('Errore', errorMsg, { type: 'error' });
                }
            },
            (error) => {
                // Error handler (network/parsing errors)
                console.error('Delete customer error:', error);

                let errorMsg = 'Errore durante l\'eliminazione del cliente';
                if (error && error.message) {
                    errorMsg = error.message;
                }

                UI.showPopup('Errore', errorMsg, { type: 'error' });
            }
        );
    }
};

// Export Customers module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Customers };
}
