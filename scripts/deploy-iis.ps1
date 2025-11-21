# ==============================================================================
# POWERSHELL DEPLOYMENT SCRIPT - IIS DEPLOYMENT
# ==============================================================================
#
# Purpose: Automated deployment of Loginet to IIS
# Version: 2.0
# Last Updated: 2025-11-21
#
# Requirements:
#   - Windows Server 2016+ or Windows 10/11 Pro
#   - IIS 10.0+ with ASP.NET 4.7.2
#   - PowerShell 5.1+ (Run as Administrator)
#   - SQL Server accessible from web server
#
# Usage:
#   .\deploy-iis.ps1 -SiteName "Loginet" -AppPoolName "LoginetAppPool" -PhysicalPath "C:\inetpub\wwwroot\Loginet"
#
# Documentation: See docs/07-deployment/IIS_DEPLOYMENT_GUIDE_DETAILED.md
# ==============================================================================

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$SiteName = "Loginet",

    [Parameter(Mandatory=$false)]
    [string]$AppPoolName = "LoginetAppPool",

    [Parameter(Mandatory=$false)]
    [string]$PhysicalPath = "C:\inetpub\wwwroot\Loginet",

    [Parameter(Mandatory=$false)]
    [int]$Port = 80,

    [Parameter(Mandatory=$false)]
    [string]$HostHeader = "",

    [Parameter(Mandatory=$false)]
    [switch]$SkipDatabaseCheck,

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
$SourcePath = Join-Path $ProjectRoot "WebSite"
$BackupPath = Join-Path $ProjectRoot "backups"

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

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-IISInstalled {
    $iisService = Get-Service -Name "W3SVC" -ErrorAction SilentlyContinue
    return $null -ne $iisService
}

function Test-AspNetInstalled {
    $aspNetPath = "$env:windir\Microsoft.NET\Framework64\v4.0.30319\aspnet_regiis.exe"
    return Test-Path $aspNetPath
}

# ==============================================================================
# MAIN SCRIPT
# ==============================================================================

try {
    Write-Header "Loginet IIS Deployment Script v2.0"

    # ============================================
    # STEP 1: PRE-FLIGHT CHECKS
    # ============================================

    Write-Header "Step 1: Pre-Flight Checks"

    # Check administrator privileges
    if (-not (Test-Administrator)) {
        throw "This script must be run as Administrator. Please restart PowerShell as Administrator."
    }
    Write-Success "Running as Administrator"

    # Check IIS installation
    if (-not (Test-IISInstalled)) {
        throw "IIS is not installed. Please install IIS with ASP.NET 4.7.2 support first."
    }
    Write-Success "IIS is installed"

    # Check ASP.NET 4.x installation
    if (-not (Test-AspNetInstalled)) {
        throw "ASP.NET 4.x is not installed. Please install .NET Framework 4.7.2 or higher."
    }
    Write-Success "ASP.NET 4.x is installed"

    # Import WebAdministration module
    Import-Module WebAdministration -ErrorAction Stop
    Write-Success "WebAdministration module loaded"

    # Check source files exist
    if (-not (Test-Path $SourcePath)) {
        throw "Source path not found: $SourcePath"
    }
    Write-Success "Source files found: $SourcePath"

    # ============================================
    # STEP 2: CREATE APPLICATION POOL
    # ============================================

    Write-Header "Step 2: Create/Configure Application Pool"

    if (Test-Path "IIS:\AppPools\$AppPoolName") {
        Write-Info "Application pool '$AppPoolName' already exists"

        if (-not $WhatIf) {
            Write-Info "Stopping existing application pool..."
            Stop-WebAppPool -Name $AppPoolName -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
    } else {
        if (-not $WhatIf) {
            Write-Info "Creating application pool '$AppPoolName'..."
            New-WebAppPool -Name $AppPoolName
        }
        Write-Success "Application pool created"
    }

    if (-not $WhatIf) {
        # Configure app pool
        Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name managedRuntimeVersion -Value "v4.0"
        Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name managedPipelineMode -Value "Integrated"
        Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name enable32BitAppOnWin64 -Value $false
        Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name processModel.identityType -Value "ApplicationPoolIdentity"

        Write-Success "Application pool configured (.NET 4.0, Integrated Pipeline)"
    }

    # ============================================
    # STEP 3: CREATE PHYSICAL DIRECTORY
    # ============================================

    Write-Header "Step 3: Prepare Physical Directory"

    # Create backup if site exists
    if (Test-Path $PhysicalPath) {
        if (-not $WhatIf) {
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $backupFolder = Join-Path $BackupPath "backup_$timestamp"

            Write-Info "Backing up existing site to: $backupFolder"
            New-Item -Path $backupFolder -ItemType Directory -Force | Out-Null
            Copy-Item -Path $PhysicalPath -Destination $backupFolder -Recurse -Force
            Write-Success "Backup created"
        }
    } else {
        if (-not $WhatIf) {
            New-Item -Path $PhysicalPath -ItemType Directory -Force | Out-Null
            Write-Success "Physical directory created: $PhysicalPath"
        }
    }

    # ============================================
    # STEP 4: COPY APPLICATION FILES
    # ============================================

    Write-Header "Step 4: Copy Application Files"

    if (-not $WhatIf) {
        Write-Info "Copying files from $SourcePath to $PhysicalPath..."

        # Copy all files
        Copy-Item -Path "$SourcePath\*" -Destination $PhysicalPath -Recurse -Force

        Write-Success "Application files copied"
    }

    # ============================================
    # STEP 5: SET FOLDER PERMISSIONS
    # ============================================

    Write-Header "Step 5: Configure Folder Permissions"

    if (-not $WhatIf) {
        Write-Info "Granting IIS_IUSRS read/write permissions..."

        $acl = Get-Acl $PhysicalPath
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
            "IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
        )
        $acl.SetAccessRule($rule)
        Set-Acl -Path $PhysicalPath -AclObject $acl

        Write-Success "Permissions configured"
    }

    # ============================================
    # STEP 6: CREATE/UPDATE IIS WEBSITE
    # ============================================

    Write-Header "Step 6: Create/Update IIS Website"

    if (Test-Path "IIS:\Sites\$SiteName") {
        Write-Info "Website '$SiteName' already exists"

        if (-not $WhatIf) {
            # Update existing site
            Set-ItemProperty "IIS:\Sites\$SiteName" -Name physicalPath -Value $PhysicalPath
            Set-ItemProperty "IIS:\Sites\$SiteName" -Name applicationPool -Value $AppPoolName
            Write-Success "Website updated"
        }
    } else {
        if (-not $WhatIf) {
            # Create new website
            $bindingInfo = "*:$Port:$HostHeader"
            New-Website -Name $SiteName `
                        -Port $Port `
                        -PhysicalPath $PhysicalPath `
                        -ApplicationPool $AppPoolName `
                        -HostHeader $HostHeader
            Write-Success "Website created: $SiteName"
        }
    }

    # ============================================
    # STEP 7: START SERVICES
    # ============================================

    Write-Header "Step 7: Start Services"

    if (-not $WhatIf) {
        # Start app pool
        Write-Info "Starting application pool '$AppPoolName'..."
        Start-WebAppPool -Name $AppPoolName
        Start-Sleep -Seconds 2
        Write-Success "Application pool started"

        # Start website
        Write-Info "Starting website '$SiteName'..."
        Start-Website -Name $SiteName
        Start-Sleep -Seconds 2
        Write-Success "Website started"
    }

    # ============================================
    # STEP 8: VERIFICATION
    # ============================================

    Write-Header "Step 8: Deployment Verification"

    if (-not $WhatIf) {
        # Check app pool status
        $appPoolState = (Get-WebAppPoolState -Name $AppPoolName).Value
        if ($appPoolState -eq "Started") {
            Write-Success "Application pool is running"
        } else {
            Write-Error-Custom "Application pool is not running (State: $appPoolState)"
        }

        # Check website status
        $siteState = (Get-WebsiteState -Name $SiteName).Value
        if ($siteState -eq "Started") {
            Write-Success "Website is running"
        } else {
            Write-Error-Custom "Website is not running (State: $siteState)"
        }

        # Test HTTP response
        try {
            $testUrl = "http://localhost:$Port"
            if ($HostHeader) { $testUrl = "http://$HostHeader:$Port" }

            Write-Info "Testing HTTP response: $testUrl"
            $response = Invoke-WebRequest -Uri $testUrl -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop

            if ($response.StatusCode -eq 200) {
                Write-Success "Website is responding (HTTP 200 OK)"
            } else {
                Write-Info "Website responded with status: $($response.StatusCode)"
            }
        } catch {
            Write-Error-Custom "Failed to access website: $_"
            Write-Info "This may be normal if database is not yet configured"
        }
    }

    # ============================================
    # SUCCESS MESSAGE
    # ============================================

    Write-Header "✓ DEPLOYMENT COMPLETED SUCCESSFULLY"

    Write-Host ""
    Write-Host "Website Details:" -ForegroundColor Green
    Write-Host "  Site Name:        $SiteName" -ForegroundColor White
    Write-Host "  Physical Path:    $PhysicalPath" -ForegroundColor White
    Write-Host "  Application Pool: $AppPoolName" -ForegroundColor White
    Write-Host "  Port:             $Port" -ForegroundColor White
    if ($HostHeader) {
        Write-Host "  Host Header:      $HostHeader" -ForegroundColor White
        Write-Host "  URL:              http://$HostHeader:$Port" -ForegroundColor Cyan
    } else {
        Write-Host "  URL:              http://localhost:$Port" -ForegroundColor Cyan
    }
    Write-Host ""

    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Configure database connection string in Web.config"
    Write-Host "  2. Run database deployment script: .\deploy-database.ps1"
    Write-Host "  3. Access the website and complete setup wizard"
    Write-Host "  4. Test all functionality"
    Write-Host ""

    if ($WhatIf) {
        Write-Host "⚠ WhatIf mode: No changes were made" -ForegroundColor Yellow
    }

} catch {
    Write-Header "✗ DEPLOYMENT FAILED"
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
