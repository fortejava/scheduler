using DBEngine;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for Login
/// </summary>
public class LoginService
{
    public static bool LoginPasswordVerify (string username, string password, out User user)
    {
        bool result = false;
        user = null;

        if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
        {
            using(var db = new schedulerEntities())
            {
                // TODO: replace with hashed password verification
                user = db.Users
                    .Where(p=>p.Username == username && p.Password == password)
                    .FirstOrDefault();
                result = (user != null);
            }
        }
        return result;
    }

    public static string CreateToken (User user)
    {
        DateTime expiredAt = DateTime.UtcNow.AddHours(24);
        string token = SimpleTokenManager.CreateToken(user.UserID, user.Username, expiredAt);

        return token;

    }


    // Check: valid token AND not expired AND exists in DB
    //public static bool SessionVerify(string token)
    //{
    //    SimpleTokenManager.TokenInfo info;
    //    return SimpleTokenManager.ValidateToken(token, out info);
    //}
}


//using (var db = new schedulerEntities())
//{
//    var session = new Sessions()
//    {
//        UserID = user.UserID,
//        SessionToken = token,
//        SessionExpire = expiredAt
//    };

//    db.Sessions.Add(session);
//    db.SaveChanges();
//}