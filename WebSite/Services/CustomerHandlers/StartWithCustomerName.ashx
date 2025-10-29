<%@ WebHandler Language="C#" Class="StartWithCustomerName" %>

using System;
using System.Web;
using Newtonsoft.Json;
using DBEngine;
using System.Collections.Generic;

public class StartWithCustomerName : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        string customerName = context.Request.Form["customerName"];
        customerName = "a";
        Response r = new Response("Ko", null);
        var customerFound = new List<Customer> ();
        if(Helpers.IsNotEmpty(customerName))
        {
            customerFound = CustomersService.StartWith(customerName, false);
            r.Code = (customerFound.Count > 0) ? "Ok" : "Ko";
            r.Message = customerFound;
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