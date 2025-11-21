<%@ WebHandler Language="C#" Class="DeleteCustomer" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Delete customer handler using BaseHandler pattern.
/// IMPORTANT: This is a HARD DELETE (permanent removal).
/// STRICT VALIDATION: Validates that NO invoices (active or deleted) are associated.
/// Authorization: AdminOrUser (Admin and User can delete customers, Visitor cannot)
/// </summary>
public class DeleteCustomer : BaseHandler
{
    // AdminOrUser: Only Admin and User can delete customers (Visitor forbidden)
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.AdminOrUser; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Get customer ID from request
        string customerIdString = context.Request.Form["CustomerID"];

        // Parse customer ID (handler validates format before calling service)
        int customerId;
        if (!int.TryParse(customerIdString, out customerId))
        {
            throw new ServiceException("CustomerID non valido (formato non corretto)");
        }

        // Call service (throws ServiceException if validation fails or invoices exist)
        Customer deletedCustomer = CustomersService.Delete(customerId);

        // Return success with customer data
        return new
        {
            CustomerID = deletedCustomer.CustomerID,
            CustomerName = deletedCustomer.CustomerName,
            Message = "Cliente eliminato con successo"
        };
    }
}
