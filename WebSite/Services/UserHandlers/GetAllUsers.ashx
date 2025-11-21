<%@ WebHandler Language="C#" Class="GetAllUsers" %>

using System;
using System.Web;
using System.Linq;
using DBEngine;

/// <summary>
/// GetAllUsers - Retrieve list of all users with role information
///
/// Security: Admin-only endpoint
///
/// Endpoint: POST /Services/UserHandlers/GetAllUsers.ashx
/// Parameters: None (requires valid admin token)
///
/// Returns:
///   OK: {
///     Users: [
///       { UserID: 1, Username: "admin", RoleID: 1, RoleName: "Admin" },
///       { UserID: 2, Username: "user1", RoleID: 2, RoleName: "User" },
///       ...
///     ]
///   }
///   OUT: Not authorized (non-admin user or no token)
/// </summary>
public class GetAllUsers : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.AdminOnly; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        using (var db = new schedulerEntities())
        {
            // Retrieve all users with role information
            var users = db.Users
                .Select(u => new
                {
                    u.UserID,
                    u.Username,
                    u.RoleID,
                    RoleName = u.Role.RoleName
                })
                .OrderBy(u => u.Username)
                .ToList();

            // Return user list (BaseHandler automatically wraps in Response)
            return new { Users = users };
        }
    }
}
