import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { AuthorizationError } from "@/lib/errors";
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
    // Check role but don't throw if user is OWNER or TENANT - they have limited access
    if (!["ADMIN", "STAFF", "OWNER", "TENANT"].includes(user.role)) {
      throw new AuthorizationError("Access denied");
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Validate pagination and search with error handling
    let queryParams: {
      page: number;
      limit: number;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      tenantId?: string;
      status?: "PENDING" | "PAID" | "LATE" | "PARTIAL" | "FAILED";
      type?: "RENT" | "SECURITY_DEPOSIT" | "LATE_FEE" | "UTILITY" | "MAINTENANCE" | "PET_FEE" | "PARKING" | "OTHER";
      paymentType?: "RENT" | "SECURITY_DEPOSIT" | "LATE_FEE" | "UTILITY" | "MAINTENANCE" | "PET_FEE" | "PARKING" | "OTHER";
      startDate?: string;
      endDate?: string;
    };

    try {
      queryParams = validateQuery(
        paginationQuerySchema.merge(
          searchQuerySchema.extend({
            tenantId: z.string().optional(),
            status: z.enum(["PENDING", "PAID", "LATE", "PARTIAL", "FAILED"]).optional(),
            type: z.enum(["RENT", "SECURITY_DEPOSIT", "LATE_FEE", "UTILITY", "MAINTENANCE", "PET_FEE", "PARKING", "OTHER"]).optional(),
            paymentType: z.enum(["RENT", "SECURITY_DEPOSIT", "LATE_FEE", "UTILITY", "MAINTENANCE", "PET_FEE", "PARKING", "OTHER"]).optional(),
            startDate: z.string().datetime().optional(),
            endDate: z.string().datetime().optional(),
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
        type: query.type as any,
        paymentType: query.paymentType as any,
        tenantId: query.tenantId as string,
        startDate: query.startDate as string,
        endDate: query.endDate as string,
      };
    }

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
            createdBy: user.id,
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

    if (query.status) {
      where.status = query.status;
    }

    // Support both 'type' and 'paymentType' for backward compatibility
    if (query.type || query.paymentType) {
      where.type = query.type || query.paymentType;
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
        },
      },
      orderBy: {
        dueDate: "desc",
      },
      skip: offset,
      take: limit,
    });

    // Transform data to match frontend expectations
    const transformedPayments = payments.map((payment: any) => {
      const tenant = payment.tenant;
      const unit = tenant?.unit || null;
      return {
        id: payment.id,
        amount: payment.amount,
        paymentType: payment.type,
        status: payment.status,
        dueDate: payment.dueDate,
        paymentDate: payment.paidDate,
        method: payment.method,
        description: payment.description,
        tenant: {
          id: tenant.id,
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          email: tenant.email,
        },
        unit: unit ? {
          id: unit.id,
          unitNumber: unit.unitNumber,
          building: unit.building,
        } : null,
      };
    });

    logger.info("Payments retrieved", {
      userId: user.id,
      count: transformedPayments.length,
      total,
      filters: query,
    });

    return paginated(transformedPayments, total, page, limit, "Payments retrieved successfully");
  } catch (error: any) {
    logger.error("Failed to retrieve payments", { error, message: error?.message, stack: error?.stack });
    // Return empty array instead of error for better UX
    if (error?.message?.includes("validation") || error?.message?.includes("Invalid")) {
      return paginated([], 0, 1, 10, "No payments found");
    }
    return serverError(error);
  }
}

// POST /api/payments - Record or process payment
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Validate request body
    const body = await validateBody(createPaymentSchema, request) as any;

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
    if (user.role === "OWNER" && tenant.unit.building.createdBy !== user.id) {
      return badRequest("You don't have permission to add payments for this tenant");
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        tenantId: body.tenantId,
        amount: body.amount,
        type: body.type,
        dueDate: new Date(body.dueDate),
        paidDate: body.paidDate ? new Date(body.paidDate) : null,
        status: body.status || "PENDING",
        method: body.method || null,
        description: body.description || null,
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
      },
    });

    logger.info("Payment created", {
      userId: user.id,
      paymentId: payment.id,
      tenantId: payment.tenantId,
      amount: payment.amount,
      type: payment.type,
    });

    return created(payment, "Payment recorded successfully");
  } catch (error) {
    logger.error("Failed to create payment", { error });
    return serverError(error);
  }
}
