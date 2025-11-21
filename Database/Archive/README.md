# Database Archive

**Purpose**: Historical database files and executed migrations

---

## Contents

### Backups
- **DB_BACKUP_20251111.sql** - Database backup from 2025-11-11 21:26
- **DB_OLD_SCHEMA.sql** - Previous DB.sql version (before 2025-11-21 correction)

### Executed Migrations
- **001_Add_RBAC_3Roles.sql** - RBAC migration (executed 2025-11-11)
- **001_Add_RBAC_3Roles_ROLLBACK.sql** - Rollback script for RBAC
- **changingSessionTokenLenth.sql** - Session token length change (executed ~2025-11)

---

## Important Notes

1. **Do NOT re-execute** these scripts - they have already been applied to the database
2. **Backups** are for historical reference only
3. **Migrations** are kept for audit trail and documentation
4. Files in this folder represent the evolution of the database schema

---

## Cleanup Policy

Archive files may be deleted after:
- ✅ 6 months with no references
- ✅ Confirmed no audit/compliance requirements
- ✅ Team consensus

---

**Last Updated**: 2025-11-21
