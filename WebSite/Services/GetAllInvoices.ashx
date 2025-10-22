<%@ WebHandler Language="C#" Class="GetAllInvoices" %>

using System;
using System.Web;
using System.Collections.Generic;
using DBEngine;
using System.Diagnostics;
using Newtonsoft.Json;

public class GetAllInvoices : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
            Response r = new Response("", "");
            List<Invoice> invoicesFound = InvoicesService.GetAllInvoices(false);
            if (invoicesFound.Count > 0)
            {
                r.Code = "Ok";
                r.Message = invoicesFound;
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