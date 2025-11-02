import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    tenant: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    units: {
      findUnique: vi.fn(),
    },
    building: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/lib/middleware/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    id: 'user_123',
    role: 'ADMIN',
    email: 'admin@test.com',
  }),
  requireRole: vi.fn().mockImplementation(() => vi.fn().mockResolvedValue({
    id: 'user_123',
    role: 'ADMIN',
  })),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('/api/tenants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/tenants', () => {
    it('should return list of tenants with pagination', async () => {
      const { prisma } = await import('@/lib/db');
      const mockTenants = [
        {
          id: 'tenant_1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          status: 'ACTIVE',
          unit: {
            id: 'unit_1',
            unitNumber: '101',
            building: { name: 'Test Building' },
          },
        },
      ];

      vi.mocked(prisma.tenant.findMany).mockResolvedValue(mockTenants);
      vi.mocked(prisma.tenant.count).mockResolvedValue(1);

      // Mock request
      const request = new NextRequest('http://localhost:3000/api/tenants?page=1&limit=20');

      // Import and call the API route
      const { GET } = await import('@/app/api/tenants/route');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.pagination.total).toBe(1);
    });

    it('should filter tenants by search term', async () => {
      const { prisma } = await import('@/lib/db');

      const request = new NextRequest('http://localhost:3000/api/tenants?search=john');

      const { GET } = await import('@/app/api/tenants/route');
      await GET(request);

      expect(prisma.tenant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                firstName: expect.objectContaining({
                  contains: 'john',
                  mode: 'insensitive',
                }),
              }),
            ]),
          }),
        })
      );
    });
  });

  describe('POST /api/tenants', () => {
    it('should create a new tenant', async () => {
      const { prisma } = await import('@/lib/db');

      const mockUnit = {
        id: 'unit_1',
        building: { ownerId: 'user_123' },
      };

      const mockTenant = {
        id: 'tenant_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        unitId: 'unit_1',
      };

      vi.mocked(prisma.units.findUnique).mockResolvedValue(mockUnit);
      vi.mocked(prisma.tenant.create).mockResolvedValue(mockTenant);

      const request = new NextRequest('http://localhost:3000/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          unitId: 'unit_1',
          leaseStartDate: '2024-01-01T00:00:00.000Z',
          leaseEndDate: '2025-01-01T00:00:00.000Z',
          monthlyRent: 2500,
          securityDeposit: 2500,
        }),
      });

      const { POST } = await import('@/app/api/tenants/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.firstName).toBe('John');
    });

    it('should reject duplicate unit assignment', async () => {
      const { prisma } = await import('@/lib/db');

      // Mock existing tenant in the unit
      vi.mocked(prisma.tenant.findFirst).mockResolvedValue({
        id: 'existing_tenant',
        unitId: 'unit_1',
        status: 'ACTIVE',
      });

      const request = new NextRequest('http://localhost:3000/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@test.com',
          unitId: 'unit_1',
          leaseStartDate: '2024-01-01T00:00:00.000Z',
          leaseEndDate: '2025-01-01T00:00:00.000Z',
          monthlyRent: 2200,
          securityDeposit: 2200,
        }),
      });

      const { POST } = await import('@/app/api/tenants/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});