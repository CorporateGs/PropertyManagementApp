const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUserAccount() {
    try {
        console.log('🔧 Creating user account...\n');

        // Hash the password
        const hashedPassword = await bcrypt.hash('Rollout8032585!', 10);

        // Delete existing user if exists
        await prisma.user.deleteMany({
            where: {
                email: 'limaconnect187@gmail.com'
            }
        });

        // Create user with ADMIN role
        const user = await prisma.user.create({
            data: {
                email: 'limaconnect187@gmail.com',
                password: hashedPassword,
                firstName: 'Lima',
                lastName: 'Connect',
                role: 'ADMIN',
                isActive: true,
                emailVerified: true,
            },
        });

        console.log('✅ User account created successfully!');
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Email Verified: ${user.emailVerified}\n`);

        console.log('📋 Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('  Email: limaconnect187@gmail.com');
        console.log('  Password: Rollout8032585!');
        console.log('  Role: ADMIN');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('✨ Account ready! You can now log in at http://localhost:3005/en/auth/signin\n');

    } catch (error) {
        console.error('❌ Error creating user account:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createUserAccount()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
