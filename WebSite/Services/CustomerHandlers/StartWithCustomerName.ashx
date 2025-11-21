<%@ WebHandler Language="C#" Class="StartWithCustomerName" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Get customers whose name starts with specified prefix.
/// Authorization: ValidToken (all authenticated users can search customers)
/// </summary>
public class StartWithCustomerName : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.ValidToken; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Get search prefix parameter (PascalCase)
        string customerName = context.Request.Form["CustomerName"];

        if (!Helpers.IsNotEmpty(customerName))
        {
            throw new ServiceException("Il parametro CustomerName è obbligatorio");
        }

        // Get customers starting with prefix (LazyLoading = false for performance)
        return CustomersService.StartWith(customerName, false);
    }
}