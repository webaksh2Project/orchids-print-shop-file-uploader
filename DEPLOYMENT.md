# 🚀 PrintShare - Deployment Guide

## Quick Start

This guide covers multiple deployment options for PrintShare.

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB database (MongoDB Atlas or self-hosted)
- Git repository
- Domain name (optional)

## 🔐 Environment Variables

Create a `.env.local` file (development) or configure environment variables in your hosting platform:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-very-long-random-secret-key-here
PORT=3000
NODE_ENV=production
```

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🌐 Deployment Options

### Option 1: Railway (Recommended - Easiest)

1. **Create Railway Account**: https://railway.app
2. **New Project → Deploy from GitHub**
3. **Select your repository**
4. **Add Environment Variables**:
   - Go to Variables tab
   - Add `MONGODB_URI` and `JWT_SECRET`
5. **Deploy**: Railway auto-detects and deploys

**Custom Start Command**: `node server.js`

### Option 2: Render

1. **Create Render Account**: https://render.com
2. **New Web Service → Connect Repository**
3. **Configure**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server.js`
   - **Environment Variables**: Add `MONGODB_URI`, `JWT_SECRET`
4. **Create Service**

### Option 3: DigitalOcean App Platform

1. **Create DigitalOcean Account**
2. **Apps → Create App → GitHub**
3. **Configure**:
   - **Run Command**: `node server.js`
   - **Build Command**: `npm run build`
4. **Add Environment Variables**
5. **Deploy**

### Option 4: Vercel (with limitations)

⚠️ **Note**: Vercel has limitations with Socket.IO due to serverless architecture. Real-time features may not work perfectly. Consider Railway/Render for full Socket.IO support.

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
vercel
```

3. **Add Environment Variables** in Vercel Dashboard

### Option 5: VPS (Ubuntu Server)

#### Step 1: Setup Server

```bash
# SSH into server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
```

#### Step 2: Clone & Setup Application

```bash
# Clone repository
git clone https://github.com/yourusername/printshare.git
cd printshare

# Install dependencies
npm install

# Create environment file
nano .env.local
# Paste environment variables and save (Ctrl+X, Y, Enter)

# Build application
npm run build
```

#### Step 3: Start with PM2

```bash
# Start application
pm2 start server.js --name printshare

# Save PM2 configuration
pm2 save

# Setup auto-restart on reboot
pm2 startup
# Run the command it outputs

# Check status
pm2 status
pm2 logs printshare
```

#### Step 4: Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/printshare
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO support
    location /api/socket {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/printshare /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Setup SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

## 📊 MongoDB Setup (Atlas)

1. **Create Account**: https://www.mongodb.com/cloud/atlas
2. **Create Cluster**: 
   - Choose free tier (M0)
   - Select region closest to your server
3. **Database Access**:
   - Create database user
   - Save username and password
4. **Network Access**:
   - Add IP: `0.0.0.0/0` (allow all) or your server IP
5. **Connect**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

## 🔍 Post-Deployment Checklist

- [ ] Application is accessible at domain/URL
- [ ] Can create shop owner account
- [ ] Login works and redirects to dashboard
- [ ] QR code displays correctly
- [ ] Customer upload page opens from QR scan
- [ ] File upload works
- [ ] Files appear in dashboard in real-time
- [ ] Download, print, delete functions work
- [ ] Files auto-delete after 24 hours
- [ ] SSL certificate installed (if custom domain)

## 🐛 Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs printshare

# Check environment variables
printenv | grep MONGODB_URI

# Test build
npm run build
```

### Database connection fails
- Verify MongoDB URI format
- Check MongoDB Atlas IP whitelist
- Test connection: `mongosh "YOUR_MONGODB_URI"`

### Socket.IO not working
- Verify server supports WebSockets
- Check firewall allows port 3000
- Ensure reverse proxy passes upgrade headers

### Files not uploading
- Check file size limit (10MB)
- Verify file MIME type is allowed
- Check rate limiting (5 uploads/min)

## 🔄 Updates & Maintenance

### Update Application (VPS)
```bash
cd /path/to/printshare
git pull
npm install
npm run build
pm2 restart printshare
```

### Backup Database
```bash
# MongoDB Atlas automatic backups (free tier)
# Or manual backup:
mongodump --uri="YOUR_MONGODB_URI" --out=./backup
```

### Monitor Application
```bash
# PM2 monitoring
pm2 monit

# Check logs
pm2 logs printshare --lines 100

# Resource usage
pm2 status
```

## 📈 Scaling Considerations

### For High Traffic:
1. **Use MongoDB Replica Set** for reliability
2. **Redis for Rate Limiting** (replace in-memory)
3. **CDN for Static Assets** (Cloudflare)
4. **Load Balancer** for multiple instances
5. **S3/Cloud Storage** for files instead of MongoDB

### Horizontal Scaling:
```bash
# Multiple PM2 instances
pm2 start server.js -i 4 --name printshare-cluster
```

## 🔒 Security Best Practices

1. **Never commit** `.env` files to Git
2. **Use strong JWT secret** (32+ characters)
3. **Enable MongoDB authentication**
4. **Use HTTPS** (SSL certificate)
5. **Keep dependencies updated**: `npm audit fix`
6. **Use firewall** (UFW on Ubuntu)
7. **Regular backups** of database
8. **Monitor logs** for suspicious activity

## 💰 Cost Estimates

### Free Tier Option:
- **MongoDB Atlas**: Free (M0 Cluster)
- **Railway**: $5/month free credits
- **Render**: Free tier available
- **Total**: ~$0-5/month

### Production Option:
- **DigitalOcean Droplet**: $6/month
- **MongoDB Atlas**: $9/month (M10)
- **Domain**: $12/year
- **Total**: ~$15-20/month

## 📞 Support

For issues:
1. Check logs: `pm2 logs` or platform logs
2. Review environment variables
3. Test database connection
4. Check firewall/network settings
5. Review ARCHITECTURE.md for system details

## 🎉 Success!

Your PrintShare application should now be live and accessible! Test all features thoroughly before announcing to users.
