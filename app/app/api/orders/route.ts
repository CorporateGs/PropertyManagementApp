// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { AIAgentOrchestrator } from '@/lib/ai-orchestrator';

// GET /api/orders - List user's orders
export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth(req);

        const orders = await prisma.order.findMany({
            where: { clientId: user.id },
            include: {
                aiAgent: {
                    select: {
                        name: true,
                        type: true
                    }
                },
                deliveries: true,
                _count: {
                    select: {
                        tasks: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

// POST /api/orders - Create new order
export async function POST(req: NextRequest) {
    try {
        const user = await requireAuth(req);
        const body = await req.json();

        const { serviceType, requirements, priority } = body;

        if (!serviceType || !requirements) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create order
        const order = await prisma.order.create({
            data: {
                orderNumber,
                clientId: user.id,
                serviceType,
                requirements: JSON.stringify(requirements),
                priority: priority || 5,
                status: 'PENDING'
            }
        });

        // Process order asynchronously
        processOrderAsync(order.id);

        return NextResponse.json({
            success: true,
            data: order,
            message: 'Order created successfully. AI agent will start processing shortly.'
        });

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create order' },
            { status: 500 }
        );
    }
}

// Process order asynchronously
async function processOrderAsync(orderId: string) {
    try {
        const orchestrator = new AIAgentOrchestrator();
        await orchestrator.processOrder(orderId);
    } catch (error) {
        console.error(`Failed to process order ${orderId}:`, error);
    }
}
