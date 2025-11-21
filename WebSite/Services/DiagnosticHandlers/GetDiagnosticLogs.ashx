<%@ WebHandler Language="C#" Class="GetDiagnosticLogs" %>

using System;
using System.Web;
using Newtonsoft.Json;

/// <summary>
/// Handler to fetch diagnostic logs for viewing in HTML page.
/// No authentication required (diagnostic tool only).
/// </summary>
public class GetDiagnosticLogs : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";

        // Get action parameter (all, last, clear, stats)
        string action = context.Request.QueryString["action"] ?? "all";

        object result;

        switch (action.ToLower())
        {
            case "last":
                // Get last N logs
                int count = 50;
                int.TryParse(context.Request.QueryString["count"], out count);
                result = new
                {
                    Status = "Ok",
                    Action = "last",
                    Count = count,
                    Logs = DiagnosticLogger.GetLastLogs(count)
                };
                break;

            case "since":
                // Get logs since timestamp
                DateTime since;
                if (DateTime.TryParse(context.Request.QueryString["timestamp"], out since))
                {
                    result = new
                    {
                        Status = "Ok",
                        Action = "since",
                        Since = since,
                        Logs = DiagnosticLogger.GetLogsSince(since)
                    };
                }
                else
                {
                    result = new { Status = "Error", Message = "Invalid timestamp parameter" };
                }
                break;

            case "clear":
                // Clear all logs
                DiagnosticLogger.Clear();
                result = new
                {
                    Status = "Ok",
                    Action = "clear",
                    Message = "All logs cleared"
                };
                break;

            case "stats":
                // Get statistics
                result = new
                {
                    Status = "Ok",
                    Action = "stats",
                    Stats = DiagnosticLogger.GetStats()
                };
                break;

            case "all":
            default:
                // Get all logs
                result = new
                {
                    Status = "Ok",
                    Action = "all",
                    Logs = DiagnosticLogger.GetLogs()
                };
                break;
        }

        // Return JSON
        context.Response.Write(JsonConvert.SerializeObject(result, Formatting.Indented));
    }

    public bool IsReusable
    {
        get { return false; }
    }
}
