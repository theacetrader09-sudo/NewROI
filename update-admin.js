const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdminCredentials() {
    try {
        // New admin credentials
        const newEmail = 'forfxai@gmail.com';
        const newPassword = 'Markus@72';

        // Hash the password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Find admin user (user with role SUPERADMIN or first user)
        let adminUser = await prisma.user.findFirst({
            where: { role: 'SUPERADMIN' }
        });

        // If no SUPERADMIN found, get first user
        if (!adminUser) {
            adminUser = await prisma.user.findFirst({
                orderBy: { createdAt: 'asc' }
            });
        }

        if (!adminUser) {
            console.log('❌ No user found in database');
            return;
        }

        // Update admin credentials
        const updated = await prisma.user.update({
            where: { id: adminUser.id },
            data: {
                email: newEmail,
                password: hashedPassword,
                role: 'SUPERADMIN'
            }
        });

        console.log('✅ Admin credentials updated successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:    ', newEmail);
        console.log('🔐 Password: ', newPassword);
        console.log('👤 User ID:  ', updated.id);
        console.log('👤 Name:     ', updated.name || 'Not set');
        console.log('🎭 Role:     ', updated.role);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('You can now login at: http://localhost:3000/login');

    } catch (error) {
        console.error('❌ Error updating admin:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

updateAdminCredentials();
