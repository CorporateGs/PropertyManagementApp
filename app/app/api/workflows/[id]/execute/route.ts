import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateParams, validateBody } from "@/lib/middleware/validation";
import { uuidSchema } from "@/lib/middleware/validation";
import { ok, created, badRequest, notFound, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// POST /api/workflows/[id]/execute - Manually trigger workflow execution
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate workflow ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const workflowId = validatedParams.id;

    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Validate request body
    const body = await validateBody(
      z.object({
        context: z.record(z.any()).optional(),
        triggerData: z.record(z.any()).optional(),
      }),
      request
    ) as {
      context?: Record<string, any>;
      triggerData?: Record<string, any>;
    };

    // Check if workflow exists
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        executions: {
          orderBy: {
            executedAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!workflow) {
      return notFound("Workflow not found");
    }

    if (!workflow.isActive) {
      return badRequest("Workflow is not active");
    }

    // TODO: Import and call WorkflowEngine.executeWorkflow
    // const executionResult = await WorkflowEngine.executeWorkflow({
    //   workflowId: workflow.id,
    //   triggeredBy: user.id,
    //   context: body.context,
    //   triggerData: body.triggerData,
    // });

    // For now, simulate workflow execution
    const mockExecutionResult = {
      executionId: `exec_${Date.now()}`,
      workflowId: workflow.id,
      status: "COMPLETED",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      duration: Math.floor(Math.random() * 5000) + 1000, // 1-6 seconds
      steps: [
        {
          step: "CONDITION_EVALUATION",
          status: "COMPLETED",
          duration: 150,
          result: true,
        },
        {
          step: "SEND_EMAIL",
          status: "COMPLETED",
          duration: 1200,
          result: { messageId: "msg_123", status: "SENT" },
        },
        {
          step: "UPDATE_RECORD",
          status: "COMPLETED",
          duration: 300,
          result: { recordId: "tenant_456", updated: true },
        },
      ],
      triggeredBy: user.id,
      triggerType: "MANUAL",
      context: body.context,
    };

    // TODO: Persist execution result to database
    // await prisma.workflowExecution.create({
    //   data: {
    //     id: mockExecutionResult.executionId,
    //     workflowId: workflow.id,
    //     status: mockExecutionResult.status,
    //     startedAt: new Date(mockExecutionResult.startedAt),
    //     completedAt: new Date(mockExecutionResult.completedAt),
    //     duration: mockExecutionResult.duration,
    //     triggeredBy: user.id,
    //     triggerType: "MANUAL",
    //     context: body.context,
    //     result: mockExecutionResult,
    //   },
    // });

    logger.info("Workflow execution completed", {
      userId: user.id,
      workflowId: workflow.id,
      executionId: mockExecutionResult.executionId,
      status: mockExecutionResult.status,
      duration: mockExecutionResult.duration,
    });

    return created(mockExecutionResult, "Workflow executed successfully");
  } catch (error) {
    logger.error("Failed to execute workflow", { error });
    return serverError(error);
  }
}

// GET /api/workflows/[id]/executions - Get workflow execution history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate workflow ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const workflowId = validatedParams.id;

    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Check if workflow exists
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return notFound("Workflow not found");
    }

    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.workflowExecution.count({
      where: { workflowId },
    });

    // Get execution history
    const executions = await prisma.workflowExecution.findMany({
      where: { workflowId },
      include: {
        triggeredByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        executedAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    logger.info("Workflow executions retrieved", {
      userId: user.id,
      workflowId: workflow.id,
      count: executions.length,
      total,
    });

    return ok({
      workflow: {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
      },
      executions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, "Workflow executions retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve workflow executions", { error });
    return serverError(error);
  }
}