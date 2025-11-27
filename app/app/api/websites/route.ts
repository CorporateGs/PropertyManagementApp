import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET: Fetch website content
export async function GET(request: Request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);
        const buildingId = searchParams.get('buildingId');

        if (!buildingId) {
            return NextResponse.json({ error: 'Building ID required' }, { status: 400 });
        }

        const website = await prisma.websiteManagement.findUnique({
            where: { buildingId }
        });

        return NextResponse.json({ success: true, data: website });

    } catch (error) {
        console.error('Failed to fetch website:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Update website content
export async function POST(request: Request) {
    try {
        const user = await requireAuth(request);
        
        if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { buildingId, title, description, homeContent, status } = body;

        if (!buildingId) {
            return NextResponse.json({ error: 'Building ID required' }, { status: 400 });
        }

        const website = await prisma.websiteManagement.upsert({
            where: { buildingId },
            update: {
                title,
                description,
                homeContent,
                status,
                modifiedBy: user.id,
                lastModified: new Date()
            },
            create: {
                buildingId,
                title: title || 'Community Website',
                description,
                homeContent,
                status: status || 'DRAFT'
            }
        });

        return NextResponse.json({ success: true, data: website });

    } catch (error) {
        console.error('Failed to update website:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
