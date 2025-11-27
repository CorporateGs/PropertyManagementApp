import { NextRequest, NextResponse } from 'next/server';
import { PropertyScoreService } from '@/lib/services/property-scoring/property-score-service';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const updateScores = searchParams.get('update') === 'true';

    if (buildingId) {
      // Get score for specific building
      if (updateScores) {
        const scoreResult = await PropertyScoreService.updatePropertyScore(buildingId);
        return NextResponse.json({
          success: true,
          data: scoreResult,
          message: 'Property score updated successfully'
        });
      } else {
        const scoreResult = await PropertyScoreService.calculatePropertyScore(buildingId);
        return NextResponse.json({
          success: true,
          data: scoreResult,
          message: 'Property score calculated successfully'
        });
      }
    } else {
      // Get scores for all buildings
      if (updateScores) {
        const scoreResults = await PropertyScoreService.updateAllPropertyScores();
        return NextResponse.json({
          success: true,
          data: scoreResults,
          message: 'All property scores updated successfully'
        });
      } else {
        // Return current scores from database
        return NextResponse.json({
          success: false,
          error: 'Please specify buildingId or set update=true'
        }, { status: 400 });
      }
    }
  } catch (error) {
    logger.error('Error in property scores API:', error as Error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { buildingId, action } = body;

    if (!buildingId) {
      return NextResponse.json({
        success: false,
        error: 'Building ID is required'
      }, { status: 400 });
    }

    switch (action) {
      case 'update':
        const scoreResult = await PropertyScoreService.updatePropertyScore(buildingId);
        return NextResponse.json({
          success: true,
          data: scoreResult,
          message: 'Property score updated successfully'
        });
      
      case 'calculate':
        const calculationResult = await PropertyScoreService.calculatePropertyScore(buildingId);
        return NextResponse.json({
          success: true,
          data: calculationResult,
          message: 'Property score calculated successfully'
        });
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    logger.error('Error in property scores POST API:', error as Error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
