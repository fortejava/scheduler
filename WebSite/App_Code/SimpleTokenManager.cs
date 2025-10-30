using DBEngine;
using Newtonsoft.Json.Linq;
using System;

using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Security.Cryptography;

using System.Text;

public class SimpleTokenManager

{
    public static string CreateToken(int userId, string username, DateTime expiredAt)
    {

        string uniqueString = Helpers.HashString(username + expiredAt);
        string token = uniqueString + Guid.NewGuid().ToString();

        //Works as try catch Exceptions + final DB.Dispose()
        using (var db = new schedulerEntities())
        {
            var session = new Session()
            {
                UserID = userId,
                SessionToken = token,
                SessionExpire = expiredAt
            };

            db.Sessions.Add(session);
            db.SaveChanges(); //should try to save can be exceptions - using prevents shutdown from Exc.
        }
        return token;

    }

    // Validate token
    public static bool ValidateToken(string token)
    {
        bool valid = false;

        if (!String.IsNullOrEmpty(token))
        {
            using (var db = new schedulerEntities())
            {
                Session session = db.Sessions
                    .Where(p => p.SessionToken == token && p.SessionExpire > DateTime.UtcNow)
                    .FirstOrDefault();
                valid = (session != null);
            }          
        }

        return valid;

    }

    public static bool ValidateToken2(string token, string username)
    {
        bool valid = false;

        if (Helpers.IsNotEmpty(token) && Helpers.IsNotEmpty(username))
        {
            using (var db = new schedulerEntities())
            {
                var user = db.Users
                    .Where(u=>u.Username == username)
                    .FirstOrDefault();
                if(user != null)
                {
                    Session session = db.Sessions
                    .Where(p => p.SessionToken == token && 
                                p.UserID == user.UserID && 
                                p.SessionExpire > DateTime.UtcNow)
                    .FirstOrDefault();
                    valid = (session != null);
                }
            }
        }

        return valid;

    }

}

 