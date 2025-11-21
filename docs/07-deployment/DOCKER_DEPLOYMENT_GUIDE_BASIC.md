# 🐳 Docker Deployment Guide - Level 1 (Basic)

**Loginet Invoice Management System - Quick Docker Deployment**

**Time Required:** 10-20 minutes
**Skill Level:** Intermediate (Docker knowledge)
**Last Updated:** November 21, 2025

---

## 📋 Prerequisites

- [ ] **Docker Desktop for Windows** (version 4.0+) installed
- [ ] **Windows containers enabled** (for web app)
- [ ] **8GB RAM** minimum allocated to Docker
- [ ] **20GB disk space** available
- [ ] **Project files** downloaded

---

## 🚀 Quick Start - Two Options

### **Option 1: Full Stack (App + Database)** ⭐ Recommended

**What you get:** Complete system in containers (app + SQL Server)

**Deploy:**
```bash
cd C:\path\to\scheduler
docker-compose up -d
```

**Wait for startup (2-3 minutes):**
```bash
docker-compose logs -f
# Wait for: "SQL Server is now ready for client connections"
```

**Initialize database:**
```bash
# Copy DB.sql to container
docker cp DB.sql loginet-sqlserver:/tmp/

# Run schema script
docker exec loginet-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Password123! -i /tmp/DB.sql

# Run seed data
docker exec loginet-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Password123! -i /db-schema/init/03-seed-data.sql
```

**Access:**
- Application: http://localhost:8080
- Database: localhost:1433 (user: sa, pass: Password123!)

---

### **Option 2: App Only (External Database)**

**What you get:** App container only, connects to your SQL Server

**Step 1: Create .env file:**
```bash
DB_SERVER=your-sql-server
DB_NAME=scheduler
DB_USER=sa
DB_PASSWORD=YourPassword
APP_PORT=8080
```

**Step 2: Deploy database:**
```bash
# Run on your SQL Server
# Execute DB.sql
# Execute Database/Seeds/SeedStatuses.sql
```

**Step 3: Deploy app:**
```bash
docker-compose -f docker-compose.app-only.yml up -d
```

**Access:** http://localhost:8080

---

## 🛠️ Common Commands

**View logs:**
```bash
docker-compose logs -f
docker-compose logs -f webapp
docker-compose logs -f sqlserver
```

**Stop services:**
```bash
docker-compose down        # Stop and remove containers (keep data)
docker-compose down -v     # Stop and remove containers + data
```

**Restart services:**
```bash
docker-compose restart webapp
docker-compose restart sqlserver
```

**Rebuild after changes:**
```bash
docker-compose up -d --build
```

---

## 🐛 Quick Troubleshooting

**"Cannot connect to database"**
```bash
# Test connectivity
docker exec loginet-webapp powershell Test-NetConnection sqlserver -Port 1433

# Check SQL Server logs
docker logs loginet-sqlserver
```

**"Container keeps restarting"**
```bash
# Check logs
docker logs loginet-webapp

# Check health
docker inspect loginet-webapp | grep -A 10 Health
```

**"Port already in use"**
```bash
# Change port in docker-compose.yml
ports:
  - "9090:80"  # Use different port
```

**"Database not initialized"**
```bash
# Manually run init scripts (see Quick Start above)
```

---

## ✅ Verification

After deployment:
- [ ] Containers running: `docker ps`
- [ ] App accessible: http://localhost:8080
- [ ] Database accessible: Connect with SSMS to localhost:1433
- [ ] Health check OK: http://localhost:8080/Services/HealthCheck.ashx
- [ ] Can login via setup wizard

---

## 📚 Additional Resources

- **Quick Start:** [README.Docker.md](../../README.Docker.md)
- **Detailed Guide:** [DOCKER_DEPLOYMENT_GUIDE_DETAILED.md](DOCKER_DEPLOYMENT_GUIDE_DETAILED.md)
- **Troubleshooting:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Docker Compose Reference:** [docker-compose.yml](../../docker-compose.yml)

---

**[⬅ Back to Deployment Documentation](README.md)**
