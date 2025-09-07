/* eslint-env node, jest */

// Mock environment variables for testing
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'
process.env.RESEND_API_KEY = 're_test_123456789'

// Mock Prisma client for testing
jest.mock('./lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    examResult: {
      findFirst: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  },
  DatabaseMonitor: {
    checkHealth: jest.fn(),
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
  },
}))

// Mock Next.js auth
jest.mock('./lib/auth', () => ({
  auth: jest.fn(),
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
}))

// Mock Stripe
jest.mock('./lib/stripe', () => ({
  createPaymentIntent: jest.fn(),
  PACKAGE_PRICES: {
    ADVANCED_PACKAGE: 69000,
    POST_EXAM_UPGRADE: 29000,
  },
}))

// Mock Resend
jest.mock('./lib/email', () => ({
  sendEmail: jest.fn(),
  sendRegistrationEmail: jest.fn(),
  sendExamCodeEmail: jest.fn(),
  sendResultsEmail: jest.fn(),
}))