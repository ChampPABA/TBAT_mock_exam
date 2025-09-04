import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Rate limiting store for BoxSet code validation
const boxSetRateLimitStore = new Map<string, { attempts: number; resetTime: number }>();

// BoxSet code validation schema
const boxSetCodeSchema = z.object({
  code: z.string()
    .regex(/^TBAT-[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Invalid BoxSet code format. Expected: TBAT-XXXX-XXXX'),
});

// Valid BoxSet codes database (in production, this would be in a database)
const validBoxSetCodes = [
  { 
    code: 'TBAT-2024-0001',
    expiresAt: new Date('2025-12-31'),
    maxUses: 1,
    currentUses: 0,
    studentInfo: {
      school: 'โรงเรียนสาธิตมหาวิทยาลัยเชียงใหม่',
      grade: '12',
    },
  },
  { 
    code: 'TBAT-2024-0002',
    expiresAt: new Date('2025-12-31'),
    maxUses: 1,
    currentUses: 0,
    studentInfo: {
      school: 'โรงเรียนยุพราชวิทยาลัย',
      grade: '12',
    },
  },
  { 
    code: 'TBAT-2024-0003',
    expiresAt: new Date('2025-12-31'),
    maxUses: 1,
    currentUses: 0,
    studentInfo: {
      school: 'โรงเรียนมงฟอร์ตวิทยาลัย',
      grade: '12',
    },
  },
  // Demo codes for testing
  { 
    code: 'TBAT-DEMO-1234',
    expiresAt: new Date('2025-12-31'),
    maxUses: 100,
    currentUses: 0,
    studentInfo: {
      school: 'Demo School',
      grade: 'Demo',
    },
  },
  { 
    code: 'TBAT-TEST-5678',
    expiresAt: new Date('2025-12-31'),
    maxUses: 100,
    currentUses: 0,
    studentInfo: {
      school: 'Test School',
      grade: 'Test',
    },
  },
];

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `boxset:${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; remainingAttempts: number; resetTime: number } {
  const now = Date.now();
  const maxAttempts = 10; // Allow more attempts for BoxSet codes
  const windowMs = 5 * 60 * 1000; // 5 minutes window
  
  const record = boxSetRateLimitStore.get(key);

  // Clean up expired entries
  if (record && record.resetTime < now) {
    boxSetRateLimitStore.delete(key);
  }

  const currentRecord = boxSetRateLimitStore.get(key);
  
  if (!currentRecord) {
    boxSetRateLimitStore.set(key, {
      attempts: 1,
      resetTime: now + windowMs,
    });
    return { 
      allowed: true, 
      remainingAttempts: maxAttempts - 1,
      resetTime: now + windowMs,
    };
  }

  if (currentRecord.attempts >= maxAttempts) {
    return { 
      allowed: false, 
      remainingAttempts: 0,
      resetTime: currentRecord.resetTime,
    };
  }

  currentRecord.attempts += 1;
  boxSetRateLimitStore.set(key, currentRecord);
  
  return { 
    allowed: true, 
    remainingAttempts: maxAttempts - currentRecord.attempts,
    resetTime: currentRecord.resetTime,
  };
}

function validateBoxSetCode(code: string): { 
  valid: boolean; 
  error?: string; 
  studentInfo?: any;
} {
  const boxSet = validBoxSetCodes.find(bs => bs.code === code);
  
  if (!boxSet) {
    return { 
      valid: false, 
      error: 'รหัส BoxSet ไม่ถูกต้อง หรือไม่มีในระบบ',
    };
  }

  // Check expiration
  if (boxSet.expiresAt < new Date()) {
    return { 
      valid: false, 
      error: 'รหัส BoxSet หมดอายุแล้ว',
    };
  }

  // Check usage limit
  if (boxSet.currentUses >= boxSet.maxUses) {
    return { 
      valid: false, 
      error: 'รหัส BoxSet นี้ถูกใช้งานครบจำนวนที่กำหนดแล้ว',
    };
  }

  // Simulate incrementing usage (in production, update database)
  boxSet.currentUses += 1;

  return {
    valid: true,
    studentInfo: {
      ...boxSet.studentInfo,
      code: boxSet.code,
      remainingUses: boxSet.maxUses - boxSet.currentUses,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitKey = getRateLimitKey(request);
    const { allowed, remainingAttempts, resetTime } = checkRateLimit(rateLimitKey);

    if (!allowed) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: 'จำนวนการตรวจสอบเกินกำหนด กรุณารอสักครู่แล้วลองใหม่',
          retryAfter,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(resetTime).toISOString(),
            'Retry-After': String(retryAfter),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = boxSetCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'รูปแบบรหัส BoxSet ไม่ถูกต้อง ต้องเป็น TBAT-XXXX-XXXX',
          details: validation.error.errors,
        },
        { 
          status: 400,
          headers: {
            'X-RateLimit-Remaining': String(remainingAttempts),
            'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          },
        }
      );
    }

    const { code } = validation.data;

    // Add small delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validate the BoxSet code
    const { valid, error, studentInfo } = validateBoxSetCode(code);

    if (!valid) {
      // Log failed attempt
      console.log(`[BOXSET] Failed validation attempt: ${code} at ${new Date().toISOString()}`);
      
      return NextResponse.json(
        { 
          success: false,
          error: error || 'รหัส BoxSet ไม่ถูกต้อง',
        },
        { 
          status: 401,
          headers: {
            'X-RateLimit-Remaining': String(remainingAttempts),
            'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          },
        }
      );
    }

    // Reset rate limit on successful validation
    boxSetRateLimitStore.delete(rateLimitKey);

    // Log successful validation
    console.log(`[BOXSET] Successful validation: ${code} at ${new Date().toISOString()}`);

    // Return success response with student info
    return NextResponse.json(
      {
        success: true,
        message: 'รหัส BoxSet ถูกต้อง',
        studentInfo,
        nextStep: '/register',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[BOXSET] Validation error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json(
    { 
      status: 'healthy',
      endpoint: '/api/auth/validate-boxset',
      methods: ['POST'],
      validCodes: process.env.NODE_ENV === 'development' ? [
        'TBAT-2024-0001',
        'TBAT-2024-0002',
        'TBAT-2024-0003',
        'TBAT-DEMO-1234',
        'TBAT-TEST-5678',
      ] : undefined,
    },
    { status: 200 }
  );
}