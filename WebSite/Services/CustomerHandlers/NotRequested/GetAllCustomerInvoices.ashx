<%@ WebHandler Language="C#" Class="GetAllCustomerInvoices" %>

using System;
using System.Web;
using DBEngine;
using System.Linq;
using Newtonsoft.Json;
using System.Collections.Generic;

public class GetAllCustomerInvoices : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        string customerIdStr = context.Request.Form["CustomerID"];
        Response r = new Response("Ko", null);
        customerIdStr = "1";
        int customerId = 0;
        if(int.TryParse(customerIdStr, out customerId))
        {
            List<Customer> invoicesFound;
            if (CustomersService.GetAllCustomerInvoices(customerId, out invoicesFound))
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