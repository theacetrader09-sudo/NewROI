const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Find and Fix Duplicate Investment Records
 * 
 * Issue: Users are getting double ROI because they have multiple ACTIVE investments
 * from the same deposit action (one from deposit endpoint, one from activation endpoint)
 */

async function findAndFixDuplicates() {
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
            // Check if investments have same amount (potential duplicates)
            const amounts = user.investments.map(inv => Number(inv.amount));
            const hasDuplicateAmounts = amounts.length !== new Set(amounts).size;

            if (hasDuplicateAmounts || user.investments.length > 1) {
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
    });

    console.log(`\n\n📊 SUMMARY:`);
    console.log(`   Total Users Checked: ${users.length}`);
    console.log(`   Users with Duplicate Investments: ${usersWithDuplicates.length}`);

    if (usersWithDuplicates.length > 0) {
        console.log(`\n\n🔧 RECOMMENDED FIX:`);
        console.log(`   1. Keep ONE investment per deposit (preferably the MANUAL/first one)`);
        console.log(`   2. Mark duplicates as CANCELLED`);
        console.log(`   3. Recalculate balances to remove excess ROI already credited`);

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('\n\nWould you like to AUTO-FIX these duplicates? (yes/no): ', async (answer) => {
            if (answer.toLowerCase() === 'yes') {
                await fixDuplicates(usersWithDuplicates);
            } else {
                console.log('\n❌ Auto-fix cancelled. Please fix manually.');
            }
            rl.close();
            await prisma.$disconnect();
        });
    } else {
        console.log('\n✅ No duplicate investments found!');
        await prisma.$disconnect();
    }
}

async function fixDuplicates(usersWithDuplicates) {
    console.log('\n\n🔧 FIXING DUPLICATES...\n');

    for (const userData of usersWithDuplicates) {
        console.log(`\nFixing ${userData.email}...`);

        // Sort investments by creation date (keep the oldest/first one)
        const sorted = userData.investments.sort((a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
        );

        const keepInvestment = sorted[0];
        const removeInvestments = sorted.slice(1);

        console.log(`  ✅ Keeping: Investment ${keepInvestment.id} ($${keepInvestment.amount})`);

        for (const inv of removeInvestments) {
            console.log(`  ❌ Cancelling: Investment ${inv.id} ($${inv.amount})`);

            await prisma.investment.update({
                where: { id: inv.id },
                data: { status: 'CANCELLED' }
            });
        }
    }

    console.log('\n\n✅ Duplicates fixed! ROI will now credit correctly.');
    console.log('⚠️  Note: You may need to run balance reconciliation to fix excess ROI already credited.');
}

findAndFixDuplicates().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
});
