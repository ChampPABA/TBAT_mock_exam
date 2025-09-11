'use client';

import { useState, useEffect, useCallback } from 'react';
import { UseSessionsHook, SessionInfo, DataFetchingOptions, RetryConfig } from '@/types/api';
import { mockSessionCapacity, SessionCapacity, getAvailabilityStatus } from '@/lib/mock-data';

/**
 * Custom hook for fetching session data with availability logic
 * Includes Thai timezone formatting and session-specific business logic
 */

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 8000,
  backoffFactor: 2
};

const DEFAULT_OPTIONS: Required<DataFetchingOptions> = {
  enabled: true,
  refetchInterval: 60000, // 1 minute refresh for session data
  retry: DEFAULT_RETRY_CONFIG,
  onError: () => {},
  onSuccess: () => {}
};

/**
 * Transform mock session capacity to session info format
 */
const transformMockToSession = (mockSession: SessionCapacity): SessionInfo => {
  const sessionTimeMap = {
    "09:00-12:00": "MORNING" as const,
    "13:00-16:00": "AFTERNOON" as const
  };

  const thaiTimeMap = {
    "09:00-12:00": "09:00-12:00 น. (เช็คอิน 08:15 น.)",
    "13:00-16:00": "13:00-16:00 น. (เช็คอิน 12:15 น.)"
  };

  // Calculate availability status based on business rules
  const percentage = (mockSession.current_count / mockSession.max_capacity) * 100;
  let availabilityStatus: string;
  
  if (percentage >= 95) {
    availabilityStatus = "เต็มแล้ว";
  } else if (percentage >= 80) {
    availabilityStatus = "เหลือที่นั่งจำนวนจำกัด";
  } else {
    availabilityStatus = "เปิดรับสมัคร";
  }

  return {
    sessionTime: sessionTimeMap[mockSession.session_time],
    timeSlot: mockSession.session_time,
    registrationCount: mockSession.current_count,
    availabilityStatus,
    thaiTimeFormat: thaiTimeMap[mockSession.session_time]
  };
};

/**
 * Simulate API call with mock data and Thai timezone considerations
 */
const fetchSessionsFromMock = async (): Promise<SessionInfo[]> => {
  // Simulate network delay
  const delay = Math.random() * 200 + 100;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Simulate occasional errors (2% chance)
  if (Math.random() < 0.02) {
    throw new Error('เกิดข้อผิดพลาดในการโหลดข้อมูลรอบการสอบ กรุณาลองใหม่อีกครั้ง');
  }
  
  // Add realistic variance to session data
  const updatedMockData = mockSessionCapacity.map(session => {
    const variance = Math.floor(Math.random() * 7) - 3; // -3 to +3
    const newCount = Math.max(0, Math.min(session.max_capacity, session.current_count + variance));
    
    return {
      ...session,
      current_count: newCount,
      availability: getAvailabilityStatus(newCount, session.max_capacity)
    };
  });
  
  return updatedMockData.map(transformMockToSession);
};

/**
 * Exponential backoff retry mechanism
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const executeWithRetry = async <T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === config.maxAttempts) {
        throw lastError;
      }
      
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
        config.maxDelay
      );
      
      await sleep(delay);
    }
  }
  
  throw lastError!;
};

export function useSessions(options: Partial<DataFetchingOptions> = {}): UseSessionsHook {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const [data, setData] = useState<SessionInfo[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!config.enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const sessions = await executeWithRetry(fetchSessionsFromMock, config.retry);
      setData(sessions);
      config.onSuccess(sessions);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
      setError(errorObj);
      config.onError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [config]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (config.enabled) {
      fetchData();
    }
  }, [fetchData, config.enabled]);

  // Auto-refetch interval
  useEffect(() => {
    if (config.refetchInterval > 0 && config.enabled) {
      const interval = setInterval(() => {
        if (!loading) {
          fetchData();
        }
      }, config.refetchInterval);
      
      return () => clearInterval(interval);
    }
  }, [fetchData, config.refetchInterval, config.enabled, loading]);

  return {
    data,
    loading,
    error,
    refetch
  };
}