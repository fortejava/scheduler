-- ==============================================
-- ⚠️ DESTRUCTIVE UTILITY - USE WITH EXTREME CAUTION
-- ==============================================
-- Purpose: Deletes ALL users and sessions, resets identity counters
-- WARNING: This will DELETE ALL USER DATA from the database!
-- WARNING: This will DELETE ALL SESSION DATA from the database!
-- WARNING: This action is IRREVERSIBLE!
--
-- Use Case: Development/Test environment reset ONLY
-- DO NOT RUN ON PRODUCTION DATABASE!
--
-- Before running:
-- 1. Confirm you are connected to a DEV/TEST database
-- 2. Ensure you have a recent backup
-- 3. Verify no production users exist
-- ==============================================

USE [scheduler];
GO

PRINT '⚠️ WARNING: This script will DELETE ALL users and sessions!';
PRINT 'Press Ctrl+C within 5 seconds to cancel...';
WAITFOR DELAY '00:00:05';
GO

PRINT 'Proceeding with deletion...';

-- 1. DELETE ALL RECORDS
DELETE FROM Sessions;
PRINT '✓ Deleted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' session(s)';

DELETE FROM Users;
PRINT '✓ Deleted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' user(s)';

-- 2. RESET IDENTITY COUNTERS
DBCC CHECKIDENT (Users, RESEED, 0);
PRINT '✓ Reset Users identity counter';

DBCC CHECKIDENT (Sessions, RESEED, 0);
PRINT '✓ Reset Sessions identity counter';

PRINT '';
PRINT '✓ Cleanup complete!';
PRINT '⚠️ Remember to re-seed users and roles if needed';
GO
