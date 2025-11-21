// ====================================
// APPLICATION CONFIGURATION
// ====================================

/**
 * API Endpoints configuration
 * Centralized endpoint definitions for all backend services
 */
const API = {
    base: '/Services',
    
    auth: {
        login: '/Services/Login.ashx'
    },
    
    invoices: {
        createOrUpdate: '/Services/InvoiceHandlers/CreateOrUpdateInvoice.ashx',
        getByIdDTO: '/Services/InvoiceHandlers/GetInvoiceByID_DTO.ashx',
        getFiltered: '/Services/InvoiceHandlers/GetInvoices.ashx',
        byMonthDTO: '/Services/InvoiceHandlers/GetInvoiceByMonthDTO.ashx',
        years: '/Services/InvoiceHandlers/InvoiceYears.ashx',
        delete: '/Services/InvoiceHandlers/DeleteInvoice.ashx',
        restore: '/Services/InvoiceHandlers/RestoreInvoice.ashx',
        hardDelete: '/Services/InvoiceHandlers/HardDeleteInvoice.ashx',
        batchHardDelete: '/Services/InvoiceHandlers/BatchHardDeleteInvoices.ashx'
    },
    
    customers: {
        all: '/Services/CustomerHandlers/GetAllCustomers.ashx',
        byId: '/Services/CustomerHandlers/GetCustomerByID.ashx',
        search: '/Services/CustomerHandlers/SearchCustomer.ashx',
        startsWith: '/Services/CustomerHandlers/StartWithCustomerName.ashx',
        filterByName: '/Services/CustomerHandlers/FilterByNameCustomers.ashx',
        createOrUpdate: '/Services/CustomerHandlers/CreateOrUpdateCustomer.ashx',
        delete: '/Services/CustomerHandlers/DeleteCustomer.ashx'
    },
    
    statuses: {
        all: '/Services/StatusHandlers/GetAllStatuses.ashx',
        byId: '/Services/StatusHandlers/GetStatusByID.ashx'
    },

    users: {
        all: '/Services/UserHandlers/GetAllUsers.ashx',
        create: '/Services/UserHandlers/CreateUser.ashx',
        delete: '/Services/UserHandlers/DeleteUser.ashx',
        resetPassword: '/Services/UserHandlers/ResetPassword.ashx'
    }
};

/**
 * View IDs for navigation
 */
const VIEWS = {
    LOGIN: 'login-view',
    CALENDAR: 'calendar-view',
    INVOICE_LIST: 'invoice-list',
    INVOICE_CREATION: 'invoice-creation',
    CUSTOMERS: 'customers-view',
    USERS: 'users-view',
    DELETED_INVOICES: 'deleted-invoices'
};

/**
 * Invoice status configuration
 * Maps status codes to their visual representation
 */
const INVOICE_STATUS = {
    PAID: {
        code: '0',
        label: 'Saldata',
        badgeClass: 'success',
        backgroundColor: 'green',  // Changed from #d4edda to CSS named color
        textColor: 'white'
    },
    UNPAID: {
        code: '1',
        label: 'Non Saldata',
        badgeClass: 'warning',
        backgroundColor: 'yellow',  // Changed from #fff3cd to CSS named color
        textColor: 'black'
    },
    OVERDUE: {
        code: '2',
        label: 'Scaduta',
        badgeClass: 'danger',
        backgroundColor: 'red',  // Changed from #f8d7da to CSS named color
        textColor: 'white'
    }
};

/**
 * Get status configuration by code
 * @param {string} statusCode - Status code ('0', '1', '2')
 * @returns {Object} Status configuration object
 */
const getStatusConfig = (statusCode) => {
    const statusMap = {
        '0': INVOICE_STATUS.PAID,
        '1': INVOICE_STATUS.UNPAID,
        '2': INVOICE_STATUS.OVERDUE
    };

    const config = statusMap[statusCode] || {
        code: statusCode,
        label: 'Sconosciuto',
        badgeClass: 'secondary',
        backgroundColor: '#ffffff',
        textColor: 'black'
    };

    return config;
};

/**
 * Response codes from backend
 */
const RESPONSE_CODES = {
    OK: 'Ok',
    KO: 'Ko',
    OUT: 'OUT' // Session expired/invalid token
};

/**
 * Local storage keys
 */
const STORAGE_KEYS = {
    USERNAME: 'username',
    TOKEN: 'token',
    TOKEN_TIMESTAMP: 'token_timestamp',
    ROLE: 'role'  // User role (Admin, User, Visitor) for account display
};

/**
 * Pagination settings
 */
const PAGINATION = {
    DEFAULT_ITEMS_PER_PAGE: 15,
    ITEMS_PER_PAGE_OPTIONS: [15, 30, 50, 100],
    MAX_VISIBLE_PAGES: 5
};

/**
 * Export configuration objects
 */
// ES6 Module Export (Commented out - only works with type="module")
// export {
//     API,
//     VIEWS,
//     INVOICE_STATUS,
//     getStatusConfig,
//     RESPONSE_CODES,
//     STORAGE_KEYS,
//     PAGINATION
// };
