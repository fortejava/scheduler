-- =============================================
-- DATABASE ROLLBACK: 001_Add_RBAC_3Roles
-- =============================================
-- Date: 2025-11-11
-- Description: Rollback 3-role RBAC system migration
-- WARNING: This will DELETE all role assignments!
-- WARNING: Existing users will lose their role assignments!
-- =============================================

USE [scheduler]
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;
GO

PRINT '==============================================';
PRINT 'ROLLING BACK: 001_Add_RBAC_3Roles';
PRINT '==============================================';
PRINT '';

-- =============================================
-- STEP 1: Remove SetupCompleted configuration
-- =============================================
PRINT 'Removing SetupCompleted configuration...';

IF EXISTS (SELECT * FROM [dbo].[SystemConfig] WHERE [ConfigKey] = 'SetupCompleted')
BEGIN
    DELETE FROM [dbo].[SystemConfig] WHERE [ConfigKey] = 'SetupCompleted';
    PRINT '✓ SetupCompleted configuration removed';
END
ELSE
BEGIN
    PRINT '⚠ SetupCompleted configuration not found - skipping';
END
GO

-- =============================================
-- STEP 2: Drop SystemConfig table
-- =============================================
PRINT 'Dropping SystemConfig table...';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemConfig')
BEGIN
    DROP TABLE [dbo].[SystemConfig];
    PRINT '✓ SystemConfig table dropped';
END
ELSE
BEGIN
    PRINT '⚠ SystemConfig table not found - skipping';
END
GO

-- =============================================
-- STEP 3: Drop foreign key constraint
-- =============================================
PRINT 'Dropping FK_Users_Roles constraint...';

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Users_Roles')
BEGIN
    ALTER TABLE [dbo].[Users]
    DROP CONSTRAINT [FK_Users_Roles];
    PRINT '✓ FK_Users_Roles constraint dropped';
END
ELSE
BEGIN
    PRINT '⚠ FK_Users_Roles constraint not found - skipping';
END
GO

-- =============================================
-- STEP 4: Remove RoleID column from Users
-- =============================================
PRINT 'Removing RoleID column from Users table...';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Users') AND name = 'RoleID')
BEGIN
    ALTER TABLE [dbo].[Users]
    DROP COLUMN [RoleID];
    PRINT '✓ RoleID column removed from Users table';
END
ELSE
BEGIN
    PRINT '⚠ RoleID column not found - skipping';
END
GO

-- =============================================
-- STEP 5: Drop Roles table
-- =============================================
PRINT 'Dropping Roles table...';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    DROP TABLE [dbo].[Roles];
    PRINT '✓ Roles table dropped';
END
ELSE
BEGIN
    PRINT '⚠ Roles table not found - skipping';
END
GO

-- =============================================
-- VERIFICATION: Check rollback results
-- =============================================
PRINT '';
PRINT '==============================================';
PRINT 'ROLLBACK VERIFICATION';
PRINT '==============================================';

-- Check Roles table removed
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
    PRINT '✓ Roles table removed';
ELSE
    PRINT '✗ Roles table still exists!';

-- Check SystemConfig table removed
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemConfig')
    PRINT '✓ SystemConfig table removed';
ELSE
    PRINT '✗ SystemConfig table still exists!';

-- Check Users.RoleID column removed
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Users') AND name = 'RoleID')
    PRINT '✓ Users.RoleID column removed';
ELSE
    PRINT '✗ Users.RoleID column still exists!';

-- Check foreign key removed
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Users_Roles')
    PRINT '✓ FK_Users_Roles constraint removed';
ELSE
    PRINT '✗ FK_Users_Roles constraint still exists!';

PRINT '';
PRINT '✓ ROLLBACK COMPLETED SUCCESSFULLY';
PRINT '';

-- Commit transaction
COMMIT TRANSACTION;
PRINT '✓ Transaction committed';
GO

SET NOCOUNT OFF;
GO
