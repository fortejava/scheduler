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
    public static bool CreateOrUpdate(string newCustomerName, 
                                        out List<string> ErrorMessages, 
                                        int customerID = -1)
    {
        bool result = false;
        ErrorMessages = new List<string>();

        if (Helpers.IsNotEmpty(newCustomerName))
        {
            using (var db = new schedulerEntities())
            {
                var customerToSave = (customerID != -1) ? db.Customers
                    .SingleOrDefault(c => c.CustomerID == customerID) : new Customer();
                if (customerToSave != null)
                {
                    if ( !db.Customers.Any(c=>c.CustomerName == newCustomerName)) 
                    {
                        customerToSave.CustomerName = newCustomerName;
                        db.Customers.AddOrUpdate(customerToSave);
                        result = (db.SaveChanges() == 1);
                    }
                    else
                    {
                        ErrorMessages.Add("CustomerName given is already present on DB");
                    }
                }
                else
                {
                    ErrorMessages.Add("CustomerID given is not present on DB");
                }
            }
        }
        else
        {
            ErrorMessages.Add("CustomerName given is null or empty");
        }
        return result;
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
    /// Hard delete customer (STRICT VALIDATION: only if NO invoices exist - active or soft-deleted)
    /// </summary>
    /// <param name="customerIdString">Customer ID as string</param>
    /// <param name="ErrorMessages">Output list of validation error messages</param>
    /// <returns>True if delete succeeded, false otherwise</returns>
    public static bool Delete(string customerIdString, out List<string> ErrorMessages)
    {
        bool result = false;
        ErrorMessages = new List<string>();
        int customerId = -1;

        // Validation 1: Check if customerID is provided
        if (string.IsNullOrEmpty(customerIdString))
        {
            ErrorMessages.Add("CustomerID richiesto");
            return false;
        }

        // Validation 2: Check if customerID is valid integer
        if (!int.TryParse(customerIdString, out customerId))
        {
            ErrorMessages.Add("CustomerID non valido (formato non corretto)");
            return false;
        }

        using (var db = new schedulerEntities())
        {
            // Validation 3: Check if customer exists
            var customerToDelete = db.Customers
                .SingleOrDefault(c => c.CustomerID == customerId);

            if (customerToDelete == null)
            {
                ErrorMessages.Add(string.Format("Cliente con ID {0} non trovato", customerId));
                return false;
            }

            // Validation 4: Check for ANY invoices (CRITICAL - STRICT VALIDATION)
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
                // Build detailed error message
                if (activeInvoiceCount > 0 && softDeletedInvoiceCount > 0)
                {
                    // Both types exist
                    ErrorMessages.Add(string.Format(
                        "Impossibile eliminare il cliente: esistono {0} fatture attive e {1} fatture eliminate",
                        activeInvoiceCount,
                        softDeletedInvoiceCount
                    ));
                }
                else if (activeInvoiceCount > 0)
                {
                    // Only active invoices
                    ErrorMessages.Add(string.Format(
                        "Impossibile eliminare il cliente: esistono {0} fatture attive associate",
                        activeInvoiceCount
                    ));
                }
                else
                {
                    // Only soft-deleted invoices
                    ErrorMessages.Add(string.Format(
                        "Impossibile eliminare il cliente: esistono {0} fatture eliminate (storiche). Eliminarle prima di procedere.",
                        softDeletedInvoiceCount
                    ));
                }

                return false;
            }

            // No invoices exist - safe to delete customer
            db.Customers.Remove(customerToDelete);

            // Validation 5: Check if save succeeded
            try
            {
                int rowsAffected = db.SaveChanges();

                if (rowsAffected == 1)
                {
                    result = true;
                }
                else
                {
                    ErrorMessages.Add(string.Format(
                        "Errore durante l'eliminazione (righe modificate: {0})",
                        rowsAffected
                    ));
                }
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException ex)
            {
                // FK constraint violation (shouldn't happen if validation #4 works)
                ErrorMessages.Add("Errore database: impossibile eliminare il cliente (vincolo chiave esterna)");
                return false;
            }
        }

        return result;
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