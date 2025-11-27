import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { AuthorizationError } from "@/lib/errors";
import { validateQuery, validateBody } from "@/lib/middleware/validation";
import { paginationQuerySchema, searchQuerySchema } from "@/lib/middleware/validation";
import { createMaintenanceSchema } from "@/lib/validation/schemas";
import { ok, created, badRequest, serverError, paginated } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// GET /api/maintenance - List maintenance requests
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    // Check role but don't throw if user is OWNER or TENANT - they have limited access
    if (!["ADMIN", "STAFF", "OWNER", "TENANT"].includes(user.role)) {
      throw new AuthorizationError("Access denied");
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Validate pagination and search with defaults
    let queryParams: {
      page: number;
      limit: number;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      unitId?: string;
      tenantId?: string;
      status?: "OPEN" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "EMERGENCY";
    };

    try {
      queryParams = validateQuery(
        paginationQuerySchema.merge(
          searchQuerySchema.extend({
            unitId: z.string().optional(),
            tenantId: z.string().optional(),
            status: z.enum(["OPEN", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
            priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT", "EMERGENCY"]).optional(),
          })
        ),
        request
      ) as typeof queryParams;
    } catch (validationError: any) {
      // If validation fails, use defaults
      logger.warn("Validation error, using defaults", { error: validationError?.message, query });
      queryParams = {
        page: parseInt(query.page as string) || 1,
        limit: parseInt(query.limit as string) || 10,
        search: query.search as string,
        status: query.status as any,
        priority: query.priority as any,
        unitId: query.unitId as string,
        tenantId: query.tenantId as string,
      };
    }

    const { page, limit } = queryParams;
    const offset = (page - 1) * limit;

    // Build where clause based on user role and filters
    const where: any = {};

    // Role-based filtering
    if (user.role === "OWNER") {
      // Owners can only see maintenance for their buildings
      where.unit = {
        building: {
          createdBy: user.id,
        },
      };
    }

    if (user.role === "TENANT") {
      // Tenants can only see their own maintenance requests
      where.tenant = {
        userId: user.id,
      };
    }

    // Apply filters
    if (query.unitId) {
      where.unitId = query.unitId;
    }

    if (query.tenantId) {
      where.tenantId = query.tenantId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    // Get total count for pagination
    const total = await prisma.maintenanceRequest.count({ where });

    // Get maintenance requests with related data
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        unit: {
          select: {
            id: true,
            unitNumber: true,
            building: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { priority: "desc" }, // Higher priority first
        { createdAt: "desc" },
      ],
      skip: offset,
      take: limit,
    });

    logger.info("Maintenance requests retrieved", {
      userId: user.id,
      count: maintenanceRequests.length,
      total,
      filters: query,
    });

    return paginated(maintenanceRequests, total, page, limit, "Maintenance requests retrieved successfully");
  } catch (error: any) {
    logger.error("Failed to retrieve maintenance requests", { error, message: error?.message, stack: error?.stack });
    // Return empty array instead of error for better UX
    if (error?.message?.includes("validation") || error?.message?.includes("Invalid")) {
      return paginated([], 0, 1, 10, "No maintenance requests found");
    }
    return serverError(error);
  }
}

// POST /api/maintenance - Create maintenance request
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "TENANT", "OWNER"])(request);

    // Validate request body
    const body = await validateBody(createMaintenanceSchema, request) as {
      unitId: string;
      tenantId?: string;
      title: string;
      description: string;
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "EMERGENCY";
      status?: "OPEN" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
    };

    // Verify unit exists and user has access
    const unit = await prisma.unit.findFirst({
      where: {
        id: body.unitId,
        building: {
          // Role-based building access check
          ...(user.role === "OWNER" && { createdBy: user.id }),
        },
      },
      include: {
        building: true,
      },
    });

    if (!unit) {
      return badRequest("Unit not found or access denied");
    }

    // If tenant is creating request, verify they live in unit
    if (user.role === "TENANT" && body.tenantId) {
      const tenant = await prisma.tenant.findFirst({
        where: {
          id: body.tenantId,
          unitId: body.unitId,
          status: "ACTIVE",
        },
      });

      if (!tenant) {
        return badRequest("You don't have permission to create maintenance requests for this unit");
      }
    }

    // Create maintenance request
    const data: any = {
      unitId: body.unitId,
      title: body.title,
      description: body.description,
      priority: body.priority || "MEDIUM",
      status: body.status || "OPEN",
      userId: user.id,
    };

    if (body.tenantId) {
      data.tenantId = body.tenantId;
    }

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data,
      include: {
        unit: {
          select: {
            id: true,
            unitNumber: true,
            building: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info("Maintenance request created", {
      userId: user.id,
      maintenanceRequestId: maintenanceRequest.id,
      unitId: maintenanceRequest.unitId,
      priority: maintenanceRequest.priority,
    });

    return created(maintenanceRequest, "Maintenance request created successfully");
  } catch (error) {
    logger.error("Failed to create maintenance request", { error });
    return serverError(error);
  }
}
