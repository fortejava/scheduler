Changed database context to 'scheduler'.
-- ==============================================
-- DATABASE: scheduler
-- Generated: 2025-11-11 21:27:59
-- Description: Complete schema with RBAC (3 roles)
-- ==============================================
 
USE [scheduler]
GO
 
-- ==============================================
-- Table: Roles
-- ==============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE [dbo].[Roles](
        [RoleID] [int] IDENTITY(1,1) NOT NULL,
        [RoleName] [nvarchar](50) NOT NULL,
        [RoleDescription] [nvarchar](255) NULL,
        [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([RoleID] ASC),
        CONSTRAINT [UK_Roles_RoleName] UNIQUE NONCLUSTERED ([RoleName] ASC)
    )
END
GO
 
-- ==============================================
-- Table: Users
-- ==============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE [dbo].[Users](
        [UserID] [int] IDENTITY(1,1) NOT NULL,
        [Username] [nvarchar](100) NOT NULL,
        [Password] [nvarchar](255) NOT NULL,
        [RoleID] [int] NOT NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([UserID] ASC),
        CONSTRAINT [UQ_Username] UNIQUE NONCLUSTERED ([Username] ASC)
    )
END
GO
 
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Username')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Username] ON [dbo].[Users] ([Username] ASC)
END
GO
 
-- ==============================================
-- Table: Status
-- ==============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Status')
BEGIN
    CREATE TABLE [dbo].[Status](
        [StatusID] [int] IDENTITY(1,1) NOT NULL,
        [StatusName] [nvarchar](50) NOT NULL,
        CONSTRAINT [PK_Status] PRIMARY KEY CLUSTERED ([StatusID] ASC),
        CONSTRAINT [UQ_StatusName] UNIQUE NONCLUSTERED ([StatusName] ASC)
    )
END
GO
 
-- ==============================================
-- Table: Customers
-- ==============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers')
BEGIN
    CREATE TABLE [dbo].[Customers](
        [CustomerID] [int] IDENTITY(1,1) NOT NULL,
        [CustomerName] [nvarchar](100) NOT NULL,
        CONSTRAINT [PK_Customers] PRIMARY KEY CLUSTERED ([CustomerID] ASC),
        CONSTRAINT [UQ_CustomerName] UNIQUE NONCLUSTERED ([CustomerName] ASC)
    )
END
GO
 
-- ==============================================
-- Table: Invoices
-- ==============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Invoices')
BEGIN
    CREATE TABLE [dbo].[Invoices](
        [InvoiceID] [int] IDENTITY(1,1) NOT NULL,
        [InvoiceNumber] [nvarchar](50) NOT NULL,
        [CustomerID] [int] NOT NULL,
        [InvoiceDate] [datetime] NOT NULL,
        [DueDate] [datetime] NOT NULL,
        [TotalAmount] [decimal](18, 2) NOT NULL,
        [InvoiceTax] [decimal](18, 2) NULL,
        [StatusID] [int] NOT NULL,
        CONSTRAINT [PK_Invoices] PRIMARY KEY CLUSTERED ([InvoiceID] ASC),
        CONSTRAINT [UQ_InvoiceNumber] UNIQUE NONCLUSTERED ([InvoiceNumber] ASC)
    )
END
GO
 
-- ==============================================
-- Table: Sessions
-- ==============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Sessions')
BEGIN
    CREATE TABLE [dbo].[Sessions](
        [SessionID] [int] IDENTITY(1,1) NOT NULL,
        [UserID] [int] NOT NULL,
        [Token] [nvarchar](255) NOT NULL,
        [ExpiredAt] [datetime] NOT NULL,
        [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_Sessions] PRIMARY KEY CLUSTERED ([SessionID] ASC),
        CONSTRAINT [UQ_Token] UNIQUE NONCLUSTERED ([Token] ASC)
    )
END
GO
 
-- ==============================================
-- Table: SystemConfig
-- ==============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemConfig')
BEGIN
    CREATE TABLE [dbo].[SystemConfig](
        [ConfigID] [int] IDENTITY(1,1) NOT NULL,
        [ConfigKey] [nvarchar](100) NOT NULL,
        [ConfigValue] [nvarchar](max) NULL,
        [Description] [nvarchar](255) NULL,
        [UpdatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_SystemConfig] PRIMARY KEY CLUSTERED ([ConfigID] ASC),
        CONSTRAINT [UK_SystemConfig_ConfigKey] UNIQUE NONCLUSTERED ([ConfigKey] ASC)
    )
END
GO
 
-- ==============================================
-- Foreign Keys
-- ==============================================
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Users_Roles')
BEGIN
    ALTER TABLE [dbo].[Users] WITH CHECK ADD CONSTRAINT [FK_Users_Roles]
    FOREIGN KEY([RoleID]) REFERENCES [dbo].[Roles] ([RoleID])
END
GO
 
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Invoices_Customers')
BEGIN
    ALTER TABLE [dbo].[Invoices] WITH CHECK ADD CONSTRAINT [FK_Invoices_Customers]
    FOREIGN KEY([CustomerID]) REFERENCES [dbo].[Customers] ([CustomerID])
END
GO
 
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Invoices_Status')
BEGIN
    ALTER TABLE [dbo].[Invoices] WITH CHECK ADD CONSTRAINT [FK_Invoices_Status]
    FOREIGN KEY([StatusID]) REFERENCES [dbo].[Status] ([StatusID])
END
GO
 
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Sessions_Users')
BEGIN
    ALTER TABLE [dbo].[Sessions] WITH CHECK ADD CONSTRAINT [FK_Sessions_Users]
    FOREIGN KEY([UserID]) REFERENCES [dbo].[Users] ([UserID])
END
GO
 
-- ==============================================
-- Seed Data
-- ==============================================
IF NOT EXISTS (SELECT * FROM [dbo].[Roles])
BEGIN
    SET IDENTITY_INSERT [dbo].[Roles] ON
    INSERT [dbo].[Roles] ([RoleID], [RoleName], [RoleDescription]) VALUES
    (1, N'Admin', N'Full system access - can manage users, invoices, and customers'),
    (2, N'User', N'Can create, edit, and delete invoices and customers'),
    (3, N'Visitor', N'Read-only access - can view invoices and customers but cannot modify')
    SET IDENTITY_INSERT [dbo].[Roles] OFF
END
GO
 
IF NOT EXISTS (SELECT * FROM [dbo].[SystemConfig] WHERE ConfigKey = 'SetupCompleted')
BEGIN
    INSERT [dbo].[SystemConfig] ([ConfigKey], [ConfigValue], [Description]) VALUES
    (N'SetupCompleted', N'false', N'Indicates whether first-time setup wizard has been completed')
END
GO
 
-- ==============================================
-- Schema generation complete!
-- ==============================================
