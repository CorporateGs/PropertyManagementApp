import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET: List status certificates
export async function GET(request: Request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);
        const buildingId = searchParams.get('buildingId');

        // Admin/Staff see all, Owners see their own requests
        let whereClause: any = {};

        if (user.role === 'ADMIN' || user.role === 'STAFF') {
            if (buildingId) {
                whereClause = { buildingId };
            }
        } else {
            whereClause = { requesterEmail: user.email };
        }

        const certificates = await prisma.statusCertificate.findMany({
            where: whereClause,
            include: {
                building: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: certificates });

    } catch (error) {
        console.error('Failed to fetch status certificates:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Request a new status certificate
export async function POST(request: Request) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();
        const { buildingId, unitId, purpose, dueDate } = body;

        if (!buildingId || !purpose || !dueDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const requestId = `SC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        const certificate = await prisma.statusCertificate.create({
            data: {
                buildingId,
                unitId,
                requestId,
                requesterName: user.name || 'Unknown',
                requesterEmail: user.email,
                purpose,
                dueDate: new Date(dueDate),
                status: 'REQUESTED',
                createdBy: user.id
            }
        });

        return NextResponse.json({ success: true, data: certificate });

    } catch (error) {
        console.error('Failed to create status certificate request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
