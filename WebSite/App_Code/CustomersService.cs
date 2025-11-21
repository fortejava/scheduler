using DBEngine;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for CustomersService
/// </summary>
public class CustomersService
{
    /// <summary>
    /// Create or update a customer.
    /// Throws ValidationException if validation fails.
    /// </summary>
    /// <param name="customer">Customer entity to save</param>
    /// <returns>Saved customer entity with ID</returns>
    /// <exception cref="ValidationException">Thrown when validation fails</exception>
    public static Customer CreateOrUpdate(Customer customer)
    {
        var errors = new List<string>();

        using (var db = new schedulerEntities())
        {
            // Validate customer
            ValidateCustomer(customer, db, errors);

            // Throw if validation failed
            if (errors.Count > 0)
            {
                throw new ValidationException(errors);
            }

            // Determine if CREATE or UPDATE
            Customer customerToSave;

            if (customer.CustomerID == 0 || customer.CustomerID == -1)
            {
                // CREATE: New customer
                customerToSave = new Customer
                {
                    CustomerName = customer.CustomerName
                };
            }
            else
            {
                // UPDATE: Existing customer
                customerToSave = db.Customers
                    .FirstOrDefault(c => c.CustomerID == customer.CustomerID);

                if (customerToSave == null)
                {
                    throw new ServiceException(string.Format("Cliente con ID {0} non trovato", customer.CustomerID));
                }

                // Update name
                customerToSave.CustomerName = customer.CustomerName;
            }

            // Save to database
            db.Customers.AddOrUpdate(customerToSave);
            db.SaveChanges(); // Let exceptions bubble up

            return customerToSave;
        }
    }

    /// <summary>
    /// Validate customer data.
    /// Collects all validation errors.
    /// </summary>
    private static void ValidateCustomer(Customer customer, schedulerEntities db, List<string> errors)
    {
        // Validation 1: CustomerName required
        if (string.IsNullOrWhiteSpace(customer.CustomerName))
        {
            errors.Add("CustomerName non può essere vuoto");
            return; // Stop here if name missing
        }

        // Validation 2: Reject HTML/script tags (XSS prevention - SECOND GUARDRAIL)
        // First guardrail: ASP.NET ValidateRequest (still enabled)
        // Second guardrail: Our custom validation (provides user-friendly Italian errors)
        // Third guardrail: Frontend escapeHtml() (already implemented in autocomplete-utils.js, invoices.js)
        if (Helpers.ContainsHtmlTags(customer.CustomerName))
        {
            errors.Add("Nome cliente non può contenere caratteri HTML speciali: < > \" '");
            return; // Stop validation, no need to check database
        }

        // Validation 3: CustomerID exists (if UPDATE)
        if (customer.CustomerID > 0)
        {
            var existingCustomer = db.Customers
                .FirstOrDefault(c => c.CustomerID == customer.CustomerID);

            if (existingCustomer == null)
            {
                errors.Add(string.Format("Cliente con ID {0} non trovato", customer.CustomerID));
            }
        }

        // Validation 4: CustomerName unique (check for duplicates)
        // IMPORTANT: Exclude current customer if UPDATE
        bool isDuplicate = db.Customers
            .Any(c => c.CustomerName == customer.CustomerName
                   && c.CustomerID != customer.CustomerID);

        if (isDuplicate)
        {
            errors.Add(string.Format("Nome cliente '{0}' già esistente", customer.CustomerName));
        }
    }

    public static List<Customer> GetAllCustomers(bool lazyLoading = false, 
                                                 bool proxyCreation = false)
    {
        var customersFound = new List<Customer>();
        using(var db = new schedulerEntities())
        {
            db.Configuration.ProxyCreationEnabled = proxyCreation;
            db.Configuration.LazyLoadingEnabled = lazyLoading;
            customersFound = db.Customers.OrderBy(c => c.CustomerName).ToList();
        }
        return customersFound;
    }

    public static Customer GetById(int customerId, 
                                    bool lazyLoading = false, 
                                    bool proxyCreation = false)
    {
        var customer = new Customer();
        using(var db = new schedulerEntities())
        {
            db.Configuration.ProxyCreationEnabled = proxyCreation;
            db.Configuration.LazyLoadingEnabled = lazyLoading;
            customer = db.Customers
                .Where(c => c.CustomerID == customerId)
                .FirstOrDefault();
        }
        return customer;
    }

    public static List<Customer> FilterByName(string filter, 
                                                bool lazyLoading = false, 
                                                bool proxyCreation = false)
    {
        var customersFound = new List<Customer>();
        if (!string.IsNullOrWhiteSpace(filter))
        {
            using(var db = new schedulerEntities())
            {
                db.Configuration.ProxyCreationEnabled = proxyCreation;
                db.Configuration.LazyLoadingEnabled = lazyLoading;
                customersFound = db.Customers
                    .Where(c => c.CustomerName
                    .Contains(filter))
                    .OrderBy(p => p.CustomerName)
                    .ToList();
            }
        }
        return customersFound;
    }

    public static List<Customer> StartWith(string filter, 
                                             bool lazyLoading = false, 
                                             bool proxyCreation = false)
    {
        var customersFound = new List<Customer>();
        if (!string.IsNullOrWhiteSpace(filter))
        {
            using(var db = new schedulerEntities())
            {
                db.Configuration.ProxyCreationEnabled = proxyCreation;
                db.Configuration.LazyLoadingEnabled = lazyLoading;
                customersFound = db.Customers
                    .Where(c => c.CustomerName
                    .StartsWith(filter))
                    .OrderBy(p => p.CustomerName)
                    .ToList();
            }
        }
        return customersFound;
    }

    //receive the complete name - method to be suspended or deleted
    public static bool GetAllCustomerInvoices(int customerID, 
                                out List<Customer> customerInvoices)
    {
        bool res = false;

        using(var db = new schedulerEntities())
        {
            db.Configuration.ProxyCreationEnabled = false;
            db.Configuration.LazyLoadingEnabled = false;
            customerInvoices = db.Customers.AsNoTracking()
                .Where(c=>c.CustomerID == customerID)
                .Include(i=>i.Invoices.Select(s=>s.Status))
                .ToList();
            res = customerInvoices.Count > 0;
        }

        return res;
    }

    //receive the complete name - method to be suspended or deleted
    public static Customer GetByName(string customerName, 
                                       bool lazyLoading = false, 
                                       bool proxyCreation = false)
    {
        var customer = new Customer();
        using (var db = new schedulerEntities())
        {
            db.Configuration.ProxyCreationEnabled = proxyCreation;
            db.Configuration.LazyLoadingEnabled = lazyLoading;
            customer = db.Customers
                .FirstOrDefault(c => c.CustomerName == customerName);
        }
        return customer;
    }

    /// <summary>
    /// HARD delete a customer (permanent removal).
    /// STRICT VALIDATION: Validates that NO invoices (active or deleted) are associated.
    /// Throws ServiceException if validation fails or invoices exist.
    /// </summary>
    /// <param name="customerId">Customer ID to delete</param>
    /// <returns>Deleted customer entity</returns>
    /// <exception cref="ServiceException">Thrown when validation fails or invoices exist</exception>
    public static Customer Delete(int customerId)
    {
        // Validation 1: Check if customerId is valid
        if (customerId <= 0)
        {
            throw new ServiceException("CustomerID non valido");
        }

        using (var db = new schedulerEntities())
        {
            // Validation 2: Check if customer exists
            var customerToDelete = db.Customers
                .SingleOrDefault(c => c.CustomerID == customerId);

            if (customerToDelete == null)
            {
                throw new ServiceException(string.Format("Cliente con ID {0} non trovato", customerId));
            }

            // Validation 3: Check for ANY invoices (CRITICAL - STRICT VALIDATION)
            // Count active invoices
            int activeInvoiceCount = db.Invoices
                .Count(i => i.CustomerID == customerId && i.InvoiceActive == "Y");

            // Count soft-deleted invoices
            int softDeletedInvoiceCount = db.Invoices
                .Count(i => i.CustomerID == customerId && i.InvoiceActive == "N");

            int totalInvoiceCount = activeInvoiceCount + softDeletedInvoiceCount;

            // BLOCK if ANY invoices exist
            if (totalInvoiceCount > 0)
            {
                // Build detailed error message based on invoice types
                string errorMessage;

                if (activeInvoiceCount > 0 && softDeletedInvoiceCount > 0)
                {
                    // Both types exist
                    errorMessage = string.Format(
                        "Impossibile eliminare il cliente: esistono {0} fatture attive e {1} fatture eliminate",
                        activeInvoiceCount,
                        softDeletedInvoiceCount
                    );
                }
                else if (activeInvoiceCount > 0)
                {
                    // Only active invoices
                    errorMessage = string.Format(
                        "Impossibile eliminare il cliente: esistono {0} fatture attive associate",
                        activeInvoiceCount
                    );
                }
                else
                {
                    // Only soft-deleted invoices
                    errorMessage = string.Format(
                        "Impossibile eliminare il cliente: esistono {0} fatture eliminate (storiche). Eliminarle prima di procedere.",
                        softDeletedInvoiceCount
                    );
                }

                throw new ServiceException(errorMessage);
            }

            // No invoices exist - safe to HARD delete customer
            db.Customers.Remove(customerToDelete);

            // Save changes - let exceptions bubble up to BaseHandler
            // If FK constraint violation occurs despite validation, DbUpdateException will be caught automatically
            db.SaveChanges();

            return customerToDelete;
        }
    }

}


//db.Dispose(); // The EF/ADO.NET stack holds OS-level handles behind the scenes.
// Dispose() releases them deterministically instead of waiting for
// the GC/finalizer.

// db.Dispose(); - Internally it calls GC.SuppressFinalize(this)
//                 so the runtime doesn’t run a finalizer later.

// The EF/ADO.NET stack holds OS-level handles behind the scenes.
//                  // Dispose() releases them deterministically instead of waiting for
//                  // the GC/finalizer.


//// "%dam%" search (translated to SQL LIKE)
//string pattern = $"%{term.Trim()}%";
//string pattern = $"%{term}%";

//return await _db.Customers
//    .Where(c => EF.Functions.Like(c.CustomerName, pattern))   // case-insensitive on CI collations
//    .OrderBy(c => c.CustomerName)
//    .ToListAsync();