import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateParams, validateBody } from "@/lib/middleware/validation";
import { uuidSchema } from "@/lib/middleware/validation";
import { ok, created, badRequest, notFound, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { WorkflowEngine } from '@/lib/services/automation/workflow-engine';

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

    // Initialize workflow engine and execute
    const workflowEngine = new WorkflowEngine();
    const executionResult = await workflowEngine.executeWorkflow({
      workflowId: workflow.id,
      context: body.context,
      triggeredBy: user.id,
    });

    // Persist execution result to database
    await prisma.workflowExecution.create({
      data: {
        id: executionResult.executionId,
        workflowId: workflow.id,
        status: executionResult.status,
        startedAt: new Date(executionResult.startedAt),
        completedAt: new Date(executionResult.completedAt),
        duration: executionResult.duration,
        triggeredBy: user.id,
        triggerType: "MANUAL",
        context: body.context,
        result: executionResult,
      },
    });

    // Execution monitoring: log performance and steps
    logger.info("Workflow execution completed", {
      userId: user.id,
      workflowId: workflow.id,
      executionId: executionResult.executionId,
      status: executionResult.status,
      duration: executionResult.duration,
      stepsCount: executionResult.steps?.length || 0,
    });

    // Send notification on completion or failure
    if (executionResult.status === 'COMPLETED') {
      // Send success notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Workflow Execution Completed',
          message: `Workflow "${workflow.name}" executed successfully.`,
          type: 'SUCCESS',
          relatedEntity: 'workflow',
          relatedId: workflow.id,
          isRead: false,
          createdBy: 'system',
        },
      });
    } else if (executionResult.status === 'FAILED') {
      // Send failure notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Workflow Execution Failed',
          message: `Workflow "${workflow.name}" execution failed. Check logs for details.`,
          type: 'ERROR',
          relatedEntity: 'workflow',
          relatedId: workflow.id,
          isRead: false,
          createdBy: 'system',
        },
      });
    }

    return created(executionResult, "Workflow executed successfully");
  } catch (error) {
    logger.error("Failed to execute workflow", { error });

    // Retry logic with exponential backoff
    let retryCount = 0;
    const maxRetries = 3;
    while (retryCount < maxRetries) {
      try {
        // Re-attempt execution
        const workflowEngine = new WorkflowEngine();
        const retryResult = await workflowEngine.executeWorkflow({
          workflowId: workflow.id,
          context: body.context,
          triggeredBy: user.id,
        });

        // If successful, persist and return
        await prisma.workflowExecution.create({
          data: {
            id: retryResult.executionId,
            workflowId: workflow.id,
            status: retryResult.status,
            startedAt: new Date(retryResult.startedAt),
            completedAt: new Date(retryResult.completedAt),
            duration: retryResult.duration,
            triggeredBy: user.id,
            triggerType: "MANUAL",
            context: body.context,
            result: retryResult,
            retryCount: retryCount + 1,
            retryReason: (error as Error).message,
          },
        });

        logger.info("Workflow execution succeeded on retry", {
          userId: user.id,
          workflowId: workflow.id,
          executionId: retryResult.executionId,
          retryCount: retryCount + 1,
        });

        return created(retryResult, "Workflow executed successfully after retry");
      } catch (retryError) {
        retryCount++;
        if (retryCount >= maxRetries) {
          // Final failure, persist failure record
          await prisma.workflowExecution.create({
            data: {
              id: `exec_${Date.now()}_failed`,
              workflowId: workflow.id,
              status: 'FAILED',
              startedAt: new Date(),
              completedAt: new Date(),
              duration: 0,
              triggeredBy: user.id,
              triggerType: "MANUAL",
              context: body.context,
              result: { error: (error as Error).message },
              retryCount,
              retryReason: (error as Error).message,
            },
          });

          logger.error("Workflow execution failed after retries", {
            userId: user.id,
            workflowId: workflow.id,
            retryCount,
            error: (error as Error).message,
          });

          return serverError(error);
        }

        // Exponential backoff delay
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

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