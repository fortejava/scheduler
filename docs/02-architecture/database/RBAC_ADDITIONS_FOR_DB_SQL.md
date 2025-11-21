# RBAC ADDITIONS FOR DB.SQL

**Date:** 2025-11-11
**Purpose:** Document changes needed to update DB.sql master file with RBAC schema
**Status:** ✅ COMPLETED (2025-11-21) - All recommendations implemented

---

## ✅ UPDATE (2025-11-21): COMPLETED

**All recommendations from this document have been successfully executed.**

### What Was Done:
- ✅ **DB.sql regenerated** from actual database schema
- ✅ **Invoices table corrected** - All 11 columns with correct names
- ✅ **Status table corrected** - Uses StatusLabel (not StatusName)
- ✅ **Sessions table corrected** - Uses SessionToken and SessionExpire
- ✅ **RBAC tables included** - Roles, SystemConfig, Users.RoleID
- ✅ **Seed data included** - 3 roles + SetupCompleted flag

### Result:
DB.sql now **100% matches** the actual database schema (verified 2025-11-21).

**See Details**: [DATABASE_REORGANIZATION_SUMMARY.md](../../06-maintenance/DATABASE_REORGANIZATION_SUMMARY.md)

---

## 📦 ORIGINAL DOCUMENT (ARCHIVED FOR REFERENCE)

The information below documents the **original issue and recommendations** (November 2025).

**This has been RESOLVED** as of 2025-11-21 using Option 1 (Regenerate DB.sql).

---

## 🎯 SUMMARY OF CHANGES

The database has been successfully updated with RBAC (3 roles: Admin, User, Visitor) via migration script `001_Add_RBAC_3Roles.sql`.

The **DB.sql master file** needs to be updated to match the current database schema.

---

## 📋 OPTION 1: REGENERATE DB.SQL (RECOMMENDED)

### **Steps:**

1. **Open SQL Server Management Studio (SSMS)**
2. **Right-click on `scheduler` database**
3. **Tasks → Generate Scripts**
4. **Select:**
   - All tables
   - Include indexes
   - Include foreign keys
   - Include constraints
5. **Save to:** `DB_NEW.sql`
6. **Review and replace** current `DB.sql`

This ensures DB.sql perfectly matches the current database schema.

---

## 📋 OPTION 2: MANUAL ADDITIONS TO DB.SQL

If regenerating is not preferred, manually add the following sections to `DB.sql`:

### **ADDITION 1: Roles Table** (Add BEFORE Users table)

```sql
/****** Object:  Table [dbo].[Roles]    Script Date: 11/11/2025 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Roles](
	[RoleID] [int] IDENTITY(1,1) NOT NULL,
	[RoleName] [nvarchar](50) NOT NULL,
	[RoleDescription] [nvarchar](255) NULL,
	[CreatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
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
```

---

### **ADDITION 2: SystemConfig Table** (Add AFTER all other tables)

```sql
/****** Object:  Table [dbo].[SystemConfig]    Script Date: 11/11/2025 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[SystemConfig](
	[ConfigID] [int] IDENTITY(1,1) NOT NULL,
	[ConfigKey] [nvarchar](100) NOT NULL,
	[ConfigValue] [nvarchar](max) NULL,
	[Description] [nvarchar](255) NULL,
	[UpdatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
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
```

---

### **MODIFICATION 1: Users Table** (Add RoleID column)

**Current Users table definition:**
```sql
CREATE TABLE [dbo].[Users](
	[UserID] [int] IDENTITY(1,1) NOT NULL,
	[Username] [nvarchar](100) NOT NULL,
	[Password] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ...
```

**Updated Users table definition:**
```sql
CREATE TABLE [dbo].[Users](
	[UserID] [int] IDENTITY(1,1) NOT NULL,
	[Username] [nvarchar](100) NOT NULL,
	[Password] [nvarchar](255) NOT NULL,
	[RoleID] [int] NOT NULL,  -- ⭐ NEW COLUMN
 CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ...
```

---

### **ADDITION 3: Foreign Key Constraint** (Add with other FK constraints)

```sql
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [FK_Users_Roles] FOREIGN KEY([RoleID])
REFERENCES [dbo].[Roles] ([RoleID])
GO

ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_Users_Roles]
GO
```

---

### **ADDITION 4: Seed Data for Roles** (Add at end with other INSERT statements)

```sql
-- Seed Roles table with 3 roles
SET IDENTITY_INSERT [dbo].[Roles] ON
GO

INSERT [dbo].[Roles] ([RoleID], [RoleName], [RoleDescription], [CreatedAt]) VALUES
(1, N'Admin', N'Full system access - can manage users, invoices, and customers', GETDATE()),
(2, N'User', N'Can create, edit, and delete invoices and customers', GETDATE()),
(3, N'Visitor', N'Read-only access - can view invoices and customers but cannot modify', GETDATE())
GO

SET IDENTITY_INSERT [dbo].[Roles] OFF
GO
```

---

### **ADDITION 5: Seed Data for SystemConfig** (Add at end)

```sql
-- Seed SystemConfig table with SetupCompleted flag
INSERT [dbo].[SystemConfig] ([ConfigKey], [ConfigValue], [Description], [UpdatedAt]) VALUES
(N'SetupCompleted', N'false', N'Indicates whether first-time setup wizard has been completed', GETDATE())
GO
```

---

## ✅ VERIFICATION CHECKLIST

After updating DB.sql, verify:

- [ ] Roles table definition present (BEFORE Users table)
- [ ] SystemConfig table definition present (AFTER other tables)
- [ ] Users table includes `[RoleID] [int] NOT NULL` column
- [ ] FK_Users_Roles constraint present
- [ ] Roles seed data (3 roles) present
- [ ] SystemConfig seed data (SetupCompleted) present
- [ ] Table creation order correct: Roles → Users (so FK can be created)

---

## 🚨 IMPORTANT NOTES

1. **Table Order Matters:** Roles table MUST be created BEFORE Users table (foreign key dependency)

2. **Current Database is Correct:** The live `scheduler` database has all these changes already applied via migration `001_Add_RBAC_3Roles.sql`

3. **DB.sql is Master Template:** DB.sql is used for fresh deployments, so it MUST be updated to match current schema

4. **Encoding:** DB.sql appears to use UTF-16 encoding - maintain same encoding when editing

---

## 📊 CURRENT DATABASE SCHEMA (FOR REFERENCE)

**Tables in scheduler database:**
- ✅ Customers
- ✅ Invoices
- ✅ **Roles** ⭐ NEW
- ✅ Sessions
- ✅ Status
- ✅ **SystemConfig** ⭐ NEW
- ✅ Users (with RoleID column) ⭐ MODIFIED

**Foreign Keys:**
- FK_Invoices_Customers (Invoices → Customers)
- FK_Sessions_Users (Sessions → Users)
- **FK_Users_Roles (Users → Roles)** ⭐ NEW

---

## 🎯 RECOMMENDED APPROACH

**Since the database schema is now complex with RBAC, the RECOMMENDED approach is:**

### **Use SSMS to regenerate DB.sql:**

1. Connect to `scheduler` database in SSMS
2. Right-click database → Tasks → Generate Scripts
3. Choose "Schema only" (no data initially)
4. Include:
   - Tables
   - Primary keys
   - Foreign keys
   - Indexes
   - Unique constraints
5. Generate to file → `DB_REGENERATED.sql`
6. **Then manually add seed data** for:
   - Roles (3 rows)
   - SystemConfig (SetupCompleted flag)
7. Review and replace `DB.sql`

This ensures 100% accuracy and avoids manual merge errors.

---

## 📊 VERIFICATION (2025-11-21)

### Schema Verification Results:

```sql
-- Invoices table columns (all 11 present):
InvoiceID, InvoiceNumber, InvoiceOrderNumber, CustomerID,
InvoiceDescription, InvoiceTaxable, InvoiceTax, InvoiceDue,
StatusID, InvoiceCreationDate, InvoiceDueDate, InvoiceActive ✅

-- Status table:
StatusID, StatusLabel ✅ (not StatusName)

-- Sessions table:
SessionID, UserID, SessionToken, SessionExpire ✅

-- RBAC tables:
Roles (RoleID, RoleName, RoleDescription, CreatedAt) ✅
SystemConfig (ConfigID, ConfigKey, ConfigValue, Description, UpdatedAt) ✅
Users.RoleID column ✅
```

**Verification Method**: Direct SQL Server interrogation + Entity Framework model comparison

**Result**: ✅ **100% MATCH CONFIRMED**

---

**Document Status**: COMPLETED & ARCHIVED
**Last Updated**: 2025-11-21

---

**END OF DOCUMENT**
