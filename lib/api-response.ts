import { NextResponse } from "next/server";
import { handleError } from "@/lib/errors";

// =============================================================================
// RESPONSE TYPES
// =============================================================================

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

export interface PaginatedResponse<T = any> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

// =============================================================================
// RESPONSE FORMATTERS
// =============================================================================

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  message?: string
): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create an error response
 */
export function errorResponse(error: unknown): ErrorResponse {
  const formattedError = handleError(error);
  return {
    success: false,
    error: {
      code: formattedError.error.code,
      message: formattedError.error.message,
      details: formattedError.error.details,
      timestamp: formattedError.error.timestamp,
    },
  };
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): PaginatedResponse<T> {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    timestamp: new Date().toISOString(),
  };
}

// =============================================================================
// PAGINATION HELPERS
// =============================================================================

/**
 * Parse pagination parameters from query
 */
export function parsePagination(query: Record<string, any>): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  total: number,
  page: number,
  limit: number
): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// =============================================================================
// NEXTRESPONSE HELPERS
// =============================================================================

/**
 * Return 200 OK response
 */
export function ok<T>(data: T, message?: string): NextResponse {
  return NextResponse.json(successResponse(data, message), { status: 200 });
}

/**
 * Return 201 Created response
 */
export function created<T>(data: T, message?: string): NextResponse {
  return NextResponse.json(successResponse(data, message), { status: 201 });
}

/**
 * Return 204 No Content response
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Return 400 Bad Request response
 */
export function badRequest(message: string, details?: any): NextResponse {
  return NextResponse.json(
    errorResponse(new Error(message)),
    { status: 400 }
  );
}

/**
 * Return 401 Unauthorized response
 */
export function unauthorized(message?: string): NextResponse {
  return NextResponse.json(
    errorResponse(new Error(message || "Authentication required")),
    { status: 401 }
  );
}

/**
 * Return 403 Forbidden response
 */
export function forbidden(message?: string): NextResponse {
  return NextResponse.json(
    errorResponse(new Error(message || "Insufficient permissions")),
    { status: 403 }
  );
}

/**
 * Return 404 Not Found response
 */
export function notFound(message?: string): NextResponse {
  return NextResponse.json(
    errorResponse(new Error(message || "Resource not found")),
    { status: 404 }
  );
}

/**
 * Return 409 Conflict response
 */
export function conflict(message: string): NextResponse {
  return NextResponse.json(
    errorResponse(new Error(message)),
    { status: 409 }
  );
}

/**
 * Return 422 Unprocessable Entity response
 */
export function unprocessableEntity(message: string, details?: any): NextResponse {
  return NextResponse.json(
    errorResponse(new Error(message)),
    { status: 422 }
  );
}

/**
 * Return 429 Too Many Requests response
 */
export function tooManyRequests(message?: string): NextResponse {
  return NextResponse.json(
    errorResponse(new Error(message || "Rate limit exceeded")),
    { status: 429 }
  );
}

/**
 * Return 500 Internal Server Error response
 */
export function serverError(error?: unknown): NextResponse {
  console.error("Server error:", error);
  return NextResponse.json(
    errorResponse(error || new Error("Internal server error")),
    { status: 500 }
  );
}

/**
 * Return 502 Bad Gateway response
 */
export function badGateway(message?: string): NextResponse {
  return NextResponse.json(
    errorResponse(new Error(message || "External service error")),
    { status: 502 }
  );
}

/**
 * Return 503 Service Unavailable response
 */
export function serviceUnavailable(message?: string): NextResponse {
  return NextResponse.json(
    errorResponse(new Error(message || "Service temporarily unavailable")),
    { status: 503 }
  );
}

// =============================================================================
// PAGINATED RESPONSE HELPERS
// =============================================================================

/**
 * Return paginated response with proper headers
 */
export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
): NextResponse {
  const pagination = calculatePagination(total, page, limit);
  const response = paginatedResponse(data, pagination);

  // Add pagination headers
  const headers = new Headers();
  headers.set("X-Total-Count", total.toString());
  headers.set("X-Page", page.toString());
  headers.set("X-Per-Page", limit.toString());
  headers.set("X-Total-Pages", pagination.totalPages.toString());
  headers.set("X-Has-Next", pagination.hasNext.toString());
  headers.set("X-Has-Prev", pagination.hasPrev.toString());

  const responseWithMessage = message
    ? { ...response, message }
    : response;

  return NextResponse.json(responseWithMessage, {
    status: 200,
    headers,
  });
}

// =============================================================================
// FILE RESPONSE HELPERS
// =============================================================================

/**
 * Return file download response
 */
export function fileDownload(
  data: ArrayBuffer | Blob,
  filename: string,
  contentType: string
): NextResponse {
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  return new NextResponse(data, {
    status: 200,
    headers,
  });
}

/**
 * Return file streaming response
 */
export function fileStream(
  stream: ReadableStream,
  filename: string,
  contentType: string
): NextResponse {
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  return new NextResponse(stream, {
    status: 200,
    headers,
  });
}

// =============================================================================
// CACHE CONTROL HELPERS
// =============================================================================

/**
 * Return response with cache headers
 */
export function withCache<T>(
  data: T,
  maxAge: number = 3600,
  message?: string
): NextResponse {
  const response = ok(data, message);
  response.headers.set(
    "Cache-Control",
    `public, max-age=${maxAge}, stale-while-revalidate=60`
  );
  return response;
}

/**
 * Return response with no-cache headers
 */
export function noCache<T>(data: T, message?: string): NextResponse {
  const response = ok(data, message);
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

// =============================================================================
// CORS HELPERS
// =============================================================================

/**
 * Return response with CORS headers
 */
export function withCors<T>(
  data: T,
  origin: string = "*",
  methods: string = "GET, POST, PUT, DELETE, OPTIONS",
  headers: string = "Content-Type, Authorization"
): NextResponse {
  const response = ok(data);
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", methods);
  response.headers.set("Access-Control-Allow-Headers", headers);
  return response;
}

/**
 * Handle CORS preflight request
 */
export function corsPreflight(
  origin: string = "*",
  methods: string = "GET, POST, PUT, DELETE, OPTIONS",
  headers: string = "Content-Type, Authorization"
): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": methods,
      "Access-Control-Allow-Headers": headers,
      "Access-Control-Max-Age": "86400",
    },
  });
}

// =============================================================================
// ERROR WRAPPER
// =============================================================================

/**
 * Wrapper to handle errors in API routes
 */
export function handleApiError(handler: () => Promise<NextResponse>): Promise<NextResponse> {
  return handler().catch((error) => {
    console.error("API Error:", error);
    return serverError(error);
  });
}

// =============================================================================
// VALIDATION ERROR HELPER
// =============================================================================

/**
 * Return validation error response
 */
export function validationError(errors: Record<string, string[]>): NextResponse {
  return NextResponse.json(
    errorResponse(new Error("Validation failed")),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

// =============================================================================
// EXPORTS
// =============================================================================
// All types and functions are already exported inline above