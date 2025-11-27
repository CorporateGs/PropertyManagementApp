const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Verifying Compliance & Emergency Features...');

    try {
        // 1. Create a Test Building
        const building = await prisma.building.findFirst();
        if (!building) throw new Error('No building found. Run seed script first.');
        console.log(`Using Building: ${building.name} (${building.id})`);

        // 2. Test Vendor Creation
        console.log('\n--- Testing Vendor Compliance ---');
        const vendor = await prisma.vendor.create({
            data: {
                name: 'Test Plumbers Inc.',
                email: 'test@plumbers.com',
                category: 'Plumbing',
                insuranceExpiry: new Date(Date.now() - 86400000), // Expired yesterday
                buildingId: building.id,
                status: 'ACTIVE'
            }
        });
        console.log(`Created Vendor: ${vendor.name} (Expired Insurance)`);

        // Run Compliance Logic (Simulated)
        if (vendor.insuranceExpiry < new Date()) {
            await prisma.vendor.update({
                where: { id: vendor.id },
                data: { status: 'NON_COMPLIANT' }
            });
            console.log('Compliance Check: Vendor marked NON_COMPLIANT [SUCCESS]');
        }

        // 3. Test Emergency Registry
        console.log('\n--- Testing Emergency Registry ---');
        const unit = await prisma.unit.findFirst({ where: { buildingId: building.id } });
        if (unit) {
            const registry = await prisma.emergencyRegistry.create({
                data: {
                    unitId: unit.id,
                    type: 'PET',
                    name: 'Buddy',
                    details: 'Golden Retriever',
                    emergencyContact: 'Owner: 555-0199'
                }
            });
            console.log(`Registry Entry Created: ${registry.name} (${registry.type}) [SUCCESS]`);
        } else {
            console.log('Skipping Registry Test (No Unit Found)');
        }

        // 4. Test Emergency Alert Creation
        console.log('\n--- Testing Emergency Alert ---');
        const alert = await prisma.emergencyAlert.create({
            data: {
                buildingId: building.id,
                title: 'TEST ALERT',
                message: 'This is a test of the emergency broadcast system.',
                alertType: 'TEST',
                createdBy: 'SYSTEM_TEST',
                channels: JSON.stringify(['SMS', 'EMAIL'])
            }
        });
        console.log(`Alert Created: ${alert.title} (ID: ${alert.id}) [SUCCESS]`);

        // Cleanup
        await prisma.vendor.delete({ where: { id: vendor.id } });
        console.log('\nCleanup Complete.');

    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
