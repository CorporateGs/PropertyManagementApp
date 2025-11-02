import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateParams } from "@/lib/middleware/validation";
import { uuidSchema } from "@/lib/middleware/validation";
import { ok, notFound, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// GET /api/payments/[id] - Get single payment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate payment ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const paymentId = validatedParams.id;

    const user = await requireAuth(request);

    // Get payment with related data
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
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
                address: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return notFound("Payment not found");
    }

    // Role-based access check
    if (user.role === "TENANT" && payment.tenant.userId !== user.id) {
      return notFound("Payment not found");
    }

    if (user.role === "OWNER") {
      const hasAccess = await prisma.tenant.findFirst({
        where: {
          id: payment.tenantId,
          unit: {
            building: {
              ownerId: user.id,
            },
          },
        },
      });

      if (!hasAccess) {
        return notFound("Payment not found");
      }
    }

    logger.info("Payment retrieved", {
      userId: user.id,
      paymentId: payment.id,
    });

    return ok(payment, "Payment retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve payment", { error });
    return serverError(error);
  }
}

// PATCH /api/payments/[id] - Update payment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate payment ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const paymentId = validatedParams.id;

    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Validate request body
    const body = await request.json() as {
      amount?: number;
      paymentType?: "RENT" | "SECURITY_DEPOSIT" | "LATE_FEE" | "UTILITY" | "MAINTENANCE" | "PET_FEE" | "PARKING" | "OTHER";
      dueDate?: string;
      paymentDate?: string;
      status?: "PENDING" | "PAID" | "LATE" | "PARTIAL" | "FAILED";
      method?: "CASH" | "CHECK" | "BANK_TRANSFER" | "CREDIT_CARD" | "ONLINE";
      description?: string;
      referenceNumber?: string;
    };

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        tenant: {
          include: {
            unit: {
              include: {
                building: true,
              },
            },
          },
        },
      },
    });

    if (!existingPayment) {
      return notFound("Payment not found");
    }

    // Role-based access check for owners
    if (user.role === "OWNER") {
      if (existingPayment.tenant.unit.building.ownerId !== user.id) {
        return notFound("Payment not found");
      }
    }

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: body,
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

    logger.info("Payment updated", {
      userId: user.id,
      paymentId: paymentId,
      updates: Object.keys(body),
    });

    return ok(updatedPayment, "Payment updated successfully");
  } catch (error) {
    logger.error("Failed to update payment", { error });
    return serverError(error);
  }
}