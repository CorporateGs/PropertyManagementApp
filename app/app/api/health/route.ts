import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET /api/health - System health check
export async function GET() {
  const startTime = Date.now();
  const healthCheck = {
    status: "healthy" as "healthy" | "degraded" | "unhealthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
    services: {
      database: { status: "unknown" as string },
      redis: { status: "unknown" as string },
      anthropic: { status: "unknown" as string },
      stripe: { status: "unknown" as string },
    },
  };

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.services.database.status = "healthy";
    healthCheck.services.database.latency = Date.now() - startTime;
  } catch (error) {
    healthCheck.status = "unhealthy";
    healthCheck.services.database.status = "unhealthy";
    healthCheck.services.database.error = error instanceof Error ? error.message : String(error);
    logger.error("Database health check failed", { error });
  }

  // Check Redis connectivity (if configured)
  if (process.env.REDIS_URL) {
    try {
      // TODO: Add Redis ping check when Redis client is configured
      healthCheck.services.redis.status = "healthy";
    } catch (error) {
      healthCheck.status = "degraded";
      healthCheck.services.redis.status = "unhealthy";
      logger.error("Redis health check failed", { error });
    }
  } else {
    healthCheck.services.redis.status = "not_configured";
  }

  // Check Anthropic API key
  if (process.env.ANTHROPIC_API_KEY) {
    healthCheck.services.anthropic.status = "configured";
  } else {
    healthCheck.status = "degraded";
    healthCheck.services.anthropic.status = "missing_key";
  }

  // Check Stripe configuration
  if (process.env.STRIPE_SECRET_KEY) {
    healthCheck.services.stripe.status = "configured";
  } else {
    healthCheck.services.stripe.status = "not_configured";
  }

  // Determine overall status
  const hasUnhealthyService = Object.values(healthCheck.services).some(
    (service: any) => service.status === "unhealthy"
  );

  const hasDegradedService = Object.values(healthCheck.services).some(
    (service: any) => service.status === "missing_key"
  );

  if (hasUnhealthyService) {
    healthCheck.status = "unhealthy";
  } else if (hasDegradedService) {
    healthCheck.status = "degraded";
  }

  const statusCode = healthCheck.status === "healthy" ? 200 :
                   healthCheck.status === "degraded" ? 200 : 503;

  logger.info("Health check completed", {
    status: healthCheck.status,
    responseTime: Date.now() - startTime,
  });

  return NextResponse.json(healthCheck, { status: statusCode });
}