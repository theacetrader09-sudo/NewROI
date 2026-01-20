# Production Database Reconciliation Guide

## Important: Run This After Deployment

After Vercel finishes deploying the code fixes, you need to fix existing balances in the production database.

## Steps to Run on Production

### Option 1: Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Run the reconciliation script on production
vercel env pull .env.production
DATABASE_URL=\$(grep DATABASE_URL .env.production | cut -d '=' -f2-) node scripts/reconcile-balances.js
```

### Option 2: Direct Database Access

If you have direct access to your production database:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run the script
node scripts/reconcile-balances.js
```

### Option 3: Create a Temporary API Endpoint

1. Create file: `src/app/api/admin/reconcile-balances/route.ts`

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    
    if (!session || (userRole !== "ADMIN" && userRole !== "SUPERADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Copy the logic from scripts/reconcile-balances.js here
    // ... (reconciliation logic)
    
    return NextResponse.json({ success: true, results });
}
```

2. Deploy this endpoint
3. Call it via: `POST https://your-app.vercel.app/api/admin/reconcile-balances`
4. Remove the endpoint after use

## What the Script Does

✅ Recalculates all user balances from transaction history  
✅ Fixes any discrepancies caused by the deposit bug  
✅ Shows detailed report of all corrections  
✅ Safe to run multiple times (idempotent)

## Expected Results

Based on local testing:
- Most users will already have correct balances
- Users who made package deposits will have balances corrected
- No data is lost, only corrected

## After Running

1. Verify a few user balances manually
2. Check that withdrawals still work correctly
3. Monitor for 24 hours

## Need Help?

If you encounter issues, the reconciliation script output will show:
- Which users were affected
- What their balances were before/after
- Total number of corrections made
