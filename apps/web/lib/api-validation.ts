import { NextRequest, NextResponse } from "next/server";
import { z, ZodError, ZodSchema } from "zod";

/**
 * API Validation Middleware using Zod
 * Provides consistent validation and error handling for API routes
 */

// Common validation schemas
export const commonSchemas = {
  // Email validation
  email: z.string().email("Invalid email format"),

  // Thai phone number validation
  thaiPhone: z.string().regex(/^(\+66|0)[0-9]{8,9}$/, "Invalid Thai phone number format"),

  // Strong password validation
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  // MongoDB ObjectId validation
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),

  // UUID validation
  uuid: z.string().uuid("Invalid UUID format"),

  // Pagination
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().min(1).max(100).default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),

  // Date range
  dateRange: z
    .object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    })
    .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
      message: "End date must be after start date",
    }),

  // PDPA consent
  pdpaConsent: z.boolean().refine((val) => val === true, {
    message: "PDPA consent is required",
  }),
};

// Validation schemas for specific endpoints
export const apiSchemas = {
  // User update schema
  updateUser: z.object({
    name: z.string().min(2).optional(),
    thaiName: z.string().min(2).optional(),
    phoneNumber: commonSchemas.thaiPhone.optional(),
    schoolName: z.string().min(2).optional(),
    targetMedicalSchool: z.string().optional(),
  }),

  // Exam code generation
  generateExamCode: z.object({
    packageType: z.enum(["FREE", "ADVANCED"]),
    sessionId: z.string(),
  }),

  // Payment creation
  createPayment: z.object({
    packageType: z.enum(["FREE", "ADVANCED"]),
    amount: z.number().positive(),
    currency: z.literal("THB"),
  }),

  // Exam submission
  submitExam: z.object({
    examCodeId: z.string(),
    answers: z.array(
      z.object({
        questionId: z.string(),
        answer: z.string(),
        timeSpent: z.number().int().nonnegative(),
      })
    ),
    totalTimeSpent: z.number().int().positive(),
  }),

  // Support ticket creation
  createTicket: z.object({
    subject: z.string().min(5).max(200),
    message: z.string().min(10).max(5000),
    category: z.enum(["TECHNICAL", "PAYMENT", "EXAM", "ACCOUNT", "OTHER"]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  }),
};

/**
 * Validation error response formatter
 */
function formatValidationErrors(error: ZodError): any {
  const formattedErrors: Record<string, string[]> = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(issue.message);
  });

  return {
    error: "Validation failed",
    message: "Please check the errors and try again",
    errors: formattedErrors,
    _raw: error.issues, // Include raw errors for debugging
  };
}

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error: NextResponse.json(formatValidationErrors(error), { status: 400 }),
      };
    }

    return {
      data: null,
      error: NextResponse.json({ error: "Invalid request body" }, { status: 400 }),
    };
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): { data: T; error: null } | { data: null; error: NextResponse } {
  try {
    const { searchParams } = new URL(req.url);
    const query: Record<string, any> = {};

    // Convert URLSearchParams to object
    searchParams.forEach((value, key) => {
      // Handle array parameters (e.g., ?id=1&id=2)
      if (query[key]) {
        if (Array.isArray(query[key])) {
          query[key].push(value);
        } else {
          query[key] = [query[key], value];
        }
      } else {
        // Try to parse numbers and booleans
        if (value === "true") query[key] = true;
        else if (value === "false") query[key] = false;
        else if (!isNaN(Number(value))) query[key] = Number(value);
        else query[key] = value;
      }
    });

    const data = schema.parse(query);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error: NextResponse.json(formatValidationErrors(error), { status: 400 }),
      };
    }

    return {
      data: null,
      error: NextResponse.json({ error: "Invalid query parameters" }, { status: 400 }),
    };
  }
}

/**
 * Middleware wrapper that validates request against a schema
 */
export function withValidation<T>(
  handler: (req: NextRequest, data: T) => Promise<NextResponse>,
  schema: ZodSchema<T>,
  type: "body" | "query" = "body"
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const validation =
      type === "body" ? await validateBody(req, schema) : validateQuery(req, schema);

    if (validation.error) {
      return validation.error;
    }

    return handler(req, validation.data);
  };
}

/**
 * Combined validation for both body and query
 */
export function withFullValidation<B, Q>(
  handler: (req: NextRequest, body: B, query: Q) => Promise<NextResponse>,
  bodySchema: ZodSchema<B>,
  querySchema: ZodSchema<Q>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Validate query parameters
    const queryValidation = validateQuery(req, querySchema);
    if (queryValidation.error) {
      return queryValidation.error;
    }

    // Validate request body
    const bodyValidation = await validateBody(req, bodySchema);
    if (bodyValidation.error) {
      return bodyValidation.error;
    }

    return handler(req, bodyValidation.data, queryValidation.data);
  };
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate and sanitize Thai language input
 */
export function validateThaiInput(input: string): boolean {
  // Check if string contains Thai characters
  const thaiRegex = /[\u0E00-\u0E7F]/;
  return thaiRegex.test(input);
}

/**
 * PDPA compliance checker
 */
export interface PDPAValidation {
  hasConsent: boolean;
  consentDate?: Date;
  consentVersion?: string;
  dataRetentionDays?: number;
}

export function validatePDPACompliance(validation: PDPAValidation): boolean {
  if (!validation.hasConsent) {
    return false;
  }

  // Check if consent is not expired (1 year)
  if (validation.consentDate) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (validation.consentDate < oneYearAgo) {
      return false;
    }
  }

  return true;
}
