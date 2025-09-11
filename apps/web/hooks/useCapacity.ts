'use client';

import { useState, useEffect, useCallback } from 'react';
import { UseCapacityHook, CapacityData, DataFetchingOptions, RetryConfig } from '@/types/api';
import { mockSessionCapacity, SessionCapacity, getAvailabilityStatus } from '@/lib/mock-data';

/**
 * Custom hook for fetching capacity data with real-time refresh capabilities
 * Refreshes every 30 seconds for accurate availability information
 */

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 8000,
  backoffFactor: 2
};

const DEFAULT_OPTIONS: Required<DataFetchingOptions> = {
  enabled: true,
  refetchInterval: 30000, // 30 seconds for real-time capacity updates
  retry: DEFAULT_RETRY_CONFIG,
  onError: () => {},
  onSuccess: () => {}
};

/**
 * Transform mock session capacity to API format
 */
const transformMockToApi = (mockSession: SessionCapacity): CapacityData => {
  const sessionTimeMap = {
    "09:00-12:00": "MORNING" as const,
    "13:00-16:00": "AFTERNOON" as const
  };

  const availabilityStatusMap = {
    "available": "AVAILABLE" as const,
    "limited": "NEARLY_FULL" as const,
    "full": "FULL" as const
  };

  const thaiMessageMap = {
    "available": "เปิดรับสมัคร",
    "limited": "เหลือที่นั่งจำนวนจำกัด",
    "full": "เต็มแล้ว"
  };

  // Check if only advanced package should be available
  const isAdvancedOnly = mockSession.current_count >= mockSession.max_capacity * 0.9;

  return {
    session_time: sessionTimeMap[mockSession.session_time],
    current_count: mockSession.current_count,
    max_capacity: mockSession.max_capacity,
    availability_status: isAdvancedOnly ? "ADVANCED_ONLY" : availabilityStatusMap[mockSession.availability],
    thai_message: isAdvancedOnly ? "เหลือที่สำหรับ Advanced Package เท่านั้น" : thaiMessageMap[mockSession.availability]
  };
};

/**
 * Simulate API call with mock data and dynamic updates
 */
const fetchCapacityFromMock = async (): Promise<CapacityData[]> => {
  // Simulate network delay
  const delay = Math.random() * 200 + 100;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Simulate occasional errors (3% chance)
  if (Math.random() < 0.03) {
    throw new Error('เกิดข้อผิดพลาดในการโหลดข้อมูลจำนวนที่นั่ง กรุณาลองใหม่อีกครั้ง');
  }
  
  // Add some realistic variance to current counts (+/- 5 people)
  const updatedMockData = mockSessionCapacity.map(session => {
    const variance = Math.floor(Math.random() * 11) - 5; // -5 to +5
    const newCount = Math.max(0, Math.min(session.max_capacity, session.current_count + variance));
    
    return {
      ...session,
      current_count: newCount,
      availability: getAvailabilityStatus(newCount, session.max_capacity)
    };
  });
  
  return updatedMockData.map(transformMockToApi);
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

export function useCapacity(options: Partial<DataFetchingOptions> = {}): UseCapacityHook {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const [data, setData] = useState<CapacityData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!config.enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const capacity = await executeWithRetry(fetchCapacityFromMock, config.retry);
      setData(capacity);
      config.onSuccess(capacity);
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

  // Auto-refetch interval for real-time updates
  useEffect(() => {
    if (config.refetchInterval > 0 && config.enabled) {
      const interval = setInterval(() => {
        // Only refetch if not currently loading to prevent race conditions
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