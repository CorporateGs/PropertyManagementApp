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

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const subscriptions = await prisma.subscription.findMany({
            where: {
                userId: user.id,
                status: 'ACTIVE',
            },
            include: {
                service: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ success: true, data: subscriptions });
    } catch (error) {
        console.error('Failed to fetch subscriptions:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch subscriptions' },
            { status: 500 }
        );
    }
}
