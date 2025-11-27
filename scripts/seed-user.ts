
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@example.com';
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      firstName: 'Demo',
      lastName: 'Admin',
    },
    create: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      firstName: 'Demo',
      lastName: 'Admin',
    },
  });

  console.log(`User seeded: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
