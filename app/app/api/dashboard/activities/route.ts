import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { validateQuery } from "@/lib/middleware/validation";
import { paginationQuerySchema } from "@/lib/middleware/validation";
import { ok, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET /api/dashboard/activities - Enhanced recent activities
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Validate pagination
    const { page, limit } = validateQuery(paginationQuerySchema, request);
    const offset = (page - 1) * limit;

    // Build base where clause based on user role
    let baseWhere: any = {};

    if (user.role === "OWNER") {
      baseWhere = {
        OR: [
          {
            tenant: {
              unit: {
                building: {
                  ownerId: user.id,
                },
              },
            },
          },
          {
            unit: {
              building: {
                ownerId: user.id,
              },
            },
          },
          {
            building: {
              ownerId: user.id,
            },
          },
        ],
      };
    }

    if (user.role === "TENANT") {
      baseWhere = {
        OR: [
          { tenant: { userId: user.id } },
          { unit: { tenant: { userId: user.id } } },
        ],
      };
    }

    // Get recent activities from multiple sources
    const [
      recentPayments,
      recentMaintenance,
      recentCommunications,
      recentTenants,
      recentLeases,
    ] = await Promise.all([
      // Recent payments
      prisma.payment.findMany({
        where: {
          ...baseWhere,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        include: {
          tenant: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          unit: {
            select: {
              unitNumber: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),

      // Recent maintenance requests
      prisma.maintenanceRequest.findMany({
        where: {
          ...baseWhere,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          tenant: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          unit: {
            select: {
              unitNumber: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),

      // Recent communications
      prisma.communication.findMany({
        where: {
          ...baseWhere,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          tenant: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),

      // Recent tenant activities
      prisma.tenant.findMany({
        where: {
          ...baseWhere,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          unit: {
            select: {
              unitNumber: true,
              building: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),

      // Recent lease signings
      prisma.tenant.findMany({
        where: {
          ...baseWhere,
          leaseStartDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          unit: {
            select: {
              unitNumber: true,
              building: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          leaseStartDate: "desc",
        },
        take: 20,
      }),
    ]);

    // Combine and format all activities
    const allActivities = [
      // Payment activities
      ...recentPayments.map(payment => ({
        id: `payment_${payment.id}`,
        type: "PAYMENT",
        title: "Payment Recorded",
        description: `${payment.tenant?.firstName} ${payment.tenant?.lastName} - ${payment.unit?.unitNumber}`,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt,
        metadata: {
          paymentType: payment.paymentType,
          method: payment.method,
        },
      })),

      // Maintenance activities
      ...recentMaintenance.map(maintenance => ({
        id: `maintenance_${maintenance.id}`,
        type: "MAINTENANCE",
        title: "Maintenance Request",
        description: `${maintenance.tenant?.firstName} ${maintenance.tenant?.lastName} - ${maintenance.unit?.unitNumber}`,
        amount: maintenance.estimatedCost,
        status: maintenance.status,
        createdAt: maintenance.createdAt,
        metadata: {
          category: maintenance.category,
          priority: maintenance.priority,
          title: maintenance.title,
        },
      })),

      // Communication activities
      ...recentCommunications.map(communication => ({
        id: `communication_${communication.id}`,
        type: "COMMUNICATION",
        title: "Communication Sent",
        description: `${communication.tenant?.firstName} ${communication.tenant?.lastName}`,
        amount: null,
        status: communication.status,
        createdAt: communication.createdAt,
        metadata: {
          communicationType: communication.type,
          subject: communication.subject,
        },
      })),

      // Tenant move-in activities
      ...recentTenants.map(tenant => ({
        id: `tenant_${tenant.id}`,
        type: "TENANT",
        title: "New Tenant",
        description: `${tenant.firstName} ${tenant.lastName} - ${tenant.unit?.unitNumber}`,
        amount: tenant.monthlyRent,
        status: tenant.status,
        createdAt: tenant.createdAt,
        metadata: {
          leaseStartDate: tenant.leaseStartDate,
          buildingName: tenant.unit?.building?.name,
        },
      })),

      // Lease activities
      ...recentLeases.map(tenant => ({
        id: `lease_${tenant.id}`,
        type: "LEASE",
        title: "Lease Started",
        description: `${tenant.firstName} ${tenant.lastName} - ${tenant.unit?.unitNumber}`,
        amount: tenant.monthlyRent,
        status: "ACTIVE",
        createdAt: tenant.leaseStartDate,
        metadata: {
          leaseEndDate: tenant.leaseEndDate,
          buildingName: tenant.unit?.building?.name,
        },
      })),
    ];

    // Sort by creation date and apply pagination
    allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const paginatedActivities = allActivities.slice(offset, offset + limit);

    logger.info("Dashboard activities retrieved", {
      userId: user.id,
      userRole: user.role,
      totalActivities: allActivities.length,
      returnedActivities: paginatedActivities.length,
    });

    return ok({
      activities: paginatedActivities,
      summary: {
        total: allActivities.length,
        payments: recentPayments.length,
        maintenance: recentMaintenance.length,
        communications: recentCommunications.length,
        tenants: recentTenants.length,
        leases: recentLeases.length,
      },
      pagination: {
        page,
        limit,
        total: allActivities.length,
        totalPages: Math.ceil(allActivities.length / limit),
      },
    }, "Dashboard activities retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve dashboard activities", { error });
    return serverError(error);
  }
}
