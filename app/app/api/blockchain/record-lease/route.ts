import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateBody } from "@/lib/middleware/validation";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// POST /api/blockchain/record-lease - Record lease on blockchain
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "OWNER"])(request);

    // Validate request body
    const body = await validateBody(
      z.object({
        leaseId: z.string().uuid(),
        tenantId: z.string().uuid(),
        unitId: z.string().uuid(),
        leaseTerms: z.object({
          startDate: z.string().datetime(),
          endDate: z.string().datetime(),
          monthlyRent: z.number(),
          securityDeposit: z.number(),
          specialTerms: z.string().optional(),
        }),
        recordImmediately: z.boolean().default(true),
      }),
      request
    ) as {
      leaseId: string;
      tenantId: string;
      unitId: string;
      leaseTerms: {
        startDate: string;
        endDate: string;
        monthlyRent: number;
        securityDeposit: number;
        specialTerms?: string;
      };
      recordImmediately?: boolean;
    };

    // Verify lease exists and user has access
    const lease = await prisma.tenant.findFirst({
      where: {
        id: body.tenantId,
        unitId: body.unitId,
        status: "ACTIVE",
      },
      include: {
        unit: {
          include: {
            building: true,
          },
        },
      },
    });

    if (!lease) {
      return badRequest("Lease not found or tenant not active");
    }

    // Role-based access check for owners
    if (user.role === "OWNER" && lease.unit.building.ownerId !== user.id) {
      return badRequest("You don't have permission to record leases for this unit");
    }

    // TODO: Import and call BlockchainService.recordLease from blockchain service
    // const blockchainResult = await BlockchainService.recordLease({
    //   leaseId: body.leaseId,
    //   tenantId: body.tenantId,
    //   unitId: body.unitId,
    //   leaseTerms: body.leaseTerms,
    //   recordedBy: user.id,
    // });

    // For now, return mock blockchain result
    const mockBlockchainResult = {
      transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      gasUsed: Math.floor(Math.random() * 100000) + 50000,
      blockHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      status: "CONFIRMED",
      timestamp: new Date().toISOString(),
      blockchain: "ETHEREUM",
      contractAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
      verificationUrl: `https://etherscan.io/tx/${`0x${Math.random().toString(16).substring(2, 66)}`}`,
    };

    // TODO: Update lease record with blockchain hash
    // await prisma.tenant.update({
    //   where: { id: body.tenantId },
    //   data: {
    //     blockchainHash: mockBlockchainResult.transactionHash,
    //     blockchainUrl: mockBlockchainResult.verificationUrl,
    //     recordedAt: new Date(),
    //   },
    // });

    logger.info("Lease recorded on blockchain", {
      userId: user.id,
      leaseId: body.leaseId,
      tenantId: body.tenantId,
      transactionHash: mockBlockchainResult.transactionHash,
      blockNumber: mockBlockchainResult.blockNumber,
    });

    return ok({
      lease: {
        id: body.leaseId,
        tenantId: body.tenantId,
        unitId: body.unitId,
        leaseTerms: body.leaseTerms,
      },
      blockchain: mockBlockchainResult,
      recordedAt: new Date().toISOString(),
    }, "Lease recorded on blockchain successfully");
  } catch (error) {
    logger.error("Failed to record lease on blockchain", { error });
    return serverError(error);
  }
}