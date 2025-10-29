<%@ WebHandler Language="C#" Class="CreateCustomer" %>

using System;
using System.Web;
using Newtonsoft.Json;
using System.Collections.Generic;

public class CreateCustomer : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        string newCustomerName = context.Request.Form["newCustomerName"];
        //newCustomerName = "Cesare2";
        Response r = new Response("Ko", null);
        List<string> ErrorMessages;
        r.Code = CustomersService.CreateOrUpdate(newCustomerName, out ErrorMessages) ? "Ok" : "Ko";
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