import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const buildingId = params.id;
    const { title, message, type, channels } = await request.json();

    try {
        // 1. Create the Alert Record
        const alert = await prisma.emergencyAlert.create({
            data: {
                buildingId,
                title,
                message,
                alertType: type || 'EMERGENCY',
                severity: 'HIGH',
                channels: JSON.stringify(channels || ['SMS', 'EMAIL']),
                createdBy: session.user.id,
                sentAt: new Date()
            }
        });

        // 2. Fetch Target Audience (All tenants in building)
        const tenants = await prisma.tenant.findMany({
            where: {
                unit: {
                    buildingId
                }
            }
        });

        // 3. Simulate Multi-Channel Broadcast
        const results = {
            sms: 0,
            email: 0,
            voice: 0
        };

        for (const tenant of tenants) {
            // SMS Simulation
            if (channels.includes('SMS') && tenant.phone) {
                console.log(`[SMS SENT] To: ${tenant.phone} | Msg: ${message}`);
                results.sms++;
            }

            // Email Simulation
            if (channels.includes('EMAIL') && tenant.email) {
                console.log(`[EMAIL SENT] To: ${tenant.email} | Subject: ${title}`);
                results.email++;
            }

            // Voice Call Simulation (Twilio Programmable Voice)
            if (channels.includes('VOICE') && tenant.phone) {
                console.log(`[VOICE CALL] Dialing: ${tenant.phone} | Msg: ${message}`);
                results.voice++;
            }
        }

        return NextResponse.json({
            success: true,
            alertId: alert.id,
            recipientCount: tenants.length,
            deliveryStats: results
        });

    } catch (error) {
        console.error('Alert Broadcast Error:', error);
        return NextResponse.json({ error: 'Failed to broadcast alert' }, { status: 500 });
    }
}
