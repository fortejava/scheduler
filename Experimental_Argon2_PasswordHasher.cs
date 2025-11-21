/*
 * ================================================================================
 * EXPERIMENTAL: Argon2id Password Hashing Implementation
 * ================================================================================
 *
 * This file is for STUDY and EXPERIMENTATION purposes only.
 * NOT used in production - BCrypt is used instead.
 *
 * WHAT IS ARGON2?
 * - Winner of Password Hashing Competition (2015)
 * - Most secure password hashing algorithm available
 * - Memory-hard algorithm (resists GPU/ASIC attacks)
 * - Three variants: Argon2d, Argon2i, Argon2id (id = hybrid, recommended)
 *
 * ADVANTAGES:
 * ✓ Maximum security (state-of-the-art)
 * ✓ GPU/ASIC resistant (memory-hard)
 * ✓ Configurable memory, time, parallelism
 * ✓ Future-proof design
 *
 * DISADVANTAGES:
 * ✗ Requires third-party library (Konscious.Security.Cryptography.Argon2)
 * ✗ Higher memory usage (intentional - part of security)
 * ✗ More complex configuration
 * ✗ Less battle-tested than BCrypt (newer)
 *
 * WHEN TO USE:
 * - High-security applications (banking, government, healthcare)
 * - When maximum GPU resistance is required
 * - When you have control over server resources
 * - When third-party libraries are acceptable
 *
 * NUGET PACKAGE REQUIRED:
 * Install-Package Konscious.Security.Cryptography.Argon2
 *
 * VERSION: 1.3.0 (or later)
 *
 * ================================================================================
 */

using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;

/// <summary>
/// EXPERIMENTAL: Argon2id password hashing implementation
/// For study and experimentation - NOT used in production
/// </summary>
public static class Experimental_Argon2_PasswordHasher
{
    // ============================================================================
    // CONFIGURATION PARAMETERS
    // ============================================================================

    /// <summary>
    /// Salt size in bytes (16 bytes = 128 bits)
    /// Recommended: 16 bytes minimum
    /// </summary>
    private const int SaltSize = 16;

    /// <summary>
    /// Hash size in bytes (32 bytes = 256 bits)
    /// Recommended: 32 bytes (SHA-256 equivalent)
    /// </summary>
    private const int HashSize = 32;

    /// <summary>
    /// Number of iterations (time cost)
    /// Higher = slower but more secure
    /// Recommended: 3-4 iterations (2025 standard)
    /// </summary>
    private const int Iterations = 3;

    /// <summary>
    /// Memory size in KB (memory cost)
    /// Higher = more memory usage = better GPU resistance
    /// Recommended: 65536 KB (64 MB) for server applications
    /// </summary>
    private const int MemorySize = 65536; // 64 MB

    /// <summary>
    /// Degree of parallelism (threads)
    /// Should match server CPU cores
    /// Recommended: 4 threads (typical server)
    /// </summary>
    private const int Parallelism = 4;

    // ============================================================================
    // HASH PASSWORD
    // ============================================================================

    /// <summary>
    /// Hash a plaintext password using Argon2id
    /// </summary>
    /// <param name="password">Plaintext password to hash</param>
    /// <returns>Formatted hash string: $argon2id$v=19$m=65536,t=3,p=4$salt$hash</returns>
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

        // Hash password with Argon2id
        byte[] hash = HashPasswordWithSalt(password, salt);

        // Format: $argon2id$v=19$m=65536,t=3,p=4$<salt_base64>$<hash_base64>
        string saltBase64 = Convert.ToBase64String(salt);
        string hashBase64 = Convert.ToBase64String(hash);

        return $"$argon2id$v=19$m={MemorySize},t={Iterations},p={Parallelism}${saltBase64}${hashBase64}";
    }

    /// <summary>
    /// Hash password with provided salt (internal use)
    /// </summary>
    private static byte[] HashPasswordWithSalt(string password, byte[] salt)
    {
        using (var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password)))
        {
            argon2.Salt = salt;
            argon2.DegreeOfParallelism = Parallelism;
            argon2.MemorySize = MemorySize;
            argon2.Iterations = Iterations;

            return argon2.GetBytes(HashSize);
        }
    }

    // ============================================================================
    // VERIFY PASSWORD
    // ============================================================================

    /// <summary>
    /// Verify a plaintext password against an Argon2id hash
    /// </summary>
    /// <param name="password">Plaintext password to verify</param>
    /// <param name="hashString">Argon2id hash string to verify against</param>
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
            // Format: $argon2id$v=19$m=65536,t=3,p=4$<salt_base64>$<hash_base64>
            var parts = hashString.Split('$');
            if (parts.Length != 6)
            {
                return false; // Invalid format
            }

            // Extract salt and hash
            byte[] salt = Convert.FromBase64String(parts[4]);
            byte[] expectedHash = Convert.FromBase64String(parts[5]);

            // Rehash password with same salt
            byte[] actualHash = HashPasswordWithSalt(password, salt);

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
    /// Parse hash string parameters (for debugging/analysis)
    /// </summary>
    public static string GetHashInfo(string hashString)
    {
        try
        {
            var parts = hashString.Split('$');
            if (parts.Length != 6)
            {
                return "Invalid hash format";
            }

            string algorithm = parts[1];  // argon2id
            string version = parts[2];    // v=19
            string params_ = parts[3];    // m=65536,t=3,p=4
            string salt = parts[4];       // base64 salt
            string hash = parts[5];       // base64 hash

            return $@"
Algorithm: {algorithm}
Version: {version}
Parameters: {params_}
Salt length: {Convert.FromBase64String(salt).Length} bytes
Hash length: {Convert.FromBase64String(hash).Length} bytes
Total length: {hashString.Length} characters
";
        }
        catch
        {
            return "Error parsing hash";
        }
    }
}

/*
 * ================================================================================
 * LEARNING RESOURCES
 * ================================================================================
 *
 * Official Specification:
 * https://github.com/P-H-C/phc-winner-argon2/blob/master/argon2-specs.pdf
 *
 * OWASP Recommendations:
 * https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 *
 * Library Documentation:
 * https://github.com/kmaragon/Konscious.Security.Cryptography
 *
 * Parameter Tuning Guide:
 * https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
 *
 * Academic Paper (PHC Winner):
 * https://www.cryptolux.org/images/0/0d/Argon2.pdf
 *
 * ================================================================================
 * USAGE EXAMPLE
 * ================================================================================
 *
 * // Hash a password
 * string password = "MySecretPassword123!";
 * string hash = Experimental_Argon2_PasswordHasher.HashPassword(password);
 * // Result: $argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash> (~100 chars)
 *
 * // Verify password
 * bool isValid = Experimental_Argon2_PasswordHasher.VerifyPassword(password, hash);
 * // Result: true
 *
 * // Wrong password
 * bool isValid2 = Experimental_Argon2_PasswordHasher.VerifyPassword("WrongPassword", hash);
 * // Result: false
 *
 * // Get hash info (debugging)
 * string info = Experimental_Argon2_PasswordHasher.GetHashInfo(hash);
 * Console.WriteLine(info);
 *
 * ================================================================================
 * PARAMETER TUNING
 * ================================================================================
 *
 * Adjust these parameters based on your environment:
 *
 * MEMORY SIZE (m):
 * - 65536 KB (64 MB)  = Recommended for servers (2025)
 * - 47104 KB (46 MB)  = Minimum recommended (OWASP)
 * - 19456 KB (19 MB)  = Minimum acceptable (older systems)
 *
 * ITERATIONS (t):
 * - 3-4 iterations = Recommended (2025)
 * - 2 iterations   = Minimum (OWASP)
 * - 1 iteration    = Not recommended
 *
 * PARALLELISM (p):
 * - 4 threads  = Typical server (quad-core)
 * - 8 threads  = High-end server (8+ cores)
 * - 1 thread   = Single-core (not recommended)
 *
 * TARGET TIMING:
 * - Aim for 250-500ms per hash operation
 * - Adjust parameters to achieve this on YOUR hardware
 * - Test with: Stopwatch.StartNew() ... Stopwatch.Stop()
 *
 * ================================================================================
 */
