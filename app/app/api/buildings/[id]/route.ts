import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateParams } from "@/lib/middleware/validation";
import { uuidSchema } from "@/lib/middleware/validation";
import { ok, notFound, badRequest, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// GET /api/buildings/[id] - Get single building
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate building ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const buildingId = validatedParams.id;

    const user = await requireAuth(request);

    // Get building with aggregated statistics
    const building = await prisma.building.findUnique({
      where: { id: buildingId },
      include: {
        units: {
          include: {
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!building) {
      return notFound("Building not found");
    }

    // Role-based access check
    if (user.role === "OWNER" && building.ownerId !== user.id) {
      return notFound("Building not found");
    }

    // Calculate building statistics
    const totalUnits = building.units.length;
    const occupiedUnits = building.units.filter(unit => unit.status === "OCCUPIED").length;
    const vacantUnits = building.units.filter(unit => unit.status === "VACANT").length;
    const maintenanceUnits = building.units.filter(unit => unit.status === "MAINTENANCE").length;

    const totalRent = building.units
      .filter(unit => unit.status === "OCCUPIED")
      .reduce((sum, unit) => sum + unit.rentAmount, 0);

    const buildingWithStats = {
      ...building,
      statistics: {
        totalUnits,
        occupiedUnits,
        vacantUnits,
        maintenanceUnits,
        occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
        totalMonthlyRent: totalRent,
        averageRent: occupiedUnits > 0 ? Math.round(totalRent / occupiedUnits) : 0,
      },
    };

    logger.info("Building retrieved", {
      userId: user.id,
      buildingId: building.id,
    });

    return ok(buildingWithStats, "Building retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve building", { error });
    return serverError(error);
  }
}

// PATCH /api/buildings/[id] - Update building
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate building ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const buildingId = validatedParams.id;

    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "OWNER"])(request);

    // Validate request body (partial update of building schema)
    const body = await request.json() as {
      name?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      yearBuilt?: number;
      totalUnits?: number;
      description?: string;
      amenities?: string[];
      ownerId?: string;
    };

    // Check if building exists
    const existingBuilding = await prisma.building.findUnique({
      where: { id: buildingId },
    });

    if (!existingBuilding) {
      return notFound("Building not found");
    }

    // Role-based access check for owners
    if (user.role === "OWNER" && existingBuilding.ownerId !== user.id) {
      return notFound("Building not found");
    }

    // If ownerId is being changed, verify permissions
    if (body.ownerId && body.ownerId !== existingBuilding.ownerId) {
      if (user.role !== "ADMIN" && user.role !== "STAFF") {
        return badRequest("You don't have permission to change building ownership");
      }
    }

    // Update building
    const updatedBuilding = await prisma.building.update({
      where: { id: buildingId },
      data: body,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        units: {
          select: {
            id: true,
            unitNumber: true,
            status: true,
          },
        },
      },
    });

    logger.info("Building updated", {
      userId: user.id,
      buildingId: buildingId,
      updates: Object.keys(body),
    });

    return ok(updatedBuilding, "Building updated successfully");
  } catch (error) {
    logger.error("Failed to update building", { error });
    return serverError(error);
  }
}

// DELETE /api/buildings/[id] - Soft delete building
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate building ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const buildingId = validatedParams.id;

    const user = await requireAuth(request);
    await requireRole(["ADMIN", "OWNER"])(request); // Only admins and owners can delete buildings

    // Check if building exists
    const existingBuilding = await prisma.building.findUnique({
      where: { id: buildingId },
      include: {
        units: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!existingBuilding) {
      return notFound("Building not found");
    }

    // Role-based access check for owners
    if (user.role === "OWNER" && existingBuilding.ownerId !== user.id) {
      return notFound("Building not found");
    }

    // Check if building has active tenants
    const unitsWithTenants = existingBuilding.units.filter(unit => unit.tenant);

    if (unitsWithTenants.length > 0) {
      return badRequest("Cannot delete building with active tenants. Relocate tenants first.");
    }

    // Check if building has units (even vacant ones)
    if (existingBuilding.units.length > 0) {
      return badRequest("Cannot delete building with units. Remove all units first.");
    }

    // Delete building
    await prisma.building.delete({
      where: { id: buildingId },
    });

    logger.info("Building deleted", {
      userId: user.id,
      buildingId: buildingId,
    });

    return ok({ id: buildingId }, "Building deleted successfully");
  } catch (error) {
    logger.error("Failed to delete building", { error });
    return serverError(error);
  }
}