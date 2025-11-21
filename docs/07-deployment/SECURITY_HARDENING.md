# 🔒 Security Hardening Guide

**Loginet Production Security Best Practices**

**Last Updated:** November 21, 2025

---

## 🎯 Security Overview

This guide covers **essential security measures** for production deployment.

**Security Layers:**
1. Network Security (Firewall, SSL/TLS)
2. Application Security (Input validation, authentication)
3. Database Security (Encryption, access control)
4. Infrastructure Security (IIS, Docker hardening)

---

## 🌐 HTTPS/SSL Configuration

### **IIS SSL Setup**

1. **Obtain SSL Certificate:**
   - Let's Encrypt (free)
   - Commercial CA (DigiCert, GoDaddy)
   - Self-signed (development only)

2. **Install Certificate in IIS:**
   - IIS Manager → Server Certificates → Import
   - Bind to website (port 443)

3. **Enforce HTTPS:**
```xml
<!-- Web.config -->
<system.webServer>
  <rewrite>
    <rules>
      <rule name="HTTP to HTTPS" stopProcessing="true">
        <match url="(.*)" />
        <conditions>
          <add input="{HTTPS}" pattern="off" />
        </conditions>
        <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
      </rule>
    </rules>
  </rewrite>
</system.webServer>
```

---

## 🔐 Connection String Security

### **Encrypt Connection Strings**

```powershell
# Encrypt connectionStrings section
cd C:\Windows\Microsoft.NET\Framework64\v4.0.30319
.\aspnet_regiis.exe -pef "connectionStrings" "C:\inetpub\wwwroot\Loginet"
```

### **Use Environment Variables (Docker)**
```bash
# Never commit to Git
DB_PASSWORD=YourSecurePassword123!

# Reference in connection string
connectionString="...password=${DB_PASSWORD}..."
```

---

## 🛡️ Security Headers

**Add to Web.config:**
```xml
<system.webServer>
  <httpProtocol>
    <customHeaders>
      <add name="X-Frame-Options" value="SAMEORIGIN" />
      <add name="X-Content-Type-Options" value="nosniff" />
      <add name="X-XSS-Protection" value="1; mode=block" />
      <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
      <add name="Content-Security-Policy" value="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" />
      <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
      <remove name="X-Powered-By" />
    </customHeaders>
  </httpProtocol>
</system.webServer>
```

---

## 🗄️ SQL Server Security

### **1. Use Strong Passwords**
```sql
-- Change SA password
ALTER LOGIN sa WITH PASSWORD = 'ComplexPassword123!@#';
ALTER LOGIN sa DISABLE;  -- Disable sa in production

-- Create dedicated application user
CREATE LOGIN loginet_app WITH PASSWORD = 'AnotherStrongPassword456!@#';
CREATE USER loginet_app FOR LOGIN loginet_app;
```

### **2. Grant Minimal Permissions**
```sql
USE scheduler;

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO loginet_app;

-- Deny dangerous permissions
DENY CREATE TABLE TO loginet_app;
DENY DROP TO loginet_app;
DENY ALTER TO loginet_app;
```

### **3. Enable TLS Encryption**
```sql
-- Force encrypted connections
ALTER LOGIN loginet_app WITH CHECK_POLICY = ON, CHECK_EXPIRATION = ON;
```

### **4. Firewall Configuration**
```powershell
# Allow SQL Server port only from web server
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -LocalPort 1433 -Protocol TCP -Action Allow -RemoteAddress 192.168.1.100
```

---

## 🔑 Authentication & Authorization

### **Password Security**
- ✅ **BCrypt hashing** (already implemented in Loginet)
- ✅ **Minimum 8 characters** enforced
- ✅ **Complexity requirements** recommended

### **Session Management**
- ✅ **Token-based sessions** (already implemented)
- ✅ **Session expiration** (default: 30 days, adjust in code)
- ⚠️ **Implement session timeout** (auto-logout after inactivity)

### **Role-Based Access Control**
- ✅ **3 Roles:** Admin, User, Visitor (already implemented)
- ✅ **Authorization checks** on all endpoints (BaseHandler pattern)

---

## 🚫 Input Validation & XSS Prevention

**Already Implemented:**
- ✅ ASP.NET `ValidateRequest` enabled
- ✅ Entity Framework parameterized queries (SQL injection prevention)
- ✅ Custom validation in service layer

**Additional Recommendations:**
```csharp
// Output encoding (use in views)
Server.HtmlEncode(userInput);

// JavaScript escaping
HttpUtility.JavaScriptStringEncode(userInput);
```

---

## 🐳 Docker Security

### **1. Don't Run as Root**
```dockerfile
# Dockerfile (Linux containers)
USER appuser
```

### **2. Use Secrets**
```yaml
# docker-compose.yml
services:
  webapp:
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### **3. Scan Images**
```bash
docker scan loginet-app:latest
```

### **4. Limit Resources**
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
```

---

## 🔥 Firewall Rules

**Windows Server:**
```powershell
# Allow HTTP (development)
New-NetFirewallRule -DisplayName "Loginet HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Allow HTTPS (production)
New-NetFirewallRule -DisplayName "Loginet HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow

# Allow SQL Server (from web server only)
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -LocalPort 1433 -Protocol TCP -Action Allow -RemoteAddress 192.168.1.100
```

---

## 📝 Logging & Monitoring

### **Enable Logging**
```xml
<system.web>
  <trace enabled="false" pageOutput="false" />
  <customErrors mode="On" defaultRedirect="~/Error.html" />
</system.web>
```

### **Log Sensitive Events**
- Failed login attempts
- Permission denied
- Data modifications
- Errors and exceptions

---

## ✅ Security Checklist

**Before Production:**
- [ ] HTTPS enforced
- [ ] Connection strings encrypted
- [ ] SQL Server uses strong passwords and dedicated user
- [ ] Security headers configured
- [ ] Debug mode disabled
- [ ] Custom errors enabled
- [ ] SA account disabled
- [ ] Firewall rules configured
- [ ] Logging enabled
- [ ] Regular backups configured
- [ ] Security scan performed
- [ ] Penetration testing (if required)

---

## 🔍 Security Testing

**Recommended Tools:**
- **OWASP ZAP** - Web vulnerability scanner
- **SQLMap** - SQL injection testing
- **Nmap** - Port scanning
- **Burp Suite** - Web security testing

**Manual Tests:**
- SQL injection attempts
- XSS attempts
- CSRF attempts
- Authentication bypass attempts
- Authorization escalation attempts

---

## 📚 Additional Resources

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **ASP.NET Security:** https://docs.microsoft.com/en-us/aspnet/core/security/
- **SQL Server Security:** https://docs.microsoft.com/en-us/sql/relational-databases/security/

---

**[⬅ Back to Deployment Documentation](README.md)**
