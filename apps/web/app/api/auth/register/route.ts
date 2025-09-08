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
      const validation = registerSchema.safeParse(body);

      if (!validation.success) {
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

      // Generate email verification token
      const verificationToken = generateVerificationToken();
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user in database
      const user = await prisma.user.create({
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

      // Send verification email
      try {
        await sendEmail({
          to: user.email,
          subject: "ยืนยันอีเมลของคุณ - TBAT Mock Exam",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>ยินดีต้อนรับสู่ TBAT Mock Exam Platform</h2>
              <p>สวัสดีคุณ ${user.thaiName},</p>
              <p>ขอบคุณที่ลงทะเบียนกับเรา กรุณายืนยันอีเมลของคุณโดยคลิกลิงก์ด้านล่าง:</p>
              <a href="${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}" 
                 style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                ยืนยันอีเมล
              </a>
              <p>ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง</p>
              <p>หากคุณไม่ได้ลงทะเบียน กรุณาเพิกเฉยอีเมลนี้</p>
              <hr />
              <p style="font-size: 12px; color: #666;">
                TBAT Mock Exam Platform<br />
                Chiang Mai, Thailand
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Continue with registration even if email fails
      }

      // Log registration for security audit
      await prisma.securityLog.create({
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
          message: "Registration successful. Please check your email to verify your account.",
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

/**
 * Generate a secure random verification token
 */
function generateVerificationToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
