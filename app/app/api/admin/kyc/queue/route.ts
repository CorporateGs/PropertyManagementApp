import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    // Check auth
    const user = await requireAuth(req as any);
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Mock data for now until we have real KYC documents in DB
    const kycQueue = [
      { id: '1', name: "Sarah Connor", role: "Tenant", doc: "Lease_Agrmt.pdf", status: "PENDING" },
      { id: '2', name: "John Wick", role: "Private Client", doc: "Passport_ID.jpg", status: "PENDING" },
      { id: '3', name: "Bruce Wayne", role: "Board Member", doc: "Deed_Title.pdf", status: "PENDING" }
    ];

    return NextResponse.json({
      success: true,
      data: kycQueue
    });
  } catch (error) {
    console.error('KYC Queue error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
