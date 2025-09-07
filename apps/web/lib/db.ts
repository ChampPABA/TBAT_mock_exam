import { PrismaClient } from '../generated/prisma'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Database connection monitoring interface
export interface DatabaseHealthStatus {
  connected: boolean
  latency?: number
  error?: string
  timestamp: Date
}

// Database health monitoring
export class DatabaseMonitor {
  private static lastHealthCheck: DatabaseHealthStatus | null = null
  private static healthCheckInterval: NodeJS.Timeout | null = null

  static async checkHealth(): Promise<DatabaseHealthStatus> {
    const startTime = Date.now()
    try {
      // Simple health check query
      await prisma.$queryRaw`SELECT 1`
      const latency = Date.now() - startTime
      
      const status: DatabaseHealthStatus = {
        connected: true,
        latency,
        timestamp: new Date()
      }
      
      this.lastHealthCheck = status
      return status
    } catch (error) {
      const status: DatabaseHealthStatus = {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }
      
      this.lastHealthCheck = status
      console.error('Database health check failed:', error)
      return status
    }
  }

  static getLastHealthStatus(): DatabaseHealthStatus | null {
    return this.lastHealthCheck
  }

  static startMonitoring(intervalMs: number = 30000) {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    // Initial health check
    this.checkHealth()

    // Set up periodic monitoring
    this.healthCheckInterval = setInterval(() => {
      this.checkHealth()
    }, intervalMs)

    console.log(`Database monitoring started with ${intervalMs}ms interval`)
  }

  static stopMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
      console.log('Database monitoring stopped')
    }
  }
}

const prisma = globalThis.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
})

// Start database monitoring in production
if (process.env.NODE_ENV === 'production') {
  DatabaseMonitor.startMonitoring()
} else {
  globalThis.prisma = prisma
}

export { prisma }
export default prisma