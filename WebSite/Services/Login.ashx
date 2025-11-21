<%@ WebHandler Language="C#" Class="Login" %>

using System;
using System.Web;
using Newtonsoft.Json;
using DBEngine;

public class Login : BaseHandler {

    /// <summary>
    /// Login endpoint does not require authentication.
    /// Uses Anonymous auth level to skip token validation in BaseHandler.
    /// </summary>
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.Anonymous; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        /**
            username
            password
            token

            Se il token è presente, controllare se esiste la coppia userid-token in Logins
            Se il token è vuoto, controllare se nella tabella users è presente la coppia Username - Password
                NB: se Username e password sono corretti, inserire una nuova riga in Logins con userid=>username e token casuale

                status: OK o KO
                Token: valorizzato se primo login, oppure vuoto se la login è stata basata sul token
        */

        string username = context.Request.Form["username"];
        string password = context.Request.Form["password"];
        string token = context.Request.Form["token"];

        // PASSWORD LOGIN PATH (token empty or null)
        if (!Helpers.IsNotEmpty(token))
        {
            string newToken;
            if (LoginService.PasswordVerify(username, password, out newToken))
            {
                // Password valid - get user info from token to return username and role
                SimpleTokenManager.TokenInfo tokenInfo;
                if (SimpleTokenManager.ValidateToken(newToken, out tokenInfo))
                {
                    // Return token, username, and role for account display
                    return new
                    {
                        Token = newToken,
                        Username = tokenInfo.Username,
                        Role = tokenInfo.Role
                    };
                }
                else
                {
                    // This should never happen (token just created), but handle defensively
                    throw new ServiceException("Errore durante la creazione della sessione");
                }
            }
            else
            {
                // Password invalid - throw exception with Italian error message
                throw new ServiceException("Nome utente o password non corretti");
            }
        }

        // TOKEN VALIDATION PATH (autologin)
        else
        {
            // OK - valid session; OUT - invalid session
            SimpleTokenManager.TokenInfo tokenInfo;
            if (SimpleTokenManager.ValidateToken(token, out tokenInfo))
            {
                // Token valid - return empty token (frontend already has it) + user info
                return new
                {
                    Token = "",
                    Username = tokenInfo.Username,
                    Role = tokenInfo.Role
                };
            }
            else
            {
                // Token invalid or expired - throw exception for "OUT" response
                throw new SessionExpiredException("Invalid or expired token");
            }
        }
    }
}

//public sealed class LoginResponse {
//    public string Status { get; set; }  // "Ok", "Ko", "OUT"
//    public string Token  { get; set; }  // token string or "" or "null" or null
//}
