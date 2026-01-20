const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Clean Up Duplicate Investment Records
 * 
 * Strategy: Keep MANUAL/WALLET investments, cancel duplicates based on:
 * - If amounts are the same → Keep the first one created
 * - If amounts differ → Keep both (user has multiple legitimate investments)
 */

async function cleanupDuplicates() {
    console.log('🧹 Cleaning up duplicate investments...\n');

    const users = await prisma.user.findMany({
        include: {
            investments: {
                where: { status: 'ACTIVE' },
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    let totalCancelled = 0;

    for (const user of users) {
        if (user.investments.length > 1) {
            // Check if there are exact amount duplicates
            const investmentsByAmount = {};

            user.investments.forEach(inv => {
                const amount = Number(inv.amount);
                if (!investmentsByAmount[amount]) {
                    investmentsByAmount[amount] = [];
                }
                investmentsByAmount[amount].push(inv);
            });

            // For each amount, if there are duplicates, keep only the first one
            for (const [amount, investments] of Object.entries(investmentsByAmount)) {
                if (investments.length > 1) {
                    console.log(`\n❌ Found ${investments.length} x $${amount} investments for ${user.email}`);

                    const keep = investments[0];
                    const cancel = investments.slice(1);

                    console.log(`  ✅ Keeping: ${keep.id} (${keep.approvalMethod || 'LEGACY'}) - Created ${keep.createdAt.toLocaleString()}`);

                    for (const inv of cancel) {
                        console.log(`  ❌ Cancelling: ${inv.id} (${inv.approvalMethod || 'LEGACY'}) - Created ${inv.createdAt.toLocaleString()}`);

                        await prisma.investment.update({
                            where: { id: inv.id },
                            data: { status: 'CANCELLED' }
                        });

                        totalCancelled++;
                    }
                }
            }
        }
    }

    console.log(`\n\n📊 CLEANUP SUMMARY:`);
    console.log(`   Total Users Checked: ${users.length}`);
    console.log(`   Duplicate Investments Cancelled: ${totalCancelled}`);

    if (totalCancelled > 0) {
        console.log(`\n✅ Cleanup complete! ROI will now credit correctly.`);
        console.log(`⚠️  Note: Excess ROI already credited will remain (users keep the bonus).`);
    } else {
        console.log(`\n✅ No duplicate investments found!`);
    }

    await prisma.$disconnect();
}

cleanupDuplicates().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
});
