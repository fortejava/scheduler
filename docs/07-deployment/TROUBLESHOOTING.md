# 🐛 Deployment Troubleshooting Guide

**Common Issues and Solutions**

**Last Updated:** November 21, 2025

---

## 🖥️ IIS Issues

### **HTTP 500 - Internal Server Error**

**Symptoms:** White page with "HTTP Error 500.0 - Internal Server Error"

**Possible Causes & Solutions:**

1. **ASP.NET Not Registered**
   ```powershell
   C:\Windows\Microsoft.NET\Framework64\v4.0.30319\aspnet_regiis.exe -i
   ```

2. **Web.config Syntax Error**
   - Check Event Viewer: `eventvwr.msc` → Windows Logs → Application
   - Look for detailed error message

3. **Missing DLL Dependencies**
   - Ensure all DLLs in `Bin/` folder
   - Check BCrypt.Net, Newtonsoft.Json, EntityFramework DLLs present

**Quick Fix:**
```powershell
# Enable detailed errors temporarily
# Edit Web.config:
<customErrors mode="Off" />
# Check browser for detailed error
# IMPORTANT: Change back to mode="On" for production!
```

---

### **HTTP 503 - Service Unavailable**

**Symptoms:** "Service Unavailable - HTTP Error 503"

**Cause:** Application pool stopped or failed

**Solution:**
```powershell
# Check app pool status
Get-WebAppPoolState -Name "LoginetAppPool"

# Start app pool
Start-WebAppPool -Name "LoginetAppPool"

# Check Event Viewer for crash reason
eventvwr.msc → Windows Logs → Application
```

---

### **HTTP 404 - Not Found**

**Cause:** Wrong URL or IIS not configured correctly

**Solution:**
- Verify site bindings in IIS Manager
- Check physical path points to correct folder
- Ensure `Index.html` exists in root folder

---

### **"Cannot connect to database"**

**Symptoms:** Login page shows error about database connection

**Solutions:**

1. **Test SQL Connection:**
   ```powershell
   Test-NetConnection -ComputerName YOUR_SERVER -Port 1433
   ```

2. **Verify Connection String:**
   - Check `Web.config` → `<connectionStrings>`
   - Verify server name, database name, username, password

3. **SQL Server Not Allowing Remote Connections:**
   - SQL Server Configuration Manager
   - SQL Server Network Configuration → Protocols
   - Enable TCP/IP
   - Restart SQL Server service

4. **Firewall Blocking:**
   ```powershell
   New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -LocalPort 1433 -Protocol TCP -Action Allow
   ```

---

### **"Login failed for user"**

**Cause:** Wrong credentials or SQL Server authentication not enabled

**Solutions:**

1. **Enable Mixed Mode Authentication:**
   - SSMS → Right-click server → Properties → Security
   - Select "SQL Server and Windows Authentication mode"
   - Restart SQL Server service

2. **Verify User Has Access:**
   ```sql
   USE scheduler;
   CREATE USER your_user FOR LOGIN your_login;
   GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO your_user;
   ```

3. **Check Password:**
   - Ensure special characters are properly encoded in connection string
   - Use `&quot;` for quotes inside XML

---

### **Permissions Error**

**Symptoms:** "Access is denied" or file read/write errors

**Solution:**
```powershell
# Grant IIS_IUSRS full control
icacls "C:\inetpub\wwwroot\Loginet" /grant "IIS_IUSRS:(OI)(CI)F" /T

# Grant application pool identity (if using specific identity)
icacls "C:\inetpub\wwwroot\Loginet" /grant "IIS APPPOOL\LoginetAppPool:(OI)(CI)F" /T
```

---

## 🐳 Docker Issues

### **"Cannot connect to Docker daemon"**

**Cause:** Docker Desktop not running or wrong context

**Solution:**
```bash
# Check Docker is running
docker version

# Switch to Windows containers (if needed)
# Right-click Docker Desktop tray icon → Switch to Windows containers
```

---

### **"No such image" or Build Fails**

**Cause:** Image not built or Dockerfile error

**Solution:**
```bash
# Build image manually
docker build -t loginet-app:latest .

# Check for errors in output
# Common issues:
# - Missing files (check .dockerignore)
# - Wrong base image
# - Copy paths incorrect
```

---

### **Container Starts Then Immediately Stops**

**Cause:** Application crash or health check failure

**Solutions:**

1. **Check Logs:**
   ```bash
   docker logs loginet-webapp
   docker logs loginet-sqlserver
   ```

2. **Exec Into Container (if still running):**
   ```bash
   docker exec -it loginet-webapp powershell
   ```

3. **Check Health:**
   ```bash
   docker inspect loginet-webapp | grep -A 10 Health
   ```

4. **Disable Health Check Temporarily:**
   Comment out HEALTHCHECK in Dockerfile, rebuild

---

### **"Port is already allocated"**

**Cause:** Another service using the port

**Solutions:**

1. **Find Process Using Port:**
   ```powershell
   netstat -ano | findstr :8080
   taskkill /PID <PID> /F
   ```

2. **Use Different Port:**
   Edit `docker-compose.yml`:
   ```yaml
   ports:
     - "9090:80"  # Changed from 8080:80
   ```

---

### **"Cannot connect to SQL Server from Container"**

**Symptoms:** App container can't reach SQL Server container

**Solutions:**

1. **Verify Network:**
   ```bash
   docker network ls
   docker network inspect loginet-network
   ```

2. **Test Connectivity:**
   ```bash
   docker exec loginet-webapp powershell Test-NetConnection sqlserver -Port 1433
   ```

3. **Check Service Names:**
   - In docker-compose, use service name `sqlserver` not `localhost`
   - Verify `DB_SERVER=sqlserver` in environment variables

4. **Check SQL Server Container Logs:**
   ```bash
   docker logs loginet-sqlserver | grep -i "ready for client connections"
   ```

---

### **Database Not Initialized**

**Cause:** Init scripts didn't run automatically

**Solution:**
```bash
# Manually run initialization
docker cp DB.sql loginet-sqlserver:/tmp/
docker exec loginet-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Password123! -i /tmp/DB.sql
docker exec loginet-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Password123! -i /db-schema/init/03-seed-data.sql
```

---

### **Data Lost After Container Restart**

**Cause:** No volume configured for SQL Server data

**Solution:**
Verify volume in `docker-compose.yml`:
```yaml
volumes:
  - sqlserver-data:/var/opt/mssql
```

Check volume exists:
```bash
docker volume ls
docker volume inspect loginet-sqlserver-data
```

---

## 🗄️ Database Issues

### **"Database 'scheduler' does not exist"**

**Solution:**
```sql
CREATE DATABASE scheduler;
```

Or run DB.sql which includes database creation.

---

### **"Invalid object name 'dbo.Users'"**

**Cause:** Tables not created

**Solution:**
Run DB.sql to create all tables and schema.

---

### **"UNIQUE KEY constraint violation"**

**Cause:** Trying to insert duplicate data

**Solutions:**
- Seed scripts have `IF NOT EXISTS` checks - use those
- Check if data already exists before inserting
- Use UPDATE instead of INSERT for existing records

---

## 🔍 General Debugging

### **Enable Diagnostic Logging**

1. **IIS Logs:**
   - Location: `C:\inetpub\logs\LogFiles\`
   - Enable Failed Request Tracing for detailed info

2. **Event Viewer:**
   ```powershell
   eventvwr.msc
   # Check Windows Logs → Application
   ```

3. **Custom Application Logs:**
   - Use DiagnosticLogger service (already in code)
   - Logs to database or file system

### **Browser Developer Tools**

- Press `F12` in browser
- Check Console tab for JavaScript errors
- Check Network tab for failed requests (401, 500, etc.)

---

## 🆘 Getting More Help

**If issues persist:**

1. **Check Full Error Details:**
   - IIS: Enable detailed errors temporarily
   - Docker: Check full logs with `docker logs`

2. **Search Error Message:**
   - Google the exact error
   - Check Stack Overflow

3. **Review Documentation:**
   - [IIS Deployment Guide](IIS_DEPLOYMENT_GUIDE_DETAILED.md)
   - [Docker Deployment Guide](DOCKER_DEPLOYMENT_GUIDE_DETAILED.md)
   - [Database Guide](DATABASE_DEPLOYMENT_GUIDE.md)

4. **GitHub Issues:**
   - Check existing issues
   - Create new issue with full error details

---

**[⬅ Back to Deployment Documentation](README.md)**
