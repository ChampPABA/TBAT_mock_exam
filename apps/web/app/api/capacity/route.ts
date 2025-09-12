import { NextRequest, NextResponse } from "next/server";
import { mockSessionCapacity, getAvailabilityStatus } from "@/lib/mock-data";

/**
 * Enhanced Mock Capacity API for Production Deployment
 * Provides realistic capacity simulation without database dependencies
 * Implements proper business logic, Thai messaging, and real-time variations
 * 
 * Features:
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
    
    // Enhanced Mock System: Simulate realistic capacity changes over time
    // This creates realistic variation for production deployment
    const now = Date.now();
    const intervalKey = Math.floor(now / 30000); // Change every 30 seconds
    const seedVariation = intervalKey % 7; // Create predictable but varying pattern
    
    // Enhanced Transform: Mock data with realistic variations and business logic
    const transformSessionToApi = (session: any) => {
      // Add realistic capacity variation (±3 people based on 30s intervals)
      const baseCount = session.current_count;
      const variation = (seedVariation - 3); // -3 to +3 people
      const simulatedCount = Math.max(0, Math.min(session.max_capacity, baseCount + variation));
      
      // Calculate percentage and apply business rules
      const percentageFull = simulatedCount / session.max_capacity;
      const freeLimit = Math.floor(session.max_capacity * 0.5); // 50% reserved for Free
      const advancedCount = Math.floor(simulatedCount * 0.6);
      const freeCount = simulatedCount - advancedCount;
      
      // Enhanced Availability Status Logic with Thai Business Rules
      let availabilityStatus: string;
      let thaiMessage: string;
      let messageEn: string;
      
      if (percentageFull >= 0.95) {
        availabilityStatus = "FULL";
        thaiMessage = "เต็มแล้ว";
        messageEn = "Session is full";
      } else if (freeCount >= freeLimit || percentageFull >= 0.90) {
        // Advanced Only - Free quota reached or nearly full
        availabilityStatus = "ADVANCED_ONLY";
        thaiMessage = "เหลือที่สำหรับ Advanced Package เท่านั้น";
        messageEn = "Advanced Package only";
      } else if (percentageFull >= 0.80) {
        availabilityStatus = "NEARLY_FULL";
        thaiMessage = "เหลือที่นั่งจำนวนจำกัด";
        messageEn = "Limited seats remaining";
      } else {
        availabilityStatus = "AVAILABLE";
        thaiMessage = "เปิดรับสมัคร";
        messageEn = "Seats available";
      }
      
      return {
        sessionTime: session.session_time === "09:00-12:00" ? "MORNING" : "AFTERNOON",
        displayTime: session.session_time,
        totalCount: simulatedCount,
        maxCapacity: session.max_capacity,
        availabilityStatus,
        message: thaiMessage,
        messageEn,
        percentageFull: Math.round(percentageFull * 100) / 100,
        advancedCount,
        freeCount: availabilityStatus === "ADVANCED_ONLY" ? undefined : freeCount, // Hide when full
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