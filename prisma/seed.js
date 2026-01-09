const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@mlm.com' },
        update: {},
        create: {
            email: 'admin@mlm.com',
            name: 'Super Admin',
            password: hashedPassword,
            referralCode: 'COMPANY',
            role: 'SUPERADMIN',
            balance: 0,
        },
    });

    console.log('--- SYSTEM INITIALIZED ---');
    console.log('Super Admin Created: admin@mlm.com');
    console.log('Root Referral Code: COMPANY');
    console.log('Password: Admin@123');
    console.log('---------------------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
