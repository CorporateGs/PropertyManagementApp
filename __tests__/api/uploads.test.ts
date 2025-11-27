import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, DELETE, PUT } from '@/app/api/uploads/[id]/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    document: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    units: {
      findFirst: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/middleware/auth', () => ({
  requireAuth: vi.fn(() => Promise.resolve({ id: 'user-1', role: 'ADMIN' })),
  requireRole: vi.fn(() => vi.fn(() => Promise.resolve())),
}));

vi.mock('@/lib/middleware/validation', () => ({
  validateParams: vi.fn((schema, params) => params),
  uuidSchema: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  unlink: vi.fn(),
}));

describe('Uploads API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/uploads/[id]', () => {
    it('should return document details', async () => {
      const { prisma } = await import('@/lib/db');
      const mockDocument = {
        id: 'doc-1',
        fileName: 'test.pdf',
        filePath: '/uploads/test.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        category: 'LEASE',
        description: 'Test document',
        tenantId: null,
        unitId: 'unit-1',
        maintenanceRequestId: null,
        uploadedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        tenant: null,
        unit: {
          id: 'unit-1',
          building: {
            id: 'building-1',
            name: 'Test Building',
          },
        },
      };

      vi.mocked(prisma.document.findUnique).mockResolvedValue(mockDocument as any);

      const request = new NextRequest('http://localhost:3000/api/uploads/doc-1');
      const response = await GET(request, { params: { id: 'doc-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('doc-1');
      expect(data.data.fileName).toBe('test.pdf');
    });

    it('should return 404 if document not found', async () => {
      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.document.findUnique).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/uploads/doc-1');
      const response = await GET(request, { params: { id: 'doc-1' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/uploads/[id]', () => {
    it('should delete document', async () => {
      const { prisma } = await import('@/lib/db');
      const { unlink } = await import('fs/promises');

      const mockDocument = {
        id: 'doc-1',
        fileName: 'test.pdf',
        filePath: '/uploads/test.pdf',
        fileSize: 1024,
        category: 'LEASE',
      };

      vi.mocked(prisma.document.findUnique).mockResolvedValue(mockDocument as any);
      vi.mocked(prisma.document.update).mockResolvedValue({
        ...mockDocument,
        deletedAt: new Date(),
        deletedBy: 'user-1',
      } as any);
      vi.mocked(unlink).mockResolvedValue(undefined);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const request = new NextRequest('http://localhost:3000/api/uploads/doc-1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { id: 'doc-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.document.update).toHaveBeenCalled();
    });
  });

  describe('PUT /api/uploads/[id]', () => {
    it('should update document metadata', async () => {
      const { prisma } = await import('@/lib/db');

      const mockDocument = {
        id: 'doc-1',
        fileName: 'test.pdf',
        description: 'Old description',
      };

      vi.mocked(prisma.document.findUnique).mockResolvedValue(mockDocument as any);
      vi.mocked(prisma.document.update).mockResolvedValue({
        ...mockDocument,
        description: 'New description',
        updatedAt: new Date(),
      } as any);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const request = new NextRequest('http://localhost:3000/api/uploads/doc-1', {
        method: 'PUT',
        body: JSON.stringify({ description: 'New description' }),
      });
      const response = await PUT(request, { params: { id: 'doc-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.document.update).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
        data: expect.objectContaining({
          description: 'New description',
        }),
      });
    });
  });
});
