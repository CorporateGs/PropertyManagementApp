import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateParams } from "@/lib/middleware/validation";
import { uuidSchema } from "@/lib/middleware/validation";
import { ok, notFound, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// GET /api/ai/chat/[conversationId] - Get conversation history
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    // Validate conversation ID parameter
    const validatedParams = validateParams(
      z.object({ conversationId: uuidSchema }),
      params
    ) as { conversationId: string };
    const conversationId = validatedParams.conversationId;

    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "TENANT", "OWNER"])(request);

    // Check if conversation exists and user has access
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        userId: user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return notFound("Conversation not found");
    }

    // Format conversation for response
    const formattedConversation = {
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messageCount: conversation.messages.length,
      messages: conversation.messages.map(message => ({
        id: message.id,
        message: message.message,
        response: message.response,
        intent: message.intent,
        sentiment: message.sentiment,
        confidence: message.confidence,
        createdAt: message.createdAt,
      })),
    };

    logger.info("Chat conversation retrieved", {
      userId: user.id,
      conversationId: conversation.id,
      messageCount: conversation.messages.length,
    });

    return ok(formattedConversation, "Conversation retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve chat conversation", { error });
    return serverError(error);
  }
}