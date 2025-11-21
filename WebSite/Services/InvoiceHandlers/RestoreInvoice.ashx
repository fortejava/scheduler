<%@ WebHandler Language="C#" Class="RestoreInvoice" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Restore a soft-deleted invoice (set InvoiceActive = "Y").
/// Authorization: AdminOrUser (same as delete - symmetrical operations)
/// </summary>
public class RestoreInvoice : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.AdminOrUser; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Get invoice ID from request
        string invoiceIdStr = context.Request.Form["InvoiceID"];
        int invoiceId;

        if (!int.TryParse(invoiceIdStr, out invoiceId))
        {
            throw new ServiceException("InvoiceID non valido o mancante");
        }

        // Restore invoice (throws ServiceException if fails)
        Invoice restoredInvoice = InvoicesService.Restore(invoiceId);

        // Return success message
        return string.Format("Fattura {0} ripristinata con successo", restoredInvoice.InvoiceNumber);
    }
}
