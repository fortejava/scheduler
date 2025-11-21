# ⚙️ Setup & Settings - Loginet

**System Configuration and Initial Setup**

This folder contains documentation for setup wizard and system settings management.

---

## 📖 Available Documentation

### **Setup Wizard Documentation**

#### **Setup Wizard Guide (English)**
- **File:** [SETUP_WIZARD_GUIDE_EN.md](SETUP_WIZARD_GUIDE_EN.md)
- **Audience:** System administrators, technical staff
- **Reading Time:** ~45 minutes
- **Language:** English
- **Purpose:** Complete technical guide for first-time setup

**Topics Covered:**
- What is the Setup Wizard and when it runs
- Prerequisites (database, application, network)
- Step-by-step setup process
- Behind-the-scenes technical details (C# code examples)
- Security features (4 layers explained)
- Troubleshooting (8+ scenarios)
- Re-enabling setup for development/testing
- Best practices

**Technical Depth:** ⭐⭐⭐⭐⭐ (Very detailed, includes code examples)

---

#### **Guida Setup Wizard (Italiano)**
- **File:** [SETUP_WIZARD_GUIDE_IT.md](SETUP_WIZARD_GUIDE_IT.md)
- **Audience:** Amministratori di sistema, utenti italiani
- **Reading Time:** ~30 minutes
- **Language:** Italian
- **Purpose:** Guida per la configurazione iniziale

**Argomenti Trattati:**
- Cos'è il Setup Wizard e quando si esegue
- Prerequisiti (database, applicazione, rete)
- Configurazione passo-passo
- Funzionalità di sicurezza
- Risoluzione problemi comuni
- Disabilitazione wizard
- Best practices

**Technical Depth:** ⭐⭐⭐ (User-friendly, less technical than English version)

---

### **Settings Documentation**

#### **Settings Guide (English)**
- **File:** [SETTINGS_GUIDE_EN.md](SETTINGS_GUIDE_EN.md)
- **Audience:** System administrators, developers
- **Reading Time:** ~30 minutes
- **Language:** English
- **Purpose:** Manage SystemConfig table and application settings

**Topics Covered:**
- SystemConfig table structure
- Available settings (SetupCompleted, MaintenanceMode, SessionTimeout, etc.)
- Managing settings (3 methods: SSMS, UI, Programmatic)
- Security considerations
- Best practices
- Common configuration scenarios
- Helper code examples

**Technical Depth:** ⭐⭐⭐⭐ (Technical, includes SQL and C# examples)

---

#### **Guida Impostazioni (Italiano)**
- **File:** [SETTINGS_GUIDE_IT.md](SETTINGS_GUIDE_IT.md)
- **Audience:** Amministratori di sistema
- **Reading Time:** ~25 minutes
- **Language:** Italian
- **Purpose:** Gestire la tabella SystemConfig e le impostazioni

**Argomenti Trattati:**
- Struttura tabella SystemConfig
- Impostazioni disponibili
- Gestire le impostazioni (SSMS, UI, Programmatico)
- Considerazioni di sicurezza
- Best practices
- Scenari comuni

**Technical Depth:** ⭐⭐⭐ (Technical but accessible)

---

## 🎯 Quick Navigation

### **First-Time Setup**
You're deploying Loginet for the first time:
1. Read [SETUP_WIZARD_GUIDE_EN.md](SETUP_WIZARD_GUIDE_EN.md) (English) or [SETUP_WIZARD_GUIDE_IT.md](SETUP_WIZARD_GUIDE_IT.md) (Italian)
2. Follow step-by-step setup process
3. Verify setup completion
4. Create additional users

### **Managing Settings**
You need to configure system settings:
1. Read [SETTINGS_GUIDE_EN.md](SETTINGS_GUIDE_EN.md) (English) or [SETTINGS_GUIDE_IT.md](SETTINGS_GUIDE_IT.md) (Italian)
2. Learn about available settings
3. Choose management method (SSMS recommended)
4. Update settings as needed

### **Troubleshooting Setup**
Setup wizard not working:
- Check [SETUP_WIZARD_GUIDE_EN.md](SETUP_WIZARD_GUIDE_EN.md) - Section: "Troubleshooting" (8+ scenarios)
- Verify prerequisites (database deployed, connection string, network access)
- Check SystemConfig.SetupCompleted flag

### **Re-enabling Setup (Dev/Test)**
You want to re-run setup wizard:
- See [SETUP_WIZARD_GUIDE_EN.md](SETUP_WIZARD_GUIDE_EN.md) - Section: "Re-enabling Setup (Advanced)"
- ⚠️ **WARNING:** Development/Testing only, NOT for production

---

## 📊 Documentation Statistics

| File | Lines | Language | Audience |
|------|-------|----------|----------|
| SETUP_WIZARD_GUIDE_EN.md | ~850 | English | Admins (Technical) |
| SETUP_WIZARD_GUIDE_IT.md | ~640 | Italian | Admins (User-friendly) |
| SETTINGS_GUIDE_EN.md | ~550 | English | Admins/Devs |
| SETTINGS_GUIDE_IT.md | ~480 | Italian | Admins |
| **TOTAL** | **~2,520** | - | - |

---

## 🔐 Security Features Documented

### **Setup Wizard Security (4 Layers)**

**Layer 1: One-Time Use**
- `SetupCompleted` flag prevents re-running
- Protects against unauthorized admin account creation

**Layer 2: Automatic File Deletion**
- `setup-wizard.html` deleted after completion
- `setup-wizard.js` deleted after completion
- Closes attack vector permanently

**Layer 3: BCrypt Password Hashing**
- One-way hash (cannot reverse engineer)
- Salted (same password = different hash)
- Slow by design (brute-force resistant)

**Layer 4: Controlled Anonymous Access**
- Only works when `SetupCompleted = false`
- Creates only one admin user
- Self-disables after first use

---

## 🔧 SystemConfig Settings

### **Current Settings**

| Setting | Type | Status | Priority |
|---------|------|--------|----------|
| **SetupCompleted** | Boolean | ✅ Implemented | Critical |
| MaintenanceMode | Boolean | 📝 Recommended | High |
| SessionTimeout | Integer | 📝 Recommended | High |
| MaxLoginAttempts | Integer | 📝 Recommended | Medium |
| ApplicationVersion | String | 📝 Recommended | Low |
| CompanyName | String | 📝 Optional | Low |
| DateFormat | String | 📝 Optional | Low |
| Currency | String | 📝 Optional | Low |

### **Setting Management Methods**

**Method 1: SQL Server Management Studio (SSMS)**
- Best for: Manual configuration, one-time changes
- Pros: Direct database access, no UI needed
- Cons: Requires SQL knowledge

**Method 2: Admin UI (Future)**
- Status: Not implemented
- Best for: Non-technical admins
- Pros: User-friendly, validation built-in
- Cons: Needs to be developed

**Method 3: Programmatic Access**
- Best for: Application logic, dynamic configuration
- Pros: Type-safe, transactional
- Cons: Requires code deployment

---

## 🔗 Related Documentation

### **For Users**
- [User Guides](../08-user-guides/README.md) - End user documentation
- [FAQ (IT)](../08-user-guides/FAQ_IT.md) - Common questions
- [Troubleshooting (IT)](../08-user-guides/TROUBLESHOOTING_USERS_IT.md) - User problems

### **For Administrators**
- [Deployment Guide](../07-deployment/README.md) - Deploy Loginet
- [Security Hardening](../07-deployment/SECURITY_HARDENING.md) - Secure the system
- [Troubleshooting](../07-deployment/TROUBLESHOOTING.md) - System issues

### **For Developers**
- [Database Schema](../05-database/DATABASE_SCHEMA.md) - SystemConfig table structure
- [Backend Documentation](../02-backend/README.md) - CompleteSetup.ashx handler
- [API Documentation](../03-api/README.md) - Settings endpoints (future)

---

## 💡 Documentation Highlights

### **Industry-Leading Depth**
The Setup Wizard documentation is exceptionally comprehensive:
- ✅ **850+ lines** of detailed English documentation
- ✅ **C# code examples** from actual implementation
- ✅ **Behind-the-scenes** explanations of how it works
- ✅ **Security analysis** of 4 protection layers
- ✅ **8+ troubleshooting scenarios** with solutions
- ✅ **Re-enabling guide** for development environments

### **Bilingual Support**
Both English and Italian documentation available:
- ✅ **English:** Technical depth for international teams
- ✅ **Italian:** User-friendly for Italian administrators
- ✅ **Natural language:** Not machine translated
- ✅ **Consistent structure:** Easy to navigate both versions

---

## 📋 Quick Reference

### **Setup Wizard Files**
```
WebSite/
├── setup-wizard.html           # Frontend (auto-deleted after setup)
├── assets/js/setup-wizard.js   # JavaScript (auto-deleted after setup)
└── Services/Setup/
    └── CompleteSetup.ashx      # Backend handler
```

### **SystemConfig Table**
```sql
SELECT * FROM SystemConfig;

-- Example output:
-- ConfigID | ConfigKey       | ConfigValue | Description
-- ---------|-----------------|-------------|----------------------------------
-- 1        | SetupCompleted  | true        | First-time setup wizard status
```

### **Check Setup Status**
```sql
-- Check if setup completed
SELECT ConfigValue
FROM SystemConfig
WHERE ConfigKey = 'SetupCompleted';

-- Result: 'true' = completed, 'false' or NULL = not completed
```

---

## 🚀 Getting Started Checklist

### **Initial Deployment**
- [ ] Database deployed (tables created, seed data loaded)
- [ ] Application deployed (IIS/Docker running)
- [ ] Connection string configured
- [ ] Network access verified
- [ ] Navigate to `http://yourserver/setup-wizard.html`
- [ ] Complete setup wizard
- [ ] Verify `setup-wizard.html` returns 404 (deleted)
- [ ] Login with admin credentials
- [ ] Create additional users
- [ ] Backup database

### **After Setup**
- [ ] Verify `SetupCompleted = 'true'` in database
- [ ] Test login with admin account
- [ ] Create test invoice
- [ ] Create test customer
- [ ] Configure additional settings (if needed)
- [ ] Document admin credentials securely

---

## 📞 Need Help?

**Setup Issues?**
- Check troubleshooting section in [SETUP_WIZARD_GUIDE_EN.md](SETUP_WIZARD_GUIDE_EN.md)
- Common issues: 404 errors, database connection, permission problems

**Settings Issues?**
- Review [SETTINGS_GUIDE_EN.md](SETTINGS_GUIDE_EN.md)
- Common tasks: Update timeout, enable maintenance mode, change company name

**Still Stuck?**
- Check [Deployment Troubleshooting](../07-deployment/TROUBLESHOOTING.md)
- Review deployment logs
- Verify prerequisites

---

**[🏠 Back to main documentation](../README.md)**
