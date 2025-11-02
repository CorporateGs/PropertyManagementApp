// =============================================================================
// CUSTOM ERROR CLASSES
// =============================================================================

export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, "VALIDATION_ERROR", true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message = "External service error",
    statusCode = 502
  ) {
    super(`${service}: ${message}`, statusCode, "EXTERNAL_SERVICE_ERROR");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMIT_ERROR");
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed") {
    super(message, 500, "DATABASE_ERROR");
  }
}

export class ConfigurationError extends AppError {
  constructor(message = "Configuration error") {
    super(message, 500, "CONFIGURATION_ERROR");
  }
}

// =============================================================================
// ERROR HANDLER
// =============================================================================

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  method?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

export function handleError(error: unknown, context?: ErrorContext): ErrorResponse {
  const timestamp = new Date().toISOString();
  const requestId = context?.requestId;

  // Log the error with context
  logError(error, context);

  // Handle known application errors
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp,
        requestId,
      },
    };
  }

  // Handle Prisma errors
  if (isPrismaError(error)) {
    return handlePrismaError(error, timestamp, requestId);
  }

  // Handle Zod validation errors
  if (isZodError(error)) {
    return handleZodError(error, timestamp, requestId);
  }

  // Handle unknown errors
  return {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: process.env.NODE_ENV === "production" 
        ? "An unexpected error occurred" 
        : error instanceof Error ? error.message : "Unknown error",
      timestamp,
      requestId,
    },
  };
}

// =============================================================================
// ERROR LOGGING
// =============================================================================

function logError(error: unknown, context?: ErrorContext): void {
  const logData = {
    error: {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
    context,
    timestamp: new Date().toISOString(),
  };

  // In development, log to console with pretty formatting
  if (process.env.NODE_ENV === "development") {
    console.error("🚨 Error:", JSON.stringify(logData, null, 2));
    return;
  }

  // In production, log as JSON for log aggregation
  console.error(JSON.stringify(logData));

  // TODO: Send to monitoring service (Sentry, DataDog, etc.)
  // Example: Sentry.captureException(error, { extra: context });
}

// =============================================================================
// PRISMA ERROR HANDLING
// =============================================================================

function isPrismaError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientKnownRequestError" ||
      error.name === "PrismaClientUnknownRequestError" ||
      error.name === "PrismaClientRustPanicError" ||
      error.name === "PrismaClientInitializationError" ||
      error.name === "PrismaClientValidationError")
  );
}

function handlePrismaError(
  error: any,
  timestamp: string,
  requestId?: string
): ErrorResponse {
  switch (error.code) {
    case "P2002":
      // Unique constraint violation
      return {
        success: false,
        error: {
          code: "DUPLICATE_ENTRY",
          message: "A record with this value already exists",
          details: {
            field: error.meta?.target,
          },
          timestamp,
          requestId,
        },
      };

    case "P2025":
      // Record not found
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Record not found",
          timestamp,
          requestId,
        },
      };

    case "P2003":
      // Foreign key constraint violation
      return {
        success: false,
        error: {
          code: "FOREIGN_KEY_CONSTRAINT",
          message: "Referenced record does not exist",
          details: {
            field: error.meta?.field_name,
          },
          timestamp,
          requestId,
        },
      };

    case "P2014":
      // Relation violation
      return {
        success: false,
        error: {
          code: "RELATION_VIOLATION",
          message: "Cannot delete or update a parent row",
          details: error.meta,
          timestamp,
          requestId,
        },
      };

    default:
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Database operation failed",
          details: {
            prismaCode: error.code,
            prismaMessage: error.message,
          },
          timestamp,
          requestId,
        },
      };
  }
}

// =============================================================================
// ZOD ERROR HANDLING
// =============================================================================

function isZodError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray((error as any).errors)
  );
}

function handleZodError(
  error: any,
  timestamp: string,
  requestId?: string
): ErrorResponse {
  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Invalid input data",
      details: {
        fields: error.errors.map((e: any) => ({
          field: e.path.join("."),
          message: e.message,
          code: e.code,
        })),
      },
      timestamp,
      requestId,
    },
  };
}

// =============================================================================
// ERROR RESPONSE FORMATTER
// =============================================================================

export function formatErrorResponse(error: AppError | unknown): ErrorResponse {
  return handleError(error);
}

// =============================================================================
// ASYNC ERROR WRAPPER
// =============================================================================

export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return (...args: T): Promise<R> => {
    return Promise.resolve(fn(...args)).catch((error) => {
      throw error;
    });
  };
}

// =============================================================================
// CREATE ERROR HELPERS
// =============================================================================

export const createError = {
  validation: (message: string, details?: any) => new ValidationError(message, details),
  authentication: (message?: string) => new AuthenticationError(message),
  authorization: (message?: string) => new AuthorizationError(message),
  notFound: (resource?: string) => new NotFoundError(resource),
  conflict: (message: string) => new ConflictError(message),
  externalService: (service: string, message?: string) => new ExternalServiceError(service, message),
  rateLimit: (message?: string) => new RateLimitError(message),
  database: (message?: string) => new DatabaseError(message),
  configuration: (message?: string) => new ConfigurationError(message),
};

// =============================================================================
// EXPORT ALL
// =============================================================================
// All classes are already exported inline above