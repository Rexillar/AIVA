# 🌐 Namecheap DNS Configuration for AIVA

## 📋 Prerequisites
- Domain: `mohitrajsinh.me` registered with Namecheap
- Public IP address of your Windows machine
- Access to Namecheap account

## 🚀 Step-by-Step DNS Setup

### Step 1: Access Namecheap DNS Settings
1. Log in to your Namecheap account
2. Go to **Domain List** → Click on `mohitrajsinh.me`
3. Click **Manage** → **Advanced DNS**

### Step 2: Add A Record for Subdomain
1. Click **Add New Record**
2. Select **A Record** from the Type dropdown
3. Fill in the following:

```
Type: A Record
Host: aiva
Value: [YOUR_PUBLIC_IP_ADDRESS]
TTL: 600 (or Auto)
```

**Example:**
```
Type: A Record
Host: aiva
Value: 123.45.67.89
TTL: 600
```

### Step 3: Verify DNS Propagation
1. Save the changes
2. Wait 5-15 minutes for DNS propagation
3. Test the configuration:
   ```cmd
   nslookup aiva.mohitrajsinh.me
   ```
   Should return your public IP address

## 🔍 DNS Records Overview

### Current Records (Keep Existing)
- **@ (Root domain)**: Points to your main website
- **www**: CNAME to @
- Other existing records

### New Record Added
- **aiva**: A Record → Your public IP

## 🌐 What This Achieves

After configuration:
- `mohitrajsinh.me` → Your main website
- `www.mohitrajsinh.me` → Your main website
- `aiva.mohitrajsinh.me` → Your AIVA application (Windows machine)

## ⚠️ Important Notes

### Dynamic IP Address
If your public IP changes frequently:
1. Use a Dynamic DNS service (DDNS)
2. Or update the A record manually when IP changes
3. Services like No-IP or DuckDNS can help

### Port Forwarding Required
Ensure your router forwards:
- Port 80 → Your Windows machine
- Port 443 → Your Windows machine (for HTTPS)

### Firewall Configuration
Windows Firewall must allow:
- Port 80 (HTTP)
- Port 443 (HTTPS)

## 🔧 Testing Configuration

### Test DNS Resolution
```cmd
nslookup aiva.mohitrajsinh.me
```

### Test HTTP Access
```cmd
curl http://aiva.mohitrajsinh.me
```

### Test Local Access
```cmd
curl http://localhost:3000
```

## 📞 Troubleshooting

### DNS Not Resolving
- Wait longer (up to 24 hours for full propagation)
- Check if IP address is correct
- Verify record was saved in Namecheap

### Connection Refused
- Check if AIVA is running: `docker ps`
- Verify port forwarding on router
- Check Windows Firewall settings

### Wrong IP Showing
- Clear DNS cache: `ipconfig /flushdns`
- Try different DNS server: `8.8.8.8`

## 📋 Quick Reference

**Namecheap DNS Settings:**
- Login → Domain List → mohitrajsinh.me → Manage → Advanced DNS

**Record Details:**
```
Host: aiva
Type: A
Value: [YOUR_PUBLIC_IP]
TTL: 600
```

**Test Commands:**
```cmd
nslookup aiva.mohitrajsinh.me
ping aiva.mohitrajsinh.me
```

---
**Configuration Date:** November 8, 2025
**Domain:** aiva.mohitrajsinh.me
**Purpose:** AIVA Application Deployment