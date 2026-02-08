# ═══════════════════════════════════════════════════════════════════════════════
#
#         █████╗ ██╗██╗   ██╗ █████╗
#        ██╔══██╗██║██║   ██║██╔══██╗
#        ███████║██║██║   ██║███████║
#        ██╔══██║██║╚██╗ ██╔╝██╔══██║
#        ██║  ██║██║ ╚████╔╝ ██║  ██║
#        ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝
#
#    ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──
#
#    ⟁  DOCKER SETUP SCRIPT (Windows PowerShell)
#    ⟁  PURPOSE: Automated Docker environment setup
#
#                           ⟡  A I V A  ⟡
#
#                      © 2026 Mohitraj Jadeja
#
# ═══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🐳 AIVA Docker Setup Script" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed!" -ForegroundColor Red
    Write-Host "📥 Please install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is installed
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose installed: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed!" -ForegroundColor Red
    Write-Host "📥 Usually included with Docker Desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if .env.secret exists
if (-not (Test-Path "server\.env.secret")) {
    Write-Host "⚠️  .env.secret not found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please choose an option:"
    Write-Host "  1. Create from template (manual configuration required)"
    Write-Host "  2. Decrypt from encrypted file (requires password)"
    Write-Host "  3. Exit and create manually"
    Write-Host ""
    $choice = Read-Host "Enter choice (1-3)"

    switch ($choice) {
        "1" {
            if (Test-Path "server\.env.secret.example") {
                Copy-Item "server\.env.secret.example" "server\.env.secret"
                Write-Host "✅ Created server\.env.secret from template" -ForegroundColor Green
                Write-Host "⚠️  IMPORTANT: Edit server\.env.secret with your real credentials!" -ForegroundColor Yellow
                Write-Host ""
                Write-Host "Opening in notepad..."
                Start-Process notepad "server\.env.secret"
                Read-Host "Press Enter after editing the file"
            } else {
                Write-Host "❌ Template file not found!" -ForegroundColor Red
                exit 1
            }
        }
        "2" {
            if (Test-Path "server\.env.secret.encrypted") {
                $password = Read-Host "Enter decryption password" -AsSecureString
                $passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
                node docker\decrypt-env.js $passwordPlain
            } else {
                Write-Host "❌ Encrypted file not found!" -ForegroundColor Red
                exit 1
            }
        }
        "3" {
            Write-Host "Exiting. Please create server\.env.secret manually." -ForegroundColor Yellow
            exit 0
        }
        default {
            Write-Host "Invalid choice!" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host ""
Write-Host "🔍 Validating environment configuration..." -ForegroundColor Cyan

# Check for required variables
$envContent = Get-Content "server\.env.secret" -Raw
$requiredVars = @("MONGO_URI", "JWT_SECRET", "ENCRYPTION_KEY")
$missingVars = @()

foreach ($var in $requiredVars) {
    if ($envContent -notmatch "^$var=" -or $envContent -match "^$var=.*your_.*") {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "⚠️  Warning: The following variables need to be configured:" -ForegroundColor Yellow
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Yellow
    }
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Exiting. Please configure the variables first." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "✅ Environment configuration validated" -ForegroundColor Green
Write-Host ""

# Ask about MinIO
$useMinio = Read-Host "Start with MinIO storage? (y/N)"
Write-Host ""

# Build and start services
Write-Host "🏗️  Building Docker images..." -ForegroundColor Cyan
docker-compose build

Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Cyan

if ($useMinio -eq "y" -or $useMinio -eq "Y") {
    docker-compose --profile with-minio up -d
} else {
    docker-compose up -d
}

Write-Host ""
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check service status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "   ✅ AIVA Docker Setup Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access your application:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000"
Write-Host "   Backend:   http://localhost:5000"
if ($useMinio -eq "y" -or $useMinio -eq "Y") {
    Write-Host "   MinIO:     http://localhost:9001"
}
Write-Host ""
Write-Host "📋 Useful commands:" -ForegroundColor Cyan
Write-Host "   View logs:     docker-compose logs -f"
Write-Host "   Stop services: docker-compose stop"
Write-Host "   Restart:       docker-compose restart"
Write-Host "   Remove all:    docker-compose down"
Write-Host ""
Write-Host "📖 For more information, see docker\README.md" -ForegroundColor Cyan
Write-Host ""
