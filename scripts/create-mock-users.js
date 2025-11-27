const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createMockUsers() {
    try {
        console.log('🔧 Creating mock users for testing...\n');

        // Hash passwords
        const adminPassword = await bcrypt.hash('admin123', 10);
        const clientPassword = await bcrypt.hash('client123', 10);

        // Delete existing test users if they exist
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: ['mockadmin@test.com', 'mockclient@test.com']
                }
            }
        });

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email: 'mockadmin@test.com',
                password: adminPassword,
                firstName: 'Mock',
                lastName: 'Admin',
                role: 'ADMIN',
                isActive: true,
                emailVerified: true,
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   ID: ${admin.id}\n`);

        // Create client/staff user
        const client = await prisma.user.create({
            data: {
                email: 'mockclient@test.com',
                password: clientPassword,
                firstName: 'Mock',
                lastName: 'Client',
                role: 'STAFF',
                isActive: true,
                emailVerified: true,
            },
        });

        console.log('✅ Client user created successfully!');
        console.log(`   Email: ${client.email}`);
        console.log(`   Role: ${client.role}`);
        console.log(`   ID: ${client.id}\n`);

        console.log('📋 Test Credentials Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin Account:');
        console.log('  Email: mockadmin@test.com');
        console.log('  Password: admin123');
        console.log('  Role: ADMIN\n');
        console.log('Client Account:');
        console.log('  Email: mockclient@test.com');
        console.log('  Password: client123');
        console.log('  Role: STAFF');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('✨ Mock users created successfully! You can now test authentication.\n');

    } catch (error) {
        console.error('❌ Error creating mock users:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createMockUsers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
