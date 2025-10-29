<%@ WebHandler Language="C#" Class="InvoiceYears" %>

using System;
using System.Web;
using System.Collections.Generic;
using DBEngine;
using System.Diagnostics;
using Newtonsoft.Json;

public class InvoiceYears : IHttpHandler {

    public void ProcessRequest (HttpContext context) 
    {
        var years = InvoicesService.GetDueDateYears() ?? new List<int>();
        Response r = new Response("Ok", new{ Years = years });
        context.Response.ContentType = "application/json";
        context.Response.Write(JsonConvert.SerializeObject(r));
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

}