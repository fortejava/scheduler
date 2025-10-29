<%@ WebHandler Language="C#" Class="GetAllInvoiceMonths" %>

using System;
using System.Web;
using System.Collections.Generic;
using DBEngine;
using System.Diagnostics;
using Newtonsoft.Json;

public class GetAllInvoiceMonths : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        var months = new List<int>();
        Response r = new Response("Ko", new
        {
            Months = months
        });
        months = InvoicesService.GetAllMonths();
        if(months != null)
        {
            r.Code = "Ok";
            r.Message = new
            {
                Months = months
            };
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