// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET /api/orders/[id] - Get order details
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth(req);

        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: {
                aiAgent: true,
                tasks: {
                    orderBy: { createdAt: 'asc' }
                },
                deliveries: true,
                statusHistory: {
                    orderBy: { timestamp: 'desc' }
                }
            }
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check authorization
        if (order.clientId !== user.id && user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}

// DELETE /api/orders/[id] - Cancel order
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth(req);

        const order = await prisma.order.findUnique({
            where: { id: params.id }
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check authorization
        if (order.clientId !== user.id && user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Can only cancel pending or processing orders
        if (!['PENDING', 'PROCESSING'].includes(order.status)) {
            return NextResponse.json(
                { success: false, error: 'Cannot cancel order in current status' },
                { status: 400 }
            );
        }

        // Update order status
        await prisma.order.update({
            where: { id: params.id },
            data: { status: 'CANCELLED' }
        });

        // Record status change
        await prisma.orderStatusHistory.create({
            data: {
                orderId: params.id,
                fromStatus: order.status,
                toStatus: 'CANCELLED',
                reason: 'Cancelled by user',
                changedBy: user.id
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Order cancelled successfully'
        });

    } catch (error) {
        console.error('Error cancelling order:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to cancel order' },
            { status: 500 }
        );
    }
}
