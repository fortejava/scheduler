<%@ WebHandler Language="C#" Class="FilterByNameCustomers" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Filter customers by name (partial match).
/// Authorization: ValidToken (all authenticated users can filter customers)
/// </summary>
public class FilterByNameCustomers : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.ValidToken; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Get filter parameter (PascalCase)
        string customerName = context.Request.Form["CustomerName"];

        if (!Helpers.IsNotEmpty(customerName))
        {
            throw new ServiceException("Il parametro CustomerName è obbligatorio");
        }

        // Filter customers by name (LazyLoading = false for performance)
        return CustomersService.FilterByName(customerName, false);
    }
}