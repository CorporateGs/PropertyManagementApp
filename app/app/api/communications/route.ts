import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateQuery, validateBody } from "@/lib/middleware/validation";
import { paginationQuerySchema, searchQuerySchema } from "@/lib/middleware/validation";
import { createCommunicationSchema, bulkCommunicationSchema } from "@/lib/validation/schemas";
import { ok, created, badRequest, serverError, paginated } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { EmailService, SMSService, PushNotificationService, TemplateManager } from '@/lib/services/communication/communication-service';

// GET /api/communications - List communications
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "TENANT", "OWNER"])(request);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Validate pagination and search
    const queryParams = validateQuery(
      paginationQuerySchema.merge(
        searchQuerySchema.extend({
          tenantId: z.string().optional(),
          type: z.enum(["EMAIL", "SMS", "PUSH", "LETTER"]).optional(),
          status: z.enum(["SENT", "DELIVERED", "READ", "FAILED"]).optional(),
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
      type?: "EMAIL" | "SMS" | "PUSH" | "LETTER";
      status?: "SENT" | "DELIVERED" | "READ" | "FAILED";
      startDate?: string;
      endDate?: string;
    };

    const { page, limit } = queryParams;
    const offset = (page - 1) * limit;

    // Build where clause based on user role and filters
    const where: any = {};

    // Role-based filtering
    if (user.role === "TENANT") {
      // Tenants can only see communications sent to them
      where.recipientId = user.id;
      where.recipientType = "TENANT";
    }

    if (user.role === "OWNER") {
      // Owners can only see communications related to their properties
      where.OR = [
        {
          recipientType: "TENANT",
          tenant: {
            unit: {
              building: {
                ownerId: user.id,
              },
            },
          },
        },
        {
          recipientType: "OWNER",
          recipientId: user.id,
        },
      ];
    }

    // Apply filters
    if (query.tenantId) {
      where.recipientId = query.tenantId;
      where.recipientType = "TENANT";
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = query.startDate;
      }
      if (query.endDate) {
        where.createdAt.lte = query.endDate;
      }
    }

    // Get total count for pagination
    const total = await prisma.communication.count({ where });

    // Get communications with related data
    const communications = await prisma.communication.findMany({
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
        template: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    logger.info("Communications retrieved", {
      userId: user.id,
      count: communications.length,
      total,
      filters: query,
    });

    return paginated(communications, total, page, limit, "Communications retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve communications", { error });
    return serverError(error);
  }
}

// POST /api/communications/send - Send single communication
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "OWNER"])(request);

    // Validate request body
    const body = await validateBody(createCommunicationSchema, request) as {
      recipientId: string;
      recipientType: "TENANT" | "OWNER" | "VENDOR" | "STAFF";
      type: "EMAIL" | "SMS" | "PUSH" | "LETTER";
      subject: string;
      message: string;
      templateId?: string;
      scheduledAt?: string;
      attachments?: string[];
    };

    // Verify recipient exists and get contact info
    let recipientExists = false;
    let recipientEmail: string | undefined;
    let recipientPhone: string | undefined;

    switch (body.recipientType) {
      case "TENANT":
        const tenant = await prisma.tenant.findUnique({
          where: { id: body.recipientId },
          select: { email: true, phone: true }
        });
        recipientExists = !!tenant;
        if (tenant) {
          recipientEmail = tenant.email;
          recipientPhone = tenant.phone;
        }
        break;
      case "OWNER":
        const owner = await prisma.user.findFirst({
          where: { id: body.recipientId, role: "OWNER" },
          select: { email: true }
        });
        recipientExists = !!owner;
        if (owner) {
          recipientEmail = owner.email;
          // Phone number not available in User model
          recipientPhone = undefined;
        }
        break;
      // Add other recipient types as needed
    }

    if (!recipientExists) {
      return badRequest("Recipient not found");
    }

    // Handle template if provided
    const templateManager = new TemplateManager();
    let subject = body.subject;
    let message = body.message;

    if (body.templateId) {
      const template = await templateManager.getTemplate(body.templateId);
      subject = template.subject || subject;
      message = template.content;
      // Note: Variable replacement would require variables in request body
    }

    // Initialize services
    const emailService = new EmailService();
    const smsService = new SMSService();
    const pushService = new PushNotificationService();

    // Send communication based on type
    let result;
    let deliveryStatus = "FAILED";
    let messageId: string | undefined;

    if (body.type === "EMAIL") {
      if (!recipientEmail) {
        return badRequest("Recipient email not available");
      }
      result = await emailService.sendEmail({
        to: recipientEmail,
        subject,
        body: message,
        html: message,
      });
      deliveryStatus = result.success ? "SENT" : "FAILED";
      messageId = result.messageId;
    } else if (body.type === "SMS") {
      if (!recipientPhone) {
        return badRequest("Recipient phone not available");
      }
      result = await smsService.sendSMS({
        to: recipientPhone,
        message,
      });
      deliveryStatus = result.success ? "SENT" : "FAILED";
      messageId = result.messageId;
    } else if (body.type === "PUSH") {
      result = await pushService.sendPushNotification({
        userId: body.recipientId,
        title: subject,
        body: message,
      });
      deliveryStatus = result.success ? "SENT" : "FAILED";
      // Push service may not return messageId, adjust as needed
    }

    // Create communication record
    const communication = await prisma.communication.create({
      data: {
        ...body,
        status: deliveryStatus,
        sentBy: user.id,
        sentAt: new Date(),
        messageId,
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

    logger.info("Communication sent", {
      userId: user.id,
      communicationId: communication.id,
      recipientId: body.recipientId,
      type: body.type,
      status: deliveryStatus,
    });

    return created(communication, "Communication sent successfully");
  } catch (error) {
    logger.error("Failed to send communication", { error });
    return serverError(error);
  }
}

// POST /api/communications/bulk - Send bulk communications
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Validate request body
    const body = await validateBody(bulkCommunicationSchema, request) as {
      recipientIds: string[];
      recipientType: "TENANT" | "OWNER" | "VENDOR" | "STAFF";
      type: "EMAIL" | "SMS" | "PUSH" | "LETTER";
      subject: string;
      message: string;
      templateId?: string;
      scheduledAt?: string;
    };

    // Verify all recipients exist and get contact info
    let recipients: any[] = [];

    switch (body.recipientType) {
      case "TENANT":
        recipients = await prisma.tenant.findMany({
          where: {
            id: { in: body.recipientIds },
            status: "ACTIVE",
          },
          select: { id: true, email: true, phone: true }
        });
        break;
      // Add other recipient types as needed
    }

    if (recipients.length !== body.recipientIds.length) {
      return badRequest("Some recipients not found or inactive");
    }

    // Handle template if provided
    const templateManager = new TemplateManager();
    let subject = body.subject;
    let message = body.message;

    if (body.templateId) {
      const template = await templateManager.getTemplate(body.templateId);
      subject = template.subject || subject;
      message = template.content;
      // Note: Variable replacement would require variables in request body
    }

    // Initialize services
    const emailService = new EmailService();
    const smsService = new SMSService();
    const pushService = new PushNotificationService();

    // Send bulk communication based on type
    let bulkResult;
    let results: Array<{ recipientId: string; status: string; messageId?: string }> = [];

    if (body.type === "EMAIL") {
      const emailRecipients = recipients.map(r => ({
        email: r.email,
        variables: {} // Add variables if needed
      }));
      bulkResult = await emailService.sendBulkEmails({
        recipients: emailRecipients,
        templateId: body.templateId,
        batchSize: 100,
      });
      results = recipients.map((r, index) => ({
        recipientId: r.id,
        status: bulkResult.results[index]?.success ? "SENT" : "FAILED",
        messageId: bulkResult.results[index]?.messageId,
      }));
    } else if (body.type === "SMS") {
      const smsRecipients = recipients.map(r => ({
        phone: r.phone,
        message: message,
        variables: {} // Add variables if needed
      }));
      bulkResult = await smsService.sendBulkSMS({
        recipients: smsRecipients,
        templateMessage: message,
        batchSize: 50,
      });
      results = recipients.map((r, index) => ({
        recipientId: r.id,
        status: bulkResult.results[index]?.success ? "SENT" : "FAILED",
        messageId: bulkResult.results[index]?.messageId,
      }));
    } else if (body.type === "PUSH") {
      bulkResult = await pushService.sendBulkPushNotifications({
        userIds: body.recipientIds,
        title: subject,
        body: message,
      });
      results = body.recipientIds.map(id => ({
        recipientId: id,
        status: bulkResult.delivered > 0 ? "SENT" : "FAILED",
      }));
    }

    // Create communication records for each recipient
    const communications = await Promise.all(
      body.recipientIds.map((recipientId, index) =>
        prisma.communication.create({
          data: {
            recipientId,
            recipientType: body.recipientType,
            type: body.type,
            subject: body.subject,
            message: body.message,
            templateId: body.templateId,
            status: results[index].status,
            sentBy: user.id,
            sentAt: new Date(),
            messageId: results[index].messageId,
          },
        })
      )
    );

    const successCount = results.filter(r => r.status === "SENT").length;
    const failureCount = results.filter(r => r.status === "FAILED").length;

    logger.info("Bulk communication sent", {
      userId: user.id,
      recipientCount: body.recipientIds.length,
      successCount,
      failureCount,
      type: body.type,
    });

    return created({
      communications,
      results,
      summary: {
        total: body.recipientIds.length,
        successful: successCount,
        failed: failureCount,
      },
    }, "Bulk communication completed");
  } catch (error) {
    logger.error("Failed to send bulk communication", { error });
    return serverError(error);
  }
}