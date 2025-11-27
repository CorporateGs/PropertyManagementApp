import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateBody, validateQuery } from "@/lib/middleware/validation";
import { paginationQuerySchema } from "@/lib/middleware/validation";
import { ok, created, badRequest, serverError, paginated } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { PropertyManagementChatbot } from '@/lib/services/ai/ai-service';

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

    // Initialize chatbot and call real AI service
    const chatbot = new PropertyManagementChatbot();
    const aiResponse = await chatbot.chat({
      conversationId: body.conversationId || `conv_${Date.now()}_${user.id}`,
      message: body.message,
      userType: body.context.userType === 'STAFF' || body.context.userType === 'ADMIN' ? 'MANAGER' : body.context.userType as 'TENANT' | 'OWNER',
      context: {
        userId: user.id,
        tenantId: body.context.relatedEntity?.type === 'TENANT' ? body.context.relatedEntity.id : undefined,
        buildingId: body.context.relatedEntity?.type === 'BUILDING' ? body.context.relatedEntity.id : undefined,
      }
    });

    // Generate messageId
    const messageId = `msg_${Date.now()}`;

    // Persist conversation to database
    await prisma.chatConversation.upsert({
      where: { id: aiResponse.conversationId || body.conversationId || `conv_${Date.now()}_${user.id}` },
      update: {
        updatedAt: new Date(),
      },
      create: {
        id: aiResponse.conversationId || body.conversationId || `conv_${Date.now()}_${user.id}`,
        userId: user.id,
        title: body.message.substring(0, 100),
      },
    });

    // Persist message to database
    await prisma.chatMessage.create({
      data: {
        id: messageId,
        conversationId: aiResponse.conversationId || body.conversationId || `conv_${Date.now()}_${user.id}`,
        userId: user.id,
        message: body.message,
        response: aiResponse.response,
        intent: aiResponse.intent,
        sentiment: aiResponse.sentiment,
        confidence: aiResponse.confidence,
        suggestedActions: JSON.stringify(aiResponse.suggestedActions),
      },
    });

    logger.info("AI chat message processed", {
      userId: user.id,
      conversationId: aiResponse.conversationId || body.conversationId || `conv_${Date.now()}_${user.id}`,
      intent: aiResponse.intent,
      sentiment: aiResponse.sentiment,
    });

    return created({
      ...aiResponse,
      conversationId: aiResponse.conversationId || body.conversationId || `conv_${Date.now()}_${user.id}`,
      messageId,
    }, "AI response generated successfully");
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