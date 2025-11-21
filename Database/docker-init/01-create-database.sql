-- ==============================================================================
-- DATABASE INITIALIZATION - Step 1: Create Database
-- ==============================================================================
--
-- Purpose: Create 'scheduler' database for Loginet Invoice Management System
-- Execution: Automatically run by SQL Server container on first startup
-- Order: 01 (runs first - database must exist before schema creation)
--
-- This script is idempotent - safe to run multiple times
-- ==============================================================================

USE [master];
GO

PRINT '========================================';
PRINT 'Loginet Database Initialization';
PRINT 'Step 1: Create Database';
PRINT '========================================';
PRINT '';

-- ============================================
-- Check if database already exists
-- ============================================

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'scheduler')
BEGIN
    PRINT '⚠️  Database "scheduler" already exists - skipping creation';
    PRINT '';
END
ELSE
BEGIN
    PRINT '✓ Creating database "scheduler"...';

    -- ============================================
    -- Create Database
    -- ============================================

    CREATE DATABASE [scheduler]
    CONTAINMENT = NONE
    ON PRIMARY
    (
        NAME = N'scheduler',
        FILENAME = N'/var/opt/mssql/data/scheduler.mdf',
        SIZE = 50MB,           -- Initial size
        MAXSIZE = UNLIMITED,    -- Allow growth
        FILEGROWTH = 10MB       -- Grow by 10MB when needed
    )
    LOG ON
    (
        NAME = N'scheduler_log',
        FILENAME = N'/var/opt/mssql/data/scheduler_log.ldf',
        SIZE = 20MB,            -- Initial log size
        MAXSIZE = 1GB,          -- Max log size
        FILEGROWTH = 10%        -- Grow by 10%
    );

    PRINT '✓ Database "scheduler" created successfully';
    PRINT '';

    -- ============================================
    -- Set Database Properties
    -- ============================================

    ALTER DATABASE [scheduler] SET COMPATIBILITY_LEVEL = 150;  -- SQL Server 2019
    ALTER DATABASE [scheduler] SET ANSI_NULL_DEFAULT OFF;
    ALTER DATABASE [scheduler] SET ANSI_NULLS OFF;
    ALTER DATABASE [scheduler] SET ANSI_PADDING OFF;
    ALTER DATABASE [scheduler] SET ANSI_WARNINGS OFF;
    ALTER DATABASE [scheduler] SET ARITHABORT OFF;
    ALTER DATABASE [scheduler] SET AUTO_CLOSE OFF;
    ALTER DATABASE [scheduler] SET AUTO_SHRINK OFF;
    ALTER DATABASE [scheduler] SET AUTO_UPDATE_STATISTICS ON;
    ALTER DATABASE [scheduler] SET CURSOR_CLOSE_ON_COMMIT OFF;
    ALTER DATABASE [scheduler] SET CURSOR_DEFAULT GLOBAL;
    ALTER DATABASE [scheduler] SET CONCAT_NULL_YIELDS_NULL OFF;
    ALTER DATABASE [scheduler] SET NUMERIC_ROUNDABORT OFF;
    ALTER DATABASE [scheduler] SET QUOTED_IDENTIFIER OFF;
    ALTER DATABASE [scheduler] SET RECURSIVE_TRIGGERS OFF;
    ALTER DATABASE [scheduler] SET RECOVERY FULL;  -- Full recovery model for backup/restore
    ALTER DATABASE [scheduler] SET MULTI_USER;
    ALTER DATABASE [scheduler] SET PAGE_VERIFY CHECKSUM;
    ALTER DATABASE [scheduler] SET DB_CHAINING OFF;

    PRINT '✓ Database properties configured';
    PRINT '';
END

-- ============================================
-- Verify Database Creation
-- ============================================

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'scheduler')
BEGIN
    PRINT '========================================';
    PRINT '✓ SUCCESS: Database "scheduler" is ready';
    PRINT '========================================';
    PRINT '';
    PRINT 'Next steps:';
    PRINT '  → Step 2: Create database schema (02-create-schema.sql)';
    PRINT '  → Step 3: Seed initial data (03-seed-data.sql)';
    PRINT '';
END
ELSE
BEGIN
    PRINT '========================================';
    PRINT '❌ ERROR: Database creation failed!';
    PRINT '========================================';
    RAISERROR ('Database "scheduler" was not created successfully', 16, 1);
END

GO
