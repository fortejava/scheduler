using System;

/// <summary>
/// Exception thrown when a user session has expired or token is invalid.
/// Caught by BaseHandler and returned as "OUT" response code.
/// This signals the frontend to clear the session and redirect to login.
/// </summary>
public class SessionExpiredException : Exception
{
    /// <summary>
    /// Initializes a new instance of the SessionExpiredException class with a specified error message.
    /// </summary>
    /// <param name="message">The message that describes the error.</param>
    public SessionExpiredException(string message) : base(message)
    {
    }

    /// <summary>
    /// Initializes a new instance of the SessionExpiredException class with a specified error message
    /// and a reference to the inner exception that is the cause of this exception.
    /// </summary>
    /// <param name="message">The message that describes the error.</param>
    /// <param name="innerException">The exception that is the cause of the current exception.</param>
    public SessionExpiredException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
