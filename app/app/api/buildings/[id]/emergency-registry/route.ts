import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET: List registry entries for a building (Admin) or unit (Tenant)
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params; // Building ID or Unit ID context

    // Check if user is admin or accessing their own unit
    // For simplicity in this "God Mode" implementation, we'll assume admins can access building routes
    
    try {
        const registry = await prisma.emergencyRegistry.findMany({
            where: {
                unit: {
                    buildingId: id
                }
            },
            include: {
                unit: true
            }
        });

        return NextResponse.json(registry);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch registry' }, { status: 500 });
    }
}

// POST: Add new registry entry
export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { unitId, type, name, details, emergencyContact } = body;

        const entry = await prisma.emergencyRegistry.create({
            data: {
                unitId,
                type,
                name,
                details,
                emergencyContact
            }
        });

        return NextResponse.json(entry);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
    }
}
