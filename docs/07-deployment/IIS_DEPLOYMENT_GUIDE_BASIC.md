# 🖥️ IIS Deployment Guide - Level 1 (Basic)

**Loginet Invoice Management System - Quick IIS Deployment**

**Time Required:** 15-30 minutes
**Skill Level:** Intermediate
**Last Updated:** November 21, 2025

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Windows Server 2016/2019/2022** or **Windows 10/11 Pro**
- [ ] **IIS 10.0 or higher** installed
- [ ] **ASP.NET 4.7.2** or higher installed
- [ ] **SQL Server 2017+** accessible (localhost or remote)
- [ ] **Administrator access** to web server
- [ ] **Project files** downloaded/cloned

---

## 🚀 Quick Deployment (6 Steps)

### **Step 1: Install IIS and ASP.NET (5 minutes)**

```powershell
# Open PowerShell as Administrator
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer, IIS-WebServerRole, IIS-ASPNET45 -All
```

**Verify Installation:**
```powershell
Get-Service W3SVC  # Should show "Running"
```

---

### **Step 2: Deploy Database (10 minutes)**

**Option A: Automated (Recommended)**
```powershell
cd C:\path\to\scheduler\scripts
.\deploy-database.ps1 -ServerInstance "localhost" -SqlAuthUser "sa" -SqlAuthPassword "YourPassword"
```

**Option B: Manual**
1. Open SQL Server Management Studio (SSMS)
2. Create database: `CREATE DATABASE scheduler`
3. Run `DB.sql` script (File → Open → DB.sql → Execute)
4. Run `Database/Seeds/SeedStatuses.sql`

**Verify:**
```sql
USE scheduler;
SELECT COUNT(*) FROM Status;  -- Should return 3
SELECT COUNT(*) FROM Roles;   -- Should return 3
```

---

### **Step 3: Configure Connection String (2 minutes)**

Edit `WebSite\Web.config`:

```xml
<connectionStrings>
  <add name="schedulerEntities"
       connectionString="metadata=res://*/DBEngine.csdl|res://*/DBEngine.ssdl|res://*/DBEngine.msl;provider=System.Data.SqlClient;provider connection string=&quot;data source=YOUR_SERVER;initial catalog=scheduler;user id=YOUR_USER;password=YOUR_PASSWORD;trustservercertificate=True;MultipleActiveResultSets=True;App=EntityFramework&quot;"
       providerName="System.Data.EntityClient"/>
</connectionStrings>
```

**Replace:**
- `YOUR_SERVER` → `localhost` (or your SQL Server address)
- `YOUR_USER` → `sa` (or your SQL user)
- `YOUR_PASSWORD` → Your SQL password

---

### **Step 4: Deploy to IIS (5 minutes)**

**Option A: Automated (Recommended)**
```powershell
cd C:\path\to\scheduler\scripts
.\deploy-iis.ps1 -SiteName "Loginet" -PhysicalPath "C:\inetpub\wwwroot\Loginet" -Port 80
```

**Option B: Manual**

1. **Copy Files:**
   ```powershell
   Copy-Item -Path "WebSite\*" -Destination "C:\inetpub\wwwroot\Loginet" -Recurse
   ```

2. **Create App Pool:**
   - Open IIS Manager
   - Right-click "Application Pools" → "Add Application Pool"
   - Name: `LoginetAppPool`
   - .NET CLR version: `v4.0`
   - Managed pipeline mode: `Integrated`
   - Click OK

3. **Create Website:**
   - Right-click "Sites" → "Add Website"
   - Site name: `Loginet`
   - Physical path: `C:\inetpub\wwwroot\Loginet`
   - Port: `80`
   - Click OK

4. **Set Permissions:**
   ```powershell
   icacls "C:\inetpub\wwwroot\Loginet" /grant "IIS_IUSRS:(OI)(CI)F" /T
   ```

---

### **Step 5: Test Deployment (3 minutes)**

1. **Open Browser:**
   ```
   http://localhost
   ```

2. **Expected Result:**
   - Login page appears
   - OR setup wizard appears (first time)

3. **If Errors:**
   - Check IIS logs: `C:\inetpub\logs\LogFiles\`
   - Verify connection string
   - Ensure database is accessible

---

### **Step 6: Complete Setup (5 minutes)**

1. **Access Setup Wizard:**
   ```
   http://localhost/setup-wizard.html
   ```

2. **Create Admin User:**
   - Username: `admin`
   - Password: Choose strong password
   - Role: Admin

3. **Login:**
   - Go to main page
   - Login with admin credentials
   - Verify dashboard loads

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] IIS website is running
- [ ] Database connection successful
- [ ] Login page loads
- [ ] Can create test invoice
- [ ] Can create test customer
- [ ] No errors in browser console (F12)

---

## 🔧 Quick Troubleshooting

### **Error: "HTTP 500 - Internal Server Error"**
**Cause:** ASP.NET not configured or database connection failed
**Fix:**
```powershell
# Ensure ASP.NET is registered
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\aspnet_regiis.exe -i

# Check Web.config connection string
# Check event viewer: eventvwr.msc → Windows Logs → Application
```

### **Error: "Cannot connect to database"**
**Cause:** Wrong connection string or SQL Server not accessible
**Fix:**
- Test SQL connection from web server:
  ```powershell
  Test-NetConnection -ComputerName YOUR_SERVER -Port 1433
  ```
- Verify SQL Server allows remote connections
- Check firewall allows port 1433

### **Error: "Login failed for user"**
**Cause:** Wrong credentials in connection string
**Fix:**
- Verify user/password in Web.config
- Ensure SQL Server uses Mixed Mode authentication
- Grant user access to `scheduler` database

---

## 🎯 Next Steps

**For Production:**
1. Read [IIS Deployment Guide (Detailed)](IIS_DEPLOYMENT_GUIDE_DETAILED.md)
2. Complete [Production Checklist](PRODUCTION_CHECKLIST.md)
3. Implement [Security Hardening](SECURITY_HARDENING.md)
4. Set up backups and monitoring

**For Development:**
- You're done! Start using the system
- Create test data
- Explore features

---

## 📚 Additional Resources

- **Detailed Guide:** [IIS_DEPLOYMENT_GUIDE_DETAILED.md](IIS_DEPLOYMENT_GUIDE_DETAILED.md)
- **Database Guide:** [DATABASE_DEPLOYMENT_GUIDE.md](DATABASE_DEPLOYMENT_GUIDE.md)
- **Troubleshooting:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **PowerShell Scripts:** `scripts/` folder

---

**Deployment completed successfully?** ✅ Great! You can now access Loginet at `http://localhost`

**Having issues?** See [Troubleshooting Guide](TROUBLESHOOTING.md) or [Detailed IIS Guide](IIS_DEPLOYMENT_GUIDE_DETAILED.md)

---

**[⬅ Back to Deployment Documentation](README.md)**
