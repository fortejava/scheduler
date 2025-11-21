using System;
using System.Linq;
using DBEngine;

/// <summary>
/// User management service
/// Handles user CRUD operations with secure password hashing
/// </summary>
public static class UserService
{
    /// <summary>
    /// Create a new user with hashed password
    /// </summary>
    /// <param name="username">Username (max 100 characters)</param>
    /// <param name="password">Plaintext password (will be hashed)</param>
    /// <param name="roleId">Role ID (1=Admin, 2=User, 3=Visitor)</param>
    /// <param name="userId">Output: Created user ID</param>
    /// <returns>Success message or error details</returns>
    public static Response CreateUser(string username, string password, int roleId, out int userId)
    {
        userId = 0;

        // Validation
        if (string.IsNullOrWhiteSpace(username))
        {
            return new Response("Ko", "Nome utente non può essere vuoto");
        }

        if (string.IsNullOrWhiteSpace(password))
        {
            return new Response("Ko", "Password non può essere vuota");
        }

        if (username.Length > 100)
        {
            return new Response("Ko", "Nome utente non può superare 100 caratteri");
        }

        // Validate role ID
        if (roleId < 1 || roleId > 3)
        {
            return new Response("Ko", "Ruolo non valido. Deve essere 1 (Admin), 2 (User), o 3 (Visitor)");
        }

        try
        {
            using (var db = new schedulerEntities())
            {
                // Check if username already exists
                if (db.Users.Any(u => u.Username == username))
                {
                    return new Response("Ko", "Nome utente già esistente");
                }

                // Hash the password
                string hashedPassword = PasswordHasher.HashPassword(password);

                // Create user
                var user = new User
                {
                    Username = username,
                    Password = hashedPassword,
                    RoleID = roleId
                };

                db.Users.Add(user);
                db.SaveChanges();

                userId = user.UserID;
                return new Response("Ok", "Utente creato con successo");
            }
        }
        catch (Exception ex)
        {
            return new Response("Ko", "Errore durante la creazione dell'utente: " + ex.Message);
        }
    }

    /// <summary>
    /// Change user password (requires old password verification)
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="oldPassword">Current password (for verification)</param>
    /// <param name="newPassword">New password to set</param>
    /// <returns>Success message or error details</returns>
    public static Response ChangePassword(int userId, string oldPassword, string newPassword)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(oldPassword))
        {
            return new Response("Ko", "Password attuale richiesta");
        }

        if (string.IsNullOrWhiteSpace(newPassword))
        {
            return new Response("Ko", "Nuova password non può essere vuota");
        }

        try
        {
            using (var db = new schedulerEntities())
            {
                var user = db.Users.Find(userId);
                if (user == null)
                {
                    return new Response("Ko", "Impossibile modificare la password. Verifica i dati inseriti.");
                }

                // Verify old password
                if (!PasswordHasher.VerifyPassword(oldPassword, user.Password))
                {
                    return new Response("Ko", "Impossibile modificare la password. Verifica i dati inseriti.");
                }

                // Hash and set new password
                user.Password = PasswordHasher.HashPassword(newPassword);
                db.SaveChanges();

                return new Response("Ok", "Password modificata con successo");
            }
        }
        catch (Exception ex)
        {
            return new Response("Ko", "Errore durante la modifica della password: " + ex.Message);
        }
    }

    /// <summary>
    /// Reset user password (admin function - no verification required)
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="newPassword">New password to set</param>
    /// <returns>Success message or error details</returns>
    public static Response ResetPassword(int userId, string newPassword)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(newPassword))
        {
            return new Response("Ko", "La nuova password non può essere vuota");
        }

        try
        {
            using (var db = new schedulerEntities())
            {
                var user = db.Users.Find(userId);
                if (user == null)
                {
                    return new Response("Ko", "Utente non trovato");
                }

                // Hash and set new password (no verification)
                user.Password = PasswordHasher.HashPassword(newPassword);
                db.SaveChanges();

                return new Response("Ok", "Password reimpostata con successo");
            }
        }
        catch (Exception ex)
        {
            return new Response("Ko", "Errore durante il ripristino della password: " + ex.Message);
        }
    }

    /// <summary>
    /// Delete a user and all associated data
    /// </summary>
    /// <param name="userId">User ID to delete</param>
    /// <returns>Success message or error details</returns>
    public static Response DeleteUser(int userId)
    {
        try
        {
            using (var db = new schedulerEntities())
            {
                var user = db.Users.Find(userId);
                if (user == null)
                {
                    return new Response("Ko", "Utente non trovato");
                }

                // Delete associated sessions (cascade delete should handle this, but explicit is safer)
                var sessions = db.Sessions.Where(s => s.UserID == userId).ToList();
                db.Sessions.RemoveRange(sessions);

                // Delete user
                db.Users.Remove(user);
                db.SaveChanges();

                return new Response("Ok", "Utente eliminato con successo");
            }
        }
        catch (Exception ex)
        {
            return new Response("Ko", "Errore durante l'eliminazione dell'utente: " + ex.Message);
        }
    }

    /// <summary>
    /// Get user by username (useful for authentication)
    /// </summary>
    /// <param name="username">Username to search</param>
    /// <returns>User object or null if not found</returns>
    public static User GetUserByUsername(string username)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return null;
        }

        try
        {
            using (var db = new schedulerEntities())
            {
                return db.Users.FirstOrDefault(u => u.Username == username);
            }
        }
        catch
        {
            return null;
        }
    }
}
