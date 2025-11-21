-- ==============================================
-- EXPORT FULL DATABASE SCHEMA TO FILE
-- ==============================================
-- This script generates a complete DB.sql from current database
-- Run with: sqlcmd -S localhost -d scheduler -E -i export_full_schema.sql -o DB_REGENERATED.sql -h-1 -W
-- ==============================================

USE [scheduler]
GO

SET NOCOUNT ON
GO

PRINT '-- =============================================='
PRINT '-- DATABASE: scheduler'
PRINT '-- Generated: ' + CONVERT(VARCHAR, GETDATE(), 120)
PRINT '-- Description: Complete schema with RBAC (3 roles)'
PRINT '-- =============================================='
PRINT ''
PRINT 'USE [scheduler]'
PRINT 'GO'
PRINT ''

-- ================== TABLES ==================

-- ROLES TABLE
PRINT '-- =============================================='
PRINT '-- Table: Roles'
PRINT '-- =============================================='
PRINT 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = ''Roles'')'
PRINT 'BEGIN'
PRINT '    CREATE TABLE [dbo].[Roles]('
PRINT '        [RoleID] [int] IDENTITY(1,1) NOT NULL,'
PRINT '        [RoleName] [nvarchar](50) NOT NULL,'
PRINT '        [RoleDescription] [nvarchar](255) NULL,'
PRINT '        [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE(),'
PRINT '        CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([RoleID] ASC),'
PRINT '        CONSTRAINT [UK_Roles_RoleName] UNIQUE NONCLUSTERED ([RoleName] ASC)'
PRINT '    )'
PRINT 'END'
PRINT 'GO'
PRINT ''

-- USERS TABLE
PRINT '-- =============================================='
PRINT '-- Table: Users'
PRINT '-- =============================================='
PRINT 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = ''Users'')'
PRINT 'BEGIN'
PRINT '    CREATE TABLE [dbo].[Users]('
PRINT '        [UserID] [int] IDENTITY(1,1) NOT NULL,'
PRINT '        [Username] [nvarchar](100) NOT NULL,'
PRINT '        [Password] [nvarchar](255) NOT NULL,'
PRINT '        [RoleID] [int] NOT NULL,'
PRINT '        CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([UserID] ASC),'
PRINT '        CONSTRAINT [UQ_Username] UNIQUE NONCLUSTERED ([Username] ASC)'
PRINT '    )'
PRINT 'END'
PRINT 'GO'
PRINT ''
PRINT 'IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = ''IX_Username'')'
PRINT 'BEGIN'
PRINT '    CREATE NONCLUSTERED INDEX [IX_Username] ON [dbo].[Users] ([Username] ASC)'
PRINT 'END'
PRINT 'GO'
PRINT ''

-- STATUS TABLE
PRINT '-- =============================================='
PRINT '-- Table: Status'
PRINT '-- =============================================='
PRINT 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = ''Status'')'
PRINT 'BEGIN'
PRINT '    CREATE TABLE [dbo].[Status]('
PRINT '        [StatusID] [int] IDENTITY(1,1) NOT NULL,'
PRINT '        [StatusName] [nvarchar](50) NOT NULL,'
PRINT '        CONSTRAINT [PK_Status] PRIMARY KEY CLUSTERED ([StatusID] ASC),'
PRINT '        CONSTRAINT [UQ_StatusName] UNIQUE NONCLUSTERED ([StatusName] ASC)'
PRINT '    )'
PRINT 'END'
PRINT 'GO'
PRINT ''

-- CUSTOMERS TABLE
PRINT '-- =============================================='
PRINT '-- Table: Customers'
PRINT '-- =============================================='
PRINT 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = ''Customers'')'
PRINT 'BEGIN'
PRINT '    CREATE TABLE [dbo].[Customers]('
PRINT '        [CustomerID] [int] IDENTITY(1,1) NOT NULL,'
PRINT '        [CustomerName] [nvarchar](100) NOT NULL,'
PRINT '        CONSTRAINT [PK_Customers] PRIMARY KEY CLUSTERED ([CustomerID] ASC),'
PRINT '        CONSTRAINT [UQ_CustomerName] UNIQUE NONCLUSTERED ([CustomerName] ASC)'
PRINT '    )'
PRINT 'END'
PRINT 'GO'
PRINT ''

-- INVOICES TABLE
PRINT '-- =============================================='
PRINT '-- Table: Invoices'
PRINT '-- =============================================='
PRINT 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = ''Invoices'')'
PRINT 'BEGIN'
PRINT '    CREATE TABLE [dbo].[Invoices]('
PRINT '        [InvoiceID] [int] IDENTITY(1,1) NOT NULL,'
PRINT '        [InvoiceNumber] [nvarchar](50) NOT NULL,'
PRINT '        [CustomerID] [int] NOT NULL,'
PRINT '        [InvoiceDate] [datetime] NOT NULL,'
PRINT '        [DueDate] [datetime] NOT NULL,'
PRINT '        [TotalAmount] [decimal](18, 2) NOT NULL,'
PRINT '        [InvoiceTax] [decimal](18, 2) NULL,'
PRINT '        [StatusID] [int] NOT NULL,'
PRINT '        CONSTRAINT [PK_Invoices] PRIMARY KEY CLUSTERED ([InvoiceID] ASC),'
PRINT '        CONSTRAINT [UQ_InvoiceNumber] UNIQUE NONCLUSTERED ([InvoiceNumber] ASC)'
PRINT '    )'
PRINT 'END'
PRINT 'GO'
PRINT ''

-- SESSIONS TABLE
PRINT '-- =============================================='
PRINT '-- Table: Sessions'
PRINT '-- =============================================='
PRINT 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = ''Sessions'')'
PRINT 'BEGIN'
PRINT '    CREATE TABLE [dbo].[Sessions]('
PRINT '        [SessionID] [int] IDENTITY(1,1) NOT NULL,'
PRINT '        [UserID] [int] NOT NULL,'
PRINT '        [Token] [nvarchar](255) NOT NULL,'
PRINT '        [ExpiredAt] [datetime] NOT NULL,'
PRINT '        [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE(),'
PRINT '        CONSTRAINT [PK_Sessions] PRIMARY KEY CLUSTERED ([SessionID] ASC),'
PRINT '        CONSTRAINT [UQ_Token] UNIQUE NONCLUSTERED ([Token] ASC)'
PRINT '    )'
PRINT 'END'
PRINT 'GO'
PRINT ''

-- SYSTEMCONFIG TABLE
PRINT '-- =============================================='
PRINT '-- Table: SystemConfig'
PRINT '-- =============================================='
PRINT 'IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = ''SystemConfig'')'
PRINT 'BEGIN'
PRINT '    CREATE TABLE [dbo].[SystemConfig]('
PRINT '        [ConfigID] [int] IDENTITY(1,1) NOT NULL,'
PRINT '        [ConfigKey] [nvarchar](100) NOT NULL,'
PRINT '        [ConfigValue] [nvarchar](max) NULL,'
PRINT '        [Description] [nvarchar](255) NULL,'
PRINT '        [UpdatedAt] [datetime] NOT NULL DEFAULT GETDATE(),'
PRINT '        CONSTRAINT [PK_SystemConfig] PRIMARY KEY CLUSTERED ([ConfigID] ASC),'
PRINT '        CONSTRAINT [UK_SystemConfig_ConfigKey] UNIQUE NONCLUSTERED ([ConfigKey] ASC)'
PRINT '    )'
PRINT 'END'
PRINT 'GO'
PRINT ''

-- ================== FOREIGN KEYS ==================

PRINT '-- =============================================='
PRINT '-- Foreign Keys'
PRINT '-- =============================================='

PRINT 'IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = ''FK_Users_Roles'')'
PRINT 'BEGIN'
PRINT '    ALTER TABLE [dbo].[Users] WITH CHECK ADD CONSTRAINT [FK_Users_Roles]'
PRINT '    FOREIGN KEY([RoleID]) REFERENCES [dbo].[Roles] ([RoleID])'
PRINT 'END'
PRINT 'GO'
PRINT ''

PRINT 'IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = ''FK_Invoices_Customers'')'
PRINT 'BEGIN'
PRINT '    ALTER TABLE [dbo].[Invoices] WITH CHECK ADD CONSTRAINT [FK_Invoices_Customers]'
PRINT '    FOREIGN KEY([CustomerID]) REFERENCES [dbo].[Customers] ([CustomerID])'
PRINT 'END'
PRINT 'GO'
PRINT ''

PRINT 'IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = ''FK_Invoices_Status'')'
PRINT 'BEGIN'
PRINT '    ALTER TABLE [dbo].[Invoices] WITH CHECK ADD CONSTRAINT [FK_Invoices_Status]'
PRINT '    FOREIGN KEY([StatusID]) REFERENCES [dbo].[Status] ([StatusID])'
PRINT 'END'
PRINT 'GO'
PRINT ''

PRINT 'IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = ''FK_Sessions_Users'')'
PRINT 'BEGIN'
PRINT '    ALTER TABLE [dbo].[Sessions] WITH CHECK ADD CONSTRAINT [FK_Sessions_Users]'
PRINT '    FOREIGN KEY([UserID]) REFERENCES [dbo].[Users] ([UserID])'
PRINT 'END'
PRINT 'GO'
PRINT ''

-- ================== SEED DATA ==================

PRINT '-- =============================================='
PRINT '-- Seed Data'
PRINT '-- =============================================='

-- Roles seed data
PRINT 'IF NOT EXISTS (SELECT * FROM [dbo].[Roles])'
PRINT 'BEGIN'
PRINT '    SET IDENTITY_INSERT [dbo].[Roles] ON'
PRINT '    INSERT [dbo].[Roles] ([RoleID], [RoleName], [RoleDescription]) VALUES'
PRINT '    (1, N''Admin'', N''Full system access - can manage users, invoices, and customers''),'
PRINT '    (2, N''User'', N''Can create, edit, and delete invoices and customers''),'
PRINT '    (3, N''Visitor'', N''Read-only access - can view invoices and customers but cannot modify'')'
PRINT '    SET IDENTITY_INSERT [dbo].[Roles] OFF'
PRINT 'END'
PRINT 'GO'
PRINT ''

-- SystemConfig seed data
PRINT 'IF NOT EXISTS (SELECT * FROM [dbo].[SystemConfig] WHERE ConfigKey = ''SetupCompleted'')'
PRINT 'BEGIN'
PRINT '    INSERT [dbo].[SystemConfig] ([ConfigKey], [ConfigValue], [Description]) VALUES'
PRINT '    (N''SetupCompleted'', N''false'', N''Indicates whether first-time setup wizard has been completed'')'
PRINT 'END'
PRINT 'GO'
PRINT ''

PRINT '-- =============================================='
PRINT '-- Schema generation complete!'
PRINT '-- =============================================='
GO
