<%@ WebHandler Language="C#" Class="GetInvoiceByMonthDTO" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Get invoices by month and year with DTO (includes status code).
/// Authorization: ValidToken (all authenticated users can view invoices)
/// </summary>
public class GetInvoiceByMonthDTO : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.ValidToken; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Parse month and year parameters
        string monthStr = context.Request.Form["Month"];
        string yearStr = context.Request.Form["Year"];
        int month;
        int year;

        if (!int.TryParse(monthStr, out month) || !int.TryParse(yearStr, out year))
        {
            throw new ServiceException(string.Format("Formato Mese o Anno non valido (Mese: '{0}', Anno: '{1}'). Entrambi devono essere numeri.", monthStr, yearStr));
        }

        // Validate month range (1-12)
        if (month < 1 || month > 12)
        {
            throw new ServiceException(string.Format("Il mese deve essere compreso tra 1 e 12 (valore ricevuto: {0})", month));
        }

        // Get invoices by month and year
        return InvoicesService.GetInvoicesByMonthDTO(month, year);
    }
}