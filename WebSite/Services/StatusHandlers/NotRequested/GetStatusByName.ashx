<%@ WebHandler Language="C#" Class="GetStatusByName" %>

using System;
using System.Web;
using DBEngine;
using System.Diagnostics;
using Newtonsoft.Json;

public class GetStatusByName : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
            string statusLabel = context.Request.Form["statusLabel"];
            Response r = new Response("Ko", null);
            Status statusesFound = StatusesService.GetStatusByName(statusLabel);
            if (statusesFound!= null)
            {
                r.Code = "Ok";
                r.Message = statusesFound;
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