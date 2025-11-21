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
                right: 'dayGridMonth,dayGridWeek,dayGridDay'
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

            // View-specific event limits (instead of global dayMaxEvents)
            views: {
                dayGridMonth: {
                    dayMaxEventRows: 4   // Month: 4 events per day (compact view)
                },
                dayGridWeek: {
                    dayMaxEventRows: 20  // Week: 20 events per day column (more vertical space)
                },
                dayGridDay: {
                    dayMaxEventRows: 30  // Day: 30 events (plenty of vertical space)
                }
            },

            // Customize event display based on view
            // Day view: Show FULL customer name and EXACT amount (€1,100.00)
            // Week/Month views: Show COMPACT format (truncated name + compact amount)
            eventContent: function(arg) {
                const view = arg.view.type;
                const props = arg.event.extendedProps;

                // Day view: Show full information (plenty of horizontal space)
                if (view === 'dayGridDay') {
                    return {
                        html: `
                            <div class="fc-event-main-frame">
                                <div class="fc-event-title-container">
                                    <div class="fc-event-title fc-sticky">
                                        ${props.customerName} - ${props.exactAmount}
                                    </div>
                                </div>
                            </div>
                        `
                    };
                }

                // ✅ FIX: Week/Month views - Return custom HTML to ensure text renders
                // Use event.title which contains: truncated name + compact amount
                // Example: "Test70Inv... - €1.2K"
                return {
                    html: `
                        <div class="fc-event-main-frame">
                            <div class="fc-event-title-container">
                                <div class="fc-event-title">
                                    ${arg.event.title}
                                </div>
                            </div>
                        </div>
                    `
                };
            },

            events: [],
            eventClick: (info) => this._handleEventClick(info),
            eventDidMount: (info) => this._handleEventMount(info),
            dayCellDidMount: (info) => this._handleDayCellMount(info),
            datesSet: (dateInfo) => this._handleDatesSet(dateInfo)
        });

        this.instance.render();

        // ============================================================================
        // INTELLIGENT POPOVER POSITIONING - MUTATIONOBSERVER APPROACH
        // ============================================================================
        // Strategy: Watch DOM for popover creation, then reposition it intelligently
        // This doesn't interfere with FullCalendar's internal logic
        // ============================================================================

        // Store last clicked day cell for repositioning
        let lastClickedDayCell = null;
        let lastClickTime = 0;
        let isRepositioning = false;  // Lock to prevent closes during repositioning

        // Listen for "+N more" link clicks to capture day cell
        const calendarElement = document.getElementById('calendar');
        if (calendarElement) {
            calendarElement.addEventListener('click', (e) => {
                const moreLinkElement = e.target.closest('.fc-more-link');
                if (moreLinkElement) {
                    lastClickTime = Date.now();
                    lastClickedDayCell = moreLinkElement.closest('.fc-daygrid-day');
                }
            }, true); // Use capture phase
        }

        // Block OUTSIDE clicks from closing the popover (surgical approach)
        document.addEventListener('click', (e) => {
            const popover = document.querySelector('.fc-more-popover');

            // Block ALL clicks during repositioning (critical protection)
            if (isRepositioning) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            if (popover) {
                // Check if click is OUTSIDE both popover and "+N more" link
                const clickInsidePopover = popover.contains(e.target);
                const clickOnMoreLink = e.target.closest('.fc-more-link');
                const clickOnCloseButton = e.target.closest('.fc-popover-close');

                // Allow close button to work
                if (clickOnCloseButton) {
                    return;
                }

                // Block clicks OUTSIDE popover (except on "+N more" link to open it)
                if (!clickInsidePopover && !clickOnMoreLink) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
            }
        }, true);

        // MutationObserver to watch for popover creation
        const popoverObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    // Check if added node is the popover or contains it
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const popover = node.classList?.contains('fc-more-popover')
                            ? node
                            : node.querySelector?.('.fc-more-popover');

                        if (popover) {
                            // Check if this popover was created within last 500ms (from our click)
                            const timeSinceClick = Date.now() - lastClickTime;

                            if (timeSinceClick < 500 && lastClickedDayCell) {
                                // Delay to let FullCalendar finish initialization (prevent immediate close)
                                setTimeout(() => {
                                    // Check if popover still exists (not closed)
                                    if (document.body.contains(popover)) {
                                        repositionPopover(popover, lastClickedDayCell);
                                    }
                                }, 150);  // Wait 150ms for FullCalendar initialization
                            }
                        }
                    }
                });
            });
        });

        // Function to reposition popover intelligently
        function repositionPopover(popover, dayCell) {
            // Enable repositioning lock to prevent closes
            isRepositioning = true;

            // CRITICAL: Move popover to document.body to remove parent interference
            if (popover.parentElement && popover.parentElement !== document.body) {
                document.body.appendChild(popover);

                // CRITICAL FIX: After moving to body, CSS rule .fc .fc-more-popover no longer applies
                // Must explicitly set ALL styles that were in .fc .fc-more-popover in JavaScript

                // 1. Position: fixed
                popover.style.setProperty('position', 'fixed', 'important');

                // 2. Background color (white, not transparent)
                popover.style.setProperty('background-color', '#ffffff', 'important');

                // 3. Max-height (40% of viewport OR 500px max - more compact & professional)
                const maxHeight = Math.min(Math.floor(window.innerHeight * 0.4), 500);
                popover.style.setProperty('max-height', maxHeight + 'px', 'important');
                popover.style.setProperty('min-height', '200px', 'important');

                // 4. Popover body scrolling
                const popoverBody = popover.querySelector('.fc-popover-body');
                if (popoverBody) {
                    const bodyMaxHeight = maxHeight - 60; // Subtract header height
                    popoverBody.style.setProperty('max-height', bodyMaxHeight + 'px', 'important');
                    popoverBody.style.setProperty('overflow-y', 'auto', 'important');
                    popoverBody.style.setProperty('overflow-x', 'hidden', 'important');
                    popoverBody.style.setProperty('background-color', '#ffffff', 'important');
                }

                // 5. Other critical styles
                popover.style.setProperty('border-radius', '8px', 'important');
                popover.style.setProperty('box-shadow', '0 4px 16px rgba(0, 0, 0, 0.2)', 'important');
                popover.style.setProperty('border', '1px solid #ddd', 'important');
                popover.style.setProperty('z-index', '9999', 'important');
            }

            // Get current positions (viewport-relative with fixed positioning)
            const dayCellRect = dayCell.getBoundingClientRect();
            const popoverRect = popover.getBoundingClientRect();

            const popoverHeight = popoverRect.height;
            const viewportHeight = window.innerHeight;

            // Calculate available space (viewport-relative, no scrollTop needed with fixed positioning)
            const spaceBelow = viewportHeight - dayCellRect.bottom;
            const spaceAbove = dayCellRect.top;

            // Determine if we should position above or below
            const shouldPositionAbove = spaceBelow < popoverHeight + 20 && spaceAbove > spaceBelow;

            // Calculate new position (viewport-relative with position: fixed)
            let newTop;
            if (shouldPositionAbove) {
                // Position ABOVE the day cell
                newTop = dayCellRect.top - popoverHeight - 10;
            } else {
                // Position BELOW the day cell (default)
                newTop = dayCellRect.bottom + 10;
            }

            // Ensure popover doesn't go off-screen vertically
            const minTop = 10;
            const maxTop = viewportHeight - popoverHeight - 10;
            newTop = Math.max(minTop, Math.min(newTop, maxTop));

            // Calculate horizontal position (keep centered on day cell)
            let newLeft = dayCellRect.left + (dayCellRect.width / 2) - (popoverRect.width / 2);

            // Ensure popover doesn't go off-screen horizontally
            const minLeft = 10;
            const maxLeft = window.innerWidth - popoverRect.width - 10;
            newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));

            // Apply new position with !important via style.setProperty
            // CRITICAL: Use 'inset' shorthand (not individual top/left) to match FullCalendar
            // inset syntax: top right bottom left
            const insetValue = `${newTop}px auto auto ${newLeft}px`;

            // Use 'inset' shorthand to override FullCalendar's inline 'inset' property
            popover.style.setProperty('inset', insetValue, 'important');

            // CRITICAL: Force remove any transforms that might offset position
            popover.style.setProperty('transform', 'none', 'important');
            popover.style.setProperty('translate', 'none', 'important');

            // Show popover with smooth fade-in (prevents initial flash)
            popover.style.setProperty('opacity', '1', 'important');

            // Verify position was applied and watch for changes
            setTimeout(() => {
                // Watch for FullCalendar trying to reposition
                watchPopoverPosition(popover, newTop, newLeft);

                // NUCLEAR OPTION: Continuous position enforcement
                // Force correct position every 100ms to prevent ANY repositioning
                let enforcementCount = 0;
                const maxEnforcements = 30; // Run for 3 seconds (30 * 100ms)
                const positionEnforcer = setInterval(() => {
                    enforcementCount++;

                    if (!document.body.contains(popover) || enforcementCount > maxEnforcements) {
                        clearInterval(positionEnforcer);
                        return;
                    }

                    // Continuously force correct position AND positioning mode AND styles
                    popover.style.setProperty('position', 'fixed', 'important');  // CRITICAL!
                    popover.style.setProperty('inset', insetValue, 'important');
                    popover.style.setProperty('transform', 'none', 'important');
                    popover.style.setProperty('translate', 'none', 'important');

                    // Also enforce background and max-height (prevents FullCalendar override)
                    popover.style.setProperty('background-color', '#ffffff', 'important');
                    const currentMaxHeight = Math.min(Math.floor(window.innerHeight * 0.4), 500);
                    popover.style.setProperty('max-height', currentMaxHeight + 'px', 'important');
                }, 100);

                // Release repositioning lock after verification
                // Extended to 300ms to prevent delayed close events
                setTimeout(() => {
                    isRepositioning = false;
                }, 300);
            }, 50);

            // STEP 3A: Block clicks INSIDE popover from bubbling (except close button)
            popover.addEventListener('click', (e) => {
                // Allow close button to work
                if (!e.target.closest('.fc-popover-close')) {
                    e.stopPropagation();
                }
            }, true);

            // STEP 3B: Block ESC key from closing popover
            const escHandler = (e) => {
                if (e.key === 'Escape' || e.key === 'Esc') {
                    const stillExists = document.body.contains(popover);
                    if (stillExists) {
                        e.stopPropagation();
                        e.preventDefault();
                    } else {
                        // Popover closed, remove handler
                        document.removeEventListener('keydown', escHandler, true);
                    }
                }
            };
            document.addEventListener('keydown', escHandler, true);
        }

        // Watch for any attempts to reposition the popover and restore our position
        function watchPopoverPosition(popover, correctTop, correctLeft) {
            const correctInset = `${correctTop}px auto auto ${correctLeft}px`;

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        // Parse current inset value (format: "top right bottom left")
                        const currentRect = popover.getBoundingClientRect();

                        // If position changed significantly (more than 5px), restore it
                        if (Math.abs(currentRect.top - correctTop) > 5 || Math.abs(currentRect.left - correctLeft) > 5) {
                            popover.style.setProperty('inset', correctInset, 'important');
                        }
                    }
                });
            });

            observer.observe(popover, {
                attributes: true,
                attributeFilter: ['style']
            });

            // Stop watching when popover is closed (removed from DOM)
            const removalObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.removedNodes.forEach((node) => {
                        if (node === popover || node.contains(popover)) {
                            observer.disconnect();
                            removalObserver.disconnect();
                        }
                    });
                });
            });

            removalObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // Start observing DOM for popover creation
        popoverObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
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
        ApiClient.handleResponse(response, {
            onOk: (data) => {
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

        // Filter/limit events based on current view (week/day views have 30-event limit)
        const filteredEvents = this._filterEventsForView(events);

        // Clear existing events
        this.instance.removeAllEvents();

        // Add new events
        this.instance.addEventSource(filteredEvents);
    },

    /**
     * Build calendar events from invoices
     * @private
     * @param {Array} invoices - Array of invoice objects
     * @returns {Array} Array of calendar event objects
     */
    _buildEvents: function(invoices) {
        if (!notEmptyArray(invoices)) {
            return [];
        }

        return invoices.map((item, index) => {
            const invoice = item.Invoice;

            // SECURITY: Validate InvoiceID is a valid positive integer
            const invoiceId = parseInt(invoice.InvoiceID, 10);
            if (!Number.isInteger(invoiceId) || invoiceId < 1) {
                InvoiceLogger.invalidId(invoice.InvoiceID);
                return null; // Skip this corrupted invoice (will be filtered out)
            }

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

            // OPTIMIZATION: Truncate customer name for compact calendar display (10 chars max)
            const truncatedName = truncateName(invoice.Customer.CustomerName, 10);

            // SECURITY: Defense-in-depth - escape user data even though FullCalendar auto-escapes
            // Protects against XSS if FullCalendar config changes or version updates
            const safeTruncatedName = escapeHtml(truncatedName);
            const safeFullCustomerName = escapeHtml(invoice.Customer.CustomerName);
            const safeInvoiceNumber = escapeHtml(invoice.InvoiceNumber);

            // OPTIMIZATION: Use compact currency format for calendar (€12.3K instead of €12,345.00)
            const compactAmount = formatCurrencyCompact(invoice.InvoiceDue);
            const exactAmount = formatCurrency(invoice.InvoiceDue);

            return {
                title: `${safeTruncatedName} - ${compactAmount}`,
                start: invoice.InvoiceDueDate.split('T')[0],
                classNames: [eventClass],  // Use CSS class instead of backgroundColor
                borderColor: 'transparent',
                extendedProps: {
                    invoiceId: invoiceId,  // Use validated integer
                    invoiceNumber: safeInvoiceNumber,  // Use escaped string
                    customerName: safeFullCustomerName,  // Full name for tooltip
                    truncatedName: safeTruncatedName,  // Truncated name for title
                    compactAmount: compactAmount,  // Compact format for title
                    exactAmount: exactAmount,  // Exact amount for tooltip
                    invoiceDue: invoice.InvoiceDue,  // Raw amount for calculations
                    statusCode: statusCode
                }
            };
        }).filter(event => event !== null); // Filter out invalid invoices
    },

    /**
     * Filter and limit events based on current view
     * @private
     * @param {Array} events - Array of calendar events
     * @returns {Array} Filtered array of events
     *
     * WEEK/DAY VIEW LIMITS:
     * - Maximum 30 events shown
     * - Smart sorting: Overdue (2) → Pending (1) → Paid (0)
     * - Warning message if events limited
     * - Guides users to "Elenco Fatture" for full list
     *
     * MONTH VIEW:
     * - No limit (uses dayMaxEvents: 4 configuration)
     * - All events returned
     */
    _filterEventsForView: function(events) {
        if (!events || events.length === 0) {
            return events;
        }

        // Get current view type
        const currentView = this.instance ? this.instance.view.type : 'dayGridMonth';

        // Month view: no limit (dayMaxEvents handles display)
        if (currentView === 'dayGridMonth') {
            return events;
        }

        // Week/Day views: apply 30-event limit with smart sorting
        const EVENT_LIMIT = 30;

        if (events.length <= EVENT_LIMIT) {
            // No limiting needed
            return events;
        }

        // SMART SORTING: Overdue → Pending → Paid
        // StatusCode: 0=Paid, 1=Pending, 2=Overdue
        const sortedEvents = [...events].sort((a, b) => {
            const priorityMap = { '2': 0, '1': 1, '0': 2 };  // Lower number = higher priority
            const aPriority = priorityMap[a.extendedProps.statusCode] ?? 3;
            const bPriority = priorityMap[b.extendedProps.statusCode] ?? 3;
            return aPriority - bPriority;
        });

        // Limit to first 30 (most urgent)
        const limitedEvents = sortedEvents.slice(0, EVENT_LIMIT);

        // REMOVED: Warning popup (2025-11-21)
        // Reason: Warning was showing incorrect count (entire year instead of current view)
        //         and triggering inappropriately when switching views
        // Note: 30-event limit still enforced for performance
        //       Users can access all events via popover "+N more" links
        /*
        const viewName = currentView === 'timeGridWeek' ? 'Settimana' : 'Giorno';
        UI.showPopup(
            'Troppe Fatture in Vista',
            `⚠️ Attenzione: ${events.length} fatture in questa vista ${viewName}!\n\n` +
            `Mostrando le ${EVENT_LIMIT} più urgenti (scadute e in sospeso).\n\n` +
            `Per visualizzare tutte le fatture, utilizzare "Elenco Fatture".`,
            { type: 'warning', duration: 5000 }
        );
        */

        return limitedEvents;
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
     * Handle event mount (add tooltips with full details)
     * @private
     * @param {Object} info - FullCalendar event mount info
     *
     * TOOLTIP BEHAVIOR:
     * - Desktop: Hover shows tooltip with full details
     * - Mobile: Tap shows tooltip (Tippy.js default behavior)
     * - Click opens invoice detail modal
     *
     * DISPLAYS:
     * - Full customer name (not truncated)
     * - Exact amount (€12,345.67 not €12.3K)
     * - Invoice number
     * - Status label with color
     */
    _handleEventMount: function(info) {
        const props = info.event.extendedProps;
        const statusConfig = getStatusConfig(props.statusCode);

        // Build tooltip content with full details
        const tooltipContent = `
            <div class="calendar-tooltip-loginet" style="text-align: left;">
                <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">
                    ${props.customerName}
                </div>
                <div style="margin-bottom: 4px; font-size: 13px;">
                    <strong>Fattura:</strong> ${props.invoiceNumber}
                </div>
                <div style="margin-bottom: 4px; font-size: 13px;">
                    <strong>Importo:</strong> ${props.exactAmount}
                </div>
                <div style="font-size: 13px;">
                    <strong>Stato:</strong>
                    <span class="badge bg-${statusConfig.badgeClass}" style="font-size: 11px;">
                        ${statusConfig.label}
                    </span>
                </div>
            </div>
        `;

        // Create tooltip using Tippy.js
        // On desktop: shows on hover
        // On mobile: shows on tap (user can tap outside to dismiss)
        tippy(info.el, {
            content: tooltipContent,
            allowHTML: true,
            theme: 'light-border',
            placement: 'top',
            arrow: true,
            animation: 'fade',
            duration: [200, 150],
            delay: [300, 0],  // 300ms delay on show, instant hide
            interactive: false,  // Tooltip disappears when mouse leaves
            appendTo: document.body  // Append to body to avoid z-index issues
        });
    },

    /**
     * Handle day cell mount (add navigation handlers)
     * @private
     * @param {Object} info - FullCalendar day cell info
     *
     * NAVIGATION BEHAVIOR:
     * - Single click day number (<a> tag): Opens day view immediately ⚡
     * - Double click TD cell (anywhere in cell): Opens day view 🎯
     * - Event clicks: Opens invoice detail (handled by eventClick callback) ✓
     *
     * UX IMPROVEMENTS:
     * - Fast access: Click day number directly
     * - Flexible access: Double-click anywhere in cell (useful when many events)
     * - Hover effect on day number indicates clickability
     * - Cursor changes to pointer
     * - Works on both desktop and mobile
     */
    _handleDayCellMount: function(info) {
        const dayCell = info.el;  // TD element
        const dayNumber = dayCell.querySelector('.fc-daygrid-day-number');

        if (!dayNumber) return;

        // ========================================
        // DAY NUMBER STYLING & HOVER EFFECTS
        // ========================================
        dayNumber.style.cursor = 'pointer';
        dayNumber.style.transition = 'all 0.2s ease';
        dayNumber.style.borderRadius = '4px';
        dayNumber.style.padding = '4px 8px';

        // Mouse enter: highlight
        dayNumber.addEventListener('mouseenter', () => {
            dayNumber.style.background = 'rgba(0, 44, 61, 0.1)';  // Loginet primary faded
            dayNumber.style.fontWeight = 'bold';
        });

        // Mouse leave: remove highlight
        dayNumber.addEventListener('mouseleave', () => {
            dayNumber.style.background = '';  // Remove inline style, let CSS take over
            dayNumber.style.fontWeight = '';  // Remove inline style
        });

        // ========================================
        // DAY NUMBER: SINGLE-CLICK HANDLER
        // ========================================
        // Click day number → Navigate immediately to day view
        dayNumber.addEventListener('click', (e) => {
            e.stopPropagation();  // Prevent bubbling to TD cell

            // Navigate to day view for this date
            // FIX: Use LOCAL methods (not UTC) because calendar uses 'local' timezone
            // Calendar has no timeZone setting, defaults to 'local', so use local methods
            const year = info.date.getFullYear();
            const month = String(info.date.getMonth() + 1).padStart(2, '0');
            const day = String(info.date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            this.instance.changeView('dayGridDay', dateStr);
        });

        // ========================================
        // TD CELL: DOUBLE-CLICK HANDLER
        // ========================================
        // Double-click anywhere in cell → Navigate to day view
        // EXCLUDES: Clicks on events (handled by eventClick callback)
        // EXCLUDES: Clicks on day number (handled above)
        let clickCount = 0;
        let clickTimer = null;

        dayCell.addEventListener('click', (e) => {
            // EXCLUDE: Clicks on events (let FullCalendar's eventClick handle it)
            if (e.target.closest('.fc-event')) {
                return;  // Don't count this click
            }

            // EXCLUDE: Clicks on day number (already handled above)
            if (e.target.closest('.fc-daygrid-day-number')) {
                return;  // Don't count this click
            }

            // HANDLE: Double-click on empty space in cell
            clickCount++;

            if (clickCount === 1) {
                // First click: start timer
                clickTimer = setTimeout(() => {
                    // Single click timeout: reset
                    clickCount = 0;
                }, 300);  // 300ms window for double-click
            } else if (clickCount === 2) {
                // Second click within 300ms: double-click detected
                clearTimeout(clickTimer);
                clickCount = 0;

                // Navigate to day view for this date
                // FIX: Use LOCAL methods (not UTC) because calendar uses 'local' timezone
                const year = info.date.getFullYear();
                const month = String(info.date.getMonth() + 1).padStart(2, '0');
                const day = String(info.date.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                this.instance.changeView('dayGridDay', dateStr);
            }
        });
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

        // Smart reload: Only reload if year changed
        if (this.state.currentYear !== null && this.state.currentYear !== year) {
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
// ES6 Module Export (Commented out - only works with type="module")
// export { Calendar };
