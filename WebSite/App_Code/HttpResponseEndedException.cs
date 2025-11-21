using System;

/// <summary>
/// Custom exception thrown when an HTTP handler has already sent the response
/// and written headers (e.g., binary file downloads like CSV export).
///
/// PURPOSE:
/// Signals to BaseHandler that response has been manually sent via Response.End()
/// or Response.Flush(), so BaseHandler should NOT call SendResponse() which would
/// try to set ContentType and cause "headers already sent" exception.
///
/// USAGE:
/// In export handlers (CSV, Excel, PDF):
/// 1. Stream binary file to Response
/// 2. Call Response.Flush()
/// 3. Throw new HttpResponseEndedException()
/// 4. BaseHandler catches this and exits gracefully (no JSON response sent)
///
/// WHY NOT USE Response.End()?
/// Response.End() throws ThreadAbortException which is expensive and pollutes logs.
/// This custom exception is cleaner and more explicit about intent.
///
/// Author: Loginet Team
/// Created: November 2025
/// </summary>
public class HttpResponseEndedException : Exception
{
    /// <summary>
    /// Default constructor
    /// </summary>
    public HttpResponseEndedException()
        : base("HTTP response has been sent and headers written. BaseHandler should not send JSON response.")
    {
    }

    /// <summary>
    /// Constructor with custom message
    /// </summary>
    /// <param name="message">Custom exception message</param>
    public HttpResponseEndedException(string message)
        : base(message)
    {
    }

    /// <summary>
    /// Constructor with custom message and inner exception
    /// </summary>
    /// <param name="message">Custom exception message</param>
    /// <param name="innerException">Inner exception</param>
    public HttpResponseEndedException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
