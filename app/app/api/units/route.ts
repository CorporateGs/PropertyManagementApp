import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateQuery, validateBody } from "@/lib/middleware/validation";
import { paginationQuerySchema, searchQuerySchema } from "@/lib/middleware/validation";
import { createUnitSchema } from "@/lib/validation/schemas";
import { ok, created, badRequest, serverError, paginated } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// GET /api/units - List units with filters
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
          buildingId: z.string().optional(),
          status: z.enum(["VACANT", "OCCUPIED", "MAINTENANCE", "RENOVATION"]).optional(),
          bedrooms: z.coerce.number().optional(),
          bathrooms: z.coerce.number().optional(),
          minRent: z.coerce.number().optional(),
          maxRent: z.coerce.number().optional(),
          type: z.enum(["STUDIO", "1BED", "2BED", "3BED", "4BED", "LOFT", "PENTHOUSE"]).optional(),
        })
      ),
      request
    ) as {
      page: number;
      limit: number;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      buildingId?: string;
      status?: "VACANT" | "OCCUPIED" | "MAINTENANCE" | "RENOVATION";
      bedrooms?: number;
      bathrooms?: number;
      minRent?: number;
      maxRent?: number;
      type?: "STUDIO" | "1BED" | "2BED" | "3BED" | "4BED" | "LOFT" | "PENTHOUSE";
    };

    const { page, limit } = queryParams;
    const offset = (page - 1) * limit;

    // Build where clause based on user role and filters
    const where: any = {};

    // Role-based filtering
    if (user.role === "OWNER") {
      // Owners can only see units in their buildings
      where.building = {
        createdBy: user.id,
      };
    }

    // Apply filters
    if (query.buildingId) {
      where.buildingId = query.buildingId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.bedrooms) {
      where.bedrooms = query.bedrooms;
    }

    if (query.bathrooms) {
      where.bathrooms = query.bathrooms;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.minRent || query.maxRent) {
      where.rentAmount = {};
      if (query.minRent) {
        where.rentAmount.gte = query.minRent;
      }
      if (query.maxRent) {
        where.rentAmount.lte = query.maxRent;
      }
    }

    // Get total count for pagination
    const total = await prisma.unit.count({ where });

    // Get units with related data
    const units = await prisma.unit.findMany({
      where,
      include: {
        building: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
          },
        },
        tenants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        buildingId: "asc",
        unitNumber: "asc",
      },
      skip: offset,
      take: limit,
    });

    logger.info("Units retrieved", {
      userId: user.id,
      count: units.length,
      total,
      filters: query,
    });

    return paginated(units, total, page, limit, "Units retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve units", { error });
    return serverError(error);
  }
}

// POST /api/units - Create new unit
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "OWNER"])(request);

    // Validate request body
    const body = await validateBody(createUnitSchema, request) as any;

    // Verify building exists and user has access
    const building = await prisma.building.findFirst({
      where: {
        id: body.buildingId,
        ...(user.role === "OWNER" && { createdBy: user.id }),
      },
    });

    if (!building) {
      return badRequest("Building not found or access denied");
    }

    // Check if unit number already exists in this building
    const existingUnit = await prisma.unit.findFirst({
      where: {
        buildingId: body.buildingId,
        unitNumber: body.unitNumber,
      },
    });

    if (existingUnit) {
      return badRequest("Unit number already exists in this building");
    }

    // Create unit
    const unit = await prisma.unit.create({
      data: {
        ...body,
        status: body.status || "VACANT",
      },
      include: {
        building: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    logger.info("Unit created", {
      userId: user.id,
      unitId: unit.id,
      buildingId: unit.buildingId,
      unitNumber: unit.unitNumber,
    });

    return created(unit, "Unit created successfully");
  } catch (error) {
    logger.error("Failed to create unit", { error });
    return serverError(error);
  }
}
