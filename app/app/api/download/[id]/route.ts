/**
 * Secure Document Download API Endpoint
 * 
 * GET /api/download/[id] - Download document with security validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { validateParams } from '@/lib/middleware/validation';
import { uuidSchema } from '@/lib/middleware/validation';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ErrorHandler } from '@/lib/middleware/error-handler';
import { z } from 'zod';
import { readFile } from 'fs/promises';
import { join } from 'path';

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
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Validate security token
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing security token' },
        { status: 400 }
      );
    }

    // Decode and validate token
    try {
      const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
      const [tokenDocumentId, timestamp] = decodedToken.split(':');
      
      if (tokenDocumentId !== documentId) {
        return NextResponse.json(
          { success: false, error: 'Invalid security token' },
          { status: 400 }
        );
      }

      // Check if token is expired (1 hour)
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      if (now - tokenTime > oneHour) {
        return NextResponse.json(
          { success: false, error: 'Security token expired' },
          { status: 400 }
        );
      }
    } catch (tokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid security token format' },
        { status: 400 }
      );
    }

    // Get document details
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Role-based access check
    if (user.role === "TENANT" && document.uploadedBy !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    if (user.role === "OWNER") {
      // Check if document is related to owner's properties
      if (document.relatedEntityType === "UNIT") {
        const unit = await prisma.units.findFirst({
          where: {
            id: document.relatedEntityId,
            building: {
              ownerId: user.id,
            },
          },
        });

        if (!unit) {
          return NextResponse.json(
            { success: false, error: 'Access denied' },
            { status: 403 }
          );
        }
      }
    }

    // Read file from storage
    let fileBuffer: Buffer;
    try {
      fileBuffer = await readFile(document.filePath);
    } catch (fileError) {
      logger.error("Failed to read document file", {
        documentId,
        filePath: document.filePath,
        error: fileError
      });
      
      return NextResponse.json(
        { success: false, error: 'File not found on server' },
        { status: 404 }
      );
    }

    // Log download activity
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DOCUMENT_DOWNLOADED',
        entityType: 'DOCUMENT',
        entityId: documentId,
        details: {
          fileName: document.fileName,
          fileSize: document.fileSize,
          documentType: document.documentType,
        },
        ipAddress: request.ip || request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    logger.info("Document downloaded", {
      userId: user.id,
      documentId: document.id,
      fileName: document.fileName,
      fileSize: document.fileSize,
      ipAddress: request.ip || request.headers.get('x-forwarded-for'),
    });

    // Return file with appropriate headers
    const response = new NextResponse(fileBuffer);
    
    // Set content type based on file extension
    const contentType = getContentType(document.fileName);
    response.headers.set('Content-Type', contentType);
    
    // Set content disposition for download
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="${document.fileName}"`
    );
    
    // Set file size
    response.headers.set('Content-Length', document.fileSize.toString());
    
    // Set cache headers
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Set security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
  } catch (error) {
    logger.error("Failed to download document", { error });
    return ErrorHandler.handleAPIError(error as Error, request);
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const contentTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'svg': 'image/svg+xml',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
  };

  return contentTypes[extension || ''] || 'application/octet-stream';
}
