import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET: Export payments to CSV for QuickBooks
export async function GET(request: Request) {
    try {
        const user = await requireAuth(request);
        
        // Only admin/staff/owner can export financial data
        if (user.role === 'TENANT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Fetch payments
        const payments = await prisma.payment.findMany({
            where: {
                status: 'COMPLETED',
                paidDate: {
                    gte: startDate ? new Date(startDate) : undefined,
                    lte: endDate ? new Date(endDate) : undefined
                }
            },
            include: {
                tenant: {
                    include: {
                        unit: true
                    }
                }
            },
            orderBy: {
                paidDate: 'desc'
            }
        });

        // Generate CSV
        // QuickBooks IIF or simple CSV format: Date, Description, Amount, Account, Class
        const csvHeader = 'Date,Description,Amount,Account,Class,Customer\n';
        const csvRows = payments.map(payment => {
            const date = payment.paidDate ? new Date(payment.paidDate).toISOString().split('T')[0] : '';
            const description = `Rent Payment - Unit ${payment.tenant.unit.unitNumber}`;
            const amount = payment.amount.toFixed(2);
            const account = 'Rental Income'; // Default account
            const className = payment.tenant.unit.buildingId; // Use building ID as Class
            const customer = `${payment.tenant.firstName} ${payment.tenant.lastName}`;

            return `${date},"${description}",${amount},"${account}","${className}","${customer}"`;
        }).join('\n');

        const csvContent = csvHeader + csvRows;

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="quickbooks_export_${new Date().toISOString().split('T')[0]}.csv"`
            }
        });

    } catch (error) {
        console.error('Failed to export to QuickBooks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
