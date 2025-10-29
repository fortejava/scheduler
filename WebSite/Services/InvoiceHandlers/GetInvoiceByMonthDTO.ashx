<%@ WebHandler Language="C#" Class="GetInvoiceByMonthDTO" %>

using System;
using System.Web;
using System.Collections.Generic;
using DBEngine;
using System.Linq;
using Newtonsoft.Json;

public class GetInvoiceByMonthDTO : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) 
    {
        string monthStr = context.Request.Form["Month"];
        string yearStr = context.Request.Form["Year"];
        Response r = new Response("Ko", null);
        monthStr = "2";
        yearStr = "2025";
        int month;
        int year;
        if(int.TryParse(monthStr, out month) && int.TryParse(yearStr, out year))
        {
            List<InvoiceDTO> invoicesFound = InvoicesService.GetInvoicesByMonthDTO(month, year);
            if(invoicesFound.Count > 0)
            {
                r.Code = "OK";
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