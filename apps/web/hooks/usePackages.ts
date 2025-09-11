'use client';

import { useState, useEffect, useCallback } from 'react';
import { UsePackagesHook, Package, DataFetchingOptions, RetryConfig, PackageFeature } from '@/types/api';
import { mockPackages, PackageType } from '@/lib/mock-data';

/**
 * Custom hook for fetching package data with loading states and error handling
 * Currently uses mock data, prepared for API integration in Story 1.5
 */

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 8000, // 8 seconds  
  backoffFactor: 2
};

const DEFAULT_OPTIONS: Required<DataFetchingOptions> = {
  enabled: true,
  refetchInterval: 0, // No auto-refetch for packages by default
  retry: DEFAULT_RETRY_CONFIG,
  onError: () => {},
  onSuccess: () => {}
};

/**
 * Transform mock data to API-compatible format
 */
const transformMockToApi = (mockPkg: PackageType): Package => {
  return {
    type: mockPkg.type,
    name: mockPkg.name,
    price: mockPkg.price,
    features: mockPkg.features.map(f => f.text),
    is_active: mockPkg.availability.status !== 'full',
    max_users_per_session: mockPkg.availability.maxCapacity,
    description: mockPkg.description,
    badge: mockPkg.badge,
    badgeColor: mockPkg.badgeColor,
    features_detailed: mockPkg.features,
    limitations: mockPkg.limitations,
    availability: mockPkg.availability,
    buttonText: mockPkg.buttonText,
    buttonStyle: mockPkg.buttonStyle,
    footerNote: mockPkg.footerNote
  };
};

/**
 * Simulate API call with mock data
 */
const fetchPackagesFromMock = async (): Promise<Package[]> => {
  // Simulate network delay (100-300ms)
  const delay = Math.random() * 200 + 100;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Simulate occasional errors (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('เกิดข้อผิดพลาดในการโหลดข้อมูลแพ็กเกจ กรุณาลองใหม่อีกครั้ง');
  }
  
  return mockPackages.map(transformMockToApi);
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
      
      // Calculate exponential backoff delay
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
        config.maxDelay
      );
      
      await sleep(delay);
    }
  }
  
  throw lastError!;
};

export function usePackages(options: Partial<DataFetchingOptions> = {}): UsePackagesHook {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const [data, setData] = useState<Package[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!config.enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const packages = await executeWithRetry(fetchPackagesFromMock, config.retry);
      setData(packages);
      config.onSuccess(packages);
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
      const interval = setInterval(fetchData, config.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, config.refetchInterval, config.enabled]);

  return {
    data,
    loading,
    error,
    refetch
  };
}