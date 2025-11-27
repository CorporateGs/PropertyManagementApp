import { z } from "zod";

// =============================================================================
// COMMON SCHEMAS
// =============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const idSchema = z.string().uuid();

// =============================================================================
// USER SCHEMAS
// =============================================================================

export const UserRole = z.enum(["ADMIN", "STAFF", "OWNER", "TENANT"]);

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  role: UserRole.default("TENANT"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
});

// =============================================================================
// TENANT SCHEMAS
// =============================================================================

export const createTenantSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone format").optional(),
  dateOfBirth: z.string().datetime().optional(),
  ssn: z.string().regex(/^\d{3}-?\d{2}-?\d{4}$/, "Invalid SSN format").optional(),
  driverLicense: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  unitId: idSchema,
  leaseStartDate: z.string().datetime(),
  leaseEndDate: z.string().datetime(),
  monthlyRent: z.number().min(0, "Rent must be positive"),
  securityDeposit: z.number().min(0, "Security deposit must be positive"),
  notes: z.string().max(1000).optional(),
});

export const updateTenantSchema = createTenantSchema.partial();

// =============================================================================
// BUILDING & UNIT SCHEMAS
// =============================================================================

export const createBuildingSchema = z.object({
  name: z.string().min(1, "Building name is required").max(100),
  address: z.string().min(1, "Address is required").max(200),
  city: z.string().min(1, "City is required").max(50),
  state: z.string().min(2, "State must be 2 characters").max(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  country: z.string().default("USA"),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear()).optional(),
  totalUnits: z.number().min(1).default(1),
  description: z.string().max(1000).optional(),
  amenities: z.array(z.string()).optional(),
  ownerId: idSchema.optional(),
});

export const createUnitSchema = z.object({
  buildingId: idSchema,
  unitNumber: z.string().min(1, "Unit number is required").max(20),
  type: z.enum(["STUDIO", "1BED", "2BED", "3BED", "4BED", "LOFT", "PENTHOUSE"]),
  bedrooms: z.number().min(0).default(1),
  bathrooms: z.number().min(0).default(1),
  squareFootage: z.number().min(0).optional(),
  rentAmount: z.number().min(0, "Rent must be positive"),
  securityDeposit: z.number().min(0, "Security deposit must be positive"),
  status: z.enum(["VACANT", "OCCUPIED", "MAINTENANCE", "RENOVATION"]).default("VACANT"),
  floor: z.number().min(0).optional(),
  description: z.string().max(1000).optional(),
  amenities: z.array(z.string()).optional(),
  isFurnished: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  hasLaundry: z.boolean().default(false),
  hasPetsAllowed: z.boolean().default(true),
});

// =============================================================================
// PAYMENT SCHEMAS
// =============================================================================

export const PaymentType = z.enum([
  "RENT",
  "SECURITY_DEPOSIT",
  "LATE_FEE",
  "UTILITY",
  "MAINTENANCE",
  "PET_FEE",
  "PARKING",
  "OTHER",
]);

export const PaymentStatus = z.enum(["PENDING", "PAID", "LATE", "PARTIAL", "FAILED"]);

export const createPaymentSchema = z.object({
  tenantId: idSchema,
  unitId: idSchema,
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentType: PaymentType,
  dueDate: z.string().datetime(),
  paymentDate: z.string().datetime().optional(),
  status: PaymentStatus.default("PENDING"),
  method: z.enum(["CASH", "CHECK", "BANK_TRANSFER", "CREDIT_CARD", "ONLINE"]).optional(),
  description: z.string().max(500).optional(),
  referenceNumber: z.string().optional(),
});

export const processPaymentSchema = z.object({
  paymentId: idSchema,
  paymentMethod: z.enum(["CREDIT_CARD", "BANK_TRANSFER", "CHECK"]),
  amount: z.number().min(0.01),
  transactionId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// =============================================================================
// MAINTENANCE SCHEMAS
// =============================================================================

export const MaintenanceCategory = z.enum([
  "PLUMBING",
  "ELECTRICAL",
  "HVAC",
  "APPLIANCE",
  "STRUCTURAL",
  "PEST_CONTROL",
  "LANDSCAPING",
  "SECURITY",
  "OTHER",
]);

export const MaintenancePriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT", "EMERGENCY"]);

export const MaintenanceStatus = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
]);

export const createMaintenanceSchema = z.object({
  unitId: idSchema,
  tenantId: idSchema.optional(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  category: MaintenanceCategory,
  priority: MaintenancePriority.default("MEDIUM"),
  status: MaintenanceStatus.default("OPEN"),
  assignedStaffId: idSchema.optional(),
  vendorId: idSchema.optional(),
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  scheduledDate: z.string().datetime().optional(),
  completedDate: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial();

// =============================================================================
// AI SERVICE SCHEMAS
// =============================================================================

export const tenantScreeningInputSchema = z.object({
  applicantId: idSchema,
  creditScore: z.number().min(300).max(850).optional(),
  annualIncome: z.number().min(0),
  monthlyIncome: z.number().min(0),
  employmentStatus: z.enum(["EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED", "RETIRED", "STUDENT"]),
  employmentYears: z.number().min(0).max(50),
  previousAddress: z.string().max(200),
  rentalHistory: z.string().max(1000).optional(),
  criminalHistory: z.boolean(),
  evictionHistory: z.boolean(),
  references: z.array(z.string()).optional(),
  requestedRent: z.number().min(0),
});

export const rentPricingInputSchema = z.object({
  unitId: idSchema,
  currentRent: z.number().min(0).optional(),
  squareFootage: z.number().min(0),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  buildingId: idSchema,
  neighborhood: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  marketData: z.object({
    similarUnits: z.array(
      z.object({
        rent: z.number(),
        squareFootage: z.number(),
        distance: z.number(),
      })
    ),
  }).optional(),
});

// =============================================================================
// FINANCIAL SCHEMAS
// =============================================================================

export const ReportType = z.enum([
  "PROFIT_LOSS",
  "BALANCE_SHEET",
  "CASH_FLOW",
  "RENT_ROLL",
  "AR_AGING",
  "VENDOR_PAYMENTS",
  "TAX_1099",
]);

export const ExportFormat = z.enum(["PDF", "EXCEL", "CSV"]);

export const reportGenerationSchema = z.object({
  reportType: ReportType,
  dateRange: dateRangeSchema,
  buildingIds: z.array(idSchema).optional(),
  unitIds: z.array(idSchema).optional(),
  includeCharts: z.boolean().default(true),
  format: ExportFormat.default("PDF"),
});

export const exportFormatSchema = z.object({
  format: ExportFormat,
  emailTo: z.string().email().optional(),
  includeAttachments: z.boolean().default(false),
});

// =============================================================================
// COMMUNICATION SCHEMAS
// =============================================================================

export const CommunicationType = z.enum(["EMAIL", "SMS", "PUSH", "LETTER"]);

export const createCommunicationSchema = z.object({
  recipientId: idSchema,
  recipientType: z.enum(["TENANT", "OWNER", "VENDOR", "STAFF"]),
  type: CommunicationType,
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  templateId: idSchema.optional(),
  scheduledAt: z.string().datetime().optional(),
  attachments: z.array(z.string()).optional(),
});

export const bulkCommunicationSchema = z.object({
  recipientIds: z.array(idSchema).min(1),
  recipientType: z.enum(["TENANT", "OWNER", "VENDOR", "STAFF"]),
  type: CommunicationType,
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  templateId: idSchema.optional(),
  scheduledAt: z.string().datetime().optional(),
});

// =============================================================================
// WORKFLOW SCHEMAS
// =============================================================================

export const createWorkflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  trigger: z.object({
    type: z.enum(["EVENT", "SCHEDULE", "MANUAL"]),
    event: z.string().optional(),
    schedule: z.string().optional(), // cron expression
  }),
  conditions: z.array(z.any()).optional(), // JSON conditions
  actions: z.array(z.any()), // JSON actions
  isActive: z.boolean().default(true),
});

// =============================================================================
// VALIDATION HELPER
// =============================================================================

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const flattenedErrors = error.flatten();
      throw new Error(
        `Validation failed: ${Object.entries(flattenedErrors.fieldErrors)
          .map(([field, errors]) => `${field}: ${errors?.join(", ")}`)
          .join("; ")}`
      );
    }
    throw error;
  }
}