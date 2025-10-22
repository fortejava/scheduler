using DBEngine;
using System;

using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;

using System.Text;

public class SimpleTokenManager

{

    // Store tokens in memory (use database in production)

    private static Dictionary<string, TokenInfo> tokens = new Dictionary<string, TokenInfo>();

    public class TokenInfo
    {

        public int UserId { get; set; }

        public string Username { get; set; }

        public DateTime ExpiresAt { get; set; }

    }

    // Create token

    public static string CreateToken(int userId, string username, DateTime expiredAt)
    {
        string token = null ;
        using (schedulerEntities db = new schedulerEntities())
        {
            string uniqueString = username + expiredAt + "_";
            token = uniqueString + Guid.NewGuid().ToString();

            var session = new Session()
            {
                UserID = userId,
                SessionToken = token,
                SessionExpire = expiredAt
            };

            db.Sessions.Add(session);
            db.SaveChanges(); //should try to save can be exceptions
        }

        return token;

    }

    // Validate token
    public static bool ValidateToken(string token)
    {
        bool valid = false;

        if (!String.IsNullOrEmpty(token))
        {
            using (schedulerEntities db = new schedulerEntities())
            {
                Session session = db.Sessions
                    .Where(p => p.SessionToken == token && p.SessionExpire > DateTime.UtcNow)
                    .FirstOrDefault();
                valid = (session != null);
            }          
        }

        return valid;

    }

}

 