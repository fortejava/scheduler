<%@ WebHandler Language="C#" Class="SearchCustomer" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Search customers by name or return all customers.
/// Authorization: ValidToken (all authenticated users can search customers)
/// </summary>
public class SearchCustomer : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.ValidToken; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Get search parameter (optional, PascalCase)
        string customerName = context.Request.Form["CustomerName"];

        // If customerName provided and not empty: filter by name
        // If customerName empty or null: return all customers
        if (Helpers.IsNotEmpty(customerName))
        {
            return CustomersService.FilterByName(customerName, false);
        }
        else
        {
            return CustomersService.GetAllCustomers(false);
        }
    }
}