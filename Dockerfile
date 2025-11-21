# ==============================================================================
# DOCKERFILE - Loginet Invoice Management System
# ==============================================================================
#
# Purpose: Build Windows container image for ASP.NET Web Forms 4.7.2 application
# Base Image: Windows Server Core with IIS and ASP.NET 4.8
# Target: Production deployment with Docker
#
# Build Command:
#   docker build -t loginet-app:latest .
#
# Run Command:
#   docker run -d -p 8080:80 --name loginet loginet-app:latest
#
# Documentation: See docs/07-deployment/DOCKER_DEPLOYMENT_GUIDE.md
# ==============================================================================

# ============================================
# Stage 1: Base Image
# ============================================

# Use official Microsoft ASP.NET 4.8 image (Windows Server Core LTSC 2019)
# This image includes:
# - Windows Server Core
# - IIS 10.0
# - ASP.NET 4.8 (supports 4.7.2 applications)
# - .NET Framework 4.8
FROM mcr.microsoft.com/dotnet/framework/aspnet:4.8-windowsservercore-ltsc2019

# ============================================
# Metadata
# ============================================
LABEL maintainer="Loginet Development Team" \
      version="2.0" \
      description="Loginet Invoice Management System - ASP.NET Web Forms 4.7.2" \
      documentation="https://github.com/fortejava/scheduler"

# ============================================
# Environment Variables
# ============================================

# Database connection (override at runtime with -e flag)
# Example: docker run -e DB_SERVER=myserver.com -e DB_PASSWORD=secret ...
ENV DB_SERVER=sqlserver \
    DB_NAME=scheduler \
    DB_USER=sa \
    DB_PASSWORD=Password123! \
    ASPNET_VERSION=4.7.2

# Application settings
ENV APP_NAME=Loginet \
    APP_PORT=80

# ============================================
# Working Directory
# ============================================

# Set working directory to IIS root
WORKDIR /inetpub/wwwroot

# ============================================
# Remove Default IIS Files
# ============================================

# Remove default IIS website files (iisstart.htm, etc.)
RUN powershell -Command Remove-Item -Recurse C:\inetpub\wwwroot\*

# ============================================
# Copy Application Files
# ============================================

# Copy entire WebSite folder to IIS root
# .dockerignore ensures we only copy necessary files
COPY WebSite/ C:/inetpub/wwwroot/

# ============================================
# Copy Database Schema (Optional - For Reference)
# ============================================

# Copy DB.sql for documentation/initialization reference
COPY DB.sql C:/db-schema/
COPY Database/Seeds/ C:/db-schema/seeds/
COPY Database/docker-init/ C:/db-schema/init/

# ============================================
# Configure IIS Application Pool
# ============================================

# Set .NET Framework version for Default App Pool
# Ensure it's set to v4.0 (supports .NET 4.7.2)
RUN powershell -Command \
    Import-Module WebAdministration; \
    Set-ItemProperty IIS:\AppPools\DefaultAppPool -Name managedRuntimeVersion -Value 'v4.0'; \
    Set-ItemProperty IIS:\AppPools\DefaultAppPool -Name enable32BitAppOnWin64 -Value $false; \
    Set-ItemProperty IIS:\AppPools\DefaultAppPool -Name managedPipelineMode -Value 'Integrated'

# ============================================
# Configure Web.config with Environment Variables
# ============================================

# Replace connection string placeholders with environment variables
# This runs at BUILD time - for RUNTIME replacement, use docker-compose
RUN powershell -Command \
    $webConfigPath = 'C:\inetpub\wwwroot\Web.config'; \
    if (Test-Path $webConfigPath) { \
        Write-Host 'Web.config found - ready for runtime configuration'; \
    } else { \
        Write-Host 'WARNING: Web.config not found!'; \
    }

# ============================================
# Permissions
# ============================================

# Grant IIS_IUSRS read/write permissions to application folder
RUN icacls C:\inetpub\wwwroot /grant "IIS_IUSRS:(OI)(CI)F" /T

# ============================================
# Health Check
# ============================================

# Check if IIS is responding every 30 seconds
# Timeout: 5 seconds
# Retries: 3 times before marking unhealthy
# Start period: Wait 60 seconds before first check (app startup time)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=60s \
    CMD powershell -command \
    try { \
        $response = Invoke-WebRequest http://localhost/Services/HealthCheck.ashx -UseBasicParsing -TimeoutSec 5; \
        if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } \
    } catch { exit 1 }

# ============================================
# Expose Ports
# ============================================

# Expose port 80 for HTTP traffic
EXPOSE 80

# Optional: Expose port 443 for HTTPS (if SSL configured)
# EXPOSE 443

# ============================================
# Startup Command
# ============================================

# Start IIS and keep container running
# ServiceMonitor.exe keeps the container alive by monitoring W3SVC (IIS service)
# This executable is included in the base aspnet image
ENTRYPOINT ["C:\\ServiceMonitor.exe", "w3svc"]

# ==============================================================================
# BUILD INSTRUCTIONS:
# ==============================================================================
#
# 1. Build the image:
#    docker build -t loginet-app:latest .
#    docker build -t loginet-app:2.0 .
#
# 2. Run standalone (requires external SQL Server):
#    docker run -d -p 8080:80 \
#      -e DB_SERVER=your-sql-server \
#      -e DB_PASSWORD=YourStrongPassword \
#      --name loginet \
#      loginet-app:latest
#
# 3. Run with docker-compose (recommended):
#    docker-compose up -d
#
# 4. View logs:
#    docker logs loginet
#
# 5. Access application:
#    http://localhost:8080
#
# ==============================================================================
# TROUBLESHOOTING:
# ==============================================================================
#
# Container won't start:
#   - Check logs: docker logs loginet
#   - Verify base image: docker pull mcr.microsoft.com/dotnet/framework/aspnet:4.8
#   - Check Windows container mode (Docker Desktop → Settings → Daemon)
#
# Application errors:
#   - Exec into container: docker exec -it loginet powershell
#   - Check IIS logs: C:\inetpub\logs\LogFiles\
#   - Check Event Viewer: Get-EventLog -LogName Application -Newest 50
#
# Database connection fails:
#   - Verify DB_SERVER environment variable
#   - Check network connectivity: docker exec loginet ping sqlserver
#   - Verify SQL Server allows remote connections
#
# Health check fails:
#   - Test manually: docker exec loginet powershell Invoke-WebRequest http://localhost
#   - Check if HealthCheck.ashx exists
#   - Verify IIS is running: docker exec loginet powershell Get-Service W3SVC
#
# ==============================================================================
