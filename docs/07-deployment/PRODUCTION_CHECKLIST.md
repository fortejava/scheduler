# ✅ Production Deployment Checklist

**Pre-Deployment Verification for Production Environments**

**Last Updated:** November 21, 2025

---

## 🔒 SECURITY (Critical)

- [ ] **SSL/HTTPS configured** and enforced
- [ ] **Connection strings encrypted** (not plain text in Web.config)
- [ ] **SQL Server uses strong passwords** (16+ characters)
- [ ] **Firewall configured** (only necessary ports open)
- [ ] **IIS security headers enabled** (X-Frame-Options, CSP, HSTS)
- [ ] **SQL injection prevention verified** (Entity Framework parameterized queries)
- [ ] **XSS protection enabled** (ValidateRequest + output encoding)
- [ ] **Secrets managed properly** (Azure Key Vault or Docker secrets)
- [ ] **Default accounts disabled/removed** (sa account, default app pool)
- [ ] **Diagnostic endpoints removed/secured** (HealthCheck requires auth in production)

---

## 🗄️ DATABASE

- [ ] **Database backup configured** (automated daily backups)
- [ ] **Backup tested** (restore procedure verified)
- [ ] **Recovery model set** (FULL for production)
- [ ] **Transaction log management** configured
- [ ] **Database user created** (dedicated user, not sa)
- [ ] **Permissions granted** (least privilege principle)
- [ ] **Connection pooling configured**
- [ ] **Seed data loaded** (Roles, Status tables)

---

## 🖥️ WEB SERVER (IIS)

- [ ] **IIS hardened** (unnecessary modules removed)
- [ ] **Application pool configured** (.NET 4.0, Integrated Pipeline)
- [ ] **Application pool identity** set (ApplicationPoolIdentity or dedicated account)
- [ ] **Folder permissions correct** (IIS_IUSRS read/execute)
- [ ] **Debug mode disabled** (compilation debug="false")
- [ ] **Custom errors enabled** (customErrors mode="On")
- [ ] **Detailed errors hidden** from users
- [ ] **Request filtering configured** (file upload limits, etc.)
- [ ] **Compression enabled** (Gzip for performance)

---

## 🐳 DOCKER (If Using Containers)

- [ ] **Production docker-compose.yml** configured
- [ ] **Environment variables secured** (use .env file, not committed to Git)
- [ ] **Volumes configured** for data persistence
- [ ] **Resource limits set** (CPU, memory)
- [ ] **Health checks configured** and tested
- [ ] **Logging configured** (centralized logging driver)
- [ ] **Network isolation** implemented
- [ ] **Secrets management** (Docker secrets, not env vars for passwords)
- [ ] **Images scanned** for vulnerabilities
- [ ] **Registry configured** (private registry for production images)

---

## 📊 MONITORING & LOGGING

- [ ] **Application logging configured** (errors, warnings)
- [ ] **IIS logs reviewed** and rotated
- [ ] **SQL Server logs monitored**
- [ ] **Health check endpoint** accessible to monitoring
- [ ] **Monitoring tool configured** (Application Insights, Datadog, etc.)
- [ ] **Alerts configured** for critical errors
- [ ] **Performance counters** monitored (CPU, memory, requests/sec)
- [ ] **Disk space monitoring** (database growth, log files)

---

## ⚡ PERFORMANCE

- [ ] **Database indexes optimized**
- [ ] **SQL queries reviewed** (no N+1 queries)
- [ ] **Connection pooling enabled**
- [ ] **Static content caching** configured (CSS, JS, images)
- [ ] **Output caching** considered for appropriate pages
- [ ] **CDN configured** for static assets (if applicable)
- [ ] **Load testing performed** (expected concurrent users)

---

## 🧪 TESTING

- [ ] **All features tested** in staging environment
- [ ] **User login/logout** tested
- [ ] **Invoice CRUD operations** tested
- [ ] **Customer CRUD operations** tested
- [ ] **Role-based access** verified (Admin, User, Visitor)
- [ ] **Error handling tested** (database down, invalid input)
- [ ] **Browser compatibility** tested (Chrome, Firefox, Edge)
- [ ] **Mobile responsiveness** tested

---

## 📋 DOCUMENTATION

- [ ] **Deployment documented** (steps followed)
- [ ] **Configuration documented** (server names, ports, etc.)
- [ ] **Credentials documented** securely (password manager)
- [ ] **Runbook created** (startup, shutdown, common issues)
- [ ] **Rollback procedure documented**
- [ ] **Support contacts** identified

---

## 💾 BACKUP & RECOVERY

- [ ] **Full backup taken** before deployment
- [ ] **Backup schedule configured** (daily automated)
- [ ] **Backup storage** off-site or separate location
- [ ] **Restore tested** (verify backups work)
- [ ] **Disaster recovery plan** documented
- [ ] **RTO/RPO defined** (Recovery Time/Point Objectives)

---

## 🔄 POST-DEPLOYMENT

- [ ] **Smoke tests passed** (basic functionality verified)
- [ ] **Health check returns 200 OK**
- [ ] **Logs reviewed** for errors
- [ ] **Performance baseline** established
- [ ] **Users notified** of deployment
- [ ] **Support team briefed**
- [ ] **Monitoring confirmed** active

---

## 🚨 ROLLBACK PLAN

- [ ] **Rollback procedure tested** in staging
- [ ] **Previous version backup** available
- [ ] **Rollback script ready** (scripts/rollback.ps1)
- [ ] **Database rollback plan** (restore or migration rollback)
- [ ] **Rollback triggers defined** (what constitutes failed deployment)

---

## ✅ SIGN-OFF

**Deployment approved by:**
- [ ] Technical Lead: _________________ Date: _______
- [ ] Security Review: _________________ Date: _______
- [ ] Operations: _________________ Date: _______
- [ ] Business Owner: _________________ Date: _______

---

**Deployment Date:** __________________
**Environment:** Production
**Version:** 2.0

---

**[⬅ Back to Deployment Documentation](README.md)**
