-- =============================================
-- SCHEDULER DATABASE SCHEMA - IMPROVED VERSION
-- =============================================
-- Generated from: SSMS 21 (SQL Server 2022)
-- Date: 2025-11-11
-- Improvements:
--   1. Added seed data for Roles table
--   2. Added seed data for SystemConfig table
--   3. Maintained all original SSMS-generated schema
-- =============================================

USE [master]
GO

/****** Object:  Database [scheduler]    Script Date: 11/11/2025 9:42:24 PM ******/
CREATE DATABASE [scheduler]
 CONTAINMENT = NONE
 ON  PRIMARY
( NAME = N'scheduler', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\scheduler.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON
( NAME = N'scheduler_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\scheduler_log.ldf' , SIZE = 73728KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO

ALTER DATABASE [scheduler] SET COMPATIBILITY_LEVEL = 160
GO

IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [scheduler].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO

ALTER DATABASE [scheduler] SET ANSI_NULL_DEFAULT OFF
GO
ALTER DATABASE [scheduler] SET ANSI_NULLS OFF
GO
ALTER DATABASE [scheduler] SET ANSI_PADDING OFF
GO
ALTER DATABASE [scheduler] SET ANSI_WARNINGS OFF
GO
ALTER DATABASE [scheduler] SET ARITHABORT OFF
GO
ALTER DATABASE [scheduler] SET AUTO_CLOSE OFF
GO
ALTER DATABASE [scheduler] SET AUTO_SHRINK OFF
GO
ALTER DATABASE [scheduler] SET AUTO_UPDATE_STATISTICS ON
GO
ALTER DATABASE [scheduler] SET CURSOR_CLOSE_ON_COMMIT OFF
GO
ALTER DATABASE [scheduler] SET CURSOR_DEFAULT  GLOBAL
GO
ALTER DATABASE [scheduler] SET CONCAT_NULL_YIELDS_NULL OFF
GO
ALTER DATABASE [scheduler] SET NUMERIC_ROUNDABORT OFF
GO
ALTER DATABASE [scheduler] SET QUOTED_IDENTIFIER OFF
GO
ALTER DATABASE [scheduler] SET RECURSIVE_TRIGGERS OFF
GO
ALTER DATABASE [scheduler] SET  DISABLE_BROKER
GO
ALTER DATABASE [scheduler] SET AUTO_UPDATE_STATISTICS_ASYNC OFF
GO
ALTER DATABASE [scheduler] SET DATE_CORRELATION_OPTIMIZATION OFF
GO
ALTER DATABASE [scheduler] SET TRUSTWORTHY OFF
GO
ALTER DATABASE [scheduler] SET ALLOW_SNAPSHOT_ISOLATION OFF
GO
ALTER DATABASE [scheduler] SET PARAMETERIZATION SIMPLE
GO
ALTER DATABASE [scheduler] SET READ_COMMITTED_SNAPSHOT OFF
GO
ALTER DATABASE [scheduler] SET HONOR_BROKER_PRIORITY OFF
GO
ALTER DATABASE [scheduler] SET RECOVERY FULL
GO
ALTER DATABASE [scheduler] SET  MULTI_USER
GO
ALTER DATABASE [scheduler] SET PAGE_VERIFY CHECKSUM
GO
ALTER DATABASE [scheduler] SET DB_CHAINING OFF
GO
ALTER DATABASE [scheduler] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF )
GO
ALTER DATABASE [scheduler] SET TARGET_RECOVERY_TIME = 60 SECONDS
GO
ALTER DATABASE [scheduler] SET DELAYED_DURABILITY = DISABLED
GO
ALTER DATABASE [scheduler] SET ACCELERATED_DATABASE_RECOVERY = OFF
GO

EXEC sys.sp_db_vardecimal_storage_format N'scheduler', N'ON'
GO

ALTER DATABASE [scheduler] SET QUERY_STORE = ON
GO

ALTER DATABASE [scheduler] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO

USE [scheduler]
GO

-- =============================================
-- TABLE DEFINITIONS
-- =============================================

/****** Object:  Table [dbo].[Customers]    Script Date: 11/11/2025 9:42:24 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Customers](
	[CustomerID] [int] IDENTITY(1,1) NOT NULL,
	[CustomerName] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_Customers] PRIMARY KEY CLUSTERED
(
	[CustomerID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_CustomerName] UNIQUE NONCLUSTERED
(
	[CustomerName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[Invoices]    Script Date: 11/11/2025 9:42:24 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Invoices](
	[InvoiceID] [int] IDENTITY(1,1) NOT NULL,
	[InvoiceNumber] [nvarchar](50) NOT NULL,
	[InvoiceOrderNumber] [nvarchar](50) NOT NULL,
	[CustomerID] [int] NOT NULL,
	[InvoiceDescription] [text] NULL,
	[InvoiceTaxable] [decimal](18, 2) NOT NULL,
	[InvoiceTax] [decimal](2, 2) NOT NULL,
	[InvoiceDue] [decimal](18, 2) NOT NULL,
	[StatusID] [int] NOT NULL,
	[InvoiceCreationDate] [date] NOT NULL,
	[InvoiceDueDate] [date] NOT NULL,
	[InvoiceActive] [nchar](1) NOT NULL,
 CONSTRAINT [PK_Invoices] PRIMARY KEY CLUSTERED
(
	[InvoiceID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_InvoiceNumber] UNIQUE NONCLUSTERED
(
	[InvoiceNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_InvoiceOrderNumber] UNIQUE NONCLUSTERED
(
	[InvoiceOrderNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [dbo].[Roles]    Script Date: 11/11/2025 9:42:24 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Roles](
	[RoleID] [int] IDENTITY(1,1) NOT NULL,
	[RoleName] [nvarchar](50) NOT NULL,
	[RoleDescription] [nvarchar](255) NULL,
	[CreatedAt] [datetime] NOT NULL,
 CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED
(
	[RoleID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UK_Roles_RoleName] UNIQUE NONCLUSTERED
(
	[RoleName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[Sessions]    Script Date: 11/11/2025 9:42:24 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Sessions](
	[SessionID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NOT NULL,
	[SessionToken] [nvarchar](150) NOT NULL,
	[SessionExpire] [date] NOT NULL,
 CONSTRAINT [PK_Sessions] PRIMARY KEY CLUSTERED
(
	[SessionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_SessionToken] UNIQUE NONCLUSTERED
(
	[SessionToken] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[Status]    Script Date: 11/11/2025 9:42:24 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Status](
	[StatusID] [int] IDENTITY(1,1) NOT NULL,
	[StatusLabel] [nvarchar](20) NOT NULL,
 CONSTRAINT [PK_Status] PRIMARY KEY CLUSTERED
(
	[StatusID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_StatusLabel] UNIQUE NONCLUSTERED
(
	[StatusLabel] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[SystemConfig]    Script Date: 11/11/2025 9:42:24 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SystemConfig](
	[ConfigID] [int] IDENTITY(1,1) NOT NULL,
	[ConfigKey] [nvarchar](100) NOT NULL,
	[ConfigValue] [nvarchar](max) NULL,
	[Description] [nvarchar](255) NULL,
	[UpdatedAt] [datetime] NOT NULL,
 CONSTRAINT [PK_SystemConfig] PRIMARY KEY CLUSTERED
(
	[ConfigID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UK_SystemConfig_ConfigKey] UNIQUE NONCLUSTERED
(
	[ConfigKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [dbo].[Users]    Script Date: 11/11/2025 9:42:24 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[UserID] [int] IDENTITY(1,1) NOT NULL,
	[Username] [nvarchar](100) NOT NULL,
	[Password] [nvarchar](255) NOT NULL,
	[RoleID] [int] NOT NULL,
 CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Username] UNIQUE NONCLUSTERED
(
	[Username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- =============================================
-- INDEXES
-- =============================================

SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_CustomerName]    Script Date: 11/11/2025 9:42:24 PM ******/
CREATE NONCLUSTERED INDEX [IX_CustomerName] ON [dbo].[Customers]
(
	[CustomerName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

/****** Object:  Index [IX_InvoiceCustomerID]    Script Date: 11/11/2025 9:42:24 PM ******/
CREATE NONCLUSTERED INDEX [IX_InvoiceCustomerID] ON [dbo].[Invoices]
(
	[CustomerID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

/****** Object:  Index [IX_InvoiceDueDate]    Script Date: 11/11/2025 9:42:24 PM ******/
CREATE NONCLUSTERED INDEX [IX_InvoiceDueDate] ON [dbo].[Invoices]
(
	[InvoiceDueDate] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_InvoiceNumber]    Script Date: 11/11/2025 9:42:24 PM ******/
CREATE NONCLUSTERED INDEX [IX_InvoiceNumber] ON [dbo].[Invoices]
(
	[InvoiceNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_InvoiceOrderNumber]    Script Date: 11/11/2025 9:42:24 PM ******/
CREATE NONCLUSTERED INDEX [IX_InvoiceOrderNumber] ON [dbo].[Invoices]
(
	[InvoiceOrderNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

/****** Object:  Index [IX_InvoiceStatusID]    Script Date: 11/11/2025 9:42:24 PM ******/
CREATE NONCLUSTERED INDEX [IX_InvoiceStatusID] ON [dbo].[Invoices]
(
	[StatusID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_SessionToken]    Script Date: 11/11/2025 9:42:24 PM ******/
CREATE NONCLUSTERED INDEX [IX_SessionToken] ON [dbo].[Sessions]
(
	[SessionToken] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Username]    Script Date: 11/11/2025 9:42:24 PM ******/
CREATE NONCLUSTERED INDEX [IX_Username] ON [dbo].[Users]
(
	[Username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

-- =============================================
-- DEFAULT CONSTRAINTS
-- =============================================

ALTER TABLE [dbo].[Roles] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO

ALTER TABLE [dbo].[SystemConfig] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO

-- =============================================
-- FOREIGN KEY CONSTRAINTS
-- =============================================

ALTER TABLE [dbo].[Invoices]  WITH CHECK ADD  CONSTRAINT [FK_Invoices_Customers] FOREIGN KEY([CustomerID])
REFERENCES [dbo].[Customers] ([CustomerID])
GO

ALTER TABLE [dbo].[Invoices] CHECK CONSTRAINT [FK_Invoices_Customers]
GO

ALTER TABLE [dbo].[Invoices]  WITH CHECK ADD  CONSTRAINT [FK_Invoices_Status] FOREIGN KEY([StatusID])
REFERENCES [dbo].[Status] ([StatusID])
GO

ALTER TABLE [dbo].[Invoices] CHECK CONSTRAINT [FK_Invoices_Status]
GO

ALTER TABLE [dbo].[Sessions]  WITH CHECK ADD  CONSTRAINT [FK_Sessions_Users] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO

ALTER TABLE [dbo].[Sessions] CHECK CONSTRAINT [FK_Sessions_Users]
GO

ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [FK_Users_Roles] FOREIGN KEY([RoleID])
REFERENCES [dbo].[Roles] ([RoleID])
GO

ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_Users_Roles]
GO

-- =============================================
-- SEED DATA (⭐ IMPROVEMENT: ADDED MISSING DATA)
-- =============================================

-- Seed Roles table (3 roles: Admin, User, Visitor)
SET IDENTITY_INSERT [dbo].[Roles] ON
GO

INSERT [dbo].[Roles] ([RoleID], [RoleName], [RoleDescription], [CreatedAt]) VALUES
(1, N'Admin', N'Full system access - can manage users, invoices, and customers', GETDATE()),
(2, N'User', N'Can create, edit, and delete invoices and customers', GETDATE()),
(3, N'Visitor', N'Read-only access - can view invoices and customers but cannot modify', GETDATE())
GO

SET IDENTITY_INSERT [dbo].[Roles] OFF
GO

-- Seed SystemConfig table (SetupCompleted flag)
INSERT [dbo].[SystemConfig] ([ConfigKey], [ConfigValue], [Description], [UpdatedAt]) VALUES
(N'SetupCompleted', N'false', N'Indicates whether first-time setup wizard has been completed', GETDATE())
GO

-- =============================================
-- FINAL DATABASE SETTINGS
-- =============================================

USE [master]
GO

ALTER DATABASE [scheduler] SET  READ_WRITE
GO

-- =============================================
-- SCHEMA GENERATION COMPLETE
-- =============================================
-- Total Tables: 7 (Customers, Invoices, Roles, Sessions, Status, SystemConfig, Users)
-- Total Foreign Keys: 4
-- Total Indexes: 7
-- Seed Data: 3 roles + 1 system config
-- =============================================
