const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:vishurathore%4072@db.fyatcvetnrpgclpbydmr.supabase.co:5432/postgres"
        }
    }
});

async function checkUsers() {
    try {
        console.log("Connecting to production database...");

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                uplineId: true,
                referralCode: true,
                role: true,
                createdAt: true
            }
        });

        console.log("\n=== ALL USERS ===");
        console.log(`Total users: ${users.length}\n`);

        users.forEach((user, i) => {
            console.log(`${i + 1}. ${user.email}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Name: ${user.name || 'N/A'}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Referral Code: ${user.referralCode}`);
            console.log(`   Upline ID: ${user.uplineId || 'NONE (Root)'}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log('');
        });

        // Show network relationships
        console.log("\n=== NETWORK RELATIONSHIPS ===");
        for (const user of users) {
            const referrals = users.filter(u => u.uplineId === user.id);
            if (referrals.length > 0) {
                console.log(`${user.email} has ${referrals.length} direct referral(s):`);
                referrals.forEach(r => console.log(`   - ${r.email}`));
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
