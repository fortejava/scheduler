<%@ WebHandler Language="C#" Class="BatchHardDeleteInvoices" %>

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using DBEngine;

/// <summary>
/// Permanently delete multiple invoices in batch.
/// Authorization: AdminOnly (only administrators can permanently delete data)
/// </summary>
public class BatchHardDeleteInvoices : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.AdminOnly; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Get comma-separated invoice IDs from request
        string invoiceIdsStr = context.Request.Form["InvoiceIDs"];

        if (string.IsNullOrWhiteSpace(invoiceIdsStr))
        {
            throw new ServiceException("Lista InvoiceIDs mancante o vuota");
        }

        // Parse comma-separated IDs into List<int>
        List<int> invoiceIds;
        try
        {
            invoiceIds = invoiceIdsStr
                .Split(',')
                .Select(id => int.Parse(id.Trim()))
                .ToList();
        }
        catch
        {
            throw new ServiceException("Formato InvoiceIDs non valido. Usa: 1,2,3");
        }

        // Batch delete (returns detailed result)
        BatchDeleteResult result = InvoicesService.BatchHardDelete(invoiceIds);

        // Return result object (BaseHandler will serialize to JSON)
        return result;
    }
}
