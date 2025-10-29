<%@ WebHandler Language="C#" Class="CreateOrUpdateInvoice" %>

using System;
using System.Web;
using System.Collections.Generic;
using DBEngine;
using System.Diagnostics;
using Newtonsoft.Json;

public class CreateOrUpdateInvoice : IHttpHandler {

    public void ProcessRequest (HttpContext context) {


        string invoiceIdString = context.Request.Form["InvoiceID"];
        string invoiceNumber = context.Request.Form["InvoiceNumber"];
        string invoiceOrderNumber = context.Request.Form["InvoiceOrderNumber"];
        string customerIdString = context.Request.Form["CustomerID"];
        string statusIdString = context.Request.Form["StatusID"];
        string invoiceTaxableString = context.Request.Form["InvoiceTaxable"];
        string invoiceTaxString = context.Request.Form["InvoiceTax"];
        string invoiceDueString = context.Request.Form["InvoiceDue"];
        string creationDateString = context.Request.Form["CreationDate"];
        string dueDateString = context.Request.Form["DueDate"];
        string description = context.Request.Form["Description"];

        Response r = new Response("Ko", null);

        //Inizializziamo le variabili a meno 1 per renderle inutilizzabili
        int invoiceID = -1;
        int.TryParse(invoiceIdString, out invoiceID);

        int customerID = -1;
        int.TryParse(customerIdString, out customerID);

        int statusID = -1;
        int.TryParse(statusIdString, out statusID);

        decimal invoiceTaxable = -1;
        decimal.TryParse(invoiceTaxableString, out invoiceTaxable);

        decimal invoiceTax = -1;
        decimal.TryParse(invoiceTaxString, out invoiceTax);

        decimal invoiceDue = -1;
        decimal.TryParse(invoiceDueString, out invoiceDue);

        DateTime creationDate = new DateTime(1800,01,01);
        DateTime.TryParse(creationDateString, out creationDate);

        DateTime dueDate = creationDate;
        DateTime.TryParse(dueDateString, out dueDate);

        Invoice invoice = new Invoice();
        invoice.InvoiceNumber = invoiceNumber;
        invoice.InvoiceOrderNumber = invoiceOrderNumber;
        invoice.CustomerID = customerID;
        invoice.StatusID = statusID;
        invoice.InvoiceTaxable = invoiceTaxable;
        invoice.InvoiceTax = invoiceTax/100m;
        invoice.InvoiceDue = invoiceDue;
        invoice.InvoiceCreationDate = creationDate;
        invoice.InvoiceDueDate = dueDate;
        invoice.InvoiceDescription = description;
        invoice.InvoiceActive = "Y";
        invoice.InvoiceID = invoiceID;


        List<string> errorMessages;

        //invoice.InvoiceNumber = "INV-2025-013";
        //invoice.InvoiceOrderNumber = "ORD-1346";
        //invoice.CustomerID = 2;
        //invoice.StatusID = 1;
        //invoice.InvoiceTaxable = 1850.00m;
        //invoice.InvoiceTax = 0.23m;
        //invoice.InvoiceDue = 12000m;
        //invoice.InvoiceCreationDate = new DateTime(2025, 10, 27);
        //invoice.InvoiceDueDate = new DateTime(2025, 11, 14);
        //invoice.InvoiceDescription = "Test Invoice - Q4 Services";
        //invoice.InvoiceActive = "Y";
        //invoice.InvoiceID = 14;


        if (InvoicesService.CreateOrUpdate(invoice, out errorMessages))
        {
            r.Code = "Ok";
            r.Message = null;
        }
        else
        {
            r.Code = "Ko";
            r.Message = errorMessages;
        }

        context.Response.ContentType = "application/json";
        context.Response.Write(JsonConvert.SerializeObject(r));

    }

    public bool IsReusable {
        get {
            return false;
        }
    }

}