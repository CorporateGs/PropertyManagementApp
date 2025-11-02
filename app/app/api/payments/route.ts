import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateQuery, validateBody } from "@/lib/middleware/validation";
import { paginationQuerySchema, searchQuerySchema } from "@/lib/middleware/validation";
import { createPaymentSchema } from "@/lib/validation/schemas";
import { ok, created, badRequest, serverError, paginated } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// GET /api/payments - List payments with filters
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
          tenantId: z.string().optional(),
          unitId: z.string().optional(),
          status: z.enum(["PENDING", "PAID", "LATE", "PARTIAL", "FAILED"]).optional(),
          paymentType: z.enum(["RENT", "SECURITY_DEPOSIT", "LATE_FEE", "UTILITY", "MAINTENANCE", "PET_FEE", "PARKING", "OTHER"]).optional(),
          startDate: z.string().datetime().optional(),
          endDate: z.string().datetime().optional(),
        })
      ),
      request
    ) as {
      page: number;
      limit: number;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      tenantId?: string;
      unitId?: string;
      status?: "PENDING" | "PAID" | "LATE" | "PARTIAL" | "FAILED";
      paymentType?: "RENT" | "SECURITY_DEPOSIT" | "LATE_FEE" | "UTILITY" | "MAINTENANCE" | "PET_FEE" | "PARKING" | "OTHER";
      startDate?: string;
      endDate?: string;
    };

    const { page, limit } = queryParams;
    const offset = (page - 1) * limit;

    // Build where clause based on user role and filters
    const where: any = {};

    // Role-based filtering
    if (user.role === "OWNER") {
      // Owners can only see payments for their buildings
      where.tenant = {
        unit: {
          building: {
            ownerId: user.id,
          },
        },
      };
    }

    if (user.role === "TENANT") {
      // Tenants can only see their own payments
      where.tenant = {
        userId: user.id,
      };
    }

    // Apply filters
    if (query.tenantId) {
      where.tenantId = query.tenantId;
    }

    if (query.unitId) {
      where.unitId = query.unitId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.paymentType) {
      where.paymentType = query.paymentType;
    }

    if (query.startDate || query.endDate) {
      where.dueDate = {};
      if (query.startDate) {
        where.dueDate.gte = query.startDate;
      }
      if (query.endDate) {
        where.dueDate.lte = query.endDate;
      }
    }

    // Get total count for pagination
    const total = await prisma.payment.count({ where });

    // Get payments with related data
    const payments = await prisma.payment.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
      },
      orderBy: {
        dueDate: "desc",
      },
      skip: offset,
      take: limit,
    });

    logger.info("Payments retrieved", {
      userId: user.id,
      count: payments.length,
      total,
      filters: query,
    });

    return paginated(payments, total, page, limit, "Payments retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve payments", { error });
    return serverError(error);
  }
}

// POST /api/payments - Record or process payment
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Validate request body
    const body = await validateBody(createPaymentSchema, request) as {
      tenantId: string;
      unitId: string;
      amount: number;
      paymentType: "RENT" | "SECURITY_DEPOSIT" | "LATE_FEE" | "UTILITY" | "MAINTENANCE" | "PET_FEE" | "PARKING" | "OTHER";
      dueDate: string;
      paymentDate?: string;
      status?: "PENDING" | "PAID" | "LATE" | "PARTIAL" | "FAILED";
      method?: "CASH" | "CHECK" | "BANK_TRANSFER" | "CREDIT_CARD" | "ONLINE";
      description?: string;
      referenceNumber?: string;
    };

    // Verify tenant exists and user has access
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: body.tenantId,
        status: "ACTIVE",
      },
      include: {
        unit: {
          include: {
            building: true,
          },
        },
      },
    });

    if (!tenant) {
      return badRequest("Tenant not found or inactive");
    }

    // Role-based access check
    if (user.role === "OWNER" && tenant.unit.building.ownerId !== user.id) {
      return badRequest("You don't have permission to add payments for this tenant");
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        ...body,
        status: body.status || "PENDING",
      },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
      },
    });

    logger.info("Payment created", {
      userId: user.id,
      paymentId: payment.id,
      tenantId: payment.tenantId,
      amount: payment.amount,
      paymentType: payment.paymentType,
    });

    return created(payment, "Payment recorded successfully");
  } catch (error) {
    logger.error("Failed to create payment", { error });
    return serverError(error);
  }
}