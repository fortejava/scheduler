-- =============================================
-- DATABASE MIGRATION: 001_Add_RBAC_3Roles
-- =============================================
-- Date: 2025-11-11
-- Description: Add 3-role RBAC system (Admin, User, Visitor)
-- Dependencies: Requires Users table to exist
-- Rollback: See 001_Add_RBAC_3Roles_ROLLBACK.sql
-- =============================================

USE [scheduler]
GO

SET NOCOUNT ON;
SET XACT_ABORT ON; -- Rollback entire transaction on any error
GO

BEGIN TRANSACTION;
GO

-- =============================================
-- STEP 1: Create Roles table
-- =============================================
PRINT 'Creating Roles table...';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE [dbo].[Roles] (
        [RoleID]            INT IDENTITY(1,1) NOT NULL,
        [RoleName]          NVARCHAR(50) NOT NULL,
        [RoleDescription]   NVARCHAR(255) NULL,
        [CreatedAt]         DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([RoleID] ASC),
        CONSTRAINT [UK_Roles_RoleName] UNIQUE ([RoleName])
    );
    PRINT '✓ Roles table created';
END
ELSE
BEGIN
    PRINT '⚠ Roles table already exists - skipping';
END
GO

-- =============================================
-- STEP 2: Seed Roles data
-- =============================================
PRINT 'Seeding Roles data...';

IF NOT EXISTS (SELECT * FROM [dbo].[Roles] WHERE [RoleName] = 'Admin')
BEGIN
    INSERT INTO [dbo].[Roles] ([RoleName], [RoleDescription])
    VALUES ('Admin', 'Full system access - can manage users, invoices, and customers');
    PRINT '✓ Admin role inserted';
END
ELSE
BEGIN
    PRINT '⚠ Admin role already exists - skipping';
END

IF NOT EXISTS (SELECT * FROM [dbo].[Roles] WHERE [RoleName] = 'User')
BEGIN
    INSERT INTO [dbo].[Roles] ([RoleName], [RoleDescription])
    VALUES ('User', 'Can create, edit, and delete invoices and customers');
    PRINT '✓ User role inserted';
END
ELSE
BEGIN
    PRINT '⚠ User role already exists - skipping';
END

IF NOT EXISTS (SELECT * FROM [dbo].[Roles] WHERE [RoleName] = 'Visitor')
BEGIN
    INSERT INTO [dbo].[Roles] ([RoleName], [RoleDescription])
    VALUES ('Visitor', 'Read-only access - can view invoices and customers but cannot modify');
    PRINT '✓ Visitor role inserted';
END
ELSE
BEGIN
    PRINT '⚠ Visitor role already exists - skipping';
END
GO

-- =============================================
-- STEP 3: Add RoleID column to Users table
-- =============================================
PRINT 'Adding RoleID column to Users table...';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Users') AND name = 'RoleID')
BEGIN
    ALTER TABLE [dbo].[Users]
    ADD [RoleID] INT NULL; -- NULL initially to allow existing users

    PRINT '✓ RoleID column added';
END
ELSE
BEGIN
    PRINT '⚠ RoleID column already exists - skipping';
END
GO

-- =============================================
-- STEP 4: Assign default role to existing users
-- =============================================
PRINT 'Assigning Admin role to existing users...';

DECLARE @AdminRoleID INT;
SELECT @AdminRoleID = [RoleID] FROM [dbo].[Roles] WHERE [RoleName] = 'Admin';

UPDATE [dbo].[Users]
SET [RoleID] = @AdminRoleID
WHERE [RoleID] IS NULL;

DECLARE @UpdatedUsers INT = @@ROWCOUNT;
PRINT '✓ Assigned Admin role to ' + CAST(@UpdatedUsers AS NVARCHAR) + ' existing user(s)';
GO

-- =============================================
-- STEP 5: Make RoleID NOT NULL and add constraint
-- =============================================
PRINT 'Making RoleID NOT NULL and adding foreign key...';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Users') AND name = 'RoleID' AND is_nullable = 1)
BEGIN
    ALTER TABLE [dbo].[Users]
    ALTER COLUMN [RoleID] INT NOT NULL;

    PRINT '✓ RoleID column set to NOT NULL';
END
ELSE
BEGIN
    PRINT '⚠ RoleID column already NOT NULL - skipping';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Users_Roles')
BEGIN
    ALTER TABLE [dbo].[Users]
    ADD CONSTRAINT [FK_Users_Roles]
    FOREIGN KEY ([RoleID]) REFERENCES [dbo].[Roles]([RoleID]);

    PRINT '✓ Foreign key FK_Users_Roles created';
END
ELSE
BEGIN
    PRINT '⚠ Foreign key FK_Users_Roles already exists - skipping';
END
GO

-- =============================================
-- STEP 6: Create SystemConfig table (Setup Lock)
-- =============================================
PRINT 'Creating SystemConfig table...';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemConfig')
BEGIN
    CREATE TABLE [dbo].[SystemConfig] (
        [ConfigID]          INT IDENTITY(1,1) NOT NULL,
        [ConfigKey]         NVARCHAR(100) NOT NULL,
        [ConfigValue]       NVARCHAR(MAX) NULL,
        [Description]       NVARCHAR(255) NULL,
        [UpdatedAt]         DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_SystemConfig] PRIMARY KEY CLUSTERED ([ConfigID] ASC),
        CONSTRAINT [UK_SystemConfig_ConfigKey] UNIQUE ([ConfigKey])
    );
    PRINT '✓ SystemConfig table created';
END
ELSE
BEGIN
    PRINT '⚠ SystemConfig table already exists - skipping';
END
GO

-- =============================================
-- STEP 7: Insert SetupCompleted flag
-- =============================================
PRINT 'Inserting SetupCompleted configuration...';

IF NOT EXISTS (SELECT * FROM [dbo].[SystemConfig] WHERE [ConfigKey] = 'SetupCompleted')
BEGIN
    INSERT INTO [dbo].[SystemConfig] ([ConfigKey], [ConfigValue], [Description])
    VALUES ('SetupCompleted', 'false', 'Indicates whether first-time setup wizard has been completed');
    PRINT '✓ SetupCompleted flag inserted (value: false)';
END
ELSE
BEGIN
    PRINT '⚠ SetupCompleted flag already exists - skipping';
END
GO

-- =============================================
-- VERIFICATION: Check migration results
-- =============================================
PRINT '';
PRINT '==============================================';
PRINT 'MIGRATION VERIFICATION';
PRINT '==============================================';

-- Check Roles table
DECLARE @RoleCount INT;
SELECT @RoleCount = COUNT(*) FROM [dbo].[Roles];
PRINT 'Roles table: ' + CAST(@RoleCount AS NVARCHAR) + ' role(s) found';
IF @RoleCount = 3
    PRINT '✓ All 3 roles present (Admin, User, Visitor)';
ELSE
    PRINT '⚠ Expected 3 roles, found ' + CAST(@RoleCount AS NVARCHAR);

-- Check Users.RoleID column
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Users') AND name = 'RoleID')
    PRINT '✓ Users.RoleID column exists';
ELSE
    PRINT '✗ Users.RoleID column MISSING';

-- Check foreign key
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Users_Roles')
    PRINT '✓ FK_Users_Roles constraint exists';
ELSE
    PRINT '✗ FK_Users_Roles constraint MISSING';

-- Check users with roles assigned
DECLARE @UsersWithRoles INT;
SELECT @UsersWithRoles = COUNT(*) FROM [dbo].[Users] WHERE [RoleID] IS NOT NULL;
PRINT 'Users with roles assigned: ' + CAST(@UsersWithRoles AS NVARCHAR);

-- Check SystemConfig table
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemConfig')
    PRINT '✓ SystemConfig table exists';
ELSE
    PRINT '✗ SystemConfig table MISSING';

-- Check SetupCompleted flag
IF EXISTS (SELECT * FROM [dbo].[SystemConfig] WHERE [ConfigKey] = 'SetupCompleted')
    PRINT '✓ SetupCompleted configuration exists';
ELSE
    PRINT '✗ SetupCompleted configuration MISSING';

PRINT '';
PRINT '==============================================';
PRINT 'Detailed role breakdown:';
PRINT '==============================================';

SELECT
    [RoleID],
    [RoleName],
    [RoleDescription],
    [CreatedAt]
FROM [dbo].[Roles]
ORDER BY [RoleID];

PRINT '';
PRINT '==============================================';
PRINT 'Users by role:';
PRINT '==============================================';

SELECT
    r.[RoleName],
    COUNT(u.[UserID]) AS [User Count]
FROM [dbo].[Roles] r
LEFT JOIN [dbo].[Users] u ON r.[RoleID] = u.[RoleID]
GROUP BY r.[RoleID], r.[RoleName]
ORDER BY r.[RoleID];

PRINT '';
PRINT '✓ MIGRATION COMPLETED SUCCESSFULLY';
PRINT '';

-- Commit transaction
COMMIT TRANSACTION;
PRINT '✓ Transaction committed';
GO

SET NOCOUNT OFF;
GO
