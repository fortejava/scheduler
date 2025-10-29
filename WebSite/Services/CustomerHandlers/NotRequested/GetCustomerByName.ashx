<%@ WebHandler Language="C#" Class="GetCustomerByName" %>

using System;
using System.Web;
using Newtonsoft.Json;
using DBEngine;

public class GetCustomerByName : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        string customerName = context.Request.Form["customerName"];
        customerName = "Cesare";
        Response r = new Response("Ko", null);
        Customer customerFound = null;
        if(Helpers.IsNotEmpty(customerName))
        {
            customerFound = CustomersService.GetByName(customerName, false);
            r.Code = (customerFound != null) ? "Ok" : "Ko";
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