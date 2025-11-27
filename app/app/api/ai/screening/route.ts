import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateBody } from "@/lib/middleware/validation";
import { tenantScreeningInputSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { TenantScreeningAI } from '@/lib/services/ai/ai-service';

// POST /api/ai/screening - Analyze tenant application
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF"])(request);

    // Validate request body
    const body = await validateBody(tenantScreeningInputSchema, request) as {
      applicantId: string;
      creditScore?: number;
      annualIncome: number;
      monthlyIncome: number;
      employmentStatus: "EMPLOYED" | "SELF_EMPLOYED" | "UNEMPLOYED" | "RETIRED" | "STUDENT";
      employmentYears: number;
      previousAddress: string;
      rentalHistory?: string;
      criminalHistory: boolean;
      evictionHistory: boolean;
      references?: string[];
      requestedRent: number;
    };

    const screeningAI = new TenantScreeningAI();
    const screeningResult = await screeningAI.analyzeApplicant({
      creditScore: body.creditScore,
      monthlyIncome: body.monthlyIncome,
      rentAmount: body.requestedRent,
      employmentStatus: body.employmentStatus,
      employmentDuration: body.employmentYears * 12,
      evictionHistory: body.evictionHistory ? 'Yes' : 'No',
      criminalHistory: body.criminalHistory ? 'Yes' : 'No',
      rentalHistory: body.rentalHistory,
    });

    // Perform fraud detection
    const fraudResult = await screeningAI.detectFraud({
      documentsProvided: body.references || [],
    });

    await prisma.tenantScreening.create({
      data: {
        tenantId: body.applicantId,
        riskScore: screeningResult.riskScore,
        recommendation: screeningResult.recommendation,
        confidence: screeningResult.confidence,
        reasoning: screeningResult.reasoning,
        redFlags: screeningResult.redFlags,
        strengths: screeningResult.strengths,
        screeningData: body,
      },
    });

    logger.info("Tenant screening completed", {
      userId: user.id,
      applicantId: body.applicantId,
      riskScore: screeningResult.riskScore,
      recommendation: screeningResult.recommendation,
    });

    return ok({
      ...screeningResult,
      fraudScore: fraudResult.fraudScore,
      fraudReasons: fraudResult.reasons,
      isSuspicious: fraudResult.isSuspicious,
    }, "Tenant screening completed successfully");
  } catch (error) {
    logger.error("Failed to perform tenant screening", { error });
    return serverError(error);
  }
}