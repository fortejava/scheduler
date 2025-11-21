# ⚙️ Settings Guide - Loginet

**System Configuration and Settings Management**

**Version:** 2.0
**Language:** English
**Last Updated:** November 21, 2025

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [SystemConfig Table](#systemconfig-table)
3. [Available Settings](#available-settings)
4. [Managing Settings](#managing-settings)
5. [Security Considerations](#security-considerations)
6. [Best Practices](#best-practices)

---

## Overview

Loginet uses a **database-driven configuration system** to manage application settings dynamically without requiring code changes or redeployment.

### **Configuration Architecture**

**Database Table:** `SystemConfig`
- **Location:** SQL Server database
- **Structure:** Key-value pairs with descriptions
- **Access:** Programmatic via Entity Framework

**Benefits:**
- ✅ **No redeployment needed** - Changes take effect immediately
- ✅ **Centralized management** - All settings in one place
- ✅ **Audit trail** - Settings changes tracked in database
- ✅ **Environment-specific** - Different settings per environment (dev/prod)

---

## SystemConfig Table

### **Table Structure**

```sql
CREATE TABLE SystemConfig (
    ConfigID INT PRIMARY KEY IDENTITY(1,1),
    ConfigKey NVARCHAR(100) NOT NULL UNIQUE,
    ConfigValue NVARCHAR(MAX) NULL,
    Description NVARCHAR(500) NULL,
    CreatedDate DATETIME DEFAULT GETDATE(),
    ModifiedDate DATETIME NULL
)
```

### **Column Descriptions**

| Column | Type | Description |
|--------|------|-------------|
| **ConfigID** | INT | Primary key, auto-increment |
| **ConfigKey** | NVARCHAR(100) | Unique setting identifier (e.g., "SetupCompleted") |
| **ConfigValue** | NVARCHAR(MAX) | Setting value (stored as string, parsed as needed) |
| **Description** | NVARCHAR(500) | Human-readable description of the setting |
| **CreatedDate** | DATETIME | When the setting was first created |
| **ModifiedDate** | DATETIME | Last modification timestamp |

---

## Available Settings

### **1. SetupCompleted**

**Purpose:** Indicates whether the first-time Setup Wizard has been completed

**Type:** Boolean (stored as string)

**Values:**
- `"true"` - Setup completed, wizard disabled
- `"false"` - Setup not completed, wizard accessible

**Default:** `"false"` (on fresh installation)

**Example:**
```sql
SELECT * FROM SystemConfig WHERE ConfigKey = 'SetupCompleted';
```

**Result:**
```
ConfigID | ConfigKey       | ConfigValue | Description
---------|-----------------|-------------|----------------------------------
1        | SetupCompleted  | true        | First-time setup wizard status
```

**Usage in Code:**
```csharp
using (var db = new schedulerEntities())
{
    var config = db.SystemConfigs
        .FirstOrDefault(c => c.ConfigKey == "SetupCompleted");

    bool isSetupCompleted = config?.ConfigValue == "true";
}
```

**Security Impact:** ⚠️ **Critical** - Controls access to Setup Wizard endpoint

---

### **2. ApplicationVersion** (Recommended)

**Purpose:** Track application version for update management

**Type:** String (semantic versioning)

**Example:**
```sql
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('ApplicationVersion', '2.0.0', 'Current application version');
```

**Usage:**
- Display in footer/about page
- Check for updates
- Migration script compatibility

---

### **3. MaintenanceMode** (Recommended)

**Purpose:** Enable/disable maintenance mode

**Type:** Boolean (stored as string)

**Values:**
- `"true"` - Maintenance mode enabled (show maintenance page)
- `"false"` - Normal operation

**Example:**
```sql
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('MaintenanceMode', 'false', 'System maintenance mode status');
```

**Usage in Code:**
```csharp
var maintenanceMode = db.SystemConfigs
    .FirstOrDefault(c => c.ConfigKey == "MaintenanceMode");

if (maintenanceMode?.ConfigValue == "true")
{
    // Redirect to maintenance page
    Response.Redirect("~/maintenance.html");
}
```

---

### **4. SessionTimeout** (Recommended)

**Purpose:** Configure session timeout duration (minutes)

**Type:** Integer (stored as string)

**Example:**
```sql
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('SessionTimeout', '30', 'Session timeout in minutes');
```

**Usage:**
- Session expiration logic
- Token lifetime
- Auto-logout timer

---

### **5. MaxLoginAttempts** (Recommended)

**Purpose:** Maximum failed login attempts before account lockout

**Type:** Integer (stored as string)

**Example:**
```sql
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('MaxLoginAttempts', '5', 'Maximum failed login attempts');
```

**Usage:**
- Brute-force protection
- Account lockout logic

---

### **6. CompanyName** (Optional)

**Purpose:** Customize company name displayed in UI

**Type:** String

**Example:**
```sql
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('CompanyName', 'Loginet S.r.l.', 'Company name for branding');
```

**Usage:**
- Header/footer display
- Invoice templates
- Email signatures

---

### **7. DateFormat** (Optional)

**Purpose:** Default date format for the application

**Type:** String (format pattern)

**Example:**
```sql
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('DateFormat', 'DD/MM/YYYY', 'Default date display format');
```

**Values:**
- `"DD/MM/YYYY"` - European format
- `"MM/DD/YYYY"` - US format
- `"YYYY-MM-DD"` - ISO format

---

### **8. Currency** (Optional)

**Purpose:** Default currency for invoices

**Type:** String (ISO 4217 code)

**Example:**
```sql
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('Currency', 'EUR', 'Default currency (ISO 4217 code)');
```

**Common Values:**
- `"EUR"` - Euro
- `"USD"` - US Dollar
- `"GBP"` - British Pound

---

## Managing Settings

### **Method 1: SQL Server Management Studio (SSMS)**

**Best for:** Manual configuration, one-time changes

**Steps:**

1. **Connect to SQL Server**
   ```
   Server: localhost\SQLEXPRESS
   Database: scheduler
   Authentication: Windows Authentication
   ```

2. **Query Existing Settings**
   ```sql
   SELECT * FROM SystemConfig ORDER BY ConfigKey;
   ```

3. **Add New Setting**
   ```sql
   INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
   VALUES ('SettingName', 'value', 'Description of setting');
   ```

4. **Update Existing Setting**
   ```sql
   UPDATE SystemConfig
   SET ConfigValue = 'new value',
       ModifiedDate = GETDATE()
   WHERE ConfigKey = 'SettingName';
   ```

5. **Delete Setting** (use with caution)
   ```sql
   DELETE FROM SystemConfig WHERE ConfigKey = 'SettingName';
   ```

---

### **Method 2: Admin UI (Future Enhancement)**

**Status:** Not currently implemented
**Recommendation:** Add admin settings page

**Proposed Features:**
- ✅ List all settings in table
- ✅ Edit settings inline
- ✅ Add new settings via form
- ✅ Delete settings with confirmation
- ✅ Validation for setting types
- ✅ Audit log of changes

**Example URL:**
```
http://yourserver/admin/settings.html
```

**Required Role:** Admin only

---

### **Method 3: Programmatic Access**

**Best for:** Application logic, dynamic configuration

**Read Setting:**
```csharp
using (var db = new schedulerEntities())
{
    var setting = db.SystemConfigs
        .FirstOrDefault(c => c.ConfigKey == "SettingName");

    string value = setting?.ConfigValue ?? "default value";
}
```

**Update Setting:**
```csharp
using (var db = new schedulerEntities())
{
    var setting = db.SystemConfigs
        .FirstOrDefault(c => c.ConfigKey == "SettingName");

    if (setting != null)
    {
        setting.ConfigValue = "new value";
        setting.ModifiedDate = DateTime.Now;
    }
    else
    {
        // Create if doesn't exist
        db.SystemConfigs.Add(new SystemConfig
        {
            ConfigKey = "SettingName",
            ConfigValue = "new value",
            Description = "Setting description"
        });
    }

    db.SaveChanges();
}
```

**Helper Method (Recommended):**
```csharp
public static class ConfigHelper
{
    public static string GetSetting(string key, string defaultValue = "")
    {
        using (var db = new schedulerEntities())
        {
            var setting = db.SystemConfigs
                .FirstOrDefault(c => c.ConfigKey == key);

            return setting?.ConfigValue ?? defaultValue;
        }
    }

    public static void SetSetting(string key, string value, string description = "")
    {
        using (var db = new schedulerEntities())
        {
            var setting = db.SystemConfigs
                .FirstOrDefault(c => c.ConfigKey == key);

            if (setting != null)
            {
                setting.ConfigValue = value;
                setting.ModifiedDate = DateTime.Now;
            }
            else
            {
                db.SystemConfigs.Add(new SystemConfig
                {
                    ConfigKey = key,
                    ConfigValue = value,
                    Description = description
                });
            }

            db.SaveChanges();
        }
    }

    public static bool GetBoolSetting(string key, bool defaultValue = false)
    {
        string value = GetSetting(key);
        return value == "true" || value == "1" || value == "yes";
    }

    public static int GetIntSetting(string key, int defaultValue = 0)
    {
        string value = GetSetting(key);
        int result;
        return int.TryParse(value, out result) ? result : defaultValue;
    }
}
```

**Usage:**
```csharp
// Read settings
bool isSetupCompleted = ConfigHelper.GetBoolSetting("SetupCompleted", false);
int sessionTimeout = ConfigHelper.GetIntSetting("SessionTimeout", 30);
string companyName = ConfigHelper.GetSetting("CompanyName", "Loginet");

// Write settings
ConfigHelper.SetSetting("MaintenanceMode", "true", "Maintenance mode enabled");
```

---

## Security Considerations

### **1. Access Control**

**⚠️ Critical Settings:**
- `SetupCompleted` - Should only be writable by system/admin
- `SessionTimeout` - Affects security
- `MaxLoginAttempts` - Affects security

**Best Practice:**
- ✅ Only Admin users should modify settings
- ✅ Implement audit logging for setting changes
- ✅ Validate setting values before saving

---

### **2. SQL Injection Prevention**

**Always use parameterized queries:**

**❌ WRONG (SQL Injection vulnerability):**
```csharp
string query = "UPDATE SystemConfig SET ConfigValue = '" + userInput + "' WHERE ConfigKey = 'SettingName'";
```

**✅ CORRECT (Safe):**
```csharp
// Entity Framework (automatically parameterized)
var setting = db.SystemConfigs.FirstOrDefault(c => c.ConfigKey == "SettingName");
setting.ConfigValue = userInput;
db.SaveChanges();
```

---

### **3. Sensitive Data**

**⚠️ DO NOT store in SystemConfig:**
- ❌ Passwords (even hashed)
- ❌ Connection strings (use Web.config instead)
- ❌ API keys (use secure storage/environment variables)
- ❌ Encryption keys

**✅ SAFE to store:**
- ✅ Feature flags (true/false)
- ✅ Display preferences (date format, currency)
- ✅ Timeout values
- ✅ UI customization (company name, logo URL)

---

### **4. Backup and Recovery**

**Backup SystemConfig Table:**
```sql
-- Export settings to script
SELECT 'INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description) VALUES ('''
    + ConfigKey + ''', '''
    + ISNULL(ConfigValue, '') + ''', '''
    + ISNULL(Description, '') + ''');'
FROM SystemConfig
ORDER BY ConfigKey;
```

**Restore from Backup:**
```sql
-- Clear existing (CAUTION!)
TRUNCATE TABLE SystemConfig;

-- Re-insert from backup script
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
VALUES ('SetupCompleted', 'true', 'First-time setup wizard status');
-- ... (rest of settings)
```

---

## Best Practices

### **✅ Do's**

1. **Use descriptive ConfigKey names**
   - ✅ Good: `MaintenanceMode`, `SessionTimeoutMinutes`
   - ❌ Bad: `mm`, `timeout`, `setting1`

2. **Always provide descriptions**
   ```sql
   INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
   VALUES ('NewSetting', 'value', 'What this setting controls and valid values');
   ```

3. **Document valid values**
   ```sql
   Description: 'Maintenance mode: "true" or "false"'
   ```

4. **Use consistent value formats**
   - Booleans: `"true"` or `"false"` (lowercase)
   - Numbers: `"123"` (no formatting)
   - Dates: ISO format `"2025-11-21"`

5. **Set ModifiedDate on updates**
   ```sql
   UPDATE SystemConfig
   SET ConfigValue = 'new value',
       ModifiedDate = GETDATE()
   WHERE ConfigKey = 'SettingName';
   ```

6. **Create helper methods for type conversion**
   - See ConfigHelper class example above

---

### **❌ Don'ts**

1. **Don't hardcode setting values**
   - ❌ Bad: `if (timeout == 30)`
   - ✅ Good: `int timeout = ConfigHelper.GetIntSetting("SessionTimeout", 30);`

2. **Don't delete critical settings**
   - Keep `SetupCompleted` permanently

3. **Don't expose settings to non-admin users**
   - Settings page should require Admin role

4. **Don't store binary data**
   - Use file system or dedicated blob storage

---

## Common Configuration Scenarios

### **Scenario 1: Enable Maintenance Mode**

**When:** Performing database maintenance, updates, or troubleshooting

**Steps:**
```sql
-- 1. Set maintenance mode
UPDATE SystemConfig
SET ConfigValue = 'true',
    ModifiedDate = GETDATE()
WHERE ConfigKey = 'MaintenanceMode';

-- 2. Perform maintenance

-- 3. Disable maintenance mode
UPDATE SystemConfig
SET ConfigValue = 'false',
    ModifiedDate = GETDATE()
WHERE ConfigKey = 'MaintenanceMode';
```

**Application Logic (Global.asax or BaseHandler):**
```csharp
protected void Application_BeginRequest(object sender, EventArgs e)
{
    bool maintenanceMode = ConfigHelper.GetBoolSetting("MaintenanceMode", false);

    if (maintenanceMode && !Request.Path.Contains("maintenance.html"))
    {
        Response.Redirect("~/maintenance.html");
    }
}
```

---

### **Scenario 2: Change Session Timeout**

**When:** Security requirements change

**Steps:**
```sql
-- Set to 15 minutes (stricter)
UPDATE SystemConfig
SET ConfigValue = '15',
    ModifiedDate = GETDATE()
WHERE ConfigKey = 'SessionTimeout';

-- Or set to 60 minutes (more relaxed)
UPDATE SystemConfig
SET ConfigValue = '60',
    ModifiedDate = GETDATE()
WHERE ConfigKey = 'SessionTimeout';
```

**Application Logic (SimpleTokenManager.cs):**
```csharp
int sessionTimeoutMinutes = ConfigHelper.GetIntSetting("SessionTimeout", 30);
var expirationTime = DateTime.Now.AddMinutes(sessionTimeoutMinutes);
```

---

### **Scenario 3: Re-enable Setup Wizard (Development Only)**

**⚠️ WARNING: Development/Testing only - NOT for production**

**Steps:**
```sql
-- 1. Reset SetupCompleted flag
UPDATE SystemConfig
SET ConfigValue = 'false',
    ModifiedDate = GETDATE()
WHERE ConfigKey = 'SetupCompleted';

-- 2. Delete existing users (CAUTION!)
DELETE FROM Users;

-- 3. Restore setup-wizard.html and setup-wizard.js files from source

-- 4. Access http://yourserver/setup-wizard.html
```

---

## Related Documentation

### **For Administrators:**
- [Setup Wizard Guide (EN)](SETUP_WIZARD_GUIDE_EN.md)
- [Setup Wizard Guide (IT)](SETUP_WIZARD_GUIDE_IT.md)
- [Security Hardening](../07-deployment/SECURITY_HARDENING.md)
- [Deployment Guide](../07-deployment/README.md)

### **For Developers:**
- [Database Schema](../05-database/DATABASE_SCHEMA.md)
- [API Documentation](../03-api/README.md)

---

## Summary

The SystemConfig table provides **flexible, database-driven configuration** for Loginet:
- ✅ Centralized settings management
- ✅ No redeployment needed for changes
- ✅ Environment-specific configuration
- ✅ Audit trail via ModifiedDate

**Current Critical Setting:**
- `SetupCompleted` - Controls Setup Wizard access

**Recommended Future Settings:**
- `MaintenanceMode` - System maintenance control
- `SessionTimeout` - Security configuration
- `MaxLoginAttempts` - Brute-force protection
- `CompanyName` - UI branding
- `DateFormat` / `Currency` - Localization

---

**[⬆ Back to top](#️-settings-guide---loginet)**

**[🏠 Back to documentation index](../README.md)**
