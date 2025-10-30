<%@ WebHandler Language="C#" Class="GetInvoices" %>

using System;
using System.Web;
using System.Collections.Generic;
using DBEngine;
using System.Diagnostics;
using Newtonsoft.Json;

public class GetInvoices : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        var filters = new InvoiceFilters();
        filters.InvoiceNumber = context.Request.Form["InvoiceNumber"];
        filters.InvoiceOrderNumber = context.Request.Form["InvoiceOrderNumber"];
        filters.CustomerName = context.Request.Form["CustomerName"];
        filters.CustomerId = context.Request.Form["CustomerId"];
        filters.StatusId = context.Request.Form["StatusId"];
        filters.Year = context.Request.Form["Year"];
        filters.Month = context.Request.Form["Month"];
        //statusId = "1";
        //filters.Month = "2";
        //year = "2025";
        //invoiceNumber = "3"; 
        //invoiceOrderNumber = "3";
        //customerName = "peppo"; -- chiarire mi arriva il CustomerName completto
        //o l'id del Customer? (ricerca per StartWith o filterByName???) -- Botta
        Response r = new Response("Ko", null);
        List<InvoiceDTO> invoicesFound = InvoicesService
                .Search(filters);
        if (invoicesFound.Count > 0)
        {
            r.Code = "Ok";
            r.Message = invoicesFound;
        }
        context.Response.ContentType = "application/json";
        context.Response.Write(Helpers.JsonSerialize(r));

    }

    public bool IsReusable {
        get {
            return false;
        }
    }

}
