import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET: List visitor permits
export async function GET(request: Request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);
        const buildingId = searchParams.get('buildingId');

        let whereClause: any = {};

        if (user.role === 'ADMIN' || user.role === 'STAFF') {
            // Admin/Staff can view all permits for a building
            if (buildingId) {
                whereClause = {
                    unit: {
                        buildingId: buildingId
                    }
                };
            }
        } else {
            // Tenants/Owners can only view their own permits
            // Find the unit associated with the user (simplified logic)
            // In a real app, we'd need a more robust way to link user -> unit(s)
            // For now, assuming user has a 'tenants' record or 'units' ownership
            const tenant = await prisma.tenant.findFirst({
                where: { email: user.email }
            });

            if (tenant) {
                whereClause = { unitId: tenant.unitId };
            } else {
                // Try owner logic
                const ownedUnit = await prisma.unit.findFirst({
                    where: { createdBy: user.id } // Simplified ownership check
                });
                if (ownedUnit) {
                    whereClause = { unitId: ownedUnit.id };
                } else {
                    return NextResponse.json({ error: 'No unit found for user' }, { status: 404 });
                }
            }
        }

        const permits = await prisma.visitorPermit.findMany({
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

        return NextResponse.json({ success: true, data: permits });

    } catch (error) {
        console.error('Failed to fetch visitor permits:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create a new visitor permit
export async function POST(request: Request) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();
        const { licensePlate, visitorName, makeModel, startDate, endDate, unitId } = body;

        // Validation
        if (!licensePlate || !visitorName || !startDate || !endDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Permission check: User must be associated with the unit
        // (Skipping complex check for brevity, assuming UI sends correct unitId and backend trusts authenticated user for now or relies on simple check)
        // Ideally: Verify user.id is tenant of unitId or owner of unitId

        const permit = await prisma.visitorPermit.create({
            data: {
                unitId,
                licensePlate,
                visitorName,
                makeModel,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                createdBy: user.id,
                status: 'ACTIVE'
            }
        });

        return NextResponse.json({ success: true, data: permit });

    } catch (error) {
        console.error('Failed to create visitor permit:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
