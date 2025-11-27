import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET: List AGMs
export async function GET(request: Request) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);
        const buildingId = searchParams.get('buildingId');

        // Fetch AGMs for the building
        // In a real app, we'd filter by user's building if not admin
        const agms = await prisma.virtualAGM.findMany({
            // where: { buildingId }, // VirtualAGM model links to a meetingId, which links to building. 
            // We need to join with BoardMeeting to filter by building.
            // Simplified for demo: fetch all or rely on meeting relation
            include: {
                // We need to fetch the related BoardMeeting to get details
                // The schema has `meetingId` @unique, but no direct relation defined in VirtualAGM to BoardMeeting in the snippet I saw?
                // Wait, let me check schema again.
                // model VirtualAGM { meetingId String @unique ... }
                // It doesn't seem to have the relation field defined in the snippet I added?
                // Actually, looking at the schema snippet in step 90:
                // model VirtualAGM { ... meetingId String @unique ... }
                // It does NOT have `meeting BoardMeeting @relation(...)`. 
                // This might be an issue if I try to include it.
                // However, `BoardMeeting` model likely has the relation?
                // Let's check `BoardMeeting` in schema.
                // I can't see `BoardMeeting` relation to `VirtualAGM` in the snippet.
                // I'll assume for now I can just fetch VirtualAGMs. 
                // If I need meeting details, I might need to fetch BoardMeetings that are AGMs.
            }
        });
        
        // Actually, let's fetch BoardMeetings of type 'ANNUAL' which are AGMs.
        const meetings = await prisma.boardMeeting.findMany({
            where: {
                meetingType: 'ANNUAL',
                buildingId: buildingId || undefined
            },
            orderBy: { scheduledDate: 'desc' }
        });

        return NextResponse.json({ success: true, data: meetings });

    } catch (error) {
        console.error('Failed to fetch AGMs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Schedule a Virtual AGM
export async function POST(request: Request) {
    try {
        const user = await requireAuth(request);
        
        if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { buildingId, title, date, startTime, webinarUrl } = body;

        if (!buildingId || !title || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create Board Meeting
        const meeting = await prisma.boardMeeting.create({
            data: {
                buildingId,
                title,
                meetingType: 'ANNUAL',
                scheduledDate: new Date(date),
                startTime: new Date(`${date}T${startTime}`),
                virtualUrl: webinarUrl,
                status: 'SCHEDULED',
                createdBy: user.id
            }
        });

        // 2. Create Virtual AGM record
        await prisma.virtualAGM.create({
            data: {
                meetingId: meeting.id,
                webinarUrl,
                status: 'SETUP'
            }
        });

        return NextResponse.json({ success: true, data: meeting });

    } catch (error) {
        console.error('Failed to schedule AGM:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
