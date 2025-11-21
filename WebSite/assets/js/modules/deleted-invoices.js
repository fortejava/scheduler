// ====================================
// DELETED INVOICES MANAGEMENT MODULE
// ====================================

/**
 * Deleted Invoices Manager
 * Handles viewing, restoring, and hard deleting soft-deleted invoices
 */
const DeletedInvoices = {
    // State management
    state: {
        allInvoices: [],
        selectedIds: new Set(),
        currentPage: 1,
        itemsPerPage: PAGINATION.DEFAULT_ITEMS_PER_PAGE,
        sortColumn: null,
        sortDirection: 'asc',
        statusOptions: [],
        customerFilterAutocomplete: null  // Autocomplete instance for customer filter
    },

    /**
     * Initialize and show deleted invoices list
     */
    showList: function() {
        UI.showLoading();

        // ✨ FIX: Clear selection state when loading fresh data to prevent stale IDs
        this.state.selectedIds.clear();

        // Call API to get deleted invoices (InvoiceActive = "N")
        InvoiceAPI.getDeleted(
            {},  // Empty filters = fetch all deleted invoices
            (response) => this._handleInvoiceListResponse(response),
            (error) => this._handleInvoiceListError(error)
        );

        UI.showView(VIEWS.DELETED_INVOICES);
    },

    /**
     * Handle invoice list API response
     * @private
     */
    _handleInvoiceListResponse: function(response) {
        ApiClient.handleResponse(response, {
            onOk: (data) => {
                // ✨ TRIPLE-SURE VALIDATION: Filter out any non-deleted invoices
                // This is defensive coding - backend should only return InvoiceActive='N',
                // but we verify to prevent displaying active invoices in deleted view
                const validDeletedInvoices = data.filter(dto => {
                    if (dto.Invoice.InvoiceActive !== 'N') {
                        console.warn('⚠️ WARNING: Active invoice in deleted invoices list!', {
                            InvoiceID: dto.Invoice.InvoiceID,
                            InvoiceNumber: dto.Invoice.InvoiceNumber,
                            InvoiceActive: dto.Invoice.InvoiceActive
                        });
                        return false;
                    }
                    return true;
                });

                // Alert user if suspicious data detected
                if (validDeletedInvoices.length !== data.length) {
                    const suspiciousCount = data.length - validDeletedInvoices.length;
                    UI.showPopup(
                        'Attenzione',
                        `${suspiciousCount} fatture non eliminate rilevate e filtrate.`,
                        { type: 'warning' }
                    );
                }

                this.state.allInvoices = validDeletedInvoices;
                this._populateFilters();
                this.applyFilters();
                UI.hideLoading();
            },
            onKo: (message) => {
                UI.hideLoading();
                UI.showPopup('Errore', 'Impossibile caricare le fatture eliminate', { type: 'error' });
            },
            onOut: (message) => {
                UI.hideLoading();
                Auth.handleSessionExpired();
            }
        });
    },

    /**
     * Handle invoice list API error
     * @private
     */
    _handleInvoiceListError: function(error) {
        UI.hideLoading();
        UI.showPopup('Errore di Connessione', 'Impossibile caricare le fatture eliminate', { type: 'error' });
    },

    /**
     * Populate filter dropdowns (year, status)
     * @private
     */
    _populateFilters: function() {
        // Populate year filter
        const yearFilter = document.getElementById('deleted-year-filter');
        if (yearFilter) {
            const years = [...new Set(this.state.allInvoices.map(dto => {
                const dueDate = new Date(dto.Invoice.InvoiceDueDate);
                return dueDate.getFullYear();
            }))].sort((a, b) => b - a);

            yearFilter.innerHTML = '<option value="">Tutti gli anni</option>' +
                years.map(year => `<option value="${year}">${year}</option>`).join('');
        }

        // Store status options for later use
        if (this.state.allInvoices.length > 0 && this.state.allInvoices[0].Invoice.Status) {
            this.state.statusOptions = this.state.allInvoices.map(dto => dto.Invoice.Status);
        }

        // ✨ NEW: Populate customer filter with autocomplete
        this._populateCustomerFilter();
    },

    /**
     * Populate customer filter (using autocomplete with ALL customers)
     * Loads ALL customers from API (not just those with deleted invoices)
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
                        }
                    },
                    onError: (message) => {
                        console.error('Failed to load customers for deleted invoices filter:', message);
                    }
                });
            },
            (error) => {
                console.error('Failed to load customers for deleted invoices filter (network error):', error);
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
                inputId: 'deleted-customer-filter-display',
                dropdownId: 'deleted-customer-filter-dropdown',
                clearButtonId: 'deleted-customer-filter-clear',
                arrowId: 'deleted-customer-filter-arrow',
                spinnerId: null,  // No spinner for filter
                hiddenInputId: 'deleted-customer-filter-id',

                // Callback when customer is selected
                onSelect: (customer) => {
                    // Store selected CustomerID in hidden field
                    const hiddenInput = document.getElementById('deleted-customer-filter-id');
                    if (hiddenInput) {
                        hiddenInput.value = customer.CustomerID;
                    }

                    // Trigger filter update
                    this.applyFilters();
                },

                // Callback when selection is cleared
                onClear: () => {
                    // Clear hidden field
                    const hiddenInput = document.getElementById('deleted-customer-filter-id');
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

        } catch (error) {
            console.error('Failed to initialize deleted invoices customer filter autocomplete:', error);
            UI.showPopup(
                'Errore di Inizializzazione Filtro',
                'Impossibile inizializzare il filtro clienti per fatture eliminate. Ricaricare la pagina.',
                { type: 'error' }
            );
        }
    },

    /**
     * Apply current filters and render table
     */
    applyFilters: function() {
        const filtered = this.getFilteredData();
        this.renderTable(filtered);
    },

    /**
     * Get filtered invoice data based on current filter state
     */
    getFilteredData: function() {
        let filtered = this.state.allInvoices;

        // Apply search filter
        const searchTerm = document.getElementById('deleted-search')?.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(dto => {
                const invoice = dto.Invoice;
                return invoice.InvoiceNumber.toLowerCase().includes(searchTerm) ||
                       invoice.InvoiceOrderNumber.toLowerCase().includes(searchTerm) ||
                       invoice.Customer.CustomerName.toLowerCase().includes(searchTerm);
            });
        }

        // Apply month filter
        const month = document.getElementById('deleted-month-filter')?.value;
        if (month) {
            filtered = filtered.filter(dto => {
                const dueDate = new Date(dto.Invoice.InvoiceDueDate);
                return (dueDate.getMonth() + 1) == month;
            });
        }

        // Apply year filter
        const year = document.getElementById('deleted-year-filter')?.value;
        if (year) {
            filtered = filtered.filter(dto => {
                const dueDate = new Date(dto.Invoice.InvoiceDueDate);
                return dueDate.getFullYear() == year;
            });
        }

        // Apply status filter
        const statusId = document.getElementById('deleted-status-filter')?.value;
        if (statusId) {
            filtered = filtered.filter(dto => dto.StatusCode == statusId);
        }

        // Apply customer filter
        const customerId = document.getElementById('deleted-customer-filter-id')?.value;
        if (customerId) {
            filtered = filtered.filter(dto => dto.Invoice.CustomerID == customerId);
        }

        // Apply sorting
        if (this.state.sortColumn) {
            filtered.sort((a, b) => {
                let aVal, bVal;

                switch (this.state.sortColumn) {
                    case 'invoiceNumber':
                        aVal = a.Invoice.InvoiceNumber.toLowerCase();
                        bVal = b.Invoice.InvoiceNumber.toLowerCase();
                        break;
                    case 'orderNumber':
                        aVal = a.Invoice.InvoiceOrderNumber.toLowerCase();
                        bVal = b.Invoice.InvoiceOrderNumber.toLowerCase();
                        break;
                    case 'customer':
                        aVal = a.Invoice.Customer.CustomerName.toLowerCase();
                        bVal = b.Invoice.Customer.CustomerName.toLowerCase();
                        break;
                    case 'dueDate':
                        aVal = new Date(a.Invoice.InvoiceDueDate).getTime();
                        bVal = new Date(b.Invoice.InvoiceDueDate).getTime();
                        break;
                    case 'status':
                        aVal = a.Invoice.Status.StatusLabel.toLowerCase();
                        bVal = b.Invoice.Status.StatusLabel.toLowerCase();
                        break;
                    default:
                        return 0;
                }

                if (aVal < bVal) return this.state.sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return this.state.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    },

    /**
     * Render invoice table with pagination
     */
    renderTable: function(invoices) {
        const container = document.getElementById('deleted-invoices-list-container');
        if (!container) return;

        // Calculate pagination
        const start = (this.state.currentPage - 1) * this.state.itemsPerPage;
        const end = start + this.state.itemsPerPage;
        const paginatedInvoices = invoices.slice(start, end);

        // Generate table HTML
        let tableHTML = `
            <div class="table-responsive invoice-table-wrapper">
                <table class="table table-hover table-striped invoice-table deleted-rows">
                    <thead class="table-dark sticky-top">
                        <tr>
                            <th scope="col" style="width: 40px;">
                                <input class="form-check-input" type="checkbox" id="checkbox-select-all-deleted"
                                       onchange="DeletedInvoices.toggleSelectAll(this.checked)">
                            </th>
                            <th scope="col" class="sortable" onclick="DeletedInvoices.sort('invoiceNumber')" style="width: 120px;">
                                <div class="sortable-content">
                                    N° FATTURA <i class="bi bi-arrow-down-up"></i>
                                </div>
                            </th>
                            <th scope="col" class="sortable" onclick="DeletedInvoices.sort('orderNumber')" style="width: 120px;">
                                <div class="sortable-content">
                                    N° ORDINE <i class="bi bi-arrow-down-up"></i>
                                </div>
                            </th>
                            <th scope="col" class="sortable" onclick="DeletedInvoices.sort('customer')">
                                <div class="sortable-content">
                                    CLIENTE <i class="bi bi-arrow-down-up"></i>
                                </div>
                            </th>
                            <th scope="col" class="sortable" onclick="DeletedInvoices.sort('dueDate')" style="width: 110px;">
                                <div class="sortable-content">
                                    SCADENZA <i class="bi bi-arrow-down-up"></i>
                                </div>
                            </th>
                            <th scope="col" class="sortable" onclick="DeletedInvoices.sort('status')" style="width: 110px;">
                                <div class="sortable-content">
                                    STATO <i class="bi bi-arrow-down-up"></i>
                                </div>
                            </th>
                            <th scope="col" class="text-center" style="width: 180px;">AZIONI</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (paginatedInvoices.length === 0) {
            tableHTML += `
                <tr>
                    <td colspan="7" class="text-center text-muted">Nessuna fattura eliminata trovata</td>
                </tr>
            `;
        } else {
            paginatedInvoices.forEach(dto => {
                const invoice = dto.Invoice;

                // SECURITY: Validate InvoiceID is a valid positive integer
                const invoiceId = parseInt(invoice.InvoiceID, 10);
                if (!Number.isInteger(invoiceId) || invoiceId < 1) {
                    InvoiceLogger.invalidId(invoice.InvoiceID);
                    return; // Skip this corrupted invoice, continue with others
                }

                const statusCode = dto.StatusCode;
                const statusConfig = getStatusConfig(statusCode);
                const isSelected = this.state.selectedIds.has(invoiceId);

                tableHTML += `
                    <tr data-invoice-id="${invoiceId}">
                        <td class="deleted-invoice-checkbox-cell-loginet">
                            <input class="form-check-input" type="checkbox"
                                   id="checkbox-invoice-${invoiceId}"
                                   aria-label="Seleziona fattura ${escapeHtml(invoice.InvoiceNumber)}"
                                   data-invoice-id="${invoiceId}"
                                   ${isSelected ? 'checked' : ''}
                                   onchange="DeletedInvoices.handleCheckboxChange(${invoiceId}, this.checked)">
                        </td>
                        <td class="align-middle fw-bold text-truncate" style="max-width: 150px;" data-label="N° Fattura">${escapeHtml(invoice.InvoiceNumber)}</td>
                        <td class="align-middle text-muted text-truncate" style="max-width: 150px;" data-label="N° Ordine">${escapeHtml(invoice.InvoiceOrderNumber)}</td>
                        <td class="align-middle text-truncate" style="max-width: 250px;" data-label="Cliente">${escapeHtml(invoice.Customer.CustomerName)}</td>
                        <td data-label="Scadenza">${formatDate(invoice.InvoiceDueDate)}</td>
                        <td data-label="Stato">
                            <span class="badge" style="background-color: ${statusConfig.backgroundColor}; color: ${statusConfig.textColor};">
                                ${escapeHtml(invoice.Status.StatusLabel)}
                            </span>
                        </td>
                        <td class="deleted-invoice-actions-loginet" data-label="Azioni">
                            <div class="hstack gap-1 justify-content-center">
                                <button class="btn btn-sm btn-outline-primary deleted-invoice-restore-btn"
                                        onclick="DeletedInvoices.confirmRestore(${invoice.InvoiceID})"
                                        title="Ripristina fattura">
                                    <i class="bi bi-arrow-counterclockwise"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger deleted-invoice-delete-btn"
                                        onclick="DeletedInvoices.confirmHardDelete(${invoice.InvoiceID})"
                                        title="Elimina definitivamente">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        // ✨ ADD PAGINATION CONTROLS
        const totalPages = Math.ceil(invoices.length / this.state.itemsPerPage);
        tableHTML += this._buildPaginationHTML(invoices.length, totalPages);

        container.innerHTML = tableHTML;

        // Update results counter
        const counter = document.getElementById('deleted-results-counter');
        if (counter) {
            counter.textContent = `Trovate ${invoices.length} fatture eliminate`;
        }

        // Update select all checkbox state
        this.updateSelectAllCheckbox();

        // ✨ NEW: Initialize tooltips for truncated text
        if (typeof TooltipManager !== 'undefined') {
            TooltipManager.reinitialize();
        }

        // ✨ FIX: Update batch delete button state after rendering
        this.updateBatchDeleteButton();
    },

    /**
     * Handle checkbox selection change
     */
    handleCheckboxChange: function(invoiceId, isChecked) {
        if (isChecked) {
            this.state.selectedIds.add(invoiceId);
        } else {
            this.state.selectedIds.delete(invoiceId);
        }

        this.updateBatchDeleteButton();
        this.updateSelectAllCheckbox();
    },

    /**
     * Toggle select all checkboxes
     */
    toggleSelectAll: function(checked) {
        if (checked) {
            this.selectAll();
        } else {
            this.deselectAll();
        }
    },

    /**
     * Select all visible invoices
     */
    selectAll: function() {
        const filtered = this.getFilteredData();
        filtered.forEach(dto => {
            this.state.selectedIds.add(dto.Invoice.InvoiceID);
        });
        this.renderTable(filtered);
        this.updateBatchDeleteButton();
    },

    /**
     * Deselect all invoices
     */
    deselectAll: function() {
        this.state.selectedIds.clear();
        const filtered = this.getFilteredData();
        this.renderTable(filtered);
        this.updateBatchDeleteButton();
    },

    /**
     * Update batch delete button state
     */
    updateBatchDeleteButton: function() {
        const btn = document.getElementById('btn-batch-hard-delete');
        const countSpan = document.getElementById('selected-count');
        const count = this.state.selectedIds.size;

        if (btn) btn.disabled = count === 0;
        if (countSpan) countSpan.textContent = count;
    },

    /**
     * Update "select all" checkbox state
     */
    updateSelectAllCheckbox: function() {
        const checkbox = document.getElementById('checkbox-select-all-deleted');
        const filtered = this.getFilteredData();
        const allSelected = filtered.length > 0 &&
            filtered.every(dto => this.state.selectedIds.has(dto.Invoice.InvoiceID));

        if (checkbox) {
            checkbox.checked = allSelected;
        }
    },

    /**
     * Clear all filters
     */
    clearFilters: function() {
        const searchInput = document.getElementById('deleted-search');
        const monthFilter = document.getElementById('deleted-month-filter');
        const yearFilter = document.getElementById('deleted-year-filter');
        const statusFilter = document.getElementById('deleted-status-filter');

        if (searchInput) searchInput.value = '';
        if (monthFilter) monthFilter.value = '';
        if (yearFilter) yearFilter.value = '';
        if (statusFilter) statusFilter.value = '';

        // ✨ UPDATED: Use autocomplete's clearSelection method
        if (this.customerFilterAutocomplete) {
            this.customerFilterAutocomplete.clearSelection();
        } else {
            // Fallback: clear manually if autocomplete not initialized
            const customerFilterDisplay = document.getElementById('deleted-customer-filter-display');
            const customerFilterId = document.getElementById('deleted-customer-filter-id');
            if (customerFilterDisplay) customerFilterDisplay.value = '';
            if (customerFilterId) customerFilterId.value = '';
        }

        this.applyFilters();
    },

    /**
     * Confirm and restore invoice
     */
    confirmRestore: function(invoiceId) {
        UI.showConfirmation(
            'Ripristinare Fattura?',
            'La fattura tornerà nell\'elenco fatture attive.',
            () => this.restore(invoiceId)
        );
    },

    /**
     * Restore invoice (set InvoiceActive = "Y")
     */
    restore: function(invoiceId) {
        InvoiceAPI.restore(
            invoiceId,
            (response) => {
                if (response.Code === 'Ok') {
                    const displayMessage = typeof response.Message === 'string'
                        ? response.Message
                        : 'Fattura ripristinata con successo';

                    UI.showPopup(
                        'Successo',
                        displayMessage,
                        {
                            type: 'success',
                            onClose: () => {
                                // Reload deleted invoices list
                                this.showList();
                            }
                        }
                    );
                } else {
                    let errorMsg = 'Impossibile ripristinare la fattura';
                    if (Array.isArray(response.Message)) {
                        errorMsg = response.Message.join('; ');
                    } else if (response.Message) {
                        errorMsg = response.Message;
                    }

                    UI.showPopup('Errore', errorMsg, { type: 'error' });
                }
            },
            (error) => {
                let errorMsg = 'Errore durante il ripristino della fattura';
                if (error && error.message) {
                    errorMsg = error.message;
                }

                UI.showPopup('Errore', errorMsg, { type: 'error' });
            }
        );
    },

    /**
     * Confirm and hard delete invoice (double confirmation)
     */
    confirmHardDelete: function(invoiceId) {
        // First confirmation
        UI.showConfirmation(
            'ATTENZIONE: Eliminazione Definitiva',
            'Questa azione eliminerà DEFINITIVAMENTE la fattura dal database e NON può essere annullata. Sei sicuro?',
            () => {
                // Second confirmation
                UI.showConfirmation(
                    'Conferma Finale',
                    'Confermi di voler eliminare DEFINITIVAMENTE questa fattura?',
                    () => this.hardDelete(invoiceId)
                );
            }
        );
    },

    /**
     * Hard delete invoice (permanent deletion)
     */
    hardDelete: function(invoiceId) {
        InvoiceAPI.hardDelete(
            invoiceId,
            (response) => {
                if (response.Code === 'Ok') {
                    const displayMessage = typeof response.Message === 'string'
                        ? response.Message
                        : 'Fattura eliminata definitivamente';

                    UI.showPopup(
                        'Successo',
                        displayMessage,
                        {
                            type: 'success',
                            onClose: () => {
                                // Reload deleted invoices list
                                this.showList();
                            }
                        }
                    );
                } else {
                    let errorMsg = 'Impossibile eliminare definitivamente la fattura';
                    if (Array.isArray(response.Message)) {
                        errorMsg = response.Message.join('; ');
                    } else if (response.Message) {
                        errorMsg = response.Message;
                    }

                    UI.showPopup('Errore', errorMsg, { type: 'error' });
                }
            },
            (error) => {
                let errorMsg = 'Errore durante l\'eliminazione definitiva';
                if (error && error.message) {
                    errorMsg = error.message;
                }

                UI.showPopup('Errore', errorMsg, { type: 'error' });
            }
        );
    },

    /**
     * Batch hard delete selected invoices
     */
    batchHardDelete: function() {
        const count = this.state.selectedIds.size;
        if (count === 0) {
            UI.showPopup('Nessuna Selezione', 'Seleziona almeno una fattura', { type: 'warning' });
            return;
        }

        // Double confirmation for batch delete
        UI.showConfirmation(
            `Eliminare ${count} Fatture?`,
            `Vuoi eliminare DEFINITIVAMENTE ${count} fatture selezionate? Questa azione NON può essere annullata.`,
            () => {
                UI.showConfirmation(
                    'Conferma Finale',
                    `Confermi l'eliminazione definitiva di ${count} fatture?`,
                    () => this._executeBatchHardDelete()
                );
            }
        );
    },

    /**
     * Execute batch hard delete
     * @private
     */
    _executeBatchHardDelete: function() {
        const invoiceIds = Array.from(this.state.selectedIds);

        InvoiceAPI.batchHardDelete(
            invoiceIds,
            (response) => {
                if (response.Code === 'Ok') {
                    // Parse BatchDeleteResult
                    const result = response.Message;

                    // Build result message
                    let message = `Eliminazione completata:\n`;
                    message += `✅ Successi: ${result.SuccessCount}\n`;
                    message += `❌ Fallimenti: ${result.FailureCount}`;

                    if (result.Errors && result.Errors.length > 0) {
                        message += `\n\nErrori:\n` + result.Errors.join('\n');
                    }

                    UI.showPopup(
                        'Eliminazione Batch Completata',
                        message,
                        {
                            type: result.FailureCount > 0 ? 'warning' : 'success',
                            onClose: () => {
                                // Clear selection and reload
                                this.state.selectedIds.clear();
                                this.showList();
                            }
                        }
                    );
                } else {
                    UI.showPopup('Errore', 'Impossibile completare l\'eliminazione batch', { type: 'error' });
                }
            },
            (error) => {
                UI.showPopup('Errore', 'Errore durante l\'eliminazione batch', { type: 'error' });
            }
        );
    },

    /**
     * Hard delete ALL visible filtered invoices (triple confirmation)
     */
    hardDeleteAll: function() {
        const filtered = this.getFilteredData();
        const count = filtered.length;

        if (count === 0) {
            UI.showPopup('Nessuna Fattura', 'Nessuna fattura da eliminare', { type: 'warning' });
            return;
        }

        // Triple confirmation for delete all
        UI.showConfirmation(
            'Eliminare TUTTE le Fatture Visualizzate?',
            `Vuoi eliminare TUTTE le ${count} fatture attualmente visualizzate? Questa azione è IRREVERSIBILE.`,
            () => {
                UI.showConfirmation(
                    `ATTENZIONE: ${count} Fatture`,
                    `Questa azione eliminerà definitivamente ${count} fatture. Sei ASSOLUTAMENTE sicuro?`,
                    () => {
                        UI.showConfirmation(
                            'Conferma Finale IRREVERSIBILE',
                            'Ultima conferma: procedere con l\'eliminazione definitiva?',
                            () => {
                                // Extract all invoice IDs
                                const invoiceIds = filtered.map(dto => dto.Invoice.InvoiceID);
                                this.state.selectedIds = new Set(invoiceIds);
                                this._executeBatchHardDelete();
                            }
                        );
                    }
                );
            }
        );
    },

    // ============================================
    // PAGINATION METHODS
    // ============================================

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
                                <a class="page-link" href="#" onclick="DeletedInvoices.changePage(${this.state.currentPage - 1}); return false;">
                                    <i class="bi bi-chevron-left"></i>
                                </a>
                            </li>`;

            // Page numbers
            html += this._buildPageNumbers(totalPages);

            // Next button
            html += `
                            <li class="page-item ${this.state.currentPage === totalPages ? 'disabled' : ''}">
                                <a class="page-link" href="#" onclick="DeletedInvoices.changePage(${this.state.currentPage + 1}); return false;">
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
                            onchange="DeletedInvoices.changeItemsPerPage(this.value)">`;

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
            html += `<li class="page-item"><a class="page-link" href="#" onclick="DeletedInvoices.changePage(1); return false;">1</a></li>`;
            if (startPage > 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Visible range
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === this.state.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="DeletedInvoices.changePage(${i}); return false;">${i}</a>
                </li>`;
        }

        // Ellipsis + last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            html += `<li class="page-item"><a class="page-link" href="#" onclick="DeletedInvoices.changePage(${totalPages}); return false;">${totalPages}</a></li>`;
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
     * @param {string} column - Column to sort by ('invoiceNumber', 'orderNumber', 'customer', 'dueDate', 'status')
     */
    sort: function(column) {
        // Toggle sort direction if same column clicked
        if (this.state.sortColumn === column) {
            this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.state.sortColumn = column;
            this.state.sortDirection = 'asc';
        }

        // Re-apply filters and render (filters will handle sorting)
        this.applyFilters();

        // Update sort icons in headers
        this._updateSortIcons();
    },

    /**
     * Update sort icons in table headers
     * @private
     */
    _updateSortIcons: function() {
        // Remove all active sort icons
        document.querySelectorAll('.deleted-invoice-table .sortable-content i').forEach(icon => {
            icon.className = 'bi bi-arrow-down-up';
        });

        // Add active sort icon to current column
        const sortableHeaders = {
            'invoiceNumber': 0,
            'orderNumber': 1,
            'customer': 2,
            'dueDate': 3,
            'status': 4
        };

        if (this.state.sortColumn && sortableHeaders[this.state.sortColumn] !== undefined) {
            const columnIndex = sortableHeaders[this.state.sortColumn];
            const headers = document.querySelectorAll('.deleted-invoice-table .sortable-content i');
            if (headers[columnIndex]) {
                headers[columnIndex].className = this.state.sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
            }
        }
    }
};

// Export module
// ES6 Module Export (Commented out - only works with type="module")
// export { DeletedInvoices };
