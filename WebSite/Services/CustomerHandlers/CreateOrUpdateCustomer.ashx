<%@ WebHandler Language="C#" Class="CreateOrUpdateCustomer" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Create or update customer handler using BaseHandler pattern.
/// Replaces CreateOrUpdateCustomer.ashx with cleaner, more maintainable code.
/// Authorization: AdminOrUser (Admin and User can create/update customers, Visitor cannot)
/// </summary>
public class CreateOrUpdateCustomer: BaseHandler
{
    // AdminOrUser: Only Admin and User can create/update customers (Visitor forbidden)
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.AdminOrUser; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Get parameters from request
        string customerIdString = context.Request.Form["CustomerID"];
        string customerName = null;

        // Try to get CustomerName from request
        // ASP.NET ValidateRequest (first guardrail) will throw HttpRequestValidationException if HTML detected
        try
        {
            customerName = context.Request.Form["CustomerName"];
        }
        catch (System.Web.HttpRequestValidationException)
        {
            // ASP.NET caught dangerous input (first guardrail worked)
            // Provide user-friendly Italian error message (second guardrail - better UX)
            throw new ValidationException("Nome cliente non può contenere caratteri HTML speciali: < > \" '");
        }

        // Parse CustomerID (0 or -1 = CREATE, >0 = UPDATE)
        int customerId = 0;
        if (!string.IsNullOrEmpty(customerIdString))
        {
            int.TryParse(customerIdString, out customerId);
        }

        // Build Customer entity
        var customer = new Customer
        {
            CustomerID = customerId,
            CustomerName = customerName
        };

        // Call service (throws ValidationException if validation fails)
        // Service validation (third guardrail) checks for HTML tags that might have bypassed ASP.NET
        Customer savedCustomer = CustomersService.CreateOrUpdate(customer);

        // Return success data (matches old handler response structure)
        return new
        {
            CustomerID = savedCustomer.CustomerID,
            CustomerName = savedCustomer.CustomerName,
            IsNew = (customerId == 0 || customerId == -1)
        };
    }
}