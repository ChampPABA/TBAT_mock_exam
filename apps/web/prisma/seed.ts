import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data
  await prisma.$transaction([
    prisma.supportTicket.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.pDFNotification.deleteMany(),
    prisma.pDFDownload.deleteMany(),
    prisma.pDFSolution.deleteMany(),
    prisma.analytics.deleteMany(),
    prisma.examResult.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.examCode.deleteMany(),
    prisma.sessionCapacity.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.account.deleteMany(),
    prisma.userSession.deleteMany(),
    prisma.adminUser.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create admin users
  const adminPassword = await bcrypt.hash("admin123", 12);

  const superAdmin = await prisma.adminUser.create({
    data: {
      email: "superadmin@tbat-exam.com",
      passwordHash: adminPassword,
      thaiName: "ผู้ดูแลระบบหลัก",
      role: "SUPER_ADMIN",
      permissions: ["ALL"],
    },
  });

  const normalAdmin = await prisma.adminUser.create({
    data: {
      email: "admin@tbat-exam.com",
      passwordHash: adminPassword,
      thaiName: "ผู้ดูแลระบบ",
      role: "ADMIN",
      permissions: ["USER_MANAGEMENT", "EXAM_MANAGEMENT", "PDF_MANAGEMENT"],
    },
  });

  console.log("✅ Created admin users");

  // Create test users
  const userPassword = await bcrypt.hash("password123", 12);

  const testUsers = await Promise.all([
    // Free package users
    ...Array.from({ length: 5 }, async (_, i) => {
      return prisma.user.create({
        data: {
          email: `free${i + 1}@test.com`,
          passwordHash: userPassword,
          thaiName: `นักเรียนฟรี ${i + 1}`,
          phone: `08${String(i + 1).padStart(8, "0")}`,
          school: `โรงเรียนทดสอบ ${i + 1}`,
          packageType: "FREE",
          pdpaConsent: true,
        },
      });
    }),
    // Advanced package users
    ...Array.from({ length: 5 }, async (_, i) => {
      return prisma.user.create({
        data: {
          email: `advanced${i + 1}@test.com`,
          passwordHash: userPassword,
          thaiName: `นักเรียนพรีเมียม ${i + 1}`,
          phone: `09${String(i + 1).padStart(8, "0")}`,
          school: `โรงเรียนชั้นนำ ${i + 1}`,
          lineId: `line_${i + 1}`,
          packageType: "ADVANCED",
          pdpaConsent: true,
        },
      });
    }),
  ]);

  console.log("✅ Created 10 test users");

  // Create session capacities for exam date
  const examDate = new Date("2025-09-27"); // 27 กันยายน 2568

  await prisma.sessionCapacity.createMany({
    data: [
      {
        sessionTime: "MORNING",
        currentCount: 5,
        maxCapacity: 10,
        examDate,
      },
      {
        sessionTime: "AFTERNOON",
        currentCount: 3,
        maxCapacity: 10,
        examDate,
      },
    ],
  });

  console.log("✅ Created session capacities");

  // Create exam codes for users
  const examCodes = [];

  // Free users get 1 exam code each
  for (let i = 0; i < 5; i++) {
    const user = testUsers[i];
    if (!user) continue;
    const subjects = ["BIOLOGY", "CHEMISTRY", "PHYSICS"];
    const subject = subjects[i % 3];

    examCodes.push({
      userId: user.id,
      code: `FREE-${String(Math.random()).substring(2, 10)}-${subject}`,
      packageType: "FREE" as any,
      subject: subject as any,
      sessionTime: (i % 2 === 0 ? "MORNING" : "AFTERNOON") as any,
      isUsed: false,
    });
  }

  // Advanced users get 3 exam codes (one per subject)
  for (let i = 5; i < 10; i++) {
    const user = testUsers[i];
    if (!user) continue;
    const baseCode = String(Math.random()).substring(2, 10);

    examCodes.push(
      {
        userId: user.id,
        code: `ADV-${baseCode}-BIO`,
        packageType: "ADVANCED" as any,
        subject: "BIOLOGY" as any,
        sessionTime: (i % 2 === 0 ? "MORNING" : "AFTERNOON") as any,
        isUsed: false,
      },
      {
        userId: user.id,
        code: `ADV-${baseCode}-CHEM`,
        packageType: "ADVANCED" as any,
        subject: "CHEMISTRY" as any,
        sessionTime: (i % 2 === 0 ? "MORNING" : "AFTERNOON") as any,
        isUsed: false,
      },
      {
        userId: user.id,
        code: `ADV-${baseCode}-PHY`,
        packageType: "ADVANCED" as any,
        subject: "PHYSICS" as any,
        sessionTime: (i % 2 === 0 ? "MORNING" : "AFTERNOON") as any,
        isUsed: false,
      }
    );
  }

  await prisma.examCode.createMany({ data: examCodes });

  console.log("✅ Created exam codes");

  // Create sample payments for advanced users
  const payments = [];

  for (let i = 5; i < 10; i++) {
    const user = testUsers[i];
    if (!user) continue;

    payments.push({
      userId: user.id,
      stripePaymentIntentId: `pi_test_${String(Math.random()).substring(2, 20)}`,
      amount: 69000, // 690 THB
      currency: "thb",
      paymentType: "ADVANCED_PACKAGE" as any,
      status: "COMPLETED" as any,
      completedAt: new Date(),
    });
  }

  await prisma.payment.createMany({ data: payments });

  console.log("✅ Created payment records");

  // Create sample PDF solutions
  const pdfSolutions = await Promise.all([
    prisma.pDFSolution.create({
      data: {
        subject: "BIOLOGY",
        examDate,
        fileUrl: "https://storage.example.com/pdfs/biology-solution.pdf",
        fileSize: 2048000, // 2MB
        description: "เฉลยละเอียดวิชาชีววิทยา TBAT Mock Exam",
        uploadAdminId: normalAdmin.id,
        isActive: true,
        expiresAt: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months
      },
    }),
    prisma.pDFSolution.create({
      data: {
        subject: "CHEMISTRY",
        examDate,
        fileUrl: "https://storage.example.com/pdfs/chemistry-solution.pdf",
        fileSize: 1536000, // 1.5MB
        description: "เฉลยละเอียดวิชาเคมี TBAT Mock Exam",
        uploadAdminId: normalAdmin.id,
        isActive: true,
        expiresAt: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.pDFSolution.create({
      data: {
        subject: "PHYSICS",
        examDate,
        fileUrl: "https://storage.example.com/pdfs/physics-solution.pdf",
        fileSize: 1792000, // 1.75MB
        description: "เฉลยละเอียดวิชาฟิสิกส์ TBAT Mock Exam",
        uploadAdminId: normalAdmin.id,
        isActive: true,
        expiresAt: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log("✅ Created PDF solutions");

  // Create sample exam results for some users
  const createdExamCodes = await prisma.examCode.findMany({
    take: 5,
  });

  for (const examCode of createdExamCodes) {
    await prisma.examResult.create({
      data: {
        userId: examCode.userId,
        examCodeId: examCode.id,
        totalScore: Math.floor(Math.random() * 40) + 60, // 60-100
        biologyScore: examCode.subject === "BIOLOGY" ? Math.floor(Math.random() * 40) + 60 : null,
        chemistryScore:
          examCode.subject === "CHEMISTRY" ? Math.floor(Math.random() * 40) + 60 : null,
        physicsScore: examCode.subject === "PHYSICS" ? Math.floor(Math.random() * 40) + 60 : null,
        percentile: Math.floor(Math.random() * 30) + 70, // 70-100 percentile
        completionTime: Math.floor(Math.random() * 60) + 120, // 120-180 minutes
        expiresAt: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
        isAccessible: true,
      },
    });

    // Mark exam code as used
    await prisma.examCode.update({
      where: { id: examCode.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });
  }

  console.log("✅ Created sample exam results");

  // Create sample support ticket
  await prisma.supportTicket.create({
    data: {
      userId: testUsers[0]?.id || "",
      adminId: normalAdmin.id,
      issueType: "CODE_PROBLEM",
      description: "ไม่สามารถใช้รหัสสอบได้",
      status: "OPEN",
      priority: "MEDIUM",
    },
  });

  console.log("✅ Created sample support ticket");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
