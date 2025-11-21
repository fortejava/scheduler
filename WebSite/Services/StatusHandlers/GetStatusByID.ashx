<%@ WebHandler Language="C#" Class="GetStatusByID" %>

using System;
using System.Web;
using DBEngine;

/// <summary>
/// Get status by ID.
/// Authorization: ValidToken (all authenticated users can view statuses)
/// </summary>
public class GetStatusByID : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.ValidToken; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Parse status ID from request (PascalCase with uppercase "ID")
        string statusIdString = context.Request.Form["StatusID"];
        int statusId;

        if (!int.TryParse(statusIdString, out statusId))
        {
            throw new ServiceException(string.Format("Formato StatusID non valido: '{0}'", statusIdString));
        }

        // Get status by ID
        Status status = StatusesService.GetStatusById(statusId);

        if (status == null)
        {
            throw new ServiceException(string.Format("Stato con ID {0} non trovato", statusId));
        }

        return status;
    }
}