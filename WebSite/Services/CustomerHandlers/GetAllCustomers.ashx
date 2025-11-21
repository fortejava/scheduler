<%@ WebHandler Language="C#" Class="GetAllCustomers" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Get all active customers from database.
/// Authorization: ValidToken (all authenticated users can view customers)
/// </summary>
public class GetAllCustomers : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.ValidToken; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Get all active customers (LazyLoading = false for performance)
        return CustomersService.GetAllCustomers(false);
    }
}
