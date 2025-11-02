import { NextRequest } from "next/server";
import { z } from "zod";
import { ValidationError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation/schemas";

// =============================================================================
// VALIDATION MIDDLEWARE FACTORIES
// =============================================================================

/**
 * Middleware factory that validates request body against a Zod schema
 * @param schema The Zod schema to validate against
 * @returns Function that validates and returns parsed body
 */
export async function validateBody<T>(
  schema: z.ZodSchema<T>,
  request: NextRequest
): Promise<T> {
  try {
    const body = await request.json();
    return validateRequest(schema, body);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new ValidationError("Invalid JSON in request body");
    }
    throw new ValidationError("Failed to process request body");
  }
}

/**
 * Middleware factory that validates query parameters against a Zod schema
 * @param schema The Zod schema to validate against
 * @returns Function that validates and returns parsed query params
 */
export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  request: NextRequest
): T {
  try {
    const { searchParams } = new URL(request.url);
    const query: Record<string, any> = {};
    
    // Convert all search params to appropriate types
    searchParams.forEach((value, key) => {
      // Try to parse as JSON first (for arrays/objects)
      try {
        query[key] = JSON.parse(value);
      } catch {
        // If not valid JSON, keep as string
        query[key] = value;
      }
    });
    
    return validateRequest(schema, query);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError("Failed to process query parameters");
  }
}

/**
 * Middleware factory that validates route parameters against a Zod schema
 * @param schema The Zod schema to validate against
 * @param params The route parameters object
 * @returns Function that validates and returns parsed params
 */
export function validateParams<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, string>
): T {
  try {
    return validateRequest(schema, params);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError("Failed to process route parameters");
  }
}

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

/**
 * Sanitizes string inputs to prevent XSS attacks
 * @param data The data to sanitize
 * @returns Sanitized data
 */
export function sanitizeInput(data: any): any {
  if (typeof data !== "string") {
    return data;
  }
  
  return data
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, """)
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Recursively sanitizes all string values in an object
 * @param obj The object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === "string") {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Middleware that sanitizes request body
 * @param request The Next.js request object
 * @returns Sanitized body
 */
export async function sanitizeBody(request: NextRequest): Promise<any> {
  try {
    const body = await request.json();
    return sanitizeObject(body);
  } catch (error) {
    throw new ValidationError("Invalid JSON in request body");
  }
}

// =============================================================================
// COMMON VALIDATION SCHEMAS
// =============================================================================

export const uuidSchema = z.string().uuid("Invalid ID format");

export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const dateRangeQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const searchQuerySchema = z.object({
  search: z.string().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validates and parses a date string
 * @param dateString The date string to validate
 * @returns Parsed Date object
 */
export function validateDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new ValidationError("Invalid date format");
  }
  return date;
}

/**
 * Validates that a date is within a reasonable range
 * @param date The date to validate
 * @param minDate Minimum allowed date (optional)
 * @param maxDate Maximum allowed date (optional)
 * @returns True if valid
 */
export function validateDateRange(
  date: Date,
  minDate?: Date,
  maxDate?: Date
): boolean {
  if (minDate && date < minDate) {
    throw new ValidationError(`Date must be after ${minDate.toISOString()}`);
  }
  
  if (maxDate && date > maxDate) {
    throw new ValidationError(`Date must be before ${maxDate.toISOString()}`);
  }
  
  return true;
}

/**
 * Validates email format
 * @param email The email to validate
 * @returns True if valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
  return true;
}

/**
 * Validates phone number format (basic validation)
 * @param phone The phone number to validate
 * @returns True if valid
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError("Invalid phone number format");
  }
  return true;
}

/**
 * Validates that a number is positive
 * @param value The number to validate
 * @param fieldName The field name for error messages
 * @returns True if valid
 */
export function validatePositive(value: number, fieldName: string): boolean {
  if (value <= 0) {
    throw new ValidationError(`${fieldName} must be positive`);
  }
  return true;
}

/**
 * Validates that a number is non-negative
 * @param value The number to validate
 * @param fieldName The field name for error messages
 * @returns True if valid
 */
export function validateNonNegative(value: number, fieldName: string): boolean {
  if (value < 0) {
    throw new ValidationError(`${fieldName} cannot be negative`);
  }
  return true;
}

/**
 * Validates file upload constraints
 * @param file The file to validate
 * @param options Validation options
 * @returns True if valid
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    required?: boolean;
  } = {}
): boolean {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [], required = false } = options;
  
  if (!file) {
    if (required) {
      throw new ValidationError("File is required");
    }
    return true;
  }
  
  if (file.size > maxSize) {
    throw new ValidationError(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new ValidationError(`File type ${file.type} is not allowed`);
  }
  
  return true;
}

// =============================================================================
// MIDDLEWARE COMBINATIONS
// =============================================================================

/**
 * Validates both body and sanitizes it
 * @param schema The Zod schema for validation
 * @returns Function that validates and sanitizes body
 */
export async function validateAndSanitizeBody<T>(
  schema: z.ZodSchema<T>,
  request: NextRequest
): Promise<T> {
  const sanitizedBody = await sanitizeBody(request);
  return validateRequest(schema, sanitizedBody);
}

/**
 * Validates query parameters and applies default values
 * @param schema The Zod schema for validation
 * @param defaults Default values to apply
 * @returns Function that validates and returns query params with defaults
 */
export function validateQueryWithDefaults<T>(
  schema: z.ZodSchema<T>,
  defaults: Partial<T>,
  request: NextRequest
): T {
  const query = validateQuery(schema, request);
  return { ...defaults, ...query } as T;
}