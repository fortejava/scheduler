// ====================================
// CALENDAR MODULE
// ====================================

/**
 * Calendar Manager
 * Handles calendar view and invoice visualization
 * Note: Assumes FullCalendar library is available globally
 */
const Calendar = {
    // Calendar instance (FullCalendar object)
    instance: null,

    // State management
    state: {
        currentYear: null  // Track current year to avoid unnecessary reloads
    },

    /**
     * Initialize calendar view
     */
    initialize: function() {
        if (this.instance) {
            console.log('Calendar already initialized');
            return;
        }

        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) {
            console.error('Calendar element not found');
            return;
        }

        // Initialize FullCalendar
        this.instance = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'it',
            headerToolbar: {
                left: 'prevYear,prev,next,nextYear today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            customButtons: {
                prevYear: {
                    text: '<<',
                    click: () => {
                        if (this.instance) {
                            this.instance.prevYear();
                        }
                    }
                },
                nextYear: {
                    text: '>>',
                    click: () => {
                        if (this.instance) {
                            this.instance.nextYear();
                        }
                    }
                }
            },
            buttonText: {
                today: 'Oggi',
                month: 'Mese',
                week: 'Settimana',
                day: 'Giorno'
            },
            eventDisplay: 'block',  // Force events to render as colored blocks (not dots)
            events: [],
            eventClick: (info) => this._handleEventClick(info),
            datesSet: (dateInfo) => this._handleDatesSet(dateInfo)
        });

        this.instance.render();
    },

    /**
     * Show calendar view
     */
    show: function() {
        UI.showView(VIEWS.CALENDAR);
        
        // Initialize calendar if not already done
        if (!this.instance) {
            this.initialize();
        }

        // Load invoices for current month/year
        const { month, year } = getCurrentDateInfo();
        this.loadInvoices(month, year);
    },

    /**
     * Load invoices for calendar
     * @param {number} month - Month (0-indexed)
     * @param {number} year - Year
     */
    loadInvoices: function(month, year) {
        // Update current year state
        this.state.currentYear = year;

        InvoiceAPI.getFiltered(
            { year },
            (response) => this._handleInvoicesResponse(response),
            (error) => this._handleInvoicesError(error)
        );
    },

    /**
     * Handle invoices API response
     * @private
     */
    _handleInvoicesResponse: function(response) {
        // DEBUG: Log raw response
        console.log('📅 CALENDAR - Raw API Response:', response);

        ApiClient.handleResponse(response, {
            onOk: (data) => {
                // DEBUG: Log what we received after handleResponse
                console.log('📅 CALENDAR - Data received (response.Message):', data);
                console.log('📅 CALENDAR - First invoice sample:', data[0]);
                console.log('📅 CALENDAR - First invoice StatusCode:', data[0]?.StatusCode);

                this.updateEvents(data);
            },
            onKo: (message) => {
                console.error('Failed to load invoices:', message);
                UI.showPopup('Errore', 'Impossibile caricare le fatture', { type: 'error' });
            }
        });
    },

    /**
     * Handle invoices error
     * @private
     */
    _handleInvoicesError: function(error) {
        console.error('Invoice load error:', error);
        UI.showPopup('Errore di Connessione', 'Impossibile caricare le fatture', { type: 'error' });
    },

    /**
     * Update calendar events
     * @param {Array} invoices - Array of invoice objects
     */
    updateEvents: function(invoices) {
        if (!this.instance) {
            console.error('Calendar not initialized');
            return;
        }

        // Build events array
        const events = this._buildEvents(invoices);

        // Clear existing events
        this.instance.removeAllEvents();

        // Add new events
        this.instance.addEventSource(events);
    },

    /**
     * Build calendar events from invoices
     * @private
     * @param {Array} invoices - Array of invoice objects
     * @returns {Array} Array of calendar event objects
     */
    _buildEvents: function(invoices) {
        console.log('📅 CALENDAR - _buildEvents called with:', invoices);

        if (!notEmptyArray(invoices)) {
            console.log('📅 CALENDAR - No invoices to build events from');
            return [];
        }

        console.log(`📅 CALENDAR - Building ${invoices.length} events`);

        return invoices.map((item, index) => {
            const invoice = item.Invoice;

            // ROBUST: Get StatusCode with fallbacks for different scenarios
            // 1. Try item.StatusCode (PascalCase)
            // 2. Try item.statusCode (camelCase - in case of JSON serialization settings)
            // 3. Convert to string (in case it's a number)
            // 4. Default to undefined
            let rawStatusCode = item.StatusCode ?? item.statusCode;

            // Convert to string to ensure proper comparison
            const statusCode = rawStatusCode !== null && rawStatusCode !== undefined
                ? String(rawStatusCode)
                : undefined;

            // FIX: Map StatusCode to CSS class names (calendar.css lines 1207-1218)
            // CSS classes already exist with !important rules that override inline styles
            const statusClassMap = {
                '0': 'event-paid',      // Saldata (Paid) → Green (#28a745)
                '1': 'event-pending',   // Non Saldata (Unpaid) → Yellow (#ffc107)
                '2': 'event-overdue'    // Scaduta (Overdue) → Red (#dc3545)
            };

            const eventClass = statusClassMap[statusCode] || 'event-paid';  // Default to paid

            // DEBUG: Log each invoice's status processing
            console.log(`📅 Invoice #${index + 1} (ID:${invoice.InvoiceID}):`, {
                invoiceNumber: invoice.InvoiceNumber,
                dueDate: invoice.InvoiceDueDate,
                statusCode: statusCode,
                cssClass: eventClass,
                expectedColor: statusClassMap[statusCode] ? 'CSS class color' : 'default green'
            });

            return {
                title: `${invoice.Customer.CustomerName} - ${formatCurrency(invoice.InvoiceDue)}`,
                start: invoice.InvoiceDueDate.split('T')[0],
                classNames: [eventClass],  // Use CSS class instead of backgroundColor
                borderColor: 'transparent',
                extendedProps: {
                    invoiceId: invoice.InvoiceID,
                    invoiceNumber: invoice.InvoiceNumber,
                    customerName: invoice.Customer.CustomerName,
                    statusCode: statusCode
                }
            };
        });
    },

    /**
     * Handle calendar event click
     * @private
     * @param {Object} info - FullCalendar event info
     */
    _handleEventClick: function(info) {
        const invoiceId = info.event.extendedProps.invoiceId;
        
        if (invoiceId) {
            // Show invoice detail
            Invoices.showDetail(invoiceId);
        }
    },

    /**
     * Handle calendar date range change (navigation)
     * @private
     * @param {Object} dateInfo - FullCalendar date info
     */
    _handleDatesSet: function(dateInfo) {
        const startDate = dateInfo.start;
        const month = startDate.getMonth();
        const year = startDate.getFullYear();

        console.log(`Calendar navigated to: ${month + 1}/${year}`);

        // Smart reload: Only reload if year changed
        if (this.state.currentYear !== null && this.state.currentYear !== year) {
            console.log(`Year changed from ${this.state.currentYear} to ${year}, reloading invoices...`);
            this.state.currentYear = year;
            this.loadInvoices(month, year);
        }
    },

    /**
     * Navigate to today
     */
    goToToday: function() {
        if (this.instance) {
            this.instance.today();
        }
    },

    /**
     * Navigate to specific date
     * @param {Date} date - Date to navigate to
     */
    goToDate: function(date) {
        if (this.instance) {
            this.instance.gotoDate(date);
        }
    },

    /**
     * Change calendar view
     * @param {string} viewName - View name ('dayGridMonth', 'timeGridWeek', 'timeGridDay')
     */
    changeView: function(viewName) {
        if (this.instance) {
            this.instance.changeView(viewName);
        }
    },

    /**
     * Refresh calendar (refetch events)
     */
    refresh: function() {
        if (this.instance) {
            const { month, year } = getCurrentDateInfo();
            this.loadInvoices(month, year);
        }
    },

    /**
     * Destroy calendar instance
     */
    destroy: function() {
        if (this.instance) {
            this.instance.destroy();
            this.instance = null;
        }
    }
};

// Export Calendar module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Calendar };
}
