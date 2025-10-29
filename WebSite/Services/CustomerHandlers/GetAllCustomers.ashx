<%@ WebHandler Language="C#" Class="GetAllCustomers" %>

using System;
using System.Web;
using DBEngine;
using Newtonsoft.Json;
using System.Collections.Generic;

public class GetAllCustomers : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        Response r = new Response("Ko", null);
        List<Customer> customersFound = CustomersService.GetAllCustomers(false);
        if (customersFound.Count > 0)
        {
            r.Code = "Ok";
            r.Message = customersFound;
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
