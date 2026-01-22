const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBalances() {
    console.log('🔍 Starting Balance Integrity Check...\n');

    try {
        const users = await prisma.user.findMany({
            include: {
                transactions: true,
                investments: true,
            }
        });

        let totalErrors = 0;
        let totalChecked = 0;

        for (const user of users) {
            totalChecked++;

            // Calculate expected balance from transaction history
            let expectedBalance = 0;

            for (const tx of user.transactions) {
                if (tx.status !== 'COMPLETED') continue;

                if (tx.type === 'DEPOSIT' || tx.type === 'ROI' || tx.type === 'COMMISSION') {
                    expectedBalance += Number(tx.amount);
                } else if (tx.type === 'WITHDRAWAL' || tx.type === 'INVESTMENT') {
                    expectedBalance -= Number(tx.amount);
                }
                // FEE transactions don't affect balance (already deducted in withdrawal)
            }

            const actualBalance = Number(user.balance);
            const diff = Math.abs(actualBalance - expectedBalance);

            if (diff > 0.01) {
                totalErrors++;
                console.error(`❌ User ${user.email}:`);
                console.error(`   Expected: $${expectedBalance.toFixed(2)}`);
                console.error(`   Actual:   $${actualBalance.toFixed(2)}`);
                console.error(`   Diff:     $${diff.toFixed(2)}\n`);
            } else {
                console.log(`✅ ${user.email}: $${actualBalance.toFixed(2)} (OK)`);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`Total Users Checked: ${totalChecked}`);
        console.log(`Errors Found: ${totalErrors}`);
        console.log(`Success Rate: ${((totalChecked - totalErrors) / totalChecked * 100).toFixed(2)}%`);

        if (totalErrors === 0) {
            console.log('\n✅ All balances are correct!');
        } else {
            console.log('\n❌ Balance discrepancies found! Review transactions.');
        }

    } catch (error) {
        console.error('Error checking balances:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the check
checkBalances();
