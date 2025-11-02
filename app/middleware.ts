import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { logger } from "@/lib/logger";

// Security headers to add to all responses
const securityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-XSS-Protection": "1; mode=block",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.anthropic.com https://api.stripe.com",
    "frame-ancestors 'none'",
  ].join("; "),
};

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  // Add request ID to headers for tracing
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  // Log incoming request
  logger.info("Incoming request", {
    requestId,
    method: request.method,
    url: request.url,
    userAgent: request.headers.get("user-agent"),
    ip: request.ip,
  });

  // Create response with security headers
  const response = NextResponse.next({
    headers: requestHeaders,
  });

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Handle API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return await handleApiRoutes(request, response, requestId, startTime);
  }

  // Handle authentication routes
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    return handleAuthRoutes(request, response);
  }

  // Handle protected routes
  if (isProtectedRoute(request.nextUrl.pathname)) {
    return await handleProtectedRoutes(request, response);
  }

  return response;
}

// Handle API route middleware
async function handleApiRoutes(
  request: NextRequest,
  response: NextResponse,
  requestId: string,
  startTime: number
) {
  try {
    // Add CORS headers for API routes
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    // Add rate limiting headers (simplified)
    const rateLimit = 100; // requests per minute
    const remaining = Math.max(0, rateLimit - 1);
    response.headers.set("X-RateLimit-Limit", rateLimit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());

    return response;
  } catch (error) {
    logger.error("API middleware error", {
      requestId,
      error,
      duration: Date.now() - startTime,
    });
    return response;
  }
}

// Handle authentication routes
function handleAuthRoutes(request: NextRequest, response: NextResponse) {
  // Add cache control for auth pages
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

// Handle protected routes
async function handleProtectedRoutes(request: NextRequest, response: NextResponse) {
  try {
    // Get auth token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If no token and accessing protected route, redirect to sign in
    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Add user context headers
    response.headers.set("x-user-id", token.sub || "");
    response.headers.set("x-user-role", token.role || "");

    return response;
  } catch (error) {
    logger.error("Protected route middleware error", { error });
    // On error, redirect to sign in
    const signInUrl = new URL("/auth/signin", request.url);
    return NextResponse.redirect(signInUrl);
  }
}

// Check if route is protected
function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    "/dashboard",
    "/tenants",
    "/payments",
    "/maintenance",
    "/buildings",
    "/units",
    "/reports",
    "/settings",
    "/profile",
  ];

  return protectedRoutes.some(route => pathname.startsWith(route));
}

// Middleware configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health check endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/health|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
