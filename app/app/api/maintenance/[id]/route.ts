import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateParams, validateBody } from "@/lib/middleware/validation";
import { uuidSchema } from "@/lib/middleware/validation";
import { updateMaintenanceSchema } from "@/lib/validation/schemas";
import { ok, notFound, badRequest, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// GET /api/maintenance/[id] - Get single maintenance request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate maintenance request ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const maintenanceId = validatedParams.id;

    const user = await requireAuth(request);

    // Get maintenance request with related data
    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: maintenanceId },
      include: {
        unit: {
          select: {
            id: true,
            unitNumber: true,
            building: {
              select: {
                id: true,
                name: true,
                address: true,
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
            phone: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            rating: true,
          },
        },
      },
    });

    if (!maintenanceRequest) {
      return notFound("Maintenance request not found");
    }

    // Role-based access check
    if (user.role === "TENANT" && maintenanceRequest.tenantId !== user.id) {
      return notFound("Maintenance request not found");
    }

    if (user.role === "OWNER") {
      const hasAccess = await prisma.maintenanceRequest.findFirst({
        where: {
          id: maintenanceId,
          unit: {
            building: {
              ownerId: user.id,
            },
          },
        },
      });

      if (!hasAccess) {
        return notFound("Maintenance request not found");
      }
    }

    logger.info("Maintenance request retrieved", {
      userId: user.id,
      maintenanceId: maintenanceRequest.id,
    });

    return ok(maintenanceRequest, "Maintenance request retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve maintenance request", { error });
    return serverError(error);
  }
}

// PATCH /api/maintenance/[id] - Update maintenance request
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate maintenance request ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const maintenanceId = validatedParams.id;

    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "OWNER"])(request);

    // Validate request body
    const body = await validateBody(updateMaintenanceSchema, request) as {
      title?: string;
      description?: string;
      category?: "PLUMBING" | "ELECTRICAL" | "HVAC" | "APPLIANCE" | "STRUCTURAL" | "PEST_CONTROL" | "LANDSCAPING" | "SECURITY" | "OTHER";
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

    // Check if maintenance request exists
    const existingRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: maintenanceId },
      include: {
        unit: {
          include: {
            building: true,
          },
        },
      },
    });

    if (!existingRequest) {
      return notFound("Maintenance request not found");
    }

    // Role-based access check for owners
    if (user.role === "OWNER" && existingRequest.unit.building.ownerId !== user.id) {
      return notFound("Maintenance request not found");
    }

    // If status is being changed to COMPLETED, set completed date
    if (body.status === "COMPLETED" && !body.completedDate) {
      body.completedDate = new Date().toISOString();
    }

    // Update maintenance request
    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id: maintenanceId },
      data: body,
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
          },
        },
        assignedStaff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // TODO: If status changed to COMPLETED, trigger satisfaction survey workflow
    // if (body.status === "COMPLETED") {
    //   await WorkflowEngine.executeWorkflow({
    //     workflowName: "TENANT_SATISFACTION_SURVEY",
    //     context: {
    //       maintenanceRequestId: maintenanceId,
    //       tenantId: updatedRequest.tenantId,
    //     },
    //   });
    // }

    logger.info("Maintenance request updated", {
      userId: user.id,
      maintenanceId: maintenanceId,
      updates: Object.keys(body),
    });

    return ok(updatedRequest, "Maintenance request updated successfully");
  } catch (error) {
    logger.error("Failed to update maintenance request", { error });
    return serverError(error);
  }
}