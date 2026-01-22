# 🚀 MLM ROI System - Complete Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Domain & Hosting Setup](#domain--hosting-setup)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Deployment to Production](#deployment-to-production)
6. [Initial System Setup](#initial-system-setup)
7. [Admin Panel Access](#admin-panel-access)
8. [Ongoing Maintenance](#ongoing-maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### What You'll Need:
- ✅ **Domain Name** (Already purchased from Namecheap)
- ✅ **GitHub Account** (for code repository)
- ✅ **Vercel Account** (Free - for hosting the application)
- ✅ **PostgreSQL Database** (Free options available)
- ✅ **BSCScan API Key** (Free - for blockchain verification)
- ✅ **Email Service** (Optional - for notifications)

### Technical Requirements:
- Basic understanding of copying/pasting commands
- Access to domain DNS settings
- 30-60 minutes setup time

---

## Domain & Hosting Setup

### ⚠️ Important Note:
This is a **Next.js application** and **CANNOT run on traditional Namecheap shared hosting**. You need to use **Vercel** (free) for hosting, but you can still use your Namecheap domain.

### Step 1: Keep Your Namecheap Domain
1. Log in to **Namecheap**
2. Go to **Domain List** → Click **Manage** on your domain
3. Keep the domain active (you'll point it to Vercel later)

### Step 2: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Choose **Continue with GitHub**
4. Authorize Vercel to access GitHub

---

## Database Setup

### Option 1: Neon (Recommended - Free)

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up with GitHub
   - Click **Create a Project**

2. **Configure Database**
   - Project Name: `mlm-roi-production`
   - Region: Choose closest to your users
   - PostgreSQL Version: 15 (default)
   - Click **Create Project**

3. **Get Connection String**
   - Copy the **Connection String** shown
   - Format: `postgresql://user:password@host/database?sslmode=require`
   - **SAVE THIS - You'll need it later!**

### Option 2: Supabase (Alternative - Free)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to **Settings** → **Database**
4. Copy **Connection String** (Transaction mode)

---

## Environment Configuration

### Step 1: Get BSCScan API Key

1. Go to [bscscan.com](https://bscscan.com)
2. Sign up for free account
3. Go to **API-KEYs** → **Add**
4. Copy your **API Key**

### Step 2: Prepare Environment Variables

Create a file called `.env` with these values:

```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="GENERATE_RANDOM_STRING_HERE"
NEXTAUTH_URL="https://yourdomain.com"

# BSCScan API
NEXT_PUBLIC_BSCSCAN_API_KEY="your_bscscan_api_key_here"

# Admin Credentials (First Time Setup)
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="ChangeThisPassword123!"
```

### Step 3: Generate NEXTAUTH_SECRET

**Option A: Online Generator**
- Go to [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)
- Copy the generated string

**Option B: Command Line**
```bash
openssl rand -base64 32
```

---

## Deployment to Production

### Step 1: Push Code to GitHub

1. **Create GitHub Repository**
   - Go to [github.com](https://github.com)
   - Click **New Repository**
   - Name: `mlm-roi-system`
   - Set to **Private**
   - Click **Create Repository**

2. **Push Code** (Already done if you have the code)
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/mlm-roi-system.git
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **Import Git Repository**
   - Select your `mlm-roi-system` repository
   - Click **Import**

2. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave default)
   - Click **Deploy**

3. **Add Environment Variables**
   - While deployment is running, click **Environment Variables**
   - Add ALL variables from `.env` file above
   - For each variable:
     - Name: `DATABASE_URL`
     - Value: `your_actual_value`
     - Environment: Production, Preview, Development (check all)
   - Click **Add** for each variable

4. **Redeploy**
   - After adding environment variables
   - Go to **Deployments** tab
   - Click **⋮** (three dots) on latest deployment
   - Click **Redeploy**

### Step 3: Setup Database Tables

1. **Install Prisma CLI** (if not already done)
   ```bash
   npm install -g prisma
   ```

2. **Initialize Database**
   ```bash
   cd /path/to/mlm-roi-system
   npx prisma generate
   npx prisma db push
   ```

3. **Create Admin User**
   ```bash
   node scripts/create-admin.js
   ```
   
   If script doesn't exist, run this in Prisma Studio:
   ```bash
   npx prisma studio
   ```
   Then manually create admin user with hashed password.

### Step 4: Connect Your Namecheap Domain

1. **Get Vercel Domain**
   - In Vercel dashboard, go to your project
   - Click **Settings** → **Domains**
   - You'll see a default domain like `mlm-roi-system.vercel.app`

2. **Add Custom Domain**
   - Click **Add Domain**
   - Enter: `yourdomain.com` and `www.yourdomain.com`
   - Click **Add**

3. **Configure Namecheap DNS**
   - Go to Namecheap → Domain List → Manage
   - Click **Advanced DNS**
   - Delete all existing records
   - Add these records:

   | Type  | Host | Value | TTL |
   |-------|------|-------|-----|
   | A Record | @ | 76.76.21.21 | Automatic |
   | CNAME | www | cname.vercel-dns.com | Automatic |

4. **Verify Domain**
   - Back in Vercel, click **Verify** 
   - Wait 5-10 minutes for DNS propagation
   - Your site will be live at `yourdomain.com`! 🎉

---

## Initial System Setup

### Step 1: Access Admin Panel

1. Go to `https://yourdomain.com/admin`
2. Login with admin credentials from `.env`
3. **IMMEDIATELY change password** in settings

### Step 2: Configure System Settings

1. **Admin Wallet Address**
   - Navigate to: Admin Panel → Settings → Admin Wallet
   - Enter your USDT BEP20 wallet address
   - Click **Update Wallet Address**
   - Default: `0x15C1eC04D1Db26ff82d66b0654790335292BdB66`

2. **ROI Settings**
   - Navigate to: Admin Panel → Settings → ROI Settings
   - Set Daily ROI Percentage (default: 1%)
   - Click **Update ROI Percentage**

3. **Commission Levels**
   - Navigate to: Admin Panel → Settings → Commission Levels
   - Configure 10-level commission rates
   - Default: [6%, 5%, 2%, 2%, 1%, 1%, 0.5%, 0.5%, 0.25%, 0.10%]
   - Click **Update Commission Rates**

### Step 3: Test User Registration

1. Open incognito window
2. Go to `https://yourdomain.com/signup`
3. Create a test user account
4. Verify you can login
5. Test deposit page shows correct wallet address

### Step 4: Setup ROI Cron Job

**Option A: Vercel Cron (Recommended)**

Create `vercel.json` in project root:
```json
{
  "crons": [{
    "path": "/api/cron/daily-roi",
    "schedule": "0 0 * * *"
  }]
}
```

**Option B: External Cron Service**
1. Go to [cron-job.org](https://cron-job.org)
2. Create account
3. Add new cron job:
   - URL: `https://yourdomain.com/api/cron/daily-roi`
   - Schedule: Daily at 00:00 UTC
   - Add header: `Authorization: Bearer YOUR_SECRET_KEY`

---

## Admin Panel Access

### Login Credentials
- **URL**: `https://yourdomain.com/admin`
- **Email**: Your admin email from `.env`
- **Password**: Your admin password from `.env`

### Key Admin Functions

1. **Deposits Management** (`/admin/deposits`)
   - Approve/reject pending deposits
   - View transaction verification status
   - Automatic TXID verification from BSCScan

2. **Withdrawals Management** (`/admin/withdrawals`)
   - View withdrawal requests
   - See NET payout amount (after 5% fee)
   - Approve and process payouts
   - Destination wallet addresses provided

3. **User Management** (`/admin/users`)
   - View all users
   - Edit user balances (if needed)
   - View user investment history
   - Check referral trees

4. **System Settings** (`/admin/settings`)
   - Update ROI percentage
   - Modify commission levels
   - Change admin wallet address
   - Toggle maintenance mode
   - Enable/disable ROI distribution

---

## Ongoing Maintenance

### Daily Tasks
- ✅ Check ROI distribution ran successfully (automated)
- ✅ Review pending deposits
- ✅ Process withdrawal requests

### Weekly Tasks
- ✅ Monitor user growth
- ✅ Check system balance integrity
- ✅ Review commission payouts

### Monthly Tasks
- ✅ Backup database
- ✅ Review system settings
- ✅ Check Vercel usage limits

### Database Backup (Important!)

**Automated Backup:**
- Neon includes automatic backups
- Go to Neon dashboard → Backups
- Can restore to any point in time

**Manual Backup:**
```bash
pg_dump DATABASE_URL > backup-$(date +%Y%m%d).sql
```

---

## Troubleshooting

### Issue: "Database connection failed"
**Solution:**
1. Check `DATABASE_URL` in Vercel environment variables
2. Verify database is active in Neon/Supabase
3. Test connection: `npx prisma db push`

### Issue: "Admin login not working"
**Solution:**
1. Check `NEXTAUTH_SECRET` is set
2. Verify `NEXTAUTH_URL` matches your domain
3. Try creating new admin user via Prisma Studio

### Issue: "Domain not connecting"
**Solution:**
1. Wait 24 hours for DNS propagation
2. Verify DNS records in Namecheap
3. Check SSL certificate status in Vercel

### Issue: "Withdrawal fee not showing"
**Solution:**
1. Clear browser cache
2. Check latest deployment is live
3. Verify changes are pushed to GitHub

### Issue: "ROI not distributing"
**Solution:**
1. Check cron job is configured
2. Verify ROI Holiday is OFF in settings
3. Check cron job logs in Vercel

---

## Security Checklist

Before going live, ensure:
- [ ] Changed default admin password
- [ ] Updated admin wallet address
- [ ] Environment variables secured in Vercel
- [ ] Database has SSL enabled
- [ ] NEXTAUTH_SECRET is unique and random
- [ ] Repository is set to Private
- [ ] ROI cron job has authentication
- [ ] Test all user flows work correctly

---

## Support & Updates

### Getting Help
- Check Vercel deployment logs
- Review database logs in Neon
- Test in development: `npm run dev`

### Applying Updates
```bash
git pull origin main
npm install
npx prisma generate
npx prisma db push
git push origin main
```
(Vercel auto-deploys on push)

---

## Quick Reference

### Important URLs
| Service | URL | Purpose |
|---------|-----|---------|
| Live Site | https://yourdomain.com | User-facing app |
| Admin Panel | https://yourdomain.com/admin | Admin dashboard |
| Vercel Dashboard | https://vercel.com | Hosting management |
| Database | https://neon.tech | Database management |
| GitHub | https://github.com | Code repository |

### Important Commands
```bash
# Start development server
npm run dev

# Update database schema
npx prisma db push

# Open database viewer
npx prisma studio

# Check database connection
npx prisma db pull

# Deploy to production
git push origin main
```

---

## Client Handover Checklist

- [ ] Repository access transferred to client's GitHub
- [ ] Vercel project ownership transferred
- [ ] Database credentials shared securely
- [ ] Admin credentials provided
- [ ] Domain DNS updated
- [ ] SSL certificate verified
- [ ] All features tested
- [ ] Backup procedure documented
- [ ] Client trained on admin panel
- [ ] Support contact information provided

---

**🎉 Deployment Complete!**

Your MLM ROI system is now live and ready for users. Monitor the first few days closely and ensure all automated processes are running smoothly.

For any issues, check the troubleshooting section or review deployment logs in Vercel.
