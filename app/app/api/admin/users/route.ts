import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            include: {
                subscriptions: {
                    where: { status: 'ACTIVE' },
                    include: { service: true },
                },
                _count: {
                    select: {
                        buildings: true,
                        units: true,
                        tenants: true,
                        orders: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Transform data for admin view
        const userData = users.map((user) => ({
            id: user.id,
            name: user.name || `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            stats: {
                buildings: user._count.buildings,
                units: user._count.units,
                tenants: user._count.tenants,
                orders: user._count.orders,
            },
            activeSubscriptions: user.subscriptions.map((sub) => sub.service.name),
            monthlyRevenue: user.subscriptions.reduce((acc, sub) => acc + sub.amount, 0),
        }));

        return NextResponse.json({ success: true, data: userData });
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
