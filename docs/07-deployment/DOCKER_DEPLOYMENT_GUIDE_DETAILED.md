# 🐳 Docker Deployment Guide - Level 2 (Detailed)

**Comprehensive Docker Deployment for Production**

**Time Required:** 1-2 hours
**Skill Level:** Intermediate to Advanced
**Last Updated:** November 21, 2025

---

## 📚 Complete Docker Deployment Guide

This detailed guide covers **production-ready containerized deployment** with security, monitoring, and best practices.

### **What This Guide Includes:**
- Complete Docker setup for Windows/Linux
- Windows containers explained
- docker-compose deep dive
- Networking and volumes
- Secrets management
- Production configuration
- Monitoring and logging
- Comprehensive troubleshooting

---

## 📖 Guide Sections

### **Part 1: Docker Setup**
- [Install Docker Desktop](#install-docker)
- [Windows Containers vs Linux Containers](#container-types)
- [Resource Allocation](#resources)

### **Part 2: Understanding the Stack**
- [Dockerfile Explained](#dockerfile-explained)
- [docker-compose.yml Explained](#docker-compose-explained)
- [Network Architecture](#networking)
- [Volume Management](#volumes)

### **Part 3: Deployment Options**
- [Option 1: Full Stack (App + DB)](#full-stack)
- [Option 2: App Only (External DB)](#app-only)

### **Part 4: Configuration**
- [Environment Variables](#environment-variables)
- [Secrets Management](#secrets)
- [SSL/TLS Configuration](#ssl)

### **Part 5: Production Deployment**
- [Pre-Deployment Checklist](PRODUCTION_CHECKLIST.md)
- [Build and Deploy](#deployment)
- [Health Checks](#health-checks)
- [Monitoring](#monitoring)

### **Part 6: Security**
- See: [SECURITY_HARDENING.md](SECURITY_HARDENING.md)

### **Part 7: Troubleshooting**
- See: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## Install Docker

### **Docker Desktop for Windows**

1. **Download:**
   - https://www.docker.com/products/docker-desktop

2. **System Requirements:**
   - Windows 10/11 Pro, Enterprise, or Education
   - WSL 2 backend
   - Virtualization enabled in BIOS
   - 8GB RAM minimum (16GB recommended)

3. **Install:**
   ```powershell
   # Run installer
   # Enable WSL 2
   # Restart computer
   ```

4. **Configure Resources:**
   - Docker Desktop → Settings → Resources
   - Memory: 8GB minimum
   - CPUs: 4 cores minimum
   - Disk: 50GB

---

## Container Types

### **Windows Containers (Required for ASP.NET Web Forms)**

**What are Windows Containers?**
- Containers that run Windows binaries
- Required for .NET Framework applications (not .NET Core)
- Larger images (~5-10GB vs ~100MB for Linux)
- Require Windows host OR Docker Desktop on Windows

**Switch to Windows Containers:**
```powershell
# Right-click Docker Desktop tray icon
# → Switch to Windows containers...
# → Confirm
```

### **Hybrid Approach (Loginet)**
- **Web App:** Windows Container (ASP.NET 4.7.2 requirement)
- **SQL Server:** Linux Container (lighter, better performance)
- **Docker Compose:** Orchestrates both

---

## Dockerfile Explained

**Location:** `Dockerfile` (root directory)

**Key Sections:**

```dockerfile
# Base image: Windows Server Core with IIS and ASP.NET 4.8
FROM mcr.microsoft.com/dotnet/framework/aspnet:4.8-windowsservercore-ltsc2019

# Environment variables (customizable at runtime)
ENV DB_SERVER=sqlserver DB_NAME=scheduler

# Copy application files
COPY WebSite/ C:/inetpub/wwwroot/

# Configure IIS
RUN powershell Set-ItemProperty IIS:\AppPools\DefaultAppPool -Name managedRuntimeVersion -Value 'v4.0'

# Health check (Docker monitors app health)
HEALTHCHECK --interval=30s CMD powershell Invoke-WebRequest http://localhost/Services/HealthCheck.ashx

# Expose port 80
EXPOSE 80

# Start IIS
ENTRYPOINT ["C:\\ServiceMonitor.exe", "w3svc"]
```

**Build Image:**
```bash
docker build -t loginet-app:latest .
docker build -t loginet-app:2.0 .
```

---

## Docker Compose Explained

### **docker-compose.yml (Full Stack)**

**Location:** `docker-compose.yml` (root directory)

**Services Defined:**

**1. SQL Server (Linux Container):**
```yaml
sqlserver:
  image: mcr.microsoft.com/mssql/server:2022-latest
  environment:
    ACCEPT_EULA: "Y"
    SA_PASSWORD: "Password123!"
  ports:
    - "1433:1433"
  volumes:
    - sqlserver-data:/var/opt/mssql  # Data persistence
```

**2. Web Application (Windows Container):**
```yaml
webapp:
  build: .
  environment:
    DB_SERVER: "sqlserver"  # Docker DNS resolves to SQL container
    DB_PASSWORD: "Password123!"
  ports:
    - "8080:80"
  depends_on:
    sqlserver:
      condition: service_healthy  # Waits for SQL to be ready
```

**Deploy:**
```bash
docker-compose up -d
```

### **docker-compose.app-only.yml (App Only)**

**For External Database:**
```yaml
webapp:
  build: .
  environment:
    DB_SERVER: "host.docker.internal"  # Access host SQL Server
    # Or: "yourserver.database.windows.net"  # Azure SQL
  ports:
    - "8080:80"
```

**Deploy:**
```bash
docker-compose -f docker-compose.app-only.yml up -d
```

---

## Networking

### **Docker Networks**

**Automatic Network Creation:**
- docker-compose creates `loginet-network` bridge network
- Containers can reach each other by service name
- DNS: `sqlserver` resolves to SQL Server container IP

**Access Host from Container:**
```
DB_SERVER=host.docker.internal  # Special hostname for Docker Desktop
```

**Custom Network (Advanced):**
```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

services:
  webapp:
    networks:
      - frontend
      - backend
  sqlserver:
    networks:
      - backend
```

---

## Volumes

### **Data Persistence**

**Without Volumes:** Data lost when container removed
**With Volumes:** Data persists

**SQL Server Volume:**
```yaml
volumes:
  sqlserver-data:/var/opt/mssql
```

**Manage Volumes:**
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect loginet-sqlserver-data

# Backup volume
docker run --rm -v loginet-sqlserver-data:/data -v C:\Backups:/backup busybox tar czf /backup/sqlserver-backup.tar.gz /data

# Remove volume (DANGER: deletes data!)
docker volume rm loginet-sqlserver-data
```

---

## Environment Variables

### **Configuration Methods**

**Method 1: .env File (Recommended)**
```bash
# Create .env file in project root
DB_SERVER=sqlserver
DB_NAME=scheduler
DB_USER=sa
DB_PASSWORD=YourStrongPassword123!
APP_PORT=8080
```

docker-compose automatically loads .env file

**Method 2: Command Line**
```bash
docker-compose up -d -e DB_PASSWORD=MyPassword
```

**Method 3: docker-compose.yml**
```yaml
environment:
  DB_SERVER: "${DB_SERVER:-sqlserver}"
  DB_PASSWORD: "${DB_PASSWORD}"
```

---

## Secrets

### **Production Secrets Management**

**Docker Secrets (Swarm Mode):**
```yaml
services:
  webapp:
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

**Azure Key Vault (Cloud):**
```yaml
environment:
  DB_PASSWORD: "@Microsoft.KeyVault(SecretUri=https://myvault.vault.azure.net/secrets/db-password/)"
```

**Best Practices:**
- ✅ Never commit secrets to Git
- ✅ Use .env files (add to .gitignore)
- ✅ Use Docker secrets for sensitive data
- ✅ Rotate credentials regularly

---

## Deployment

### **Production Deployment Steps**

**1. Build Image:**
```bash
docker build -t loginet-app:2.0 .
```

**2. Tag for Registry (if using):**
```bash
docker tag loginet-app:2.0 myregistry.azurecr.io/loginet-app:2.0
docker push myregistry.azurecr.io/loginet-app:2.0
```

**3. Deploy with docker-compose:**
```bash
docker-compose up -d
```

**4. Initialize Database:**
```bash
docker cp DB.sql loginet-sqlserver:/tmp/
docker exec loginet-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Password123! -i /tmp/DB.sql
docker exec loginet-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Password123! -i /db-schema/init/03-seed-data.sql
```

**5. Verify:**
```bash
docker ps
docker-compose logs -f
curl http://localhost:8080/Services/HealthCheck.ashx
```

---

## Health Checks

### **Application Health Check**

**Configured in Dockerfile:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=60s \
    CMD powershell Invoke-WebRequest http://localhost/Services/HealthCheck.ashx
```

**Monitor Health:**
```bash
# Check health status
docker inspect loginet-webapp | grep -A 10 Health

# View health check logs
docker inspect --format='{{json .State.Health}}' loginet-webapp | jq
```

---

## Monitoring

### **Container Logging**

**View Logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f webapp
docker-compose logs -f sqlserver

# Last 100 lines
docker-compose logs --tail=100
```

**Centralized Logging (Production):**
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### **Resource Monitoring**

```bash
# Container stats
docker stats

# Specific container
docker stats loginet-webapp
```

---

## Production Best Practices

**1. Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

**2. Restart Policies:**
```yaml
restart: unless-stopped
```

**3. Health Checks:**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

**4. Logging:**
```yaml
logging:
  driver: "splunk"
  options:
    splunk-url: "https://your-splunk-instance:8088"
```

---

## Additional Resources

**Related Guides:**
- [Docker Deployment Guide (Basic)](DOCKER_DEPLOYMENT_GUIDE_BASIC.md) - Quick start
- [README.Docker.md](../../README.Docker.md) - Quick reference
- [DATABASE_DEPLOYMENT_GUIDE.md](DATABASE_DEPLOYMENT_GUIDE.md) - Database setup
- [SECURITY_HARDENING.md](SECURITY_HARDENING.md) - Security best practices
- [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) - Pre-deployment checklist
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues

**Docker Files:**
- `Dockerfile` - Build instructions
- `docker-compose.yml` - Full stack orchestration
- `docker-compose.app-only.yml` - App-only deployment
- `.dockerignore` - Build optimization

---

**[⬅ Back to Deployment Documentation](README.md)**
