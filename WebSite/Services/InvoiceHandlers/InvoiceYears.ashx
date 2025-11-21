<%@ WebHandler Language="C#" Class="InvoiceYears" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Get list of years that have invoices (for dropdown/filter).
/// Authorization: ValidToken (all authenticated users can view invoice years)
/// </summary>
public class InvoiceYears : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.ValidToken; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Get distinct years from invoice due dates
        var years = InvoicesService.GetDueDateYears();

        // Wrap in object to match frontend expectation: { Years: [...] }
        return new { Years = years };
    }
}