import { randomBytes } from "crypto";
import { prisma } from "./prisma";

export type PackageType = "FREE" | "ADVANCED";
export type SubjectType = "BIOLOGY" | "CHEMISTRY" | "PHYSICS";

export interface ExamCodeGenerationOptions {
  packageType: PackageType;
  subject?: SubjectType;
  userId: string;
  sessionCapacityId?: string;
}

export interface ExamCodeResponse {
  code: string;
  packageType: PackageType;
  subject?: SubjectType;
  generatedAt: Date;
}

const ALLOWED_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 8;
const MAX_COLLISION_RETRIES = 10;

export async function generateRandomString(length: number): Promise<string> {
  const buffer = randomBytes(Math.ceil(length * 1.5));
  const chars: string[] = [];

  for (let i = 0; i < buffer.length && chars.length < length; i++) {
    const index = buffer[i] % ALLOWED_CHARS.length;
    if (index < ALLOWED_CHARS.length) {
      chars.push(ALLOWED_CHARS[index]);
    }
  }

  while (chars.length < length) {
    const additionalBuffer = randomBytes(2);
    const index = additionalBuffer[0] % ALLOWED_CHARS.length;
    chars.push(ALLOWED_CHARS[index]);
  }

  return chars.join("");
}

export async function checkCodeUniqueness(code: string): Promise<boolean> {
  try {
    const existingCode = await prisma.examCode.findUnique({
      where: { code },
    });
    return !existingCode;
  } catch (error) {
    console.error("Error checking code uniqueness:", error);
    throw new Error("Failed to verify code uniqueness");
  }
}

export async function generateExamCode(
  options: ExamCodeGenerationOptions
): Promise<ExamCodeResponse> {
  const { packageType, subject, userId, sessionCapacityId } = options;

  if (packageType === "FREE" && !subject) {
    throw new Error("Subject is required for FREE package exam codes");
  }

  if (packageType === "ADVANCED" && subject) {
    throw new Error("Subject should not be specified for ADVANCED package exam codes");
  }

  let attempts = 0;
  let code: string;
  let isUnique = false;

  while (!isUnique && attempts < MAX_COLLISION_RETRIES) {
    const randomPart = await generateRandomString(CODE_LENGTH);

    code = packageType === "FREE" ? `FREE-${randomPart}-${subject}` : `ADV-${randomPart}`;

    isUnique = await checkCodeUniqueness(code);
    attempts++;
  }

  if (!isUnique) {
    throw new Error("Failed to generate unique exam code after maximum retries");
  }

  try {
    const examCode = await prisma.examCode.create({
      data: {
        code: code!,
        packageType,
        subject,
        isActive: true,
        userId,
        sessionCapacityId,
        generatedAt: new Date(),
        metadata: {
          generationAttempts: attempts,
          generatedBy: "system",
          timestamp: new Date().toISOString(),
        },
      },
    });

    await auditLog({
      action: "EXAM_CODE_GENERATED",
      userId,
      resourceId: examCode.id,
      resourceType: "ExamCode",
      details: {
        code: code!,
        packageType,
        subject,
        attempts,
      },
    });

    return {
      code: examCode.code,
      packageType: examCode.packageType as PackageType,
      subject: examCode.subject as SubjectType | undefined,
      generatedAt: examCode.generatedAt,
    };
  } catch (error) {
    console.error("Error creating exam code:", error);
    throw new Error("Failed to create exam code in database");
  }
}

export async function validateExamCode(code: string): Promise<boolean> {
  const freePattern = /^FREE-[A-Z0-9]{8}-(BIOLOGY|CHEMISTRY|PHYSICS)$/;
  const advancedPattern = /^ADV-[A-Z0-9]{8}$/;

  return freePattern.test(code) || advancedPattern.test(code);
}

export async function getExamCodeDetails(code: string) {
  try {
    const examCode = await prisma.examCode.findUnique({
      where: { code },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            thaiName: true,
          },
        },
        sessionCapacity: true,
      },
    });

    if (!examCode) {
      return null;
    }

    return {
      ...examCode,
      isExpired: examCode.expiresAt && new Date() > new Date(examCode.expiresAt),
      isUsed: examCode.usedAt !== null,
    };
  } catch (error) {
    console.error("Error fetching exam code details:", error);
    throw new Error("Failed to retrieve exam code details");
  }
}

export async function markExamCodeAsUsed(code: string, userId: string): Promise<void> {
  try {
    await prisma.examCode.update({
      where: { code },
      data: {
        usedAt: new Date(),
        usedBy: userId,
      },
    });

    await auditLog({
      action: "EXAM_CODE_USED",
      userId,
      resourceId: code,
      resourceType: "ExamCode",
      details: {
        code,
        usedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error marking exam code as used:", error);
    throw new Error("Failed to mark exam code as used");
  }
}

export async function deactivateExamCode(code: string, reason: string): Promise<void> {
  try {
    await prisma.examCode.update({
      where: { code },
      data: {
        isActive: false,
        metadata: {
          deactivatedAt: new Date().toISOString(),
          deactivationReason: reason,
        },
      },
    });

    await auditLog({
      action: "EXAM_CODE_DEACTIVATED",
      userId: "system",
      resourceId: code,
      resourceType: "ExamCode",
      details: {
        code,
        reason,
      },
    });
  } catch (error) {
    console.error("Error deactivating exam code:", error);
    throw new Error("Failed to deactivate exam code");
  }
}

async function auditLog(data: {
  action: string;
  userId: string;
  resourceId: string;
  resourceType: string;
  details: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        userId: data.userId,
        resourceId: data.resourceId,
        resourceType: data.resourceType,
        details: data.details,
        ipAddress: null,
        userAgent: null,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}
