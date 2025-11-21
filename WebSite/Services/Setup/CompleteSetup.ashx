<%@ WebHandler Language="C#" Class="CompleteSetup" %>

using System;
using System.Web;
using System.Linq;
using System.IO;
using DBEngine;

/// <summary>
/// CompleteSetup - First-time setup wizard endpoint
/// Creates the initial admin user and sets SetupCompleted flag to 'true'
///
/// SECURITY:
/// - Tier 1: Checks if setup already completed (prevents re-running)
/// - Tier 2A: Automatically deletes setup-wizard.html after successful completion
/// - Anonymous access (no authentication required for first-time setup)
///
/// Endpoint: POST /Services/Setup/CompleteSetup.ashx
/// Parameters:
///   - username (string): Admin username (3-100 chars)
///   - password (string): Admin password (min 8 chars)
///
/// Returns:
///   OK: { Message: "Configurazione completata con successo" }
///   KO: { Message: "Error message" }
/// </summary>
public class CompleteSetup : BaseHandler
{
    protected override AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.Anonymous; }
    }

    protected override object ExecuteOperation(HttpContext context)
    {
        using (var db = new schedulerEntities())
        {
            // ========================================
            // TIER 1 SECURITY: Check if setup already completed
            // ========================================
            var config = db.SystemConfigs.FirstOrDefault(c => c.ConfigKey == "SetupCompleted");

            if (config != null && config.ConfigValue == "true")
            {
                throw new ServiceException("Setup già completato. Non è possibile ripetere la configurazione iniziale.");
            }

            // Get parameters
            string username = context.Request.Form["username"];
            string password = context.Request.Form["password"];

            // Validate inputs
            if (string.IsNullOrWhiteSpace(username))
            {
                throw new ValidationException("Il nome utente è obbligatorio");
            }

            if (string.IsNullOrWhiteSpace(password))
            {
                throw new ValidationException("La password è obbligatoria");
            }

            if (username.Length < 3 || username.Length > 100)
            {
                throw new ValidationException("Il nome utente deve essere tra 3 e 100 caratteri");
            }

            if (password.Length < 8)
            {
                throw new ValidationException("La password deve essere di almeno 8 caratteri");
            }

            // Check if username already exists
            var existingUser = db.Users.FirstOrDefault(u => u.Username == username);
            if (existingUser != null)
            {
                throw new ServiceException("Un utente con questo nome esiste già");
            }

            // Get Admin role
            var adminRole = db.Roles.FirstOrDefault(r => r.RoleName == "Admin");
            if (adminRole == null)
            {
                throw new DatabaseException("Ruolo Admin non trovato nel database");
            }

            // Hash password
            string hashedPassword = PasswordHasher.HashPassword(password);

            // Create admin user
            var adminUser = new User
            {
                Username = username,
                Password = hashedPassword,
                RoleID = adminRole.RoleID
            };

            db.Users.Add(adminUser);

            // Update SetupCompleted flag
            if (config == null)
            {
                // Create flag if it doesn't exist
                config = new SystemConfig
                {
                    ConfigKey = "SetupCompleted",
                    ConfigValue = "true",
                    Description = "Indicates whether first-time setup wizard has been completed"
                };
                db.SystemConfigs.Add(config);
            }
            else
            {
                // Update existing flag
                config.ConfigValue = "true";
            }

            // Save changes
            db.SaveChanges();

            // ========================================
            // TIER 2A SECURITY: Automatic file deletion
            // ========================================
            try
            {
                string wizardPath = context.Server.MapPath("~/setup-wizard.html");
                string wizardJsPath = context.Server.MapPath("~/assets/js/setup-wizard.js");

                if (File.Exists(wizardPath))
                {
                    File.Delete(wizardPath);
                    System.Diagnostics.Debug.WriteLine("Setup wizard file deleted successfully: " + wizardPath);
                }

                if (File.Exists(wizardJsPath))
                {
                    File.Delete(wizardJsPath);
                    System.Diagnostics.Debug.WriteLine("Setup wizard JS deleted successfully: " + wizardJsPath);
                }
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the setup
                // Setup succeeded, file deletion is a security enhancement
                System.Diagnostics.Debug.WriteLine("Warning: Could not delete setup wizard files: " + ex.Message);
                System.Diagnostics.Debug.WriteLine("Manual deletion recommended for security.");
            }

            // Return success (BaseHandler automatically wraps in Response)
            return new
            {
                Message = "Configurazione completata con successo. Utente amministratore creato.",
                AdminUsername = username
            };
        }
    }
}
