<%@ WebHandler Language="C#" Class="Login" %>

using System;
using System.Web;

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
        context.Response.ContentType = "text/plain";
        context.Response.Write("Hello World");
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}