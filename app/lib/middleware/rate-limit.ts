import { NextRequest } from "next/server";
import { RateLimitError } from "@/lib/errors";

// =============================================================================
// RATE LIMIT TYPES
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// =============================================================================
// IN-MEMORY RATE LIMIT STORE
// =============================================================================

class MemoryRateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }

    // Check if the window has expired
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return undefined;
    }

    return entry;
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  increment(key: string, options: RateLimitOptions): RateLimitEntry {
    const now = Date.now();
    let entry = this.get(key);

    if (!entry) {
      // Create new entry
      entry = {
        count: 1,
        resetTime: now + options.windowMs,
        firstRequest: now,
      };
    } else {
      // Increment existing entry
      entry.count++;
    }

    this.set(key, entry);
    return entry;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  // Clear all entries (useful for testing)
  clear(): void {
    this.store.clear();
  }

  // Get current store size (for monitoring)
  size(): number {
    return this.store.size;
  }

  // Destroy the store and cleanup interval
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global store instance
const rateLimitStore = new MemoryRateLimitStore();

// =============================================================================
// RATE LIMIT MIDDLEWARE FACTORY
// =============================================================================

/**
 * Creates a rate limiter middleware
 * @param options Rate limit options
 * @returns Middleware function that checks rate limits
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (request: NextRequest): Promise<void> => {
    const key = keyGenerator(request);
    const entry = rateLimitStore.increment(key, options);

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const resetTime = Math.ceil((entry.resetTime - Date.now()) / 1000);
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${resetTime} seconds.`
      );
    }
  };
}

// =============================================================================
// DEFAULT KEY GENERATOR
// =============================================================================

function defaultKeyGenerator(request: NextRequest): string {
  // Use IP address as default key
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown";
  return `ip:${ip}`;
}

// =============================================================================
// PRESET RATE LIMITERS
// =============================================================================

/**
 * Rate limiter for authentication endpoints (5 requests per 15 minutes)
 */
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  keyGenerator: (request) => {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown";
    return `auth:${ip}`;
  },
});

/**
 * Rate limiter for general API endpoints (100 requests per minute)
 */
export const apiRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
});

/**
 * Rate limiter for AI endpoints (10 requests per minute - AI calls are expensive)
 */
export const aiRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  keyGenerator: (request) => {
    // Try to get user ID for authenticated requests
    const userId = request.headers.get("x-user-id");
    if (userId) {
      return `ai:user:${userId}`;
    }
    
    // Fall back to IP
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown";
    return `ai:ip:${ip}`;
  },
});

/**
 * Rate limiter for file uploads (5 uploads per hour)
 */
export const uploadRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
  keyGenerator: (request) => {
    const userId = request.headers.get("x-user-id");
    if (userId) {
      return `upload:user:${userId}`;
    }
    
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown";
    return `upload:ip:${ip}`;
  },
});

/**
 * Rate limiter for password reset (3 requests per hour)
 */
export const passwordResetRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  keyGenerator: (request) => {
    const email = request.headers.get("x-email");
    if (email) {
      return `reset:email:${email}`;
    }
    
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown";
    return `reset:ip:${ip}`;
  },
});

// =============================================================================
// RATE LIMIT MIDDLEWARE FUNCTION
// =============================================================================

/**
 * Applies rate limiting to a request
 * @param request The Next.js request object
 * @param rateLimiter The rate limiter to use
 * @returns Promise that resolves if limit not exceeded
 */
export async function applyRateLimit(
  request: NextRequest,
  rateLimiter: ReturnType<typeof createRateLimiter>
): Promise<void> {
  await rateLimiter(request);
}

// =============================================================================
// RATE LIMIT HEADERS
// =============================================================================

/**
 * Adds rate limit headers to a response
 * @param response The Next.js response object
 * @param limit Maximum requests allowed
 * @param remaining Remaining requests in current window
 * @param resetTime Unix timestamp when window resets
 */
export function addRateLimitHeaders(
  response: Response,
  limit: number,
  remaining: number,
  resetTime: number
): void {
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", resetTime.toString());
}

// =============================================================================
// RATE LIMIT STATUS
// =============================================================================

/**
 * Gets current rate limit status for a key
 * @param key The rate limit key
 * @returns Rate limit status or null if not found
 */
export function getRateLimitStatus(key: string): {
  count: number;
  remaining: number;
  resetTime: number;
  resetIn: number;
} | null {
  const entry = rateLimitStore.get(key);
  if (!entry) {
    return null;
  }

  const now = Date.now();
  return {
    count: entry.count,
    remaining: Math.max(0, 100 - entry.count), // Default max of 100
    resetTime: entry.resetTime,
    resetIn: Math.max(0, Math.ceil((entry.resetTime - now) / 1000)),
  };
}

// =============================================================================
// USER-BASED RATE LIMITING
// =============================================================================

/**
 * Creates a user-based rate limiter
 * @param maxRequests Maximum requests per window
 * @param windowMs Time window in milliseconds
 * @returns Rate limiter that uses user ID
 */
export function createUserRateLimiter(
  maxRequests: number,
  windowMs: number
) {
  return createRateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (request) => {
      // Try to get user ID from request headers or session
      const userId = request.headers.get("x-user-id");
      if (userId) {
        return `user:${userId}`;
      }
      
      // Fall back to IP-based limiting
      const forwarded = request.headers.get("x-forwarded-for");
      const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown";
      return `ip:${ip}`;
    },
  });
}

// =============================================================================
// ENDPOINT-BASED RATE LIMITING
// =============================================================================

/**
 * Creates an endpoint-specific rate limiter
 * @param endpoint The endpoint name
 * @param maxRequests Maximum requests per window
 * @param windowMs Time window in milliseconds
 * @returns Rate limiter for specific endpoint
 */
export function createEndpointRateLimiter(
  endpoint: string,
  maxRequests: number,
  windowMs: number
) {
  return createRateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (request) => {
      const forwarded = request.headers.get("x-forwarded-for");
      const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown";
      return `${endpoint}:${ip}`;
    },
  });
}

// =============================================================================
// EXPORTS
// =============================================================================

export { rateLimitStore };
export type { RateLimitOptions, RateLimitEntry };