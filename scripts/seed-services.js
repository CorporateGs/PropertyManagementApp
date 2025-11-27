const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const services = [
    {
        name: 'Tax Preparation',
        slug: 'tax-preparation',
        category: 'TAX_PREP',
        description: 'Professional tax preparation and filing services for property owners.',
        price: 129.99,
        features: JSON.stringify([
            'Professional tax filing',
            'Quarterly estimated taxes',
            'Year-end tax planning',
            'IRS correspondence support'
        ]),
        isProfessional: true,
        icon: 'FileText'
    },
    {
        name: 'Legal Services',
        slug: 'legal-services',
        category: 'LEGAL',
        description: 'Comprehensive legal support for landlords and property managers.',
        price: 199.99,
        features: JSON.stringify([
            'Lease agreement review',
            'Eviction support',
            'Contract drafting',
            'Legal consultation (2 hours/month)'
        ]),
        isProfessional: true,
        icon: 'Scale'
    },
    {
        name: 'Accounting & Bookkeeping',
        slug: 'accounting-bookkeeping',
        category: 'ACCOUNTING',
        description: 'Full-service accounting to keep your finances in order.',
        price: 149.99,
        features: JSON.stringify([
            'Monthly financial statements',
            'Expense tracking',
            'Profit & loss reports',
            'Budget planning'
        ]),
        isProfessional: true,
        icon: 'Calculator'
    },
    {
        name: 'Property Insurance',
        slug: 'property-insurance',
        category: 'INSURANCE',
        description: 'Protect your investments with comprehensive property insurance management.',
        price: 89.99,
        features: JSON.stringify([
            'Insurance policy management',
            'Claims assistance',
            'Coverage review',
            'Multi-property discounts'
        ]),
        isProfessional: true,
        icon: 'Shield'
    },
    {
        name: 'Maintenance Coordination',
        slug: 'maintenance-coordination',
        category: 'MAINTENANCE',
        description: '24/7 maintenance coordination and vendor management.',
        price: 79.99,
        features: JSON.stringify([
            '24/7 maintenance hotline',
            'Vendor management',
            'Emergency response',
            'Preventive maintenance scheduling'
        ]),
        isProfessional: false,
        icon: 'Wrench'
    },
    {
        name: 'Tenant Screening',
        slug: 'tenant-screening',
        category: 'CONSULTING',
        description: 'Thorough background checks to find the best tenants.',
        price: 49.99,
        features: JSON.stringify([
            'Background checks',
            'Credit reports',
            'Eviction history',
            'Employment verification'
        ]),
        isProfessional: false,
        icon: 'UserCheck'
    },
    {
        name: 'Marketing & Leasing',
        slug: 'marketing-leasing',
        category: 'CONSULTING',
        description: 'Professional marketing to fill your vacancies faster.',
        price: 99.99,
        features: JSON.stringify([
            'Professional photography',
            'Listing syndication',
            'Virtual tours',
            'Lead management'
        ]),
        isProfessional: false,
        icon: 'Megaphone'
    },
    {
        name: 'Compliance Management',
        slug: 'compliance-management',
        category: 'LEGAL',
        description: 'Stay compliant with all local, state, and federal regulations.',
        price: 119.99,
        features: JSON.stringify([
            'Regulatory compliance tracking',
            'Fair housing compliance',
            'Safety inspections',
            'Documentation management'
        ]),
        isProfessional: true,
        icon: 'ClipboardCheck'
    }
];

async function main() {
    console.log('Start seeding services...');

    for (const service of services) {
        const existingService = await prisma.service.findUnique({
            where: { slug: service.slug }
        });

        if (!existingService) {
            await prisma.service.create({
                data: service
            });
            console.log(`Created service: ${service.name}`);
        } else {
            await prisma.service.update({
                where: { slug: service.slug },
                data: service
            });
            console.log(`Updated service: ${service.name}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
