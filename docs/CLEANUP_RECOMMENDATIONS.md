# 🗑️ File Cleanup Recommendations - Loginet

**Project Cleanup Analysis**
**Date:** November 21, 2025
**Purpose:** Identify files that can be safely deleted

---

## 📊 Summary

**Files Recommended for Deletion:**
- ✅ **Safe to Delete:** 8 files (~15KB)
- ⚠️ **Consider Deleting:** 5 files (~30KB)
- ❌ **Keep (Important):** All other files

**Total Space Saved:** ~45KB (minimal - mainly for organization)

---

## ✅ SAFE TO DELETE (Recommended)

### **1. Root Directory - Experimental Files**

#### **Experimental_Argon2_PasswordHasher.cs**
- **Location:** `C:\Users\Drako\Desktop\Z-Experiment-Scheduler\scheduler\Experimental_Argon2_PasswordHasher.cs`
- **Size:** ~10KB
- **Why delete:** Experimental code, not used in production
- **Current:** BCrypt is used (PasswordHasher.cs)
- **Action:** ✅ DELETE

#### **Experimental_PBKDF2_PasswordHasher.cs**
- **Location:** `C:\Users\Drako\Desktop\Z-Experiment-Scheduler\scheduler\Experimental_PBKDF2_PasswordHasher.cs`
- **Size:** ~14KB
- **Why delete:** Experimental code, not used in production
- **Current:** BCrypt is used (PasswordHasher.cs)
- **Action:** ✅ DELETE

---

### **2. Root Directory - Temporary/Utility Files**

#### **FILES_TO_COPY.txt**
- **Location:** `C:\Users\Drako\Desktop\Z-Experiment-Scheduler\scheduler\FILES_TO_COPY.txt`
- **Size:** ~600 bytes
- **Why delete:** Temporary file, likely used during development
- **Purpose:** List of files to copy (one-time use)
- **Action:** ✅ DELETE (after verifying content is not needed)

#### **nul**
- **Location:** `C:\Users\Drako\Desktop\Z-Experiment-Scheduler\scheduler\nul`
- **Size:** 0 bytes
- **Why delete:** Empty file, likely created by accident
- **Purpose:** None (empty)
- **Action:** ✅ DELETE

---

### **3. Documentation - Old Versions**

#### **docs/06-maintenance/FILES_CHANGED_COMPREHENSIVE_UPDATE_DRAFT.md** (in Archive)
- **Location:** `docs/archive/FILES_CHANGED_COMPREHENSIVE_UPDATE_DRAFT.md`
- **Size:** ~925 lines
- **Why delete:** Draft version, superseded by final version
- **Current:** `docs/06-maintenance/FILES_CHANGED.md` exists
- **Action:** ⚠️ MOVE TO ARCHIVE or DELETE (already in archive folder)

---

### **4. Database - Old Seed Files**

#### **Database/Seeds/SeedStatuses_OLD.sql**
- **Location:** `C:\Users\Drako\Desktop\Z-Experiment-Scheduler\scheduler\Database\Seeds\SeedStatuses_OLD.sql`
- **Size:** Unknown
- **Why delete:** Old version, superseded by current seed files
- **Current:** New seed files exist
- **Action:** ✅ MOVE TO ARCHIVE (Database/Archive/)

#### **Database/Archive/DB_OLD_SCHEMA.sql**
- **Location:** `C:\Users\Drako\Desktop\Z-Experiment-Scheduler\scheduler\Database\Archive\DB_OLD_SCHEMA.sql`
- **Size:** Unknown
- **Why keep in archive:** Historical reference
- **Action:** ❌ KEEP (already in Archive)

---

## ⚠️ CONSIDER DELETING (Case-by-Case)

### **1. PrecompiledWeb Folder**

#### **Entire PrecompiledWeb/ Folder**
- **Location:** `C:\Users\Drako\Desktop\Z-Experiment-Scheduler\scheduler\PrecompiledWeb\`
- **Size:** Large (many MB)
- **Why delete:** Compiled output, can be regenerated
- **Purpose:** Build output from Visual Studio
- **Action:** ⚠️ DELETE (if not in production)
- **Regenerate:** Next build will recreate

**How to delete:**
```bash
rd /s /q "C:\Users\Drako\Desktop\Z-Experiment-Scheduler\scheduler\PrecompiledWeb"
```

**⚠️ Warning:** Only delete if:
- You're not currently using the compiled version
- You can rebuild from source

---

### **2. NuGet Packages - License/Readme Files**

#### **packages/**/LICENSE.TXT, README.md, THIRD-PARTY-NOTICES.TXT**
- **Location:** Various in `packages/` folder
- **Size:** Small (few KB each)
- **Why delete:** Duplicates, package metadata
- **Action:** ⚠️ KEEP (part of NuGet package structure)
- **Note:** NuGet restores these automatically

**Recommendation:** ❌ DON'T DELETE (part of dependency management)

---

### **3. Old Backup Files**

#### **WebSite/Services/Login.ashx.backup**
- **Location:** `C:\Users\Drako\Desktop\Z-Experiment-Scheduler\scheduler\WebSite\Services\Login.ashx.backup`
- **Size:** Unknown
- **Why delete:** Backup file, should be in version control
- **Action:** ⚠️ DELETE (if committed to Git)

**Check first:**
```bash
git log WebSite/Services/Login.ashx
```
If history exists in Git, safe to delete backup.

#### **WebSite/Services/Login.ashx.backup-before-account-display-2025-11-15**
- **Location:** Similar to above
- **Action:** ⚠️ DELETE (if committed to Git)

#### **WebSite/assets/js/invoices.js.backup***
- **Location:** Multiple backup files
- **Action:** ⚠️ DELETE (if committed to Git)

**All *.backup files:**
```bash
# Find all .backup files
find . -name "*.backup*" -type f
```

---

### **4. Documentation Drafts**

#### **docs/06-maintenance/DOCUMENTATION_UPDATE_PLAN.md**
- **Location:** `docs/06-maintenance/DOCUMENTATION_UPDATE_PLAN.md`
- **Size:** Unknown
- **Why keep:** Planning document, useful reference
- **Action:** ❌ KEEP (unless obsolete)

---

## ❌ DO NOT DELETE (Important Files)

### **Configuration Files**
- ✅ `Web.config` - Application configuration
- ✅ `Web.Release.config` - Production transformation
- ✅ `.gitignore` - Git configuration
- ✅ `.dockerignore` - Docker build optimization
- ✅ `packages.config` - NuGet dependencies

### **Documentation**
- ✅ `README.md` - Main project README
- ✅ `README.Docker.md` - Docker quick start
- ✅ All `docs/**/*.md` files - Project documentation

### **Database Files**
- ✅ `DB.sql` - Current database schema
- ✅ `Database/docker-init/*.sql` - Docker initialization
- ✅ `Database/Seeds/*.sql` - Seed data (except _OLD)
- ✅ `Database/Archive/*` - Historical backups (keep as archive)

### **Source Code**
- ✅ All `.cs`, `.html`, `.js`, `.css` files in use
- ✅ `*.csproj` files - Project configuration
- ✅ `*.sln` files - Solution configuration

---

## 🚀 Cleanup Actions - Step by Step

### **Step 1: Delete Experimental Files**
```bash
# Navigate to project root
cd "C:\Users\Drako\Desktop\Z-Experiment-Scheduler\scheduler"

# Delete experimental password hashers
del Experimental_Argon2_PasswordHasher.cs
del Experimental_PBKDF2_PasswordHasher.cs
```

### **Step 2: Delete Temporary Files**
```bash
# Delete temporary utility file
del FILES_TO_COPY.txt

# Delete empty file
del nul
```

### **Step 3: Clean Backup Files** (Optional)
```bash
# Find all backup files
dir /S /B *.backup

# Review list, then delete each
del "path\to\file.backup"
```

### **Step 4: Move Old Database Files**
```bash
# Move old seed file to archive
move "Database\Seeds\SeedStatuses_OLD.sql" "Database\Archive\"
```

### **Step 5: Delete PrecompiledWeb** (Optional - Only if not needed)
```bash
# ⚠️ Only if you can rebuild!
rd /s /q PrecompiledWeb
```

---

## 📋 Verification Checklist

After cleanup, verify:
- [ ] Project still compiles (`MSBuild` succeeds)
- [ ] Application still runs
- [ ] No broken references
- [ ] Git repository clean (`git status`)
- [ ] Docker build still works (if using Docker)

---

## 💾 Before You Delete - Backup!

**Create backup before deleting:**
```bash
# Create backup folder
mkdir "C:\Backups\Loginet_Cleanup_$(Get-Date -Format 'yyyyMMdd')"

# Copy files to backup before deleting
copy Experimental_*.cs "C:\Backups\Loginet_Cleanup_$(Get-Date -Format 'yyyyMMdd')\"
copy *.backup "C:\Backups\Loginet_Cleanup_$(Get-Date -Format 'yyyyMMdd')\"
```

---

## 🎯 Cleanup Priority

### **Priority 1 (Do Now)**
1. ✅ Delete `Experimental_Argon2_PasswordHasher.cs`
2. ✅ Delete `Experimental_PBKDF2_PasswordHasher.cs`
3. ✅ Delete `nul` (empty file)
4. ✅ Delete `FILES_TO_COPY.txt`

### **Priority 2 (Review & Delete)**
1. ⚠️ Move `SeedStatuses_OLD.sql` to Archive
2. ⚠️ Delete `.backup` files (after Git verification)

### **Priority 3 (Optional)**
1. ⚠️ Delete `PrecompiledWeb/` (if not needed)

---

## 📊 Space Saved Estimate

| Category | Files | Size |
|----------|-------|------|
| Experimental Code | 2 | ~24KB |
| Temporary Files | 2 | ~600 bytes |
| Backup Files | ~5 | ~10-20KB |
| Old SQL Files | 1 | ~5KB |
| **Total (Minimal)** | **~10** | **~45KB** |
| PrecompiledWeb (optional) | Many | **~50-200MB** |

**Note:** Main space savings come from PrecompiledWeb if deleted.

---

## ✅ Final Recommendation

**Definitely Delete (Safe):**
- `Experimental_Argon2_PasswordHasher.cs`
- `Experimental_PBKDF2_PasswordHasher.cs`
- `nul`
- `FILES_TO_COPY.txt`

**Consider Deleting (Review First):**
- `*.backup` files (if in Git)
- `SeedStatuses_OLD.sql` (move to Archive)
- `PrecompiledWeb/` folder (only if not needed)

**Keep Everything Else:**
- All current source code
- All documentation (docs/)
- All database files (except _OLD)
- All configuration files

---

## 📞 Questions?

**Not sure if a file is needed?**
1. Check if it's referenced in code (`grep -r "filename"`)
2. Check Git history (`git log -- filename`)
3. Check if it's imported/used
4. **When in doubt, KEEP IT** (or move to Archive)

---

**[⬆ Back to top](#-file-cleanup-recommendations---loginet)**

**[🏠 Back to main documentation](README.md)**
