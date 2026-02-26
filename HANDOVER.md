# NeoQuant MLM ROI System — Project Handover

**Project Name:** NeoQuant  
**GitHub Repo:** https://github.com/theacetrader09-sudo/NewROI  
**Tech Stack:** Next.js 16 · TypeScript · Prisma · PostgreSQL · NextAuth.js · Tailwind CSS  
**Version Handed Over:** February 2026  

---

## 🗂 What This Project Is

NeoQuant is a full-stack **MLM (Multi-Level Marketing) ROI investment platform** where:

- Users register using a referral code
- Users invest money and earn daily ROI (Return on Investment)
- ROI is distributed automatically every day via a cron job
- Referrers earn commission up to **10 levels deep** in the MLM tree
- Admin can manage users, packages, withdrawals, and system settings
- Users can withdraw their balance after OTP email verification

---

## 🏗 Project Architecture

```
NeoQuant/
├── prisma/                  ← Database schema (PostgreSQL)
│   ├── schema.prisma        ← Main DB models
│   └── schema.production.prisma
├── src/
│   ├── app/
│   │   ├── page.tsx         ← Landing page (root)
│   │   ├── login/           ← Login page
│   │   ├── register/        ← Signup page (referral code required)
│   │   ├── dashboard/       ← User dashboard (all user screens)
│   │   │   ├── page.tsx     ← Main dashboard home
│   │   │   ├── deposit/     ← Deposit / investment flow
│   │   │   ├── withdraw/    ← Withdrawal flow
│   │   │   ├── network/     ← MLM network tree view
│   │   │   ├── transactions/ ← Transaction history
│   │   │   ├── settings/    ← User profile settings
│   │   │   └── missed-opportunities/ ← Missed ROI tracking
│   │   ├── admin/           ← Admin panel (SUPERADMIN only)
│   │   └── api/             ← All API routes (backend logic)
│   │       ├── auth/        ← NextAuth login/register/OTP
│   │       ├── invest/      ← Deposit & investment approval
│   │       ├── withdraw/    ← Withdrawal processing
│   │       ├── user/        ← User profile, balance, network
│   │       ├── admin/       ← Admin-only actions
│   │       ├── cron/        ← Daily ROI distribution job
│   │       └── settings/    ← System settings (ROI %, levels)
│   ├── components/          ← All UI components
│   │   ├── dashboard/       ← Dashboard-specific cards/widgets
│   │   └── landing/         ← Landing page sections
│   └── lib/                 ← Shared utilities, Prisma client, auth config
```

---

## 🔑 Key Features Built

| Feature | Status | Notes |
|---------|--------|-------|
| User registration with referral code | ✅ Complete | Referral code is mandatory |
| Email OTP verification | ✅ Complete | Uses Gmail SMTP or Resend |
| Login / session auth | ✅ Complete | NextAuth.js with JWT |
| Investment / Deposit flow | ✅ Complete | Manual TXID submission + Admin approval |
| Daily ROI distribution | ✅ Complete | Cron job at `/api/cron/daily-roi` |
| 10-level MLM commission | ✅ Complete | Admin-configurable % per level |
| Withdrawal with OTP | ✅ Complete | Email OTP required |
| MLM network tree viewer | ✅ Complete | Visual referral tree |
| Missed ROI tracker | ✅ Complete | Shows lost commissions |
| Level unlock progress | ✅ Complete | Users see progress to next level |
| Admin panel | ✅ Complete | Manage users, packages, settings |
| Announcements system | ✅ Complete | Admin posts, shows on dashboard |
| Recent Payouts live ticker | ✅ Complete | Animated scrolling, 500+ names |

---

## 👤 User Roles

| Role | Access |
|------|--------|
| `USER` | Dashboard, deposit, withdraw, network, settings |
| `SUPERADMIN` | Everything + Admin panel at `/admin` |

**To make someone an admin:** Update their `role` to `"SUPERADMIN"` in the database.

---

## 💰 How ROI Works

1. User submits deposit with TXID proof
2. Admin approves → investment becomes `ACTIVE`
3. Every day at midnight, cron job runs `/api/cron/daily-roi`
4. Each active investment earns `dailyRoiPercent` (default: 1% per day, configurable)
5. ROI is added to user's balance
6. Commission flows up to 10 upline levels based on `levelConfig` % settings

---

## 📧 Email System

Two options (set in `.env`):
- **Gmail SMTP** — use `GMAIL_USER` + `GMAIL_APP_PASSWORD`
- **Resend** — use `RESEND_API_KEY` + `FROM_EMAIL`

Emails sent for: OTP verification, withdrawal confirmation, admin notifications.

---

## 🔄 Cron Job Setup (IMPORTANT)

The daily ROI does NOT run automatically unless you set up a cron trigger.

**Production option:** Use [cron-job.org](https://cron-job.org) (free) to call:
```
GET https://yourdomain.com/api/cron/daily-roi
Header: x-cron-secret: YOUR_CRON_SECRET
```
Schedule: `0 0 * * *` (midnight daily)

---

## 📞 Support Contacts

- **Original Developer:** Available via handover chat
- **GitHub Repo:** https://github.com/theacetrader09-sudo/NewROI
- **AI Assistant (Antigravity):** Can read all code and continue development

---

*For step-by-step setup, see `2_SETUP_GUIDE.md`*  
*For environment variables, see `3_ENV_VARIABLES_GUIDE.md`*  
*For going live, see `4_DEPLOYMENT_GUIDE.md`*
