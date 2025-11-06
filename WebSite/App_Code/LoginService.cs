using DBEngine;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for Login
/// </summary>
public class LoginService
{
    public static bool PasswordVerify (string username, string password, out string newToken)
    {
        //bool result = false;
        User user = null;
        newToken = null;

        if (Helpers.AreNotEmpty(username,password))
        {
            using(var db = new schedulerEntities())
            {
                // TODO: replace with hashed password verification
                user = db.Users
                        .Where(p => p.Username == username && p.Password == password)
                        .FirstOrDefault();
                if (user != null)
                {
                    DateTime expiredAt = DateTime.UtcNow.AddHours(24);
                    newToken = SimpleTokenManager.CreateToken(user.UserID, user.Username, expiredAt);
                }
            }
        }
        return newToken !=null;
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



//public static bool PasswordVerify(string username, string password, out User user)
//{
//    bool result = false;
//    user = null;
//    string newToken;

//    if (Helpers.AreNotEmpty(username, password))
//    {
//        using (var db = new schedulerEntities())
//        {
//            // TODO: replace with hashed password verification
//            user = db.Users
//                    .Where(p => p.Username == username && p.Password == password)
//                    .FirstOrDefault();
//            result = (user != null);
//        }
//    }
//    return result;
//}