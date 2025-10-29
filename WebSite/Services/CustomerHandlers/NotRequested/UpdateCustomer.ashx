<%@ WebHandler Language="C#" Class="UpdateCustomer" %>

using System;
using System.Web;
using Newtonsoft.Json;
using System.Collections.Generic;
public class UpdateCustomer : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        string customerIdString = context.Request.Form["customerID"];
        string newCustomerName = context.Request.Form["newCustomerName"];
        int customerId;
        customerIdString = "2";
        newCustomerName = "Cesare";
        Response r = new Response("Ko", null);
        var ErrorMessages = new List<string>();
        if(int.TryParse(customerIdString, out customerId))
        {
            r.Code = CustomersService.CreateOrUpdate(newCustomerName, out ErrorMessages, customerId) ? "Ok" : "Ko";
        }
        if(ErrorMessages.Count > 0)
        {
            r.Message = new
            {
                ErrorMessages = ErrorMessages
            };
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