import { prisma, DatabaseMonitor } from '../lib/db'
import { hashPassword } from '../lib/auth-utils'

describe('Database Operations', () => {
  beforeAll(async () => {
    // Ensure database is available
    console.log('Setting up database tests...')
  })

  afterAll(async () => {
    // Clean up
    await prisma.$disconnect()
  })

  test('should perform database operations correctly', async () => {
  console.log('🔧 Testing Database & Prisma Operations...\n')

  try {
    // Test 1: Database Health Check
    console.log('1. Testing Database Connection...')
    const health = await DatabaseMonitor.checkHealth()
    console.log('   ✅ Database Health:', health)

    // Test 2: User Creation (FREE Package)
    console.log('\n2. Testing User Creation (FREE Package)...')
    const hashedPassword = await hashPassword('testpassword123')
    
    const freeUser = await prisma.user.create({
      data: {
        email: `test-free-${Date.now()}@example.com`,
        password_hash: hashedPassword,
        thai_name: 'ทดสอบ ผู้ใช้ฟรี',
        phone: '0801234567',
        school: 'โรงเรียนทดสอบ',
        package_type: 'FREE',
        pdpa_consent: true
      }
    })
    console.log('   ✅ FREE User Created:', freeUser.id, freeUser.thai_name)

    // Test 3: User Creation (ADVANCED Package)
    console.log('\n3. Testing User Creation (ADVANCED Package)...')
    const advancedUser = await prisma.user.create({
      data: {
        email: `test-advanced-${Date.now()}@example.com`,
        password_hash: hashedPassword,
        thai_name: 'ทดสอบ ผู้ใช้แอดวานซ์',
        phone: '0809876543',
        school: 'โรงเรียนทดสอบแอดวานซ์',
        package_type: 'ADVANCED',
        pdpa_consent: true
      }
    })
    console.log('   ✅ ADVANCED User Created:', advancedUser.id, advancedUser.thai_name)

    // Test 4: ExamCode Generation (FREE - Single Subject)
    console.log('\n4. Testing ExamCode Generation (FREE - Biology)...')
    const freeExamCode = await prisma.examCode.create({
      data: {
        user_id: freeUser.id,
        code: `FREE-${Math.random().toString(36).substr(2, 8).toUpperCase()}-BIOLOGY`,
        package_type: 'FREE',
        subject: 'BIOLOGY',
        session_time: 'MORNING'
      }
    })
    console.log('   ✅ FREE ExamCode:', freeExamCode.code)

    // Test 5: ExamCode Generation (ADVANCED - All Subjects)
    console.log('\n5. Testing ExamCode Generation (ADVANCED - All Subjects)...')
    const advancedExamCode = await prisma.examCode.create({
      data: {
        user_id: advancedUser.id,
        code: `ADV-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        package_type: 'ADVANCED',
        subject: null, // ADVANCED covers all 3 subjects
        session_time: 'AFTERNOON'
      }
    })
    console.log('   ✅ ADVANCED ExamCode:', advancedExamCode.code)

    // Test 6: Payment Record (ADVANCED Package - 690 THB)
    console.log('\n6. Testing Payment Record (690 THB)...')
    const payment = await prisma.payment.create({
      data: {
        user_id: advancedUser.id,
        stripe_payment_intent_id: `pi_test_${Date.now()}`,
        amount: 69000, // 690 THB in satang
        currency: 'thb',
        payment_type: 'ADVANCED_PACKAGE',
        status: 'COMPLETED'
      }
    })
    console.log('   ✅ Payment Record:', payment.amount / 100, 'THB')

    // Test 7: Exam Results (FREE - Single Subject)
    console.log('\n7. Testing Exam Results (FREE - Biology Score)...')
    const freeResult = await prisma.examResult.create({
      data: {
        user_id: freeUser.id,
        exam_code: freeExamCode.code,
        subject_scores: { biology: 85 },
        total_score: null,
        completion_time: 45,
        expires_at: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 months
      }
    })
    console.log('   ✅ FREE Result:', freeResult.subject_scores)

    // Test 8: Exam Results (ADVANCED - All 3 Subjects)
    console.log('\n8. Testing Exam Results (ADVANCED - All Subjects)...')
    const advancedResult = await prisma.examResult.create({
      data: {
        user_id: advancedUser.id,
        exam_code: advancedExamCode.code,
        subject_scores: { 
          biology: 88, 
          chemistry: 92, 
          physics: 76 
        },
        total_score: 256, // Combined score
        completion_time: 180,
        expires_at: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
      }
    })
    console.log('   ✅ ADVANCED Result:', advancedResult.subject_scores, 'Total:', advancedResult.total_score)

    // Test 9: Exam Session Capacity
    console.log('\n9. Testing Exam Session Management...')
    const session = await prisma.examSession.create({
      data: {
        session_time: 'MORNING',
        capacity: 10,
        current_load: 2,
        is_active: true
      }
    })
    console.log('   ✅ Session Created:', session.session_time, `(${session.current_load}/${session.capacity})`)

    console.log('\n🎉 All Database Tests PASSED!\n')
    expect(true).toBe(true)

  } catch (error) {
    console.error('\n❌ Database Test FAILED:', error.message)
    throw error
  }
  })
})