const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Find Duplicate Investment Records
 * 
 * Issue: Users are getting double ROI because they have multiple ACTIVE investments
 */

async function findDuplicates() {
    console.log('🔍 Searching for users with duplicate investments...\n');

    const users = await prisma.user.findMany({
        include: {
            investments: {
                where: { status: 'ACTIVE' }
            }
        }
    });

    const usersWithDuplicates = [];

    for (const user of users) {
        if (user.investments.length > 1) {
            console.log(`\n❌ DUPLICATE FOUND:`);
            console.log(`   User: ${user.email}`);
            console.log(`   Active Investments: ${user.investments.length}`);

            user.investments.forEach((inv, index) => {
                console.log(`\n   Investment #${index + 1}:`);
                console.log(`     Amount: $${inv.amount}`);
                console.log(`     Approval: ${inv.approvalMethod || 'LEGACY'}`);
                console.log(`     Created: ${inv.createdAt.toLocaleString()}`);
                console.log(`     Daily ROI: $${(Number(inv.amount) * 0.01).toFixed(2)}`);
            });

            usersWithDuplicates.push({
                email: user.email,
                count: user.investments.length,
                investments: user.investments
            });
        }
    }

    console.log(`\n\n📊 SUMMARY:`);
    console.log(`   Total Users Checked: ${users.length}`);
    console.log(`   Users with Duplicate Investments: ${usersWithDuplicates.length}`);

    console.log(`\n\n🔧 To fix: Set duplicate investments to CANCELLED status.`);

    await prisma.$disconnect();
}

findDuplicates().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
});
