# 🖥️ IIS Deployment Guide - Level 2 (Detailed)

**Comprehensive IIS Deployment for Production Environments**

**Time Required:** 1-2 hours
**Skill Level:** Intermediate to Advanced
**Last Updated:** November 21, 2025

---

## 📚 Complete IIS Deployment Guide

This detailed guide covers **enterprise-grade deployment** with security hardening, troubleshooting, and best practices.

### **What This Guide Includes:**
- Complete prerequisites with verification
- Step-by-step deployment with explanations
- Security hardening procedures
- Performance optimization
- Production best practices
- Comprehensive troubleshooting

---

## 📖 Guide Sections

### **Part 1: Prerequisites & Planning**
- [Prerequisites Checklist](#prerequisites)
- [Server Requirements](#server-requirements)
- [Network Planning](#network-planning)
- [Security Considerations](#security-planning)

### **Part 2: Installation & Configuration**
- [Install IIS and ASP.NET](#install-iis)
- [Configure Application Pool](#application-pool)
- [Deploy Database](#database-deployment)
- [Deploy Application Files](#application-deployment)
- [Configure Connection Strings](#connection-strings)

### **Part 3: Security Hardening**
- [HTTPS/SSL Setup](#ssl-configuration)
- [Security Headers](#security-headers)
- [Firewall Configuration](#firewall)
- [SQL Server Security](#sql-security)
- See: [SECURITY_HARDENING.md](SECURITY_HARDENING.md)

### **Part 4: Testing & Validation**
- [Functionality Testing](#testing)
- [Performance Testing](#performance)
- [Security Testing](#security-testing)

### **Part 5: Production Deployment**
- [Pre-Deployment Checklist](PRODUCTION_CHECKLIST.md)
- [Deployment Execution](#deployment-execution)
- [Post-Deployment Validation](#post-deployment)
- [Monitoring Setup](#monitoring)

### **Part 6: Troubleshooting**
- See: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## Prerequisites

### **Server Requirements**

**Hardware Minimum (Small Deployment):**
- CPU: 2 cores @ 2.0 GHz
- RAM: 4GB
- Disk: 50GB
- Network: 100 Mbps

**Hardware Recommended (Production):**
- CPU: 4+ cores @ 2.5+ GHz
- RAM: 8GB+
- Disk: 100GB+ SSD
- Network: 1 Gbps

**Software Requirements:**
- Windows Server 2016/2019/2022 or Windows 10/11 Pro
- IIS 10.0+
- .NET Framework 4.7.2+
- SQL Server 2017+ (can be on separate server)

### **Verify Prerequisites**

```powershell
# Check Windows version
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"

# Check IIS installed
Get-Service W3SVC

# Check .NET Framework version
Get-ChildItem 'HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP' -Recurse | Get-ItemProperty -Name version -EA 0 | Where { $_.PSChildName -Match '^(?!S)\p{L}'} | Select PSChildName, version

# Check SQL Server connectivity (if remote)
Test-NetConnection -ComputerName YOUR_SQL_SERVER -Port 1433
```

---

## Install IIS

### **Complete IIS Installation**

```powershell
# Install IIS with all required features
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpRedirect, IIS-ApplicationDevelopment, IIS-Security, IIS-RequestFiltering, IIS-HealthAndDiagnostics, IIS-HttpLogging, IIS-LoggingLibraries, IIS-RequestMonitor, IIS-HttpTracing, IIS-StaticContent, IIS-DefaultDocument, IIS-DirectoryBrowsing, IIS-WebSockets, IIS-ApplicationInit, IIS-ASPNET45, IIS-NetFxExtensibility45, IIS-ISAPIExtensions, IIS-ISAPIFilter, IIS-HttpCompressionStatic, IIS-HttpCompressionDynamic, IIS-ManagementConsole -All

# Verify installation
Get-WindowsOptionalFeature -Online | Where-Object {$_.FeatureName -like "IIS-*" -and $_.State -eq "Enabled"}
```

### **Install ASP.NET 4.7.2+**

```powershell
# Install .NET Framework 4.7.2 or higher
# Download from: https://dotnet.microsoft.com/download/dotnet-framework

# Register ASP.NET with IIS
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\aspnet_regiis.exe -i

# Verify ASP.NET is registered
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\aspnet_regiis.exe -lv
```

---

## Application Pool

### **Create and Configure Application Pool**

```powershell
Import-Module WebAdministration

# Create application pool
New-WebAppPool -Name "LoginetAppPool"

# Configure application pool
Set-ItemProperty IIS:\AppPools\LoginetAppPool -Name managedRuntimeVersion -Value "v4.0"
Set-ItemProperty IIS:\AppPools\LoginetAppPool -Name managedPipelineMode -Value "Integrated"
Set-ItemProperty IIS:\AppPools\LoginetAppPool -Name enable32BitAppOnWin64 -Value $false
Set-ItemProperty IIS:\AppPools\LoginetAppPool -Name startMode -Value "AlwaysRunning"

# Set recycling (every 24 hours at 2 AM)
Set-ItemProperty IIS:\AppPools\LoginetAppPool -Name recycling.periodicRestart.time -Value "00:00:00"
Set-ItemProperty IIS:\AppPools\LoginetAppPool -Name recycling.periodicRestart.schedule -Value @{value="02:00:00"}

# Set memory limits (optional)
Set-ItemProperty IIS:\AppPools\LoginetAppPool -Name recycling.periodicRestart.privateMemory -Value 1048576  # 1GB in KB

# Configure identity (ApplicationPoolIdentity - recommended for security)
Set-ItemProperty IIS:\AppPools\LoginetAppPool -Name processModel.identityType -Value "ApplicationPoolIdentity"
```

---

## Database Deployment

### **Automated Database Deployment**

**Use PowerShell Script:**
```powershell
cd C:\path\to\scheduler\scripts
.\deploy-database.ps1 -ServerInstance "YOUR_SQL_SERVER" -DatabaseName "scheduler" -SqlAuthUser "sa" -SqlAuthPassword "YourPassword"
```

**For detailed database deployment:**
See [DATABASE_DEPLOYMENT_GUIDE.md](DATABASE_DEPLOYMENT_GUIDE.md)

---

## Application Deployment

### **Automated Deployment (Recommended)**

```powershell
cd C:\path\to\scheduler\scripts
.\deploy-iis.ps1 -SiteName "Loginet" -AppPoolName "LoginetAppPool" -PhysicalPath "C:\inetpub\wwwroot\Loginet" -Port 80
```

### **Manual Deployment Steps**

1. **Create Physical Directory:**
   ```powershell
   New-Item -Path "C:\inetpub\wwwroot\Loginet" -ItemType Directory -Force
   ```

2. **Copy Application Files:**
   ```powershell
   Copy-Item -Path "C:\path\to\scheduler\WebSite\*" -Destination "C:\inetpub\wwwroot\Loginet" -Recurse -Force
   ```

3. **Set Permissions:**
   ```powershell
   icacls "C:\inetpub\wwwroot\Loginet" /grant "IIS_IUSRS:(OI)(CI)F" /T
   ```

4. **Create IIS Website:**
   ```powershell
   New-Website -Name "Loginet" -Port 80 -PhysicalPath "C:\inetpub\wwwroot\Loginet" -ApplicationPool "LoginetAppPool"
   ```

5. **Start Services:**
   ```powershell
   Start-WebAppPool -Name "LoginetAppPool"
   Start-Website -Name "Loginet"
   ```

---

## Connection Strings

### **Configure Production Connection String**

Edit `C:\inetpub\wwwroot\Loginet\Web.config`:

```xml
<connectionStrings>
  <add name="schedulerEntities"
       connectionString="metadata=res://*/DBEngine.csdl|res://*/DBEngine.ssdl|res://*/DBEngine.msl;provider=System.Data.SqlClient;provider connection string=&quot;data source=PROD_SQL_SERVER;initial catalog=scheduler;user id=loginet_app;password=SECURE_PASSWORD;encrypt=true;trustservercertificate=False;MultipleActiveResultSets=True;App=EntityFramework&quot;"
       providerName="System.Data.EntityClient"/>
</connectionStrings>
```

### **Encrypt Connection String (Recommended)**

```powershell
cd C:\Windows\Microsoft.NET\Framework64\v4.0.30319
.\aspnet_regiis.exe -pef "connectionStrings" "C:\inetpub\wwwroot\Loginet"
```

---

## SSL Configuration

### **Install SSL Certificate**

1. **Obtain Certificate:**
   - Purchase from CA (DigiCert, GoDaddy, etc.)
   - Use Let's Encrypt (free)
   - Generate self-signed (dev only)

2. **Install in IIS:**
   - IIS Manager → Server Certificates → Import
   - Select .pfx file
   - Enter password

3. **Bind to Website:**
   - IIS Manager → Sites → Loginet → Bindings
   - Add Binding: Type HTTPS, Port 443, SSL Certificate

4. **Enforce HTTPS:**
   - Add redirect rule to Web.config (see [SECURITY_HARDENING.md](SECURITY_HARDENING.md))

---

## Testing

### **Smoke Tests**

```powershell
# Test HTTP response
Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing

# Test HTTPS response (if configured)
Invoke-WebRequest -Uri "https://localhost" -UseBasicParsing

# Test health check
Invoke-WebRequest -Uri "http://localhost/Services/HealthCheck.ashx" -UseBasicParsing
```

### **Functional Tests**
- [ ] Login page loads
- [ ] Can create user via setup wizard
- [ ] Can login with created user
- [ ] Can view dashboard
- [ ] Can create invoice
- [ ] Can create customer
- [ ] Can logout

---

## Monitoring

### **Configure IIS Logging**

```powershell
# Enable detailed logging
Set-WebConfigurationProperty -Filter "/system.applicationHost/sites/site[@name='Loginet']/logFile" -Name "logExtFileFlags" -Value "Date,Time,ClientIP,UserName,ServerIP,Method,UriStem,UriQuery,HttpStatus,Win32Status,TimeTaken,ServerPort,UserAgent,Referer,HttpSubStatus"
```

### **Application Monitoring**
- Configure Application Insights (Azure)
- Or use health check endpoint for monitoring
- Set up alerts for errors

---

## Additional Resources

**Related Guides:**
- [IIS Deployment Guide (Basic)](IIS_DEPLOYMENT_GUIDE_BASIC.md) - Quick deployment
- [DATABASE_DEPLOYMENT_GUIDE.md](DATABASE_DEPLOYMENT_GUIDE.md) - Database setup
- [SECURITY_HARDENING.md](SECURITY_HARDENING.md) - Security best practices
- [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) - Pre-deployment checklist
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues

**PowerShell Scripts:**
- `scripts/deploy-iis.ps1` - Automated IIS deployment
- `scripts/deploy-database.ps1` - Automated database deployment
- `scripts/rollback.ps1` - Rollback to previous version

---

**[⬅ Back to Deployment Documentation](README.md)**
