<%@ WebHandler Language="C#" Class="GetCustomerByID" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Get customer by ID.
/// Authorization: ValidToken (all authenticated users can view customers)
/// </summary>
public class GetCustomerByID : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.ValidToken; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Parse customer ID from request (PascalCase with uppercase "ID")
        string customerIdString = context.Request.Form["CustomerID"];
        int customerId;

        if (!int.TryParse(customerIdString, out customerId))
        {
            throw new ServiceException(string.Format("Formato CustomerID non valido: '{0}'", customerIdString));
        }

        // Get customer by ID (LazyLoading = false for performance)
        Customer customer = CustomersService.GetById(customerId, false);

        if (customer == null)
        {
            throw new ServiceException(string.Format("Cliente con ID {0} non trovato", customerId));
        }

        return customer;
    }
}