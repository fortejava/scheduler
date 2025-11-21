# ==============================================================================
# POWERSHELL ROLLBACK SCRIPT
# ==============================================================================
#
# Purpose: Rollback Loginet deployment to previous version
# Version: 2.0
# Last Updated: 2025-11-21
#
# Usage:
#   .\rollback.ps1 -SiteName "Loginet" -BackupTimestamp "20251121_143022"
#   .\rollback.ps1 -ListBackups
#
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
    [string]$BackupTimestamp = "",

    [Parameter(Mandatory=$false)]
    [switch]$ListBackups,

    [Parameter(Mandatory=$false)]
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptPath
$BackupPath = Join-Path $ProjectRoot "backups"

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

try {
    Write-Header "Loginet Rollback Script v2.0"

    # List backups mode
    if ($ListBackups) {
        Write-Header "Available Backups"
        if (Test-Path $BackupPath) {
            $backups = Get-ChildItem $BackupPath -Directory | Sort-Object Name -Descending
            foreach ($backup in $backups) {
                Write-Host "  $($backup.Name)" -ForegroundColor Cyan
            }
        } else {
            Write-Info "No backups found"
        }
        exit 0
    }

    # Select backup
    if ([string]::IsNullOrEmpty($BackupTimestamp)) {
        $backups = Get-ChildItem $BackupPath -Directory | Sort-Object Name -Descending | Select-Object -First 5
        if ($backups.Count -eq 0) {
            throw "No backups available"
        }

        Write-Host "Available backups:" -ForegroundColor Yellow
        for ($i = 0; $i -lt $backups.Count; $i++) {
            Write-Host "  [$i] $($backups[$i].Name)"
        }

        $selection = Read-Host "Select backup (0-$($backups.Count - 1))"
        $BackupTimestamp = $backups[[int]$selection].Name.Replace("backup_", "")
    }

    $backupFolder = Join-Path $BackupPath "backup_$BackupTimestamp"

    if (-not (Test-Path $backupFolder)) {
        throw "Backup not found: $backupFolder"
    }

    Write-Header "Rollback to: $BackupTimestamp"

    # Stop services
    Import-Module WebAdministration
    Write-Info "Stopping website..."
    Stop-Website -Name $SiteName
    Stop-WebAppPool -Name $AppPoolName
    Start-Sleep -Seconds 3

    # Restore files
    Write-Info "Restoring files from $backupFolder..."
    Copy-Item -Path "$backupFolder\*" -Destination $PhysicalPath -Recurse -Force

    # Restart services
    Write-Info "Starting services..."
    Start-WebAppPool -Name $AppPoolName
    Start-Website -Name $SiteName

    Write-Header "✓ ROLLBACK COMPLETED"
    Write-Success "Rolled back to backup: $BackupTimestamp"

} catch {
    Write-Host "✗ ROLLBACK FAILED: $_" -ForegroundColor Red
    exit 1
}
