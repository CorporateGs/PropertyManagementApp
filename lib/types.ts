
import { UserRole, UnitStatus, PaymentStatus, PaymentType, CommunicationType, CommunicationStatus, MaintenanceCategory, Priority, MaintenanceStatus, DocumentCategory } from '@prisma/client';

// Re-export Prisma enums
export { UserRole, UnitStatus, PaymentStatus, PaymentType, CommunicationType, CommunicationStatus, MaintenanceCategory, Priority, MaintenanceStatus, DocumentCategory };

// Extended types for the application
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  totalUnits: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  id: string;
  buildingId: string;
  unitNumber: string;
  floor?: number;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  rentAmount: number;
  status: UnitStatus;
  amenities?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  building?: Building;
  tenants?: Tenant[];
}

export interface Tenant {
  id: string;
  unitId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  leaseStartDate: Date;
  leaseEndDate: Date;
  rentAmount: number;
  securityDeposit?: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  unit?: Unit;
}

export interface Payment {
  id: string;
  tenantId: string;
  unitId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: PaymentStatus;
  paymentType: PaymentType;
  lateFee?: number;
  description?: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  tenant?: Tenant;
  unit?: Unit;
}

export interface Communication {
  id: string;
  tenantId?: string;
  createdByUserId: string;
  type: CommunicationType;
  subject?: string;
  content: string;
  timestamp: Date;
  isImportant: boolean;
  followUpDate?: Date;
  status: CommunicationStatus;
  createdAt: Date;
  updatedAt: Date;
  tenant?: Tenant;
  createdBy?: User;
}

export interface MaintenanceRequest {
  id: string;
  unitId: string;
  tenantId?: string;
  createdByUserId: string;
  assignedStaffId?: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: Priority;
  status: MaintenanceStatus;
  requestDate: Date;
  scheduledDate?: Date;
  completedDate?: Date;
  estimatedCost?: number;
  actualCost?: number;
  contractorName?: string;
  contractorContact?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  unit?: Unit;
  tenant?: Tenant;
  createdBy?: User;
  assignedStaff?: User;
}

export interface Document {
  id: string;
  tenantId?: string;
  unitId?: string;
  maintenanceRequestId?: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  category: DocumentCategory;
  description?: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard stats interface
export interface DashboardStats {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalTenants: number;
  pendingPayments: number;
  pendingMaintenance: number;
  totalRevenue: number;
  occupancyRate: number;
}

// Filter interfaces
export interface TenantsFilter {
  search?: string;
  unitNumber?: string;
  status?: 'active' | 'inactive';
  leaseExpiring?: boolean;
}

export interface PaymentsFilter {
  search?: string;
  status?: PaymentStatus;
  paymentType?: PaymentType;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface MaintenanceFilter {
  search?: string;
  category?: MaintenanceCategory;
  priority?: Priority;
  status?: MaintenanceStatus;
  assignedTo?: string;
}

export interface CommunicationFilter {
  search?: string;
  type?: CommunicationType;
  status?: CommunicationStatus;
  tenantId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
