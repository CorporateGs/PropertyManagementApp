import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateQuery, validateBody } from "@/lib/middleware/validation";
import { paginationQuerySchema } from "@/lib/middleware/validation";
import { createWorkflowSchema } from "@/lib/validation/schemas";
import { ok, created, badRequest, serverError, paginated } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// GET /api/workflows - List workflows
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Validate pagination
    const { page, limit } = validateQuery(paginationQuerySchema, request);
    const offset = (page - 1) * limit;

    // Build where clause based on user role
    const where: any = {};

    // Role-based filtering
    if (user.role === "OWNER") {
      // Owners can only see workflows for their buildings
      where.OR = [
        { createdBy: user.id },
        {
          // TODO: Add building-specific workflow filtering when building relation is added
        },
      ];
    }

    // Get total count for pagination
    const total = await prisma.workflow.count({ where });

    // Get workflows with execution statistics
    const workflows = await prisma.workflow.findMany({
      where,
      include: {
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            executions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    // Get execution statistics for each workflow
    const workflowsWithStats = await Promise.all(
      workflows.map(async (workflow) => {
        const recentExecutions = await prisma.workflowExecution.findMany({
          where: { workflowId: workflow.id },
          orderBy: { executedAt: "desc" },
          take: 10,
        });

        const successCount = recentExecutions.filter(e => e.status === "COMPLETED").length;
        const failureCount = recentExecutions.filter(e => e.status === "FAILED").length;

        return {
          ...workflow,
          statistics: {
            totalExecutions: workflow._count.executions,
            recentSuccessRate: recentExecutions.length > 0
              ? Math.round((successCount / recentExecutions.length) * 100)
              : 0,
            lastExecuted: recentExecutions[0]?.executedAt || null,
          },
        };
      })
    );

    logger.info("Workflows retrieved", {
      userId: user.id,
      count: workflows.length,
      total,
    });

    return paginated(workflowsWithStats, total, page, limit, "Workflows retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve workflows", { error });
    return serverError(error);
  }
}

// POST /api/workflows - Create new workflow
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Validate request body
    const body = await validateBody(createWorkflowSchema, request) as {
      name: string;
      description?: string;
      trigger: {
        type: "EVENT" | "SCHEDULE" | "MANUAL";
        event?: string;
        schedule?: string;
      };
      conditions?: any[];
      actions: any[];
      isActive?: boolean;
    };

    // Create workflow
    const workflow = await prisma.workflow.create({
      data: {
        ...body,
        isActive: body.isActive ?? true,
        createdBy: user.id,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // TODO: Register workflow with WorkflowEngine
    // await WorkflowEngine.registerWorkflow(workflow);

    logger.info("Workflow created", {
      userId: user.id,
      workflowId: workflow.id,
      name: workflow.name,
      triggerType: workflow.trigger.type,
      isActive: workflow.isActive,
    });

    return created(workflow, "Workflow created successfully");
  } catch (error) {
    logger.error("Failed to create workflow", { error });
    return serverError(error);
  }
}