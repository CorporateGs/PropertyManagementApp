import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateBody } from "@/lib/middleware/validation";
import { ok, created, badRequest, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { PredictiveMaintenanceAI } from '@/lib/services/ai/ai-service';
import { WorkflowEngine } from '@/lib/services/automation/workflow-engine';

// POST /api/ai/predictive-maintenance - Predict equipment failure
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "OWNER"])(request);

    // Validate request body
    const body = await validateBody(
      z.object({
        equipmentType: z.enum(["HVAC", "PLUMBING", "ELECTRICAL", "APPLIANCE", "ELEVATOR", "SECURITY", "OTHER"]),
        equipmentId: z.string().optional(),
        unitId: z.string().optional(),
        buildingId: z.string().optional(),
        currentReadings: z.object({
          temperature: z.number().optional(),
          pressure: z.number().optional(),
          voltage: z.number().optional(),
          current: z.number().optional(),
          vibration: z.number().optional(),
          runtime: z.number().optional(),
        }).optional(),
        installationDate: z.string().datetime().optional(),
        lastMaintenanceDate: z.string().datetime().optional(),
        usageHours: z.number().optional(),
        environmentalFactors: z.object({
          location: z.string().optional(),
          climate: z.string().optional(),
          usageIntensity: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
        }).optional(),
      }),
      request
    ) as {
      equipmentType: "HVAC" | "PLUMBING" | "ELECTRICAL" | "APPLIANCE" | "ELEVATOR" | "SECURITY" | "OTHER";
      equipmentId?: string;
      unitId?: string;
      buildingId?: string;
      currentReadings?: {
        temperature?: number;
        pressure?: number;
        voltage?: number;
        current?: number;
        vibration?: number;
        runtime?: number;
      };
      installationDate?: string;
      lastMaintenanceDate?: string;
      usageHours?: number;
      environmentalFactors?: {
        location?: string;
        climate?: string;
        usageIntensity?: "LOW" | "MEDIUM" | "HIGH";
      };
    };

    // Verify building/unit access if provided
    if (body.buildingId) {
      const building = await prisma.building.findFirst({
        where: {
          id: body.buildingId,
          ...(user.role === "OWNER" && { ownerId: user.id }),
        },
      });

      if (!building) {
        return badRequest("Building not found or access denied");
      }
    }

    if (body.unitId) {
      const unit = await prisma.units.findFirst({
        where: {
          id: body.unitId,
          building: {
            ...(user.role === "OWNER" && { ownerId: user.id }),
          },
        },
      });

      if (!unit) {
        return badRequest("Unit not found or access denied");
      }
    }

    const maintenanceAI = new PredictiveMaintenanceAI();
    const prediction = await maintenanceAI.predictEquipmentFailure({
      type: body.equipmentType,
      installationDate: new Date(body.installationDate || Date.now()),
      lastServiceDate: body.lastMaintenanceDate ? new Date(body.lastMaintenanceDate) : undefined,
      recentReadings: body.currentReadings ? [
        body.currentReadings.temperature !== undefined ? {
          metricType: 'temperature',
          value: body.currentReadings.temperature,
          unit: 'C',
          timestamp: new Date(),
        } : null,
        body.currentReadings.pressure !== undefined ? {
          metricType: 'pressure',
          value: body.currentReadings.pressure,
          unit: 'psi',
          timestamp: new Date(),
        } : null,
        body.currentReadings.voltage !== undefined ? {
          metricType: 'voltage',
          value: body.currentReadings.voltage,
          unit: 'V',
          timestamp: new Date(),
        } : null,
        body.currentReadings.current !== undefined ? {
          metricType: 'current',
          value: body.currentReadings.current,
          unit: 'A',
          timestamp: new Date(),
        } : null,
        body.currentReadings.vibration !== undefined ? {
          metricType: 'vibration',
          value: body.currentReadings.vibration,
          unit: 'Hz',
          timestamp: new Date(),
        } : null,
        body.currentReadings.runtime !== undefined ? {
          metricType: 'runtime',
          value: body.currentReadings.runtime,
          unit: 'hours',
          timestamp: new Date(),
        } : null,
      ].filter(Boolean) as any[] : undefined,
    });

    await prisma.predictiveMaintenance.create({
      data: {
        equipmentType: body.equipmentType,
        equipmentId: body.equipmentId,
        unitId: body.unitId,
        buildingId: body.buildingId,
        failureProbability: prediction.failureProbability,
        expectedFailureDate: prediction.expectedFailureDate,
        urgency: prediction.urgency,
        recommendedActions: JSON.stringify(prediction.recommendedActions),
        estimatedCost: prediction.estimatedCost,
        reasoning: prediction.reasoning,
        createdBy: user.id,
      },
    });

    if (prediction.urgency === 'HIGH' || prediction.urgency === 'CRITICAL') {
      const workflowEngine = new WorkflowEngine();
      await workflowEngine.executeWorkflow('MAINTENANCE_AUTO_ASSIGN', {
        equipmentType: body.equipmentType,
        unitId: body.unitId,
        prediction: prediction,
        userId: user.id,
      });
    }

    logger.info("Predictive maintenance analysis completed", {
      userId: user.id,
      equipmentType: body.equipmentType,
      failureProbability: prediction.failureProbability,
      expectedFailureDate: prediction.expectedFailureDate,
      urgency: prediction.urgency,
      estimatedCost: prediction.estimatedCost,
    });

    return created(prediction, "Predictive maintenance analysis completed successfully");
  } catch (error) {
    logger.error("Failed to perform predictive maintenance analysis", { error });
    return serverError(error);
  }
}