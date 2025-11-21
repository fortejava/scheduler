using System;
using BC = BCrypt.Net.BCrypt;

/// <summary>
/// Password hashing utility using BCrypt
/// Provides secure password hashing and verification
/// </summary>
public static class PasswordHasher
{
    // Work factor (cost parameter) for BCrypt
    // 12 = ~250ms per hash (2025 standard)
    // Each increment doubles the time
    private const int WorkFactor = 12;

    /// <summary>
    /// Hash a plaintext password using BCrypt
    /// </summary>
    /// <param name="password">Plaintext password to hash</param>
    /// <returns>BCrypt hash string (60 characters)</returns>
    /// <exception cref="ArgumentException">If password is null or empty</exception>
    public static string HashPassword(string password)
    {
        if (string.IsNullOrEmpty(password))
        {
            throw new ArgumentException("Password cannot be null or empty", "password");
        }

        // Generate salt and hash in one operation
        // Salt is automatically generated and embedded in the hash
        return BC.HashPassword(password, WorkFactor);
    }

    /// <summary>
    /// Verify a plaintext password against a BCrypt hash
    /// </summary>
    /// <param name="password">Plaintext password to verify</param>
    /// <param name="hash">BCrypt hash to verify against</param>
    /// <returns>True if password matches hash, false otherwise</returns>
    public static bool VerifyPassword(string password, string hash)
    {
        if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(hash))
        {
            return false;
        }

        try
        {
            // BCrypt.Verify uses constant-time comparison to prevent timing attacks
            return BC.Verify(password, hash);
        }
        catch
        {
            // Invalid hash format or other BCrypt error
            return false;
        }
    }

    /// <summary>
    /// Check if a hash needs to be rehashed (work factor changed)
    /// Useful for upgrading security over time
    /// </summary>
    /// <param name="hash">BCrypt hash to check</param>
    /// <returns>True if hash should be regenerated with current work factor</returns>
    public static bool NeedsRehash(string hash)
    {
        if (string.IsNullOrEmpty(hash))
        {
            return false;
        }

        try
        {
            return BC.PasswordNeedsRehash(hash, WorkFactor);
        }
        catch
        {
            // Invalid hash format
            return false;
        }
    }
}
