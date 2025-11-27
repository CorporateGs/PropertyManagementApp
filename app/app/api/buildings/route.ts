import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateQuery, validateBody } from "@/lib/middleware/validation";
import { paginationQuerySchema, searchQuerySchema } from "@/lib/middleware/validation";
import { createBuildingSchema } from "@/lib/validation/schemas";
import { ok, created, badRequest, serverError, paginated } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// GET /api/buildings - List buildings with filters
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Validate pagination and search
    const queryParams = validateQuery(
      paginationQuerySchema.merge(
        searchQuerySchema.extend({
          ownerId: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          minUnits: z.coerce.number().optional(),
          maxUnits: z.coerce.number().optional(),
        })
      ),
      request
    ) as {
      page: number;
      limit: number;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      ownerId?: string;
      city?: string;
      state?: string;
      minUnits?: number;
      maxUnits?: number;
    };

    const { page, limit } = queryParams;
    const offset = (page - 1) * limit;

    // Build where clause based on user role and filters
    const where: any = {};

    // Role-based filtering
    if (user.role === "OWNER") {
      // Owners can only see their own buildings
      where.createdBy = user.id;
    }

    // Apply filters
    if (query.ownerId) {
      where.createdBy = query.ownerId;
    }

    if (query.city) {
      where.city = { contains: query.city, mode: "insensitive" };
    }

    if (query.state) {
      where.state = query.state.toUpperCase();
    }

    if (query.minUnits || query.maxUnits) {
      where.totalUnits = {};
      if (query.minUnits) {
        where.totalUnits.gte = query.minUnits;
      }
      if (query.maxUnits) {
        where.totalUnits.lte = query.maxUnits;
      }
    }

    // Get total count for pagination
    const total = await prisma.building.count({ where });

    // Get buildings with aggregated statistics
    const buildings = await prisma.building.findMany({
      where,
      include: {
        units: {
          select: {
            id: true,
            unitNumber: true,
            status: true,
            rentAmount: true,
            tenants: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            units: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      skip: offset,
      take: limit,
    });

    // Calculate additional statistics for each building
    const buildingsWithStats = buildings.map((building: any) => {
      const totalUnits = building.units?.length || 0;
      const occupiedUnits = building.units?.filter((unit: any) => unit.status === "OCCUPIED").length || 0;
      const vacantUnits = building.units?.filter((unit: any) => unit.status === "VACANT").length || 0;
      const totalRent = building.units
        ?.filter((unit: any) => unit.status === "OCCUPIED")
        ?.reduce((sum: number, unit: any) => sum + unit.rentAmount, 0) || 0;

      return {
        ...building,
        statistics: {
          totalUnits,
          occupiedUnits,
          vacantUnits,
          occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
          totalMonthlyRent: totalRent,
        },
      };
    });

    logger.info("Buildings retrieved", {
      userId: user.id,
      count: buildings.length,
      total,
      filters: query,
    });

    return paginated(buildingsWithStats, total, page, limit, "Buildings retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve buildings", { error });
    return serverError(error);
  }
}

// POST /api/buildings - Create new building
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "OWNER"])(request);

    // Validate request body
    const body = await validateBody(createBuildingSchema, request) as any;

    // If owner is creating building, set createdBy to their ID
    if (user.role === "OWNER" && !body.createdBy) {
      body.createdBy = user.id;
    }

    // If createdBy is provided, verify that user has permission to create buildings for that owner
    if (body.createdBy && user.role !== "ADMIN" && user.role !== "STAFF") {
      return badRequest("You don't have permission to create buildings for other owners");
    }

    // Create building
    const building = await prisma.building.create({
      data: {
        ...body,
        country: body.country || "USA",
      },
      include: {
        units: true,
      },
    });

    logger.info("Building created", {
      userId: user.id,
      buildingId: building.id,
      createdBy: building.createdBy,
      totalUnits: building.totalUnits,
    });

    return created(building, "Building created successfully");
  } catch (error) {
    logger.error("Failed to create building", { error });
    return serverError(error);
  }
}
