import { NextRequest } from "next/server";
import { requireAuth, requireRole, UserRole } from "@/lib/middleware/auth";
import { validateQuery, validateBody } from "@/lib/middleware/validation";
import { paginationQuerySchema, searchQuerySchema } from "@/lib/middleware/validation";
import { createTenantSchema } from "@/lib/validation/schemas";
import { ok, created, badRequest, serverError, paginated } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// GET /api/tenants - List tenants with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole([UserRole.ADMIN, UserRole.STAFF])(request);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Validate pagination and search
    const queryParams = validateQuery(
      paginationQuerySchema.merge(
        searchQuerySchema.extend({
          buildingId: z.string().optional(),
          status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional(),
          leaseExpiring: z.coerce.boolean().optional(),
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
      status?: "ACTIVE" | "INACTIVE" | "PENDING";
      leaseExpiring?: boolean;
    };

    const { page, limit } = queryParams;

    const offset = (page - 1) * limit;

    // Build where clause based on user role and filters
    const where: any = {};

    // Role-based filtering
    if (user.role === "OWNER") {
      // Owners can only see tenants in their buildings
      where.unit = {
        building: {
          ownerId: user.id,
        },
      };
    }

    // Apply filters
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: "insensitive" } },
        { lastName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.buildingId) {
      where.unit = {
        ...where.unit,
        buildingId: query.buildingId,
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.leaseExpiring) {
      // Find tenants with leases expiring in next 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      where.leaseEndDate = {
        lte: thirtyDaysFromNow,
      };
    }

    // Get total count for pagination
    const total = await prisma.tenant.count({ where });

    // Get tenants with related data
    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        unit: {
          include: {
            building: true,
          },
        },
        payments: {
          where: {
            status: "PENDING",
          },
          orderBy: {
            dueDate: "asc",
          },
        },
        maintenanceRequests: {
          where: {
            status: {
              in: ["OPEN", "IN_PROGRESS"],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    logger.info("Tenants retrieved", {
      userId: user.id,
      count: tenants.length,
      total,
      filters: query,
    });

    return paginated(tenants, total, page, limit, "Tenants retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve tenants", { error });
    return serverError(error);
  }
}

// POST /api/tenants - Create new tenant
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Validate request body
    const body = await validateBody(createTenantSchema, request) as {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      dateOfBirth?: string;
      ssn?: string;
      driverLicense?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      unitId: string;
      leaseStartDate: string;
      leaseEndDate: string;
      monthlyRent: number;
      securityDeposit: number;
      notes?: string;
    };

    // Check if unit exists and is available
    const unit = await prisma.units.findUnique({
      where: { id: body.unitId },
      include: { building: true },
    });

    if (!unit) {
      return badRequest("Unit not found");
    }

    // Check if unit is available (no active tenant)
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        unitId: body.unitId,
        status: "ACTIVE",
      },
    });

    if (existingTenant) {
      return badRequest("Unit is already occupied");
    }

    // Role-based ownership check for owners
    if (user.role === "OWNER") {
      if (unit.building.ownerId !== user.id) {
        return badRequest("You don't have permission to add tenants to this unit");
      }
    }

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        ...body,
        status: "ACTIVE",
        userId: user.id, // Track who created the tenant
      },
      include: {
        unit: {
          include: {
            building: true,
          },
        },
      },
    });

    logger.info("Tenant created", {
      userId: user.id,
      tenantId: tenant.id,
      unitId: tenant.unitId,
    });

    return created(tenant, "Tenant created successfully");
  } catch (error) {
    logger.error("Failed to create tenant", { error });
    return serverError(error);
  }
}