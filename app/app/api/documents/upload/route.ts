/**
 * Document Upload API Endpoint
 * 
 * POST /api/documents/upload - Upload and process document
 * GET /api/documents/search - Search documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { DocumentManagementService } from '@/lib/services/document/document-service';
import { logger } from '@/lib/logger';
import { DatabaseError, ExternalServiceError } from '@/lib/errors';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const documentService = new DocumentManagementService();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const buildingId = formData.get('buildingId') as string;
    const unitId = formData.get('unitId') as string;
    const tenantId = formData.get('tenantId') as string;
    const documentType = formData.get('documentType') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const uploadedBy = formData.get('uploadedBy') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    logger.info('Uploading document', {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      buildingId,
      documentType
    });

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'documents');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = join(uploadsDir, fileName);

    // Save file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Process document
    const result = await documentService.uploadDocument({
      buildingId,
      unitId: unitId || undefined,
      tenantId: tenantId || undefined,
      documentType: documentType as any,
      fileName: file.name,
      filePath,
      fileSize: file.size,
      mimeType: file.type,
      uploadedBy,
      tags: tags ? tags.split(',') : undefined,
      description
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Document uploaded and processed successfully'
    });
  } catch (error) {
    logger.error('Failed to upload document', error);
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { success: false, error: 'Database error', message: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const unitId = searchParams.get('unitId');
    const tenantId = searchParams.get('tenantId');
    const documentType = searchParams.get('documentType');
    const status = searchParams.get('status');
    const tags = searchParams.get('tags');
    const searchText = searchParams.get('searchText');
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    logger.info('Searching documents', {
      buildingId,
      unitId,
      tenantId,
      documentType,
      status,
      searchText,
      limit,
      offset
    });

    const result = await documentService.searchDocuments({
      buildingId: buildingId || undefined,
      unitId: unitId || undefined,
      tenantId: tenantId || undefined,
      documentType: documentType as any,
      status: status as any,
      tags: tags ? tags.split(',') : undefined,
      searchText: searchText || undefined,
      startDate,
      endDate,
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to search documents', error);
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { success: false, error: 'Database error', message: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
