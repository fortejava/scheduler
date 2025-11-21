# 🐳 Loginet - Docker Deployment Quick Start

**Version:** 2.0
**Docker Support:** Windows Containers + Linux Containers
**Last Updated:** November 21, 2025

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites

**Required:**
- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop) (version 4.0+)
- Windows 10/11 Professional or Enterprise (for Windows containers)
- At least 8GB RAM allocated to Docker
- 20GB free disk space

**Optional:**
- SQL Server Management Studio (for database access)
- Visual Studio Code with Docker extension

---

## 📦 Two Deployment Options

### **Option 1: Full Stack (App + Database)** ⭐ Recommended for Development

**What you get:**
- ASP.NET Web Forms application (Windows container)
- SQL Server 2022 (Linux container)
- Automatic database initialization
- Complete self-contained environment

**Command:**
```bash
docker-compose up -d
```

**Access:**
- Application: http://localhost:8080
- Database: localhost:1433 (user: sa, password: Password123!)

---

### **Option 2: App Only (External Database)** ⭐ Recommended for Production

**What you get:**
- ASP.NET Web Forms application only
- Connect to existing SQL Server (Azure SQL, on-premise, etc.)

**Command:**
```bash
docker-compose -f docker-compose.app-only.yml up -d
```

**Configure:** Edit `.env` file with your database connection

---

## 🎯 Step-by-Step Guide - Full Stack Deployment

### **Step 1: Clone Repository**
```bash
cd C:\Projects
git clone https://github.com/fortejava/scheduler.git
cd scheduler
```

### **Step 2: Switch Docker to Windows Containers**
```bash
# Right-click Docker Desktop tray icon
# → Switch to Windows containers...
# → Wait for restart
```

### **Step 3: Start Services**
```bash
docker-compose up -d
```

**Expected Output:**
```
Creating network "loginet-network" ... done
Creating volume "loginet-sqlserver-data" ... done
Creating loginet-sqlserver ... done
Creating loginet-webapp ... done
```

### **Step 4: Wait for Initialization (2-3 minutes)**
```bash
# Watch SQL Server logs
docker-compose logs -f sqlserver

# Look for: "SQL Server is now ready for client connections"
```

### **Step 5: Initialize Database**
```bash
# Create database
docker exec loginet-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Password123! -i /db-schema/init/01-create-database.sql

# Create schema (copy DB.sql first)
docker cp DB.sql loginet-sqlserver:/tmp/DB.sql
docker exec loginet-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Password123! -i /tmp/DB.sql

# Seed data
docker exec loginet-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Password123! -i /db-schema/init/03-seed-data.sql
```

### **Step 6: Access Application**
```bash
# Open browser
http://localhost:8080
```

**First-time Setup:**
1. Complete setup wizard
2. Create admin user
3. Start using the system

---

## 🎯 Step-by-Step Guide - App Only Deployment

### **Step 1: Create .env File**
```bash
# Create .env file in project root
DB_SERVER=your-sql-server.database.windows.net
DB_NAME=scheduler
DB_USER=your-username
DB_PASSWORD=YourStrongPassword!
APP_PORT=8080
```

### **Step 2: Prepare Database**
```bash
# Connect to your SQL Server
# Create database 'scheduler'
# Run DB.sql to create schema
# Run Database/Seeds/SeedStatuses.sql
```

### **Step 3: Start Application**
```bash
docker-compose -f docker-compose.app-only.yml up -d
```

### **Step 4: Access Application**
```bash
http://localhost:8080
```

---

## 🛠️ Common Commands

### **Service Management**
```bash
# Start all services
docker-compose up -d

# Stop all services (keep data)
docker-compose down

# Stop and remove data
docker-compose down -v

# Restart a service
docker-compose restart webapp

# Rebuild after code changes
docker-compose up -d --build webapp
```

### **Logs & Monitoring**
```bash
# View all logs
docker-compose logs -f

# View app logs only
docker-compose logs -f webapp

# View database logs only
docker-compose logs -f sqlserver

# Check service status
docker-compose ps

# Check health
docker inspect loginet-webapp | grep -A 10 Health
```

### **Database Operations**
```bash
# Connect to SQL Server
docker exec -it loginet-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Password123!

# Run SQL query
docker exec loginet-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Password123! -Q "SELECT * FROM scheduler.dbo.Users"

# Backup database
docker exec loginet-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Password123! -Q "BACKUP DATABASE scheduler TO DISK='/var/opt/mssql/backup/scheduler.bak'"

# Copy backup to host
docker cp loginet-sqlserver:/var/opt/mssql/backup/scheduler.bak ./backup/
```

### **Troubleshooting**
```bash
# Access container shell (Windows)
docker exec -it loginet-webapp powershell

# Access container shell (Linux)
docker exec -it loginet-sqlserver bash

# Check network connectivity
docker exec loginet-webapp powershell Test-NetConnection sqlserver -Port 1433

# View IIS logs
docker exec loginet-webapp powershell Get-Content C:\inetpub\logs\LogFiles\W3SVC1\*.log -Tail 50

# Reset everything
docker-compose down -v
docker-compose up -d --build
```

---

## ⚙️ Configuration

### **Environment Variables (.env file)**
```bash
# Database
DB_SERVER=sqlserver              # or host.docker.internal for host SQL Server
DB_NAME=scheduler
DB_USER=sa
DB_PASSWORD=Password123!         # ⚠️ Change in production!

# Application
APP_PORT=8080
TZ=Europe/Rome

# Optional
ASPNETCORE_ENVIRONMENT=Production
```

### **Port Mappings**
| Service | Container Port | Host Port | URL |
|---------|---------------|-----------|-----|
| Web App | 80 | 8080 | http://localhost:8080 |
| SQL Server | 1433 | 1433 | localhost:1433 |

---

## 🔒 Security Checklist

**Before Production Deployment:**

- [ ] Change SA_PASSWORD in docker-compose.yml (strong password!)
- [ ] Use Docker secrets for passwords (not environment variables)
- [ ] Enable HTTPS (configure SSL certificate)
- [ ] Create dedicated database user (not 'sa')
- [ ] Configure SQL Server firewall rules
- [ ] Update Web.Release.config with production settings
- [ ] Remove or secure diagnostic endpoints
- [ ] Enable Docker logging and monitoring
- [ ] Configure automated backups
- [ ] Test restore procedures

---

## 📊 Resource Requirements

### **Minimum (Development)**
- **CPU:** 2 cores
- **RAM:** 4GB
- **Disk:** 10GB

### **Recommended (Production)**
- **CPU:** 4 cores
- **RAM:** 8GB
- **Disk:** 50GB (with room for data growth)

### **Container Resources**
| Container | CPU | Memory |
|-----------|-----|--------|
| webapp | 2 cores | 2GB |
| sqlserver | 2 cores | 4GB |

---

## 🐛 Troubleshooting

### **"Cannot connect to database"**
```bash
# Check SQL Server is running
docker ps

# Check connectivity
docker exec loginet-webapp powershell Test-NetConnection sqlserver -Port 1433

# Verify password
echo $DB_PASSWORD

# Check SQL Server logs
docker logs loginet-sqlserver
```

### **"Container keeps restarting"**
```bash
# Check logs
docker logs loginet-webapp

# Check health
docker inspect loginet-webapp

# Exec into container (if running)
docker exec -it loginet-webapp powershell
```

### **"Port already in use"**
```bash
# Change port in docker-compose.yml
ports:
  - "9090:80"  # Use port 9090 instead of 8080

# Or stop conflicting service
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### **"Database not initialized"**
```bash
# Manually run init scripts
docker exec loginet-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Password123! -i /db-schema/init/01-create-database.sql

# Copy and run DB.sql
docker cp DB.sql loginet-sqlserver:/tmp/
docker exec loginet-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Password123! -i /tmp/DB.sql
```

---

## 📚 Additional Documentation

- **Detailed Deployment Guides:** See `docs/07-deployment/`
- **IIS Deployment:** `docs/07-deployment/IIS_DEPLOYMENT_GUIDE.md`
- **Docker Guide (Basic):** `docs/07-deployment/DOCKER_DEPLOYMENT_GUIDE_BASIC.md`
- **Docker Guide (Detailed):** `docs/07-deployment/DOCKER_DEPLOYMENT_GUIDE_DETAILED.md`
- **Troubleshooting:** `docs/07-deployment/TROUBLESHOOTING.md`

---

## 🆘 Getting Help

**Issues?**
1. Check `docker-compose logs`
2. Review troubleshooting section above
3. See detailed docs in `docs/07-deployment/`
4. Check GitHub issues: https://github.com/fortejava/scheduler/issues

**For Production Deployment:**
- Review security checklist above
- Read `docs/07-deployment/PRODUCTION_CHECKLIST.md`
- Configure monitoring and backups
- Test disaster recovery procedures

---

**Happy Deploying! 🚀**

*Last Updated: November 21, 2025*
*Loginet Development Team*
