import { NextRequest, NextResponse } from "next/server";
import { withRateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Validation schema for reset password
const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

/**
 * POST /api/auth/reset-password
 * Password reset execution endpoint with token validation and security logging
 */
export const POST = withRateLimit(
  async (req: NextRequest) => {
    try {
      // Parse and validate request body
      const body = await req.json();
      const validation = resetPasswordSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validation.error.flatten(),
          },
          { status: 400 }
        );
      }

      const { token, password } = validation.data;

      // Check database availability
      if (!prisma) {
        return NextResponse.json({ error: "Database not available" }, { status: 503 });
      }

      // Find valid reset token
      const passwordReset = await prisma.passwordReset.findUnique({
        where: { resetToken: token },
        include: { user: { select: { id: true, email: true, thaiName: true } } }
      });

      // Validate token
      if (!passwordReset) {
        return NextResponse.json(
          { error: "Invalid or expired reset token" },
          { status: 400 }
        );
      }

      // Check if token is expired
      if (passwordReset.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "Reset token has expired. Please request a new one." },
          { status: 400 }
        );
      }

      // Check if token is already used
      if (passwordReset.isUsed) {
        return NextResponse.json(
          { error: "Reset token has already been used" },
          { status: 400 }
        );
      }

      // Hash new password with 12 salt rounds
      const hashedPassword = await bcrypt.hash(password, 12);

      // Perform transaction to update password and invalidate token
      await prisma.$transaction(async (tx) => {
        // Update user password
        await tx.user.update({
          where: { id: passwordReset.userId },
          data: {
            passwordHash: hashedPassword,
            passwordChangedAt: new Date(),
            failedLoginAttempts: 0, // Reset failed login attempts
            lockedUntil: null, // Clear any account locks
          },
        });

        // Mark reset token as used
        await tx.passwordReset.update({
          where: { id: passwordReset.id },
          data: { isUsed: true },
        });

        // Security audit logging
        await tx.securityLog.create({
          data: {
            eventType: "PASSWORD_CHANGE",
            userId: passwordReset.userId,
            ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
            userAgent: req.headers.get("user-agent") || "unknown",
            metadata: {
              resetTokenUsed: true,
              email: passwordReset.user.email,
              timestamp: new Date().toISOString(),
            },
          },
        });
      });

      // Return success response
      return NextResponse.json(
        {
          success: true,
          message: "รหัสผ่านของคุณได้รับการอัปเดตเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่",
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Reset password error:", error);

      // Log security event for failed password reset
      try {
        await prisma?.securityLog.create({
          data: {
            eventType: "AUTHENTICATION_FAILED",
            ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
            userAgent: req.headers.get("user-agent") || "unknown",
            metadata: {
              action: "PASSWORD_RESET_FAILED",
              error: error instanceof Error ? error.message : "Unknown error",
              timestamp: new Date().toISOString(),
            },
          },
        });
      } catch (logError) {
        console.error("Failed to log security event:", logError);
      }

      return NextResponse.json(
        { error: "An error occurred while resetting your password" },
        { status: 500 }
      );
    }
  },
  {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit reset password attempts to prevent token brute force
  }
);