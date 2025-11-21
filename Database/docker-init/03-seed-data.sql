-- ==============================================================================
-- DATABASE INITIALIZATION - Step 3: Seed Initial Data
-- ==============================================================================
--
-- Purpose: Insert essential seed data for Loginet Invoice Management System
-- Execution: Automatically run by SQL Server container on first startup
-- Order: 03 (runs after schema creation)
--
-- This script seeds:
--   - 3 Roles: Admin, User, Visitor (RBAC)
--   - 3 Status labels: Saldato, Non Saldato, Scaduto
--   - 1 System Config: SetupCompleted flag
--
-- This script is idempotent - safe to run multiple times (IF NOT EXISTS checks)
-- ==============================================================================

USE [scheduler];
GO

PRINT '========================================';
PRINT 'Loginet Database Initialization';
PRINT 'Step 3: Seed Initial Data';
PRINT '========================================';
PRINT '';

-- ==============================================================================
-- 1. SEED ROLES TABLE (RBAC)
-- ==============================================================================

PRINT 'Seeding Roles table...';

-- Seed Roles (Admin, User, Visitor)
SET IDENTITY_INSERT [dbo].[Roles] ON;

-- Admin Role (RoleID: 1)
IF NOT EXISTS (SELECT * FROM [dbo].[Roles] WHERE [RoleID] = 1)
BEGIN
    INSERT [dbo].[Roles] ([RoleID], [RoleName], [RoleDescription], [CreatedAt])
    VALUES (1, N'Admin', N'Full system access - can manage users, invoices, and customers', GETDATE());
    PRINT '✓ Inserted: Admin role';
END
ELSE
BEGIN
    PRINT '⚠ Admin role already exists - skipping';
END

-- User Role (RoleID: 2)
IF NOT EXISTS (SELECT * FROM [dbo].[Roles] WHERE [RoleID] = 2)
BEGIN
    INSERT [dbo].[Roles] ([RoleID], [RoleName], [RoleDescription], [CreatedAt])
    VALUES (2, N'User', N'Can create, edit, and delete invoices and customers', GETDATE());
    PRINT '✓ Inserted: User role';
END
ELSE
BEGIN
    PRINT '⚠ User role already exists - skipping';
END

-- Visitor Role (RoleID: 3)
IF NOT EXISTS (SELECT * FROM [dbo].[Roles] WHERE [RoleID] = 3)
BEGIN
    INSERT [dbo].[Roles] ([RoleID], [RoleName], [RoleDescription], [CreatedAt])
    VALUES (3, N'Visitor', N'Read-only access - can view invoices and customers but cannot modify', GETDATE());
    PRINT '✓ Inserted: Visitor role';
END
ELSE
BEGIN
    PRINT '⚠ Visitor role already exists - skipping';
END

SET IDENTITY_INSERT [dbo].[Roles] OFF;

PRINT 'Roles seeding complete!';
PRINT '';

-- ==============================================================================
-- 2. SEED STATUS TABLE
-- ==============================================================================

PRINT 'Seeding Status table...';

-- Saldato (Paid)
IF NOT EXISTS (SELECT * FROM [dbo].[Status] WHERE [StatusLabel] = 'Saldato')
BEGIN
    INSERT INTO [dbo].[Status] ([StatusLabel]) VALUES (N'Saldato');
    PRINT '✓ Inserted: Saldato (Paid)';
END
ELSE
BEGIN
    PRINT '⚠ Saldato already exists - skipping';
END

-- Non Saldato (Unpaid)
IF NOT EXISTS (SELECT * FROM [dbo].[Status] WHERE [StatusLabel] = 'Non Saldato')
BEGIN
    INSERT INTO [dbo].[Status] ([StatusLabel]) VALUES (N'Non Saldato');
    PRINT '✓ Inserted: Non Saldato (Unpaid)';
END
ELSE
BEGIN
    PRINT '⚠ Non Saldato already exists - skipping';
END

-- Scaduto (Overdue)
IF NOT EXISTS (SELECT * FROM [dbo].[Status] WHERE [StatusLabel] = 'Scaduto')
BEGIN
    INSERT INTO [dbo].[Status] ([StatusLabel]) VALUES (N'Scaduto');
    PRINT '✓ Inserted: Scaduto (Overdue)';
END
ELSE
BEGIN
    PRINT '⚠ Scaduto already exists - skipping';
END

PRINT 'Status seeding complete!';
PRINT '';

-- ==============================================================================
-- 3. SEED SYSTEMCONFIG TABLE
-- ==============================================================================

PRINT 'Seeding SystemConfig table...';

-- SetupCompleted Flag
IF NOT EXISTS (SELECT * FROM [dbo].[SystemConfig] WHERE [ConfigKey] = 'SetupCompleted')
BEGIN
    INSERT [dbo].[SystemConfig] ([ConfigKey], [ConfigValue], [Description], [UpdatedAt])
    VALUES (N'SetupCompleted', N'false', N'Indicates whether first-time setup wizard has been completed', GETDATE());
    PRINT '✓ Inserted: SetupCompleted config';
END
ELSE
BEGIN
    PRINT '⚠ SetupCompleted config already exists - skipping';
END

PRINT 'SystemConfig seeding complete!';
PRINT '';

-- ==============================================================================
-- VERIFICATION
-- ==============================================================================

PRINT '========================================';
PRINT 'Verification: Checking Seeded Data';
PRINT '========================================';
PRINT '';

-- Count roles
DECLARE @RoleCount INT;
SELECT @RoleCount = COUNT(*) FROM [dbo].[Roles];
PRINT 'Roles: ' + CAST(@RoleCount AS NVARCHAR(10)) + ' (Expected: 3)';

-- Count statuses
DECLARE @StatusCount INT;
SELECT @StatusCount = COUNT(*) FROM [dbo].[Status];
PRINT 'Statuses: ' + CAST(@StatusCount AS NVARCHAR(10)) + ' (Expected: 3)';

-- Count system configs
DECLARE @ConfigCount INT;
SELECT @ConfigCount = COUNT(*) FROM [dbo].[SystemConfig];
PRINT 'System Configs: ' + CAST(@ConfigCount AS NVARCHAR(10)) + ' (Expected: 1)';

PRINT '';

-- ==============================================================================
-- SUCCESS MESSAGE
-- ==============================================================================

IF @RoleCount >= 3 AND @StatusCount >= 3 AND @ConfigCount >= 1
BEGIN
    PRINT '========================================';
    PRINT '✓ SUCCESS: All seed data inserted!';
    PRINT '========================================';
    PRINT '';
    PRINT 'Database "scheduler" is now ready to use';
    PRINT '';
    PRINT 'Next steps:';
    PRINT '  → Create first user via setup wizard';
    PRINT '  → Or run Test_Users_Setup.sql for test users';
    PRINT '  → Start the web application';
    PRINT '';
END
ELSE
BEGIN
    PRINT '========================================';
    PRINT '⚠ WARNING: Some seed data may be missing';
    PRINT '========================================';
    PRINT '';
    PRINT 'Please verify data manually';
END

GO
