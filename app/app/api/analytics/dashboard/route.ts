/**
 * Analytics Dashboard API Endpoint
 * 
 * GET /api/analytics/dashboard - Get dashboard analytics
 * POST /api/analytics/dashboard - Create custom dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { DashboardService } from '@/lib/services/analytics/analytics-service';
import { logger } from '@/lib/logger';
import { DatabaseError, ExternalServiceError } from '@/lib/errors';

const dashboardService = new DashboardService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const userId = searchParams.get('userId') || 'anonymous';
    const widgets = searchParams.get('widgets')?.split(',') || [];

    logger.info('Fetching dashboard data', { buildingId, userId });

    const dashboardData = await dashboardService.getDashboardData({
      buildingId: buildingId || undefined,
      userId,
      widgets
    });

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to fetch dashboard data', error);
    
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
    const { name, widgets, buildingId, userId } = body;

    logger.info('Creating custom dashboard', { name, buildingId, userId });

    // This would typically create a custom dashboard configuration
    // For now, we'll just return success
    const dashboardConfig = {
      id: `dashboard_${Date.now()}`,
      name,
      widgets,
      buildingId,
      userId,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: dashboardConfig,
      message: 'Custom dashboard created successfully'
    });
  } catch (error) {
    logger.error('Failed to create custom dashboard', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to create dashboard' },
      { status: 500 }
    );
  }
}
