# ==============================================================================
# POWERSHELL DEPLOYMENT SCRIPT - DATABASE DEPLOYMENT
# ==============================================================================
#
# Purpose: Deploy or update Loginet database schema and seed data
# Version: 2.0
# Last Updated: 2025-11-21
#
# Requirements:
#   - SQL Server 2017+ (Express, Standard, or Enterprise)
#   - PowerShell 5.1+ (Run as Administrator)
#   - SQL Server PowerShell module (SqlServer) - auto-installed if missing
#
# Usage:
#   .\deploy-database.ps1 -ServerInstance "localhost" -DatabaseName "scheduler" -SqlAuthUser "sa" -SqlAuthPassword "Password123!"
#   .\deploy-database.ps1 -ServerInstance "localhost" -DatabaseName "scheduler" -UseWindowsAuth
#
# Documentation: See docs/07-deployment/DATABASE_DEPLOYMENT_GUIDE.md
# ==============================================================================

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ServerInstance = "localhost",

    [Parameter(Mandatory=$false)]
    [string]$DatabaseName = "scheduler",

    [Parameter(Mandatory=$false)]
    [string]$SqlAuthUser = "sa",

    [Parameter(Mandatory=$false)]
    [string]$SqlAuthPassword = "",

    [Parameter(Mandatory=$false)]
    [switch]$UseWindowsAuth,

    [Parameter(Mandatory=$false)]
    [switch]$SkipBackup,

    [Parameter(Mandatory=$false)]
    [switch]$SeedTestData,

    [Parameter(Mandatory=$false)]
    [switch]$WhatIf
)

# ==============================================================================
# CONFIGURATION
# ==============================================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptPath
$DatabaseFolder = Join-Path $ProjectRoot "Database"
$BackupFolder = Join-Path $ProjectRoot "backups\database"

# Script files
$SchemaScript = Join-Path $ProjectRoot "DB.sql"
$SeedStatusScript = Join-Path $DatabaseFolder "Seeds\SeedStatuses.sql"
$TestUsersScript = Join-Path $DatabaseFolder "Test\Test_Users_Setup.sql"

# ==============================================================================
# FUNCTIONS
# ==============================================================================

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "→ $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Install-SqlServerModule {
    if (-not (Get-Module -ListAvailable -Name SqlServer)) {
        Write-Info "SqlServer module not found. Installing..."
        Install-Module -Name SqlServer -Force -AllowClobber -Scope CurrentUser
        Write-Success "SqlServer module installed"
    }
    Import-Module SqlServer -ErrorAction Stop
}

function Test-DatabaseExists {
    param([string]$Server, [string]$Database, [System.Management.Automation.PSCredential]$Credential)

    $query = "SELECT name FROM sys.databases WHERE name = '$Database'"

    if ($Credential) {
        $result = Invoke-Sqlcmd -ServerInstance $Server -Query $query -Username $Credential.UserName -Password $Credential.GetNetworkCredential().Password -ErrorAction SilentlyContinue
    } else {
        $result = Invoke-Sqlcmd -ServerInstance $Server -Query $query -ErrorAction SilentlyContinue
    }

    return $null -ne $result
}

function Backup-Database {
    param([string]$Server, [string]$Database, [System.Management.Automation.PSCredential]$Credential)

    if ($SkipBackup) {
        Write-Info "Backup skipped (SkipBackup flag)"
        return
    }

    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "$Database`_$timestamp.bak"
    $backupPath = Join-Path $BackupFolder $backupFile

    # Create backup folder
    New-Item -Path $BackupFolder -ItemType Directory -Force | Out-Null

    Write-Info "Creating backup: $backupFile"

    $query = "BACKUP DATABASE [$Database] TO DISK = N'$backupPath' WITH FORMAT, INIT"

    try {
        if ($Credential) {
            Invoke-Sqlcmd -ServerInstance $Server -Query $query -Username $Credential.UserName -Password $Credential.GetNetworkCredential().Password -QueryTimeout 300
        } else {
            Invoke-Sqlcmd -ServerInstance $Server -Query $query -QueryTimeout 300
        }
        Write-Success "Backup created: $backupPath"
    } catch {
        Write-Error-Custom "Backup failed: $_"
        throw
    }
}

# ==============================================================================
# MAIN SCRIPT
# ==============================================================================

try {
    Write-Header "Loginet Database Deployment Script v2.0"

    # ============================================
    # STEP 1: PREREQUISITES
    # ============================================

    Write-Header "Step 1: Check Prerequisites"

    # Install/Import SqlServer module
    Install-SqlServerModule
    Write-Success "SqlServer PowerShell module loaded"

    # Validate script files exist
    if (-not (Test-Path $SchemaScript)) {
        throw "Schema script not found: $SchemaScript"
    }
    Write-Success "Schema script found: DB.sql"

    # Build credentials
    if ($UseWindowsAuth) {
        $Credential = $null
        Write-Info "Using Windows Authentication"
    } else {
        if ([string]::IsNullOrEmpty($SqlAuthPassword)) {
            $SecurePassword = Read-Host "Enter SQL password for user '$SqlAuthUser'" -AsSecureString
        } else {
            $SecurePassword = ConvertTo-SecureString $SqlAuthPassword -AsPlainText -Force
        }
        $Credential = New-Object System.Management.Automation.PSCredential($SqlAuthUser, $SecurePassword)
        Write-Info "Using SQL Authentication (user: $SqlAuthUser)"
    }

    # Test SQL Server connectivity
    Write-Info "Testing connection to $ServerInstance..."
    try {
        if ($Credential) {
            Invoke-Sqlcmd -ServerInstance $ServerInstance -Query "SELECT @@VERSION" -Username $Credential.UserName -Password $Credential.GetNetworkCredential().Password -QueryTimeout 10 | Out-Null
        } else {
            Invoke-Sqlcmd -ServerInstance $ServerInstance -Query "SELECT @@VERSION" -QueryTimeout 10 | Out-Null
        }
        Write-Success "SQL Server connection successful"
    } catch {
        throw "Cannot connect to SQL Server: $_"
    }

    # ============================================
    # STEP 2: DATABASE CREATION/BACKUP
    # ============================================

    Write-Header "Step 2: Database Check and Backup"

    $dbExists = Test-DatabaseExists -Server $ServerInstance -Database $DatabaseName -Credential $Credential

    if ($dbExists) {
        Write-Info "Database '$DatabaseName' exists"

        if (-not $SkipBackup -and -not $WhatIf) {
            Backup-Database -Server $ServerInstance -Database $DatabaseName -Credential $Credential
        }
    } else {
        Write-Info "Database '$DatabaseName' does not exist - will be created"
    }

    # ============================================
    # STEP 3: CREATE/UPDATE SCHEMA
    # ============================================

    Write-Header "Step 3: Deploy Database Schema"

    if (-not $WhatIf) {
        Write-Info "Running DB.sql script..."

        # Create database if not exists (DB.sql has CREATE DATABASE logic)
        try {
            if ($Credential) {
                Invoke-Sqlcmd -ServerInstance $ServerInstance -InputFile $SchemaScript -Username $Credential.UserName -Password $Credential.GetNetworkCredential().Password -QueryTimeout 600 -Verbose
            } else {
                Invoke-Sqlcmd -ServerInstance $ServerInstance -InputFile $SchemaScript -QueryTimeout 600 -Verbose
            }
            Write-Success "Schema deployed successfully"
        } catch {
            Write-Error-Custom "Schema deployment failed: $_"
            throw
        }
    }

    # ============================================
    # STEP 4: SEED DATA
    # ============================================

    Write-Header "Step 4: Seed Initial Data"

    # Seed statuses
    if (Test-Path $SeedStatusScript) {
        if (-not $WhatIf) {
            Write-Info "Seeding Status table..."
            try {
                if ($Credential) {
                    Invoke-Sqlcmd -ServerInstance $ServerInstance -InputFile $SeedStatusScript -Username $Credential.UserName -Password $Credential.GetNetworkCredential().Password
                } else {
                    Invoke-Sqlcmd -ServerInstance $ServerInstance -InputFile $SeedStatusScript
                }
                Write-Success "Status data seeded"
            } catch {
                Write-Error-Custom "Status seeding failed: $_"
            }
        }
    } else {
        Write-Info "Status seed script not found - skipping"
    }

    # Seed test users (optional)
    if ($SeedTestData -and (Test-Path $TestUsersScript)) {
        if (-not $WhatIf) {
            Write-Info "Seeding test users..."
            try {
                if ($Credential) {
                    Invoke-Sqlcmd -ServerInstance $ServerInstance -InputFile $TestUsersScript -Username $Credential.UserName -Password $Credential.GetNetworkCredential().Password
                } else {
                    Invoke-Sqlcmd -ServerInstance $ServerInstance -InputFile $TestUsersScript
                }
                Write-Success "Test users seeded"
            } catch {
                Write-Error-Custom "Test user seeding failed: $_"
            }
        }
    }

    # ============================================
    # STEP 5: VERIFICATION
    # ============================================

    Write-Header "Step 5: Verify Deployment"

    if (-not $WhatIf) {
        # Check table count
        $query = "SELECT COUNT(*) as TableCount FROM [$DatabaseName].INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"
        if ($Credential) {
            $result = Invoke-Sqlcmd -ServerInstance $ServerInstance -Query $query -Username $Credential.UserName -Password $Credential.GetNetworkCredential().Password
        } else {
            $result = Invoke-Sqlcmd -ServerInstance $ServerInstance -Query $query
        }

        $tableCount = $result.TableCount
        Write-Info "Tables created: $tableCount (Expected: 7)"

        if ($tableCount -ge 7) {
            Write-Success "Database schema verified"
        } else {
            Write-Error-Custom "Warning: Expected 7 tables, found $tableCount"
        }

        # Check roles
        $query = "SELECT COUNT(*) as RoleCount FROM [$DatabaseName].dbo.Roles"
        if ($Credential) {
            $result = Invoke-Sqlcmd -ServerInstance $ServerInstance -Query $query -Username $Credential.UserName -Password $Credential.GetNetworkCredential().Password
        } else {
            $result = Invoke-Sqlcmd -ServerInstance $ServerInstance -Query $query
        }

        $roleCount = $result.RoleCount
        Write-Info "Roles: $roleCount (Expected: 3)"

        if ($roleCount -ge 3) {
            Write-Success "RBAC roles verified"
        }

        # Check statuses
        $query = "SELECT COUNT(*) as StatusCount FROM [$DatabaseName].dbo.Status"
        if ($Credential) {
            $result = Invoke-Sqlcmd -ServerInstance $ServerInstance -Query $query -Username $Credential.UserName -Password $Credential.GetNetworkCredential().Password
        } else {
            $result = Invoke-Sqlcmd -ServerInstance $ServerInstance -Query $query
        }

        $statusCount = $result.StatusCount
        Write-Info "Statuses: $statusCount (Expected: 3)"

        if ($statusCount -ge 3) {
            Write-Success "Status data verified"
        }
    }

    # ============================================
    # SUCCESS MESSAGE
    # ============================================

    Write-Header "✓ DATABASE DEPLOYMENT COMPLETED SUCCESSFULLY"

    Write-Host ""
    Write-Host "Database Details:" -ForegroundColor Green
    Write-Host "  Server:   $ServerInstance" -ForegroundColor White
    Write-Host "  Database: $DatabaseName" -ForegroundColor White
    Write-Host "  Tables:   $tableCount" -ForegroundColor White
    Write-Host "  Roles:    $roleCount" -ForegroundColor White
    Write-Host "  Statuses: $statusCount" -ForegroundColor White
    Write-Host ""

    Write-Host "Connection String:" -ForegroundColor Yellow
    Write-Host "  Server=$ServerInstance;Database=$DatabaseName;..." -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Update Web.config connection string"
    Write-Host "  2. Deploy web application (.\deploy-iis.ps1)"
    Write-Host "  3. Access setup wizard to create first user"
    Write-Host "  4. Test database connectivity from web app"
    Write-Host ""

    if ($WhatIf) {
        Write-Host "⚠ WhatIf mode: No changes were made" -ForegroundColor Yellow
    }

} catch {
    Write-Header "✗ DATABASE DEPLOYMENT FAILED"
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Stack Trace:" -ForegroundColor Yellow
    Write-Host $_.Exception.StackTrace -ForegroundColor Gray
    Write-Host ""

    exit 1
}

# ==============================================================================
# END OF SCRIPT
# ==============================================================================
