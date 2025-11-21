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
        allCustomers: [],
        filteredCustomers: [], // Currently displayed customers (after search)
        currentPage: 1,
        itemsPerPage: PAGINATION.DEFAULT_ITEMS_PER_PAGE
    },

    // Form submission protection (prevents double-submit)
    _isSubmittingAdd: false,

    /**
     * Setup event delegation for customers row buttons
     * Handles clicks on dynamically generated buttons: view detail, delete
     * @private
     */
    _setupRowButtonDelegation: function () {
        const container = document.getElementById('customers-list-container');
        if (!container) return;

        // Check if we already have a listener attached
        if (this._rowButtonHandler) {
            container.removeEventListener('click', this._rowButtonHandler);
        }

        this._rowButtonHandler = (e) => {
            // Stop propagation for all button clicks
            const button = e.target.closest('button');
            if (button) {
                e.stopPropagation();
            }

            const row = e.target.closest('.customer-item');
            if (!row) return; // Not clicked on a row, ignore

            const customerId = parseInt(row.dataset.customerId);
            if (isNaN(customerId)) return; // Invalid customer ID, ignore

            // Determine action based on clicked button
            if (button) {
                if (button.classList.contains('edit-button')) {
                    Customers.edit(customerId);
                } else if (button.classList.contains('delete-button')) {
                    Customers.confirmDelete(customerId);
                } else if (button.classList.contains('save-button')) {
                    Customers.save(customerId);
                } else if (button.classList.contains('cancel-button')) {
                    Customers.cancel(customerId);
                }
            }
        };

        container.addEventListener('click', this._rowButtonHandler);
    },

    /**
     * Initialize customer list view
     */
    showList: function() {
        UI.showLoading();

        // Clear search box when reloading
        const searchInput = document.getElementById('customer-search');
        if (searchInput) {
            searchInput.value = '';
        }

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
                this.state.filteredCustomers = data; // Initially, filtered = all
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
    renderList: function (customers) {
        const container = document.getElementById('customers-list-container');
        if (!container) return;

        if (!notEmptyArray(customers)) {
            container.innerHTML = '<p class="text-muted text-center">Nessun cliente presente.</p>';
            return;
        }

        // Calculate pagination
        const totalPages = Math.ceil(customers.length / this.state.itemsPerPage);
        const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
        const endIndex = Math.min(startIndex + this.state.itemsPerPage, customers.length);
        const paginatedCustomers = customers.slice(startIndex, endIndex);

        // Build HTML
        let html = this._buildListHeader();

        paginatedCustomers.forEach((customer) => {
            html += this._buildCustomerItem(customer);
        });

        html += this._buildPaginationHTML(customers.length, totalPages);

        container.innerHTML = html;
        this._setupRowButtonDelegation();
    },

    /**
     * Build pagination HTML
     * @private
     */
    _buildPaginationHTML: function (totalItems, totalPages) {
        const startItem = (this.state.currentPage - 1) * this.state.itemsPerPage + 1;
        const endItem = Math.min(this.state.currentPage * this.state.itemsPerPage, totalItems);

        let html = `
            <div class="row mt-3 align-items-center">`;

        // CONDITIONAL: Only show counter and page navigation if multiple pages
        if (totalPages > 1) {
            html += `
                <div class="col-md-4">
                    <small class="text-muted fw-bold">
                        Mostrando ${startItem}-${endItem} di ${totalItems} clienti
                    </small>
                </div>
                <div class="col-md-4 text-center">
                    <nav aria-label="Navigazione pagine">
                        <ul class="pagination pagination-sm justify-content-center mb-0">`;

            // Previous button
            html += `
                            <li class="page-item ${this.state.currentPage === 1 ? 'disabled' : ''}">
                                <a class="page-link" href="#" onclick="Customers.changePage(${this.state.currentPage - 1}); return false;">
                                    <i class="bi bi-chevron-left"></i>
                                </a>
                            </li>`;

            // Page numbers
            html += this._buildPageNumbers(totalPages);

            // Next button
            html += `
                            <li class="page-item ${this.state.currentPage === totalPages ? 'disabled' : ''}">
                                <a class="page-link" href="#" onclick="Customers.changePage(${this.state.currentPage + 1}); return false;">
                                    <i class="bi bi-chevron-right"></i>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>`;
        }

        // ALWAYS SHOW: Items per page dropdown
        // Column class adapts: col-md-4 when with navigation, col-12 when alone
        html += `
                <div class="${totalPages > 1 ? 'col-md-4' : 'col-12'} text-end">
                    <select class="form-select form-select-sm d-inline-block" style="width: auto;"
                            onchange="Customers.changeItemsPerPage(this.value)">`;

        PAGINATION.ITEMS_PER_PAGE_OPTIONS.forEach(option => {
            html += `<option value="${option}" ${this.state.itemsPerPage === option ? 'selected' : ''}>${option} per pagina</option>`;
        });

        html += `
                    </select>
                </div>
            </div>`;

        return html;
    },

    /**
     * Build page numbers for pagination
     * @private
     * @param {number} totalPages - Total number of pages
     * @returns {string} HTML for page numbers
     */
    _buildPageNumbers: function(totalPages) {
        let html = '';
        const maxVisible = PAGINATION.MAX_VISIBLE_PAGES;
        let startPage = Math.max(1, this.state.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        // First page + ellipsis if needed
        if (startPage > 1) {
            html += `<li class="page-item"><a class="page-link" href="#" onclick="Customers.changePage(1); return false;">1</a></li>`;
            if (startPage > 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === this.state.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="Customers.changePage(${i}); return false;">${i}</a>
                </li>`;
        }

        // Ellipsis + last page if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            html += `<li class="page-item"><a class="page-link" href="#" onclick="Customers.changePage(${totalPages}); return false;">${totalPages}</a></li>`;
        }

        return html;
    },

    /**
     * Change to specific page
     * @param {number} page - Page number
     */
    changePage: function (page) {
        const customers = this.state.filteredCustomers;
        const totalPages = Math.ceil(customers.length / this.state.itemsPerPage);

        if (page < 1 || page > totalPages) return;

        this.state.currentPage = page;
        this.renderList(customers);
    },

    /**
     * Change items per page
     * @param {number} value - Items per page
     */
    changeItemsPerPage: function (value) {
        this.state.itemsPerPage = parseInt(value, 10);
        this.state.currentPage = 1;
        this.renderList(this.state.filteredCustomers);
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
    _buildCustomerItem: function (customer) {
        // SECURITY: Validate CustomerID is a valid positive integer
        // Protects against XSS in HTML attributes (id, data-customer-id)
        const customerId = parseInt(customer.CustomerID, 10);
        if (!Number.isInteger(customerId) || customerId < 1) {
            InvoiceLogger.invalidCustomer(customer.CustomerID);
            return ''; // Skip this corrupted customer, continue with others
        }

        const customerName = escapeHtml(customer.CustomerName);

        return `
          <div class="customer-item mb-3 p-3 border rounded bg-white shadow-sm"
               id="customer-${customerId}"
               data-customer-id="${customerId}"
               data-customer-name="${customerName}">
              <div class="row align-items-center">
                  <div class="col-8">
                      <input
                          readonly
                          class="form-control-plaintext customer-name-input"
                          id="customer-input-${customerId}"
                          data-customer-id="${customerId}"
                          data-customer-name="${customerName}"
                          value="${customerName}"
                      />
                  </div>
                  <div class="col-4 text-end">
                      <button class="btn btn-sm btn-outline-primary me-2 edit-button"
                              id="customer-edit-button-${customerId}"
                              title="Modifica">
                          <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger delete-button"
                              id="customer-delete-button-${customerId}"
                              title="Elimina">
                          <i class="bi bi-trash"></i>
                      </button>

                      <button class="btn btn-sm btn-success me-2 save-button hidden"
                              id="customer-save-button-${customerId}"
                              title="Salva">
                          <i class="bi bi-check-lg"></i>
                      </button>
                      <button class="btn btn-sm btn-secondary cancel-button hidden"
                              id="customer-cancel-button-${customerId}"
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
        this.state.currentPage = 1; // Reset to page 1 when searching

        const searchInput = document.getElementById('customer-search');
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        // Filter the customers array
        if (query === '') {
            // No search query - show all customers
            this.state.filteredCustomers = this.state.allCustomers;
        } else {
            // Filter customers by name
            this.state.filteredCustomers = this.state.allCustomers.filter(customer => {
                return customer.CustomerName.toLowerCase().includes(query);
            });
        }

        // Re-render with filtered data
        this.renderList(this.state.filteredCustomers);
    },

    /**
     * Enter edit mode for customer
     * @param {number} customerId - Customer ID in list
     */
    edit: function(customerId) {
        // Hide view buttons
        UI.addClass(`customer-edit-button-${customerId}`, 'hidden');
        UI.addClass(`customer-delete-button-${customerId}`, 'hidden');

        // Show edit buttons
        UI.removeClass(`customer-save-button-${customerId}`, 'hidden');
        UI.removeClass(`customer-cancel-button-${customerId}`, 'hidden');

        // Make input editable
        const input = document.getElementById(`customer-input-${customerId}`);
        if (input) {
            input.removeAttribute('readonly');
            input.classList.remove('form-control-plaintext');
            input.classList.add('form-control');
            input.focus();
        }
    },

    /**
     * Cancel edit mode for customer
     * @param {number} customerId - Customer ID in list
     */
    cancel: function (customerId) {
        // Show view buttons
        UI.removeClass(`customer-edit-button-${customerId}`, 'hidden');
        UI.removeClass(`customer-delete-button-${customerId}`, 'hidden');

        // Hide edit buttons
        UI.addClass(`customer-save-button-${customerId}`, 'hidden');
        UI.addClass(`customer-cancel-button-${customerId}`, 'hidden');

        // Make input readonly and restore original value
        const input = document.getElementById(`customer-input-${customerId}`);
        if (input) {
            input.setAttribute('readonly', 'readonly');
            input.classList.remove('form-control');
            input.classList.add('form-control-plaintext');
            input.value = input.getAttribute('data-customer-name');
        }
    },

    /**
     * Save customer changes
     * @param {number} customerId - Customer ID in list
     * @param {Event} event - Optional event object
     */
    save: function (customerId, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const input = document.getElementById(`customer-input-${customerId}`);
        if (!input) return;

        //const customerId2 = input.getAttribute('data-customer-id');
        const customerName = input.value;
        const originalName = input.getAttribute('data-customer-name');

        // Validation 1: Empty string
        if (!notEmptyString(customerName)) {
            UI.showPopup('Errore di Compilazione', 'Il nome del cliente non può essere vuoto', { type: 'warning' });
            return;
        }

        // Validation 2: HTML characters (XSS prevention - First Guardrail)
        // Frontend validation provides instant feedback before server round-trip
        // Backend also validates (second guardrail) if this is bypassed
        if (containsHtmlTags(customerName)) {
            UI.showPopup(
                'Caratteri Non Consentiti',
                'Il nome del cliente non può contenere caratteri HTML speciali: < > " \'',
                { type: 'error' }
            );
            return;
        }

        // Validation 3: No changes
        if (customerName === originalName) {
            UI.showPopup('Nessuna Modifica', 'Il nome del cliente non è stato modificato', { type: 'info' });
            return;
        }

        UI.showLoading();

        // Submit to API
        CustomerAPI.createOrUpdate(
            { CustomerID: customerId, CustomerName: customerName },
            (response) => this._handleSaveResponse(response, customerId, input, customerName),
            (error) => this._handleSaveError(error)
        );
    },

    /**
     * Handle save response
     * @private
     */
    _handleSaveResponse: function (response, customerId, input, customerName) {
        UI.hideLoading();

        ApiClient.handleResponse(response, {
            onOk: (data) => {
                UI.showPopup('Cliente Aggiornato', 'Il cliente è stato aggiornato correttamente', { type: 'success' });
                
                // Update data attribute
                input.setAttribute('data-customer-name', customerName);
                
                // Exit edit mode
                this._exitEditMode(customerId);
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
    _exitEditMode: function (customerId) {
        // Show view buttons
        UI.removeClass(`customer-edit-button-${customerId}`, 'hidden');
        UI.removeClass(`customer-delete-button-${customerId}`, 'hidden');

        // Hide edit buttons
        UI.addClass(`customer-save-button-${customerId}`, 'hidden');
        UI.addClass(`customer-cancel-button-${customerId}`, 'hidden');

        // Make input readonly
        const input = document.getElementById(`customer-input-${customerId}`);
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

        // Validation 1: Empty string
        if (!notEmptyString(customerName)) {
            UI.showPopup('Errore di Compilazione', 'Il nome del cliente non può essere vuoto', { type: 'warning' });
            return;
        }

        // Validation 2: HTML characters (XSS prevention - First Guardrail)
        // Frontend validation provides instant feedback before server round-trip
        // Backend also validates (second guardrail) if this is bypassed
        if (containsHtmlTags(customerName)) {
            UI.showPopup(
                'Caratteri Non Consentiti',
                'Il nome del cliente non può contenere caratteri HTML speciali: < > " \'',
                { type: 'error' }
            );
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
     * @param {number} customerId - Customer ID in list
     */
    confirmDelete: function (customerId) {
        UI.showConfirmation(
            'Conferma Eliminazione',
            'Sei sicuro di voler eliminare questo cliente? Questa azione non può essere annullata.',
            () => this.delete(customerId)
        );
    },

    /**
     * Delete customer (hard delete)
     * NOTE: Only succeeds if customer has NO invoices (active or soft-deleted)
     * @param {number} customerId - Customer ID in list
     */
    delete: function (customerId) {
        //const input = document.getElementById(`customer-input-${customerId}`);
        //if (!input) return;

        //const customerId2 = input.getAttribute('data-customer-id');

        CustomerAPI.delete(
            customerId,
            (response) => {
                // Success handler
                if (response.Code === 'Ok') {
                    // Extract message from response (handle both string and nested object)
                    const displayMessage = typeof response.Message === 'string'
                        ? response.Message
                        : (response.Message && response.Message.Message) || 'Cliente eliminato correttamente';

                    UI.showPopup(
                        'Successo',
                        displayMessage,
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
// ES6 Module Export (Commented out - only works with type="module")
// export { Customers };
