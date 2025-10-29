<%@ WebHandler Language="C#" Class="SearchCustomer" %>

using System;
using System.Web;
using Newtonsoft.Json;
using DBEngine;
using System.Collections.Generic;

public class SearchCustomer : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        string customerName = context.Request.Form["customerName"];
        customerName = "";
        //customerName = "a";
        Response r = new Response("Ko", null);
        var customersFound = new List<Customer> ();
        if(Helpers.IsNotEmpty(customerName))
        {
            customersFound = CustomersService.FilterByName(customerName, false);
            r.Code = (customersFound.Count > 0) ? "Ok" : "Ko";
            r.Message = customersFound;
        }
        else if(customerName == "")
        {
            customersFound = CustomersService.GetAllCustomers(false);
            if (customersFound.Count > 0)
            {
                r.Code = "Ok";
                r.Message = customersFound;
            }
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