<%@ WebHandler Language="C#" Class="CreateUser" %>

using System;
using System.Web;

/// <summary>
/// CreateUser - Create a new user with specified role
///
/// Security: Admin-only endpoint
///
/// Endpoint: POST /Services/UserHandlers/CreateUser.ashx
/// Parameters:
///   - username (string, required, 3-100 chars)
///   - password (string, required, min 8 chars)
///   - roleId (int, required, 1-3)
///     1 = Admin, 2 = User, 3 = Visitor
///
/// Returns:
///   OK: { Message: "Utente creato con successo", UserID: 5 }
///   KO: { Message: "Error message" }
///   OUT: Not authorized (non-admin user or no token)
///
/// Validation:
///   - Username: 3-100 characters, unique
///   - Password: minimum 8 characters
///   - RoleID: must be 1, 2, or 3
/// </summary>
public class CreateUser : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.AdminOnly; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        // Get parameters
        string username = context.Request.Form["username"];
        string password = context.Request.Form["password"];
        string roleIdStr = context.Request.Form["roleId"];

        // Validate inputs
        if (string.IsNullOrWhiteSpace(username))
        {
            throw new ValidationException("Il nome utente è obbligatorio");
        }

        if (string.IsNullOrWhiteSpace(password))
        {
            throw new ValidationException("La password è obbligatoria");
        }

        if (string.IsNullOrWhiteSpace(roleIdStr))
        {
            throw new ValidationException("Il ruolo è obbligatorio");
        }

        int roleId;
        if (!int.TryParse(roleIdStr, out roleId))
        {
            throw new ValidationException("Ruolo non valido");
        }

        if (roleId < 1 || roleId > 3)
        {
            throw new ValidationException("Ruolo deve essere Admin (1), User (2), o Visitor (3)");
        }

        if (username.Length < 3 || username.Length > 100)
        {
            throw new ValidationException("Il nome utente deve essere tra 3 e 100 caratteri");
        }

        if (password.Length < 8)
        {
            throw new ValidationException("La password deve essere di almeno 8 caratteri");
        }

        // Call service
        int userId;
        var response = UserService.CreateUser(username, password, roleId, out userId);

        if (response.Code == "Ok")
        {
            return new
            {
                Message = "Utente creato con successo",
                UserID = userId
            };
        }

        // If not Ok, throw exception
        throw new ServiceException(response.Message.ToString());
    }
}
