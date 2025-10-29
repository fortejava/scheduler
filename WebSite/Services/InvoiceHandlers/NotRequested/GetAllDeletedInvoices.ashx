<%@ WebHandler Language="C#" Class="GetAllDeletedInvoices" %>

using System;
using System.Web;
using System.Collections.Generic;
using DBEngine;
using System.Diagnostics;
using Newtonsoft.Json;

public class GetAllDeletedInvoices : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        Response r = new Response("Ko", null);
        List<Invoice> invoicesFound = InvoicesService.GetAllDeleted(false);
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