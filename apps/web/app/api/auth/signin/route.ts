import { NextRequest, NextResponse } from "next/server";
import { withRateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Validation schema for sign in
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * POST /api/auth/signin
 * Custom sign in endpoint with rate limiting and validation
 */
export const POST = withRateLimit(
  async (req: NextRequest) => {
    try {
      // Parse and validate request body
      const body = await req.json();
      const validation = signInSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validation.error.flatten(),
          },
          { status: 400 }
        );
      }

      const { email, password } = validation.data;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user || !user.passwordHash) {
        // Use generic error message to prevent user enumeration
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash!);

      if (!isValidPassword) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      // Check if account is active
      if (!user.isActive) {
        return NextResponse.json(
          { error: "Your account has been deactivated" },
          { status: 403 }
        );
      }

      // Update last login time
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Return success with user info (excluding sensitive data)
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          thaiName: user.thaiName,
          packageType: user.packageType,
        },
        message: "Sign in successful. Use NextAuth session for authentication.",
      });
    } catch (error) {
      console.error("Sign in error:", error);
      return NextResponse.json({ error: "An error occurred during sign in" }, { status: 500 });
    }
  },
  rateLimitConfigs.auth // Apply auth rate limiting
);
