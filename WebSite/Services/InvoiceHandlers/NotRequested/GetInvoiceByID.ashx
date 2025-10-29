<%@ WebHandler Language="C#" Class="GetInvoiceByID" %>

using System;
using System.Web;
using DBEngine;
using System.Diagnostics;

public class GetInvoiceByID : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        Response r = new Response("Ko", null);
        string invoiceIdString = context.Request.Form["invoiceID"];
        int invoiceId;
        invoiceIdString = "1";
        if(int.TryParse(invoiceIdString, out invoiceId))
        {
            Invoice invoicesFound = InvoicesService.GetById(invoiceId);
            if (invoicesFound!=null)
            {
                r.Code = "Ok";
                r.Message = invoicesFound;
            }
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