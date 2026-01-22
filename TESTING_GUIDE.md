# 🧪 MLM ROI System - Complete Testing & Security Guide

## Table of Contents
1. [Security Testing](#security-testing)
2. [Load & Stress Testing](#load--stress-testing)
3. [Functional Testing](#functional-testing)
4. [Database Integrity Testing](#database-integrity-testing)
5. [Edge Case Testing](#edge-case-testing)
6. [Automated Testing Setup](#automated-testing-setup)

---

## Security Testing

### Authentication & Authorization Vulnerabilities

#### Test 1: SQL Injection
**What to test:** Database query manipulation

**Tools:**
```bash
# Install sqlmap
pip install sqlmap

# Test login endpoints
sqlmap -u "https://yourdomain.com/api/auth/signin" --data="email=test@test.com&password=test" --batch
```

**Manual Tests:**
1. Try SQL injection in login:
   - Email: `admin@test.com' OR '1'='1`
   - Password: `anything`
   - **Expected:** Should fail, show "Invalid credentials"

2. Test deposit TXID field:
   - TXID: `' OR 1=1--`
   - **Expected:** Should reject invalid format

3. Test amount fields:
   - Amount: `100' OR '1'='1`
   - **Expected:** Should only accept numbers

#### Test 2: Authentication Bypass
**Manual Tests:**
```bash
# Try accessing admin without login
curl https://yourdomain.com/api/admin/settings

# Try manipulating session tokens
# 1. Login normally
# 2. Copy session cookie
# 3. Modify cookie value
# 4. Try accessing admin panel
# Expected: Should redirect to login
```

#### Test 3: Authorization Escalation
**Test Steps:**
1. Create regular user account
2. Login as regular user
3. Try accessing: `/api/admin/settings`
4. Try accessing: `/api/admin/deposits/approve`
5. **Expected:** All should return 401 Unauthorized

#### Test 4: XSS (Cross-Site Scripting)
**Test in all input fields:**
```javascript
// Test in: Name, Email, Wallet Address, TXID
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
javascript:alert('XSS')
```

**Expected:** Input should be sanitized, no alerts should appear

#### Test 5: CSRF (Cross-Site Request Forgery)
**Create test HTML file:**
```html
<!DOCTYPE html>
<html>
<body>
<form action="https://yourdomain.com/api/withdraw" method="POST">
  <input type="hidden" name="amount" value="1000">
  <input type="hidden" name="walletAddress" value="attacker-wallet">
  <input type="submit" value="Click me">
</form>
<script>document.forms[0].submit();</script>
</body>
</html>
```
**Expected:** Request should fail (CSRF token missing/invalid)

---

## Load & Stress Testing

### Tool 1: Apache Benchmark (ab)

**Install:**
```bash
# macOS (already included)
which ab

# Or install httpd
brew install httpd
```

**Test 1: Homepage Load Test**
```bash
# 1000 requests, 10 concurrent
ab -n 1000 -c 10 https://yourdomain.com/

# Expected results:
# - Requests per second: > 50
# - Failed requests: 0
# - Time per request: < 200ms
```

**Test 2: API Endpoint Stress**
```bash
# Test login endpoint
ab -n 500 -c 5 -p login.json -T "application/json" https://yourdomain.com/api/auth/signin

# Create login.json:
echo '{"email":"test@test.com","password":"test123"}' > login.json
```

**Test 3: Database-Heavy Operations**
```bash
# Test user profile (requires auth)
ab -n 200 -c 10 -H "Cookie: next-auth.session-token=YOUR_TOKEN" https://yourdomain.com/api/user/profile

# Expected:
# - All requests succeed
# - No database timeouts
# - Response time consistent
```

### Tool 2: K6 Load Testing (Advanced)

**Install:**
```bash
brew install k6
```

**Create test script:** `load-test.js`
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 50 },  // Spike to 50 users
    { duration: '1m', target: 50 },   // Stay at 50
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% errors
  },
};

export default function () {
  // Test homepage
  let res = http.get('https://yourdomain.com');
  check(res, { 'status is 200': (r) => r.status === 200 });
  
  sleep(1);
  
  // Test signup page
  res = http.get('https://yourdomain.com/signup');
  check(res, { 'signup loads': (r) => r.status === 200 });
  
  sleep(1);
}
```

**Run test:**
```bash
k6 run load-test.js
```

**Expected Results:**
- ✅ All checks pass
- ✅ HTTP errors < 1%
- ✅ 95th percentile < 500ms
- ✅ No server crashes

### Tool 3: Artillery (Comprehensive)

**Install:**
```bash
npm install -g artillery
```

**Create test:** `artillery-test.yml`
```yaml
config:
  target: "https://yourdomain.com"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Spike test"

scenarios:
  - name: "User journey"
    flow:
      - get:
          url: "/"
      - get:
          url: "/signup"
      - post:
          url: "/api/auth/signup"
          json:
            email: "test{{ $randomString() }}@test.com"
            password: "Test123!@#"
            name: "Test User"
            referralCode: "WELCOME"
      - think: 3
      - get:
          url: "/dashboard"
```

**Run:**
```bash
artillery run artillery-test.yml
```

---

## Functional Testing

### Critical User Flows

#### Test 1: User Registration & Login
**Steps:**
1. Go to `/signup`
2. Fill form with:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `Test123!@#`
   - Referral: `WELCOME` (or valid code)
3. Submit
4. **Check:** User created in database
5. Logout
6. Login with same credentials
7. **Check:** Login successful, redirected to dashboard

#### Test 2: Deposit Flow (Full Cycle)
**Scenario A: USDT Deposit**
1. Login as user
2. Go to `/dashboard/deposit`
3. Select "Activate Package"
4. Enter amount: `$100`
5. **Check:** Shows correct wallet address (from admin settings)
6. **Check:** Summary shows processing fee
7. Paste valid TXID
8. Submit
9. **Check:** Deposit appears in pending (if not auto-verified)
10. Login as admin
11. Approve deposit
12. **Check:** User balance updated OR investment created

**Scenario B: Wallet Balance Deposit**
1. User has $500 balance
2. Select "Activate Package"
3. Select payment method: "Wallet Balance"
4. Enter amount: `$100`
5. **Check:** Shows balance deduction preview
6. Submit
7. **Check:** Balance decremented by $100
8. **Check:** Investment created immediately (ACTIVE)
9. **Check:** ROI starts next day

**Edge Cases:**
- Amount < $10: Should show instant alert
- Amount > balance: Should show error
- Invalid TXID: Should reject
- Duplicate TXID: Should reject

#### Test 3: Withdrawal Flow (Full Cycle with 5% Fee)
1. User has $1000 balance
2. Go to `/dashboard/withdraw`
3. Enter amount: `$100`
4. **Check:** Shows breakdown:
   - Withdrawal Amount: $100.00
   - Platform Fee (5%): -$5.00
   - Network Fee: -$0.29
   - You Will Receive: **$94.71**
5. Enter wallet address
6. Submit
7. **Check:** User balance reduced by $100
8. **Check:** Transaction created with amount = $94.71
9. **Check:** Fee transaction created separately ($5.00)
10. Login as admin → `/admin/withdrawals`
11. **Check:** Shows $94.71 (net payout)
12. Approve withdrawal
13. **Check:** Transaction status = COMPLETED

**Edge Cases:**
- Amount < $10: Should reject
- Amount > balance: Should reject
- Invalid wallet: Should reject
- Balance exactly $100: Should work, show correct fees

#### Test 4: ROI Distribution
**Manual Test:**
1. Create test investment (ACTIVE status)
2. Run ROI cron manually:
   ```bash
   curl -X POST https://yourdomain.com/api/cron/daily-roi \
     -H "Authorization: Bearer YOUR_SECRET"
   ```
3. **Check:** User balance increased by 1% of investment
4. **Check:** Transaction record created
5. **Check:** Commission distributed to upline (if exists)

#### Test 5: Referral & Commission System
**10-Level Test:**
1. Create 10 test users in chain:
   - User1 (no referrer)
   - User2 (referred by User1)
   - User3 (referred by User2)
   - ... up to User10
2. User10 deposits $1000
3. **Check commissions paid:**
   - User9: 6% = $60
   - User8: 5% = $50
   - User7: 2% = $20
   - User6: 2% = $20
   - User5: 1% = $10
   - User4: 1% = $10
   - User3: 0.5% = $5
   - User2: 0.5% = $5
   - User1: 0.25% = $2.50
4. **Check:** All balances updated correctly
5. **Check:** Transaction records exist

---

## Database Integrity Testing

### Test 1: Balance Reconciliation
**Create script:** `check-balances.js`
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBalances() {
  const users = await prisma.user.findMany({
    include: {
      transactions: true,
      investments: true,
    }
  });

  for (const user of users) {
    // Calculate expected balance
    let expectedBalance = 0;
    
    for (const tx of user.transactions) {
      if (tx.type === 'DEPOSIT' || tx.type === 'ROI' || tx.type === 'COMMISSION') {
        expectedBalance += Number(tx.amount);
      } else if (tx.type === 'WITHDRAWAL' || tx.type === 'INVESTMENT') {
        expectedBalance -= Number(tx.amount);
      }
    }

    const actualBalance = Number(user.balance);
    const diff = Math.abs(actualBalance - expectedBalance);

    if (diff > 0.01) {
      console.error(`❌ User ${user.email}: Expected ${expectedBalance}, Got ${actualBalance}`);
    } else {
      console.log(`✅ User ${user.email}: Balance correct (${actualBalance})`);
    }
  }
}

checkBalances();
```

**Run:**
```bash
node check-balances.js
```

### Test 2: Orphaned Records
```sql
-- Check for investments without users
SELECT * FROM "Investment" 
WHERE "userId" NOT IN (SELECT id FROM "User");

-- Check for transactions without users
SELECT * FROM "Transaction" 
WHERE "userId" NOT IN (SELECT id FROM "User");

-- Check for duplicate TXIDs
SELECT txid, COUNT(*) 
FROM "Investment" 
GROUP BY txid 
HAVING COUNT(*) > 1;
```

### Test 3: Race Condition Test (Critical!)
**Test concurrent withdrawals:**

Create `race-test.js`:
```javascript
const axios = require('axios');

async function testRaceCondition() {
  const sessionToken = 'YOUR_SESSION_TOKEN';
  
  // Try to withdraw $100 twice simultaneously
  const promises = [
    axios.post('https://yourdomain.com/api/withdraw', {
      amount: 100,
      walletAddress: 'test-wallet-1'
    }, { headers: { cookie: `next-auth.session-token=${sessionToken}` }}),
    
    axios.post('https://yourdomain.com/api/withdraw', {
      amount: 100,
      walletAddress: 'test-wallet-2'
    }, { headers: { cookie: `next-auth.session-token=${sessionToken}` }})
  ];

  try {
    const results = await Promise.all(promises);
    console.log('Both withdrawals succeeded - POTENTIAL BUG!');
  } catch (error) {
    console.log('One withdrawal failed - CORRECT BEHAVIOR');
  }
}
```

**Expected:** Only ONE withdrawal should succeed (database transaction protection)

---

## Edge Case Testing

### Boundary Value Testing

#### Deposit Amounts
```
Test values:
- $0.00 - Should reject
- $9.99 - Should reject (instant alert)
- $10.00 - Should accept ✅
- $10.01 - Should accept ✅
- $999999.99 - Should accept ✅
- Negative value - Should reject
- Non-numeric - Should reject
- Empty - Should reject
```

#### Withdrawal Amounts
```
Test values:
- $0.00 - Should reject
- $9.99 - Should reject
- $10.00 - Should accept ✅
- Balance + $0.01 - Should reject (insufficient)
- Exactly balance - Should accept ✅
- Calculate fees correctly for:
  - $100 -> Net: $94.71 ✅
  - $1000 -> Net: $949.71 ✅
  - $10.00 -> Net: $9.21 ✅
```

### Special Characters Testing
```
Test in ALL input fields:
- Name: `'; DROP TABLE users;--`
- Email: `admin'--@test.com`
- Wallet: `<script>alert('xss')</script>`
- TXID: `../../etc/passwd`
- Referral Code: `../../../admin`

Expected: All should be sanitized/rejected
```

### Session & Cookie Testing
```
1. Login on Browser A
2. Logout on Browser B
3. Try to use session from Browser A
Expected: Should be invalid

1. Login
2. Change cookie expiry to past
3. Refresh page
Expected: Should redirect to login

1. Login as User A
2. Copy session cookie
3. Use in Browser B
4. Should work (same user)
5. Try to access another user's data
Expected: Should fail (authorization check)
```

---

## Automated Testing Setup

### Jest + React Testing Library

**Install:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**Create test:** `src/app/dashboard/deposit/__tests__/page.test.tsx`
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import DepositPage from '../page';

describe('Deposit Page', () => {
  it('shows alert when amount is below $10', async () => {
    render(<DepositPage />);
    
    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '5' } });
    
    expect(await screen.findByText(/Minimum Deposit: \$10/i)).toBeInTheDocument();
  });

  it('calculates fees correctly', async () => {
    render(<DepositPage />);
    
    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '100' } });
    
    expect(screen.getByText('$101.00')).toBeInTheDocument(); // Including processing fee
  });
});
```

**Run tests:**
```bash
npm test
```

---

## Security Checklist

### Pre-Production
- [ ] All inputs validated (client + server)
- [ ] SQL injection tests passed
- [ ] XSS tests passed
- [ ] CSRF protection enabled
- [ ] Authentication working correctly
- [ ] Authorization checks on all admin routes
- [ ] Session management secure
- [ ] Environment variables not exposed
- [ ] Database credentials secured
- [ ] API keys not in client code
- [ ] HTTPS enforced
- [ ] Rate limiting on sensitive endpoints
- [ ] Transaction atomicity tested (race conditions)
- [ ] Balance integrity verified
- [ ] Withdrawal fee calculation correct
- [ ] Commission distribution accurate

### Tools to Run
```bash
# 1. Security scan
npm audit

# 2. Dependency vulnerabilities
npm audit fix

# 3. OWASP check (if using)
npm install -g snyk
snyk test

# 4. Load test
k6 run load-test.js

# 5. Database integrity
node check-balances.js
```

---

## Vulnerability Report Template

When you find issues, document them:

```markdown
## Vulnerability Report

### Issue ID: VUL-001
**Severity:** High/Medium/Low
**Type:** SQL Injection / XSS / Auth Bypass / etc.
**Location:** File/Endpoint path
**Description:** Detailed description
**Steps to Reproduce:**
1. Step 1
2. Step 2
**Expected Behavior:** What should happen
**Actual Behavior:** What actually happens
**Fix:** How to fix it
**Status:** Open / Fixed / Won't Fix
```

---

## Quick Test Commands

```bash
# Run all tests
npm test

# Security audit
npm audit

# Load test (basic)
ab -n 1000 -c 10 https://yourdomain.com/

# Database check
node check-balances.js

# Manual API test
curl -X POST https://yourdomain.com/api/withdraw \
  -H "Content-Type: application/json" \
  -d '{"amount":"100","walletAddress":"0x..."}'
```

---

**Ready to start testing!** 🧪

Focus on these priorities:
1. ✅ Security (SQL injection, XSS, auth bypass)
2. ✅ Balance integrity (race conditions, double-spending)
3. ✅ Fee calculations (5% withdrawal fee)
4. ✅ Commission distribution
5. ✅ Load performance

Good luck with testing! 🚀
