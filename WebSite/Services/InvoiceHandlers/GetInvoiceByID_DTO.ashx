<%@ WebHandler Language="C#" Class="GetInvoiceByID_DTO" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Get invoice by ID with DTO (includes status code).
/// Authorization: ValidToken (all authenticated users can view invoices)
/// </summary>
public class GetInvoiceByID_DTO : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.ValidToken; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Parse invoice ID from request
        string invoiceIdString = context.Request.Form["InvoiceID"];
        int invoiceId;

        if (!int.TryParse(invoiceIdString, out invoiceId))
        {
            throw new ServiceException(string.Format("Formato InvoiceID non valido: '{0}'", invoiceIdString));
        }

        // Get invoice by ID with DTO
        InvoiceDTO invoice = InvoicesService.GetByIdDTO(invoiceId);

        if (invoice == null)
        {
            throw new ServiceException(string.Format("Fattura con ID {0} non trovata", invoiceId));
        }

        return invoice;
    }
}