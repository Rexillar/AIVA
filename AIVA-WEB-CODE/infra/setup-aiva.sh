#!/bin/bash

# 🚀 AIVA Secure Docker Deployment Script
# This script automates the initial setup for AIVA deployment on Ubuntu
# Run with: bash setup-aiva.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

log_info "Starting AIVA Secure Docker Deployment Setup..."
log_info "This will configure your Ubuntu system for secure AIVA deployment."

# Function to check command success
check_command() {
    if [ $? -eq 0 ]; then
        log_success "$1 completed successfully"
    else
        log_error "$1 failed"
        exit 1
    fi
}

# 1. Update system
log_info "Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y
check_command "System update"

# 2. Install required packages
log_info "Step 2: Installing required packages..."
sudo apt install -y git curl ufw ca-certificates gnupg lsb-release wget
check_command "Package installation"

# 3. Configure firewall
log_info "Step 3: Configuring firewall..."
sudo ufw --force enable
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 81  # Nginx Proxy Manager admin
check_command "Firewall configuration"

# 4. Install Docker
log_info "Step 4: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    check_command "Docker installation"
else
    log_info "Docker already installed, skipping..."
fi

# 5. Create directory structure
log_info "Step 5: Creating directory structure..."
mkdir -p ~/apps/reverse-proxy ~/apps/aiva/backend ~/apps/aiva/frontend
check_command "Directory creation"

# 6. Create reverse proxy docker-compose.yml
log_info "Step 6: Setting up Nginx Proxy Manager..."
cat > ~/apps/reverse-proxy/docker-compose.yml << 'EOF'
version: "3.9"
services:
  nginx-proxy-manager:
    image: jc21/nginx-proxy-manager:latest
    container_name: nginx_proxy_manager
    restart: always
    ports:
      - "80:80"
      - "81:81"
      - "443:443"
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    environment:
      - PUID=1000
      - PGID=1000
EOF
check_command "Nginx Proxy Manager setup"

# 7. Create AIVA docker-compose.yml template
log_info "Step 7: Creating AIVA Docker Compose template..."
cat > ~/apps/aiva/docker-compose.yml << 'EOF'
version: "3.9"
services:
  aiva_backend:
    build: ./backend
    container_name: aiva_backend
    restart: always
    env_file:
      - .env
    ports:
      - "5000:5000"
    networks:
      - aiva_network

  aiva_frontend:
    build: ./frontend
    container_name: aiva_frontend
    restart: always
    ports:
      - "3001:80"
    depends_on:
      - aiva_backend
    networks:
      - aiva_network

networks:
  aiva_network:
    driver: bridge
EOF
check_command "AIVA Docker Compose template creation"

# 8. Copy actual .env files from AIVA project
log_info "Step 8: Copying actual AIVA environment files..."
if [ -f "AIVA-WEB-CODE/server/.env" ]; then
    cp AIVA-WEB-CODE/server/.env ~/apps/aiva/.env
    # Generate new secure JWT secret for production
    JWT_SECRET=$(openssl rand -hex 64)
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" ~/apps/aiva/.env
    # Update production settings
    sed -i "s|NODE_ENV=development|NODE_ENV=production|g" ~/apps/aiva/.env
    sed -i "s|CORS_ORIGIN=http://localhost:3000|CORS_ORIGIN=https://aiva.mohitrajsinh.me|g" ~/apps/aiva/.env
    sed -i "s|CLIENT_URL=http://localhost:3000|CLIENT_URL=https://aiva.mohitrajsinh.me|g" ~/apps/aiva/.env
    check_command "Server environment file copy and production updates"
else
    log_warning "AIVA-WEB-CODE/server/.env not found, creating from template..."
    cp AIVA-WEB-CODE/.env.example ~/apps/aiva/.env.example 2>/dev/null || true
    JWT_SECRET=$(openssl rand -hex 64)
    sed -i "s|your-super-secure-jwt-secret-here|${JWT_SECRET}|g" ~/apps/aiva/.env.example
    check_command "Environment template fallback"
fi

# 9. Copy client environment file
log_info "Step 9: Copying client environment file..."
if [ -f "AIVA-WEB-CODE/client/.env" ]; then
    cp AIVA-WEB-CODE/client/.env ~/apps/aiva/client.env
    # Update production API URL
    sed -i "s|VITE_APP_API_URL=http://localhost:5000|VITE_APP_API_URL=https://aiva.mohitrajsinh.me|g" ~/apps/aiva/client.env
    check_command "Client environment file copy and production updates"
else
    log_warning "AIVA-WEB-CODE/client/.env not found, creating template..."
    cat > ~/apps/aiva/client.env << 'EOF'
# AIVA Client Environment Variables (Production)
VITE_APP_API_URL=https://aiva.mohitrajsinh.me

# API Keys for client-side usage (be careful!)
# Note: These will be exposed to browsers - use server-side proxies for sensitive operations
VITE_OPENAI_API_KEY=your-openai-api-key-here
EOF
    check_command "Client environment template creation"
fi

# 10. Create backend Dockerfile template
log_info "Step 10: Creating backend Dockerfile template..."
cat > ~/apps/aiva/backend/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
EOF
check_command "Backend Dockerfile creation"

# 11. Create frontend Dockerfile template
log_info "Step 11: Creating frontend Dockerfile template..."
cat > ~/apps/aiva/frontend/Dockerfile << 'EOF'
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
check_command "Frontend Dockerfile creation"

# 12. Create nginx config for frontend
log_info "Step 12: Creating nginx configuration..."
cat > ~/apps/aiva/frontend/nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://aiva_backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF
check_command "Nginx configuration creation"

# 12. Generate secure JWT secret
log_info "Step 12: Generating secure JWT secret..."
JWT_SECRET=$(openssl rand -hex 64)
sed -i "s|<generate-with-openssl-rand-hex-64>|${JWT_SECRET}|g" ~/apps/aiva/.env.example
check_command "JWT secret generation"

# 13. Create setup completion script
log_info "Step 13: Creating deployment helper script..."
cat > ~/apps/setup-aiva-deployment.sh << 'EOF'
#!/bin/bash
echo "🚀 AIVA Deployment Helper"
echo "========================="
echo ""
echo "Next steps to complete your deployment:"
echo ""
echo "1. 📝 Configure your environment:"
echo "   cd ~/apps/aiva"
echo "   cp .env.example .env"
echo "   nano .env  # Edit with your actual values"
echo "   cp client.env.example client.env"
echo "   nano client.env  # Configure client-side variables"
echo ""
echo "2. 📦 Copy your AIVA code:"
echo "   # Backend:"
echo "   cp -r /path/to/your/aiva/backend/* ~/apps/aiva/backend/"
echo "   # Frontend:"
echo "   cp -r /path/to/your/aiva/client/* ~/apps/aiva/frontend/"
echo ""
echo "3. 🐳 Start AIVA services:"
echo "   cd ~/apps/aiva"
echo "   docker compose up -d"
echo ""
echo "4. 🌐 Start Nginx Proxy Manager:"
echo "   cd ~/apps/reverse-proxy"
echo "   docker compose up -d"
echo ""
echo "5. 🌍 Configure DNS:"
echo "   - Add A record: aiva.mohitrajsinh.me -> YOUR_PUBLIC_IP"
echo "   - Wait 5-10 minutes for DNS propagation"
echo ""
echo "6. 🔒 Setup SSL in Nginx Proxy Manager:"
echo "   - Visit: http://YOUR_LOCAL_IP:81"
echo "   - Login: admin@example.com / changeme"
echo "   - Add Proxy Host for aiva.mohitrajsinh.me"
echo ""
echo "7. 🔌 Configure port forwarding on your router:"
echo "   - Port 80 -> YOUR_LAPTOP_IP:80"
echo "   - Port 443 -> YOUR_LAPTOP_IP:443"
echo ""
echo "🎉 Your AIVA app will be live at: https://aiva.mohitrajsinh.me"
EOF

chmod +x ~/apps/setup-aiva-deployment.sh
check_command "Deployment helper script creation"

# 14. Display completion message
log_success "🎉 Infrastructure setup completed!"
echo ""
echo "📋 Next steps:"
echo "=============="
echo ""
echo "1. 📝 Configure your environment variables:"
echo "   cd ~/apps/aiva"
echo "   cp .env.example .env && nano .env"
echo "   cp client.env.example client.env && nano client.env"
echo "   # Note: JWT_SECRET has been pre-generated for security"
echo ""
echo "2. 📦 Copy your AIVA source code to the appropriate directories"
echo ""
echo "3. 🚀 Run the deployment helper:"
echo "   ~/apps/setup-aiva-deployment.sh"
echo ""
echo "4. 🌐 Access Nginx Proxy Manager at: http://$(hostname -I | awk '{print $1}'):81"
echo ""
echo "📖 Full documentation: ~/AIVA-DEPLOYMENT-BLUEPRINT.md"
echo ""
log_warning "Remember to change the default Nginx Proxy Manager password!"
echo ""
log_info "Setup script completed. Your system is now ready for AIVA deployment."