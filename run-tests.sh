#!/bin/bash

# MLM ROI System - Quick Testing Script
# Run this to perform basic tests on your application

echo "🧪 MLM ROI System - Testing Suite"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ask for target URL
read -p "Enter your application URL (default: http://localhost:3000): " BASE_URL
BASE_URL=${BASE_URL:-http://localhost:3000}

echo ""
echo "Testing against: $BASE_URL"
echo ""

# Test 1: Check if server is running
echo "📡 Test 1: Server Connection"
if curl -s --head "$BASE_URL" | head -n 1 | grep "HTTP" > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not responding${NC}"
    exit 1
fi

# Test 2: Check critical pages load
echo ""
echo "📄 Test 2: Page Load Tests"
pages=("/" "/signup" "/login" "/dashboard/deposit" "/dashboard/withdraw")
for page in "${pages[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$page")
    if [ "$status" == "200" ] || [ "$status" == "307" ] || [ "$status" == "302" ]; then
        echo -e "${GREEN}✅ $page - OK (Status: $status)${NC}"
    else
        echo -e "${RED}❌ $page - FAILED (Status: $status)${NC}"
    fi
done

# Test 3: Check API endpoints
echo ""
echo "🔌 Test 3: API Endpoint Tests"
apis=("/api/settings/public" "/api/auth/signin")
for api in "${apis[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL$api" -H "Content-Type: application/json")
    if [ "$status" != "000" ]; then
        echo -e "${GREEN}✅ $api - Responding (Status: $status)${NC}"
    else
        echo -e "${RED}❌ $api - Not responding${NC}"
    fi
done

# Test 4: Security Headers
echo ""
echo "🔒 Test 4: Security Headers"
headers=$(curl -s -I "$BASE_URL")
if echo "$headers" | grep -i "x-frame-options" > /dev/null; then
    echo -e "${GREEN}✅ X-Frame-Options header present${NC}"
else
    echo -e "${YELLOW}⚠️  X-Frame-Options header missing${NC}"
fi

if echo "$headers" | grep -i "strict-transport-security" > /dev/null; then
    echo -e "${GREEN}✅ HSTS header present${NC}"
else
    echo -e "${YELLOW}⚠️  HSTS header missing (OK for development)${NC}"
fi

# Test 5: Database connection (if running locally)
echo ""
echo "🗄️  Test 5: Database Integrity"
if [ -f "scripts/check-balances.js" ]; then
    echo "Running balance integrity check..."
    node scripts/check-balances.js
else
    echo -e "${YELLOW}⚠️  Balance check script not found${NC}"
fi

# Test 6: Load test (optional)
echo ""
read -p "Run load test? (y/n): " run_load
if [ "$run_load" == "y" ]; then
    echo ""
    echo "⚡ Test 6: Load Test (Apache Benchmark)"
    echo "Running 100 requests with 10 concurrent users..."
    if command -v ab &> /dev/null; then
        ab -n 100 -c 10 "$BASE_URL/"
    else
        echo -e "${YELLOW}⚠️  Apache Benchmark (ab) not installed${NC}"
        echo "Install with: brew install httpd (macOS)"
    fi
fi

# Summary
echo ""
echo "=================================="
echo "🎉 Testing Complete!"
echo ""
echo "Next steps:"
echo "1. Review results above"
echo "2. Check TESTING_GUIDE.md for detailed tests"
echo "3. Run security tests from the guide"
echo "4. Perform full load testing with k6 or Artillery"
echo ""
