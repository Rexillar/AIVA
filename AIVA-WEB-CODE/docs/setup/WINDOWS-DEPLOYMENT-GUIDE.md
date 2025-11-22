# 🚀 AIVA Windows Deployment Guide

## 📋 Quick Start

### Step 1: Run Deployment Setup
1. Right-click `deploy-aiva-windows-final.bat`
2. Select "Run as administrator"
3. Wait for setup to complete

### Step 2: Configure Network
1. **Open Windows Firewall ports:**
   - Go to Windows Defender Firewall → Advanced Settings
   - Inbound Rules → New Rule → Port → TCP 80,443 → Allow

2. **Port Forwarding on Router:**
   - Access your router admin panel
   - Forward ports 80 and 443 to your Windows machine IP

3. **DNS Configuration:**
   - Point `aiva.mohitrajsinh.me` to your public IP address

### Step 3: Start AIVA
1. Run `C:\AIVA-Production\start-aiva.bat` as administrator
2. Wait for Docker containers to build and start
3. Access: http://aiva.mohitrajsinh.me

## 🔧 Architecture

```
Internet → Windows Firewall → Nginx Proxy → AIVA Frontend + AIVA Backend
                                      ↓
                                MongoDB Atlas (Cloud)
```

## 📁 File Structure
```
C:\AIVA-Production\
├── aiva\
│   ├── backend\        # Node.js/Express API
│   ├── frontend\       # React SPA
│   ├── .env           # Backend environment
│   ├── client.env     # Frontend environment
│   └── docker-compose.yml
├── reverse-proxy\      # Nginx reverse proxy
│   ├── docker-compose.yml
│   └── nginx.conf
├── start-aiva.bat     # Deployment script
└── SSL-SETUP.md       # HTTPS instructions
```

## 🌐 Domain & SSL

### HTTP Access (Current)
- URL: http://aiva.mohitrajsinh.me
- Status: ✅ Working after DNS and port forwarding

### HTTPS Setup (Optional)
Follow `SSL-SETUP.md` for SSL certificate setup.

## 🔍 Troubleshooting

### Check Services
```cmd
docker ps
```

### View Logs
```cmd
# Backend logs
docker logs aiva_backend

# Frontend logs
docker logs aiva_frontend

# Nginx logs
docker logs nginx_proxy
```

### Common Issues
1. **Port 80/443 blocked:** Check Windows Firewall and router
2. **DNS not resolving:** Wait for DNS propagation (24h)
3. **Containers not starting:** Check Docker Desktop is running
4. **API connection failed:** Verify environment variables

### Restart Services
```cmd
cd C:\AIVA-Production\aiva
docker compose down
docker compose up -d --build

cd C:\AIVA-Production\reverse-proxy
docker compose down
docker compose up -d --build
```

## 📊 Monitoring

### Health Check
```cmd
curl http://localhost:3000
curl http://localhost:5000/api/health
```

### Resource Usage
```cmd
docker stats
```

## 🔄 Updates

### Update Application
1. Copy new code to `C:\AIVA-Production\aiva\backend\` and `frontend\`
2. Run `start-aiva.bat` to rebuild containers

### Backup
```cmd
# Backup environment files
copy C:\AIVA-Production\aiva\.env C:\AIVA-Production\aiva\.env.backup
copy C:\AIVA-Production\aiva\client.env C:\AIVA-Production\aiva\client.env.backup
```

## 📞 Support

- Check Docker logs first: `docker logs [container_name]`
- Verify DNS: `nslookup aiva.mohitrajsinh.me`
- Test local access: http://localhost:3000
- Check public IP: Visit `whatismyipaddress.com`

---
**Deployment Date:** $(date)
**Status:** Ready for production