/*
 * ================================================================================
 * EXPERIMENTAL: PBKDF2-HMAC-SHA256 Password Hashing Implementation
 * ================================================================================
 *
 * This file is for STUDY and EXPERIMENTATION purposes only.
 * NOT used in production - BCrypt is used instead.
 *
 * WHAT IS PBKDF2?
 * - Password-Based Key Derivation Function 2
 * - NIST standard (FIPS 140-2 approved)
 * - Built into .NET Framework (no third-party libraries needed)
 * - Uses HMAC-SHA256 for hashing
 *
 * ADVANTAGES:
 * ✓ Built into .NET (no dependencies)
 * ✓ NIST approved / FIPS compliant
 * ✓ Well-understood and battle-tested
 * ✓ Configurable iteration count
 *
 * DISADVANTAGES:
 * ✗ Less GPU-resistant than Argon2 or BCrypt
 * ✗ Only CPU-hard (not memory-hard)
 * ✗ Requires very high iteration counts (600k+)
 * ✗ More manual implementation required
 *
 * WHEN TO USE:
 * - Government/military applications (FIPS compliance required)
 * - When third-party libraries are not allowed
 * - Legacy system compatibility
 * - When built-in .NET solutions are mandated
 *
 * NO NUGET PACKAGE REQUIRED:
 * Uses System.Security.Cryptography.Rfc2898DeriveBytes (built-in)
 *
 * ================================================================================
 */

using System;
using System.Linq;
using System.Security.Cryptography;

/// <summary>
/// EXPERIMENTAL: PBKDF2-HMAC-SHA256 password hashing implementation
/// For study and experimentation - NOT used in production
/// </summary>
public static class Experimental_PBKDF2_PasswordHasher
{
    // ============================================================================
    // CONFIGURATION PARAMETERS
    // ============================================================================

    /// <summary>
    /// Salt size in bytes (16 bytes = 128 bits)
    /// Recommended: 16 bytes minimum (OWASP)
    /// </summary>
    private const int SaltSize = 16;

    /// <summary>
    /// Hash size in bytes (32 bytes = 256 bits)
    /// Recommended: 32 bytes (SHA-256 output)
    /// </summary>
    private const int HashSize = 32;

    /// <summary>
    /// Number of iterations (work factor)
    /// Higher = slower but more secure
    /// Recommended: 600,000 iterations (OWASP 2025)
    /// NOTE: This is MUCH higher than BCrypt/Argon2 because PBKDF2 is faster
    /// </summary>
    private const int Iterations = 600000; // 600k iterations

    /// <summary>
    /// Hash algorithm name (for format string)
    /// Using SHA256 for better security than default SHA1
    /// </summary>
    private static readonly HashAlgorithmName HashAlgorithm = HashAlgorithmName.SHA256;

    // ============================================================================
    // HASH PASSWORD
    // ============================================================================

    /// <summary>
    /// Hash a plaintext password using PBKDF2-HMAC-SHA256
    /// </summary>
    /// <param name="password">Plaintext password to hash</param>
    /// <returns>Formatted hash string: iterations:salt_base64:hash_base64</returns>
    public static string HashPassword(string password)
    {
        if (string.IsNullOrEmpty(password))
        {
            throw new ArgumentException("Password cannot be null or empty", nameof(password));
        }

        // Generate cryptographically secure random salt
        byte[] salt = new byte[SaltSize];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        // Hash password with PBKDF2
        byte[] hash = HashPasswordWithSalt(password, salt);

        // Format: iterations:salt_base64:hash_base64
        // Example: 600000:Ab12Cd34Ef56Gh78:12Ab34Cd56Ef78Gh90Ij12Kl34Mn56Op
        return $"{Iterations}:{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
    }

    /// <summary>
    /// Hash password with provided salt (internal use)
    /// </summary>
    private static byte[] HashPasswordWithSalt(string password, byte[] salt)
    {
        using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithm))
        {
            return pbkdf2.GetBytes(HashSize);
        }
    }

    // ============================================================================
    // VERIFY PASSWORD
    // ============================================================================

    /// <summary>
    /// Verify a plaintext password against a PBKDF2 hash
    /// </summary>
    /// <param name="password">Plaintext password to verify</param>
    /// <param name="hashString">PBKDF2 hash string to verify against</param>
    /// <returns>True if password matches, false otherwise</returns>
    public static bool VerifyPassword(string password, string hashString)
    {
        if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(hashString))
        {
            return false;
        }

        try
        {
            // Parse hash string
            // Format: iterations:salt_base64:hash_base64
            var parts = hashString.Split(':');
            if (parts.Length != 3)
            {
                return false; // Invalid format
            }

            int iterations = int.Parse(parts[0]);
            byte[] salt = Convert.FromBase64String(parts[1]);
            byte[] expectedHash = Convert.FromBase64String(parts[2]);

            // Rehash password with same salt and iterations
            byte[] actualHash;
            using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithm))
            {
                actualHash = pbkdf2.GetBytes(HashSize);
            }

            // Constant-time comparison (prevents timing attacks)
            return CryptographicEquals(expectedHash, actualHash);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Constant-time byte array comparison (prevents timing attacks)
    /// </summary>
    private static bool CryptographicEquals(byte[] a, byte[] b)
    {
        if (a.Length != b.Length)
        {
            return false;
        }

        int result = 0;
        for (int i = 0; i < a.Length; i++)
        {
            result |= a[i] ^ b[i];
        }

        return result == 0;
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    /// <summary>
    /// Check if a hash needs to be rehashed (iteration count changed)
    /// </summary>
    public static bool NeedsRehash(string hashString)
    {
        if (string.IsNullOrEmpty(hashString))
        {
            return false;
        }

        try
        {
            var parts = hashString.Split(':');
            if (parts.Length != 3)
            {
                return false;
            }

            int storedIterations = int.Parse(parts[0]);
            return storedIterations != Iterations;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Parse hash string information (for debugging/analysis)
    /// </summary>
    public static string GetHashInfo(string hashString)
    {
        try
        {
            var parts = hashString.Split(':');
            if (parts.Length != 3)
            {
                return "Invalid hash format";
            }

            int iterations = int.Parse(parts[0]);
            byte[] salt = Convert.FromBase64String(parts[1]);
            byte[] hash = Convert.FromBase64String(parts[2]);

            return $@"
Algorithm: PBKDF2-HMAC-SHA256
Iterations: {iterations:N0}
Salt length: {salt.Length} bytes
Hash length: {hash.Length} bytes
Total length: {hashString.Length} characters
";
        }
        catch
        {
            return "Error parsing hash";
        }
    }

    /// <summary>
    /// Benchmark hashing performance (for parameter tuning)
    /// </summary>
    public static TimeSpan BenchmarkHash(string testPassword = "TestPassword123!")
    {
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        HashPassword(testPassword);
        stopwatch.Stop();
        return stopwatch.Elapsed;
    }
}

/*
 * ================================================================================
 * LEARNING RESOURCES
 * ================================================================================
 *
 * NIST Specification (SP 800-132):
 * https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf
 *
 * OWASP Recommendations:
 * https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 *
 * RFC 2898 (PKCS #5):
 * https://www.ietf.org/rfc/rfc2898.txt
 *
 * Microsoft Documentation:
 * https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography.rfc2898derivebytes
 *
 * Iteration Count Standards:
 * https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
 *
 * ================================================================================
 * USAGE EXAMPLE
 * ================================================================================
 *
 * // Hash a password
 * string password = "MySecretPassword123!";
 * string hash = Experimental_PBKDF2_PasswordHasher.HashPassword(password);
 * // Result: 600000:Ab12Cd34Ef56Gh78:12Ab34Cd56Ef78Gh90Ij12Kl34Mn56Op (~80 chars)
 *
 * // Verify password
 * bool isValid = Experimental_PBKDF2_PasswordHasher.VerifyPassword(password, hash);
 * // Result: true
 *
 * // Wrong password
 * bool isValid2 = Experimental_PBKDF2_PasswordHasher.VerifyPassword("WrongPassword", hash);
 * // Result: false
 *
 * // Check if needs rehash (iteration count changed)
 * bool needsUpdate = Experimental_PBKDF2_PasswordHasher.NeedsRehash(oldHash);
 * if (needsUpdate)
 * {
 *     string newHash = Experimental_PBKDF2_PasswordHasher.HashPassword(password);
 *     // Update database with newHash
 * }
 *
 * // Benchmark performance
 * TimeSpan time = Experimental_PBKDF2_PasswordHasher.BenchmarkHash();
 * Console.WriteLine($"Hash time: {time.TotalMilliseconds}ms");
 * // Target: 250-500ms (adjust iterations if needed)
 *
 * // Get hash info (debugging)
 * string info = Experimental_PBKDF2_PasswordHasher.GetHashInfo(hash);
 * Console.WriteLine(info);
 *
 * ================================================================================
 * ITERATION COUNT RECOMMENDATIONS (2025)
 * ================================================================================
 *
 * OWASP Guidelines:
 * - 600,000 iterations = Recommended minimum (2025)
 * - 1,000,000 iterations = High security applications
 * - Adjust based on performance testing (aim for 250-500ms)
 *
 * Historical Evolution:
 * - 2012: 10,000 iterations (NIST minimum)
 * - 2017: 100,000 iterations (OWASP recommendation)
 * - 2021: 310,000 iterations (OWASP recommendation)
 * - 2023: 600,000 iterations (current OWASP recommendation)
 * - 2025: Still 600,000 (may increase in future)
 *
 * Why So High?
 * - PBKDF2 is much faster than BCrypt/Argon2 per iteration
 * - Not memory-hard (only CPU-hard)
 * - GPUs can parallelize PBKDF2 more effectively
 * - Need high iteration count to compensate for speed
 *
 * Comparison:
 * - BCrypt work factor 12 ≈ 4,096 iterations (but slower per iteration)
 * - Argon2 3 iterations (but memory-hard, much more expensive)
 * - PBKDF2 needs 600k+ iterations to match security level
 *
 * ================================================================================
 * PARAMETER TUNING
 * ================================================================================
 *
 * Adjust iterations based on your environment:
 *
 * ITERATIONS:
 * - 600,000  = Minimum recommended (OWASP 2025)
 * - 1,000,000 = High security (recommended)
 * - 2,000,000 = Maximum security (if performance allows)
 *
 * TARGET TIMING:
 * - Aim for 250-500ms per hash operation
 * - Test with BenchmarkHash() method
 * - If too fast: increase iterations
 * - If too slow: decrease iterations (but stay above 600k minimum)
 *
 * TESTING EXAMPLE:
 * for (int i = 0; i < 10; i++)
 * {
 *     var time = Experimental_PBKDF2_PasswordHasher.BenchmarkHash();
 *     Console.WriteLine($"Iteration {i+1}: {time.TotalMilliseconds}ms");
 * }
 * // Calculate average and adjust Iterations constant if needed
 *
 * ================================================================================
 * COMPARISON: BCrypt vs Argon2 vs PBKDF2
 * ================================================================================
 *
 * BCRYPT (PRODUCTION CHOICE):
 * ✓ Battle-tested (25+ years)
 * ✓ Automatic salt generation
 * ✓ Simple API
 * ✓ Good GPU resistance
 * ✓ Work factor 12 ≈ 250ms
 * ✗ Fixed memory usage
 * ✗ Requires NuGet package
 *
 * ARGON2ID (MAXIMUM SECURITY):
 * ✓ Most secure (PHC winner)
 * ✓ Memory-hard (best GPU resistance)
 * ✓ Configurable memory/time/parallelism
 * ✗ Newer (less battle-tested)
 * ✗ Higher complexity
 * ✗ Requires NuGet package
 *
 * PBKDF2 (THIS FILE):
 * ✓ Built into .NET (no dependencies)
 * ✓ NIST approved / FIPS compliant
 * ✓ Well-understood
 * ✗ Weakest GPU resistance
 * ✗ Requires very high iterations (600k+)
 * ✗ Only CPU-hard (not memory-hard)
 *
 * RECOMMENDATION ORDER:
 * 1st: BCrypt (best balance, production-ready)
 * 2nd: Argon2id (maximum security, if you need it)
 * 3rd: PBKDF2 (FIPS compliance, built-in requirement)
 *
 * ================================================================================
 */
