import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateBody } from "@/lib/middleware/validation";
import { rentPricingInputSchema } from "@/lib/validation/schemas";
import { ok, created, badRequest, serverError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { RentPricingAI } from '@/lib/services/ai/ai-service';
import { prisma } from '@/lib/db';

// POST /api/ai/rent-pricing - Calculate optimal rent for a unit
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "OWNER"])(request);

    // Validate request body
    const body = await validateBody(rentPricingInputSchema, request) as {
      unitId: string;
      currentRent?: number;
      squareFootage: number;
      bedrooms: number;
      bathrooms: number;
      buildingId: string;
      neighborhood?: string;
      amenities?: string[];
      marketData?: {
        similarUnits: Array<{
          rent: number;
          squareFootage: number;
          distance: number;
        }>;
      };
    };

    // Verify unit exists and user has access
    const unit = await prisma.units.findFirst({
      where: {
        id: body.unitId,
        building: {
          ...(user.role === "OWNER" && { ownerId: user.id }),
        },
      },
      include: {
        building: true,
      },
    });

    if (!unit) {
      return badRequest("Unit not found or access denied");
    }

    const pricingAI = new RentPricingAI();
    const pricingResult = await pricingAI.calculateOptimalRent({
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      squareFeet: unit.squareFeet,
      location: { city: unit.building.city, state: unit.building.state, zipCode: unit.building.zipCode },
      amenities: unit.amenities || [],
      condition: unit.condition || 'GOOD',
      yearBuilt: unit.building.yearBuilt,
      currentRent: unit.rentAmount,
      competitorRents: body.marketData?.similarUnits?.map(unit => ({
        rent: unit.rent,
        bedrooms: body.bedrooms, // Assuming same as current unit, or could be derived
        distance: unit.distance,
      })) || [],
    });

    // Store pricing analysis in database for historical tracking
    await prisma.aIResult.create({
      data: {
        requestKey: `rent-pricing-${unit.id}-${Date.now()}`,
        result: JSON.stringify(pricingResult),
        model: 'RentPricingAI',
        createdAt: new Date(),
      },
    });

    logger.info("Rent pricing analysis completed", {
      userId: user.id,
      unitId: body.unitId,
      currentRent: unit.rentAmount,
      recommendedRent: pricingResult.recommendedRent,
    });

    return created({
      ...pricingResult,
      demandForecast: pricingResult.demandForecast,
      seasonalAdjustment: pricingResult.seasonalAdjustment,
      recommendations: pricingResult.recommendations,
    }, "Rent pricing analysis completed successfully");
  } catch (error) {
    logger.error("Failed to calculate rent pricing", { error });
    return serverError(error);
  }
}

// POST /api/ai/rent-pricing/bulk - Analyze multiple units
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "OWNER"])(request);

    // Validate request body for bulk analysis
    const body = await validateBody(
      z.object({
        unitIds: z.array(z.string().uuid()).min(1).max(50), // Max 50 units at once
        includeMarketData: z.boolean().default(true),
      }),
      request
    ) as {
      unitIds: string[];
      includeMarketData?: boolean;
    };

    // Verify all units exist and user has access
    const units = await prisma.units.findMany({
      where: {
        id: { in: body.unitIds },
        building: {
          ...(user.role === "OWNER" && { ownerId: user.id }),
        },
      },
      include: {
        building: true,
      },
    });

    if (units.length !== body.unitIds.length) {
      return badRequest("Some units not found or access denied");
    }

    const pricingAI = new RentPricingAI();
    const pricingResults = await Promise.all(
      units.map(async (unit) => {
        const result = await pricingAI.calculateOptimalRent({
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          squareFeet: unit.squareFeet,
          location: { city: unit.building.city, state: unit.building.state, zipCode: unit.building.zipCode },
          amenities: unit.amenities || [],
          condition: unit.condition || 'GOOD',
          yearBuilt: unit.building.yearBuilt,
          currentRent: unit.rentAmount,
          competitorRents: [], // For bulk, no specific market data, could be enhanced
        });

        // Store each pricing analysis
        await prisma.aIResult.create({
          data: {
            requestKey: `rent-pricing-bulk-${unit.id}-${Date.now()}`,
            result: JSON.stringify(result),
            model: 'RentPricingAI',
            createdAt: new Date(),
          },
        });

        return {
          unitId: unit.id,
          unitNumber: unit.unitNumber,
          ...result,
          demandForecast: result.demandForecast,
          seasonalAdjustment: result.seasonalAdjustment,
          recommendations: result.recommendations,
        };
      })
    );

    // Calculate portfolio impact
    const totalCurrentRent = units.reduce((sum, unit) => sum + (unit.rentAmount || 0), 0);
    const totalRecommendedRent = pricingResults.reduce((sum, result) => sum + result.recommendedRent, 0);
    const portfolioIncrease = totalRecommendedRent - totalCurrentRent;

    const bulkResult = {
      units: pricingResults,
      portfolioAnalysis: {
        totalCurrentRent,
        totalRecommendedRent,
        potentialIncrease: portfolioIncrease,
        averageIncrease: Math.round(portfolioIncrease / units.length),
        unitsAnalyzed: units.length,
      },
      analysisDate: new Date().toISOString(),
    };

    logger.info("Bulk rent pricing analysis completed", {
      userId: user.id,
      unitsAnalyzed: units.length,
      totalCurrentRent,
      totalRecommendedRent,
      potentialIncrease: portfolioIncrease,
    });

    return created(bulkResult, "Bulk rent pricing analysis completed successfully");
  } catch (error) {
    logger.error("Failed to calculate bulk rent pricing", { error });
    return serverError(error);
  }
}