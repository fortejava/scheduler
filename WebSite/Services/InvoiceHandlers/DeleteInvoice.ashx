<%@ WebHandler Language="C#" Class="DeleteInvoice" %>

using System;
using System.Web;
using System.Collections.Generic;
using DBEngine;
using Newtonsoft.Json;

public class DeleteInvoice : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        string invoiceIdString = context.Request.Form["InvoiceID"];
        //invoiceIdString = "25";

        Response r = new Response("Ko", null);
        List<string> errorMessages;

        if (InvoicesService.Delete(invoiceIdString, out errorMessages))
        {
            r.Code = "Ok";
            r.Message = "Fattura eliminata correttamente";
        }
        else
        {
            r.Code = "Ko";
            r.Message = errorMessages;
        }

        context.Response.ContentType = "application/json";
        context.Response.Write(JsonConvert.SerializeObject(r));
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}
