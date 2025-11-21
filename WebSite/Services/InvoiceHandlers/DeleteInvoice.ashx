<%@ WebHandler Language="C#" Class="DeleteInvoice" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Delete invoice handler using BaseHandler pattern.
/// Replaces DeleteInvoice.ashx with cleaner, more maintainable code.
/// Authorization: AdminOrUser (Admin and User can delete invoices, Visitor cannot)
/// </summary>
public class DeleteInvoice : BaseHandler
{
    // AdminOrUser: Only Admin and User can delete invoices (Visitor forbidden)
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.AdminOrUser; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Get invoice ID from request
        string invoiceIdString = context.Request.Form["InvoiceID"];

        // Parse invoice ID (handler validates format before calling service)
        int invoiceId;
        if (!int.TryParse(invoiceIdString, out invoiceId))
        {
            throw new ServiceException("InvoiceID non valido (formato non corretto)");
        }

        // Call service (throws ServiceException if validation fails)
        Invoice deletedInvoice = InvoicesService.Delete(invoiceId);

        // Return success with invoice data
        return new
        {
            InvoiceID = deletedInvoice.InvoiceID,
            InvoiceNumber = deletedInvoice.InvoiceNumber,
            Message = "Fattura eliminata con successo"
        };
    }
}
