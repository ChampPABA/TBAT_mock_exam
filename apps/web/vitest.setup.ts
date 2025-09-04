import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Set test environment variable
process.env.VITEST = 'true'

// Mock rate limiter to bypass it in tests
vi.mock('@/lib/middleware/rate-limiter', () => ({
  createRateLimit: vi.fn(() => () => null), // Always allow requests in tests
  addRateLimitHeaders: vi.fn((response) => response), // Pass through response unchanged
  registrationRateLimit: vi.fn(() => null), // Always allow registration in tests
  REGISTRATION_RATE_LIMIT: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 5,
    message: "Test rate limit message"
  }
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true
})

// Mock window.alert
global.alert = vi.fn()