import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth-temp";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Verify authentication with temp bypass
    const user = await requireAuth(request);
    console.log("User authenticated for dashboard stats", { userId: user.id, role: user.role });

    // For now, return mock data until we fix the database queries
    // Fetch real data from database
    const [
      totalBuildings,
      totalUnits,
      totalTenants,
      occupiedUnits,
      pendingMaintenance,
      upcomingPayments,
      newTenants
    ] = await Promise.all([
      prisma.building.count(),
      prisma.unit.count(),
      prisma.tenant.count(),
      prisma.unit.count({ where: { status: "OCCUPIED" } }),
      prisma.maintenanceRequest.count({ where: { status: "OPEN" } }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.tenant.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    // Calculate financial stats
    const occupiedUnitsList = await prisma.unit.findMany({
      where: { status: "OCCUPIED" },
      select: { rentAmount: true }
    });

    const totalRevenue = occupiedUnitsList.reduce((sum: number, unit: { rentAmount: number }) => sum + unit.rentAmount, 0);
    const averageRent = occupiedUnitsList.length > 0 ? totalRevenue / occupiedUnitsList.length : 0;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    const stats = {
      totalBuildings,
      totalUnits,
      totalTenants,
      occupiedUnits,
      totalRevenue,
      pendingMaintenance,
      upcomingPayments,
      averageRent,
      occupancyRate,
      newTenantsThisMonth: newTenants,
      totalProperties: totalBuildings, // Assuming properties = buildings for now
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Dashboard stats retrieved successfully"
    });

  } catch (error) {
    console.error("Failed to retrieve dashboard stats", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to retrieve dashboard stats"
      }
    }, { status: 500 });
  }
}
