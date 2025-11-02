import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateBody, validateQuery } from "@/lib/middleware/validation";
import { paginationQuerySchema } from "@/lib/middleware/validation";
import { ok, created, badRequest, serverError, paginated } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// POST /api/ai/chat - Process chat message
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "TENANT", "OWNER"])(request);

    // Validate request body
    const body = await validateBody(
      z.object({
        conversationId: z.string().optional(),
        message: z.string().min(1, "Message cannot be empty").max(2000),
        context: z.object({
          userType: z.enum(["TENANT", "OWNER", "STAFF", "ADMIN"]),
          currentPage: z.string().optional(),
          relatedEntity: z.object({
            type: z.enum(["TENANT", "UNIT", "BUILDING", "PAYMENT", "MAINTENANCE"]),
            id: z.string(),
          }).optional(),
        }),
      }),
      request
    ) as {
      conversationId?: string;
      message: string;
      context: {
        userType: "TENANT" | "OWNER" | "STAFF" | "ADMIN";
        currentPage?: string;
        relatedEntity?: {
          type: "TENANT" | "UNIT" | "BUILDING" | "PAYMENT" | "MAINTENANCE";
          id: string;
        };
      };
    };

    // TODO: Import and call PropertyManagementChatbot.chat from AI service
    // const aiResponse = await PropertyManagementChatbot.chat({
    //   message: body.message,
    //   context: body.context,
    //   conversationId: body.conversationId,
    //   userId: user.id,
    // });

    // For now, return a mock response that matches the expected AI service format
    const mockResponse = {
      response: "I understand you're asking about property management. Based on your role and context, I can help you with tenant inquiries, maintenance requests, payment questions, or lease information. Could you please provide more specific details about what you need assistance with?",
      intent: "GENERAL_INQUIRY",
      sentiment: "NEUTRAL",
      confidence: 0.85,
      suggestedActions: [
        {
          type: "VIEW_PAYMENTS",
          label: "Check Payment Status",
          description: "View your recent payments and payment history",
        },
        {
          type: "CREATE_MAINTENANCE",
          label: "Submit Maintenance Request",
          description: "Report a maintenance issue in your unit",
        },
        {
          type: "VIEW_LEASE",
          label: "View Lease Information",
          description: "Access your lease details and important dates",
        },
      ],
      conversationId: body.conversationId || `conv_${Date.now()}_${user.id}`,
      messageId: `msg_${Date.now()}`,
    };

    // TODO: Persist conversation to database
    // await prisma.chatConversation.upsert({
    //   where: { id: mockResponse.conversationId },
    //   update: {
    //     updatedAt: new Date(),
    //   },
    //   create: {
    //     id: mockResponse.conversationId,
    //     userId: user.id,
    //     title: body.message.substring(0, 100),
    //   },
    // });

    // TODO: Persist message to database
    // await prisma.chatMessage.create({
    //   data: {
    //     id: mockResponse.messageId,
    //     conversationId: mockResponse.conversationId,
    //     userId: user.id,
    //     message: body.message,
    //     response: mockResponse.response,
    //     intent: mockResponse.intent,
    //     sentiment: mockResponse.sentiment,
    //     confidence: mockResponse.confidence,
    //   },
    // });

    logger.info("AI chat message processed", {
      userId: user.id,
      conversationId: mockResponse.conversationId,
      intent: mockResponse.intent,
      sentiment: mockResponse.sentiment,
    });

    return created(mockResponse, "AI response generated successfully");
  } catch (error) {
    logger.error("Failed to process AI chat message", { error });
    return serverError(error);
  }
}

// GET /api/ai/chat - List conversations for user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "TENANT", "OWNER"])(request);

    // Validate pagination
    const { page, limit } = validateQuery(paginationQuerySchema, request);

    const offset = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.chatConversation.count({
      where: { userId: user.id },
    });

    // Get conversations with latest message preview
    const conversations = await prisma.chatConversation.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    // Format conversations for response
    const formattedConversations = conversations.map(conversation => ({
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messageCount: conversation.messages.length,
      lastMessage: conversation.messages[0]?.message.substring(0, 100) + "..." || "",
    }));

    logger.info("Chat conversations retrieved", {
      userId: user.id,
      count: conversations.length,
      total,
    });

    return paginated(formattedConversations, total, page, limit, "Chat conversations retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve chat conversations", { error });
    return serverError(error);
  }
}