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
    /// <summary>
    /// Token information including user ID, username, and role.
    /// </summary>
    public class TokenInfo
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }
    }
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

    /// <summary>
    /// Validate token and return token information including role.
    /// </summary>
    /// <param name="token">Token to validate</param>
    /// <param name="tokenInfo">Output parameter containing user ID, username, and role</param>
    /// <returns>True if token is valid and not expired, false otherwise</returns>
    public static bool ValidateToken(string token, out TokenInfo tokenInfo)
    {
        tokenInfo = null;

        if (string.IsNullOrEmpty(token))
        {
            return false;
        }

        using (var db = new schedulerEntities())
        {
            // Query session with user and role information
            var session = db.Sessions
                .Where(s => s.SessionToken == token && s.SessionExpire > DateTime.UtcNow)
                .Select(s => new
                {
                    UserId = s.UserID,
                    Username = s.User.Username,
                    RoleName = s.User.Role.RoleName
                })
                .FirstOrDefault();

            if (session != null)
            {
                tokenInfo = new TokenInfo
                {
                    UserId = session.UserId,
                    Username = session.Username,
                    Role = session.RoleName
                };
                return true;
            }
        }

        return false;
    }

}

 