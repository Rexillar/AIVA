# 🚀 AIVA Deployment Blueprint

## 📋 Overview
Complete production deployment guide for AIVA MERN application with Docker, Nginx Proxy Manager, and SSL certificates.

## 🏗️ Architecture
```
Internet → Nginx Proxy Manager (SSL/TLS) → AIVA Frontend (React) + AIVA Backend (Node.js/Express)
                                      ↓
                                MongoDB Atlas (Cloud)
```

## 📋 Prerequisites
- Ubuntu 22.04 LTS server
- Root or sudo access
- Domain name (aiva.mohitrajsinh.me)
- DNS configured to point to server IP

## 🚀 Quick Deployment

### Step 1: Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git ufw docker.io docker-compose-v2

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 81
sudo ufw --force enable
```

### Step 2: Run Setup Script
```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/your-repo/setup-aiva.sh -o setup-aiva.sh
chmod +x setup-aiva.sh
./setup-aiva.sh
```

### Step 3: Manual Configuration (if needed)
```bash
# Copy source code
cp -r AIVA-WEB-CODE/server/* ~/apps/aiva/backend/
cp -r AIVA-WEB-CODE/client/* ~/apps/aiva/frontend/

# Start services
cd ~/apps/aiva && docker compose up -d
cd ~/apps/reverse-proxy && docker compose up -d
```

## 🔧 Configuration Details

### Environment Variables
The setup script automatically configures:

**Backend (.env):**
- `NODE_ENV=production`
- `CORS_ORIGIN=https://aiva.mohitrajsinh.me`
- `CLIENT_URL=https://aiva.mohitrajsinh.me`
- MongoDB Atlas connection
- Gmail SMTP settings
- Google Cloud Storage config

**Frontend (.env):**
- `VITE_APP_API_URL=https://aiva.mohitrajsinh.me`
- OpenAI API key
- JWT secret

### Docker Services
1. **Nginx Proxy Manager** (Port 81 for admin, 80/443 for proxy)
2. **AIVA Backend** (Node.js/Express on port 5000)
3. **AIVA Frontend** (React SPA on port 3001)

### Nginx Configuration
- SSL termination at proxy level
- API routing to backend
- SPA routing for frontend
- Rate limiting and security headers

## 🌐 DNS & SSL Setup

### DNS Configuration
Point your domain `aiva.mohitrajsinh.me` to your server IP address.

### SSL Certificate
1. Access Nginx Proxy Manager at `http://your-server-ip:81`
2. Default login: admin@example.com / changeme
3. Add SSL certificate for `aiva.mohitrajsinh.me`
4. Create proxy host:
   - Domain: aiva.mohitrajsinh.me
   - Forward Hostname: aiva_frontend
   - Forward Port: 80
   - Enable SSL, HTTP/2, HSTS

## 🔍 Verification Steps

### Check Services
```bash
# Check Docker containers
docker ps

# Check logs
docker logs aiva_backend
docker logs aiva_frontend
docker logs nginx_proxy_manager
```

### Test Application
```bash
# Test backend API
curl https://aiva.mohitrajsinh.me/api/health

# Test frontend
curl -I https://aiva.mohitrajsinh.me
```

### Monitor Logs
```bash
# Follow logs in real-time
cd ~/apps/aiva && docker compose logs -f
```

## 🛠️ Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 80, 443, 81 are free
2. **DNS not propagated**: Wait for DNS propagation (up to 24h)
3. **SSL certificate issues**: Check Nginx Proxy Manager logs
4. **API connection errors**: Verify environment variables

### Logs Locations
- Application logs: `docker logs aiva_backend`
- Nginx logs: `docker logs nginx_proxy_manager`
- System logs: `journalctl -u docker`

### Backup & Recovery
```bash
# Backup environment files
cp ~/apps/aiva/.env ~/apps/aiva/.env.backup
cp ~/apps/aiva/client.env ~/apps/aiva/client.env.backup

# Backup Docker volumes
docker run --rm -v nginxproxymanager_data:/data -v $(pwd):/backup alpine tar czf /backup/nginx-backup.tar.gz -C / data
```

## 🔄 Updates & Maintenance

### Update Application
```bash
# Pull latest code
cd ~/apps/aiva/backend && git pull
cd ~/apps/aiva/frontend && git pull

# Rebuild containers
cd ~/apps/aiva && docker compose down
docker compose up -d --build
```

### Monitor Resources
```bash
# Check disk usage
df -h

# Check memory usage
docker stats

# Check logs size
du -sh ~/apps/aiva/logs/
```

## 📞 Support
- Check application logs first: `docker compose logs -f`
- Verify environment variables are loaded correctly
- Ensure MongoDB Atlas IP whitelist includes server IP
- Check Gmail SMTP settings if email features fail

## ✅ Success Checklist
- [ ] Server prepared with Docker and firewall
- [ ] Setup script executed successfully
- [ ] Source code copied to correct directories
- [ ] Docker containers running
- [ ] Nginx Proxy Manager accessible
- [ ] SSL certificate configured
- [ ] DNS pointing to server
- [ ] Application accessible at https://aiva.mohitrajsinh.me
- [ ] API endpoints responding correctly

---
**Last Updated:** $(date)
**Version:** 1.0.0

// Brute-force / DDoS protection
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX, // limit each IP
  message: "Too many requests, please try again later.",
});
app.use("/api", limiter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`AIVA backend running on ${PORT}`));
```

✅ This protects your API from brute-force, injection, and spam bots.

---

## 🧱 **Dockerfiles**

### `backend/Dockerfile`

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### `frontend/Dockerfile`

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🧩 **Docker Compose for AIVA**

`~/apps/aiva/docker-compose.yml`:

```yaml
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

  aiva_frontend:
    build: ./frontend
    container_name: aiva_frontend
    restart: always
    ports:
      - "3001:80"
    depends_on:
      - aiva_backend
```

Start your app:

```bash
docker compose up -d
```

---

## 🌐 **Reverse Proxy (Nginx Proxy Manager)**

In `~/apps/reverse-proxy/docker-compose.yml`:

```yaml
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
```

Run:

```bash
docker compose up -d
```

Access dashboard:
`http://<your-local-ip>:81`
(default credentials: `admin@example.com / changeme`)

---

## 🔌 **Router Configuration**

Log into your router → **Port Forwarding**

| External Port | Internal IP             | Internal Port | Protocol |
| ------------- | ----------------------- | ------------- | -------- |
| 80            | 192.168.x.x (laptop IP) | 80            | TCP      |
| 443           | 192.168.x.x             | 443           | TCP      |

✅ This exposes NPM to the internet.

---

## 🌍 **DNS Setup (Namecheap)**

1. Log into **Namecheap → Domain List → mohitrajsinh.me → Manage → Advanced DNS**
2. Add this record:

| Type | Host | Value              | TTL       |
| ---- | ---- | ------------------ | --------- |
| A    | aiva | `<your-public-IP>` | Automatic |

3. Wait ~5–10 minutes for propagation.

Check:

```bash
dig aiva.mohitrajsinh.me
```

If it resolves to your public IP, DNS is live.

---

## 🔒 **SSL + HTTPS Setup (via NPM)**

Go to NPM dashboard → **Add Proxy Host**

| Setting                | Value                                   |
| ---------------------- | --------------------------------------- |
| Domain Names           | `aiva.mohitrajsinh.me`                  |
| Forward Hostname/IP    | `aiva_frontend`                         |
| Forward Port           | `80`                                    |
| Scheme                 | `http`                                  |
| Enable Websockets      | ✅                                       |
| Enable Cache           | ✅                                       |
| SSL                    | Request new certificate (Let’s Encrypt) |
| Force SSL              | ✅                                       |
| HTTP to HTTPS Redirect | ✅                                       |

Save → Restart proxy.
Now open `https://aiva.mohitrajsinh.me` — fully secure.

---

## ⚡ **Extra Hardening Tips**

* Add **Fail2Ban** if you open SSH publicly:

  ```bash
  sudo apt install fail2ban -y
  ```
* Run `ufw status` regularly to confirm firewall rules.
* Add Cloudflare DNS (optional) for extra protection.
* For email forms, add hCaptcha or Cloudflare Turnstile to prevent bot submissions.

---

## 🧠 **Subdomain Setup (Namecheap)**

If you want multiple apps (e.g., `kidcrafthub.mohitrajsinh.me`):

In Namecheap DNS:

| Type | Host        | Value              | TTL       |
| ---- | ----------- | ------------------ | --------- |
| A    | kidcrafthub | `<your-public-IP>` | Automatic |

Then in NPM:

* New Proxy Host: `kidcrafthub.mohitrajsinh.me`
* Forward Host: `kidcrafthub_frontend`
* Port: `80`
* SSL: Enable + Auto

✅ Done — new subdomain live instantly.

---

## ✅ **End State**

| Domain                          | Hosted On       | Description |
| ------------------------------- | --------------- | ----------- |
| **mohitrajsinh.me**             | Vercel          | Portfolio   |
| **aiva.mohitrajsinh.me**        | Laptop (Docker) | AIVA app    |
| **kidcrafthub.mohitrajsinh.me** | Laptop (Docker) | Future app  |

Your stack is now:

* Dockerized
* HTTPS-secured
* Firewall-protected
* Rate-limited
* Auto-restart capable
* Subdomain-scalable

---

## 🚀 **Quick Start Commands**

```bash
# 1. System setup
sudo apt update && sudo apt upgrade -y
sudo apt install git curl ufw ca-certificates gnupg lsb-release -y

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Create directory structure
mkdir -p ~/apps/reverse-proxy ~/apps/aiva/backend ~/apps/aiva/frontend

# 4. Clone your AIVA repo
cd ~/apps/aiva
git clone <your-aiva-repo> .

# 5. Setup environment
cp .env.example .env
nano .env  # Edit with your secrets

# 6. Start services
docker compose up -d
cd ../reverse-proxy
docker compose up -d
```

---

*This deployment blueprint ensures your AIVA app is production-ready with enterprise-grade security, automatic SSL, and scalable architecture.*