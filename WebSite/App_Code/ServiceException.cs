using System;

/// <summary>
/// Exception thrown when business logic validation fails.
/// Used for: Invalid input, business rule violations, data not found.
/// Caught by BaseHandler and returns user-friendly error message to client.
/// </summary>
public class ServiceException : Exception
{
    /// <summary>
    /// Initializes a new instance of ServiceException with a message.
    /// </summary>
    /// <param name="message">User-friendly error message (safe to show to end user)</param>
    public ServiceException(string message)
        : base(message)
    {
    }

    /// <summary>
    /// Initializes a new instance of ServiceException with a message and inner exception.
    /// </summary>
    /// <param name="message">User-friendly error message (safe to show to end user)</param>
    /// <param name="innerException">The underlying exception that caused this error</param>
    public ServiceException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
