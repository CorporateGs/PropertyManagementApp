/**
 * Energy Consumption API Endpoint
 * 
 * GET /api/energy/consumption - Get energy consumption analytics
 * POST /api/energy/consumption - Record energy consumption
 */

import { NextRequest, NextResponse } from 'next/server';
import { EnergyManagementService } from '@/lib/services/energy/energy-service';
import { logger } from '@/lib/logger';
import { DatabaseError, ExternalServiceError } from '@/lib/errors';

const energyService = new EnergyManagementService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const unitId = searchParams.get('unitId');
    const energyType = searchParams.get('energyType');
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : new Date();

    logger.info('Fetching energy consumption analytics', { 
      buildingId, 
      unitId, 
      energyType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const analytics = await energyService.getConsumptionAnalytics({
      buildingId: buildingId || undefined,
      unitId: unitId || undefined,
      energyType: energyType as any,
      startDate,
      endDate
    });

    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to fetch energy consumption analytics', error);
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { success: false, error: 'Database error', message: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      buildingId,
      unitId,
      energyType,
      amount,
      unit,
      cost,
      readingDate,
      meterReading,
      provider
    } = body;

    logger.info('Recording energy consumption', { 
      buildingId, 
      energyType, 
      amount,
      cost 
    });

    const result = await energyService.recordConsumption({
      buildingId,
      unitId,
      energyType,
      amount,
      unit,
      cost,
      readingDate: new Date(readingDate),
      meterReading,
      provider
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Energy consumption recorded successfully'
    });
  } catch (error) {
    logger.error('Failed to record energy consumption', error);
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { success: false, error: 'Database error', message: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to record energy consumption' },
      { status: 500 }
    );
  }
}
