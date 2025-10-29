<%@ WebHandler Language="C#" Class="GetStatusByID" %>

using System;
using System.Web;
using DBEngine;
using System.Diagnostics;
using Newtonsoft.Json;

public class GetStatusByID : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
            string statusIdString = context.Request.Form["statusID"];
            statusIdString = "1";
            Response r = new Response("Ko", null);
            int statusId = 0;
            if (int.TryParse(statusIdString, out statusId))
            {
                Status statusesFound = StatusesService.GetStatusById(statusId);
                if (statusesFound!= null)
                {
                    r.Code = "Ok";
                    r.Message = statusesFound;
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