using System;

/// <summary>
/// Exception thrown when database operations fail.
/// Used for: SQL connection errors, query failures, SaveChanges() errors.
/// Caught by BaseHandler and returns generic error message (no SQL details exposed for security).
/// </summary>
public class DatabaseException : Exception
{
    /// <summary>
    /// Initializes a new instance of DatabaseException with a message.
    /// </summary>
    /// <param name="message">Error message describing what database operation failed</param>
    public DatabaseException(string message)
        : base(message)
    {
    }

    /// <summary>
    /// Initializes a new instance of DatabaseException with a message and inner exception.
    /// </summary>
    /// <param name="message">Error message describing what database operation failed</param>
    /// <param name="innerException">The underlying exception that caused this error</param>
    public DatabaseException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
