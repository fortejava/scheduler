<%@ WebHandler Language="C#" Class="GetAllInvoiceYears" %>

using System;
using System.Web;
using System.Collections.Generic;
using DBEngine;
using System.Diagnostics;
using Newtonsoft.Json;

public class GetAllInvoiceYears : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
            Response r = new Response("", "");
            List<int> years = InvoicesService.GetAllInvoiceYears();
            r.Code = "Ok";
            r.Message = new
            {
                Years = years
            };
            context.Response.ContentType = "application/json";
            context.Response.Write(JsonConvert.SerializeObject(r));
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}