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

    public static List<InvoiceDTO> GetInvoicesByMonthDTO(int month, int year, bool LazyLoading = false)
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

    public static bool CreateOrUpdate(Invoice invoice, out List<string> ErrorMessages)
    {
        bool res = false;
        ErrorMessages = new List<string>();

        ValidateInvoiceFields(invoice, ErrorMessages);
        ValidateDBFields(invoice, ErrorMessages);


        if (ErrorMessages.Count == 0)
        {
            using (var db = new schedulerEntities())
            {
                var invoiceToSave = (invoice.InvoiceID != 0) ?
                    db.Invoices.Where(i => i.InvoiceID == invoice.InvoiceID)
                    .FirstOrDefault() : invoice;
                if (invoiceToSave != null)
                {
                    invoiceToSave = invoice;
                    db.Invoices.AddOrUpdate(invoiceToSave);
                    res = (db.SaveChanges() == 1);
                }
                else
                {
                    ErrorMessages.Add("InvoiceID given is not present on DB");
                }
            }
        }
        return res;
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

        if(Helpers.IsNotEmpty(invoice.InvoiceCreationDate) && 
            Helpers.IsNotEmpty(invoice.InvoiceDueDate) && 
            invoice.InvoiceCreationDate > invoice.InvoiceDueDate)
            ErrorMessages.Add("Invoice creation date must be earlier than invoice due date");
    }

    private static void ValidateDBFields(Invoice invoice, List<string> ErrorMessages)
    {
        using (var db = new schedulerEntities())
        {
            if (Helpers.IsNotEmpty(invoice.StatusID) && 
                !db.Customers.Any(c => c.CustomerID == invoice.CustomerID))
                ErrorMessages.Add("CustomerID not found");

            if (Helpers.IsNotEmpty(invoice.StatusID) && 
                !db.Status.Any(i => i.StatusID == invoice.StatusID))
                ErrorMessages.Add("StatusID not found");

            if (invoice.InvoiceID == 0 && db.Invoices
                .Any(i => i.InvoiceNumber == invoice.InvoiceNumber))
                ErrorMessages.Add("InvoiceNumber already present in DB");

            if (invoice.InvoiceID == 0 && db.Invoices
                .Any(i => i.InvoiceOrderNumber == invoice.InvoiceOrderNumber))
                ErrorMessages.Add("InvoiceOrderNumber already present in DB");
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
        using (var db = new schedulerEntities())
        {
            db.Configuration.ProxyCreationEnabled = false; // plain POCOs
            db.Configuration.LazyLoadingEnabled = false;
            var query = db.Invoices
                .AsNoTracking()
                .Where(i=>i.InvoiceActive == "Y");
            if (Helpers.IsNotEmpty(filters.InvoiceNumber)) query = query
                    .Where(i => i.InvoiceNumber == filters.InvoiceNumber);
            if (Helpers.IsNotEmpty(filters.InvoiceOrderNumber)) query = query
                    .Where(i => i.InvoiceOrderNumber == filters.InvoiceOrderNumber);
            //if (Helpers.IsNotEmpty(filters.CustomerName)) query = query
            //        .Where(invoice => invoice.Customer.CustomerName == filters.CustomerName);
            if (Helpers.IsNotEmpty(filters.CustomerId)) query = query
                    .Where(i => i.Customer.CustomerID == customerId);
            if (statusId != 0) query = query.Where(i => i.StatusID == statusId);
            if (Helpers.ValidYear(year)) query = query
                    .Where(i => i.InvoiceDueDate.Year == year);
            if (Helpers.ValidMonth(month)) query = query
                    .Where(i => i.InvoiceDueDate.Month == month);
            query = query.Include(c => c.Customer).Include(s => s.Status);
            invoicesFound = query.ToList().Select(i=> new InvoiceDTO(i, GetStatusCode(i))).ToList();     
        }
        return invoicesFound;
    }

    public static string GetStatusCode(Invoice i)
    {
        DateTime DueDate = i.InvoiceDueDate;
        string StatusLabel = i.Status.StatusLabel;
        string StatusCode = "-1";
        if (StatusLabel == Helpers.Paid)
        {
            StatusCode = "0";
        }
        else
        {
            StatusCode = DueDate > DateTime.UtcNow ? "1" : "2";
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

    public static bool Delete(string invoiceIdString)
    {
        bool result = false;
        int invoiceId = -1;
        if(int.TryParse(invoiceIdString, out invoiceId))
        {
            using (var db = new schedulerEntities())
            {
                var invoiceToDelete = db.Invoices
                    .SingleOrDefault(i => i.InvoiceID == invoiceId);
                if (invoiceToDelete != null)
                {
                    invoiceToDelete.InvoiceActive = "N";
                    db.Invoices.AddOrUpdate(invoiceToDelete);
                    result = (db.SaveChanges() == 1);
                }
            }
        }
        return result;
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