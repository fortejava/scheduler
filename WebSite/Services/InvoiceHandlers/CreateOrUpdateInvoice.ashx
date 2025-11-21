<%@ WebHandler Language="C#" Class="CreateOrUpdateInvoice" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Create or update invoice handler using BaseHandler pattern.
/// Replaces CreateOrUpdateInvoice.ashx with cleaner, more maintainable code.
/// Authorization: AdminOrUser (Admin and User can create/update invoices, Visitor cannot)
/// </summary>
public class CreateOrUpdateInvoice: BaseHandler
{
    // AdminOrUser: Only Admin and User can create/update invoices (Visitor forbidden)
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.AdminOrUser; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Build Invoice entity from request parameters
        Invoice invoice = BuildInvoiceFromRequest(context);

        // Call service method (throws ValidationException if validation fails)
        Invoice savedInvoice = InvoicesService.CreateOrUpdate(invoice);

        // Determine if this was a CREATE or UPDATE operation
        bool isNew = (invoice.InvoiceID == 0 || invoice.InvoiceID == -1);

        // Return success data (matches old handler response structure)
        return new
        {
            InvoiceID = savedInvoice.InvoiceID,
            IsNew = isNew
        };
    }

    /// <summary>
    /// Build Invoice entity from HTTP request form parameters.
    /// Handles parsing and default values.
    /// </summary>
    /// <param name="context">HTTP context containing form data</param>
    /// <returns>Invoice entity populated from request</returns>
    private Invoice BuildInvoiceFromRequest(HttpContext context)
    {
        // Parse invoice ID (0 or -1 = CREATE, >0 = UPDATE)
        int invoiceID = -1;
        int.TryParse(context.Request.Form["InvoiceID"], out invoiceID);

        // Parse customer ID
        int customerID = -1;
        int.TryParse(context.Request.Form["CustomerID"], out customerID);

        // Parse status ID
        int statusID = -1;
        int.TryParse(context.Request.Form["StatusID"], out statusID);

        // Parse decimal values
        decimal invoiceTaxable = -1;
        decimal.TryParse(context.Request.Form["InvoiceTaxable"], out invoiceTaxable);

        decimal invoiceTax = -1;
        decimal.TryParse(context.Request.Form["InvoiceTax"], out invoiceTax);

        decimal invoiceDue = -1;
        decimal.TryParse(context.Request.Form["InvoiceDue"], out invoiceDue);

        // Parse dates (default to year 1800 to indicate invalid/missing date)
        DateTime creationDate = new DateTime(1800, 01, 01);
        DateTime.TryParse(context.Request.Form["CreationDate"], out creationDate);

        DateTime dueDate = creationDate;
        DateTime.TryParse(context.Request.Form["DueDate"], out dueDate);

        // Get string values from request
        // ASP.NET ValidateRequest (second guardrail) will throw HttpRequestValidationException if HTML detected
        // We use separate try-catch for each field to provide FIELD-SPECIFIC error messages
        // This allows user to know exactly which field contains invalid characters
        string invoiceNumber = null;
        string invoiceOrderNumber = null;
        string description = null;

        // Field 1: InvoiceNumber
        try
        {
            invoiceNumber = context.Request.Form["InvoiceNumber"];
        }
        catch (System.Web.HttpRequestValidationException)
        {
            // ASP.NET caught dangerous input in InvoiceNumber field
            // Provide field-specific Italian error message
            throw new ValidationException("Numero fattura non può contenere caratteri HTML speciali: < > \" '");
        }

        // Field 2: InvoiceOrderNumber
        try
        {
            invoiceOrderNumber = context.Request.Form["InvoiceOrderNumber"];
        }
        catch (System.Web.HttpRequestValidationException)
        {
            // ASP.NET caught dangerous input in InvoiceOrderNumber field
            // Provide field-specific Italian error message
            throw new ValidationException("Numero ordine non può contenere caratteri HTML speciali: < > \" '");
        }

        // Field 3: Description
        try
        {
            description = context.Request.Form["Description"];
        }
        catch (System.Web.HttpRequestValidationException)
        {
            // ASP.NET caught dangerous input in Description field
            // Provide field-specific Italian error message
            throw new ValidationException("Descrizione fattura non può contenere caratteri HTML speciali: < > \" '");
        }

        // Build Invoice entity
        var invoice = new Invoice
        {
            InvoiceID = invoiceID,
            InvoiceNumber = invoiceNumber,
            InvoiceOrderNumber = invoiceOrderNumber,
            CustomerID = customerID,
            StatusID = statusID,
            InvoiceTaxable = invoiceTaxable,
            // Smart InvoiceTax detection: if already decimal (0-1), use as-is; if percentage (>1), convert
            InvoiceTax = (invoiceTax > 0 && invoiceTax <= 1) ? invoiceTax : invoiceTax / 100m,
            InvoiceDue = invoiceDue,
            InvoiceCreationDate = creationDate,
            InvoiceDueDate = dueDate,
            InvoiceDescription = description,
            InvoiceActive = "Y"  // New invoices are active by default
        };

        return invoice;
    }
}