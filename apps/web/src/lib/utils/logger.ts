/**
 * Centralized logging utility for TBAT Mock Exam Platform
 * Replaces console.error usage throughout the application
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

export interface LogContext {
  timestamp: string
  ip?: string
  userAgent?: string | null
  userId?: string
  component?: string
  operation?: string
  [key: string]: any
}

export class Logger {
  private static instance: Logger
  private isDevelopment = process.env.NODE_ENV === 'development'

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const logContext = { timestamp, ...context }
    
    return JSON.stringify({
      level: level.toUpperCase(),
      message,
      context: logContext
    })
  }

  public error(message: string, error?: Error | unknown, context?: Partial<LogContext>): void {
    const errorContext: LogContext = {
      timestamp: new Date().toISOString(),
      ...context
    }

    if (error instanceof Error) {
      errorContext.error = error.message
      errorContext.stack = error.stack
    } else if (error) {
      errorContext.error = String(error)
    }

    // In development, use console for immediate feedback
    // In production, this would go to your logging service
    if (this.isDevelopment) {
      console.error(this.formatMessage('error', message, errorContext))
    } else {
      // In production: send to external logging service
      // For now, still use console but in structured format
      console.error(this.formatMessage('error', message, errorContext))
    }
  }

  public warn(message: string, context?: Partial<LogContext>): void {
    const logContext: LogContext = {
      timestamp: new Date().toISOString(),
      ...context
    }

    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message, logContext))
    }
  }

  public info(message: string, context?: Partial<LogContext>): void {
    const logContext: LogContext = {
      timestamp: new Date().toISOString(),
      ...context
    }

    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message, logContext))
    }
  }

  public debug(message: string, context?: Partial<LogContext>): void {
    if (!this.isDevelopment) return

    const logContext: LogContext = {
      timestamp: new Date().toISOString(),
      ...context
    }

    console.debug(this.formatMessage('debug', message, logContext))
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Helper function for API route error logging
export function logApiError(
  message: string,
  error: Error | unknown,
  request: Request,
  additionalContext?: Record<string, any>
): void {
  const context: Partial<LogContext> = {
    component: 'API',
    operation: `${request.method} ${new URL(request.url).pathname}`,
    userAgent: request.headers.get('user-agent'),
    ...additionalContext
  }

  logger.error(message, error, context)
}