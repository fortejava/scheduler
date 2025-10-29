<%@ WebHandler Language="C#" Class="GetCustomerByID" %>

using System;
using System.Web;
using Newtonsoft.Json;
using DBEngine;

public class GetCustomerByID : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        string customerIdString = context.Request.Form["customerID"];
        int customerId;
        customerIdString = "1";
        Response r = new Response("Ko", null);
        Customer customerFound = null;
        if(int.TryParse(customerIdString, out customerId))
        {
            customerFound = CustomersService.GetById(customerId, false);
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