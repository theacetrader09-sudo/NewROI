const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.PROD_DATABASE_URL
        }
    }
});

async function analyzeBalance() {
    try {
        // Find the user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: { contains: 'vishv' } },
                    { email: { contains: 'rathore' } }
                ]
            },
            select: {
                id: true,
                email: true,
                balance: true
            }
        });

        if (!user) {
            console.log('User not found. Listing all users:');
            const allUsers = await prisma.user.findMany({
                select: { id: true, email: true, balance: true },
                take: 20
            });
            console.table(allUsers);
            return;
        }

        console.log('\n=== USER DATA ===');
        console.log('Email:', user.email);
        console.log('Current Balance:', Number(user.balance).toFixed(4));

        // Sum all credits (ROI + COMMISSION + DEPOSIT)
        const credits = await prisma.transaction.aggregate({
            where: {
                userId: user.id,
                type: { in: ['ROI', 'COMMISSION', 'DEPOSIT'] },
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        });

        // Sum all debits (WITHDRAWAL)
        const debits = await prisma.transaction.aggregate({
            where: {
                userId: user.id,
                type: 'WITHDRAWAL',
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        });

        // Get earnings only (ROI + COMMISSION)
        const earnings = await prisma.transaction.aggregate({
            where: {
                userId: user.id,
                type: { in: ['ROI', 'COMMISSION'] },
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        });

        const totalCredits = Number(credits._sum.amount || 0);
        const totalDebits = Number(debits._sum.amount || 0);
        const totalEarnings = Number(earnings._sum.amount || 0);
        const expectedBalance = totalCredits - totalDebits;
        const actualBalance = Number(user.balance);
        const discrepancy = actualBalance - expectedBalance;

        console.log('\n=== TRANSACTION ANALYSIS ===');
        console.log('Total Credits (ROI+COMMISSION+DEPOSIT):', totalCredits.toFixed(4));
        console.log('Total Debits (WITHDRAWAL):', totalDebits.toFixed(4));
        console.log('Total Earnings (ROI+COMMISSION only):', totalEarnings.toFixed(4));
        console.log('Expected Balance:', expectedBalance.toFixed(4));
        console.log('Actual Balance:', actualBalance.toFixed(4));
        console.log('DISCREPANCY:', discrepancy.toFixed(4));

        if (Math.abs(discrepancy) > 0.01) {
            console.log('\n⚠️  DISCREPANCY DETECTED!');

            // Find recent transactions to investigate
            const recentTxs = await prisma.transaction.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 20,
                select: {
                    type: true,
                    amount: true,
                    previousBalance: true,
                    newBalance: true,
                    description: true,
                    createdAt: true
                }
            });

            console.log('\n=== RECENT TRANSACTIONS ===');
            recentTxs.forEach(tx => {
                const balanceChange = Number(tx.newBalance) - Number(tx.previousBalance);
                const matches = Math.abs(balanceChange - Number(tx.amount)) < 0.001;
                console.log(`${tx.type}: $${Number(tx.amount).toFixed(2)} | Prev: $${Number(tx.previousBalance).toFixed(2)} → New: $${Number(tx.newBalance).toFixed(2)} ${matches ? '✓' : '⚠️ MISMATCH'}`);
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

analyzeBalance();
