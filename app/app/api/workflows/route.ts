import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateQuery, validateBody } from "@/lib/middleware/validation";
import { paginationQuerySchema } from "@/lib/middleware/validation";
import { ok, created, badRequest, serverError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { z } from "zod";

// Mock workflow templates for now
const WorkflowTemplates = [
  {
    id: "welcome-email",
    name: "Welcome Email",
    description: "Send welcome email to new tenants",
    trigger: { type: "EVENT" as const, event: "tenant.created" },
    actions: [
      { type: "send_email", template: "welcome" }
    ]
  },
  {
    id: "rent-reminder",
    name: "Rent Reminder",
    description: "Send rent payment reminders",
    trigger: { type: "SCHEDULE" as const, schedule: "0 9 1 * *" },
    actions: [
      { type: "send_email", template: "rent_reminder" }
    ]
  }
];

// GET /api/workflows - List workflows
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Validate pagination and parse query params
    const queryParams = validateQuery(paginationQuerySchema.extend({
      buildingId: z.string().optional(),
    }), request) as { page: number; limit: number; buildingId?: string };
    
    const { page, limit } = queryParams;

    // Check if requesting workflow templates
    const url = new URL(request.url);
    const templates = url.searchParams.get('templates');
    if (templates === 'true') {
      return ok(WorkflowTemplates, "Workflow templates retrieved successfully");
    }

    // Return mock workflows for now since database models don't exist
    const mockWorkflows = [
      {
        id: "1",
        name: "Welcome Email Workflow",
        description: "Automatically sends welcome email to new tenants",
        trigger: { type: "EVENT", event: "tenant.created" },
        isActive: true,
        createdAt: new Date(),
        createdBy: user.id,
        statistics: {
          totalExecutions: 15,
          recentSuccessRate: 100,
          lastExecuted: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    ];

    logger.info("Workflows retrieved", {
      userId: user.id,
      count: mockWorkflows.length,
    });

    return ok(mockWorkflows, "Workflows retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve workflows", { error });
    return serverError(error);
  }
}

// POST /api/workflows - Create new workflow or test workflow
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Validate request body
    const body = await validateBody(z.object({
      name: z.string(),
      description: z.string().optional(),
      trigger: z.object({
        type: z.enum(["EVENT", "SCHEDULE", "MANUAL"]),
        event: z.string().optional(),
        schedule: z.string().optional(),
      }),
      conditions: z.array(z.any()).optional(),
      actions: z.array(z.any()),
      isActive: z.boolean().optional(),
      test: z.boolean().optional(),
      testContext: z.any().optional(),
    }), request);

    // Handle workflow testing
    if (body.test) {
      try {
        // Mock workflow execution for now
        const executionResult = {
          success: true,
          executedAt: new Date(),
          steps: [
            { name: "validate_input", status: "completed" },
            { name: "execute_actions", status: "completed" }
          ]
        };

        return ok({
          success: true,
          executionResult,
          logs: { message: "Workflow test executed successfully" },
          message: "Workflow test completed"
        }, "Workflow test completed");
      } catch (error) {
        logger.error("Workflow test failed", { error });
        return badRequest("Workflow test failed: " + (error as Error).message);
      }
    }

    // Create mock workflow for now
    const workflow = {
      id: `workflow-${Date.now()}`,
      name: body.name,
      description: body.description,
      trigger: body.trigger,
      conditions: body.conditions,
      actions: body.actions,
      isActive: body.isActive ?? true,
      createdBy: user.id,
      createdAt: new Date(),
    };

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