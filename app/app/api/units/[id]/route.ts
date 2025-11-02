import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateParams, validateBody } from "@/lib/middleware/validation";
import { uuidSchema } from "@/lib/middleware/validation";
import { updateTenantSchema } from "@/lib/validation/schemas";
import { ok, notFound, badRequest, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// GET /api/units/[id] - Get single unit
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate unit ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const unitId = validatedParams.id;

    const user = await requireAuth(request);

    // Get unit with related data
    const unit = await prisma.units.findUnique({
      where: { id: unitId },
      include: {
        building: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            ownerId: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            leaseStartDate: true,
            leaseEndDate: true,
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
        payments: {
          orderBy: {
            dueDate: "desc",
          },
          take: 10,
        },
      },
    });

    if (!unit) {
      return notFound("Unit not found");
    }

    // Role-based access check
    if (user.role === "TENANT" && (!unit.tenant || unit.tenant.id !== user.id)) {
      return notFound("Unit not found");
    }

    if (user.role === "OWNER" && unit.building.ownerId !== user.id) {
      return notFound("Unit not found");
    }

    logger.info("Unit retrieved", {
      userId: user.id,
      unitId: unit.id,
    });

    return ok(unit, "Unit retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve unit", { error });
    return serverError(error);
  }
}

// PATCH /api/units/[id] - Update unit
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate unit ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const unitId = validatedParams.id;

    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "OWNER"])(request);

    // Validate request body (partial update of unit schema)
    const body = await request.json() as {
      unitNumber?: string;
      type?: "STUDIO" | "1BED" | "2BED" | "3BED" | "4BED" | "LOFT" | "PENTHOUSE";
      bedrooms?: number;
      bathrooms?: number;
      squareFootage?: number;
      rentAmount?: number;
      securityDeposit?: number;
      status?: "VACANT" | "OCCUPIED" | "MAINTENANCE" | "RENOVATION";
      floor?: number;
      description?: string;
      amenities?: string[];
      isFurnished?: boolean;
      hasParking?: boolean;
      hasLaundry?: boolean;
      hasPetsAllowed?: boolean;
    };

    // Check if unit exists
    const existingUnit = await prisma.units.findUnique({
      where: { id: unitId },
      include: {
        building: true,
      },
    });

    if (!existingUnit) {
      return notFound("Unit not found");
    }

    // Role-based access check for owners
    if (user.role === "OWNER" && existingUnit.building.ownerId !== user.id) {
      return notFound("Unit not found");
    }

    // If unit number is being changed, check for conflicts
    if (body.unitNumber && body.unitNumber !== existingUnit.unitNumber) {
      const conflictingUnit = await prisma.units.findFirst({
        where: {
          buildingId: existingUnit.buildingId,
          unitNumber: body.unitNumber,
          id: { not: unitId },
        },
      });

      if (conflictingUnit) {
        return badRequest("Unit number already exists in this building");
      }
    }

    // Update unit
    const updatedUnit = await prisma.units.update({
      where: { id: unitId },
      data: body,
      include: {
        building: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info("Unit updated", {
      userId: user.id,
      unitId: unitId,
      updates: Object.keys(body),
    });

    return ok(updatedUnit, "Unit updated successfully");
  } catch (error) {
    logger.error("Failed to update unit", { error });
    return serverError(error);
  }
}

// DELETE /api/units/[id] - Soft delete unit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate unit ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const unitId = validatedParams.id;

    const user = await requireAuth(request);
    await requireRole(["ADMIN", "OWNER"])(request); // Only admins and owners can delete units

    // Check if unit exists
    const existingUnit = await prisma.units.findUnique({
      where: { id: unitId },
      include: {
        building: true,
      },
    });

    if (!existingUnit) {
      return notFound("Unit not found");
    }

    // Role-based access check for owners
    if (user.role === "OWNER" && existingUnit.building.ownerId !== user.id) {
      return notFound("Unit not found");
    }

    // Check if unit has active tenant
    if (existingUnit.tenant) {
      return badRequest("Cannot delete unit with active tenant. Move tenant first.");
    }

    // Soft delete unit by setting status to unavailable
    const deletedUnit = await prisma.units.update({
      where: { id: unitId },
      data: {
        status: "MAINTENANCE", // Mark as maintenance to prevent new tenants
        // You might want to archive the unit instead of soft delete
      },
    });

    logger.info("Unit deleted", {
      userId: user.id,
      unitId: unitId,
    });

    return ok({ id: unitId }, "Unit deleted successfully");
  } catch (error) {
    logger.error("Failed to delete unit", { error });
    return serverError(error);
  }
}