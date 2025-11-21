# 🔧 Maintenance Documentation

**Maintenance tracking and investigations**

---

## 📚 Documents in This Section

### [FILES_CHANGED.md](FILES_CHANGED.md)
Comprehensive list of modified files
- Backend changes (C# files)
- Frontend changes (JavaScript, CSS)
- Database changes
- Configuration changes
- Change tracking for auditing

### [INVESTIGATION_REPORT.md](INVESTIGATION_REPORT.md)
General investigation reports
- Problem analysis
- Root cause investigations
- Solution proposals
- Implementation notes

### [DATABASE_INVESTIGATION_REPORT.md](DATABASE_INVESTIGATION_REPORT.md) ⭐ NEW (2025-11-21)
Complete database investigation and SQL file audit
- Interrogated SQL Server database 'scheduler'
- Verified actual schema vs documentation
- Audited all 19 SQL files
- Categorized files by purpose and status
- Entity Framework model verification
- **Lines**: 850+
- **Result**: Database healthy, file organization improved

### [DATABASE_REORGANIZATION_SUMMARY.md](DATABASE_REORGANIZATION_SUMMARY.md) ⭐ NEW (2025-11-21)
Execution summary of database file reorganization
- DB.sql regenerated from actual schema
- SQL files moved to organized folders (Archive/, Seeds/, Test/, Utilities/)
- 5 deprecated files deleted
- 2 scripts improved (SeedStatuses.sql, Delete_Sessions_Users.sql)
- **Lines**: 420+
- **Result**: Professional organization, 100% schema accuracy

### [DOCUMENTATION_UPDATE_PLAN.md](DOCUMENTATION_UPDATE_PLAN.md) ⭐ NEW (2025-11-21)
Documentation update plan (post database reorganization)
- Investigation of all .md files
- Identified files requiring updates
- Phased execution strategy
- Detailed update instructions
- **Lines**: 600+
- **Status**: Execution in progress

---

**[⬅ Back to Documentation Index](../README.md)**
