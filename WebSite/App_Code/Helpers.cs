using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;

/// <summary>
/// Summary description for Helpers
/// </summary>
public class Helpers
{
    public static bool IsNotEmpty(string message)
    {
        return !string.IsNullOrEmpty(message) && message != "null";
    }

    public static bool IsNotEmpty(decimal num)
    {
        return num > 0;
    }

    public static bool IsNotEmpty(DateTime data)
    {
        return data != new DateTime(1800, 01, 01);
    }

    public static bool AreNotEmpty(params string[] strings)
    {
        return strings.All(s => !string.IsNullOrWhiteSpace(s));
    }
    public static bool AreNotEmpty(params decimal[] decimals)
    {
        return decimals.All(d => (d > -1));
    }

    public static bool ValidYear(int Year)
    {
        return (Year >= 2000 && Year <= 2100);
    }

    public static bool ValidMonth(int Month)
    {
        return (Month >= 1 && Month <= 12);
    }

    public static JsonSerializerSettings JsonSettings()
    {
        var jsonSettings = new JsonSerializerSettings
        {
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
        };

        return jsonSettings;
    }

    public static string JsonSerialize(Response r)
    {
        return JsonConvert.SerializeObject(r, Helpers.JsonSettings());
    }

    public static string HashString(string input)
    {
        using (SHA256 sha256 = SHA256.Create())
        {
            byte[] inputBytes = Encoding.UTF8.GetBytes(input);
            byte[] hashBytes = sha256.ComputeHash(inputBytes);

            // Convert to hexadecimal string
            return BitConverter.ToString(hashBytes).Replace("-", "");
        }
    }

    /// <summary>
    /// Check if string contains HTML/script tags or dangerous characters (STRICT).
    /// Use this for ALL user input text fields to prevent XSS attacks.
    ///
    /// Security Strategy - Defense in Depth (3 layers):
    /// 1. ASP.NET ValidateRequest (ENABLED) - first guardrail, blocks at request level
    /// 2. This validation method (ADDED) - second guardrail, provides user-friendly Italian errors
    /// 3. Frontend escapeHtml() (ALREADY IMPLEMENTED) - third guardrail, escapes output display
    ///
    /// Rejected characters: &lt; &gt; " '
    /// These can form HTML tags and enable XSS attacks:
    ///   - &lt;script&gt;alert('XSS')&lt;/script&gt;
    ///   - &lt;img src=x onerror=alert('XSS')&gt;
    ///   - &lt;a href="javascript:alert('XSS')"&gt;
    ///   - &lt;svg onload=alert('XSS')&gt;
    ///
    /// Usage with Request.Unvalidated (to bypass first guardrail temporarily):
    ///   string customerName = context.Request.Unvalidated.Form["CustomerName"];
    ///   if (Helpers.ContainsHtmlTags(customerName)) {
    ///       errors.Add("Nome cliente non può contenere caratteri HTML speciali: &lt; &gt; \" '");
    ///   }
    /// </summary>
    /// <param name="input">String to check for HTML special characters</param>
    /// <returns>True if contains HTML special characters (&lt; &gt; " '), false otherwise</returns>
    public static bool ContainsHtmlTags(string input)
    {
        if (string.IsNullOrEmpty(input))
            return false;

        // Reject if contains: < > " '
        // These characters can form HTML tags and XSS attack vectors
        return input.IndexOfAny(new char[] { '<', '>', '"', '\'' }) >= 0;
    }

    public static string Paid = "Saldata";
    public static string NotPaid = "Non Saldata";

    /// <summary>
    /// Maximum number of invoices allowed in batch hard delete operations.
    /// Guardrail to prevent performance issues and database overload.
    /// </summary>
    public const int MAX_BATCH_DELETE_SIZE = 10000;
}