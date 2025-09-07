import { createClient } from "@vercel/edge-config"
import { prisma } from "./db"

// Initialize Edge Config client
const edgeConfig = createClient(process.env.EDGE_CONFIG)

interface SessionCapacityConfig {
  morningCapacity: number
  afternoonCapacity: number
  morningLoad: number
  afternoonLoad: number
  lastUpdated: string
}

interface CacheConfig {
  sessionCapacity: SessionCapacityConfig
  systemSettings: {
    examEnabled: boolean
    maintenanceMode: boolean
    lastUpdated: string
  }
}

// Cache keys
const CACHE_KEYS = {
  SESSION_CAPACITY: "session_capacity",
  SYSTEM_SETTINGS: "system_settings",
  USER_ANALYTICS_PREFIX: "user_analytics_",
} as const

// Default values
const DEFAULT_SESSION_CAPACITY: SessionCapacityConfig = {
  morningCapacity: 10, // 09:00-12:00
  afternoonCapacity: 10, // 13:00-16:00
  morningLoad: 0,
  afternoonLoad: 0,
  lastUpdated: new Date().toISOString(),
}

const DEFAULT_SYSTEM_SETTINGS = {
  examEnabled: true,
  maintenanceMode: false,
  lastUpdated: new Date().toISOString(),
}

/**
 * Session Capacity Management
 */
export async function getSessionCapacity(): Promise<SessionCapacityConfig> {
  try {
    // Try to get from Edge Config first
    const cached = await edgeConfig?.get<SessionCapacityConfig>(CACHE_KEYS.SESSION_CAPACITY)
    
    if (cached) {
      return cached
    }

    // Fallback to database calculation
    const realTimeCapacity = await calculateRealTimeSessionCapacity()
    
    // Update cache with real-time data (fire and forget)
    updateSessionCapacityCache(realTimeCapacity).catch(console.error)
    
    return realTimeCapacity
  } catch (error) {
    console.error("Error getting session capacity:", error)
    
    // Fallback to database
    return await calculateRealTimeSessionCapacity()
  }
}

async function calculateRealTimeSessionCapacity(): Promise<SessionCapacityConfig> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Count current exam codes by session
  const morningCodes = await prisma.examCode.count({
    where: {
      session_time: "MORNING",
      created_at: {
        gte: today,
        lt: tomorrow,
      },
    },
  })

  const afternoonCodes = await prisma.examCode.count({
    where: {
      session_time: "AFTERNOON", 
      created_at: {
        gte: today,
        lt: tomorrow,
      },
    },
  })

  return {
    morningCapacity: 10,
    afternoonCapacity: 10,
    morningLoad: morningCodes,
    afternoonLoad: afternoonCodes,
    lastUpdated: new Date().toISOString(),
  }
}

export async function updateSessionCapacityCache(capacity?: SessionCapacityConfig) {
  try {
    const sessionCapacity = capacity || await calculateRealTimeSessionCapacity()
    
    // Note: In a real implementation, you would use Vercel's API to update Edge Config
    // For now, we'll simulate this with console logging
    console.log("Would update Edge Config with:", { 
      key: CACHE_KEYS.SESSION_CAPACITY, 
      value: sessionCapacity 
    })
    
    return sessionCapacity
  } catch (error) {
    console.error("Error updating session capacity cache:", error)
    throw error
  }
}

/**
 * System Settings Management
 */
export async function getSystemSettings() {
  try {
    const cached = await edgeConfig?.get(CACHE_KEYS.SYSTEM_SETTINGS)
    
    if (cached) {
      return cached
    }

    return DEFAULT_SYSTEM_SETTINGS
  } catch (error) {
    console.error("Error getting system settings:", error)
    return DEFAULT_SYSTEM_SETTINGS
  }
}

/**
 * User Analytics Caching
 */
export async function getCachedUserAnalytics(userId: string) {
  try {
    const cacheKey = `${CACHE_KEYS.USER_ANALYTICS_PREFIX}${userId}`
    const cached = await edgeConfig?.get(cacheKey)
    
    if (cached) {
      return cached
    }

    // If not cached, fetch from database
    const analytics = await generateUserAnalytics(userId)
    
    // Cache the result (fire and forget)
    cacheUserAnalytics(userId, analytics).catch(console.error)
    
    return analytics
  } catch (error) {
    console.error("Error getting cached user analytics:", error)
    
    // Fallback to database
    return await generateUserAnalytics(userId)
  }
}

async function generateUserAnalytics(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      exam_results: {
        orderBy: { created_at: "desc" },
        take: 5, // Last 5 exam results
      },
      payments: {
        where: { status: "COMPLETED" },
        orderBy: { completed_at: "desc" },
      },
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const analytics = {
    totalExams: user.exam_results.length,
    averageScore: user.exam_results.length > 0 
      ? user.exam_results.reduce((sum, result) => sum + (result.total_score || 0), 0) / user.exam_results.length
      : 0,
    bestScore: user.exam_results.length > 0
      ? Math.max(...user.exam_results.map(r => r.total_score || 0))
      : 0,
    packageType: user.package_type,
    isUpgraded: user.is_upgraded,
    totalPayments: user.payments.reduce((sum, payment) => sum + payment.amount, 0),
    lastExamDate: user.exam_results[0]?.created_at || null,
    generatedAt: new Date().toISOString(),
  }

  return analytics
}

async function cacheUserAnalytics(userId: string, analytics: any) {
  try {
    const cacheKey = `${CACHE_KEYS.USER_ANALYTICS_PREFIX}${userId}`
    
    // Note: In production, this would use Vercel's API to update Edge Config
    console.log("Would cache user analytics:", { key: cacheKey, value: analytics })
    
    return analytics
  } catch (error) {
    console.error("Error caching user analytics:", error)
    throw error
  }
}

/**
 * Cache Invalidation
 */
export async function invalidateUserCache(userId: string) {
  try {
    const cacheKey = `${CACHE_KEYS.USER_ANALYTICS_PREFIX}${userId}`
    
    // Note: In production, this would delete from Edge Config
    console.log("Would invalidate cache for key:", cacheKey)
    
    return true
  } catch (error) {
    console.error("Error invalidating user cache:", error)
    return false
  }
}

export async function invalidateSessionCapacityCache() {
  try {
    // Note: In production, this would delete from Edge Config
    console.log("Would invalidate cache for key:", CACHE_KEYS.SESSION_CAPACITY)
    
    // Immediately recalculate and update
    const newCapacity = await calculateRealTimeSessionCapacity()
    await updateSessionCapacityCache(newCapacity)
    
    return newCapacity
  } catch (error) {
    console.error("Error invalidating session capacity cache:", error)
    throw error
  }
}

/**
 * Utility Functions
 */
export function isSessionAvailable(sessionTime: "MORNING" | "AFTERNOON", capacity: SessionCapacityConfig): boolean {
  if (sessionTime === "MORNING") {
    return capacity.morningLoad < capacity.morningCapacity
  } else {
    return capacity.afternoonLoad < capacity.afternoonCapacity
  }
}

export function getAvailableSlots(capacity: SessionCapacityConfig) {
  return {
    morning: Math.max(0, capacity.morningCapacity - capacity.morningLoad),
    afternoon: Math.max(0, capacity.afternoonCapacity - capacity.afternoonLoad),
  }
}

// Performance monitoring
export async function getCachePerformanceMetrics() {
  return {
    edgeConfigEnabled: !!process.env.EDGE_CONFIG,
    cacheHitRate: "Not implemented", // Would track cache hits vs misses
    averageResponseTime: "Not implemented", // Would track response times
    lastUpdated: new Date().toISOString(),
  }
}