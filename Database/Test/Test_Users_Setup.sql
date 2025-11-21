-- =============================================
-- TEST USERS SETUP
-- =============================================
-- Creates 3 test users (Admin, User, Visitor) for testing authorization
-- Each user gets a test session token for API testing
-- =============================================

USE [scheduler]
GO

-- =============================================
-- STEP 1: Clean existing test data
-- =============================================
PRINT 'Cleaning existing test users and sessions...';

DELETE FROM Sessions WHERE UserID IN (
    SELECT UserID FROM Users WHERE Username IN ('testAdmin', 'testUser', 'testVisitor')
);

DELETE FROM Users WHERE Username IN ('testAdmin', 'testUser', 'testVisitor');

PRINT 'Existing test data cleaned.';
GO

-- =============================================
-- STEP 2: Get Role IDs
-- =============================================
DECLARE @AdminRoleID INT;
DECLARE @UserRoleID INT;
DECLARE @VisitorRoleID INT;

SELECT @AdminRoleID = RoleID FROM Roles WHERE RoleName = 'Admin';
SELECT @UserRoleID = RoleID FROM Roles WHERE RoleName = 'User';
SELECT @VisitorRoleID = RoleID FROM Roles WHERE RoleName = 'Visitor';

PRINT 'Role IDs retrieved:';
PRINT '  Admin RoleID = ' + CAST(@AdminRoleID AS NVARCHAR);
PRINT '  User RoleID = ' + CAST(@UserRoleID AS NVARCHAR);
PRINT '  Visitor RoleID = ' + CAST(@VisitorRoleID AS NVARCHAR);

-- =============================================
-- STEP 3: Create test users with BCrypt hashed passwords
-- =============================================
-- Password for all test users: "test123"
-- BCrypt hash (work factor 12): $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqKLwZb3bG

PRINT 'Creating test users...';

INSERT INTO Users (Username, Password, RoleID) VALUES
('testAdmin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqKLwZb3bG', @AdminRoleID),
('testUser', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqKLwZb3bG', @UserRoleID),
('testVisitor', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqKLwZb3bG', @VisitorRoleID);

PRINT 'Test users created:';
PRINT '  testAdmin (password: test123) - Admin role';
PRINT '  testUser (password: test123) - User role';
PRINT '  testVisitor (password: test123) - Visitor role';
GO

-- =============================================
-- STEP 4: Create test sessions (tokens valid for 7 days)
-- =============================================
PRINT 'Creating test sessions...';

DECLARE @AdminUserID INT;
DECLARE @UserUserID INT;
DECLARE @VisitorUserID INT;

SELECT @AdminUserID = UserID FROM Users WHERE Username = 'testAdmin';
SELECT @UserUserID = UserID FROM Users WHERE Username = 'testUser';
SELECT @VisitorUserID = UserID FROM Users WHERE Username = 'testVisitor';

-- Insert sessions with simple tokens for easy testing
INSERT INTO Sessions (UserID, SessionToken, SessionExpire) VALUES
(@AdminUserID, 'token_test_admin_001', DATEADD(DAY, 7, GETDATE())),
(@UserUserID, 'token_test_user_002', DATEADD(DAY, 7, GETDATE())),
(@VisitorUserID, 'token_test_visitor_003', DATEADD(DAY, 7, GETDATE()));

PRINT 'Test sessions created (valid for 7 days):';
PRINT '  testAdmin: token_test_admin_001';
PRINT '  testUser: token_test_user_002';
PRINT '  testVisitor: token_test_visitor_003';
GO

-- =============================================
-- STEP 5: Verify setup
-- =============================================
PRINT '';
PRINT '==============================================';
PRINT 'VERIFICATION';
PRINT '==============================================';

SELECT
    u.UserID,
    u.Username,
    r.RoleName,
    s.SessionToken,
    s.SessionExpire
FROM Users u
INNER JOIN Roles r ON u.RoleID = r.RoleID
LEFT JOIN Sessions s ON u.UserID = s.UserID
WHERE u.Username IN ('testAdmin', 'testUser', 'testVisitor')
ORDER BY r.RoleID;

PRINT '';
PRINT '==============================================';
PRINT 'TEST SETUP COMPLETE';
PRINT '==============================================';
PRINT '';
PRINT 'You can now test the API with these tokens:';
PRINT '  Admin: token_test_admin_001';
PRINT '  User: token_test_user_002';
PRINT '  Visitor: token_test_visitor_003';
PRINT '';
PRINT 'Test endpoints:';
PRINT '  /Services/Test/TestBaseHandler.ashx (ValidToken - all roles)';
PRINT '  /Services/Test/TestAdminOrUser.ashx (AdminOrUser - Admin and User only)';
PRINT '  /Services/Test/TestAdminOnly.ashx (AdminOnly - Admin only)';
PRINT '';
