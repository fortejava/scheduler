// ====================================
// ES6 MODULE IMPORTS (COMMENTED OUT - REVERTED TO SCRIPT TAGS)
// ====================================
/*
 * NOTE: ES6 module conversion was attempted but reverted due to complexity.
 *
 * ISSUE: Simply adding exports wasn't enough. Each module file needs to import
 * its own dependencies, not just export. For example:
 * - ui.js uses formatDate, escapeHtml from utils.js → needs to import them
 * - invoices.js uses API, UI, Utils → needs to import them
 * - etc. for all 12 custom files
 *
 * CURRENT APPROACH: Load files as regular scripts in dependency order (see Index.html)
 *
 * FUTURE: Proper ES6 conversion requires:
 * 1. Add import statements to EACH file for its dependencies
 * 2. Remove global variable assignments
 * 3. Test each module individually
 * 4. Handle circular dependencies
 * 5. Use bundler (Webpack/Vite) for production
 *
 * See ES6_MODULE_CONVERSION_FUTURE.md for detailed plan.
 */

/*
// Import configuration
import {
    API,
    VIEWS,
    INVOICE_STATUS,
    getStatusConfig,
    RESPONSE_CODES,
    STORAGE_KEYS,
    PAGINATION
} from './core/config.js';

// Import API clients
import {
    ApiClient,
    AuthAPI,
    InvoiceAPI,
    CustomerAPI,
    StatusAPI,
    UserAPI
} from './core/api.js';

// Import authentication
import { Auth } from './core/auth.js';

// Import utilities
import {
    notEmptyString,
    notEmptyArray,
    formatDate,
    parseFormattedDate,
    toISODate,
    safeJSONParse,
    debounce,
    escapeHtml,
    containsHtmlTags,
    generateUniqueId,
    deepClone,
    getCurrentDateInfo,
    compareDates,
    isDateInPast,
    formatCurrency,
    formatCurrencyCompact,
    truncateName,
    safeLog,
    InvoiceLogger,
    calculatePercentage,
    isValidEmail,
    getQueryParams
} from './utils/utils.js';

import { UI } from './utils/ui.js';
import { AutocompleteCustomer } from './utils/autocomplete-utils.js';
import { TooltipManager } from './utils/tooltip-manager.js';

// Import feature modules
import { Invoices } from './modules/invoices.js';
import { Customers } from './modules/customers.js';
import { Users } from './modules/users.js';
import { Calendar } from './modules/calendar.js';
import { DeletedInvoices } from './modules/deleted-invoices.js';
*/

// ====================================
// APPLICATION INITIALIZATION
// ====================================
// All modules are loaded via script tags in Index.html and available globally

/**
 * Main Application Controller
 * Initializes the app and wires up event handlers
 */
const App = {
    /**
     * Initialize application on page load
     */
    initialize: function() {
        console.log('Initializing Invoice Management System...');

        // EMERGENCY CLEANUP: Remove any orphaned modal backdrops from previous session
        UI.cleanupModalBackdrops();

        // Attempt autologin
        this._attemptAutologin();

        // Wire up event handlers
        this._wireEventHandlers();
    },

    /**
     * Attempt autologin with stored credentials
     * @private
     */
    _attemptAutologin: function() {
        Auth.attemptAutologin(
            () => {},
            () => {}
        );
    },

    /**
     * Wire up all event handlers
     * @private
     */
    _wireEventHandlers: function() {
        // Authentication
        this._wireAuthHandlers();

        // Navigation
        this._wireNavigationHandlers();

        // Invoice
        this._wireInvoiceHandlers();

        // Customer
        this._wireCustomerHandlers();

        // Calendar
        this._wireCalendarHandlers();
    },

    /**
     * Wire authentication event handlers
     * @private
     */
    _wireAuthHandlers: function() {
        // Login form submit
        const loginForm = document.forms.loginForm;
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => Auth.handleLoginFormSubmit(e));
        }

        // Logout button (if exists)
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => Auth.logout());
        }
    },

    /**
     * Wire navigation event handlers
     * @private
     */
    _wireNavigationHandlers: function() {
        // Calendar navigation
        const navCalendar = document.getElementById('nav-calendar');
        if (navCalendar) {
            navCalendar.addEventListener('click', (e) => {
                e.preventDefault();
                Calendar.show();
            });
        }

        // Invoice list navigation
        const navInvoiceList = document.getElementById('nav-invoice-list');
        if (navInvoiceList) {
            navInvoiceList.addEventListener('click', (e) => {
                e.preventDefault();
                Invoices.showList();
            });
        }

        // Create invoice navigation
        const navCreateInvoice = document.getElementById('nav-create-invoice');
        if (navCreateInvoice) {
            navCreateInvoice.addEventListener('click', (e) => {
                e.preventDefault();
                Invoices.showCreate();
            });
        }

        // Customers navigation
        const navCustomers = document.getElementById('nav-customers');
        if (navCustomers) {
            navCustomers.addEventListener('click', (e) => {
                e.preventDefault();
                Customers.showList();
            });
        }
    },

    /**
     * Wire invoice event handlers
     * @private
     */
    _wireInvoiceHandlers: function() {
        // Invoice creation/edit form
        const invoiceForm = document.forms.createInvoice;
        if (invoiceForm) {
            // MODERN APPROACH: Use addEventListener instead of inline handlers
            invoiceForm.addEventListener('submit', (e) => Invoices.handleFormSubmit(e));

            // Auto-calculate totals when taxable or tax changes
            const taxableInput = document.getElementById('InvoiceTaxable');
            const taxInput = document.getElementById('InvoiceTax');

            if (taxableInput) {
                taxableInput.addEventListener('input', () => Invoices.updateTotals());
            }
            if (taxInput) {
                taxInput.addEventListener('input', () => Invoices.updateTotals());
            }
        }

        // Edit mode toggle
        const editModeToggle = document.getElementById('enableEditMode');
        if (editModeToggle) {
            editModeToggle.addEventListener('change', () => Invoices.toggleEditMode());
        }

        // Invoice filters
        const invoiceSearch = document.getElementById('invoice-search');
        if (invoiceSearch) {
            invoiceSearch.addEventListener('input', debounce(() => Invoices.applyFilters(), 300));
        }

        const filterElements = [
            'month-filter',
            'year-filter',
            'status-filter',
            'customer-filter'
        ];

        filterElements.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', () => Invoices.applyFilters());
            }
        });

        // Clear filters button
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => Invoices.clearFilters());
        }
    },

    /**
     * Wire customer event handlers
     * @private
     */
    _wireCustomerHandlers: function() {
        // Customer search
        const customerSearch = document.getElementById('customer-search');
        if (customerSearch) {
            customerSearch.addEventListener('input', debounce(() => Customers.search(), 300));
        }

        // Add customer form
        const addCustomerForm = document.forms.addCustomer;
        if (addCustomerForm) {
            addCustomerForm.addEventListener('submit', (e) => Customers.add(e));
        }
    },

    /**
     * Wire calendar event handlers
     * @private
     */
    _wireCalendarHandlers: function() {
        // Calendar refresh button (if exists)
        const refreshCalendarBtn = document.getElementById('refresh-calendar-btn');
        if (refreshCalendarBtn) {
            refreshCalendarBtn.addEventListener('click', () => Calendar.refresh());
        }

        // Calendar view change buttons (if exist)
        const monthViewBtn = document.getElementById('calendar-month-view');
        if (monthViewBtn) {
            monthViewBtn.addEventListener('click', () => Calendar.changeView('dayGridMonth'));
        }

        const weekViewBtn = document.getElementById('calendar-week-view');
        if (weekViewBtn) {
            weekViewBtn.addEventListener('click', () => Calendar.changeView('timeGridWeek'));
        }

        const dayViewBtn = document.getElementById('calendar-day-view');
        if (dayViewBtn) {
            dayViewBtn.addEventListener('click', () => Calendar.changeView('timeGridDay'));
        }
    },

    /**
     * Handle global errors
     * @private
     */
    _setupErrorHandling: function() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            // Optionally show user-friendly error message
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    }
};

// ====================================
// GLOBAL FUNCTION PROXIES
// ====================================
// These functions maintain backward compatibility with inline HTML event handlers

/**
 * Show calendar view
 * @deprecated Use Calendar.show() instead
 */
function showCalendarView() {
    Calendar.show();
}

/**
 * Show invoice list
 * @deprecated Use Invoices.showList() instead
 */
function showInvoicesList() {
    Invoices.showList();
}

/**
 * Show create invoice form
 * @deprecated Use Invoices.showCreate() instead
 */
function showCreateInvoice() {
    Invoices.showCreate();
}

/**
 * Show invoice detail
 * @param {number} invoiceId - Invoice ID
 * @deprecated Use Invoices.showDetail() instead
 */
function showInvoiceDetail(invoiceId) {
    Invoices.showDetail(invoiceId);
}

/**
 * Delete invoice
 * @param {number} invoiceId - Invoice ID
 * @deprecated Use Invoices.confirmDelete() instead
 */
function deleteInvoice(invoiceId) {
    Invoices.confirmDelete(invoiceId);
}

/**
 * Show customers view
 * @deprecated Use Customers.showList() instead
 */
function showCustomersView() {
    Customers.showList();
}

/**
 * Show users view (Admin only)
 */
function showUsersView() {
    Users.initialize();
}

/**
 * Show deleted invoices view
 * @deprecated Use DeletedInvoices.showList() instead
 */
function showDeletedInvoices() {
    DeletedInvoices.showList();
}

/**
 * Edit customer
 * @param {number} index - Customer index
 * @deprecated Use Customers.edit() instead
 */
function editCustomer(index) {
    Customers.edit(index);
}

/**
 * Save customer
 * @param {number} index - Customer index
 * @deprecated Use Customers.save() instead
 */
function saveCustomer(index) {
    Customers.save(index);
}

/**
 * Cancel customer edit
 * @param {number} index - Customer index
 * @deprecated Use Customers.cancel() instead
 */
function cancelCustomer(index) {
    Customers.cancel(index);
}

/**
 * Delete customer
 * @param {number} index - Customer index
 * @deprecated Use Customers.confirmDelete() instead
 */
function deleteCustomer(index) {
    Customers.confirmDelete(index);
}

/**
 * Filter customers
 * @deprecated Use Customers.search() instead
 */
function filterCustomers() {
    Customers.search();
}

/**
 * Search customers
 * @deprecated Use Customers.search() instead
 */
function searchCustomers() {
    Customers.search();
}

/**
 * Toggle edit mode for invoice
 * @deprecated Use Invoices.toggleEditMode() instead
 */
function toggleEditMode() {
    Invoices.toggleEditMode();
}

/**
 * Update invoice totals
 * @deprecated Use Invoices.updateTotals() instead
 */
function updateInvoiceCreation() {
    Invoices.updateTotals();
}

/**
 * Filter invoices
 * @deprecated Use Invoices.applyFilters() instead
 */
function filterInvoices() {
    Invoices.applyFilters();
}

/**
 * Clear invoice filters
 * @deprecated Use Invoices.clearFilters() instead
 */
function clearFilters() {
    Invoices.clearFilters();
}

/**
 * Sort invoice table
 * @param {string} column - Column to sort by
 * @deprecated Use Invoices.sort() instead
 */
function sortTable(column) {
    Invoices.sort(column);
}

/**
 * Change invoice list page
 * @param {number} page - Page number
 * @deprecated Use Invoices.changePage() instead
 */
function changePage(page) {
    Invoices.changePage(page);
}

/**
 * Change items per page
 * @param {number} value - Items per page
 * @deprecated Use Invoices.changeItemsPerPage() instead
 */
function changeItemsPerPage(value) {
    Invoices.changeItemsPerPage(value);
}

/**
 * Confirm delete invoice
 * @param {number} invoiceId - Invoice ID
 * @deprecated Use Invoices.confirmDelete() instead
 */
function confirmDeleteInvoice(invoiceId) {
    Invoices.confirmDelete(invoiceId);
}

/**
 * Login function
 * @param {string} username - Username
 * @param {string} token - Token
 * @param {Event} event - Event object
 * @deprecated Use Auth.login() instead
 */
function doLogin(username, token, event) {
    if (username && token) {
        Auth.login({ username, token }, true, event);
    } else {
        Auth.handleLoginFormSubmit(event);
    }
}

/**
 * Logout function
 * @deprecated Use Auth.logout() instead
 */
function doLogout() {
    Auth.logout();
}

/**
 * Create invoice function
 * @param {Event} event - Form submit event
 * @deprecated Use Invoices.handleFormSubmit() instead
 */
function createInvoiceFunction(event) {
    Invoices.handleFormSubmit(event);
}

/**
 * Add customer function
 * @param {Event} event - Form submit event
 * @deprecated Use Customers.add() instead
 */
function addCustomerFunction(event) {
    Customers.add(event);
}

/**
 * Show popup
 * @param {string} title - Popup title
 * @param {string} message - Popup message
 * @deprecated Use UI.showPopup() instead
 */
function showPopup(title, message) {
    UI.showPopup(title, message);
}

/**
 * Show view
 * @param {string} viewId - View ID
 * @deprecated Use UI.showView() instead
 */
function showView(viewId) {
    UI.showView(viewId);
}

/**
 * Set active menu item
 * @param {string} menuItemId - Menu item ID
 * @deprecated Use UI.setActiveMenuItem() instead
 */
function setActiveMenuItem(menuItemId) {
    UI.setActiveMenuItem(menuItemId);
}

/**
 * Show user profile page
 * Future feature: User profile management (change password, edit info, etc.)
 * Currently shows a placeholder message
 */
function showProfile() {
    UI.showPopup(
        'Profilo Utente',
        'Funzionalità in arrivo! Qui potrai modificare i tuoi dati personali e cambiare la password.',
        { type: 'info' }
    );
}

// ====================================
// APPLICATION ENTRY POINT
// ====================================

/**
 * Initialize application when DOM is ready
 */
window.addEventListener('DOMContentLoaded', () => {
    App.initialize();
});

/**
 * Alternative: Initialize on window load (after all resources loaded)
 * Uncomment if needed:
 */
// window.addEventListener('load', () => {
//     App.initialize();
// });

// Export App module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App };
}
