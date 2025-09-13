import { NextRequest, NextResponse } from "next/server";
import { mockSessionCapacity, getAvailabilityStatus } from "@/lib/mock-data";

// Add response caching to improve performance
interface CachedResponse {
  data: any;
  timestamp: number;
  ttl: number;
}

let cachedCapacityData: CachedResponse | null = null;
const CACHE_TTL = 15000; // 15 seconds cache

/**
 * Enhanced Mock Capacity API for Production Deployment
 * Provides realistic capacity simulation without database dependencies
 * Implements proper business logic, Thai messaging, and real-time variations
 * 
 * Features:
 * - Response caching (15s TTL) for better performance
 * - Realistic capacity variation algorithm (±3 people every 30 seconds)
 * - Proper Free/Advanced package rules
 * - Thai language messaging
 * - Production-ready error handling
 * - Business logic: Hide Free options when full, show Advanced-only
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const sessionTime = url.searchParams.get("sessionTime");
    const format = url.searchParams.get("format") || "detailed";
    
    // Check cache first for better performance
    const now = Date.now();
    if (cachedCapacityData && (now - cachedCapacityData.timestamp) < cachedCapacityData.ttl) {
      // Return cached data if not specific session requested
      if (!sessionTime) {
        return NextResponse.json({
          success: true,
          data: {
            ...cachedCapacityData.data,
            metadata: {
              ...cachedCapacityData.data.metadata,
              cacheHit: true,
              cachedAt: new Date(cachedCapacityData.timestamp).toISOString()
            }
          }
        });
      }
    }
    
    // Enhanced Mock System: Simulate realistic capacity changes over time
    // This creates realistic variation for production deployment
    const intervalKey = Math.floor(now / 30000); // Change every 30 seconds
    const seedVariation = intervalKey % 7; // Create predictable but varying pattern
    
    // Optimized Transform: Mock data with realistic variations and business logic
    const transformSessionToApi = (session: any) => {
      // Add realistic capacity variation (±3 people based on 30s intervals)
      const simulatedCount = Math.max(0, Math.min(session.max_capacity, session.current_count + (seedVariation - 3)));
      
      // Pre-calculate common values
      const percentageFull = simulatedCount / session.max_capacity;
      const freeLimit = session.max_capacity >> 1; // Bitshift for faster division by 2
      const advancedCount = Math.floor(simulatedCount * 0.6);
      const freeCount = simulatedCount - advancedCount;
      
      // Simplified availability logic with lookup tables
      const availabilityData = percentageFull >= 0.95 
        ? { status: "FULL", thai: "เต็มแล้ว", en: "Session is full" }
        : freeCount >= freeLimit || percentageFull >= 0.90
        ? { status: "ADVANCED_ONLY", thai: "เหลือที่สำหรับ Advanced Package เท่านั้น", en: "Advanced Package only" }
        : percentageFull >= 0.80
        ? { status: "NEARLY_FULL", thai: "เหลือที่นั่งจำนวนจำกัด", en: "Limited seats remaining" }
        : { status: "AVAILABLE", thai: "เปิดรับสมัคร", en: "Seats available" };
      
      return {
        sessionTime: session.session_time === "09:00-12:00" ? "MORNING" : "AFTERNOON",
        displayTime: session.session_time,
        totalCount: simulatedCount,
        maxCapacity: session.max_capacity,
        availabilityStatus: availabilityData.status,
        message: availabilityData.thai,
        messageEn: availabilityData.en,
        percentageFull: Math.round(percentageFull * 100) / 100,
        advancedCount,
        freeCount: availabilityData.status === "ADVANCED_ONLY" ? undefined : freeCount,
        freeLimit
      };
    };

    // If specific session requested
    if (sessionTime) {
      const targetSessionTime = sessionTime === "MORNING" ? "09:00-12:00" : "13:00-16:00";
      const session = mockSessionCapacity.find(s => s.session_time === targetSessionTime);
      
      if (!session) {
        return NextResponse.json({
          success: false,
          error: {
            code: "SESSION_NOT_FOUND",
            message: "Session not found"
          }
        }, { status: 404 });
      }

      const sessionInfo = transformSessionToApi(session);
      
      return NextResponse.json({
        success: true,
        data: {
          examDate: "2025-09-27",
          sessions: {
            [sessionTime.toLowerCase()]: sessionInfo
          },
          metadata: {
            lastUpdated: new Date().toISOString(),
            cacheHit: false,
            hideExactCounts: false
          }
        }
      });
    }

    // Return all sessions
    const morningSession = mockSessionCapacity.find(s => s.session_time === "09:00-12:00");
    const afternoonSession = mockSessionCapacity.find(s => s.session_time === "13:00-16:00");

    if (!morningSession || !afternoonSession) {
      throw new Error("Mock session data not found");
    }

    const morningInfo = transformSessionToApi(morningSession);
    const afternoonInfo = transformSessionToApi(afternoonSession);

    const responseData = {
      examDate: "2025-09-27",
      sessions: {
        morning: morningInfo,
        afternoon: afternoonInfo
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        cacheHit: false,
        hideExactCounts: false
      }
    };

    // Add overall statistics for detailed format
    if (format === "detailed") {
      (responseData as any).overall = {
        totalCapacity: morningSession.max_capacity + afternoonSession.max_capacity,
        totalOccupied: morningSession.current_count + afternoonSession.current_count,
        occupancyRate: (morningSession.current_count + afternoonSession.current_count) / 
                      (morningSession.max_capacity + afternoonSession.max_capacity),
        overallStatus: "AVAILABLE"
      };
    }

    // Cache the response data for future requests (only for non-specific session requests)
    if (!sessionTime) {
      cachedCapacityData = {
        data: responseData,
        timestamp: now,
        ttl: CACHE_TTL
      };
    }

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("Error in enhanced mock capacity endpoint:", error);
    
    // Production-ready error handling with Thai messaging
    return NextResponse.json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "ไม่สามารถโหลดข้อมูลจำนวนที่นั่งได้ กรุณาลองใหม่อีกครั้ง",
        messageEn: "Failed to fetch capacity information. Please try again."
      }
    }, { status: 500 });
  }
}