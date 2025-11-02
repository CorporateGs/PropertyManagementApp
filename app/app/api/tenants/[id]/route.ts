import { NextRequest } from "next/server";
import { requireAuth, requireRole, requireTenantAccess } from "@/lib/middleware/auth";
import { validateParams, validateBody } from "@/lib/middleware/validation";
import { uuidSchema } from "@/lib/middleware/validation";
import { updateTenantSchema } from "@/lib/validation/schemas";
import { ok, notFound, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// GET /api/tenants/[id] - Get single tenant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate tenant ID parameter
    const tenantId = validateParams(
      z.object({ id: uuidSchema }),
      params
    ).id;

    const user = await requireAuth(request);
    await requireTenantAccess(tenantId)(request);

    // Get tenant with related data
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        unit: {
          include: {
            building: true,
          },
        },
        payments: {
          orderBy: {
            dueDate: "desc",
          },
          take: 10,
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
        },
        communications: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!tenant) {
      return notFound("Tenant not found");
    }

    logger.info("Tenant retrieved", {
      userId: user.id,
      tenantId: tenant.id,
    });

    return ok(tenant, "Tenant retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve tenant", { error });
    return serverError(error);
  }
}

// PATCH /api/tenants/[id] - Update tenant
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate tenant ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const tenantId = validatedParams.id;

    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Validate request body
    const body = await validateBody(updateTenantSchema, request) as {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      dateOfBirth?: string;
      ssn?: string;
      driverLicense?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      unitId?: string;
      leaseStartDate?: string;
      leaseEndDate?: string;
      monthlyRent?: number;
      securityDeposit?: number;
      notes?: string;
    };

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { unit: true },
    });

    if (!existingTenant) {
      return notFound("Tenant not found");
    }

    // If unit is being changed, check if new unit is available
    if (body.unitId && body.unitId !== existingTenant.unitId) {
      const newUnit = await prisma.units.findUnique({
        where: { id: body.unitId },
      });

      if (!newUnit) {
        return notFound("New unit not found");
      }

      // Check if new unit is available
      const conflictingTenant = await prisma.tenant.findFirst({
        where: {
          unitId: body.unitId,
          status: "ACTIVE",
          id: { not: tenantId }, // Exclude current tenant
        },
      });

      if (conflictingTenant) {
        return notFound("New unit is already occupied");
      }
    }

    // Update tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: body,
      include: {
        unit: {
          include: {
            building: true,
          },
        },
      },
    });

    logger.info("Tenant updated", {
      userId: user.id,
      tenantId: tenantId,
      updates: Object.keys(body),
    });

    return ok(updatedTenant, "Tenant updated successfully");
  } catch (error) {
    logger.error("Failed to update tenant", { error });
    return serverError(error);
  }
}

// DELETE /api/tenants/[id] - Soft delete tenant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate tenant ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const tenantId = validatedParams.id;

    const user = await requireAuth(request);
    await requireRole(["ADMIN"])(request); // Only admins can delete tenants

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!existingTenant) {
      return notFound("Tenant not found");
    }

    // Soft delete tenant by setting status to INACTIVE
    const deletedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: "INACTIVE",
        // You might want to archive related data or move to separate archive tables
      },
    });

    logger.info("Tenant deleted", {
      userId: user.id,
      tenantId: tenantId,
    });

    return ok({ id: tenantId }, "Tenant deleted successfully");
  } catch (error) {
    logger.error("Failed to delete tenant", { error });
    return serverError(error);
  }
}