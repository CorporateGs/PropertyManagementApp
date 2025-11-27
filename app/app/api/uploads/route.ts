import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateQuery } from "@/lib/middleware/validation";
import { paginationQuerySchema } from "@/lib/middleware/validation";
import { ok, created, badRequest, serverError, paginated } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { storage, generateFilename, validateFile } from '@/lib/storage';

// GET /api/uploads - List uploaded documents
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "TENANT", "OWNER"])(request);

    // Validate pagination
    const { page, limit } = validateQuery(paginationQuerySchema, request);
    const offset = (page - 1) * limit;

    // Build where clause based on user role
    const where: any = {};

    // Role-based filtering
    if (user.role === "TENANT") {
      // Tenants can only see their own documents
      where.createdBy = user.id;
    }

    if (user.role === "OWNER") {
      // Owners can only see documents related to their properties
      where.OR = [
        { createdBy: user.id },
        {
          relatedEntityType: "UNIT",
          relatedEntityId: {
            in: await prisma.units.findMany({
              where: {
                building: {
                  ownerId: user.id,
                },
              },
              select: { id: true },
            }).then(units => units.map(u => u.id)),
          },
        },
      ];
    }

    // Get total count for pagination
    const total = await prisma.document.count({ where });

    // Get documents with related data
    const documents = await prisma.document.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    logger.info("Documents retrieved", {
      userId: user.id,
      count: documents.length,
      total,
    });

    return paginated(documents, total, page, limit, "Documents retrieved successfully");
  } catch (error) {
    logger.error("Failed to retrieve documents", { error });
    return serverError(error);
  }
}

// POST /api/uploads - Upload file
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "TENANT", "OWNER"])(request);

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return badRequest("No file provided");
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    validateFile(file, { maxSize, allowedTypes });

    // Generate unique filename
    const filename = generateFilename(file.name);

    // Upload to storage
    const fileUrl = await storage.upload(file, `documents/${filename}`);

    // Get metadata from form data
    const metadata = {
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      relatedEntityType: (formData.get("relatedEntityType") as string) || null,
      relatedEntityId: (formData.get("relatedEntityId") as string) || null,
      description: (formData.get("description") as string) || null,
      category: (formData.get("category") as string) || "GENERAL",
    };

    // Create document record
    const document = await prisma.document.create({
      data: {
        filename,
        originalName: metadata.originalName,
        mimeType: metadata.mimeType,
        size: metadata.size,
        url: fileUrl,
        relatedEntityType: metadata.relatedEntityType,
        relatedEntityId: metadata.relatedEntityId,
        description: metadata.description,
        category: metadata.category,
        createdBy: user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info("File uploaded successfully", {
      userId: user.id,
      documentId: document.id,
      filename: document.filename,
      size: document.size,
      mimeType: document.mimeType,
    });

    return created({
      ...document,
      downloadUrl: fileUrl,
    }, "File uploaded successfully");
  } catch (error) {
    logger.error("Failed to upload file", { error });
    return serverError(error);
  }
}