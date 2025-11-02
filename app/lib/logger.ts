// =============================================================================
// LOGGER TYPES
// =============================================================================

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  userId?: string;
  requestId?: string;
  method?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  duration?: number;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  stack?: string;
}

// =============================================================================
// LOGGER CLASS
// =============================================================================

export class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  /**
   * Log debug message
   */
  debug(message: string, context: LogContext = {}): void {
    this.log("debug", message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context: LogContext = {}): void {
    this.log("info", message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context: LogContext = {}): void {
    this.log("warn", message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | LogContext): void {
    let context: LogContext = {};
    let stack: string | undefined;

    if (error instanceof Error) {
      context = { errorName: error.name, errorMessage: error.message };
      stack = error.stack;
    } else if (error) {
      context = error;
    }

    this.log("error", message, context, stack);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    stack?: string
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
      stack,
    };

    // Redact sensitive information
    this.redactSensitiveData(logEntry);

    // Output based on environment
    if (process.env.NODE_ENV === "production") {
      // JSON format for log aggregation
      console.log(JSON.stringify(logEntry));
    } else {
      // Pretty format for development
      this.prettyPrint(logEntry);
    }
  }

  /**
   * Pretty print log entry for development
   */
  private prettyPrint(entry: LogEntry): void {
    const { timestamp, level, message, context, stack } = entry;
    const levelColors = {
      debug: "\x1b[36m", // Cyan
      info: "\x1b[32m",  // Green
      warn: "\x1b[33m",  // Yellow
      error: "\x1b[31m", // Red
    };
    const reset = "\x1b[0m";

    const color = levelColors[level];
    const contextStr = context && Object.keys(context).length > 0
      ? `\n  Context: ${JSON.stringify(context, null, 2)}`
      : "";
    const stackStr = stack ? `\n  Stack: ${stack}` : "";

    console.log(
      `${color}[${timestamp}] ${level.toUpperCase()}${reset} ${message}${contextStr}${stackStr}`
    );
  }

  /**
   * Redact sensitive information from log entries
   */
  private redactSensitiveData(entry: LogEntry): void {
    if (!entry.context) return;

    const sensitiveKeys = [
      "password",
      "token",
      "secret",
      "key",
      "authorization",
      "cookie",
      "session",
      "creditCard",
      "ssn",
      "socialSecurityNumber",
      "bankAccount",
    ];

    const redactValue = (obj: any): any => {
      if (typeof obj !== "object" || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(redactValue);
      }

      const redacted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
          redacted[key] = "[REDACTED]";
        } else if (typeof value === "object") {
          redacted[key] = redactValue(value);
        } else {
          redacted[key] = value;
        }
      }
      return redacted;
    };

    entry.context = redactValue(entry.context);
  }

  /**
   * Create child logger with additional context
   */
  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }

  /**
   * Create timer for performance measurement
   */
  timer(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.debug(`Timer: ${label}`, { duration });
    };
  }
}

// =============================================================================
// DEFAULT LOGGER INSTANCE
// =============================================================================

export const logger = new Logger();

// =============================================================================
// REQUEST LOGGER
// =============================================================================

export class RequestLogger {
  private logger: Logger;
  private startTime: number;

  constructor(requestId: string, context: LogContext = {}) {
    this.logger = logger.child({ requestId, ...context });
    this.startTime = Date.now();
  }

  /**
   * Log incoming request
   */
  request(method: string, url: string, headers: Record<string, string>): void {
    this.logger.info("Incoming request", {
      method,
      url,
      userAgent: headers["user-agent"],
      ip: headers["x-forwarded-for"] || headers["x-real-ip"],
    });
  }

  /**
   * Log successful response
   */
  response(statusCode: number, responseSize?: number): void {
    const duration = Date.now() - this.startTime;
    this.logger.info("Request completed", {
      statusCode,
      responseSize,
      duration,
    });
  }

  /**
   * Log error response
   */
  error(error: Error | string, statusCode?: number): void {
    const duration = Date.now() - this.startTime;
    const errorMessage = error instanceof Error ? error.message : error;
    this.logger.error("Request failed", {
      error: errorMessage,
      statusCode,
      duration,
    });
  }

  /**
   * Get child logger with request context
   */
  getLogger(): Logger {
    return this.logger;
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a logger with specific context
 */
export function createLogger(context: LogContext): Logger {
  return new Logger(context);
}

/**
 * Create a request logger
 */
export function createRequestLogger(
  requestId: string,
  context: LogContext = {}
): RequestLogger {
  return new RequestLogger(requestId, context);
}

// =============================================================================
// PERFORMANCE LOGGING
// =============================================================================

/**
 * Log database query performance
 */
export function logQuery(
  query: string,
  duration: number,
  context: LogContext = {}
): void {
  logger.debug("Database query", {
    query: query.substring(0, 100), // Truncate long queries
    duration,
    ...context,
  });
}

/**
 * Log external API call performance
 */
export function logExternalApiCall(
  service: string,
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  context: LogContext = {}
): void {
  const level = statusCode >= 400 ? "warn" : "debug";
  logger[level]("External API call", {
    service,
    endpoint,
    method,
    statusCode,
    duration,
    ...context,
  });
}

/**
 * Log user action
 */
export function logUserAction(
  userId: string,
  action: string,
  resource: string,
  context: LogContext = {}
): void {
  logger.info("User action", {
    userId,
    action,
    resource,
    ...context,
  });
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  severity: "low" | "medium" | "high" | "critical",
  context: LogContext = {}
): void {
  const level = severity === "critical" || severity === "high" ? "error" : "warn";
  logger[level](`Security event: ${event}`, {
    securityEvent: event,
    severity,
    ...context,
  });
}

// =============================================================================
// BUSINESS METRICS
// =============================================================================

/**
 * Log business metrics
 */
export function logMetric(
  name: string,
  value: number,
  unit: string,
  context: LogContext = {}
): void {
  logger.info("Metric", {
    metricName: name,
    metricValue: value,
    metricUnit: unit,
    ...context,
  });
}

/**
 * Log AI service usage
 */
export function logAIUsage(
  service: string,
  model: string,
  tokens: number,
  cost: number,
  context: LogContext = {}
): void {
  logger.info("AI service usage", {
    service,
    model,
    tokens,
    cost,
    ...context,
  });
}

// =============================================================================
// ERROR LOGGING
// =============================================================================

/**
 * Log error with full context
 */
export function logError(
  error: Error,
  context: LogContext = {},
  message?: string
): void {
  logger.error(message || error.message, {
    errorName: error.name,
    errorMessage: error.message,
    stack: error.stack,
    ...context,
  });
}

/**
 * Log unhandled promise rejection
 */
export function logUnhandledRejection(reason: unknown): void {
  logger.error("Unhandled promise rejection", {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
}

/**
 * Log uncaught exception
 */
export function logUncaughtException(error: Error): void {
  logger.error("Uncaught exception", {
    errorName: error.name,
    errorMessage: error.message,
    stack: error.stack,
  });
}

// =============================================================================
// GLOBAL ERROR HANDLERS
// =============================================================================

// Set up global error handlers if in Node.js environment
if (typeof process !== "undefined") {
  process.on("unhandledRejection", (reason) => {
    logUnhandledRejection(reason);
  });

  process.on("uncaughtException", (error) => {
    logUncaughtException(error);
    // Give logger time to write before exiting
    setTimeout(() => process.exit(1), 1000);
  });
}

// =============================================================================
// EXPORTS
// =============================================================================

export { Logger as default };