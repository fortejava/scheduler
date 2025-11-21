<%@ WebHandler Language="C#" Class="DeleteUser" %>

using System;
using System.Web;

/// <summary>
/// DeleteUser - Delete a user by ID
///
/// Security:
///   - Admin-only endpoint
///   - Prevents admin from deleting themselves
///
/// Endpoint: POST /Services/UserHandlers/DeleteUser.ashx
/// Parameters:
///   - userId (int, required)
///
/// Returns:
///   OK: { Message: "Utente eliminato con successo" }
///   KO: { Message: "Error message" }
///   OUT: Not authorized (non-admin user or no token)
///
/// Protection:
///   - Admin cannot delete their own account while logged in
///   - Check userId != currentUserId
/// </summary>
public class DeleteUser : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.AdminOnly; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Get parameter
        string userIdStr = context.Request.Form["userId"];

        // Validate input
        if (string.IsNullOrWhiteSpace(userIdStr))
        {
            throw new ValidationException("ID utente obbligatorio");
        }

        int userId;
        if (!int.TryParse(userIdStr, out userId))
        {
            throw new ValidationException("ID utente non valido");
        }

        // SECURITY: Prevent admin from deleting themselves
        // Get current user ID from token
        string token = context.Request.Form["token"];
        SimpleTokenManager.TokenInfo tokenInfo;
        if (SimpleTokenManager.ValidateToken(token, out tokenInfo))
        {
            if (userId == tokenInfo.UserId)
            {
                throw new ServiceException("Non puoi eliminare il tuo account mentre sei connesso");
            }
        }

        // Call service
        var response = UserService.DeleteUser(userId);

        if (response.Code == "Ok")
        {
            return new { Message = "Utente eliminato con successo" };
        }

        // If not Ok, throw exception
        throw new ServiceException(response.Message.ToString());
    }
}
