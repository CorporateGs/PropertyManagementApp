import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import TenantsPage from '@/app/tenants/page';

// Mock API calls
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

const mockTenants = [
  {
    id: 'tenant_1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    status: 'ACTIVE' as const,
    leaseStartDate: '2024-01-01T00:00:00.000Z',
    leaseEndDate: '2025-01-01T00:00:00.000Z',
    monthlyRent: 2500,
    unit: {
      id: 'unit_1',
      unitNumber: '101',
      building: {
        id: 'building_1',
        name: 'Sunset Apartments',
      },
    },
    payments: [
      {
        id: 'payment_1',
        amount: 2500,
        status: 'PAID' as const,
        dueDate: '2024-12-01T00:00:00.000Z',
      },
    ],
  },
];

describe('TenantsPage', () => {
  beforeEach(() => {
    // Mock fetch globally
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockTenants,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      }),
    });
  });

  it('should render loading state initially', () => {
    render(<TenantsPage />);

    // Should show loading skeletons
    expect(screen.getByText('Tenants')).toBeInTheDocument();
  });

  it('should display tenants after loading', async () => {
    render(<TenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('101')).toBeInTheDocument();
      expect(screen.getByText('Sunset Apartments')).toBeInTheDocument();
    });
  });

  it('should filter tenants by search term', async () => {
    const user = userEvent.setup();
    render(<TenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search tenants by name or email...');
    await user.type(searchInput, 'john');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=john')
      );
    });
  });

  it('should open create tenant dialog', async () => {
    const user = userEvent.setup();
    render(<TenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Tenant');
    await user.click(addButton);

    expect(screen.getByText('Add New Tenant')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should create new tenant', async () => {
    const user = userEvent.setup();

    // Mock successful creation
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockTenants,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: 'tenant_2', ...mockTenants[0] },
        }),
      });

    render(<TenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open create dialog
    const addButton = screen.getByText('Add Tenant');
    await user.click(addButton);

    // Fill form
    await user.type(screen.getByLabelText('First Name'), 'Jane');
    await user.type(screen.getByLabelText('Last Name'), 'Smith');
    await user.type(screen.getByLabelText('Email'), 'jane.smith@example.com');
    await user.type(screen.getByDisplayValue(''), 'unit_2'); // Unit ID field

    // Submit form
    const createButton = screen.getByText('Create Tenant');
    await user.click(createButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tenants',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    });

    render(<TenantsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch tenants/)).toBeInTheDocument();
    });

    // Should show retry button
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
  });

  it('should display tenant status badges correctly', async () => {
    render(<TenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Should show status badge
    const statusBadge = screen.getByText('ACTIVE');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-primary'); // Default badge style
  });

  it('should format currency correctly', async () => {
    render(<TenantsPage />);

    await waitFor(() => {
      expect(screen.getByText('$2,500.00')).toBeInTheDocument();
    });
  });

  it('should format dates correctly', async () => {
    render(<TenantsPage />);

    await waitFor(() => {
      expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument();
    });
  });
});