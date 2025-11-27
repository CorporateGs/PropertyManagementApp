const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addUser() {
  try {
    console.log('Adding user with email: limaconnect187@gmail.com');
    
    const hashedPassword = await bcrypt.hash('Rollout8032585!', 10);
    
    const user = await prisma.user.upsert({
      where: { email: 'limaconnect187@gmail.com' },
      update: {
        password: hashedPassword,
        isActive: true,
      },
      create: {
        email: 'limaconnect187@gmail.com',
        firstName: 'User',
        lastName: 'Account',
        role: 'ADMIN',
        isActive: true,
        password: hashedPassword,
      },
    });

    console.log('✅ User added/updated successfully:', user.email);
    console.log('User ID:', user.id);
    console.log('Role:', user.role);
    console.log('Active:', user.isActive);
  } catch (error) {
    console.error('❌ Error adding user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addUser();
