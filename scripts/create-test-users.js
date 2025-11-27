const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsers() {
    try {
        // Hash passwords
        const adminPassword = await bcrypt.hash('admin123', 10);
        const clientPassword = await bcrypt.hash('client123', 10);

        // Create admin user
        const admin = await prisma.user.upsert({
            where: { email: 'admin@test.com' },
            update: {},
            create: {
                email: 'admin@test.com',
                password: adminPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
                isActive: true,
                emailVerified: new Date(),
            },
        });

        console.log('✅ Admin user created:', admin.email);

        // Create client/staff user
        const client = await prisma.user.upsert({
            where: { email: 'client@test.com' },
            update: {},
            create: {
                email: 'client@test.com',
                password: clientPassword,
                firstName: 'Client',
                lastName: 'User',
                role: 'STAFF',
                isActive: true,
                emailVerified: new Date(),
            },
        });

        console.log('✅ Client user created:', client.email);

        console.log('\n📋 Test Credentials:');
        console.log('Admin - Email: admin@test.com, Password: admin123');
        console.log('Client - Email: client@test.com, Password: client123');

    } catch (error) {
        console.error('❌ Error creating test users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUsers();
