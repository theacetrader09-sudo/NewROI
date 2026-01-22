# 🚀 Quick Start Guide - For Client

## What You Need (5 Minutes)

1. **GitHub Account** - [Sign up here](https://github.com/signup)
2. **Vercel Account** - [Sign up here](https://vercel.com) (use GitHub)
3. **Database** - [Get free database](https://neon.tech) (use GitHub)
4. **BSC API Key** - [Get free key](https://bscscan.com/apis)

---

## Setup in 4 Steps

### Step 1: Get the Code (2 minutes)
1. Developer will transfer GitHub repository to your account
2. You'll receive an email invitation - accept it
3. Repository will appear at: `github.com/YOUR_USERNAME/mlm-roi-system`

### Step 2: Setup Database (3 minutes)
1. Go to [neon.tech](https://neon.tech)
2. Sign in with GitHub
3. Click **Create Project**
4. Copy the **connection string** - looks like:
   ```
   postgresql://user:pass@host.neon.tech/dbname
   ```
5. **SAVE THIS STRING!**

### Step 3: Deploy to Vercel (5 minutes)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Repository**
3. Select `mlm-roi-system`
4. Click **Deploy**
5. While deploying, add these **Environment Variables**:

```env
DATABASE_URL=your_database_string_from_step2
NEXTAUTH_SECRET=generate_at_https://generate-secret.vercel.app/32
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_BSCSCAN_API_KEY=your_bscscan_key
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
```

6. Click **Redeploy** after adding variables

### Step 4: Connect Your Domain (10 minutes)
1. In Vercel, go to **Settings** → **Domains**
2. Add your domain: `yourdomain.com`
3. Vercel will show you DNS settings
4. Go to Namecheap → Your Domain → Advanced DNS
5. Add these records:
   - **A Record**: @ → 76.76.21.21
   - **CNAME**: www → cname.vercel-dns.com
6. Wait 10 minutes
7. Your site is LIVE! 🎉

---

## First Login

1. Go to: `https://yourdomain.com/admin`
2. Login with email/password from Step 3
3. **Change your password immediately!**
4. Update wallet address in Settings

---

## Daily Operations

### Approve Deposits
1. Go to `/admin/deposits`
2. Review pending deposits
3. Click **Approve** or **Reject**

### Process Withdrawals
1. Go to `/admin/withdrawals`
2. See amount to pay (after 5% fee deducted)
3. Send USDT to user's wallet
4. Click **Approve**

### Monitor System
- `/admin/users` - View all users
- `/admin/settings` - Change ROI, fees, wallet
- `/admin/balance-check` - Verify system balances

---

## Help & Support

**Issue?** Contact your developer or check:
- Vercel deployment logs
- Database connection in Neon dashboard
- DNS settings in Namecheap

**Need Changes?** Developer can push updates to GitHub, Vercel auto-deploys.

---

## Important Notes

⚠️ **Namecheap Hosting**: You CANNOT use Namecheap shared hosting for this app. Use Vercel (free) instead.

⚠️ **Backups**: Neon automatically backs up your database daily.

⚠️ **Security**: Never share your environment variables or admin password.

✅ **Cost**: Vercel + Neon + BSCScan = **100% FREE** for normal usage!

---

That's it! Your MLM ROI platform is ready to use. 🚀
