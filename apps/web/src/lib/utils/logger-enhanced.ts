/**
 * Enhanced Logging System for TBAT Mock Exam Platform
 * Supports multiple providers: DataDog, CloudWatch, LogTail, Console
 */

import type { NextRequest } from "next/server"

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

// Log context interface
export interface LogContext {
  timestamp: string
  level: LogLevel
  message: string
  component?: string
  operation?: string
  userId?: string
  sessionId?: string
  requestId?: string
  ip?: string
  userAgent?: string
  error?: any
  stack?: string
  metadata?: Record<string, any>
}

// Abstract logger interface
interface ILogger {
  log(context: LogContext): Promise<void>
  flush?(): Promise<void>
}

/**
 * Console Logger (Default/Development)
 */
class ConsoleLogger implements ILogger {
  async log(context: LogContext): Promise<void> {
    const color = this.getColor(context.level)
    const reset = '\x1b[0m'
    
    const logMessage = `${color}[${context.level}]${reset} ${context.timestamp} - ${context.message}`
    const logData = {
      ...context,
      timestamp: undefined,
      level: undefined,
      message: undefined
    }
    
    // Remove undefined values
    Object.keys(logData).forEach(key => 
      logData[key] === undefined && delete logData[key]
    )
    
    switch (context.level) {
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(logMessage, logData)
        break
      case LogLevel.WARN:
        console.warn(logMessage, logData)
        break
      case LogLevel.DEBUG:
        console.debug(logMessage, logData)
        break
      default:
        console.log(logMessage, logData)
    }
  }
  
  private getColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '\x1b[36m' // Cyan
      case LogLevel.INFO: return '\x1b[32m'  // Green
      case LogLevel.WARN: return '\x1b[33m'  // Yellow
      case LogLevel.ERROR: return '\x1b[31m' // Red
      case LogLevel.FATAL: return '\x1b[35m' // Magenta
      default: return '\x1b[0m'
    }
  }
}

/**
 * DataDog Logger
 */
class DataDogLogger implements ILogger {
  private apiKey: string
  private site: string
  private buffer: LogContext[] = []
  private flushInterval: NodeJS.Timeout | null = null
  
  constructor(apiKey: string, site: string = 'datadoghq.com') {
    this.apiKey = apiKey
    this.site = site
    
    // Auto-flush every 5 seconds
    this.flushInterval = setInterval(() => {
      this.flush()
    }, 5000)
  }
  
  async log(context: LogContext): Promise<void> {
    this.buffer.push(context)
    
    // Flush if buffer is getting large
    if (this.buffer.length >= 100) {
      await this.flush()
    }
  }
  
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return
    
    const logs = this.buffer.splice(0, this.buffer.length)
    
    try {
      const response = await fetch(`https://http-intake.logs.${this.site}/api/v2/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': this.apiKey
        },
        body: JSON.stringify(logs.map(log => ({
          ddsource: 'nodejs',
          ddtags: `env:${process.env.NODE_ENV},service:tbat-exam`,
          hostname: process.env.HOSTNAME || 'unknown',
          service: 'tbat-exam-platform',
          ...log
        })))
      })
      
      if (!response.ok) {
        console.error('[DataDog] Failed to send logs:', response.statusText)
      }
    } catch (error) {
      console.error('[DataDog] Error sending logs:', error)
    }
  }
  
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flush()
  }
}

/**
 * CloudWatch Logger (AWS)
 */
class CloudWatchLogger implements ILogger {
  private logGroupName: string
  private logStreamName: string
  private buffer: LogContext[] = []
  
  constructor(logGroupName: string, logStreamName: string) {
    this.logGroupName = logGroupName
    this.logStreamName = logStreamName
    
    // Note: In production, you'd use AWS SDK
    // This is a simplified implementation
  }
  
  async log(context: LogContext): Promise<void> {
    // In production, use AWS SDK CloudWatchLogs client
    // For now, we'll just buffer and log
    this.buffer.push(context)
    
    if (this.buffer.length >= 50) {
      await this.flush()
    }
  }
  
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return
    
    const logs = this.buffer.splice(0, this.buffer.length)
    
    // In production:
    // const client = new CloudWatchLogsClient({ region: process.env.AWS_REGION })
    // await client.send(new PutLogEventsCommand({
    //   logGroupName: this.logGroupName,
    //   logStreamName: this.logStreamName,
    //   logEvents: logs.map(log => ({
    //     message: JSON.stringify(log),
    //     timestamp: Date.now()
    //   }))
    // }))
    
    console.log('[CloudWatch] Would send logs:', logs.length)
  }
}

/**
 * LogTail Logger (BetterStack)
 */
class LogTailLogger implements ILogger {
  private sourceToken: string
  private buffer: LogContext[] = []
  
  constructor(sourceToken: string) {
    this.sourceToken = sourceToken
  }
  
  async log(context: LogContext): Promise<void> {
    try {
      await fetch('https://in.logtail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sourceToken}`
        },
        body: JSON.stringify({
          dt: context.timestamp,
          level: context.level.toLowerCase(),
          message: context.message,
          ...context
        })
      })
    } catch (error) {
      console.error('[LogTail] Error sending log:', error)
    }
  }
  
  async flush(): Promise<void> {
    // LogTail sends immediately, no buffer to flush
  }
}

/**
 * Multi-Logger (sends to multiple providers)
 */
class MultiLogger implements ILogger {
  private loggers: ILogger[] = []
  
  addLogger(logger: ILogger): void {
    this.loggers.push(logger)
  }
  
  async log(context: LogContext): Promise<void> {
    await Promise.all(
      this.loggers.map(logger => 
        logger.log(context).catch(err => 
          console.error('Logger error:', err)
        )
      )
    )
  }
  
  async flush(): Promise<void> {
    await Promise.all(
      this.loggers.map(logger => 
        logger.flush?.().catch(err => 
          console.error('Logger flush error:', err)
        )
      )
    )
  }
}

/**
 * Logger Factory
 */
class LoggerFactory {
  private static instance: ILogger | null = null
  
  static getLogger(): ILogger {
    if (!this.instance) {
      this.instance = this.createLogger()
    }
    return this.instance
  }
  
  private static createLogger(): ILogger {
    const multiLogger = new MultiLogger()
    
    // Always include console logger in development
    if (process.env.NODE_ENV !== 'production') {
      multiLogger.addLogger(new ConsoleLogger())
    }
    
    // Add DataDog if configured
    if (process.env.DATADOG_API_KEY) {
      multiLogger.addLogger(
        new DataDogLogger(
          process.env.DATADOG_API_KEY,
          process.env.DATADOG_SITE
        )
      )
    }
    
    // Add CloudWatch if configured
    if (process.env.AWS_REGION && process.env.CLOUDWATCH_LOG_GROUP) {
      multiLogger.addLogger(
        new CloudWatchLogger(
          process.env.CLOUDWATCH_LOG_GROUP,
          process.env.CLOUDWATCH_LOG_STREAM || 'default'
        )
      )
    }
    
    // Add LogTail if configured
    if (process.env.LOGTAIL_SOURCE_TOKEN) {
      multiLogger.addLogger(
        new LogTailLogger(process.env.LOGTAIL_SOURCE_TOKEN)
      )
    }
    
    // Fallback to console if no logger is configured
    if ((multiLogger as any).loggers.length === 0) {
      multiLogger.addLogger(new ConsoleLogger())
    }
    
    return multiLogger
  }
}

/**
 * Main logging functions
 */
const logger = LoggerFactory.getLogger()

export async function logDebug(
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logger.log({
    timestamp: new Date().toISOString(),
    level: LogLevel.DEBUG,
    message,
    metadata
  })
}

export async function logInfo(
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logger.log({
    timestamp: new Date().toISOString(),
    level: LogLevel.INFO,
    message,
    metadata
  })
}

export async function logWarn(
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logger.log({
    timestamp: new Date().toISOString(),
    level: LogLevel.WARN,
    message,
    metadata
  })
}

export async function logError(
  message: string,
  error?: any,
  metadata?: Record<string, any>
): Promise<void> {
  await logger.log({
    timestamp: new Date().toISOString(),
    level: LogLevel.ERROR,
    message,
    error: error?.message || error,
    stack: error?.stack,
    metadata
  })
}

export async function logFatal(
  message: string,
  error?: any,
  metadata?: Record<string, any>
): Promise<void> {
  await logger.log({
    timestamp: new Date().toISOString(),
    level: LogLevel.FATAL,
    message,
    error: error?.message || error,
    stack: error?.stack,
    metadata
  })
}

/**
 * Request logging helper
 */
export async function logRequest(
  request: NextRequest,
  component: string,
  operation: string,
  metadata?: Record<string, any>
): Promise<void> {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const ip = xForwardedFor ? xForwardedFor.split(',')[0] : 'localhost'
  
  await logger.log({
    timestamp: new Date().toISOString(),
    level: LogLevel.INFO,
    message: `${request.method} ${request.url}`,
    component,
    operation,
    ip,
    userAgent: request.headers.get('user-agent') || undefined,
    requestId: request.headers.get('x-request-id') || undefined,
    metadata
  })
}

/**
 * API error logging helper
 */
export async function logApiError(
  message: string,
  request: NextRequest,
  error: any,
  metadata?: Record<string, any>
): Promise<void> {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const ip = xForwardedFor ? xForwardedFor.split(',')[0] : 'localhost'
  
  await logger.log({
    timestamp: new Date().toISOString(),
    level: LogLevel.ERROR,
    message,
    component: 'API',
    operation: metadata?.operation || 'unknown',
    ip,
    userAgent: request.headers.get('user-agent') || undefined,
    error: error?.message || error,
    stack: error?.stack,
    metadata
  })
}

/**
 * Performance logging helper
 */
export async function logPerformance(
  operation: string,
  duration: number,
  metadata?: Record<string, any>
): Promise<void> {
  const level = duration > 1000 ? LogLevel.WARN : LogLevel.INFO
  
  await logger.log({
    timestamp: new Date().toISOString(),
    level,
    message: `Performance: ${operation} took ${duration}ms`,
    component: 'Performance',
    operation,
    metadata: {
      duration,
      ...metadata
    }
  })
}

// Flush logs on process exit
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    logger.flush?.()
  })
  
  process.on('SIGINT', () => {
    logger.flush?.()
    process.exit(0)
  })
  
  process.on('SIGTERM', () => {
    logger.flush?.()
    process.exit(0)
  })
}

export default {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError,
  fatal: logFatal,
  request: logRequest,
  apiError: logApiError,
  performance: logPerformance
}