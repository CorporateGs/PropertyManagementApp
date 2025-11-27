import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

        const serviceId = params.id;
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
        }

        // Check if already subscribed
        const existingSubscription = await prisma.subscription.findFirst({
            where: {
                userId: user.id,
                serviceId: service.id,
                status: 'ACTIVE',
            },
        });

        if (existingSubscription) {
            return NextResponse.json(
                { success: false, error: 'Already subscribed to this service' },
                { status: 400 }
            );
        }

        // Create subscription
        const subscription = await prisma.subscription.create({
            data: {
                userId: user.id,
                serviceId: service.id,
                amount: service.price,
                billingCycle: service.billingCycle,
                status: 'ACTIVE',
                startDate: new Date(),
                nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            },
        });

        // Log activity if admin
        if (user.role === 'ADMIN') {
            await prisma.adminActivity.create({
                data: {
                    adminId: user.id,
                    action: 'SUBSCRIBE_SERVICE',
                    targetType: 'SERVICE',
                    targetId: service.id,
                    details: JSON.stringify({ subscriptionId: subscription.id }),
                },
            });
        }

        return NextResponse.json({ success: true, data: subscription });
    } catch (error) {
        console.error('Failed to subscribe:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process subscription' },
            { status: 500 }
        );
    }
}
