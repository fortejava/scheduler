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
        string token = Guid.NewGuid().ToString();
        using (schedulerEntities db = new schedulerEntities())
        {

            //while(db.Sessions.Where(p=>p.SessionToken == token).Any())
            //{
            //    token = Guid.NewGuid().ToString();
            //} 
            List<string> sessions = db.Sessions.Select(p=>p.SessionToken).ToList();
            while (tokens.ContainsKey(token) || sessions.Contains(token))
            {
                token = Guid.NewGuid().ToString();
            }

            var session = new Session()
            {
                UserID = userId,
                SessionToken = token,
                SessionExpire = expiredAt
            };

            db.Sessions.Add(session);
            db.SaveChanges(); //should try to save can be exceptions
        }





        //if the db fails we create the token any way!!! wrong!!! 
        tokens[token] = new TokenInfo

        {

            UserId = userId,

            Username = username,

            //ExpiresAt = DateTime.UtcNow.AddHours(24)
            ExpiresAt = expiredAt

        };

        return token;

    }

    // Validate token
    public static bool ValidateToken(string token, out TokenInfo info)

    {

        info = null;
        bool valid = false;

        if (!String.IsNullOrEmpty(token) && tokens.ContainsKey(token))

        {

            info = tokens[token];

            if (info.ExpiresAt > DateTime.UtcNow)

            {
                using (schedulerEntities db = new schedulerEntities())
                {
                    int userId = info.UserId;
                    Session session = db.Sessions.Where(p => p.UserID == userId && p.SessionToken == token && p.SessionExpire > DateTime.UtcNow).FirstOrDefault();
                    valid = (session != null);
                }

            }

            else

            {

                tokens.Remove(token); // Remove expired
                using (schedulerEntities db = new schedulerEntities())
                {
                    Session sessionToDelete = db.Sessions.Where(p=>p.SessionToken == token).FirstOrDefault();
                    if (sessionToDelete != null)
                    {
                        db.Sessions.Remove(sessionToDelete);
                        db.SaveChanges();
                    }

                }
            }

        }

        return valid;

    }

}

 