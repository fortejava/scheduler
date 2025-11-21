<%@ WebHandler Language="C#" Class="GetInvoices" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Search invoices with optional filters (InvoiceNumber, InvoiceOrderNumber, CustomerID, StatusID, Year, Month).
/// Authorization: ValidToken (all authenticated users can search invoices)
/// </summary>
public class GetInvoices : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.ValidToken; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // ========== CRITICAL VALIDATION: InvoiceActive REQUIRED ==========
        string invoiceActive = context.Request.Form["InvoiceActive"];

        // Validation 1: Check if parameter exists
        if (string.IsNullOrWhiteSpace(invoiceActive))
        {
            throw new ServiceException("Parametro 'InvoiceActive' mancante. Specificare 'Y' (attive) o 'N' (eliminate).");
        }

        // Validation 2: Check if value is valid (only Y or N, case-insensitive)
        string normalized = invoiceActive.ToUpper().Trim();
        if (normalized != "Y" && normalized != "N")
        {
            throw new ServiceException(string.Format(
                "Valore 'InvoiceActive' non valido: '{0}'. Valori ammessi: 'Y', 'N'.",
                invoiceActive
            ));
        }

        // Build filter object from request parameters (all optional except InvoiceActive)
        var filters = new InvoiceFilters
        {
            InvoiceNumber = context.Request.Form["InvoiceNumber"],
            InvoiceOrderNumber = context.Request.Form["InvoiceOrderNumber"],
            CustomerName = context.Request.Form["CustomerName"],
            CustomerId = context.Request.Form["CustomerID"],  // PascalCase with uppercase "ID"
            StatusId = context.Request.Form["StatusID"],      // PascalCase with uppercase "ID"
            Year = context.Request.Form["Year"],
            Month = context.Request.Form["Month"],
            InvoiceActive = normalized  // Use validated, normalized value
        };

        // Search with filters (returns empty list if no matches)
        return InvoicesService.Search(filters);
    }
}
