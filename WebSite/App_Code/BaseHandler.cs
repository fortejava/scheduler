using System;
using System.Web;
using Newtonsoft.Json;

/// <summary>
/// Base handler for all ASHX endpoints.
/// Provides automatic token validation, authorization, and exception handling.
/// Uses template method pattern - subclasses only implement business logic.
/// </summary>
public abstract class BaseHandler : IHttpHandler
{
    /// <summary>
    /// Override to specify authorization level required.
    /// Default: ValidToken (any authenticated user can access).
    /// </summary>
    protected virtual AuthLevel AuthorizationRequired
    {
        get { return AuthLevel.ValidToken; }
    }

    /// <summary>
    /// Override to implement business logic.
    /// Throw ValidationException for multi-field validation errors (returns error array).
    /// Throw ServiceException for single validation errors (user-friendly message).
    /// Throw DatabaseException for database errors (generic message returned).
    /// Return data object (will be wrapped in Response with "Ok" code).
    /// </summary>
    /// <param name="context">HTTP context</param>
    /// <returns>Data to return to client (wrapped in Response)</returns>
    protected abstract object ExecuteOperation(HttpContext context);

    /// <summary>
    /// Template method - DO NOT OVERRIDE.
    /// Handles token validation, authorization, exception handling automatically.
    /// </summary>
    /// <param name="context">HTTP context</param>
    public void ProcessRequest(HttpContext context)
    {
        try
        {
            // Step 1: Handle Anonymous endpoints (no auth required)
            if (AuthorizationRequired == AuthLevel.Anonymous)
            {
                object result = ExecuteOperation(context);
                SendResponse(context, "Ok", result);
                return;
            }

            // Step 2: Get token from request
            string token = context.Request.Form["token"];
            if (string.IsNullOrEmpty(token))
            {
                SendResponse(context, "OUT", "Token richiesto");
                return;
            }

            // Step 3: Validate token
            SimpleTokenManager.TokenInfo tokenInfo;
            if (!SimpleTokenManager.ValidateToken(token, out tokenInfo))
            {
                SendResponse(context, "OUT", "Invalid or expired token");
                return;
            }

            // Step 4: Check authorization level
            if (!CheckAuthorization(tokenInfo))
            {
                string message = GetAuthorizationErrorMessage(tokenInfo);
                SendResponse(context, "Ko", message);
                return;
            }

            // Step 5: Execute business logic (subclass implementation)
            object data = ExecuteOperation(context);

            // Step 6: Return success response
            SendResponse(context, "Ok", data);
        }
        catch (HttpResponseEndedException)
        {
            // Response already sent by handler (binary file export: CSV, Excel, PDF)
            // Handler called Response.Flush() and threw this exception to signal
            // that BaseHandler should NOT call SendResponse() (would cause "headers already sent" error)
            // This is expected behavior for file downloads - exit gracefully
            // NOTE: No logging needed - this is normal operation for export endpoints
            return;
        }
        catch (ValidationException ex)
        {
            // Validation errors (can contain multiple error messages)
            // NOTE: NOT logged - these are expected user input validation errors, not system errors
            // Logging would pollute logs with normal application flow (every invalid form submission)

            // Return error array if multiple errors, single string if one error
            // Frontend already handles both: Array.isArray() check in invoices.js:1461
            if (ex.Errors.Count > 1)
            {
                SendResponse(context, "Ko", ex.Errors);  // List<string> as array
            }
            else
            {
                SendResponse(context, "Ko", ex.Errors[0]);  // Single string
            }
        }
        catch (SessionExpiredException ex)
        {
            // Session expired (return "OUT" code for frontend logout)
            // NOTE: NOT logged - normal application flow (session timeout expected)
            // Frontend receives "OUT" code and redirects user to login view
            SendResponse(context, "OUT", ex.Message);
        }
        catch (ServiceException ex)
        {
            // Business logic / validation errors (user-friendly message)
            // NOTE: Logging can be useful for business analytics (e.g., how often do users
            // try to perform forbidden operations), but can be removed if logs get too noisy
            LogError(context, "ServiceException", ex);
            SendResponse(context, "Ko", ex.Message);
        }
        catch (DatabaseException ex)
        {
            // Database errors (generic message for security)
            LogError(context, "DatabaseException", ex);
            SendResponse(context, "Ko", "Operazione database fallita. Riprova più tardi.");
        }
        catch (Exception ex)
        {
            // Unexpected errors (generic message for security)
            // ========== DIAGNOSTIC LOGGING START ==========
            DiagnosticLogger.Error("=======================================================");
            DiagnosticLogger.Error("=== UNEXPECTED EXCEPTION CAUGHT IN BASE HANDLER ===");
            DiagnosticLogger.Error(string.Format("Handler: {0}", this.GetType().Name));
            DiagnosticLogger.Error(string.Format("Exception Type: {0}", ex.GetType().FullName));
            DiagnosticLogger.Error(string.Format("Exception Message: {0}", ex.Message));

            // Log ALL inner exceptions recursively (C# 5 compatible)
            Exception innerEx = ex.InnerException;
            int level = 1;
            while (innerEx != null)
            {
                DiagnosticLogger.Error(string.Format("=== INNER EXCEPTION LEVEL {0} ===", level));
                DiagnosticLogger.Error(string.Format("Type: {0}", innerEx.GetType().FullName));
                DiagnosticLogger.Error(string.Format("Message: {0}", innerEx.Message));
                innerEx = innerEx.InnerException;
                level++;
            }
            DiagnosticLogger.Error("=======================================================");
            // ========== DIAGNOSTIC LOGGING END ==========

            LogError(context, "UnexpectedException", ex);
            SendResponse(context, "Ko", "Si è verificato un errore imprevisto. Contatta l'assistenza.");
        }
    }

    /// <summary>
    /// Check if user has required authorization level.
    /// </summary>
    /// <param name="tokenInfo">Token information with user role</param>
    /// <returns>True if authorized, false otherwise</returns>
    private bool CheckAuthorization(SimpleTokenManager.TokenInfo tokenInfo)
    {
        switch (AuthorizationRequired)
        {
            case AuthLevel.Anonymous:
                return true; // Already handled above

            case AuthLevel.ValidToken:
                return true; // Any authenticated user

            case AuthLevel.AdminOrUser:
                return AuthorizationHelper.HasRole(tokenInfo, "Admin", "User");

            case AuthLevel.AdminOnly:
                return AuthorizationHelper.HasRole(tokenInfo, "Admin");

            default:
                return false;
        }
    }

    /// <summary>
    /// Get user-friendly authorization error message based on required level.
    /// </summary>
    /// <param name="tokenInfo">Token information with user role</param>
    /// <returns>Error message to return to client</returns>
    private string GetAuthorizationErrorMessage(SimpleTokenManager.TokenInfo tokenInfo)
    {
        switch (AuthorizationRequired)
        {
            case AuthLevel.AdminOrUser:
                return "Accesso negato: Gli utenti Visitatore non possono modificare i dati. Contatta l'amministratore.";

            case AuthLevel.AdminOnly:
                return "Accesso negato: È richiesto l'accesso Amministratore per questa operazione.";

            default:
                return "Accesso negato: Permessi insufficienti.";
        }
    }

    /// <summary>
    /// Send JSON response to client with Response structure ("Ok"/"Ko"/"OUT").
    /// </summary>
    /// <param name="context">HTTP context</param>
    /// <param name="code">Response code: "Ok", "Ko", or "OUT"</param>
    /// <param name="message">Data or error message</param>
    protected void SendResponse(HttpContext context, string code, object message)
    {
        var response = new Response(code, message);
        // FIX: Add charset=utf-8 to prevent Italian character corruption ("è" → "Ã¨")
        context.Response.ContentType = "application/json; charset=utf-8";
        // Use Helpers.JsonSerialize() which handles circular references with ReferenceLoopHandling.Ignore
        context.Response.Write(Helpers.JsonSerialize(response));
    }

    /// <summary>
    /// Log error for debugging and monitoring.
    /// Can be extended to write to file or database.
    /// </summary>
    /// <param name="context">HTTP context</param>
    /// <param name="errorType">Type of error (ServiceException, DatabaseException, UnexpectedException)</param>
    /// <param name="ex">Exception that occurred</param>
    protected virtual void LogError(HttpContext context, string errorType, Exception ex)
    {
        // TODO: Implement logging to file or database
        // For now, write to trace/event log
        string logMessage = string.Format(
            "[{0}] {1}: {2} - Stack: {3}",
            DateTime.UtcNow,
            errorType,
            ex.Message,
            ex.StackTrace
        );

        System.Diagnostics.Trace.WriteLine(logMessage);

        // If there's an inner exception, log it too
        if (ex.InnerException != null)
        {
            System.Diagnostics.Trace.WriteLine(string.Format(
                "Inner Exception: {0} - Stack: {1}",
                ex.InnerException.Message,
                ex.InnerException.StackTrace
            ));
        }
    }

    /// <summary>
    /// Indicates whether the handler is reusable.
    /// </summary>
    public bool IsReusable
    {
        get { return false; }
    }
}
