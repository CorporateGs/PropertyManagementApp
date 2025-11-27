import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateParams } from "@/lib/middleware/validation";
import { uuidSchema } from "@/lib/middleware/validation";
import { ok, notFound, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { ErrorHandler } from "@/lib/middleware/error-handler";
import { z } from "zod";
import { readFile, unlink } from "fs/promises";
import { join } from "path";

// GET /api/uploads/[id] - Get document details and download URL
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate document ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const documentId = validatedParams.id;

    const user = await requireAuth(request);

    // Get document with related data from database
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        unit: {
          include: {
            building: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      return notFound("Document not found");
    }

    // Role-based access check
    if (user.role === "TENANT" && document.tenantId && document.tenantId !== user.id) {
      return notFound("Document not found");
    }

    if (user.role === "OWNER") {
      // Check if document is related to owner's properties
      if (document.unitId && document.unit) {
        // For now, we'll allow access if unit exists
        // In production, you'd check building.ownerId
      }
    }

    // Generate secure download URL
    const downloadUrl = await generateSecureDownloadUrl(document.filePath, documentId);

    // Get additional document metadata
    const metadata = {
      id: document.id,
      fileName: document.fileName,
      originalName: document.originalName,
      filePath: document.filePath,
      fileType: document.fileType,
      fileSize: document.fileSize,
      category: document.category,
      description: document.description,
      isAIProcessed: document.isAIProcessed,
      aiExtractedData: document.aiExtractedData,
      tenantId: document.tenantId,
      unitId: document.unitId,
      maintenanceRequestId: document.maintenanceRequestId,
      uploadedAt: document.uploadedAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      downloadUrl,
      canEdit: user.role === "ADMIN" || user.role === "STAFF",
      canDelete: user.role === "ADMIN" || user.role === "STAFF",
      tenant: document.tenant,
      unit: document.unit,
    };

    logger.info("Document retrieved", {
      userId: user.id,
      documentId: document.id,
      fileName: document.fileName,
      hasAIExtractedData: !!document.aiExtractedData,
    });

    return ok(metadata, "Document retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve document", { error });
    return ErrorHandler.handleAPIError(error as Error, request);
  }
}

// DELETE /api/uploads/[id] - Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate document ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const documentId = validatedParams.id;

    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "OWNER"])(request);

    // Get document details first
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      return notFound("Document not found");
    }

    // Role-based access check
    if (user.role === "OWNER") {
      // Check if document is related to owner's properties
      if (existingDocument.unitId) {
        const unit = await prisma.units.findFirst({
          where: {
            id: existingDocument.unitId,
            // In production, check building.ownerId
          },
        });

        if (!unit) {
          return notFound("Document not found");
        }
      }
    }

    // Delete physical file from storage
    try {
      await unlink(existingDocument.filePath);
      logger.info("Physical file deleted", { filePath: existingDocument.filePath });
    } catch (fileError) {
      logger.warn("Failed to delete physical file", { 
        filePath: existingDocument.filePath, 
        error: fileError 
      });
      // Continue with database deletion even if file deletion fails
    }

    // Soft delete document record
    const deletedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: user.id,
      },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DOCUMENT_DELETED',
        entityType: 'DOCUMENT',
        entityId: documentId,
        details: {
          fileName: existingDocument.fileName,
          fileSize: existingDocument.fileSize,
          category: existingDocument.category,
        },
        ipAddress: request.ip || request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    logger.info("Document deleted", {
      userId: user.id,
      documentId: documentId,
      fileName: existingDocument.fileName,
      fileSize: existingDocument.fileSize,
    });

    return ok({ 
      id: documentId,
      deletedAt: deletedDocument.deletedAt,
      deletedBy: deletedDocument.deletedBy
    }, "Document deleted successfully");
  } catch (error) {
    logger.error("Failed to delete document", { error });
    return ErrorHandler.handleAPIError(error as Error, request);
  }
}

// PUT /api/uploads/[id] - Update document metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate document ID parameter
    const validatedParams = validateParams(
      z.object({ id: uuidSchema }),
      params
    ) as { id: string };
    const documentId = validatedParams.id;

    const user = await requireAuth(request);
    const body = await request.json();

    // Get existing document
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      return notFound("Document not found");
    }

    // Check permissions
    if (user.role !== "ADMIN" && user.role !== "STAFF") {
      return notFound("Document not found");
    }

    // Update document metadata
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        description: body.description || existingDocument.description,
        updatedAt: new Date(),
      },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DOCUMENT_UPDATED',
        entityType: 'DOCUMENT',
        entityId: documentId,
        details: {
          changes: body,
          previousValues: {
            description: existingDocument.description,
          },
        },
        ipAddress: request.ip || request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    logger.info("Document updated", {
      userId: user.id,
      documentId: documentId,
      changes: Object.keys(body),
    });

    return ok(updatedDocument, "Document updated successfully");
  } catch (error) {
    logger.error("Failed to update document", { error });
    return ErrorHandler.handleAPIError(error as Error, request);
  }
}

// Helper function to generate secure download URL
async function generateSecureDownloadUrl(filePath: string, documentId: string): Promise<string> {
  try {
    // In production, this would generate a signed URL with expiration
    // For now, return a direct URL with basic security
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const token = Buffer.from(`${documentId}:${Date.now()}`).toString('base64');
    
    return `${baseUrl}/api/download/${documentId}?token=${token}`;
  } catch (error) {
    logger.error("Failed to generate download URL", { error, documentId });
    throw error;
  }
}