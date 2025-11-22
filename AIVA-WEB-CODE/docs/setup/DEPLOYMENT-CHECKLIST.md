# 🚀 AIVA Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. DNS Configuration (Namecheap)
- [ ] Log in to Namecheap account
- [ ] Go to Domain List → mohitrajsinh.me → Manage → Advanced DNS
- [ ] Add A Record:
  - Host: `aiva`
  - Type: `A Record`
  - Value: `[YOUR_PUBLIC_IP]`
  - TTL: `600`
- [ ] Save changes
- [ ] Test: `nslookup aiva.mohitrajsinh.me` returns your IP

### 2. Network Configuration
- [ ] **Router Port Forwarding:**
  - Port 80 → Your Windows machine IP
  - Port 443 → Your Windows machine IP
- [ ] **Windows Firewall:**
  - Allow inbound TCP 80, 443
- [ ] **Public IP:** Note your current public IP address

### 3. Windows Machine Setup
- [ ] Docker Desktop installed and running
- [ ] Run `run-deployment.bat` as administrator
- [ ] Verify `C:\AIVA-Production\` folder created

## 🚀 Deployment Steps

### 4. Deploy AIVA
- [ ] Run `C:\AIVA-Production\start-aiva.bat` as administrator
- [ ] Wait for Docker containers to build and start
- [ ] Check: `docker ps` shows 3 containers running

### 5. Test Deployment
- [ ] **Local Test:** http://localhost:3000
- [ ] **Public Test:** http://aiva.mohitrajsinh.me
- [ ] **API Test:** http://aiva.mohitrajsinh.me/api/health

## 🔐 Optional: HTTPS Setup

### 6. SSL Certificate (Choose One)
- [ ] **CloudFlare (Recommended):**
  - Sign up for CloudFlare
  - Add domain mohitrajsinh.me
  - Enable SSL/TLS
- [ ] **Let's Encrypt:**
  - Install certbot
  - Run: `certbot certonly --standalone -d aiva.mohitrajsinh.me`
- [ ] **Self-Signed (Development):**
  - Generate certificates
  - Update nginx.conf

## 📊 Verification Checklist

### 7. Final Verification
- [ ] DNS resolves: `aiva.mohitrajsinh.me` → Your IP
- [ ] HTTP access works: http://aiva.mohitrajsinh.me
- [ ] Application loads correctly
- [ ] API endpoints respond
- [ ] No console errors in browser
- [ ] Mobile responsive design works

## 🛠️ Troubleshooting

### If Something Doesn't Work
- [ ] Check Docker logs: `docker logs aiva_backend`
- [ ] Verify DNS: `nslookup aiva.mohitrajsinh.me`
- [ ] Test local access: http://localhost:3000
- [ ] Check firewall: Ports 80, 443 open
- [ ] Verify router forwarding: Ports 80, 443 → Your machine

## 📞 Emergency Contacts

- **DNS Issues:** Namecheap Support
- **Network Issues:** Your ISP/Router manual
- **Application Issues:** Check Docker logs first

---

## 🎯 Success Criteria

✅ **AIVA is live at:** http://aiva.mohitrajsinh.me
✅ **All features working:** Login, notes, tasks, etc.
✅ **Responsive design:** Works on mobile/desktop
✅ **API responding:** Backend communication working

**Deployment Complete!** 🎉