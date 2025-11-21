<%@ WebHandler Language="C#" Class="HardDeleteInvoice" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Permanently delete invoice from database (irreversible hard delete).
/// Authorization: AdminOnly (only administrators can permanently delete data)
/// </summary>
public class HardDeleteInvoice : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.AdminOnly; }
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

        // Hard delete invoice (throws ServiceException if fails)
        InvoicesService.HardDelete(invoiceId);

        // Return success message
        return string.Format("Fattura {0} eliminata definitivamente", invoiceId);
    }
}
