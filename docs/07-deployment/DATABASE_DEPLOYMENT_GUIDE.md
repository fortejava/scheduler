# 🗄️ Database Deployment Guide

**Loginet Database Setup and Management**

**Last Updated:** November 21, 2025

---

## 📋 Database Requirements

- **SQL Server 2017+** (Express, Standard, Enterprise, or Azure SQL)
- **Minimum Space:** 100MB (initial), plan for data growth
- **Collation:** SQL_Latin1_General_CP1_CI_AS (default)
- **Recovery Model:** FULL (for production with backups)

---

## 🚀 Quick Deployment

### **Option 1: Automated PowerShell Script**

```powershell
cd scripts
.\deploy-database.ps1 -ServerInstance "localhost" -DatabaseName "scheduler"
```

### **Option 2: Manual SSMS**

1. **Create Database:**
```sql
CREATE DATABASE scheduler;
```

2. **Run Schema:** Execute `DB.sql` (File → Open → Execute)

3. **Seed Data:** Execute `Database/Seeds/SeedStatuses.sql`

4. **Verify:**
```sql
USE scheduler;
SELECT * FROM Roles;      -- Should show 3 roles
SELECT * FROM Status;     -- Should show 3 statuses
```

---

## 📊 Database Schema

**7 Tables:**
1. **Customers** - Customer master data
2. **Invoices** - Invoice records (11 columns)
3. **Roles** - RBAC roles (Admin, User, Visitor)
4. **Users** - System users with BCrypt passwords
5. **Sessions** - Token-based authentication
6. **Status** - Invoice statuses (Paid, Unpaid, Overdue)
7. **SystemConfig** - System configuration flags

**4 Foreign Keys:**
- Users → Roles
- Invoices → Customers
- Invoices → Status
- Sessions → Users

---

## 🔗 Connection String

**Format:**
```xml
<connectionStrings>
  <add name="schedulerEntities"
       connectionString="metadata=res://*/DBEngine.csdl|res://*/DBEngine.ssdl|res://*/DBEngine.msl;provider=System.Data.SqlClient;provider connection string=&quot;data source=SERVER;initial catalog=scheduler;user id=USER;password=PASSWORD;trustservercertificate=True;MultipleActiveResultSets=True;App=EntityFramework&quot;"
       providerName="System.Data.EntityClient"/>
</connectionStrings>
```

**Azure SQL:**
```
data source=yourserver.database.windows.net;user id=username@yourserver;password=***
```

**Windows Authentication:**
```
data source=localhost;Integrated Security=True;initial catalog=scheduler
```

---

## 💾 Backup & Restore

**Backup:**
```sql
BACKUP DATABASE scheduler
TO DISK = 'C:\Backups\scheduler.bak'
WITH FORMAT, INIT, COMPRESSION;
```

**Restore:**
```sql
RESTORE DATABASE scheduler
FROM DISK = 'C:\Backups\scheduler.bak'
WITH REPLACE;
```

---

## 🔄 Updates & Migrations

**For Schema Updates:**
1. Backup database first
2. Test migration on copy
3. Run migration scripts in order
4. Verify data integrity
5. Update Entity Framework models if needed

---

## 🐛 Troubleshooting

**"Database already exists"**
- Expected if upgrading - proceed with schema updates only

**"Login failed"**
- Verify SQL Server authentication mode (Mixed Mode)
- Check user permissions on scheduler database
- Verify password in connection string

**"Cannot open database"**
- Check SQL Server is running
- Verify firewall allows port 1433
- Test connection: `Test-NetConnection SERVER -Port 1433`

---

**[⬅ Back to Deployment Documentation](README.md)**
