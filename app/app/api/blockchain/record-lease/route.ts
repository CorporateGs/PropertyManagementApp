import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateBody } from "@/lib/middleware/validation";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { BlockchainService } from '@/lib/services/blockchain/blockchain-service';

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

    // Initialize blockchain service
    const blockchainService = new BlockchainService({ network: 'private' }); // Use private for development

    // Call recordLease method
    const blockchainResult = await blockchainService.recordLease({
      leaseId: body.leaseId,
      landlordId: lease.unit.building.ownerId,
      tenantId: body.tenantId,
      unitId: body.unitId,
      startDate: new Date(body.leaseTerms.startDate),
      endDate: new Date(body.leaseTerms.endDate),
      rentAmount: body.leaseTerms.monthlyRent,
      securityDeposit: body.leaseTerms.securityDeposit,
      terms: body.leaseTerms.specialTerms || '',
      signatures: [], // Empty for now, can be added later
    });

    // Update lease record with blockchain hash
    await prisma.tenant.update({
      where: { id: body.tenantId },
      data: {
        blockchainHash: blockchainResult.blockchainHash,
        blockchainUrl: `blockchain/verify/${blockchainResult.blockchainHash}`, // Assuming local verification URL
        recordedAt: new Date(),
      },
    });

    logger.info("Lease recorded on blockchain", {
      userId: user.id,
      leaseId: body.leaseId,
      tenantId: body.tenantId,
      transactionHash: blockchainResult.blockchainHash,
      verified: blockchainResult.verified,
    });

    return ok({
      lease: {
        id: body.leaseId,
        tenantId: body.tenantId,
        unitId: body.unitId,
        leaseTerms: body.leaseTerms,
      },
      blockchain: {
        transactionHash: blockchainResult.blockchainHash,
        verified: blockchainResult.verified,
        immutable: blockchainResult.immutable,
        verificationUrl: `blockchain/verify/${blockchainResult.blockchainHash}`,
      },
      recordedAt: new Date().toISOString(),
    }, "Lease recorded on blockchain successfully");
  } catch (error) {
    logger.error("Failed to record lease on blockchain", { error });
    return serverError(error);
  }
}

// GET /api/blockchain/record-lease?leaseId=... - Verify blockchain record
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "OWNER"])(request);

    const { searchParams } = new URL(request.url);
    const leaseId = searchParams.get('leaseId');

    if (!leaseId) {
      return badRequest("leaseId query parameter is required");
    }

    // Find the tenant/lease record
    const lease = await prisma.tenant.findFirst({
      where: {
        id: leaseId,
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
      return badRequest("Lease not found");
    }

    // Role-based access check for owners
    if (user.role === "OWNER" && lease.unit.building.ownerId !== user.id) {
      return badRequest("You don't have permission to verify this lease");
    }

    if (!lease.blockchainHash) {
      return badRequest("Lease has not been recorded on blockchain");
    }

    // Initialize blockchain service
    const blockchainService = new BlockchainService({ network: 'private' });

    // Verify the blockchain record
    const isVerified = blockchainService.verifyBlock(lease.blockchainHash);

    // Get block details
    const block = blockchainService.getBlock(lease.blockchainHash);

    logger.info("Blockchain verification requested", {
      userId: user.id,
      leaseId: leaseId,
      blockchainHash: lease.blockchainHash,
      verified: isVerified,
    });

    return ok({
      leaseId: leaseId,
      blockchainHash: lease.blockchainHash,
      verified: isVerified,
      blockDetails: block ? {
        index: block.index,
        timestamp: block.timestamp,
        data: block.data,
      } : null,
      verificationUrl: `blockchain/verify/${lease.blockchainHash}`,
    }, "Blockchain verification completed");
  } catch (error) {
    logger.error("Failed to verify blockchain record", { error });
    return serverError(error);
  }
}