import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
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
    await requireRole(["ADMIN", "STAFF"])(request);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Validate pagination and search
    const queryParams = validateQuery(
      paginationQuerySchema.merge(
        searchQuerySchema.extend({
          unitId: z.string().optional(),
          tenantId: z.string().optional(),
          status: z.enum(["OPEN", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
          priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT", "EMERGENCY"]).optional(),
          category: z.enum(["PLUMBING", "ELECTRICAL", "HVAC", "APPLIANCE", "STRUCTURAL", "PEST_CONTROL", "LANDSCAPING", "SECURITY", "OTHER"]).optional(),
          assignedStaffId: z.string().optional(),
        })
      ),
      request
    ) as {
      page: number;
      limit: number;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      unitId?: string;
      tenantId?: string;
      status?: "OPEN" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "EMERGENCY";
      category?: "PLUMBING" | "ELECTRICAL" | "HVAC" | "APPLIANCE" | "STRUCTURAL" | "PEST_CONTROL" | "LANDSCAPING" | "SECURITY" | "OTHER";
      assignedStaffId?: string;
    };

    const { page, limit } = queryParams;
    const offset = (page - 1) * limit;

    // Build where clause based on user role and filters
    const where: any = {};

    // Role-based filtering
    if (user.role === "OWNER") {
      // Owners can only see maintenance for their buildings
      where.unit = {
        building: {
          ownerId: user.id,
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

    if (query.category) {
      where.category = query.category;
    }

    if (query.assignedStaffId) {
      where.assignedStaffId = query.assignedStaffId;
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
        assignedStaff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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
  } catch (error) {
    logger.error("Failed to retrieve maintenance requests", { error });
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
      category: "PLUMBING" | "ELECTRICAL" | "HVAC" | "APPLIANCE" | "STRUCTURAL" | "PEST_CONTROL" | "LANDSCAPING" | "SECURITY" | "OTHER";
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "EMERGENCY";
      status?: "OPEN" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
      assignedStaffId?: string;
      vendorId?: string;
      estimatedCost?: number;
      actualCost?: number;
      scheduledDate?: string;
      completedDate?: string;
      notes?: string;
    };

    // Verify unit exists and user has access
    const unit = await prisma.units.findFirst({
      where: {
        id: body.unitId,
        building: {
          // Role-based building access check
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

    // If tenant is creating request, verify they live in the unit
    if (user.role === "TENANT" && body.tenantId) {
      const tenant = await prisma.tenant.findFirst({
        where: {
          id: body.tenantId,
          userId: user.id,
          unitId: body.unitId,
          status: "ACTIVE",
        },
      });

      if (!tenant) {
        return badRequest("You don't have permission to create maintenance requests for this unit");
      }
    }

    // Create maintenance request
    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        ...body,
        status: body.status || "OPEN",
        priority: body.priority || "MEDIUM",
        // If no tenant specified, try to find active tenant for the unit
        ...(body.tenantId ? { tenantId: body.tenantId } : {}),
      },
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
      category: maintenanceRequest.category,
    });

    return created(maintenanceRequest, "Maintenance request created successfully");
  } catch (error) {
    logger.error("Failed to create maintenance request", { error });
    return serverError(error);
  }
}