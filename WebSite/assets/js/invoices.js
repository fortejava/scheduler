// ====================================
// INVOICE MANAGEMENT MODULE
// ====================================

/**
 * Invoice Manager
 * Handles all invoice-related operations: creation, editing, listing, filtering, sorting
 */
const Invoices = {
    // State management
    state: {
        allInvoices: [],
        currentPage: 1,
        itemsPerPage: PAGINATION.DEFAULT_ITEMS_PER_PAGE,
        sortColumn: null,
        sortDirection: 'asc',
        currentInvoiceDTO: null  // Stores current invoice for edit mode revert capability
    },

    // Form submission protection (prevents double-submit)
    _isSubmitting: false,

    /**
     * Setup event delegation for invoice row buttons
     * Handles clicks on dynamically generated buttons: view detail, delete
     * @private
     */
    _setupRowButtonDelegation: function () {
        const container = document.getElementById('invoices-list-container');
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

            // Find the invoice row
            const row = e.target.closest('tr[data-invoice-id]');
            if (!row) return;  // Not clicked on a row, ignore

            // Step 3: Get the invoice ID from the row's data attribute
            const invoiceId = parseInt(row.dataset.invoiceId);
            //NOTE: data-invoice-id becomes dataset.invoiceId (camelCase!)
            //row.dataset.invoiceId = reads data-invoice-id attribute

            // Step 4: Check which button was clicked
            if (button.classList.contains('invoice-detail-btn')) {
                this.showDetail(invoiceId);
            } else if (button.classList.contains('invoice-delete-btn')) {
                this.confirmDelete(invoiceId);
            }
        };

        // Step 5: Attach the event listener to the container
        container.addEventListener('click', this._rowButtonHandler);

    },

    /**
     * Initialize invoice list view
     */
    showList: function() {
        UI.showLoading();

        // OPTION 3 FIX: Fetch ALL invoices from ALL years (no year filter)
        // This allows year dropdown to show all available years
        // and enables "Tutti gli anni" and "Remove filters" to work correctly.
        // Default filters (current month/year) are applied after data loads
        // via _setDefaultFilters() + applyFilters() in the response handler.
        InvoiceAPI.getFiltered(
            {},  // Empty filters = fetch all invoices from all years
            (response) => this._handleInvoiceListResponse(response),
            (error) => this._handleInvoiceListError(error)
        );

        UI.showView(VIEWS.INVOICE_LIST);
    },

    /**
     * Handle invoice list API response
     * @private
     */
    _handleInvoiceListResponse: function(response) {
        ApiClient.handleResponse(response, {
            onOk: (data) => {
                this.state.allInvoices = data;
                this._populateFilters();
                this._setDefaultFilters();
                this.applyFilters();
                UI.hideLoading();
            },
            onKo: (message) => {
                console.error('Failed to load invoices:', message);
                UI.hideLoading();
                UI.showPopup('Errore', 'Impossibile caricare le fatture', { type: 'error' });
            }
        });
    },

    /**
     * Handle invoice list error
     * @private
     */
    _handleInvoiceListError: function(error) {
        console.error('Invoice list error:', error);
        UI.hideLoading();
        UI.showPopup('Errore di Connessione', 'Impossibile caricare le fatture', { type: 'error' });
    },

    /**
     * Reload invoice list while preserving filter state
     * Used after operations like delete to maintain user's filter context
     * @param {Object} savedFilters - Saved filter state to restore
     * @private
     */
    _reloadWithFilterPreservation: function(savedFilters) {
        UI.showLoading();

        InvoiceAPI.getFiltered(
            {},  // Fetch all invoices
            (response) => {
                ApiClient.handleResponse(response, {
                    onOk: (data) => {
                        this.state.allInvoices = data;
                        this._populateFilters();

                        // ✅ RESTORE SAVED FILTERS (instead of setting defaults)
                        this._restoreFilterState(savedFilters);

                        this.applyFilters();
                        UI.hideLoading();
                    },
                    onKo: (message) => {
                        console.error('Failed to reload invoices:', message);
                        UI.hideLoading();
                        UI.showPopup('Errore', 'Impossibile ricaricare le fatture', { type: 'error' });
                    }
                });
            },
            (error) => this._handleInvoiceListError(error)
        );
    },

    /**
     * Populate filter dropdowns
     * @private
     */
    _populateFilters: function() {
        this._populateYearFilter();
        this._populateCustomerFilter();
    },

    /**
     * Populate year filter
     * @private
     */
    _populateYearFilter: function() {
        const yearFilter = document.getElementById('year-filter');
        if (!yearFilter) return;

        const years = [...new Set(this.state.allInvoices.map(inv =>
            new Date(inv.Invoice.InvoiceDueDate).getFullYear()
        ))].sort((a, b) => b - a);

        let options = '<option value="">Tutti gli anni</option>';
        years.forEach(year => {
            options += `<option value="${year}">${year}</option>`;
        });

        yearFilter.innerHTML = options;
    },

    /**
     * Populate customer filter (now using autocomplete with ALL customers)
     * Loads ALL customers from API (not just those with invoices)
     * @private
     */
    _populateCustomerFilter: function() {
        // Load ALL customers via API (not just from invoices)
        CustomerAPI.getAll(
            (response) => {
                ApiClient.handleResponse(response, {
                    onOk: (customers) => {
                        // Initialize filter autocomplete
                        this._initCustomerFilterAutocomplete();

                        // Set ALL customers in filter
                        if (this.customerFilterAutocomplete) {
                            this.customerFilterAutocomplete.setCustomers(customers);
                            console.log(`Loaded ${customers.length} customers into filter (ALL customers, including those without invoices)`);
                        }
                    },
                    onError: (message) => {
                        console.error('Failed to load customers for filter:', message);
                    }
                });
            },
            (error) => {
                console.error('Failed to load customers (network error):', error);
            }
        );
    },

    /**
     * Set default filter values (current month/year)
     * @private
     */
    _setDefaultFilters: function() {
        const { month, year } = getCurrentDateInfo();

        const monthFilter = document.getElementById('month-filter');
        const yearFilter = document.getElementById('year-filter');

        if (monthFilter) monthFilter.value = month + 1; // +1 because month is 0-indexed
        if (yearFilter) yearFilter.value = year;
    },

    /**
     * Save current filter state (for preserving filters after operations like delete)
     * @returns {Object} Current filter values
     * @private
     */
    _saveFilterState: function() {
        return {
            search: document.getElementById('invoice-search')?.value || '',
            month: document.getElementById('month-filter')?.value || '',
            year: document.getElementById('year-filter')?.value || '',
            status: document.getElementById('status-filter')?.value || '',
            customerId: document.getElementById('customer-filter-id')?.value || '',
            customerName: document.getElementById('customer-filter-display')?.value || ''
        };
    },

    /**
     * Restore saved filter state (after operations like delete)
     * @param {Object} state - Saved filter state
     * @private
     */
    _restoreFilterState: function(state) {
        if (!state) return;

        // Restore simple filters
        const searchInput = document.getElementById('invoice-search');
        const monthFilter = document.getElementById('month-filter');
        const yearFilter = document.getElementById('year-filter');
        const statusFilter = document.getElementById('status-filter');

        if (searchInput) searchInput.value = state.search;
        if (monthFilter) monthFilter.value = state.month;
        if (yearFilter) yearFilter.value = state.year;
        if (statusFilter) statusFilter.value = state.status;

        // Restore customer filter (autocomplete)
        if (state.customerId && this.customerFilterAutocomplete) {
            const hiddenInput = document.getElementById('customer-filter-id');
            const displayInput = document.getElementById('customer-filter-display');

            if (hiddenInput) hiddenInput.value = state.customerId;
            if (displayInput) displayInput.value = state.customerName;

            // Show clear button if customer selected
            const clearButton = document.getElementById('customer-filter-clear');
            if (clearButton && state.customerId) {
                clearButton.classList.add('visible');
            }
        }

        console.log('Filters restored after deletion:', state);
    },

    /**
     * Get currently filtered invoice data
     * @returns {Array} Filtered invoices
     */
    getFilteredData: function() {
        const searchTerm = (document.getElementById('invoice-search')?.value || '').toLowerCase().trim();
        const monthFilter = document.getElementById('month-filter')?.value || '';
        const yearFilter = document.getElementById('year-filter')?.value || '';
        const statusFilter = document.getElementById('status-filter')?.value || '';

        // ✅ CHANGED: Get CustomerID from hidden field (autocomplete)
        const customerFilterId = document.getElementById('customer-filter-id')?.value || '';

        return this.state.allInvoices.filter(item => {
            const inv = item.Invoice;
            const dueDate = new Date(inv.InvoiceDueDate);

            // Search filter (independent from customer filter)
            const matchesSearch =
                inv.InvoiceNumber.toLowerCase().includes(searchTerm) ||
                inv.InvoiceOrderNumber.toLowerCase().includes(searchTerm) ||
                inv.Customer.CustomerName.toLowerCase().includes(searchTerm);

            // Date filters
            const matchesMonth = !monthFilter || (dueDate.getMonth() + 1) === parseInt(monthFilter);
            const matchesYear = !yearFilter || dueDate.getFullYear() === parseInt(yearFilter);

            // Other filters
            const matchesStatus = !statusFilter || item.StatusCode === statusFilter;

            // ✅ CHANGED: Compare by CustomerID (not CustomerName string)
            const matchesCustomer = !customerFilterId || inv.CustomerID === parseInt(customerFilterId);

            return matchesSearch && matchesMonth && matchesYear && matchesStatus && matchesCustomer;
        });
    },

    /**
     * Apply current filters and render table
     */
    applyFilters: function() {
        const filtered = this.getFilteredData();

        // Update results counter
        this._updateResultsCounter(filtered.length, this.state.allInvoices.length);

        // Reset to page 1
        this.state.currentPage = 1;

        // Render table
        this.renderTable(filtered);
    },

    /**
     * Clear all filters
     */
    clearFilters: function() {
        document.getElementById('invoice-search').value = '';
        document.getElementById('month-filter').value = '';
        document.getElementById('year-filter').value = '';
        document.getElementById('status-filter').value = '';

        // ✅ CHANGED: Clear customer filter autocomplete properly
        if (this.customerFilterAutocomplete) {
            this.customerFilterAutocomplete.clearSelection();
        } else {
            // Fallback: clear hidden field directly
            const hiddenInput = document.getElementById('customer-filter-id');
            if (hiddenInput) hiddenInput.value = '';
        }

        this.state.currentPage = 1;
        this.applyFilters();
    },

    /**
     * Update results counter display
     * @private
     */
    _updateResultsCounter: function(filtered, total) {
        const counter = document.getElementById('results-counter');
        if (counter) {
            counter.textContent = `Visualizzate ${filtered} di ${total} fatture`;
        }
    },

    /**
     * Render invoice table with pagination
     * @param {Array} invoices - Invoices to render
     */
    renderTable: function(invoices) {
        const container = document.getElementById('invoices-list-container');
        if (!container) return;

        if (!notEmptyArray(invoices)) {
            // ✅ ENHANCED: Show specific message for customer with no invoices
            const customerFilterId = document.getElementById('customer-filter-id')?.value || '';
            let noResultsMessage = 'Nessuna fattura trovata con i filtri selezionati.';

            // If customer filter is active, show customer-specific message
            if (customerFilterId && this.customerFilterAutocomplete) {
                const displayInput = document.getElementById('customer-filter-display');
                const customerName = displayInput?.value || 'questo cliente';
                noResultsMessage = `Nessuna fattura trovata per <strong>${customerName}</strong>.`;
            }

            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-inbox" style="font-size: 4rem; color: #ccc;"></i>
                    <p class="text-muted mt-3">${noResultsMessage}</p>
                </div>`;
            return;
        }

        // Calculate pagination
        const totalPages = Math.ceil(invoices.length / this.state.itemsPerPage);
        const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
        const endIndex = Math.min(startIndex + this.state.itemsPerPage, invoices.length);
        const paginatedInvoices = invoices.slice(startIndex, endIndex);

        // Build table HTML
        let html = this._buildTableHTML(paginatedInvoices, startIndex);

        // PAGINATION FIX: Always add pagination controls (dropdown always visible)
        // Page navigation only shown if totalPages > 1 (handled inside _buildPaginationHTML)
        html += this._buildPaginationHTML(invoices.length, totalPages);

        container.innerHTML = html;
        this._updateSortIcons();
        this._setupRowButtonDelegation();
    },

    /**
     * Build table HTML
     * @private
     */
    _buildTableHTML: function(invoices, startIndex) {
        let html = `
            <div class="table-responsive">
                <table class="table table-hover table-striped">
                    <thead class="table-dark sticky-top">
                        <tr>
                            <th scope="col" style="font-size: 0.9rem; font-weight: 600;">#</th>
                            <th scope="col" class="sortable" onclick="Invoices.sort('invoiceNumber')" style="font-size: 0.9rem; font-weight: 600;">
                                N° FATTURA <i class="bi bi-arrow-down-up"></i>
                            </th>
                            <th scope="col" class="sortable" onclick="Invoices.sort('orderNumber')" style="font-size: 0.9rem; font-weight: 600;">
                                N° ORDINE <i class="bi bi-arrow-down-up"></i>
                            </th>
                            <th scope="col" class="sortable" onclick="Invoices.sort('customer')" style="font-size: 0.9rem; font-weight: 600;">
                                CLIENTE <i class="bi bi-arrow-down-up"></i>
                            </th>
                            <th scope="col" class="sortable" onclick="Invoices.sort('creationDate')" style="font-size: 0.9rem; font-weight: 600;">
                                DATA IMMISSIONE <i class="bi bi-arrow-down-up"></i>
                            </th>
                            <th scope="col" class="sortable" onclick="Invoices.sort('dueDate')" style="font-size: 0.9rem; font-weight: 600;">
                                DATA SCADENZA <i class="bi bi-arrow-down-up"></i>
                            </th>
                            <th scope="col" class="sortable" onclick="Invoices.sort('status')" style="font-size: 0.9rem; font-weight: 600;">
                                STATO <i class="bi bi-arrow-down-up"></i>
                            </th>
                            <th scope="col" class="text-center" style="font-size: 0.9rem; font-weight: 600;">AZIONI</th>
                        </tr>
                    </thead>
                    <tbody>`;

        invoices.forEach((item, index) => {
            html += this._buildTableRow(item, startIndex + index + 1);
        });

        html += `
                    </tbody>
                </table>
            </div>`;

        return html;
    },

    /**
     * Build single table row
     * @private
     */
    _buildTableRow: function(item, rowNumber) {
        const inv = item.Invoice;
        const statusConfig = getStatusConfig(item.StatusCode);

        return `
            <tr class="invoice-row" data-invoice-id="${inv.InvoiceID}" style="cursor: pointer;">
                <th scope="row" class="align-middle">${rowNumber}</th>
                <td class="align-middle fw-bold">${escapeHtml(inv.InvoiceNumber)}</td>
                <td class="align-middle text-muted">${escapeHtml(inv.InvoiceOrderNumber)}</td>
                <td class="align-middle">${escapeHtml(inv.Customer.CustomerName)}</td>
                <td class="align-middle">${formatDate(inv.InvoiceCreationDate)}</td>
                <td class="align-middle">${formatDate(inv.InvoiceDueDate)}</td>
                <td class="align-middle">
                    <span class="badge bg-${statusConfig.badgeClass}">${statusConfig.label}</span>
                </td>
                <td class="align-middle text-center">
                    <button class="btn btn-sm btn-outline-primary me-1 invoice-detail-btn"  
                            title="Visualizza">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger invoice-delete-btn" 
                            title="Elimina">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
    },

    /**
     * Build pagination HTML
     * @private
     */
    _buildPaginationHTML: function(totalItems, totalPages) {
        const startItem = (this.state.currentPage - 1) * this.state.itemsPerPage + 1;
        const endItem = Math.min(this.state.currentPage * this.state.itemsPerPage, totalItems);

        let html = `
            <div class="row mt-3 align-items-center">`;

        // CONDITIONAL: Only show counter and page navigation if multiple pages
        if (totalPages > 1) {
            html += `
                <div class="col-md-4">
                    <small class="text-muted fw-bold">
                        Mostrando ${startItem}-${endItem} di ${totalItems} fatture
                    </small>
                </div>
                <div class="col-md-4 text-center">
                    <nav aria-label="Navigazione pagine">
                        <ul class="pagination pagination-sm justify-content-center mb-0">`;

            // Previous button
            html += `
                            <li class="page-item ${this.state.currentPage === 1 ? 'disabled' : ''}">
                                <a class="page-link" href="#" onclick="Invoices.changePage(${this.state.currentPage - 1}); return false;">
                                    <i class="bi bi-chevron-left"></i>
                                </a>
                            </li>`;

            // Page numbers
            html += this._buildPageNumbers(totalPages);

            // Next button
            html += `
                            <li class="page-item ${this.state.currentPage === totalPages ? 'disabled' : ''}">
                                <a class="page-link" href="#" onclick="Invoices.changePage(${this.state.currentPage + 1}); return false;">
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
                            onchange="Invoices.changeItemsPerPage(this.value)">`;

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
     */
    _buildPageNumbers: function(totalPages) {
        let html = '';
        const maxVisible = PAGINATION.MAX_VISIBLE_PAGES;
        let startPage = Math.max(1, this.state.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        // First page + ellipsis
        if (startPage > 1) {
            html += `<li class="page-item"><a class="page-link" href="#" onclick="Invoices.changePage(1); return false;">1</a></li>`;
            if (startPage > 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Visible range
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === this.state.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="Invoices.changePage(${i}); return false;">${i}</a>
                </li>`;
        }

        // Ellipsis + last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            html += `<li class="page-item"><a class="page-link" href="#" onclick="Invoices.changePage(${totalPages}); return false;">${totalPages}</a></li>`;
        }

        return html;
    },

    /**
     * Change to specific page
     * @param {number} page - Page number
     */
    changePage: function(page) {
        const filtered = this.getFilteredData();
        const totalPages = Math.ceil(filtered.length / this.state.itemsPerPage);

        if (page < 1 || page > totalPages) return;

        this.state.currentPage = page;
        this.renderTable(filtered);

        // Scroll to table top
        UI.scrollToElement('.table-responsive', 'start');
    },

    /**
     * Change items per page
     * @param {number} value - Items per page
     */
    changeItemsPerPage: function(value) {
        this.state.itemsPerPage = parseInt(value, 10);
        this.state.currentPage = 1;
        this.applyFilters();
    },

    /**
     * Sort table by column
     * @param {string} column - Column to sort by
     */
    sort: function(column) {
        // Toggle direction if same column
        if (this.state.sortColumn === column) {
            this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.state.sortColumn = column;
            this.state.sortDirection = 'asc';
        }

        const dataToSort = this.getFilteredData();
        const sorted = this._sortData(dataToSort, column, this.state.sortDirection);

        this.renderTable(sorted);
    },

    /**
     * Sort data array
     * @private
     */
    _sortData: function(data, column, direction) {
        return data.slice().sort((a, b) => {
            let valA, valB;

            switch (column) {
                case 'invoiceNumber':
                    valA = a.Invoice.InvoiceNumber;
                    valB = b.Invoice.InvoiceNumber;
                    break;
                case 'orderNumber':
                    valA = a.Invoice.InvoiceOrderNumber;
                    valB = b.Invoice.InvoiceOrderNumber;
                    break;
                case 'customer':
                    valA = a.Invoice.Customer.CustomerName;
                    valB = b.Invoice.Customer.CustomerName;
                    break;
                case 'creationDate':
                    valA = new Date(a.Invoice.InvoiceCreationDate);
                    valB = new Date(b.Invoice.InvoiceCreationDate);
                    break;
                case 'dueDate':
                    valA = new Date(a.Invoice.InvoiceDueDate);
                    valB = new Date(b.Invoice.InvoiceDueDate);
                    break;
                case 'status':
                    valA = parseInt(a.StatusCode);
                    valB = parseInt(b.StatusCode);
                    break;
            }

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    },

    /**
     * Update sort icons in table header
     * @private
     */
    _updateSortIcons: function() {
        // Remove all active sort indicators
        document.querySelectorAll('.sortable i').forEach(icon => {
            icon.className = 'bi bi-arrow-down-up';
        });

        // Add active indicator to current column
        const iconMap = {
            'invoiceNumber': 0,
            'orderNumber': 1,
            'customer': 2,
            'creationDate': 3,
            'dueDate': 4,
            'status': 5
        };

        const columnIndex = iconMap[this.state.sortColumn];
        if (columnIndex !== undefined) {
            const icon = document.querySelectorAll('.sortable i')[columnIndex];
            if (icon) {
                icon.className = this.state.sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
            }
        }
    },

    /**
     * Show invoice creation form
     */
    showCreate: function() {
        UI.showView(VIEWS.INVOICE_CREATION);
        this._prepareCreateForm();
    },

    /**
     * Prepare form for creating new invoice
     * @private
     */
    _prepareCreateForm: function() {
        document.getElementById('invoice-form-title').innerText = 'Aggiungi Nuova Fattura';
        document.getElementById('edit-mode-toggle').style.display = 'none';
        document.getElementById('invoice-submit-btn').innerHTML = '<i class="bi bi-check-circle"></i> Crea Fattura';

        // Clear form
        UI.clearForm('createInvoice');

        // Enable all fields
        UI.setFormEnabled('createInvoice', true, ['enableEditMode']);

        // Load dropdowns
        this._loadCustomersDropdown('CustomerID');
        this._loadStatusesDropdown('StatusID');

        // Show submit button
        UI.setElementVisible('invoice-submit-btn', true);

        // Hide detail navigation buttons (not needed in create mode)
        UI.setElementVisible('invoice-detail-actions', false);

        // CRITICAL: Remove status background color that may persist from detail view
        // Without this, StatusID select retains colored background from previous invoice
        const statusSelect = document.getElementById('StatusID');
        if (statusSelect) {
            statusSelect.style.backgroundColor = '';
            statusSelect.style.color = '';  // Reset text color to default
        }

        // Reset all select elements background and text colors (comprehensive cleanup)
        document.querySelectorAll('#createInvoice select').forEach(select => {
            select.style.backgroundColor = '';
            select.style.color = '';  // Reset text color to default
        });
    },

    /**
     * Show invoice detail
     * @param {number} invoiceId - Invoice ID
     */
    showDetail: function(invoiceId) {
        UI.showLoading();

        InvoiceAPI.getById(
            invoiceId,
            (response) => this._handleInvoiceDetailResponse(response),
            (error) => this._handleInvoiceDetailError(error)
        );
    },

    /**
     * Handle invoice detail response
     * @private
     */
    _handleInvoiceDetailResponse: function(response) {
        UI.hideLoading();

        ApiClient.handleResponse(response, {
            onOk: (data) => {
                this._fillDetailForm(data);
                UI.showView(VIEWS.INVOICE_CREATION);
            },
            onKo: (message) => {
                UI.showPopup('Errore', 'Impossibile caricare la fattura', { type: 'error' });
            }
        });
    },

    /**
     * Handle invoice detail error
     * @private
     */
    _handleInvoiceDetailError: function(error) {
        UI.hideLoading();
        console.error('Invoice detail error:', error);
        UI.showPopup('Errore di Connessione', 'Impossibile caricare la fattura', { type: 'error' });

        // Ensure detail buttons are hidden on error (prevent showing buttons without data)
        UI.setElementVisible('invoice-detail-actions', false);
    },

    /**
     * Convert tax value from database to display format (percentage)
     * Handles both decimal (0.22) and percentage (22) formats
     * @param {number} dbValue - Tax value from database
     * @returns {number} Tax value as percentage (22 for 22%)
     * @private
     */
    _convertTaxForDisplay: function(dbValue) {
        if (!dbValue || dbValue === 0) return 0;

        // If 0 < value <= 1 → decimal format (0.22, 1.00)
        if (dbValue > 0 && dbValue <= 1) {
            return dbValue * 100;  // 0.22 → 22, 1.00 → 100
        }

        // If 1 < value <= 100 → percentage format (22)
        if (dbValue > 1 && dbValue <= 100) {
            return dbValue;  // 22 → 22
        }

        // Unexpected value - return as-is and log warning
        console.warn(`Unexpected InvoiceTax value: ${dbValue}`);
        return dbValue;
    },

    /**
     * Fill form with invoice detail data
     * @private
     */
    _fillDetailForm: function(invoiceDTO) {
        const invoice = invoiceDTO.Invoice;

        // Store original invoice data for revert capability
        this.state.currentInvoiceDTO = invoiceDTO;

        // Set form title and controls
        document.getElementById('invoice-form-title').innerText = 'Dettaglio Fattura';
        document.getElementById('edit-mode-toggle').style.display = 'block';
        document.getElementById('enableEditMode').checked = false;
        document.getElementById('invoice-submit-btn').innerHTML = '<i class="bi bi-save"></i> Aggiorna Fattura';

        // Fill form fields
        const formData = {
            InvoiceID: invoice.InvoiceID || '',
            InvoiceOrderNumber: invoice.InvoiceOrderNumber || '',
            InvoiceNumber: invoice.InvoiceNumber || '',
            InvoiceTaxable: invoice.InvoiceTaxable || '',
            InvoiceTax: this._convertTaxForDisplay(invoice.InvoiceTax) || '',  // Convert 0.22 → 22
            InvoiceDue: invoice.InvoiceDue || '',
            TaxTotal: (invoice.InvoiceTaxable * invoice.InvoiceTax) || '',  // Use DB decimal directly
            InvoiceTotal: (invoice.InvoiceTaxable + (invoice.InvoiceTaxable * invoice.InvoiceTax)) || '',  // Use DB decimal directly
            CreationDate: invoice.InvoiceCreationDate?.split('T')[0] || '',
            DueDate: invoice.InvoiceDueDate?.split('T')[0] || '',
            Description: invoice.InvoiceDescription || ''
        };

        UI.setFormData('createInvoice', formData);

        // Apply status color
        const statusConfig = getStatusConfig(invoiceDTO.StatusCode);
        const statusSelect = document.getElementById('StatusID');
        if (statusSelect) {
            statusSelect.style.backgroundColor = statusConfig.backgroundColor;
            statusSelect.style.color = statusConfig.textColor;  // Add text color
        }

        // Load and select dropdowns
        this._loadCustomersDropdown('CustomerID');
        this._loadStatusesDropdown('StatusID');

        // Set selected customer in autocomplete and status in select
        setTimeout(() => {
            // Set customer in autocomplete
            if (this.customerAutocomplete && invoice.CustomerID) {
                // Find customer object from loaded customers
                const customers = this.customerAutocomplete.customers || [];
                const selectedCustomer = customers.find(c => c.CustomerID === invoice.CustomerID);

                if (selectedCustomer) {
                    this.customerAutocomplete.setSelectedCustomer(selectedCustomer);
                }
            }

            // Set status in select (unchanged)
            document.getElementById('StatusID').value = invoice.StatusID || '';
        }, 500);

        // Disable form initially (view mode)
        this.toggleEditMode();

        // Show detail-specific navigation buttons (Torna a Elenco, Nuova Fattura)
        // These buttons are only visible in detail mode, hidden in create mode
        UI.setElementVisible('invoice-detail-actions', true);
    },

    /**
     * Toggle edit mode for invoice detail
     */
    toggleEditMode: function() {
        const isEditMode = document.getElementById('enableEditMode').checked;

        // If toggling OFF (from ON to OFF), revert to original invoice data
        if (!isEditMode && this.state.currentInvoiceDTO) {
            this._revertToOriginalInvoice();
        }

        UI.setFormEnabled('createInvoice', isEditMode, ['InvoiceID', 'enableEditMode', 'TaxTotal', 'InvoiceTotal']);
        UI.setElementVisible('invoice-submit-btn', isEditMode);
    },

    /**
     * Revert form to original invoice data (discard unsaved changes)
     * Called when Edit Mode is toggled OFF without saving
     * @private
     */
    _revertToOriginalInvoice: function() {
        if (!this.state.currentInvoiceDTO) {
            console.warn('_revertToOriginalInvoice: No current invoice to revert to');
            return;
        }

        const invoice = this.state.currentInvoiceDTO.Invoice;

        console.log('Reverting to original invoice data:', invoice.InvoiceID);

        // Revert all form fields to original values
        const formData = {
            InvoiceID: invoice.InvoiceID || '',
            InvoiceOrderNumber: invoice.InvoiceOrderNumber || '',
            InvoiceNumber: invoice.InvoiceNumber || '',
            InvoiceTaxable: invoice.InvoiceTaxable || '',
            InvoiceTax: this._convertTaxForDisplay(invoice.InvoiceTax) || '',
            InvoiceDue: invoice.InvoiceDue || '',
            TaxTotal: (invoice.InvoiceTaxable * invoice.InvoiceTax) || '',
            InvoiceTotal: (invoice.InvoiceTaxable + (invoice.InvoiceTaxable * invoice.InvoiceTax)) || '',
            CreationDate: invoice.InvoiceCreationDate?.split('T')[0] || '',
            DueDate: invoice.InvoiceDueDate?.split('T')[0] || '',
            Description: invoice.InvoiceDescription || ''
        };

        UI.setFormData('createInvoice', formData);

        // Revert customer selection in autocomplete
        if (this.customerAutocomplete && invoice.CustomerID) {
            const customers = this.customerAutocomplete.customers || [];
            const selectedCustomer = customers.find(c => c.CustomerID === invoice.CustomerID);

            if (selectedCustomer) {
                this.customerAutocomplete.setSelectedCustomer(selectedCustomer);
                console.log('Reverted customer to:', selectedCustomer.CustomerName);
            } else {
                console.warn('Could not find original customer with ID:', invoice.CustomerID);
            }
        }

        // Revert status selection
        setTimeout(() => {
            document.getElementById('StatusID').value = invoice.StatusID || '';

            // Reapply status color
            const statusConfig = getStatusConfig(this.state.currentInvoiceDTO.StatusCode);
            const statusSelect = document.getElementById('StatusID');
            if (statusSelect) {
                statusSelect.style.backgroundColor = statusConfig.backgroundColor;
                statusSelect.style.color = statusConfig.textColor;
            }
        }, 100);

        console.log('Successfully reverted to original invoice data');
    },

    /**
     * Initialize customer autocomplete (lazy initialization)
     * @private
     */
    _initCustomerAutocomplete: function() {
        // Check if already initialized
        if (this.customerAutocomplete) return;

        try {
            const config = {
                inputId: 'CustomerID-display',
                dropdownId: 'CustomerID-dropdown',
                clearButtonId: 'CustomerID-clear',
                arrowId: 'CustomerID-arrow',
                spinnerId: 'CustomerID-spinner',
                hiddenInputId: 'CustomerID',

                // Callback when customer is selected
                onSelect: (customer) => {
                    // Update hidden field with CustomerID for form submission
                    const hiddenInput = document.getElementById('CustomerID');
                    if (hiddenInput) {
                        hiddenInput.value = customer.CustomerID;
                    }
                },

                // Callback when selection is cleared
                onClear: () => {
                    // Clear hidden field
                    const hiddenInput = document.getElementById('CustomerID');
                    if (hiddenInput) {
                        hiddenInput.value = '';
                    }
                },

                // No API endpoint (we load all customers upfront)
                apiEndpoint: null,
                minChars: 0,  // Show all on click
                debounceDelay: 300
            };

            this.customerAutocomplete = new AutocompleteCustomer(config);
            this.customerAutocomplete.init();

            console.log('Customer autocomplete initialized successfully');

        } catch (error) {
            console.error('Failed to initialize customer autocomplete:', error);

            // Show user-facing error message
            UI.showPopup(
                'Errore di Inizializzazione',
                'Impossibile inizializzare la ricerca clienti. Ricaricare la pagina.',
                { type: 'error' }
            );
        }
    },

    /**
     * Load customers dropdown (now using autocomplete)
     * @private
     */
    _loadCustomersDropdown: function(selectId) {
        CustomerAPI.getAll(
            (response) => {
                ApiClient.handleResponse(response, {
                    onOk: (data) => {
                        // Initialize autocomplete if not already done
                        this._initCustomerAutocomplete();

                        // Set customers in autocomplete
                        if (this.customerAutocomplete) {
                            this.customerAutocomplete.setCustomers(data);
                            console.log(`Loaded ${data.length} customers into autocomplete`);
                        }
                    },
                    onError: (message) => {
                        console.error('Failed to load customers:', message);
                        UI.showPopup(
                            'Errore Caricamento Clienti',
                            'Impossibile caricare l\'elenco clienti. Riprovare.',
                            { type: 'error' }
                        );
                    }
                });
            },
            (error) => {
                console.error('Failed to load customers (network error):', error);
                UI.showPopup(
                    'Errore di Rete',
                    'Impossibile caricare i clienti. Verificare la connessione.',
                    { type: 'error' }
                );
            }
        );
    },

    /**
     * Initialize customer filter autocomplete (lazy initialization)
     * Called when loading ALL customers for filtering
     * @private
     */
    _initCustomerFilterAutocomplete: function() {
        // Check if already initialized
        if (this.customerFilterAutocomplete) return;

        try {
            const config = {
                inputId: 'customer-filter-display',
                dropdownId: 'customer-filter-dropdown',
                clearButtonId: 'customer-filter-clear',
                arrowId: 'customer-filter-arrow',
                spinnerId: null,  // No spinner for filter
                hiddenInputId: 'customer-filter-id',

                // Callback when customer is selected
                onSelect: (customer) => {
                    console.log('Filter customer selected:', customer.CustomerName, 'ID:', customer.CustomerID);

                    // Store selected CustomerID in hidden field
                    const hiddenInput = document.getElementById('customer-filter-id');
                    if (hiddenInput) {
                        hiddenInput.value = customer.CustomerID;
                    }

                    // Trigger filter update
                    this.applyFilters();
                },

                // Callback when selection is cleared
                onClear: () => {
                    console.log('Filter customer cleared - showing all invoices');

                    // Clear hidden field
                    const hiddenInput = document.getElementById('customer-filter-id');
                    if (hiddenInput) {
                        hiddenInput.value = '';
                    }

                    // Trigger filter update (show all)
                    this.applyFilters();
                },

                // No API endpoint (customers loaded via CustomerAPI.getAll)
                apiEndpoint: null,
                minChars: 0,  // Show all customers on click
                debounceDelay: 300
            };

            this.customerFilterAutocomplete = new AutocompleteCustomer(config);
            this.customerFilterAutocomplete.init();

            console.log('Customer filter autocomplete initialized successfully');

        } catch (error) {
            console.error('Failed to initialize customer filter autocomplete:', error);
            UI.showPopup(
                'Errore di Inizializzazione Filtro',
                'Impossibile inizializzare il filtro clienti. Ricaricare la pagina.',
                { type: 'error' }
            );
        }
    },

    /**
     * Load statuses dropdown
     * @private
     */
    _loadStatusesDropdown: function(selectId) {
        StatusAPI.getAll(
            (response) => {
                ApiClient.handleResponse(response, {
                    onOk: (data) => this._fillStatusesSelect(data, selectId)
                });
            },
            (error) => console.error('Failed to load statuses:', error)
        );
    },


    /**
     * Fill statuses select element
     * @private
     */
    _fillStatusesSelect: function(statuses, selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.innerHTML = '';

        // CRITICAL: Add empty default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Seleziona Stato --';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status.StatusID;
            option.textContent = status.StatusLabel;
            select.appendChild(option);
        });
    },

    /**
     * Update invoice totals when taxable or tax rate changes
     */
    updateTotals: function() {
        const taxableAmount = parseFloat(document.getElementById('InvoiceTaxable')?.value || 0);
        const taxRate = parseFloat(document.getElementById('InvoiceTax')?.value || 0) / 100;

        if (!isNaN(taxableAmount) && !isNaN(taxRate)) {
            const taxTotal = taxableAmount * taxRate;
            const invoiceTotal = taxableAmount + taxTotal;

            document.getElementById('TaxTotal').value = taxTotal.toFixed(2);
            document.getElementById('InvoiceTotal').value = invoiceTotal.toFixed(2);
        }
    },

    /**
     * Handle invoice form submission (create or update)
     * @param {Event} event - Form submit event
     */
    handleFormSubmit: function(event) {
        // Prevent default form submission
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // GUARD: Prevent double submission
        if (this._isSubmitting) {
            console.warn('Form already submitting, ignoring duplicate submit event');
            return;
        }

        // Validate form
        const validation = this._validateInvoiceForm();
        if (!validation.valid) {
            UI.showPopup('Errore di Compilazione', validation.message, { type: 'warning' });
            return;
        }

        // Get form data
        const formData = this._getInvoiceFormData();

        // LOCK: Set submission flag
        this._isSubmitting = true;

        // VISUAL FEEDBACK: Disable submit button and show spinner
        const submitBtn = document.getElementById('invoice-submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Invio in corso...';
        }

        // Show loading overlay
        UI.showLoading();

        // Submit to API
        InvoiceAPI.createOrUpdate(
            formData,
            (response) => this._handleInvoiceSubmitResponse(response),
            (error) => this._handleInvoiceSubmitError(error)
        );
    },

    /**
     * Validate invoice form
     * @private
     * @returns {Object} Validation result {valid: boolean, message: string}
     */
    _validateInvoiceForm: function() {
        const form = document.forms.createInvoice;

        // CRITICAL: Dropdown validation - must select a customer
        if (!form.CustomerID.value || form.CustomerID.value === '') {
            return { valid: false, message: 'Seleziona un cliente.' };
        }

        // CRITICAL: Dropdown validation - must select a status
        if (!form.StatusID.value || form.StatusID.value === '') {
            return { valid: false, message: 'Seleziona uno stato.' };
        }

        // Numeric validations
        const invoiceTaxable = parseFloat(form.InvoiceTaxable.value);
        const invoiceTax = parseFloat(form.InvoiceTax.value);
        const invoiceDue = parseFloat(form.InvoiceDue.value);
        const invoiceTotal = parseFloat(form.InvoiceTotal.value);

        if (invoiceTaxable <= 0) {
            return { valid: false, message: 'L\'imponibile deve essere maggiore di 0.' };
        }

        if (invoiceTax < 0 || invoiceTax > 100) {
            return { valid: false, message: 'L\'IVA deve essere tra 0 e 100.' };
        }

        if (invoiceDue <= 0) {
            return { valid: false, message: 'Il netto a pagare deve essere maggiore di 0.' };
        }

        if (invoiceTotal <= 0) {
            return { valid: false, message: 'Il totale fattura deve essere maggiore di 0.' };
        }

        // Check if due amount exceeds total
        if (invoiceDue > invoiceTotal) {
            return {
                valid: false,
                message: 'Il netto a pagare non può essere maggiore del totale della fattura.'
            };
        }

        // Check if creation date is after due date
        const creationDate = new Date(form.CreationDate.value);
        const dueDate = new Date(form.DueDate.value);

        if (creationDate > dueDate) {
            return {
                valid: false,
                message: 'La data di emissione non può essere successiva alla data di scadenza.'
            };
        }

        return { valid: true, message: '' };
    },

    /**
     * Get invoice form data as object
     * @private
     */
    _getInvoiceFormData: function() {
        const form = document.forms.createInvoice;

        return {
            InvoiceID: form.InvoiceID?.value || null,
            InvoiceOrderNumber: form.InvoiceOrderNumber.value,
            InvoiceNumber: form.InvoiceNumber.value,
            CustomerID: form.CustomerID.value,
            StatusID: form.StatusID.value,
            InvoiceTaxable: form.InvoiceTaxable.value,
            InvoiceTax: form.InvoiceTax.value,
            InvoiceDue: form.InvoiceDue.value,
            CreationDate: form.CreationDate.value,
            DueDate: form.DueDate.value,
            Description: form.Description.value
        };
    },

    /**
     * Handle invoice submit response
     * @private
     */
    _handleInvoiceSubmitResponse: function(response) {
        UI.hideLoading();
        this._resetSubmitButton();

        ApiClient.handleResponse(response, {
            onOk: (data) => {
                // UNLOCK: Reset submission flag on success
                this._isSubmitting = false;

                // Extract invoice data from response
                // Backend now returns: { InvoiceID: 123, IsNew: true/false }
                const invoiceId = data?.InvoiceID;
                const isNewInvoice = data?.IsNew;

                // Customize success message based on operation type
                const successMessage = isNewInvoice
                    ? 'Fattura creata correttamente!'
                    : 'Fattura aggiornata correttamente!';

                UI.showPopup(
                    'Successo',
                    successMessage,
                    {
                        type: 'success',
                        onClose: () => {
                            // Redirect to detail view if InvoiceID available
                            if (invoiceId) {
                                this.showDetail(invoiceId);
                            } else {
                                // Fallback: If no InvoiceID (backwards compatibility), go to Calendar
                                Calendar.show();
                            }
                        }
                    }
                );
            },
            onKo: (message) => {
                // UNLOCK: Reset submission flag on error
                this._isSubmitting = false;

                // ENHANCED: Detect duplicate submission errors
                if (message && (message.includes('InvoiceNumber') || message.includes('InvoiceOrderNumber'))) {
                    UI.showPopup(
                        'Fattura Duplicata',
                        'Questa fattura è già stata salvata. Controlla l\'elenco fatture.',
                        {
                            type: 'warning',
                            onClose: () => this.showList()  // Improved: Go to list instead of calendar
                        }
                    );
                } else {
                    UI.showPopup('Errore', message, { type: 'error' });
                }
            }
        });
    },

    /**
     * Handle invoice submit error (network/server errors)
     * @private
     */
    _handleInvoiceSubmitError: function(error) {
        UI.hideLoading();
        this._resetSubmitButton();

        // UNLOCK: Reset submission flag on network/server error
        this._isSubmitting = false;

        console.error('Invoice submit error:', error);
        UI.showPopup('Errore di Connessione', 'Impossibile salvare la fattura', { type: 'error' });
    },

    /**
     * Reset submit button to original state
     * Re-enables button and restores original text
     * @private
     */
    _resetSubmitButton: function() {
        const submitBtn = document.getElementById('invoice-submit-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> Crea Fattura';
        }
    },

    /**
     * Confirm and delete invoice
     * @param {number} invoiceId - Invoice ID
     */
    confirmDelete: function(invoiceId) {
        UI.showConfirmation(
            'Conferma Eliminazione',
            'Sei sicuro di voler eliminare questa fattura? Questa azione non può essere annullata.',
            () => this.delete(invoiceId)
        );
    },

    /**
     * Delete invoice (soft delete)
     * @param {number} invoiceId - Invoice ID
     */
    delete: function(invoiceId) {
        // ✅ SAVE FILTER STATE BEFORE DELETION
        const savedFilters = this._saveFilterState();
        console.log('Saving filters before deletion:', savedFilters);

        InvoiceAPI.delete(
            invoiceId,
            (response) => {
                // Success handler
                if (response.Code === 'Ok') {
                    UI.showPopup(
                        'Successo',
                        response.Message || 'Fattura eliminata con successo',
                        {
                            type: 'success',
                            onClose: () => {
                                // ✅ RELOAD WITH FILTER PRESERVATION
                                this._reloadWithFilterPreservation(savedFilters);
                            }
                        }
                    );
                } else {
                    // Backend returned Ko
                    // NOTE: Filters are preserved because NO reload happens (no onClose callback)
                    // This is CORRECT behavior: invoice NOT deleted → data unchanged → keep current view
                    let errorMsg = 'Impossibile eliminare la fattura';

                    // Handle error messages (can be array or string)
                    if (Array.isArray(response.Message)) {
                        errorMsg = response.Message.join('; ');
                    } else if (response.Message) {
                        errorMsg = response.Message;
                    }

                    // ✅ NO RELOAD on error - filters preserved, data unchanged
                    console.warn('Delete failed (backend error):', errorMsg);
                    console.log('Filters preserved (no reload on error):', savedFilters);

                    UI.showPopup('Errore', errorMsg, { type: 'error' });
                }
            },
            (error) => {
                // Error handler (network/parsing errors)
                // NOTE: Filters are preserved because NO reload happens (no onClose callback)
                // This is CORRECT behavior: invoice likely NOT deleted → keep current view
                console.error('Delete invoice error (network/parsing):', error);

                let errorMsg = 'Errore durante l\'eliminazione della fattura';
                if (error && error.message) {
                    errorMsg = error.message;
                }

                // ✅ NO RELOAD on error - filters preserved, data unchanged
                console.log('Filters preserved (no reload on error):', savedFilters);

                UI.showPopup('Errore', errorMsg, { type: 'error' });
            }
        );
    }
};

// Export Invoices module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Invoices };
}
