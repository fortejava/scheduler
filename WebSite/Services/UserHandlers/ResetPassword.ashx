<%@ WebHandler Language="C#" Class="ResetPassword" %>

using System;
using System.Web;

/// <summary>
/// ResetPassword - Reset a user's password (admin function)
///
/// Security:
///   - Admin-only endpoint
///   - No verification of old password required (admin override)
///
/// Endpoint: POST /Services/UserHandlers/ResetPassword.ashx
/// Parameters:
///   - userId (int, required)
///   - newPassword (string, required, min 8 chars)
///
/// Returns:
///   OK: { Message: "Password reimpostata con successo" }
///   KO: { Message: "Error message" }
///   OUT: Not authorized (non-admin user or no token)
///
/// Validation:
///   - Password: minimum 8 characters
///   - User must exist
/// </summary>
public class ResetPassword : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.AdminOnly; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Get parameters
        string userIdStr = context.Request.Form["userId"];
        string newPassword = context.Request.Form["newPassword"];

        // Validate inputs
        if (string.IsNullOrWhiteSpace(userIdStr))
        {
            throw new ValidationException("ID utente obbligatorio");
        }

        if (string.IsNullOrWhiteSpace(newPassword))
        {
            throw new ValidationException("La nuova password è obbligatoria");
        }

        int userId;
        if (!int.TryParse(userIdStr, out userId))
        {
            throw new ValidationException("ID utente non valido");
        }

        if (newPassword.Length < 8)
        {
            throw new ValidationException("La password deve essere di almeno 8 caratteri");
        }

        // Call service
        var response = UserService.ResetPassword(userId, newPassword);

        if (response.Code == "Ok")
        {
            return new { Message = "Password reimpostata con successo" };
        }

        // If not Ok, throw exception
        throw new ServiceException(response.Message.ToString());
    }
}
