import { NextRequest, NextResponse } from "next/server";
import { withRateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  thaiName: z.string().min(2, "Thai name must be at least 2 characters").optional(),
  phoneNumber: z
    .string()
    .regex(/^(\+66|0)[0-9]{8,9}$/, "Invalid Thai phone number")
    .optional(),
  pdpaConsent: z.boolean().refine((val) => val === true, {
    message: "You must accept the PDPA terms to register",
  }),
});

/**
 * POST /api/auth/register
 * User registration endpoint with rate limiting and validation
 */
export const POST = withRateLimit(
  async (req: NextRequest) => {
    try {
      // Parse and validate request body
      const body = await req.json();
      console.log('Registration request body:', body);
      
      const validation = registerSchema.safeParse(body);

      if (!validation.success) {
        console.error('Validation failed:', validation.error.flatten());
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validation.error.flatten(),
          },
          { status: 400 }
        );
      }

      const { email, password, name, thaiName, phoneNumber, pdpaConsent } = validation.data;

      // Check if user already exists
      if (!prisma) {
        return NextResponse.json({ error: "Database not available" }, { status: 503 });
      }
      
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);


      // Create user in database
      const user = await prisma!.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash: hashedPassword,
          thaiName: thaiName || name || "",
          phone: phoneNumber,
          pdpaConsent,
        },
        select: {
          id: true,
          email: true,
          thaiName: true,
          createdAt: true,
        },
      });


      // Log registration for security audit
      await prisma!.securityLog.create({
        data: {
          eventType: "AUTHENTICATION_SUCCESS",
          userId: user.id,
          ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          userAgent: req.headers.get("user-agent") || "unknown",
          metadata: {
            action: "USER_REGISTERED",
            email: user.email,
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Return success response
      return NextResponse.json(
        {
          success: true,
          message: "Registration successful. Welcome to TBAT Mock Exam!",
          user: {
            id: user.id,
            email: user.email,
            thaiName: user.thaiName,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Registration error:", error);
      return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 });
    }
  },
  rateLimitConfigs.register // Apply registration rate limiting
);

