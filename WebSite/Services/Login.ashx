<%@ WebHandler Language="C#" Class="Login" %>

using System;
using System.Web;
using Newtonsoft.Json;
using DBEngine;

public class Login : IHttpHandler {

    public void ProcessRequest (HttpContext context)
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
        Response r = new Response("Ko",null);


        // token string or "" (or null need to clarify con Botta)
        if (!Helpers.IsNotEmpty(token))
        {
            string newToken;
            if(LoginService.PasswordVerify(username, password, out newToken))
            {
                r.Code = "Ok";
                r.Message = new
                {
                    Token = newToken
                };
            }
            else
            {
                r.Code = "Ko";
                r.Message = null;
            }
        }
        else
        {
            //OK - valid session; OUT - invalid session 
            // condition ? true : false   
            r.Code = SimpleTokenManager.ValidateToken(token) ? "Ok" : "OUT";
            r.Message = new { Token = "" }; //o null
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

//public sealed class LoginResponse {
//    public string Status { get; set; }  // "Ok", "Ko", "OUT"
//    public string Token  { get; set; }  // token string or "" or "null" or null
//}