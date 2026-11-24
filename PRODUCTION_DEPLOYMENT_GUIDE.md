# Production Deployment Guide — The Sovereign Blade

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [SSL/HTTPS Configuration](#ssltls-configuration)
7. [Custom Domain Setup](#custom-domain-setup)
8. [Environment Variables](#environment-variables)
9. [Monitoring & Logging](#monitoring--logging)
10. [Backup & Recovery](#backup--recovery)
11. [Scaling Strategy](#scaling-strategy)
12. [Troubleshooting](#troubleshooting)
13. [Post-Deployment](#post-deployment)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (CI/CD shows green)
- [ ] Code reviewed by team member
- [ ] No hardcoded secrets in code
- [ ] No TODO/FIXME comments in critical code
- [ ] Git history clean (meaningful commits)

### Security
- [ ] All credentials in environment variables
- [ ] Database password strong (20+ characters)
- [ ] API keys rotated (if reusing from dev)
- [ ] No debug mode enabled
- [ ] CORS properly configured for production URLs
- [ ] Rate limiting configured
- [ ] SQL injection/XSS protections enabled

### Performance
- [ ] Frontend build optimized (npm run build)
- [ ] Database indexes created
- [ ] API caching configured
- [ ] Static assets compressed
- [ ] Database query times acceptable
- [ ] Load time < 3 seconds on 4G

### Documentation
- [ ] README updated with live URLs
- [ ] API documentation generated
- [ ] Deployment runbook created
- [ ] Disaster recovery plan documented
- [ ] Team knows deployment procedure

### Infrastructure
- [ ] Domains registered
- [ ] SSL certificates ready
- [ ] Email for alerts configured
- [ ] Backup storage allocated
- [ ] Monitoring tools set up

---

## Infrastructure Setup

### Services Overview

```
┌─────────────────────────────────────────────────────┐
│                    Internet Users                     │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   Vercel CDN              GitHub (Source)
   (Frontend)
        │                             │
        │                       ┌─────┴─────┐
        │                       │            │
        ▼                       ▼            ▼
   Deployment          Webhooks       Actions CI/CD
   (auto)                             (testing)
        │
        └───────────┬──────────────────────────┐
                    │                          │
                    ▼                          ▼
              Render Backend            Neon Database
              (FastAPI)                 (PostgreSQL)
                    │                          │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                        │
                    ▼                        ▼
              Twilio SMS              Razorpay Payments
              (Optional)              (Optional)
```

### Account Setup

#### 1. Vercel (Frontend Hosting)

**Prerequisites:**
- GitHub account
- Domain (optional, Vercel provides free `.vercel.app`)

**Steps:**

1. **Sign up:**
   - Go to https://vercel.com
   - Click "Sign up"
   - Use GitHub account

2. **Import repository:**
   - Click "New Project"
   - Select `C---Project` repository
   - Click "Import"

3. **Configure:**
   - Framework: **Vite**
   - Root Directory: **frontend**
   - Build Command: **npm run build**
   - Output Directory: **dist**
   - Environment Variables:
     - `VITE_API_BASE_URL` = `https://your-backend.com`

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Visit URL (e.g., `https://sovereign-blade.vercel.app`)

#### 2. Render (Backend Hosting)

**Prerequisites:**
- GitHub account
- Render account

**Steps:**

1. **Sign up:**
   - Go to https://render.com
   - Click "Sign up"
   - Use GitHub account

2. **Create from blueprint:**
   - Click "New +"
   - Select "Web Service"
   - Connect GitHub repository
   - Select `C---Project`

3. **Use blueprint:**
   - Render auto-detects `backend/render.yaml`
   - Click "Create Web Service"
   - Service deploys automatically

4. **Configure:**
   - Wait for deployment to complete
   - Visit service URL (e.g., `https://sovereign-blade-backend.onrender.com`)
   - Verify health check passes

#### 3. Neon (PostgreSQL Database)

**Prerequisites:**
- Neon account

**Steps:**

1. **Sign up:**
   - Go to https://neon.tech
   - Sign up with GitHub (easiest)

2. **Create project:**
   - Click "New Project"
   - Name: `sovereign-blade`
   - Region: **India (mumbai)** or closest
   - PostgreSQL version: **15**

3. **Get connection string:**
   - Project → "Connection Details"
   - Use **Pooler URL** (for serverless):
     ```
     postgresql://user:password@ep-xyz.us-east-1.neon.tech/dbname?sslmode=require
     ```

4. **Copy to Render:**
   - Render dashboard → Backend service
   - Settings → Environment Variables
   - Add: `DATABASE_URL=` (paste from Neon)

---

## Database Setup

### Initial Schema Creation

**Method 1: Via Alembic (Recommended)**

```bash
# From local machine (or Render shell)
cd backend
source .venv/bin/activate

# Set database URL
export DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"

# Run all migrations
alembic upgrade head

# Verify
psql $DATABASE_URL -c "SELECT version FROM alembic_version;"
```

**Method 2: Via Render Shell**

```bash
# In Render dashboard:
1. Backend service → Shell
2. Run:
   cd backend
   source venv/bin/activate
   export DATABASE_URL=$DATABASE_URL
   alembic upgrade head
```

### Seed Initial Data

Create `backend/app/db/seed.py`:

```python
from app.crud import queue as queue_crud
from app.db.session import SessionLocal

db = SessionLocal()

# Add services
services = [
    {"name": "Classic Haircut", "price": 500, "duration": 30},
    {"name": "Beard Trim", "price": 300, "duration": 15},
    {"name": "Hot Shave", "price": 400, "duration": 20},
    {"name": "Executive Cut", "price": 700, "duration": 45},
    {"name": "Kids Haircut", "price": 250, "duration": 20},
    {"name": "Hair Coloring", "price": 1500, "duration": 60},
]

for svc in services:
    queue_crud.create_service(db, **svc)

# Add barbers
barbers = [
    {"name": "Rajan Mehta", "specialty": "Classic styles"},
    {"name": "Arjun Shah", "specialty": "Modern cuts"},
    {"name": "Vikram Patel", "specialty": "Beard specialist"},
    {"name": "Nikhil Kumar", "specialty": "All services"},
]

for barber in barbers:
    queue_crud.create_barber(db, **barber)

db.commit()
print("✅ Database seeded successfully")
```

Run:
```bash
python backend/app/db/seed.py
```

### Backup Neon Database

**Automatic backups (Neon):**
- Daily automatic backups
- Retained for 7 days (free tier)
- Upgrade plan for longer retention

**Manual backup:**
```bash
pg_dump postgresql://user:password@host/db > backup.sql
```

---

## Backend Deployment

### On Render

#### Step 1: Connect GitHub

1. Render dashboard
2. Click "New +"
3. Select "Web Service"
4. Connect GitHub
5. Select `C---Project` repository
6. Use `backend/render.yaml` blueprint (auto-detected)

#### Step 2: Configure Environment

```yaml
# render.yaml includes:
services:
  - type: web
    name: sovereign-blade-backend
    env: python
    region: singapore
    plan: free
    runtime: python-3.12
    build:
      command: "pip install -r requirements.txt"
    start: "uvicorn app.main:app --host 0.0.0.0 --port 8000"
```

#### Step 3: Set Environment Variables

**In Render dashboard:**

1. Backend service → Settings
2. Environment Variables section
3. Add each variable:

```
ENVIRONMENT=production
SECRET_KEY=<generate-random-string>
DATABASE_URL=postgresql://...neon.tech...
FRONTEND_URL=https://sovereign-blade.vercel.app
ALLOWED_ORIGINS=https://sovereign-blade.vercel.app

# Optional: SMS
TWILIO_ACCOUNT_SID=<if-using-sms>
TWILIO_AUTH_TOKEN=<if-using-sms>
TWILIO_PHONE_NUMBER=+91...

# Optional: Payments
RAZORPAY_KEY_ID=<if-using-payments>
RAZORPAY_KEY_SECRET=<if-using-payments>
```

#### Step 4: Deploy

1. Click "Create Web Service"
2. Render starts deployment
3. Waits 2-3 minutes
4. Check status (blue = healthy)
5. Verify health check: `GET /health`

#### Step 5: Verify Deployment

```bash
# Test health
curl https://your-backend.onrender.com/health

# Test API
curl https://your-backend.onrender.com/api/v1/queue/services

# View logs
# Render dashboard → Backend → Logs
```

---

## Frontend Deployment

### On Vercel

#### Step 1: Import Repository

1. Vercel dashboard
2. Click "New Project"
3. Select `C---Project` repository
4. Click "Import"

#### Step 2: Configure Build

```
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Node.js Version: 20.x
```

#### Step 3: Set Environment Variables

```
VITE_API_BASE_URL=https://your-backend.onrender.com
```

#### Step 4: Deploy

1. Click "Deploy"
2. Vercel builds and deploys
3. Wait 2-3 minutes
4. Visit Vercel URL

#### Step 5: Verify

1. Open https://your-frontend.vercel.app
2. Test all pages:
   - `/` — Home page
   - `/join` — Join queue
   - `/walk-in` — Walk-in registration
   - `/reception` — Reception dashboard
3. Verify API calls succeed (check Network tab)

---

## SSL/TLS Configuration

### Automatic (Recommended)

**Vercel:**
- SSL automatically enabled
- Free Let's Encrypt certificate
- Auto-renewal
- HTTPS enforced by default

**Render:**
- SSL automatically enabled
- Free Let's Encrypt certificate
- Auto-renewal
- HTTPS enforced

### Custom Certificate (If Needed)

1. Generate or purchase SSL certificate
2. Vercel → Settings → SSL/TLS
3. Upload certificate + private key
4. Done

---

## Custom Domain Setup

### Register Domain

**Options:**
- Namecheap
- GoDaddy
- Google Domains
- Route 53 (AWS)

**Recommended:** Namecheap (cheap, easy)

### Map to Vercel

1. **Vercel dashboard:**
   - Your project → Settings → Domains
   - Add Domain
   - Type your domain: `sovereignblade.app`

2. **Vercel provides nameservers:**
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

3. **Update domain registrar:**
   - Namecheap → Domain List
   - Your domain → Manage
   - Nameservers → Custom
   - Add Vercel nameservers

4. **Wait 24-48 hours** for DNS propagation

5. **Verify:**
   - `nslookup sovereignblade.app`
   - Should resolve to Vercel

### Map to Render

1. **Render dashboard:**
   - Backend service → Settings
   - Custom Domain
   - Add: `api.sovereignblade.app`

2. **Render provides CNAME:**
   ```
   CNAME: xxx.onrender.com
   ```

3. **Update domain registrar:**
   - Namecheap → Domain
   - Advanced DNS
   - Add CNAME record:
     ```
     Name: api
     Value: xxx.onrender.com
     TTL: 3600
     ```

4. **Wait 24-48 hours**

5. **Verify:**
   - `curl https://api.sovereignblade.app/health`

### Update Frontend Environment Variable

1. Vercel → Your project → Settings → Environment Variables
2. Update: `VITE_API_BASE_URL=https://api.sovereignblade.app`
3. Redeploy: Deployments → Redeploy

---

## Environment Variables

### Complete Production Configuration

**backend/.env (Production):**

```bash
# Application
ENVIRONMENT=production
SECRET_KEY=generate-with: openssl rand -hex 32
APP_NAME=The Sovereign Blade
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://user:password@host:5432/db?sslmode=require

# CORS
FRONTEND_URL=https://sovereignblade.app
ALLOWED_ORIGINS=https://sovereignblade.app

# SMS (Optional)
TWILIO_ACCOUNT_SID=xxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE_NUMBER=+91xxxxxxxxxx

# Payments (Optional)
RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=xxxx
```

**frontend/.env.production:**

```bash
VITE_API_BASE_URL=https://api.sovereignblade.app
```

### How to Set Variables

**Render:**
1. Backend service → Settings
2. Environment Variables
3. Add each variable
4. Service auto-redeploys

**Vercel:**
1. Project → Settings → Environment Variables
2. Add each variable
3. Click "Save"
4. Redeploy

---

## Monitoring & Logging

### Render Logs

**View in dashboard:**
1. Backend service → Logs
2. See all requests, errors, debug output
3. Stream in real-time
4. Download logs (up to 7 days free)

**Alert on errors:**
1. Render → Notifications
2. Email on service failure
3. Slack integration available

### Vercel Logs

**View in dashboard:**
1. Project → Deployments
2. Click deployment
3. See build logs
4. Function logs (serverless)

**Production monitoring:**
- Vercel Analytics (free)
- Track page load times, CLS, etc.

### Application Monitoring

**Add to backend (app/main.py):**

```python
import logging
from pythonjsonlogger import jsonlogger

# JSON logging for production
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)
```

### Health Checks

**Automatic (Render):**
- Checks `/health` every 10 minutes
- Restart if unhealthy
- Alert on repeated failures

**Manual check:**
```bash
curl https://api.sovereignblade.app/health
# Output: {"status": "healthy", "version": "1.0.0"}
```

---

## Backup & Recovery

### Database Backups

**Neon (Automatic):**
- Daily backups
- 7 days retention (free)
- 30 days retention (paid)

**Manual backup:**
```bash
pg_dump postgresql://user:password@host/db > backup-$(date +%Y%m%d).sql
```

**Restore from backup:**
```bash
psql postgresql://user:password@host/db < backup-20240115.sql
```

### Application Backups

**GitHub:**
- All code in GitHub
- Complete history
- Branch protection prevents accidental deletes

**Render:**
- Keep deployment configuration in `render.yaml`
- Keep in GitHub (source of truth)

**Vercel:**
- Build artifacts stored
- Download if needed

---

## Scaling Strategy

### As Users Grow

#### 100-500 Daily Users (Current)
- ✅ Vercel free tier (sufficient)
- ✅ Render free tier (sufficient)
- ✅ Neon free tier (sufficient)
- Estimated cost: $0-5/month

#### 500-2,000 Daily Users
- ✅ Upgrade to Vercel Pro ($20/month)
- ✅ Upgrade Render to Paid ($12-50/month)
- ✅ Upgrade Neon to Paid ($10-100/month)
- Estimated cost: $50-150/month

#### 2,000+ Daily Users
- ✅ Vercel Enterprise or move to AWS/GCP
- ✅ Multiple Render instances with load balancing
- ✅ Dedicated PostgreSQL instance
- ✅ Redis cache layer
- Estimated cost: $500-2,000+/month

### Database Scaling

```
Growth Phase → Solution
─────────────────────────
< 10GB data → Neon free
10-100GB    → Neon paid instance
> 100GB     → Dedicated PostgreSQL (AWS RDS, etc.)
```

### CDN Optimization

Vercel already includes:
- Global CDN edge caching
- Automatic image optimization
- API route edge functions

No additional setup needed for most use cases.

---

## Troubleshooting

### Backend Won't Start

**Check:**
```bash
# 1. Logs
Render dashboard → Backend → Logs

# 2. Environment variables
Settings → Environment Variables (all set?)

# 3. Database connection
curl -X POST https://api.sovereignblade.app/health

# 4. Manual check locally
cd backend
source venv/bin/activate
export DATABASE_URL=...
python app/main.py
```

### Frontend Shows Blank

**Check:**
```bash
# 1. Browser console for errors
F12 → Console tab

# 2. Network tab
See if API calls failing

# 3. Environment variable
Vercel → Environment Variables
VITE_API_BASE_URL set?

# 4. Build output
Vercel → Deployments → See if build succeeded
```

### API Returns 500 Error

**Check:**
```bash
# 1. Logs
Render dashboard → Logs (see error)

# 2. Database connection
psql postgresql://...

# 3. Environment variables
All Twilio/Razorpay keys set?

# 4. Test locally
cd backend && pytest -v
```

### Deployment Takes Forever

**Check:**
```bash
# 1. Render logs
See if stuck on "npm install" or similar

# 2. GitHub Actions
Check if code was pushed correctly

# 3. Build cache
Clear and redeploy

# 4. Manual redeploy
Render/Vercel → Deployments → Redeploy
```

### CORS Errors in Console

**Fix:**
1. Render → Backend → Settings
2. Environment Variables
3. Update `ALLOWED_ORIGINS` to match frontend URL
4. Redeploy
5. Clear browser cache (Ctrl+Shift+Del)

---

## Post-Deployment

### Verification Checklist

After deploying to production:

- [ ] Frontend loads at custom domain
- [ ] All pages accessible
- [ ] Responsive on mobile
- [ ] API calls work (check Network tab)
- [ ] SMS sending works (send test from reception)
- [ ] Payments work (use test mode)
- [ ] Database has seed data
- [ ] Health check passes
- [ ] Logs show normal traffic
- [ ] No console errors

### First Day Monitoring

**Hour 1-2:**
- Monitor logs closely
- Test all features
- Check error rates

**Hour 2-6:**
- Monitor performance
- Track response times
- Watch for spikes

**Day 2-7:**
- Monitor trending metrics
- Check daily backups
- Verify email alerts work

### Team Communication

**Notify team:**
```
Subject: 🚀 Sovereign Blade - Production Live!

✅ Frontend: https://sovereignblade.app
✅ Backend: https://api.sovereignblade.app
✅ API Docs: https://api.sovereignblade.app/docs

Features enabled:
- Walk-in registration
- SMS notifications (Twilio)
- Payment processing (Razorpay - requires keys)

Do NOT:
- Change secrets directly
- Access production database unnecessarily
- Deploy untested code

Emergency contacts: [add team members]
```

### Documentation Updates

Update your internal wiki/docs:

1. **Production URLs**
   - Frontend: https://sovereignblade.app
   - Backend: https://api.sovereignblade.app
   - Database: Neon connection details

2. **Credentials Location**
   - Render environment variables
   - Vercel environment variables
   - Database credentials (LastPass/1Password)

3. **Deployment Procedure**
   - Push to `main` branch
   - GitHub Actions runs tests
   - CI passes → Vercel + Render auto-deploy
   - Live in 2-3 minutes

4. **Rollback Procedure**
   - Revert commit in GitHub
   - Push to main
   - CI/CD auto-deploys previous version
   - Or manually redeploy in Vercel/Render

---

## Maintenance Schedule

### Daily
- Monitor error logs
- Check database backups executed
- Verify health checks passing

### Weekly
- Review performance metrics
- Check dependency updates
- Test backup restoration

### Monthly
- Security audit
- Dependency updates & testing
- Performance optimization
- Database maintenance

### Quarterly
- Full disaster recovery test
- Capacity planning
- Architecture review
- Security penetration test

---

## Production Architecture Diagram

```
┌─────────────────────────────────────────────┐
│          Internet (Users)                   │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   Vercel CDN           Route 53 DNS
   (Edge)              (Custom domain)
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
         sovereignblade.app
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   HTML/CSS/JS      API Requests
   React Bundle     (REST)
        │                     │
        │                ┌────┴────────────┐
        │                │                 │
        └───────┬────────┴──────┐          │
                │               │          │
                ▼               ▼          ▼
            Render          Render      Twilio/
            (Frontend)      (Backend)   Razorpay
                │               │       (Optional)
                │        ┌──────┴─────┐
                │        │            │
                │        ▼            ▼
                │      Neon DB    Queue Tasks
                │   (PostgreSQL)  (Celery)
                │
        Backups (Daily)
        Logs (7 days)
        Monitoring
```

---

## Security Checklist

- [ ] All secrets in environment variables
- [ ] Database password strong (20+ chars)
- [ ] API keys rotated quarterly
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] SSL/TLS enforced
- [ ] DDoS protection active (Render includes)
- [ ] Database backups encrypted
- [ ] Access logs monitored
- [ ] Intrusion detection alerts set
- [ ] Team members use 2FA on all accounts
- [ ] Deployment requires code review

---

## Support & Links

| Service | Link | Support |
|---------|------|---------|
| Vercel | https://vercel.com | support@vercel.com |
| Render | https://render.com | support@render.com |
| Neon | https://neon.tech | help@neon.tech |
| GitHub | https://github.com | support.github.com |
| Twilio | https://twilio.com | support@twilio.com |
| Razorpay | https://razorpay.com | support@razorpay.com |

---

## Deployment Summary

**Expected Timeline:**

| Step | Duration |
|------|----------|
| Accounts setup | 15 min |
| GitHub Actions setup | 10 min |
| Database setup | 10 min |
| Backend deploy (Render) | 10 min |
| Frontend deploy (Vercel) | 10 min |
| Domain setup (DNS) | 24-48 hrs |
| Testing | 30 min |
| **Total** | **~1.5 hours** |

**After deployment:**
- ✅ Application live
- ✅ Automated testing on every commit
- ✅ Auto-deployment to production
- ✅ Monitoring & alerting active
- ✅ Daily backups running
- ✅ Zero-downtime deployments

---

## 🎉 You're Live!

Congratulations! The Sovereign Blade is now running in production with:

✅ Fast global CDN (Vercel)  
✅ Reliable backend API (Render)  
✅ Secure PostgreSQL database (Neon)  
✅ Automated testing (GitHub Actions)  
✅ Continuous deployment  
✅ 99.5% uptime SLA  
✅ Daily automated backups  
✅ SMS notifications (Twilio)  
✅ Payment processing (Razorpay)  
✅ Production monitoring  

**Share with the world! 🚀**

---

**Production Go-Live Date:** [Add date]  
**Status:** ✅ **PRODUCTION ACTIVE**  
**Uptime:** 99.5%+  
**Support:** [Add team contact info]
