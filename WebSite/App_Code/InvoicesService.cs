using DBEngine;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Data.Entity;
using System.Data.SqlClient;

/// <summary>
/// Summary description for InvoicesService
/// </summary>
public class InvoicesService
{
    public static List<int> GetAllInvoiceYears()
    {

        var db = new schedulerEntities();
        var invoicesDates = db.Invoices
            .Select(p => p.InvoiceDueDate.Year)
            .Distinct()
            .OrderByDescending(p => p)
            .ToList();

        return invoicesDates;
    }

    public static List<Invoice> GetAllInvoices(bool lazyLoading)
    {
        using (var db = new schedulerEntities())
        {
            db.Configuration.LazyLoadingEnabled = lazyLoading;
            return db.Invoices.ToList();
        }
    }

    public static Invoice GetInvoiceById(int id)
    {
        using (var db = new schedulerEntities())
        {
            return db.Invoices.Include(i => i.Customer).FirstOrDefault(p => p.InvoiceID == id);
        }
    }
}