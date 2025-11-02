/**
 * Global Error Handler Middleware
 * 
 * Features:
 * - Centralized error handling
 * - Error logging
 * - Error categorization
 * - User-friendly error messages
 * - Error reporting
 * - Performance monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { DatabaseError, ExternalServiceError, ValidationError, AuthenticationError, AuthorizationError } from '@/lib/errors';

/**
 * Error Handler Class
 */
export class ErrorHandler {
  /**
   * Handle API errors
   */
  static handleAPIError(error: Error, request: NextRequest): NextResponse {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();
    
    // Log error details
    logger.error('API Error', {
      requestId,
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      timestamp
    });

    // Categorize error and return appropriate response
    if (error instanceof DatabaseError) {
      return this.handleDatabaseError(error, requestId);
    }
    
    if (error instanceof ExternalServiceError) {
      return this.handleExternalServiceError(error, requestId);
    }
    
    if (error instanceof ValidationError) {
      return this.handleValidationError(error, requestId);
    }
    
    if (error instanceof AuthenticationError) {
      return this.handleAuthenticationError(error, requestId);
    }
    
    if (error instanceof AuthorizationError) {
      return this.handleAuthorizationError(error, requestId);
    }

    // Handle unknown errors
    return this.handleUnknownError(error, requestId);
  }

  /**
   * Handle database errors
   */
  private static handleDatabaseError(error: DatabaseError, requestId: string): NextResponse {
    logger.error('Database error', {
      requestId,
      error: error.message,
      operation: error.operation,
      table: error.table
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Database Error',
        message: 'A database operation failed. Please try again.',
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }

  /**
   * Handle external service errors
   */
  private static handleExternalServiceError(error: ExternalServiceError, requestId: string): NextResponse {
    logger.error('External service error', {
      requestId,
      error: error.message,
      service: error.service,
      operation: error.operation
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Service Unavailable',
        message: 'An external service is temporarily unavailable. Please try again later.',
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }

  /**
   * Handle validation errors
   */
  private static handleValidationError(error: ValidationError, requestId: string): NextResponse {
    logger.warn('Validation error', {
      requestId,
      error: error.message,
      field: error.field,
      value: error.value
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Validation Error',
        message: error.message,
        field: error.field,
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  /**
   * Handle authentication errors
   */
  private static handleAuthenticationError(error: AuthenticationError, requestId: string): NextResponse {
    logger.warn('Authentication error', {
      requestId,
      error: error.message,
      userId: error.userId
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Authentication Failed',
        message: 'Invalid credentials or session expired.',
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 401 }
    );
  }

  /**
   * Handle authorization errors
   */
  private static handleAuthorizationError(error: AuthorizationError, requestId: string): NextResponse {
    logger.warn('Authorization error', {
      requestId,
      error: error.message,
      userId: error.userId,
      resource: error.resource,
      action: error.action
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Access Denied',
        message: 'You do not have permission to perform this action.',
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 403 }
    );
  }

  /**
   * Handle unknown errors
   */
  private static handleUnknownError(error: Error, requestId: string): NextResponse {
    logger.error('Unknown error', {
      requestId,
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred. Please try again.',
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }

  /**
   * Handle client-side errors
   */
  static handleClientError(error: Error, context: string): void {
    logger.error('Client error', {
      error: error.message,
      stack: error.stack,
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString()
    });

    // Report error to monitoring service
    this.reportError(error, context, 'client');
  }

  /**
   * Handle service worker errors
   */
  static handleServiceWorkerError(error: Error, context: string): void {
    logger.error('Service worker error', {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });

    // Report error to monitoring service
    this.reportError(error, context, 'service-worker');
  }

  /**
   * Report error to monitoring service
   */
  private static reportError(error: Error, context: string, source: string): void {
    try {
      // This would typically send to a monitoring service like Sentry, LogRocket, etc.
      const errorReport = {
        message: error.message,
        stack: error.stack,
        context,
        source,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      };

      // Send to monitoring service
      if (typeof window !== 'undefined' && window.fetch) {
        fetch('/api/errors/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorReport)
        }).catch(reportError => {
          logger.error('Failed to report error', { reportError });
        });
      }
    } catch (reportingError) {
      logger.error('Failed to create error report', { reportingError });
    }
  }

  /**
   * Generate unique request ID
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle rate limiting errors
   */
  static handleRateLimitError(request: NextRequest): NextResponse {
    const requestId = this.generateRequestId();
    
    logger.warn('Rate limit exceeded', {
      requestId,
      ip: request.ip || request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
      url: request.url,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Rate Limit Exceeded',
        message: 'Too many requests. Please try again later.',
        requestId,
        retryAfter: 60, // seconds
        timestamp: new Date().toISOString()
      },
      { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
        }
      }
    );
  }

  /**
   * Handle timeout errors
   */
  static handleTimeoutError(operation: string, timeout: number): NextResponse {
    const requestId = this.generateRequestId();
    
    logger.error('Operation timeout', {
      requestId,
      operation,
      timeout,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Request Timeout',
        message: `Operation '${operation}' timed out after ${timeout}ms. Please try again.`,
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 408 }
    );
  }

  /**
   * Handle validation errors for forms
   */
  static handleFormValidationError(errors: Record<string, string[]>): NextResponse {
    const requestId = this.generateRequestId();
    
    logger.warn('Form validation failed', {
      requestId,
      errors,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Validation Failed',
        message: 'Please correct the following errors:',
        errors,
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  /**
   * Handle file upload errors
   */
  static handleFileUploadError(error: string, fileName?: string, fileSize?: number): NextResponse {
    const requestId = this.generateRequestId();
    
    logger.error('File upload failed', {
      requestId,
      error,
      fileName,
      fileSize,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: false,
        error: 'File Upload Failed',
        message: error,
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  /**
   * Handle WebSocket errors
   */
  static handleWebSocketError(error: Error, clientId: string): void {
    logger.error('WebSocket error', {
      clientId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Report to monitoring service
    this.reportError(error, `websocket-${clientId}`, 'websocket');
  }
}

/**
 * Error boundary for React components
 */
export class ErrorBoundary {
  static handleComponentError(error: Error, errorInfo: any): void {
    logger.error('React component error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // Report error to monitoring service
    ErrorHandler.reportError(error, 'react-component', 'client');
  }
}

/**
 * Global error handlers
 */
export const globalErrorHandlers = {
  /**
   * Handle uncaught exceptions
   */
  uncaughtException: (error: Error) => {
    logger.error('Uncaught exception', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Report to monitoring service
    ErrorHandler.reportError(error, 'uncaught-exception', 'server');
  },

  /**
   * Handle unhandled promise rejections
   */
  unhandledRejection: (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled promise rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      timestamp: new Date().toISOString()
    });

    // Report to monitoring service
    ErrorHandler.reportError(
      new Error(reason?.message || 'Unhandled promise rejection'),
      'unhandled-rejection',
      'server'
    );
  }
};

export default ErrorHandler;
