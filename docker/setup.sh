#!/bin/bash

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
#    ⟁  DOCKER SETUP SCRIPT (Linux/Mac)
#    ⟁  PURPOSE: Automated Docker environment setup
#
#                           ⟡  A I V A  ⟡
#
#                      © 2026 Mohitraj Jadeja
#
# ═══════════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "   🐳 AIVA Docker Setup Script"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "📥 Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "📥 Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker installed: $(docker --version)"
echo "✅ Docker Compose installed: $(docker-compose --version)"
echo ""

# Check if .env.secret exists
if [ ! -f "server/.env.secret" ]; then
    echo "⚠️  .env.secret not found!"
    echo ""
    echo "Please choose an option:"
    echo "  1. Create from template (manual configuration required)"
    echo "  2. Decrypt from encrypted file (requires password)"
    echo "  3. Exit and create manually"
    echo ""
    read -p "Enter choice (1-3): " choice

    case $choice in
        1)
            if [ -f "server/.env.secret.example" ]; then
                cp server/.env.secret.example server/.env.secret
                echo "✅ Created server/.env.secret from template"
                echo "⚠️  IMPORTANT: Edit server/.env.secret with your real credentials!"
                echo ""
                read -p "Press Enter to open in editor (or Ctrl+C to exit)..."
                ${EDITOR:-nano} server/.env.secret
            else
                echo "❌ Template file not found!"
                exit 1
            fi
            ;;
        2)
            if [ -f "server/.env.secret.encrypted" ]; then
                read -sp "Enter decryption password: " password
                echo ""
                node docker/decrypt-env.js "$password"
            else
                echo "❌ Encrypted file not found!"
                exit 1
            fi
            ;;
        3)
            echo "Exiting. Please create server/.env.secret manually."
            exit 0
            ;;
        *)
            echo "Invalid choice!"
            exit 1
            ;;
    esac
fi

echo ""
echo "🔍 Validating environment configuration..."

# Check for required variables in .env.secret
required_vars=("MONGO_URI" "JWT_SECRET" "ENCRYPTION_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" server/.env.secret || grep -q "^${var}=.*your_.*" server/.env.secret; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "⚠️  Warning: The following variables need to be configured:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    read -p "Continue anyway? (y/N): " continue
    if [[ ! $continue =~ ^[Yy]$ ]]; then
        echo "Exiting. Please configure the variables first."
        exit 0
    fi
fi

echo "✅ Environment configuration validated"
echo ""

# Ask about MinIO
read -p "Start with MinIO storage? (y/N): " use_minio
echo ""

# Build and start services
echo "🏗️  Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."

if [[ $use_minio =~ ^[Yy]$ ]]; then
    docker-compose --profile with-minio up -d
else
    docker-compose up -d
fi

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "   ✅ AIVA Docker Setup Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🌐 Access your application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:5000"
if [[ $use_minio =~ ^[Yy]$ ]]; then
    echo "   MinIO:     http://localhost:9001"
fi
echo ""
echo "📋 Useful commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop services: docker-compose stop"
echo "   Restart:       docker-compose restart"
echo "   Remove all:    docker-compose down"
echo ""
echo "📖 For more information, see docker/README.md"
echo ""
