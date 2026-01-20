const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Verify Wallet vs Package Logic
 * 
 * This script checks if any users are receiving ROI without active investments
 * (which would indicate a bug in the wallet/package separation logic)
 */

async function verifyLogic() {
    console.log('🔍 Verifying Wallet vs Package Logic...\n');

    // 1. Find users with balance but NO active investment
    const users = await prisma.user.findMany({
        include: {
            investments: {
                where: { status: 'ACTIVE' }
            },
            transactions: {
                where: { type: 'ROI' },
                orderBy: { createdAt: 'desc' },
                take: 5
            }
        }
    });

    let usersWithBalance = 0;
    let usersWithInvestment = 0;
    let buggedUsers = [];

    for (const user of users) {
        const hasBalance = Number(user.balance) > 0;
        const hasActiveInvestment = user.investments.length > 0;
        const hasReceivedROI = user.transactions.length > 0;

        if (hasBalance) usersWithBalance++;
        if (hasActiveInvestment) usersWithInvestment++;

        // BUG: User received ROI but has NO active investment
        if (hasReceivedROI && !hasActiveInvestment) {
            console.log(`\n❌ BUG DETECTED: ${user.email}`);
            console.log(`   Balance: $${Number(user.balance).toFixed(2)}`);
            console.log(`   Active Investments: ${user.investments.length}`);
            console.log(`   ROI Transactions: ${user.transactions.length}`);
            console.log(`   Last ROI: ${user.transactions[0]?.createdAt.toLocaleString()}`);

            buggedUsers.push({
                email: user.email,
                balance: Number(user.balance),
                roiCount: user.transactions.length,
                lastROI: user.transactions[0]
            });
        }

        // VERIFY: User with active investment should be able to receive ROI
        if (hasActiveInvestment) {
            const totalInvested = user.investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
            console.log(`\n✅ VALID: ${user.email}`);
            console.log(`   Active Investments: ${user.investments.length} ($${totalInvested.toFixed(2)})`);
            console.log(`   ROI Received: ${user.transactions.length} transactions`);
        }
    }

    console.log(`\n\n📊 SUMMARY:`);
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Users with Balance: ${usersWithBalance}`);
    console.log(`   Users with Active Investment: ${usersWithInvestment}`);
    console.log(`   Users with BUG: ${buggedUsers.length}`);

    if (buggedUsers.length > 0) {
        console.log(`\n\n❌ BUGS FOUND:`);
        console.log(`   ${buggedUsers.length} users received ROI without active investments`);
        console.log(`\n   Affected Users:`);
        buggedUsers.forEach(u => {
            console.log(`   - ${u.email}: $${u.balance.toFixed(2)} balance, ${u.roiCount} ROI transactions`);
        });
    } else {
        console.log(`\n\n✅ NO BUGS FOUND!`);
        console.log(`   All ROI distributions are correctly linked to active investments.`);
    }

    await prisma.$disconnect();
}

verifyLogic().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
});
