<%@ WebHandler Language="C#" Class="DeleteCustomer" %>

using System;
using System.Web;
using System.Collections.Generic;
using Newtonsoft.Json;

public class DeleteCustomer : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        string customerIdString = context.Request.Form["CustomerID"];

        Response r = new Response("Ko", null);
        List<string> errorMessages;

        if (CustomersService.Delete(customerIdString, out errorMessages))
        {
            r.Code = "Ok";
            r.Message = "Cliente eliminato correttamente";
        }
        else
        {
            r.Code = "Ko";
            r.Message = errorMessages;  // Array of error messages
        }

        context.Response.ContentType = "application/json";
        context.Response.Write(JsonConvert.SerializeObject(r));
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}
