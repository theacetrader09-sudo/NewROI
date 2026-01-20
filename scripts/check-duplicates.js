// Check duplicate investments for a specific user
const email = "theacetrader09+02@gmail.com";

async function checkDuplicateInvestments() {
    console.log(`Checking investments for: ${email}\n`);

    const response = await fetch('https://new-roi.vercel.app/api/admin/users', {
        headers: {
            'Cookie': 'your-session-cookie-here' // You'll need to get this from browser
        }
    });

    // This won't work without auth, let's use a different approach
    // We need to check the database directly
}

// Instead, let's check the local database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLocalInvestments() {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            investments: {
                where: { status: 'ACTIVE' }
            }
        }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log(`Found ${user.investments.length} ACTIVE investments:\n`);

    user.investments.forEach((inv, index) => {
        console.log(`Investment #${index + 1}:`);
        console.log(`  ID: ${inv.id}`);
        console.log(`  Amount: $${inv.amount}`);
        console.log(`  Status: ${inv.status}`);
        console.log(`  Approval Method: ${inv.approvalMethod || 'LEGACY'}`);
        console.log(`  Created: ${inv.createdAt}`);
        console.log(`  TXID: ${inv.txid || 'N/A'}`);
        console.log('');
    });

    await prisma.$disconnect();
}

checkLocalInvestments();
