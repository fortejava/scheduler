<%@ WebHandler Language="C#" Class="GetAllStatuses" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Get all invoice statuses (e.g., "Paid", "Unpaid").
/// Authorization: ValidToken (all authenticated users can view statuses)
/// </summary>
public class GetAllStatuses : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.ValidToken; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Get all statuses from database
        return StatusesService.GetAllStatuses();
    }
}