<%@ WebHandler Language="C#" Class="CreateOrUpdateCustomer" %>

using System;
using System.Web;
using Newtonsoft.Json;
using System.Collections.Generic;

public class CreateOrUpdateCustomer : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        string customerIdString = context.Request.Form["CustomerID"];
        string newCustomerName = context.Request.Form["CustomerName"];
        int customerId;
        //customerIdString = "2";
        //newCustomerName = "Cesare2";
        Response r = new Response("Ko", null);
        List<string> ErrorMessages;

        if(int.TryParse(customerIdString, out customerId))
        {
            r.Code = CustomersService.CreateOrUpdate(newCustomerName, out ErrorMessages, customerId) ? "Ok" : "Ko";
        }
        else
        {
            r.Code = CustomersService.CreateOrUpdate(newCustomerName, out ErrorMessages) ? "Ok" : "Ko";
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