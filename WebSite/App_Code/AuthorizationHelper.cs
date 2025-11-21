using System;
using System.Linq;

/// <summary>
/// Helper class for authorization checks.
/// Provides methods to verify if a user has required roles.
/// </summary>
public static class AuthorizationHelper
{
    /// <summary>
    /// Check if user has one of the specified roles.
    /// </summary>
    /// <param name="tokenInfo">Token information from ValidateToken</param>
    /// <param name="allowedRoles">Array of allowed role names</param>
    /// <returns>True if user has one of the allowed roles, false otherwise</returns>
    public static bool HasRole(SimpleTokenManager.TokenInfo tokenInfo, params string[] allowedRoles)
    {
        if (tokenInfo == null || string.IsNullOrEmpty(tokenInfo.Role))
        {
            return false;
        }

        return allowedRoles.Any(role => role.Equals(tokenInfo.Role, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Check if user has Admin role.
    /// </summary>
    /// <param name="tokenInfo">Token information from ValidateToken</param>
    /// <returns>True if user is Admin, false otherwise</returns>
    public static bool IsAdmin(SimpleTokenManager.TokenInfo tokenInfo)
    {
        return HasRole(tokenInfo, "Admin");
    }

    /// <summary>
    /// Check if user has Admin or User role.
    /// </summary>
    /// <param name="tokenInfo">Token information from ValidateToken</param>
    /// <returns>True if user is Admin or User, false otherwise</returns>
    public static bool IsAdminOrUser(SimpleTokenManager.TokenInfo tokenInfo)
    {
        return HasRole(tokenInfo, "Admin", "User");
    }

    /// <summary>
    /// Check if user has Visitor role.
    /// </summary>
    /// <param name="tokenInfo">Token information from ValidateToken</param>
    /// <returns>True if user is Visitor, false otherwise</returns>
    public static bool IsVisitor(SimpleTokenManager.TokenInfo tokenInfo)
    {
        return HasRole(tokenInfo, "Visitor");
    }
}
