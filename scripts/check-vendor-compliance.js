const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');

// Mock email transporter (replace with real config in production)
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
    }
});

async function checkCompliance() {
    console.log('Starting Vendor Compliance Check...');

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Find vendors with expiring insurance in the next 30 days
    const expiringVendors = await prisma.vendor.findMany({
        where: {
            status: 'ACTIVE',
            autoNotify: true,
            OR: [
                {
                    insuranceExpiry: {
                        lte: thirtyDaysFromNow,
                        gte: new Date() // Not already expired
                    }
                },
                {
                    wsibExpiry: {
                        lte: thirtyDaysFromNow,
                        gte: new Date()
                    }
                }
            ],
            // Don't notify if already notified in last 7 days
            lastNotifiedAt: {
                lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
        }
    });

    console.log(`Found ${expiringVendors.length} vendors with expiring documents.`);

    for (const vendor of expiringVendors) {
        console.log(`Processing vendor: ${vendor.name} (${vendor.email})`);

        try {
            // Send email (Simulated)
            console.log(`[EMAIL SENT] To: ${vendor.email} | Subject: URGENT: Insurance/WSIB Expiry Notice`);

            // Update lastNotifiedAt
            await prisma.vendor.update({
                where: { id: vendor.id },
                data: { lastNotifiedAt: new Date() }
            });

            console.log(`Updated notification status for ${vendor.name}`);
        } catch (error) {
            console.error(`Failed to process vendor ${vendor.name}:`, error);
        }
    }

    // Check for ALREADY expired vendors and mark as NON_COMPLIANT
    const expiredVendors = await prisma.vendor.updateMany({
        where: {
            status: 'ACTIVE',
            OR: [
                { insuranceExpiry: { lt: new Date() } },
                { wsibExpiry: { lt: new Date() } }
            ]
        },
        data: {
            status: 'NON_COMPLIANT'
        }
    });

    if (expiredVendors.count > 0) {
        console.log(`Marked ${expiredVendors.count} vendors as NON_COMPLIANT due to expired documents.`);
    }

    console.log('Compliance Check Complete.');
}

checkCompliance()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
