using DBEngine;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using System.Data.Entity.SqlServer;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Security.Cryptography.X509Certificates;

/// <summary>
/// Summary description for InvoicesService
/// </summary>
public class InvoicesService
{
    public static List<int> GetDueDateYears()
    {
        List<int> invoicesDates = new List<int>();
        using(var db = new schedulerEntities())
        {
            invoicesDates = db.Invoices
                .Where(i=>i.InvoiceActive == "Y")
                .Select(p => p.InvoiceDueDate.Year)
                .Distinct()
                .OrderByDescending(p => p)
                .ToList();
        }
        return invoicesDates;
    }

    public static Invoice GetById(int id)
    {
        using (var db = new schedulerEntities())
        {
            db.Configuration.ProxyCreationEnabled = false; // plain POCOs
            db.Configuration.LazyLoadingEnabled = false;  // no lazy loading
            return db.Invoices.AsNoTracking()
                .Where(i => i.InvoiceActive == "Y")
                .Include(c=>c.Customer)
                .Include(s=>s.Status)
                .FirstOrDefault(p => p.InvoiceID == id);
        }
    }
    //Should we show the invoices that are Not Active (soft deleted)
    public static InvoiceDTO GetByIdDTO(int id)
    {
        InvoiceDTO invoiceDTO = null;
        using (var db = new schedulerEntities())
        {
            db.Configuration.ProxyCreationEnabled = false; // plain POCOs
            db.Configuration.LazyLoadingEnabled = false;  // no lazy loading
            invoiceDTO = db.Invoices.AsNoTracking()
                .Where(i => i.InvoiceActive == "Y") // keep or delete ? 
                .Where(p => p.InvoiceID == id)
                .Include(c => c.Customer)
                .Include(s => s.Status)
                .ToList()
                .Select(p => new InvoiceDTO(p, GetStatusCode(p)))
                .FirstOrDefault();           
        }
        return invoiceDTO;
    }

    public static List<Invoice> GetInvoicesByMonth(int month, int year, bool LazyLoading = false)
    {
        var result = new List<Invoice>();
        if (Helpers.ValidMonth(month) && Helpers.ValidYear(year))
        {
            using (var db = new schedulerEntities())
            {
                db.Configuration.ProxyCreationEnabled = LazyLoading;
                db.Configuration.LazyLoadingEnabled = LazyLoading;
                result = db.Invoices.AsNoTracking()
                    .Where(i => i.InvoiceDueDate.Year == year &&
                                i.InvoiceDueDate.Month == month &&
                                i.InvoiceActive == "Y")
                    .Include(c => c.Customer).Include(s => s.Status)
                    .OrderBy(i => i.InvoiceDueDate.Day)            
                    .ToList();
            }
        }

        return result;
    }

    public static List<InvoiceDTO> GetInvoicesByMonthDTO(int month, 
                                                         int year, 
                                                         bool LazyLoading = false)
    {
        var result = new List<InvoiceDTO>();
        if (Helpers.ValidMonth(month) && Helpers.ValidYear(year))
        {
            using (var db = new schedulerEntities())
            {
                db.Configuration.ProxyCreationEnabled = LazyLoading;
                db.Configuration.LazyLoadingEnabled = LazyLoading;
                result = db.Invoices.AsNoTracking()
                    .Where(i => i.InvoiceDueDate.Year == year && 
                                i.InvoiceDueDate.Month == month &&
                                i.InvoiceActive == "Y")
                    .Include(c => c.Customer).Include(s => s.Status)
                    .OrderBy(i => i.InvoiceDueDate.Day)
                    .ToList().Select(i => new InvoiceDTO(i, GetStatusCode(i))).ToList();
            }
        }

        return result;
    }

    /// <summary>
    /// Create or update an invoice with full validation.
    /// Throws ValidationException if validation fails with all error messages.
    /// Throws DatabaseException (or lets Entity Framework exceptions bubble up) if database operation fails.
    /// </summary>
    /// <param name="invoice">Invoice entity to create or update</param>
    /// <returns>Invoice entity with populated InvoiceID after save</returns>
    /// <exception cref="ValidationException">Thrown when validation fails (contains all validation errors)</exception>
    public static Invoice CreateOrUpdate(Invoice invoice)
    {
        // ========== DIAGNOSTIC LOGGING START ==========
        DiagnosticLogger.Info("========================================");
        DiagnosticLogger.Info("=== CreateOrUpdate STARTED ===");
        DiagnosticLogger.Debug(string.Format("InvoiceID: {0}", invoice.InvoiceID));
        DiagnosticLogger.Debug(string.Format("InvoiceNumber: {0}", invoice.InvoiceNumber));
        DiagnosticLogger.Debug(string.Format("CustomerID: {0}", invoice.CustomerID));
        DiagnosticLogger.Debug(string.Format("StatusID: {0}", invoice.StatusID));
        DiagnosticLogger.Debug(string.Format("InvoiceTax: {0}", invoice.InvoiceTax));
        DiagnosticLogger.Debug(string.Format("InvoiceTaxable: {0}", invoice.InvoiceTaxable));
        DiagnosticLogger.Debug(string.Format("InvoiceDue: {0}", invoice.InvoiceDue));
        DiagnosticLogger.Debug(string.Format("InvoiceCreationDate: {0}", invoice.InvoiceCreationDate));
        DiagnosticLogger.Debug(string.Format("InvoiceDueDate: {0}", invoice.InvoiceDueDate));
        // ========== DIAGNOSTIC LOGGING END ==========

        // Collect all validation errors
        var errors = new List<string>();

        ValidateInvoiceFields(invoice, errors);
        ValidateDBFields(invoice, errors);

        // If any validation errors, throw ValidationException with all errors
        if (errors.Count > 0)
        {
            // ========== DIAGNOSTIC LOGGING START ==========
            DiagnosticLogger.Warning("=== VALIDATION FAILED ===");
            foreach (var error in errors)
            {
                DiagnosticLogger.Warning(string.Format("  - {0}", error));
            }
            // ========== DIAGNOSTIC LOGGING END ==========
            throw new ValidationException(errors);
        }

        // ========== DIAGNOSTIC LOGGING START ==========
        DiagnosticLogger.Info("=== VALIDATION PASSED ===");
        // ========== DIAGNOSTIC LOGGING END ==========

        // Perform database operation
        // No try-catch needed - let database exceptions bubble up to BaseHandler
        using (var db = new schedulerEntities())
        {
            // Package B: Eliminate reference sharing by creating separate paths for CREATE and UPDATE
            Invoice invoiceToSave;

            if (invoice.InvoiceID != 0 && invoice.InvoiceID != -1)
            {
                // ========== DIAGNOSTIC LOGGING START ==========
                DiagnosticLogger.Info("=== UPDATE PATH ===");
                DiagnosticLogger.Debug(string.Format("Querying database for InvoiceID: {0}", invoice.InvoiceID));
                // ========== DIAGNOSTIC LOGGING END ==========

                // UPDATE: Get existing invoice from database (returns tracked entity)
                invoiceToSave = db.Invoices
                    .Where(i => i.InvoiceID == invoice.InvoiceID)
                    .FirstOrDefault();

                // ========== DIAGNOSTIC LOGGING START ==========
                if (invoiceToSave == null)
                {
                    DiagnosticLogger.Error(string.Format("ERROR: Invoice {0} NOT FOUND in database!", invoice.InvoiceID));
                }
                else
                {
                    DiagnosticLogger.Info("=== Invoice FOUND in database ===");
                    DiagnosticLogger.Debug(string.Format("  Current CustomerID in DB: {0}", invoiceToSave.CustomerID));
                    DiagnosticLogger.Debug(string.Format("  Current StatusID in DB: {0}", invoiceToSave.StatusID));
                    DiagnosticLogger.Debug(string.Format("  Current InvoiceTax in DB: {0}", invoiceToSave.InvoiceTax));
                    DiagnosticLogger.Debug(string.Format("  Current InvoiceNumber in DB: {0}", invoiceToSave.InvoiceNumber));
                    DiagnosticLogger.Debug(string.Format("  Entity State: {0}", db.Entry(invoiceToSave).State));
                }
                // ========== DIAGNOSTIC LOGGING END ==========

                if (invoiceToSave == null)
                {
                    // Invoice ID provided but not found in database
                    throw new ServiceException(string.Format("InvoiceID {0} non presente nel database", invoice.InvoiceID));
                }

                // ========== DIAGNOSTIC LOGGING START ==========
                DiagnosticLogger.Info("=== COPYING PROPERTIES ===");
                DiagnosticLogger.Debug(string.Format("  CustomerID: {0} -> {1}", invoiceToSave.CustomerID, invoice.CustomerID));
                DiagnosticLogger.Debug(string.Format("  StatusID: {0} -> {1}", invoiceToSave.StatusID, invoice.StatusID));
                DiagnosticLogger.Debug(string.Format("  InvoiceNumber: {0} -> {1}", invoiceToSave.InvoiceNumber, invoice.InvoiceNumber));
                DiagnosticLogger.Debug(string.Format("  InvoiceTax: {0} -> {1}", invoiceToSave.InvoiceTax, invoice.InvoiceTax));
                // ========== DIAGNOSTIC LOGGING END ==========

                // PHASE 3 FIX: Store original foreign key values before modification
                // Bug #4: Prevents InvalidOperationException when navigation properties conflict with changed foreign keys
                int originalCustomerID = invoiceToSave.CustomerID;
                int originalStatusID = invoiceToSave.StatusID;

                // Copy all properties from invoice parameter to tracked entity
                invoiceToSave.InvoiceNumber = invoice.InvoiceNumber;
                invoiceToSave.InvoiceOrderNumber = invoice.InvoiceOrderNumber;
                invoiceToSave.CustomerID = invoice.CustomerID;
                invoiceToSave.StatusID = invoice.StatusID;
                invoiceToSave.InvoiceTaxable = invoice.InvoiceTaxable;
                invoiceToSave.InvoiceTax = invoice.InvoiceTax;
                invoiceToSave.InvoiceDue = invoice.InvoiceDue;
                invoiceToSave.InvoiceCreationDate = invoice.InvoiceCreationDate;
                invoiceToSave.InvoiceDueDate = invoice.InvoiceDueDate;
                invoiceToSave.InvoiceDescription = invoice.InvoiceDescription;
                invoiceToSave.InvoiceActive = invoice.InvoiceActive;

                // PHASE 3 FIX: Clear navigation properties if foreign keys changed
                // Bug #4: Prevents Entity Framework from using stale navigation property references
                if (originalCustomerID != invoice.CustomerID)
                {
                    invoiceToSave.Customer = null;
                }
                if (originalStatusID != invoice.StatusID)
                {
                    invoiceToSave.Status = null;
                }

                // ========== DIAGNOSTIC LOGGING START ==========
                DiagnosticLogger.Info("=== PROPERTIES COPIED ===");
                DiagnosticLogger.Debug(string.Format("  Entity State After Copy: {0}", db.Entry(invoiceToSave).State));
                // ========== DIAGNOSTIC LOGGING END ==========
            }
            else
            {
                // ========== DIAGNOSTIC LOGGING START ==========
                DiagnosticLogger.Info("=== CREATE PATH ===");
                DiagnosticLogger.Debug(string.Format("Creating new Invoice entity (InvoiceID: {0})", invoice.InvoiceID));
                // ========== DIAGNOSTIC LOGGING END ==========

                // CREATE: Create NEW entity (don't share reference with invoice parameter)
                // This prevents Entity Framework from modifying the original invoice object
                invoiceToSave = new Invoice
                {
                    InvoiceNumber = invoice.InvoiceNumber,
                    InvoiceOrderNumber = invoice.InvoiceOrderNumber,
                    CustomerID = invoice.CustomerID,
                    StatusID = invoice.StatusID,
                    InvoiceTaxable = invoice.InvoiceTaxable,
                    InvoiceTax = invoice.InvoiceTax,
                    InvoiceDue = invoice.InvoiceDue,
                    InvoiceCreationDate = invoice.InvoiceCreationDate,
                    InvoiceDueDate = invoice.InvoiceDueDate,
                    InvoiceDescription = invoice.InvoiceDescription,
                    InvoiceActive = "Y"  // New invoices are active by default
                };

                // ========== DIAGNOSTIC LOGGING START ==========
                DiagnosticLogger.Info("=== NEW ENTITY CREATED ===");
                // ========== DIAGNOSTIC LOGGING END ==========
            }

            // Package B: Use explicit Add for CREATE (EF best practice)
            // For CREATE: Explicitly add new entity to context
            // For UPDATE: Entity is already tracked from query above, no Add needed
            if (invoice.InvoiceID == 0 || invoice.InvoiceID == -1)
            {
                // ========== DIAGNOSTIC LOGGING START ==========
                DiagnosticLogger.Info("=== ADDING NEW ENTITY TO CONTEXT ===");
                // ========== DIAGNOSTIC LOGGING END ==========

                db.Invoices.Add(invoiceToSave);

                // ========== DIAGNOSTIC LOGGING START ==========
                DiagnosticLogger.Debug(string.Format("  Entity State After Add: {0}", db.Entry(invoiceToSave).State));
                // ========== DIAGNOSTIC LOGGING END ==========
            }
            // UPDATE: Entity already tracked, EF automatically detects property changes

            // ========== DIAGNOSTIC LOGGING START ==========
            DiagnosticLogger.Info("=== BEFORE SAVECHANGES ===");
            DiagnosticLogger.Debug(string.Format("  InvoiceID: {0}", invoice.InvoiceID));
            DiagnosticLogger.Debug(string.Format("  Entity State: {0}", db.Entry(invoiceToSave).State));
            DiagnosticLogger.Debug(string.Format("  Has Changes: {0}", db.ChangeTracker.HasChanges()));

            // Log modified properties for UPDATE
            var entry = db.Entry(invoiceToSave);
            if (entry.State == System.Data.Entity.EntityState.Modified)
            {
                DiagnosticLogger.Info("=== MODIFIED PROPERTIES ===");
                foreach (var propName in entry.OriginalValues.PropertyNames)
                {
                    var originalValue = entry.OriginalValues[propName];
                    var currentValue = entry.CurrentValues[propName];
                    if (!Equals(originalValue, currentValue))
                    {
                        DiagnosticLogger.Debug(string.Format("    {0}: {1} -> {2}", propName, originalValue, currentValue));
                    }
                }
            }

            DiagnosticLogger.Info("=== CALLING SAVECHANGES ===");
            // ========== DIAGNOSTIC LOGGING END ==========

            // PHASE 4 FIX: Detect "no changes" during UPDATE and reject
            // Bug #6: User requested validation to reject UPDATE when no changes are made
            if (invoice.InvoiceID != 0 && invoice.InvoiceID != -1)
            {
                // UPDATE operation: Check if Entity Framework detected any changes
                if (entry.State == System.Data.Entity.EntityState.Unchanged)
                {
                    // No changes detected - reject the operation
                    throw new ValidationException("Nessuna modifica rilevata. Operazione di aggiornamento annullata.");
                }
            }

            db.SaveChanges();  // Commits CREATE or UPDATE; if fails, exception bubbles up to BaseHandler

            // ========== DIAGNOSTIC LOGGING START ==========
            DiagnosticLogger.Info("=== SAVECHANGES SUCCEEDED ===");
            DiagnosticLogger.Info(string.Format("  Final InvoiceID: {0}", invoiceToSave.InvoiceID));
            DiagnosticLogger.Info("=== CreateOrUpdate COMPLETED ===");
            DiagnosticLogger.Info("========================================");
            // ========== DIAGNOSTIC LOGGING END ==========

            // Entity Framework automatically populates InvoiceID after SaveChanges()
            // For CREATE: EF sets the identity column value from database
            // For UPDATE: InvoiceID already exists in the entity
            return invoiceToSave;
        }
    }

    private static void ValidateInvoiceFields(Invoice invoice, List<string> ErrorMessages)
    {
        if (!Helpers.IsNotEmpty(invoice.InvoiceNumber))
            ErrorMessages.Add("Invoice number is null");

        if (!Helpers.IsNotEmpty(invoice.InvoiceOrderNumber))
            ErrorMessages.Add("Invoice order number is null");

        if (!Helpers.IsNotEmpty(invoice.CustomerID))
            ErrorMessages.Add("Customer ID is null or wrong format");

        if (!Helpers.IsNotEmpty(invoice.InvoiceTaxable))
            ErrorMessages.Add("Invoice taxable is null or wrong format");

        if (!Helpers.IsNotEmpty(invoice.InvoiceTax))
            ErrorMessages.Add("Invoice Tax is null or wrong format");

        if (!Helpers.IsNotEmpty(invoice.InvoiceDue))
            ErrorMessages.Add("Invoice due is null or wrong format");

        if (!Helpers.IsNotEmpty(invoice.StatusID))
            ErrorMessages.Add("Status ID is null or wrong format");

        if (!Helpers.IsNotEmpty(invoice.InvoiceCreationDate))
            ErrorMessages.Add("Invoice Creation Date is null or wrong format");

        if (!Helpers.IsNotEmpty(invoice.InvoiceDueDate))
            ErrorMessages.Add("Invoice due date is null or wrong format");

        // ========== XSS VALIDATIONS (SECOND GUARDRAIL) - ALL STRICT ==========
        // First guardrail: ASP.NET ValidateRequest (still enabled)
        // Second guardrail: Our custom validation (provides user-friendly Italian errors)
        // Third guardrail: Frontend escapeHtml() (already implemented)

        // XSS Validation 1: InvoiceNumber (STRICT - reject < > " ')
        if (Helpers.IsNotEmpty(invoice.InvoiceNumber) && Helpers.ContainsHtmlTags(invoice.InvoiceNumber))
        {
            ErrorMessages.Add("Numero fattura non può contenere caratteri HTML speciali: < > \" '");
        }

        // XSS Validation 2: InvoiceOrderNumber (STRICT - reject < > " ')
        if (Helpers.IsNotEmpty(invoice.InvoiceOrderNumber) && Helpers.ContainsHtmlTags(invoice.InvoiceOrderNumber))
        {
            ErrorMessages.Add("Numero ordine non può contenere caratteri HTML speciali: < > \" '");
        }

        // XSS Validation 3: InvoiceDescription (STRICT - per user request)
        // User said: "lets make stringent for description as well because cant save it anyway on db"
        if (Helpers.IsNotEmpty(invoice.InvoiceDescription) && Helpers.ContainsHtmlTags(invoice.InvoiceDescription))
        {
            ErrorMessages.Add("Descrizione fattura non può contenere caratteri HTML speciali: < > \" '");
        }

        // Numeric range validations
        if (Helpers.IsNotEmpty(invoice.InvoiceTaxable) && invoice.InvoiceTaxable <= 0)
            ErrorMessages.Add("Invoice taxable must be greater than 0");

        // NOTE: invoice.InvoiceTax is stored as DECIMAL (0.22 = 22%)
        // because CreateOrUpdateInvoice.ashx line 60 converts: invoice.InvoiceTax = invoiceTax/100m
        // Valid range is 0.00 (0%) to 1.00 (100%)
        if (Helpers.IsNotEmpty(invoice.InvoiceTax) && (invoice.InvoiceTax < 0 || invoice.InvoiceTax > 1))
            ErrorMessages.Add("Invoice tax must be between 0% and 100% (decimal format)");

        if (Helpers.IsNotEmpty(invoice.InvoiceDue) && invoice.InvoiceDue <= 0)
            ErrorMessages.Add("Invoice due must be greater than 0");

        // CRITICAL: Calculate InvoiceTotal and validate InvoiceDue <= InvoiceTotal
        // NOTE: invoice.InvoiceTax is already in DECIMAL format (0.22 = 22%)
        // DO NOT divide by 100 again! Use the decimal value directly.
        if (Helpers.IsNotEmpty(invoice.InvoiceTaxable) &&
            Helpers.IsNotEmpty(invoice.InvoiceTax) &&
            Helpers.IsNotEmpty(invoice.InvoiceDue))
        {
            decimal calculatedInvoiceTotal = invoice.InvoiceTaxable * (1 + invoice.InvoiceTax);

            if (calculatedInvoiceTotal <= 0)
                ErrorMessages.Add("Invoice total (calculated) must be greater than 0");

            // NOTE: Uses > (not >=) to allow InvoiceDue to EQUAL InvoiceTotal (full payment)
            if (invoice.InvoiceDue > calculatedInvoiceTotal)
                ErrorMessages.Add("Invoice due amount cannot exceed total amount");
        }

        // String length validations (database constraint: nvarchar(50))
        if (Helpers.IsNotEmpty(invoice.InvoiceNumber) && invoice.InvoiceNumber.Length > 50)
            ErrorMessages.Add("Invoice number cannot exceed 50 characters");

        if (Helpers.IsNotEmpty(invoice.InvoiceOrderNumber) && invoice.InvoiceOrderNumber.Length > 50)
            ErrorMessages.Add("Invoice order number cannot exceed 50 characters");

        if(Helpers.IsNotEmpty(invoice.InvoiceCreationDate) &&
            Helpers.IsNotEmpty(invoice.InvoiceDueDate) &&
            invoice.InvoiceCreationDate > invoice.InvoiceDueDate)
            ErrorMessages.Add("Invoice creation date must be earlier than invoice due date");
    }

    private static void ValidateDBFields(Invoice invoice, List<string> ErrorMessages)
    {
        using (var db = new schedulerEntities())
        {
            if (Helpers.IsNotEmpty(invoice.CustomerID) &&
                !db.Customers.Any(c => c.CustomerID == invoice.CustomerID))
                ErrorMessages.Add("CustomerID not found");

            if (Helpers.IsNotEmpty(invoice.StatusID) &&
                !db.Status.Any(i => i.StatusID == invoice.StatusID))
                ErrorMessages.Add("StatusID not found");

            // PHASE 1 FIX: Check for duplicate InvoiceNumber during CREATE and UPDATE
            // Bug #1: Missing duplicate check during UPDATE operations
            if (invoice.InvoiceID == 0 || invoice.InvoiceID == -1)
            {
                // CREATE: Check if InvoiceNumber exists anywhere in database
                if (db.Invoices.Any(i => i.InvoiceNumber == invoice.InvoiceNumber))
                    ErrorMessages.Add("InvoiceNumber already present in DB");
            }
            else
            {
                // UPDATE: Check if InvoiceNumber exists in OTHER invoices (exclude current invoice)
                // This allows the invoice to keep its own number but prevents using another invoice's number
                if (db.Invoices.Any(i => i.InvoiceNumber == invoice.InvoiceNumber && i.InvoiceID != invoice.InvoiceID))
                    ErrorMessages.Add("InvoiceNumber already present in DB");
            }

            // PHASE 1 FIX: Check for duplicate InvoiceOrderNumber during CREATE and UPDATE
            // Bug #2: Missing duplicate check during UPDATE operations
            if (invoice.InvoiceID == 0 || invoice.InvoiceID == -1)
            {
                // CREATE: Check if InvoiceOrderNumber exists anywhere in database
                if (db.Invoices.Any(i => i.InvoiceOrderNumber == invoice.InvoiceOrderNumber))
                    ErrorMessages.Add("InvoiceOrderNumber already present in DB");
            }
            else
            {
                // UPDATE: Check if InvoiceOrderNumber exists in OTHER invoices (exclude current invoice)
                // This allows the invoice to keep its own number but prevents using another invoice's number
                if (db.Invoices.Any(i => i.InvoiceOrderNumber == invoice.InvoiceOrderNumber && i.InvoiceID != invoice.InvoiceID))
                    ErrorMessages.Add("InvoiceOrderNumber already present in DB");
            }
        }
    }

    // ?? using CustomerName or CustomerID
    public static List<InvoiceDTO> Search(InvoiceFilters filters)
    {
        List<InvoiceDTO> invoicesFound = new List<InvoiceDTO>();
        int customerId = 0;
        int statusId = 0;
        int year = 0;
        int month = 0;
        int.TryParse(filters.CustomerId, out customerId);
        int.TryParse(filters.StatusId, out statusId);
        int.TryParse(filters.Year, out year);
        int.TryParse(filters.Month, out month);

        // ========== CRITICAL VALIDATION: InvoiceActive MUST BE PROVIDED ==========
        // NO DEFAULT VALUE - Fail fast if missing or invalid
        // This prevents accidentally showing wrong invoices (e.g., active invoices in deleted view)
        if (string.IsNullOrWhiteSpace(filters.InvoiceActive))
        {
            throw new ServiceException("Parametro InvoiceActive mancante. Specificare 'Y' (attive) o 'N' (eliminate).");
        }

        // Normalize to uppercase for comparison (accepts "Y", "y", "N", "n")
        string invoiceActive = filters.InvoiceActive.ToUpper().Trim();

        // Validate allowed values: only "Y" or "N"
        if (invoiceActive != "Y" && invoiceActive != "N")
        {
            throw new ServiceException(string.Format(
                "Valore InvoiceActive non valido: '{0}'. Valori ammessi: 'Y' (attive), 'N' (eliminate).",
                filters.InvoiceActive
            ));
        }

        using (var db = new schedulerEntities())
        {
            db.Configuration.ProxyCreationEnabled = false; // plain POCOs
            db.Configuration.LazyLoadingEnabled = false;
            var query = db.Invoices
                .AsNoTracking()
                .Where(i => i.InvoiceActive == invoiceActive);  // Use validated value (no default)
            if (Helpers.IsNotEmpty(filters.InvoiceNumber)) query = query
                    .Where(i => i.InvoiceNumber == filters.InvoiceNumber);
            if (Helpers.IsNotEmpty(filters.InvoiceOrderNumber)) query = query
                    .Where(i => i.InvoiceOrderNumber == filters.InvoiceOrderNumber);
            //if (Helpers.IsNotEmpty(filters.CustomerName)) query = query
            //        .Where(invoice => invoice.Customer.CustomerName == filters.CustomerName);
            // Only apply CustomerId filter if valid (> 0). Use foreign key directly, not navigation property
            if (customerId > 0) query = query
                    .Where(i => i.CustomerID == customerId);
            // Only apply StatusId filter if valid (> 0)
            if (statusId > 0) query = query.Where(i => i.StatusID == statusId);
            if (Helpers.ValidYear(year)) query = query
                    .Where(i => i.InvoiceDueDate.Year == year);
            if (Helpers.ValidMonth(month)) query = query
                    .Where(i => i.InvoiceDueDate.Month == month);
            query = query.OrderByDescending(i=>i.InvoiceDueDate)
                .ThenBy(i => i.InvoiceID)
                .Include(c => c.Customer).Include(s => s.Status);
            invoicesFound = query.ToList().Select(i=> new InvoiceDTO(i, GetStatusCode(i))).ToList();     
        }
        return invoicesFound;
    }

    // ========== CRITICAL: KEEP IN SYNC WITH FRONTEND ==========
    // Frontend replicates this logic in invoices.js:_calculatePreviewStatusCode()
    // for real-time status color preview during invoice creation/editing.
    // If you change this algorithm, you MUST update the frontend version as well!
    //
    // Algorithm:
    //   - If StatusLabel == "Saldata" (Helpers.Paid) → return "0" (GREEN - Paid)
    //   - If StatusLabel == "Non Saldata":
    //       - Normalize both dates to midnight (00:00:00) for date-only comparison
    //       - If DueDate.Date >= Today.Date → return "1" (YELLOW - Not yet overdue)
    //       - If DueDate.Date < Today.Date → return "2" (RED - Overdue)
    //       - NOTE: Invoice due TODAY is considered NOT overdue (returns "1")
    // ========== END SYNC REQUIREMENT ==========
    // 0 = Pagato , 1 = Non Pagato e Non Scaduto, 2 = Non Pagato e Scaduto
    public static string GetStatusCode(Invoice i)
    {
        DateTime DueDate = i.InvoiceDueDate;
        string StatusLabel = i.Status.StatusLabel;
        string StatusCode = "-1";

        if (StatusLabel == Helpers.Paid)
        {
            StatusCode = "0";  // PAID (GREEN)
        }
        else
        {
            // Normalize both dates to midnight for accurate date-only comparison
            // This ensures invoice due TODAY is not marked as overdue
            // (matches frontend logic in invoices.js:1519)
            DateTime today = DateTime.UtcNow.Date;  // Today at 00:00:00
            DateTime dueDate = DueDate.Date;  // Due date at 00:00:00

            // If due date >= today → PENDING (not yet overdue)
            // If due date < today → OVERDUE (past due)
            // NOTE: Due date = Today is considered NOT overdue (matches frontend)
            StatusCode = dueDate >= today ? "1" : "2";
        }

        return StatusCode;
    }

    public static int StatusIdFromCode(string code)
    {
        int statusId; //  = -1  --- default value
        switch (code)
        {
            case "0":
                statusId = 1; 
                break;
            case "1":
            case "2":
                statusId = 2; 
                break;
            default:
                statusId = -1;
                break;
        }
        return statusId;
    }

    /// <summary>
    /// Soft delete an invoice (sets InvoiceActive = "N").
    /// Throws ServiceException if validation fails.
    /// </summary>
    /// <param name="invoiceId">Invoice ID to delete</param>
    /// <returns>Deleted invoice entity</returns>
    /// <exception cref="ServiceException">Thrown when validation fails</exception>
    public static Invoice Delete(int invoiceId)
    {
        // Validation 1: Check if invoiceId is valid
        if (invoiceId <= 0)
        {
            throw new ServiceException("InvoiceID non valido");
        }

        using (var db = new schedulerEntities())
        {
            var invoiceToDelete = db.Invoices
                .SingleOrDefault(i => i.InvoiceID == invoiceId);

            // Validation 2: Check if invoice exists
            if (invoiceToDelete == null)
            {
                throw new ServiceException(string.Format("Fattura con ID {0} non trovata", invoiceId));
            }

            // Validation 3: Check if already deleted
            if (invoiceToDelete.InvoiceActive == "N")
            {
                throw new ServiceException("La fattura è già stata eliminata");
            }

            // Perform soft delete
            invoiceToDelete.InvoiceActive = "N";
            db.Invoices.AddOrUpdate(invoiceToDelete);

            // Save changes - let exceptions bubble up to BaseHandler
            // No need to check rowsAffected - EF will throw if database fails
            db.SaveChanges();

            return invoiceToDelete;
        }
    }

    public static List<Invoice> GetAllDeleted(bool lazyLoading = false)
    {
        using (var db = new schedulerEntities())
        {
            db.Configuration.ProxyCreationEnabled = lazyLoading;
            db.Configuration.LazyLoadingEnabled = lazyLoading;
            return db.Invoices.AsNoTracking()
                .Where(i => i.InvoiceActive == "N")
                .Include(c => c.Customer)
                .Include(s => s.Status).ToList();
        }
    }

    //Not Requested
    public static List<Invoice> GetAllActive(bool lazyLoading = false)
    {
        using (var db = new schedulerEntities())
        {
            db.Configuration.ProxyCreationEnabled = lazyLoading;
            db.Configuration.LazyLoadingEnabled = lazyLoading;
            return db.Invoices.AsNoTracking()
                .Where(i => i.InvoiceActive == "Y")
                .Include(c => c.Customer)
                .Include(s => s.Status).ToList();
        }
    }

    //Not Requested
    public static List<int> GetAllMonths()
    {
        List<int> invoicesDates = new List<int>();
        using (var db = new schedulerEntities())
        {
            invoicesDates = db.Invoices
                .Where(i => i.InvoiceActive == "Y")
                .Select(p => p.InvoiceDueDate.Month)
                .Distinct()
                .OrderByDescending(p => p)
                .ToList();
        }
        return invoicesDates;
    }

    /// <summary>
    /// Restore a soft-deleted invoice (sets InvoiceActive = "Y").
    /// Throws ServiceException if validation fails.
    /// </summary>
    /// <param name="invoiceId">Invoice ID to restore</param>
    /// <returns>Restored invoice entity</returns>
    /// <exception cref="ServiceException">Thrown when validation fails</exception>
    public static Invoice Restore(int invoiceId)
    {
        // Validation 1: Check if invoiceId is valid
        if (invoiceId <= 0)
        {
            throw new ServiceException("InvoiceID non valido");
        }

        using (var db = new schedulerEntities())
        {
            var invoiceToRestore = db.Invoices
                .SingleOrDefault(i => i.InvoiceID == invoiceId);

            // Validation 2: Check if invoice exists
            if (invoiceToRestore == null)
            {
                throw new ServiceException(string.Format("Fattura con ID {0} non trovata", invoiceId));
            }

            // Validation 3: Check if already active
            if (invoiceToRestore.InvoiceActive == "Y")
            {
                throw new ServiceException("La fattura è già attiva");
            }

            // Perform restore
            invoiceToRestore.InvoiceActive = "Y";
            db.Invoices.AddOrUpdate(invoiceToRestore);

            // Save changes - let exceptions bubble up to BaseHandler
            db.SaveChanges();

            return invoiceToRestore;
        }
    }

    /// <summary>
    /// Permanently delete invoice from database (hard delete - irreversible).
    /// CRITICAL: Only allows hard delete of soft-deleted invoices for safety.
    /// Throws ServiceException if validation fails.
    /// </summary>
    /// <param name="invoiceId">Invoice ID to permanently delete</param>
    /// <exception cref="ServiceException">Thrown when validation fails</exception>
    public static void HardDelete(int invoiceId)
    {
        // Validation 1: Check if invoiceId is valid
        if (invoiceId <= 0)
        {
            throw new ServiceException("InvoiceID non valido");
        }

        using (var db = new schedulerEntities())
        {
            var invoiceToDelete = db.Invoices
                .SingleOrDefault(i => i.InvoiceID == invoiceId);

            // Validation 2: Check if invoice exists
            if (invoiceToDelete == null)
            {
                throw new ServiceException(string.Format("Fattura con ID {0} non trovata", invoiceId));
            }

            // Validation 3: CRITICAL SAFETY CHECK - Only allow hard delete of soft-deleted invoices
            // This prevents accidental permanent deletion of active invoices
            if (invoiceToDelete.InvoiceActive != "N")
            {
                throw new ServiceException("Solo le fatture eliminate possono essere cancellate definitivamente. Prima elimina la fattura, poi cancellala definitivamente.");
            }

            // Perform hard delete (permanently removes from database)
            db.Invoices.Remove(invoiceToDelete);

            // NOTE: This may throw exception if foreign key constraints exist
            // (e.g., if other tables reference this invoice)
            // The exception will be caught by BaseHandler and returned as friendly error
            db.SaveChanges();
        }
    }

    /// <summary>
    /// Permanently delete multiple invoices in batch using SQL BULK DELETE.
    /// APPROACH: SQL bulk delete for maximum performance.
    /// GUARDRAIL: Maximum 10,000 invoices per batch (defined in Helpers.MAX_BATCH_DELETE_SIZE).
    /// </summary>
    /// <param name="invoiceIds">List of invoice IDs to delete</param>
    /// <returns>BatchDeleteResult with success/failure counts</returns>
    /// <exception cref="ServiceException">Thrown when validation fails or batch size exceeds limit</exception>
    public static BatchDeleteResult BatchHardDelete(List<int> invoiceIds)
    {
        var result = new BatchDeleteResult();

        // ========== VALIDATION ==========
        if (invoiceIds == null || invoiceIds.Count == 0)
        {
            throw new ServiceException("Lista InvoiceIDs vuota");
        }

        // ========== GUARDRAIL: REJECT HUGE BATCHES ==========
        if (invoiceIds.Count > Helpers.MAX_BATCH_DELETE_SIZE)
        {
            throw new ServiceException(string.Format(
                "Troppi elementi ({0}). Massimo consentito: {1}. Usa filtri per ridurre la selezione.",
                invoiceIds.Count,
                Helpers.MAX_BATCH_DELETE_SIZE
            ));
        }

        using (var db = new schedulerEntities())
        {
            try
            {
                // ========== SQL BULK DELETE ==========
                // Single SQL DELETE statement with WHERE IN clause for maximum performance
                // Only deletes invoices where InvoiceActive = 'N' (soft-deleted invoices)
                // This is the fastest approach - single DB call regardless of count

                // Convert invoice IDs to comma-separated string for SQL IN clause
                string idsParam = string.Join(",", invoiceIds);

                // Execute bulk DELETE in single SQL statement
                // CRITICAL: Only deletes soft-deleted invoices (InvoiceActive = 'N')
                int deletedCount = db.Database.ExecuteSqlCommand(
                    "DELETE FROM Invoices WHERE InvoiceID IN (" + idsParam + ") AND InvoiceActive = 'N'"
                );

                // Calculate results
                result.SuccessCount = deletedCount;
                result.FailureCount = invoiceIds.Count - deletedCount;

                // Record successful IDs (we don't know which specific ones, so report count only)
                // For detailed per-item errors, use Hybrid approach (commented below)
                if (result.FailureCount > 0)
                {
                    result.Errors.Add(string.Format(
                        "{0} fatture non eliminate (potrebbero non esistere, essere già attive, o avere vincoli FK)",
                        result.FailureCount
                    ));
                }
            }
            catch (System.Data.SqlClient.SqlException ex)
            {
                // SQL error (e.g., syntax, timeout, FK constraint)
                throw new ServiceException("Errore durante eliminazione batch: " + ex.Message);
            }
        }

        return result;
    }

    /*
    ========== HYBRID APPROACH (ALTERNATIVE - SAVED FOR FUTURE USE) ==========

    This approach provides detailed per-item error feedback but is slower.
    Use this if you need to know exactly which invoices failed and why.

    public static BatchDeleteResult BatchHardDelete_Hybrid(List<int> invoiceIds)
    {
        const int CHUNK_SIZE = 100;
        var result = new BatchDeleteResult();

        // GUARDRAIL
        if (invoiceIds == null || invoiceIds.Count == 0)
        {
            throw new ServiceException("Lista InvoiceIDs vuota");
        }

        if (invoiceIds.Count > Helpers.MAX_BATCH_DELETE_SIZE)
        {
            throw new ServiceException($"Troppi elementi ({invoiceIds.Count}). Massimo: {Helpers.MAX_BATCH_DELETE_SIZE}.");
        }

        // Process in chunks
        for (int i = 0; i < invoiceIds.Count; i += CHUNK_SIZE)
        {
            var chunk = invoiceIds.Skip(i).Take(CHUNK_SIZE).ToList();

            // Try bulk delete for this chunk
            bool bulkSuccess = TryBulkDeleteChunk(chunk, result);

            if (!bulkSuccess)
            {
                // Bulk failed - fall back to per-item for this chunk only
                ProcessChunkIndividually(chunk, result);
            }
        }

        return result;
    }

    private static bool TryBulkDeleteChunk(List<int> chunk, BatchDeleteResult result)
    {
        try
        {
            using (var db = new schedulerEntities())
            {
                var invoicesToDelete = db.Invoices
                    .Where(i => chunk.Contains(i.InvoiceID) && i.InvoiceActive == "N")
                    .ToList();

                db.Invoices.RemoveRange(invoicesToDelete);
                db.SaveChanges();

                result.SuccessCount += invoicesToDelete.Count;
                result.SuccessfulIds.AddRange(invoicesToDelete.Select(i => i.InvoiceID));

                var notDeleted = chunk.Except(invoicesToDelete.Select(i => i.InvoiceID)).ToList();
                result.FailureCount += notDeleted.Count;
                result.FailedIds.AddRange(notDeleted);

                foreach (var id in notDeleted)
                {
                    result.Errors.Add($"Fattura {id}: Non trovata o non eliminata");
                }

                return true;
            }
        }
        catch (System.Data.Entity.Infrastructure.DbUpdateException)
        {
            return false;
        }
    }

    private static void ProcessChunkIndividually(List<int> chunk, BatchDeleteResult result)
    {
        foreach (int invoiceId in chunk)
        {
            try
            {
                using (var db = new schedulerEntities())
                {
                    var invoice = db.Invoices.SingleOrDefault(i => i.InvoiceID == invoiceId);

                    if (invoice == null)
                    {
                        result.FailureCount++;
                        result.FailedIds.Add(invoiceId);
                        result.Errors.Add($"Fattura {invoiceId}: Non trovata");
                        continue;
                    }

                    if (invoice.InvoiceActive != "N")
                    {
                        result.FailureCount++;
                        result.FailedIds.Add(invoiceId);
                        result.Errors.Add($"Fattura {invoiceId}: Non eliminata (ancora attiva)");
                        continue;
                    }

                    db.Invoices.Remove(invoice);
                    db.SaveChanges();

                    result.SuccessCount++;
                    result.SuccessfulIds.Add(invoiceId);
                }
            }
            catch (System.Data.Entity.Infrastructure.DbUpdateException)
            {
                result.FailureCount++;
                result.FailedIds.Add(invoiceId);
                result.Errors.Add($"Fattura {invoiceId}: Vincolo integrità (FK)");
            }
        }
    }
    */

}

public class InvoiceFilters
{
    public string InvoiceNumber { get; set; }
    public string InvoiceOrderNumber { get; set; }
    public string CustomerId { get; set; }
    public string CustomerName { get; set; }
    public string StatusId { get; set; }
    public string Year { get; set; }
    public string Month { get; set; }
    public string InvoiceActive { get; set; }  // NEW: "Y" for active, "N" for deleted (soft-deleted)
}

public class InvoiceDTO
{
    public Invoice Invoice { get; set; }
    public string StatusCode { get; set; }

    public InvoiceDTO(Invoice invoice, string statusCode)
    {
        this.Invoice = invoice;
        StatusCode = statusCode; // 0 = Pagato , 1 = Non Pagato e Non Scaduto, 2 = Non Pagato e Scaduto
    }
}

/// <summary>
/// Result object for batch delete operations.
/// Contains detailed success/failure information for each invoice.
/// </summary>
public class BatchDeleteResult
{
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public List<string> Errors { get; set; }
    public List<int> SuccessfulIds { get; set; }
    public List<int> FailedIds { get; set; }

    public BatchDeleteResult()
    {
        Errors = new List<string>();
        SuccessfulIds = new List<int>();
        FailedIds = new List<int>();
    }
}