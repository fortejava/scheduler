# 🔧 Setup Wizard Guide - Loginet

**First-Time Setup Configuration**

**Version:** 2.0
**Language:** English
**Last Updated:** November 21, 2025

---

## 📖 Table of Contents

1. [What is the Setup Wizard?](#what-is-the-setup-wizard)
2. [When Does It Run?](#when-does-it-run)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [What Happens Behind the Scenes](#what-happens-behind-the-scenes)
6. [Security Features](#security-features)
7. [After Setup Completion](#after-setup-completion)
8. [Disabling the Setup Wizard](#disabling-the-setup-wizard)
9. [Re-enabling Setup](#re-enabling-setup-advanced)
10. [Troubleshooting](#troubleshooting)

---

## What is the Setup Wizard?

The **Setup Wizard** is a **first-time configuration tool** that creates the initial administrator account for Loginet.

### **Purpose**

When Loginet is installed for the first time, there are **no users** in the system. The Setup Wizard:
- ✅ Creates the **first Admin user**
- ✅ Sets the system as "configured"
- ✅ Prevents unauthorized access
- ✅ **Auto-deletes itself** after completion (security feature)

### **Key Features**

- **One-time use**: Can only be run once
- **Anonymous access**: No login required (for initial setup)
- **Security-first**: Auto-deletion after completion
- **Simple interface**: User-friendly form
- **Immediate activation**: Admin user active after completion

---

## When Does It Run?

The Setup Wizard runs **only once** during the initial deployment.

### **Trigger Conditions**

The wizard is **accessible only** when:
- ✅ Loginet is freshly deployed (first installation)
- ✅ The database flag `SystemConfig.SetupCompleted = 'false'` (or doesn't exist)
- ✅ No users exist in the system (or only the wizard-created admin)

### **Access URL**

```
http://yourserver/setup-wizard.html
```

**After successful setup, this URL will return 404 (file deleted).**

---

## Prerequisites

### **Before Running Setup Wizard**

Ensure these are completed:

#### **1. Database Deployed**
- ✅ SQL Server database created
- ✅ Tables created (from DB.sql or migration scripts)
- ✅ Seed data loaded (Roles, Status, SystemConfig)

**Verify:**
```sql
-- Check if tables exist
SELECT name FROM sys.tables;

-- Check Roles table
SELECT * FROM Roles;
-- Should have: Admin, User, Visitor

-- Check SystemConfig
SELECT * FROM SystemConfig WHERE ConfigKey = 'SetupCompleted';
-- Should be 'false' or not exist
```

#### **2. Application Deployed**
- ✅ Web application files copied to web server
- ✅ IIS/Docker configured and running
- ✅ Connection string configured correctly

**Test:**
```
http://yourserver/Index.html
```
Should show login page (but no users to login yet).

#### **3. Network Access**
- ✅ Server reachable from network
- ✅ Firewall allows port 80/443
- ✅ Browser can access the server

---

## Step-by-Step Setup

### **Step 1: Navigate to Setup Wizard**

1. Open your web browser
2. Go to:
   ```
   http://yourserver/setup-wizard.html
   ```

3. You should see the **"Configurazione Iniziale"** (Initial Setup) page

**Screenshot Description:**
- Purple gradient background
- White card with setup form
- Bootstrap Icons
- Italian text (interface language)

---

### **Step 2: Fill in the Form**

The form has **3 fields**:

#### **Field 1: Nome Utente Amministratore (Admin Username)**

**Requirements:**
- Minimum: **3 characters**
- Maximum: **100 characters**
- Must be **unique** (won't conflict on first run)

**Examples:**
- ✅ `admin`
- ✅ `administrator`
- ✅ `john.doe`
- ❌ `ab` (too short)

**Tips:**
- Use a professional username
- Avoid spaces
- Lowercase recommended

---

#### **Field 2: Password**

**Requirements:**
- Minimum: **8 characters**
- No maximum
- Can contain: letters, numbers, symbols

**Recommendations:**
- ✅ Mix of uppercase and lowercase
- ✅ Include numbers
- ✅ Include symbols (!@#$%^&*)
- ✅ Use a password manager

**Examples:**
- ✅ `P@ssw0rd123!` (16 chars, strong)
- ✅ `MySecurePass2025!` (17 chars, strong)
- ❌ `password` (8 chars, weak)
- ❌ `12345678` (8 chars, very weak)

---

#### **Field 3: Conferma Password (Confirm Password)**

- Must match **exactly** with Password field
- Real-time validation (shows error if mismatch)

---

### **Step 3: Submit the Form**

1. **Review** all fields for correctness
2. Click **"Completa Configurazione"** (Complete Setup)
3. The button will show a **loading spinner**: "Configurazione in corso..." (Setup in progress...)

---

### **Step 4: Wait for Success Message**

**If successful:**
- ✅ Green alert: **"Configurazione completata con successo"** (Setup completed successfully)
- ✅ Message shows: "Utente amministratore creato" (Admin user created)
- ✅ **Auto-redirect** to `Index.html` after 2 seconds

**If error:**
- ❌ Red alert with error message
- Common errors:
  - "Il nome utente deve essere di almeno 3 caratteri" (Username too short)
  - "Le password non corrispondono" (Passwords don't match)
  - "Setup già completato" (Setup already completed)

---

### **Step 5: Login with New Admin Account**

After redirect to `Index.html`:

1. **Enter credentials:**
   - Username: The one you just created
   - Password: The one you just created

2. **Click "Accedi"** (Login)

3. **You're in!** You'll see the dashboard

**⚠️ Important:** **Save these credentials securely!** There's no password recovery without admin access.

---

## What Happens Behind the Scenes

### **Backend Process (CompleteSetup.ashx)**

When you submit the form, this happens:

#### **Step 1: Validation**
```csharp
// Check if setup already completed
if (SystemConfig.SetupCompleted == "true") {
    throw new ServiceException("Setup already completed");
}

// Validate username (3-100 chars)
if (username.Length < 3 || username.Length > 100) {
    throw new ValidationException("Username must be 3-100 characters");
}

// Validate password (min 8 chars)
if (password.Length < 8) {
    throw new ValidationException("Password must be at least 8 characters");
}

// Check username doesn't already exist
if (UserExists(username)) {
    throw new ServiceException("Username already exists");
}
```

#### **Step 2: Create Admin User**
```csharp
// Hash password with BCrypt
string hashedPassword = PasswordHasher.HashPassword(password);

// Get Admin role
var adminRole = db.Roles.FirstOrDefault(r => r.RoleName == "Admin");

// Create user
var adminUser = new User {
    Username = username,
    Password = hashedPassword,  // BCrypt hash
    RoleID = adminRole.RoleID
};

db.Users.Add(adminUser);
```

#### **Step 3: Set SetupCompleted Flag**
```csharp
// Update SystemConfig
var config = db.SystemConfigs.FirstOrDefault(c => c.ConfigKey == "SetupCompleted");
if (config == null) {
    config = new SystemConfig {
        ConfigKey = "SetupCompleted",
        ConfigValue = "true",
        Description = "Indicates whether first-time setup wizard has been completed"
    };
    db.SystemConfigs.Add(config);
} else {
    config.ConfigValue = "true";
}

db.SaveChanges();
```

#### **Step 4: Auto-Delete Wizard Files (Security)**
```csharp
try {
    // Delete setup-wizard.html
    string wizardPath = Server.MapPath("~/setup-wizard.html");
    if (File.Exists(wizardPath)) {
        File.Delete(wizardPath);
    }

    // Delete setup-wizard.js
    string wizardJsPath = Server.MapPath("~/assets/js/setup-wizard.js");
    if (File.Exists(wizardJsPath)) {
        File.Delete(wizardJsPath);
    }
} catch (Exception ex) {
    // Log but don't fail setup
    // Manual deletion recommended if automatic fails
}
```

---

## Security Features

### **1. One-Time Use**

**Protection:** `SetupCompleted` flag prevents re-running.

**Implementation:**
```csharp
if (SystemConfig.SetupCompleted == "true") {
    throw new ServiceException("Setup already completed");
}
```

**Why:** Prevents attackers from creating new admin accounts after initial setup.

---

### **2. Automatic File Deletion (Tier 2A Security)**

**What gets deleted:**
- `setup-wizard.html` (frontend)
- `assets/js/setup-wizard.js` (JavaScript logic)

**When:** Immediately after successful setup

**Why:**
- ✅ Closes the attack vector
- ✅ No way to access the wizard URL after completion
- ✅ Reduces attack surface

**Fallback:** If automatic deletion fails (file permissions), the flag still prevents execution.

---

### **3. BCrypt Password Hashing**

**Technology:** BCrypt with automatic salt generation

**Benefits:**
- ✅ **One-way hash**: Cannot reverse engineer password
- ✅ **Salted**: Same password = different hash each time
- ✅ **Slow by design**: Resistant to brute-force attacks
- ✅ **Industry standard**: Widely trusted

**Example:**
```
Password: "P@ssw0rd123!"
Hash: "$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```

---

### **4. Anonymous Access (Controlled)**

**Why allow anonymous access?**
- Necessary for initial setup (no users exist yet)

**How is it safe?**
- ✅ Only works when `SetupCompleted = false`
- ✅ Creates only **one** user (cannot be exploited for multiple accounts)
- ✅ Files auto-delete after completion
- ✅ Flag prevents re-runs

---

## After Setup Completion

### **What You Should Do Next**

#### **1. Verify Admin Access**
- Login with the created admin account
- Check you can access all features
- Verify "Utenti" menu is visible (Admin only)

#### **2. Create Additional Users**
- Go to **"Utenti"** menu
- Create users for your team
- Assign appropriate roles (Admin/User/Visitor)

#### **3. Configure Application**
- Create initial customers
- Set up any custom settings
- Import existing data (if migrating)

#### **4. Verify Security**
- Check setup-wizard.html returns **404** (deleted)
- Verify you cannot re-run setup
- Confirm password strength

#### **5. Backup**
- Create **database backup** immediately
- Save admin credentials securely (password manager)
- Document your configuration

---

## Disabling the Setup Wizard

### **Automatic Disabling**

The wizard **disables itself automatically** after successful setup:
- ✅ `SetupCompleted` flag set to `true`
- ✅ Files deleted
- ✅ No further action needed

### **Manual Disabling (If Needed)**

If automatic deletion fails, you can **manually disable**:

#### **Method 1: Delete Files Manually**
```bash
# On server
del C:\inetpub\wwwroot\YourApp\setup-wizard.html
del C:\inetpub\wwwroot\YourApp\assets\js\setup-wizard.js
```

#### **Method 2: Set Flag Without Running Setup**

**Use Case:** You imported users from another system and don't need the wizard.

**SQL Command:**
```sql
-- Check current value
SELECT * FROM SystemConfig WHERE ConfigKey = 'SetupCompleted';

-- Set to 'true'
UPDATE SystemConfig
SET ConfigValue = 'true'
WHERE ConfigKey = 'SetupCompleted';

-- If it doesn't exist, insert
IF NOT EXISTS (SELECT * FROM SystemConfig WHERE ConfigKey = 'SetupCompleted')
BEGIN
    INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description)
    VALUES ('SetupCompleted', 'true', 'Setup wizard bypassed - users imported');
END
```

**Then manually delete wizard files.**

---

## Re-enabling Setup (Advanced)

**⚠️ WARNING: This is for development/testing only. DO NOT do this in production.**

### **Scenario**

You want to re-run the setup wizard (e.g., in a test environment).

### **Steps**

#### **Step 1: Delete Existing Users**
```sql
-- BE VERY CAREFUL - This deletes all users!
DELETE FROM Users;
```

#### **Step 2: Reset SetupCompleted Flag**
```sql
UPDATE SystemConfig
SET ConfigValue = 'false'
WHERE ConfigKey = 'SetupCompleted';
```

#### **Step 3: Restore Wizard Files**

If you have backups:
```bash
# Restore setup-wizard.html
copy backup\setup-wizard.html C:\inetpub\wwwroot\YourApp\

# Restore setup-wizard.js
copy backup\setup-wizard.js C:\inetpub\wwwroot\YourApp\assets\js\
```

Or copy from source code repository.

#### **Step 4: Access Wizard**
```
http://yourserver/setup-wizard.html
```

---

## Troubleshooting

### **Problem: "Setup already completed" Error**

**Cause:** `SetupCompleted` flag is `true`.

**Solution:**
- If **legitimate re-run needed** (test environment): Follow [Re-enabling Setup](#re-enabling-setup-advanced)
- If **production**: This is correct behavior. Create users via Admin panel.

---

### **Problem: setup-wizard.html Returns 404**

**Cause:** File was deleted (expected after setup).

**If setup NOT completed yet:**
1. Check database: `SELECT * FROM SystemConfig WHERE ConfigKey = 'SetupCompleted'`
2. If `'false'` or missing, restore wizard files from source code
3. Re-access the URL

**If setup completed:**
- This is **correct behavior**
- Login via `Index.html` instead

---

### **Problem: "Il nome utente deve essere di almeno 3 caratteri"**

**Cause:** Username too short.

**Solution:** Use at least 3 characters for username.

---

### **Problem: "Le password non corrispondono"**

**Cause:** Password and Confirm Password fields don't match exactly.

**Solution:**
- Re-type password carefully
- Watch for CAPS LOCK
- Copy-paste both fields (if desperate, but not recommended for security)

---

### **Problem: "Errore di rete durante la configurazione"**

**Cause:** Network/server error.

**Checks:**
1. **Server running?** Check IIS/Docker is running
2. **Database accessible?** Test SQL Server connection
3. **Backend handler exists?** Check `Services/Setup/CompleteSetup.ashx` exists
4. **Console errors?** Open browser Dev Tools (F12) → Console

**Solution:** Check server logs, fix the underlying issue, retry.

---

### **Problem: Wizard completes but cannot login**

**Cause:** User created but password issue.

**Solution:**
1. **Verify user exists:**
   ```sql
   SELECT * FROM Users;
   ```
2. **Check username** matches what you entered (case-sensitive?)
3. **Reset password via SQL** (if desperate):
   ```sql
   -- Generate new hash (example, use real BCrypt hash)
   UPDATE Users
   SET Password = '$2a$11$...' -- Real BCrypt hash of new password
   WHERE Username = 'admin';
   ```

---

### **Problem: Auto-deletion failed**

**Symptoms:** File still exists, but setup completed.

**Check:**
1. Navigate to `http://yourserver/setup-wizard.html`
2. If you see the form, files not deleted
3. If you get error "Setup already completed", files exist but wizard disabled (safe)

**Solution:**
- **Manually delete** the files (see [Manual Disabling](#manual-disabling-if-needed))
- Wizard is still disabled by flag, but deleting files adds security layer

---

## Best Practices

### **✅ Do's**

- ✅ **Run setup immediately** after deployment
- ✅ **Use a strong password** (12+ characters, mixed case, symbols)
- ✅ **Save credentials securely** (password manager)
- ✅ **Verify file deletion** after setup
- ✅ **Create additional users** right away (don't rely on single admin)
- ✅ **Backup database** after setup

### **❌ Don'ts**

- ❌ **Don't delay setup** (leaves system vulnerable)
- ❌ **Don't use weak passwords** (e.g., "password123")
- ❌ **Don't share admin password** (create separate accounts instead)
- ❌ **Don't skip verification** (always test login after setup)
- ❌ **Don't re-enable in production** (only for development/testing)

---

## Related Documentation

### **For Users:**
- [Quick Start Guide (IT)](../08-user-guides/USER_GUIDE_QUICKSTART_IT.md)
- [Setup Wizard Guide (IT)](SETUP_WIZARD_GUIDE_IT.md)

### **For Administrators:**
- [Settings Guide (EN)](SETTINGS_GUIDE_EN.md)
- [Deployment Documentation](../07-deployment/README.md)
- [Security Hardening](../07-deployment/SECURITY_HARDENING.md)
- [Troubleshooting](../07-deployment/TROUBLESHOOTING.md)

---

## Summary

The Setup Wizard is a **critical first step** in deploying Loginet:
- ✅ Creates initial admin account
- ✅ Secures the system (auto-deletion)
- ✅ One-time use (prevents abuse)
- ✅ Simple and user-friendly

**After completion:** Login, create users, and start using Loginet!

---

**[⬆ Back to top](#-setup-wizard-guide---loginet)**

**[🏠 Back to documentation index](../README.md)**
