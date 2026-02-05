## DealHub India - Complete Deployment Guide

### 1. Prepare for Production

#### 1.1 Build Optimization

```bash
# Test production build locally
npm run build
npm start

# Check bundle size
npm run analyze
```

#### 1.2 Environment Variables

Create `.env.production.local`:

```env
# Database (use managed PostgreSQL)
DATABASE_URL="postgresql://user:pass@db-host:5432/dealhub_prod"

# NextAuth
NEXTAUTH_URL="https://dealhub.in"
NEXTAUTH_SECRET="generate-long-random-secret-change-this"

# OAuth (production credentials)
GOOGLE_CLIENT_ID="prod-google-id"
GOOGLE_CLIENT_SECRET="prod-google-secret"

# Razorpay (live keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxxx"
RAZORPAY_SECRET_KEY="secret"

# Redis (managed Redis service)
REDIS_URL="redis://user:pass@redis-host:6379"

# Email (production SMTP)
SMTP_HOST="smtp.sendgrid.net"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-key"

# Security
CRON_SECRET="generate-random-secret-for-cron"
SENTRY_DSN="your-sentry-dsn"

# Extension
NEXT_PUBLIC_EXTENSION_ID="akdjfowijef"
EXTENSION_API_SECRET="secret-key"
```

---

### 2. Deploy to Vercel (Recommended)

#### 2.1 Vercel Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Deploy to production
vercel --prod
```

#### 2.2 Configure in Vercel Dashboard

1. Go to vercel.com → Settings
2. Environment Variables:
   - Add all from `.env.production.local`
   - Ensure they're available in Production
3. Build Settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### 2.3 Database Setup

```bash
# Option A: Use Vercel Postgres (easiest)
# In Vercel dashboard: Add PostgreSQL integration

# Option B: Use external PostgreSQL
# In .env.production.local, set DATABASE_URL to external DB

# Run migrations on production
NEXT_PUBLIC_DISABLE_TELEMETRY=1 vercel env pull
npx prisma migrate deploy
```

#### 2.4 Cron Jobs on Vercel

```bash
# Add to vercel.json
{
  "crons": [{
    "path": "/api/cron/update-prices",
    "schedule": "0 */4 * * *"
  }]
}
```

#### 2.5 Domain & SSL

1. Add domain in Vercel dashboard
2. Update DNS records
3. SSL automatically provisioned

---

### 3. Deploy to AWS

#### 3.1 RDS Database

```bash
# Create PostgreSQL RDS instance
aws rds create-db-instance \
  --db-instance-identifier dealhub-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 20

# Get endpoint
aws rds describe-db-instances --query 'DBInstances[0].Endpoint.Address'
```

#### 3.2 ElastiCache (Redis)

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id dealhub-cache \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

#### 3.3 EC2 App Server

```bash
# Launch EC2 instance (Ubuntu 22.04)
aws ec2 run-instances \
  --image-id ami-0c94855ba95c574c8 \
  --instance-type t3.small \
  --key-name dealhub-key

# SSH into instance
ssh -i dealhub-key.pem ubuntu@<public-ip>

# Setup Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <repo>
cd deal-hub
npm install
npm run build

# Setup PM2
npm install -g pm2
pm2 start npm --name "dealhub" -- start
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt-get install nginx
# Configure /etc/nginx/sites-available/default
sudo systemctl start nginx
```

#### 3.4 S3 for Static Assets

```bash
# Create S3 bucket
aws s3 mb s3://dealhub-assets

# Configure for CDN
aws s3api put-bucket-cors --bucket dealhub-assets \
  --cors-configuration file://cors.json
```

#### 3.5 CloudFront CDN

```bash
# Create distribution
aws cloudfront create-distribution --distribution-config file://cf-config.json

# Point to S3 origin
```

---

### 4. Deploy to DigitalOcean App Platform

#### 4.1 Connect Repository

1. Create app.yaml:

```yaml
name: dealhub
services:
  - name: api
    github:
      repo: your-org/dealhub
      branch: main
    build_command: npm run build
    run_command: npm start
    envs:
      - key: DATABASE_URL
        scope: RUN_TIME
        value: ${db.connection_string}
databases:
  - name: db
    engine: PG
    version: "14"
    production: true
```

#### 4.2 Deploy

```bash
# Using doctl CLI
doctl apps create --spec app.yaml
```

#### 4.3 Configure Domain

1. Add domain in DigitalOcean dashboard
2. Update DNS nameservers
3. Enable HTTPS

---

### 5. Database Migrations

#### 5.1 First Deployment

```bash
# Create database
createdb dealhub_prod

# Run all migrations
DATABASE_URL="prod-url" npx prisma migrate deploy

# Seed initial data
DATABASE_URL="prod-url" npx prisma db seed
```

#### 5.2 Ongoing Migrations

```bash
# Create migration
npx prisma migrate dev --name add_new_feature

# Apply in production
DATABASE_URL="prod-url" npx prisma migrate deploy

# Rollback if needed
DATABASE_URL="prod-url" npx prisma migrate resolve --rolled-back add_new_feature
```

---

### 6. Security Hardening

#### 6.1 Environment Secrets

- Use managed secrets service (not in git)
- Rotate NEXTAUTH_SECRET regularly
- Use production Razorpay keys only in prod

#### 6.2 HTTPS/TLS

```bash
# Vercel: Automatic
# AWS: Use ACM certificates
# DigitalOcean: Automatic

# Force HTTPS in next.config.js
redirects() {
  return [{
    source: '/:path*',
    destination: 'https://dealhub.in/:path*',
    permanent: true,
  }]
}
```

#### 6.3 CORS & CSP Headers

```typescript
// next.config.js
async headers() {
  return [{
    source: '/:path*',
    headers: [
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' *.google.com *.razorpay.com",
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
    ],
  }]
}
```

#### 6.4 Rate Limiting

- Implemented in `/src/lib/rate-limit.ts`
- Uses Redis for distributed rate limiting

---

### 7. Monitoring & Logging

#### 7.1 Error Tracking (Sentry)

```typescript
// src/instrumentation.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

#### 7.2 Performance Monitoring

```bash
# Install Datadog agent
dd_trace npm start
```

#### 7.3 Logs

```bash
# Vercel: Built-in
# AWS: CloudWatch
# DigitalOcean: Syslog forwarding

# View logs
vercel logs --prod
```

---

### 8. Cron Jobs

#### 8.1 Price Update Job

Runs every 4 hours to update product prices

```
GET /api/cron/update-prices?token=CRON_SECRET
```

#### 8.2 Alert Trigger Job

Runs every 30 minutes to check and send price alerts

#### 8.3 Cleanup Job

Runs daily to clean old notifications, sessions

---

### 9. Chrome Extension Deployment

#### 9.1 Update Extension

```bash
# Update version in extension/manifest.json
"version": "1.0.1"

# Zip extension
cd extension
zip -r ../dealhub-extension.zip .

# Go to Chrome Web Store Developer Console
# Upload new version
```

#### 9.2 Auto-Update

- Chrome automatically pushes updates to users within hours
- No user action needed

---

### 10. CI/CD Pipeline

#### 10.1 GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm test
      - run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

### 11. Backup Strategy

#### 11.1 Database Backups

```bash
# Daily backup
pg_dump dealhub_prod > backup-$(date +%Y%m%d).sql

# AWS RDS: Automated backups (7 days default)
# DigitalOcean: Automated backups
```

#### 11.2 Disaster Recovery

- Keep backups in multiple regions
- Document recovery procedures
- Test restores quarterly

---

### 12. Scaling

#### 12.1 Horizontal Scaling

- Vercel: Automatic
- AWS: Use Auto Scaling Group
- DigitalOcean: Manual scaling

#### 12.2 Database Scaling

```bash
# Upgrade RDS instance
aws rds modify-db-instance \
  --db-instance-identifier dealhub-db \
  --db-instance-class db.t3.medium \
  --apply-immediately
```

#### 12.3 Redis Scaling

- Use Redis cluster mode for horizontal scaling
- Implement sharding for large datasets

---

### 13. Cost Optimization

- Use spot instances on AWS (30-70% discount)
- CDN for static assets
- Compress images and minify CSS/JS
- Database query optimization
- Archive old data to S3

---

### 14. Troubleshooting

**Extension not updating?**

- Check manifest.json version
- Wait up to 2 hours for Chrome update propagation

**High database latency?**

- Check connection pool size
- Enable query caching in Redis
- Consider read replicas

**OOM errors?**

- Increase server memory
- Check for memory leaks
- Implement pagination

---

### 15. Monitoring Checklist

- [ ] App uptime monitoring
- [ ] Database performance alerts
- [ ] API response time alerts
- [ ] Error rate monitoring
- [ ] Disk space alerts
- [ ] Memory usage alerts
- [ ] SSL certificate renewal

---

**Deployment complete! Monitor for 24-48 hours after going live.**
