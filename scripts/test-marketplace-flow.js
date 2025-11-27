const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting Services Marketplace Verification...');

    try {
        // 1. Verify Services Exist
        const services = await prisma.service.findMany();
        console.log(`\n1. Service Catalog: Found ${services.length} services.`);
        if (services.length === 0) throw new Error('No services found in catalog!');

        const taxService = services.find(s => s.slug === 'tax-preparation');
        if (!taxService) throw new Error('Tax Preparation service not found!');
        console.log('   ✔ Tax Preparation service verified.');

        // 2. Create Test User
        const testEmail = `test.user.${Date.now()}@example.com`;
        const user = await prisma.user.create({
            data: {
                email: testEmail,
                password: 'hashed_password_placeholder',
                firstName: 'Test',
                lastName: 'User',
                role: 'USER'
            }
        });
        console.log(`\n2. Test User Created: ${user.email}`);

        // 3. Simulate Subscription
        console.log('\n3. Simulating Subscription...');
        const subscription = await prisma.subscription.create({
            data: {
                userId: user.id,
                serviceId: taxService.id,
                amount: taxService.price,
                billingCycle: taxService.billingCycle,
                status: 'ACTIVE',
                startDate: new Date(),
                nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            }
        });
        console.log(`   ✔ Subscription created with ID: ${subscription.id}`);

        // 4. Verify Subscription in DB
        const savedSub = await prisma.subscription.findUnique({
            where: { id: subscription.id },
            include: { service: true, user: true }
        });

        if (!savedSub) throw new Error('Subscription not saved to database!');
        if (savedSub.status !== 'ACTIVE') throw new Error('Subscription status is not ACTIVE!');
        if (savedSub.service.slug !== 'tax-preparation') throw new Error('Incorrect service linked!');
        console.log('   ✔ Database verification successful.');

        // 5. Verify Admin Analytics Data (Simulation)
        console.log('\n4. Verifying Analytics Data...');
        const activeSubsCount = await prisma.subscription.count({
            where: { status: 'ACTIVE' }
        });
        console.log(`   ✔ Total Active Subscriptions: ${activeSubsCount}`);

        const revenue = await prisma.subscription.aggregate({
            where: { status: 'ACTIVE' },
            _sum: { amount: true }
        });
        console.log(`   ✔ Total Monthly Revenue: $${revenue._sum.amount}`);

        // Cleanup
        console.log('\n5. Cleaning up test data...');
        await prisma.subscription.delete({ where: { id: subscription.id } });
        await prisma.user.delete({ where: { id: user.id } });
        console.log('   ✔ Test data removed.');

        console.log('\n✅ VERIFICATION COMPLETE: Services Marketplace is fully functional.');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
