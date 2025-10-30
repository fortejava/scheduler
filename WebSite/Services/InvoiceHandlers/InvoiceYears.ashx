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
        Response r = new Response("Ok", new { Years = years });
        context.Response.ContentType = "application/json";
        context.Response.Write(JsonConvert.SerializeObject(r));
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

}


//public void ProcessRequest (HttpContext context)
//{
//    var years = InvoicesService.GetDueDateYears() ?? new List<int>();
//    Response r = new Response("Ok", new{ Years = years });
//    context.Response.ContentType = "application/json";
//    context.Response.Write(JsonConvert.SerializeObject(r));
//}


//string token = context.Request.Form["token"];
//string username = context.Request.Form["username"];
//username = "adminSuper";
//token = "E4824FE97EB27C954C84A6745392F2F2AB5FE23F578B6588628078D843A69211925ea17c-cc23-4f12-aff8-fefc18bed2a8";
//List<int> years;
//if (SimpleTokenManager.ValidateToken2(token, username))
//{
//    years = InvoicesService.GetDueDateYears();
//}
//else
//{
//    years = new List<int>();
//}
//Response r = new Response("Ok", new { Years = years });
//context.Response.ContentType = "application/json";
//context.Response.Write(JsonConvert.SerializeObject(r));