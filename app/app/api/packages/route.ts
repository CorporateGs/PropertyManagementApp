import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET: List packages
export async function GET(request: Request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);
        const buildingId = searchParams.get('buildingId');

        let whereClause: any = {};

        if (user.role === 'ADMIN' || user.role === 'STAFF') {
            // Admin/Staff can view all packages for a building
            if (buildingId) {
                whereClause = {
                    unit: {
                        buildingId: buildingId
                    }
                };
            }
        } else {
            // Tenants/Owners can only view their own unit's packages
            const tenant = await prisma.tenant.findFirst({
                where: { email: user.email }
            });

            if (tenant) {
                whereClause = { unitId: tenant.unitId };
            } else {
                // Try owner logic
                const ownedUnit = await prisma.unit.findFirst({
                    where: { createdBy: user.id }
                });
                if (ownedUnit) {
                    whereClause = { unitId: ownedUnit.id };
                } else {
                    return NextResponse.json({ error: 'No unit found for user' }, { status: 404 });
                }
            }
        }

        const packages = await prisma.package.findMany({
            where: whereClause,
            include: {
                unit: {
                    select: {
                        unitNumber: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ success: true, data: packages });

    } catch (error) {
        console.error('Failed to fetch packages:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Log a new package (Admin/Staff only)
export async function POST(request: Request) {
    try {
        const user = await requireAuth(request);
        
        // Only staff/admin can log packages
        if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { unitId, carrier, trackingNumber, recipientName, notes } = body;

        if (!unitId || !carrier) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newPackage = await prisma.package.create({
            data: {
                unitId,
                carrier,
                trackingNumber,
                recipientName,
                notes,
                receivedBy: user.id,
                status: 'RECEIVED'
            }
        });

        // TODO: Send notification to resident (email/SMS)

        return NextResponse.json({ success: true, data: newPackage });

    } catch (error) {
        console.error('Failed to log package:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT: Update package status (e.g. Picked Up)
export async function PUT(request: Request) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();
        const { id, status, pickedUpBy } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Only staff/admin can update status
        if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const updatedPackage = await prisma.package.update({
            where: { id },
            data: {
                status,
                pickedUpAt: status === 'PICKED_UP' ? new Date() : undefined,
                pickedUpBy: status === 'PICKED_UP' ? pickedUpBy : undefined
            }
        });

        return NextResponse.json({ success: true, data: updatedPackage });

    } catch (error) {
        console.error('Failed to update package:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
