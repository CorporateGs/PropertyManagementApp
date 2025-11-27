import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const createVisitorPassSchema = z.object({
  parkingSpaceId: z.string(),
  tenantId: z.string(),
  visitorName: z.string().min(1),
  visitorEmail: z.string().email().optional(),
  visitorPhone: z.string().optional(),
  licensePlate: z.string().min(1),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleColor: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  notes: z.string().optional(),
});

// GET all visitor passes for a building
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');

    const where: any = {};
    
    if (buildingId) {
      where.parkingSpace = {
        buildingId: buildingId
      };
    }
    
    if (tenantId) {
      where.tenantId = tenantId;
    }
    
    if (status) {
      where.status = status;
    }

    const visitorPasses = await prisma.visitorPass.findMany({
      where,
      include: {
        parkingSpace: {
          include: {
            building: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: visitorPasses
    });

  } catch (error) {
    console.error('Error fetching visitor passes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visitor passes' },
      { status: 500 }
    );
  }
}

// POST create new visitor pass
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createVisitorPassSchema.parse(body);

    // Check if parking space exists and has capacity
    const parkingSpace = await prisma.parkingSpace.findUnique({
      where: { id: validatedData.parkingSpaceId },
      include: {
        visitorPasses: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    if (!parkingSpace) {
      return NextResponse.json({ error: 'Parking space not found' }, { status: 404 });
    }

    // Check if tenant is assigned to this space or has permission
    if (parkingSpace.tenantId !== validatedData.tenantId && !parkingSpace.isVisitorSpace) {
      return NextResponse.json({ error: 'Tenant not authorized for this parking space' }, { status: 403 });
    }

    // Check if the space has exceeded max guest passes
    if (parkingSpace.visitorPasses.length >= (parkingSpace.maxGuestPasses || 2)) {
      return NextResponse.json({ error: 'Maximum guest passes exceeded for this space' }, { status: 400 });
    }

    // Generate QR code (simplified - in production use proper QR generation)
    const qrCode = `VP-${Date.now()}-${validatedData.licensePlate}`;

    const visitorPass = await prisma.visitorPass.create({
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        createdBy: session.user.id,
        qrCode,
      },
      include: {
        parkingSpace: {
          include: {
            building: true
          }
        }
      }
    });

    // TODO: Send notification email to tenant with QR code
    // TODO: Send SMS if phone number provided

    return NextResponse.json({
      success: true,
      data: visitorPass
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating visitor pass:', error);
    return NextResponse.json(
      { error: 'Failed to create visitor pass' },
      { status: 500 }
    );
  }
}
