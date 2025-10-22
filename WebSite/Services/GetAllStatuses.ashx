<%@ WebHandler Language="C#" Class="GetAllStatuses" %>

using System;
using System.Web;
using System.Collections.Generic;
using DBEngine;
using System.Diagnostics;
using Newtonsoft.Json;

public class GetAllStatuses : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
            Response r = new Response("Ko", "");
            List<Status> statusesFound = StatusesService.GetAllStatuses(false);
            if (statusesFound.Count > 0)
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