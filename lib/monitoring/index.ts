import { logger } from '@/lib/logger';

// Performance monitoring
export class PerformanceMonitor {
  private metrics = new Map<string, { count: number; totalTime: number; lastAccess: number }>();

  startTimer(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.recordMetric(name, duration);
    };
  }

  recordMetric(name: string, duration: number): void {
    const existing = this.metrics.get(name);

    if (existing) {
      existing.count++;
      existing.totalTime += duration;
      existing.lastAccess = Date.now();
    } else {
      this.metrics.set(name, {
        count: 1,
        totalTime: duration,
        lastAccess: Date.now(),
      });
    }
  }

  getMetrics(): Record<string, { count: number; averageTime: number; lastAccess: number }> {
    const result: Record<string, any> = {};

    for (const [name, metric] of this.metrics) {
      result[name] = {
        count: metric.count,
        averageTime: metric.totalTime / metric.count,
        lastAccess: metric.lastAccess,
      };
    }

    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Database query monitoring
export function trackDatabaseQuery(query: string, duration: number, success: boolean = true): void {
  logger.debug('Database query executed', {
    query: query.substring(0, 100), // Truncate long queries
    duration,
    success,
    queryType: getQueryType(query),
  });

  // Track slow queries
  if (duration > 1000) { // Queries slower than 1 second
    logger.warn('Slow database query detected', {
      query: query.substring(0, 100),
      duration,
      threshold: 1000,
    });
  }
}

function getQueryType(query: string): string {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.startsWith('select')) return 'SELECT';
  if (normalizedQuery.startsWith('insert')) return 'INSERT';
  if (normalizedQuery.startsWith('update')) return 'UPDATE';
  if (normalizedQuery.startsWith('delete')) return 'DELETE';
  if (normalizedQuery.startsWith('create')) return 'CREATE';
  if (normalizedQuery.startsWith('alter')) return 'ALTER';
  if (normalizedQuery.startsWith('drop')) return 'DROP';

  return 'UNKNOWN';
}

// API endpoint monitoring
export function trackApiLatency(endpoint: string, method: string, duration: number, statusCode: number): void {
  const level = statusCode >= 400 ? 'warn' : 'debug';

  logger.log(level, 'API endpoint called', {
    endpoint,
    method,
    duration,
    statusCode,
  });

  // Track slow endpoints
  if (duration > 5000) { // Endpoints slower than 5 seconds
    logger.warn('Slow API endpoint detected', {
      endpoint,
      method,
      duration,
      statusCode,
      threshold: 5000,
    });
  }
}

// External API monitoring
export function trackExternalApiCall(
  service: string,
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  success: boolean = statusCode < 400
): void {
  const level = success ? 'debug' : 'warn';

  logger.log(level, 'External API call', {
    service,
    endpoint,
    method,
    statusCode,
    duration,
    success,
  });

  // Track failed external calls
  if (!success) {
    logger.error('External API call failed', {
      service,
      endpoint,
      method,
      statusCode,
      duration,
    });
  }
}

// Business metrics tracking
export function trackUserAction(
  userId: string,
  action: string,
  resource: string,
  metadata?: Record<string, any>
): void {
  logger.info('User action performed', {
    userId,
    action,
    resource,
    ...metadata,
  });
}

export function trackConversion(
  event: string,
  value: number,
  userId?: string,
  metadata?: Record<string, any>
): void {
  logger.info('Conversion event tracked', {
    event,
    value,
    userId,
    ...metadata,
  });
}

export function trackAIUsage(
  service: string,
  model: string,
  tokens: number,
  cost: number,
  userId?: string
): void {
  logger.info('AI service usage tracked', {
    service,
    model,
    tokens,
    cost,
    userId,
  });
}

// Error monitoring
export function captureException(
  error: Error,
  context?: Record<string, any>
): void {
  logger.error('Exception captured for monitoring', {
    errorName: error.name,
    errorMessage: error.message,
    stack: error.stack,
    ...context,
  });

  // TODO: Send to external monitoring service (Sentry, DataDog, etc.)
  // if (config.monitoring.sentry.enabled) {
  //   Sentry.captureException(error, { extra: context });
  // }
}

export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
): void {
  logger.log(level, 'Message captured for monitoring', {
    message,
    ...context,
  });
}

// Health checks
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    // TODO: Import prisma and check database connection
    // await prisma.$queryRaw`SELECT 1`;

    const latency = Date.now() - startTime;
    return { status: 'healthy', latency };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function checkExternalServices(): Promise<Record<string, {
  status: 'healthy' | 'unhealthy' | 'unknown';
  latency?: number;
  error?: string;
}>> {
  const services = ['anthropic', 'stripe', 'twilio', 'sendgrid'];
  const results: Record<string, any> = {};

  for (const service of services) {
    const startTime = Date.now();

    try {
      switch (service) {
        case 'anthropic':
          // TODO: Check Anthropic API health
          break;
        case 'stripe':
          // TODO: Check Stripe API health
          break;
        case 'twilio':
          // TODO: Check Twilio API health
          break;
        case 'sendgrid':
          // TODO: Check SendGrid API health
          break;
      }

      results[service] = {
        status: 'healthy' as const,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      results[service] = {
        status: 'unhealthy' as const,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return results;
}

export async function getSystemHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: Record<string, { status: string; latency?: number; error?: string }>;
}> {
  const [dbHealth, externalServices] = await Promise.all([
    checkDatabaseHealth(),
    checkExternalServices(),
  ]);

  const allServices = {
    database: dbHealth,
    ...externalServices,
  };

  // Determine overall status
  const hasUnhealthyService = Object.values(allServices).some(
    (service: any) => service.status === 'unhealthy'
  );

  const hasUnknownService = Object.values(allServices).some(
    (service: any) => service.status === 'unknown'
  );

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  if (hasUnhealthyService) {
    overallStatus = 'unhealthy';
  } else if (hasUnknownService) {
    overallStatus = 'degraded';
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: allServices,
  };
}

// Memory usage monitoring
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} {
  const usage = process.memoryUsage();

  return {
    used: Math.round(usage.heapUsed / 1024 / 1024), // MB
    total: Math.round(usage.heapTotal / 1024 / 1024), // MB
    percentage: Math.round((usage.heapUsed / usage.heapTotal) * 100),
  };
}

// CPU usage monitoring (Node.js only)
export function getCPUUsage(): {
  user: number;
  system: number;
  percentage: number;
} {
  const cpuUsage = process.cpuUsage();

  return {
    user: Math.round(cpuUsage.user / 1000), // microseconds to milliseconds
    system: Math.round(cpuUsage.system / 1000),
    percentage: Math.round((cpuUsage.user + cpuUsage.system) / 100000), // Rough percentage
  };
}

// Default performance monitor instance
export const performanceMonitor = new PerformanceMonitor();