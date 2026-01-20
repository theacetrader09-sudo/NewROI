const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Balance Reconciliation Script
 * 
 * This script recalculates all user balances from scratch based on transaction history.
 * It fixes any discrepancies caused by the deposit bug.
 * 
 * Logic:
 * Starting Balance = 0
 * + All ROI transactions
 * + All COMMISSION transactions  
 * + All DEPOSIT transactions in "wallet" mode (add to balance directly)
 * - All WITHDRAWAL transactions
 * 
 * DEPOSIT transactions in "package" mode should NOT add to balance
 * (they create investments which generate ROI)
 */

async function reconcileAllBalances() {
    console.log('🔍 Starting Balance Reconciliation...\n');

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            balance: true
        }
    });

    let totalFixed = 0;
    let totalChecked = 0;
    const discrepancies = [];

    for (const user of users) {
        totalChecked++;

        // Get ALL completed transactions for this user
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: user.id,
                status: 'COMPLETED'
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        let calculatedBalance = 0;

        for (const tx of transactions) {
            const amount = parseFloat(tx.amount);

            if (tx.type === 'ROI' || tx.type === 'COMMISSION') {
                // ROI and commissions add to balance
                calculatedBalance += amount;
            } else if (tx.type === 'WITHDRAWAL') {
                // Withdrawals subtract from balance
                calculatedBalance -= amount;
            } else if (tx.type === 'INVESTMENT') {
                // INVESTMENT transactions (package activation) subtract from balance
                // User moves money from balance into an investment
                calculatedBalance -= amount;
            } else if (tx.type === 'DEPOSIT') {
                // ONLY "wallet mode" deposits should add to balance
                // Package mode deposits create investments and should NOT add to balance
                // Check the description to determine mode
                if (tx.description.toLowerCase().includes('wallet deposit')) {
                    calculatedBalance += amount;
                }
                // If it says "package activated", it should NOT add to balance
                // (those are buggy deposits that inflated the balance)
            }
        }

        const actualBalance = parseFloat(user.balance);
        const difference = actualBalance - calculatedBalance;

        // Check if there's a discrepancy (allowing for small floating point errors)
        if (Math.abs(difference) > 0.01) {
            console.log(`\n❌ DISCREPANCY FOUND:`);
            console.log(`   User: ${user.email}`);
            console.log(`   Current Balance: $${actualBalance.toFixed(2)}`);
            console.log(`   Calculated Balance: $${calculatedBalance.toFixed(2)}`);
            console.log(`   Difference: ${difference > 0 ? '+' : ''}$${difference.toFixed(2)}`);

            discrepancies.push({
                email: user.email,
                current: actualBalance,
                calculated: calculatedBalance,
                difference: difference
            });

            // Fix the balance
            await prisma.user.update({
                where: { id: user.id },
                data: { balance: calculatedBalance }
            });

            console.log(`   ✅ Fixed! New balance: $${calculatedBalance.toFixed(2)}`);
            totalFixed++;
        } else {
            console.log(`✅ ${user.email}: Balance correct ($${actualBalance.toFixed(2)})`);
        }
    }

    console.log(`\n\n📊 RECONCILIATION SUMMARY:`);
    console.log(`   Total Users Checked: ${totalChecked}`);
    console.log(`   Discrepancies Found: ${discrepancies.length}`);
    console.log(`   Balances Fixed: ${totalFixed}`);

    if (discrepancies.length > 0) {
        console.log(`\n\n📋 DETAILED DISCREPANCIES:`);
        console.table(discrepancies);
    }

    await prisma.$disconnect();
    console.log('\n✅ Reconciliation complete!');
}

reconcileAllBalances().catch((error) => {
    console.error('❌ Error during reconciliation:', error);
    process.exit(1);
});
