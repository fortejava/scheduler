using System;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// Exception for validation errors with support for multiple error messages.
/// Used when business logic validation fails with one or more issues.
/// Supports both single error and multiple errors in a single exception.
/// </summary>
/// <example>
/// Single error:
/// throw new ValidationException("Username is required");
///
/// Multiple errors:
/// var errors = new List&lt;string&gt; { "Name required", "Email invalid" };
/// throw new ValidationException(errors);
/// </example>
public class ValidationException : Exception
{
    /// <summary>
    /// List of validation error messages
    /// </summary>
    public List<string> Errors { get; private set; }

    /// <summary>
    /// Constructor with single error message
    /// </summary>
    /// <param name="message">Single validation error message</param>
    public ValidationException(string message) : base(message)
    {
        Errors = new List<string> { message };
    }

    /// <summary>
    /// Constructor with multiple error messages
    /// </summary>
    /// <param name="errors">List of validation error messages</param>
    public ValidationException(List<string> errors) : base(GetCombinedMessage(errors))
    {
        Errors = errors ?? new List<string>();

        // Ensure at least one error message exists
        if (Errors.Count == 0)
        {
            Errors.Add("Validation failed");
        }
    }

    /// <summary>
    /// Constructor with single error and inner exception
    /// </summary>
    /// <param name="message">Validation error message</param>
    /// <param name="innerException">Inner exception that caused this validation error</param>
    public ValidationException(string message, Exception innerException)
        : base(message, innerException)
    {
        Errors = new List<string> { message };
    }

    /// <summary>
    /// Combine multiple errors into single message for logging and Exception.Message property
    /// </summary>
    /// <param name="errors">List of error messages</param>
    /// <returns>Combined error message</returns>
    private static string GetCombinedMessage(List<string> errors)
    {
        if (errors == null || errors.Count == 0)
        {
            return "Validation failed";
        }

        if (errors.Count == 1)
        {
            return errors[0];
        }

        // Use string.Format for C# 5 compatibility (no string interpolation)
        return string.Format("Validation failed with {0} errors: {1}",
            errors.Count,
            string.Join("; ", errors));
    }
}
