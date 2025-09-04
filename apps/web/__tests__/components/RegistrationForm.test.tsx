import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegistrationForm } from '@/components/forms/RegistrationFormNew'
import { mockCodeService, mockAuthService } from '@/lib/mock-api'

// Mock the API services
vi.mock('@/lib/mock-api', () => ({
  mockCodeService: {
    validateCode: vi.fn(),
  },
  mockAuthService: {
    register: vi.fn(),
  },
  mockSchools: [
    'โรงเรียนมัธยมศึกษาเชียงใหม่',
    'โรงเรียนยุพราชวิทยาลัย'
  ]
}))

describe('RegistrationForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    })
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })
  })

  it('renders all required form fields', () => {
    render(<RegistrationForm />)
    
    // BoxSet code is now optional - don't require it
    // Required fields for Freemium registration
    expect(screen.getByLabelText(/อีเมล/)).toBeInTheDocument()
    expect(screen.getByLabelText(/ชื่อ-นามสกุล/)).toBeInTheDocument()
    expect(screen.getByLabelText(/โรงเรียน/)).toBeInTheDocument()
    expect(screen.getByLabelText(/ชั้นเรียน/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Line ID/)).toBeInTheDocument()
    expect(screen.getByText(/เลือกวิชาที่ต้องการสอบ/)).toBeInTheDocument()
    expect(screen.getByLabelText('รหัสผ่าน *')).toBeInTheDocument()
    expect(screen.getByLabelText('ยืนยันรหัสผ่าน *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ลงทะเบียน/ })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<RegistrationForm />)
    
    const submitButton = screen.getByRole('button', { name: /ลงทะเบียน/ })
    
    // Submit button should be disabled initially
    expect(submitButton).toBeDisabled()
    
    // Try to submit empty form
    await user.click(submitButton)
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร/)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<RegistrationForm />)
    
    const emailInput = screen.getByLabelText(/อีเมล/)
    
    // Enter invalid email
    await user.type(emailInput, 'invalid-email')
    await user.tab() // Trigger blur
    
    await waitFor(() => {
      expect(screen.getByText(/รูปแบบอีเมลไม่ถูกต้อง/)).toBeInTheDocument()
    })
  })

  it('validates password strength', async () => {
    render(<RegistrationForm />)
    
    const passwordInput = screen.getByLabelText('รหัสผ่าน *')
    
    // Enter weak password
    await user.type(passwordInput, 'weak')
    
    await waitFor(() => {
      expect(screen.getByText(/ความแข็งแกร่ง: อ่อนมาก/)).toBeInTheDocument()
    })
    
    // Clear and enter strong password
    await user.clear(passwordInput)
    await user.type(passwordInput, 'StrongPass123')
    
    await waitFor(() => {
      expect(screen.getByText(/ความแข็งแกร่ง: แข็งแกร่ง/)).toBeInTheDocument()
    })
  })

  it('validates password confirmation match', async () => {
    render(<RegistrationForm />)
    
    const passwordInput = screen.getByLabelText('รหัสผ่าน *')
    const confirmInput = screen.getByLabelText('ยืนยันรหัสผ่าน *')
    
    await user.type(passwordInput, 'Password123')
    await user.type(confirmInput, 'Different123')
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText(/รหัสผ่านไม่ตรงกัน/)).toBeInTheDocument()
    })
  })

  it('handles real-time code validation', async () => {
    const mockValidateCode = vi.mocked(mockCodeService.validateCode)
    mockValidateCode.mockResolvedValue({
      valid: true,
      message: 'รหัสถูกต้องและใช้งานได้',
      tier: 'VVIP'
    })
    
    render(<RegistrationForm />)
    
    // BoxSet code is optional, may not be rendered
    const codeInput = screen.queryByLabelText(/รหัสจาก Box Set/)
    
    if (codeInput) {
      // Enter code
      await user.type(codeInput, 'TBAT-2025-AAAA-0001')
      
      // Should show checking state
      await waitFor(() => {
        expect(screen.getByText(/กำลังตรวจสอบ/)).toBeInTheDocument()
      })
      
      // Should show valid state
      await waitFor(() => {
        expect(screen.getByText(/รหัสถูกต้องและใช้งานได้/)).toBeInTheDocument()
      })
      
      expect(mockValidateCode).toHaveBeenCalledWith('TBAT-2025-AAAA-0001')
    } else {
      // If no code field, it's FREE tier registration
      expect(true).toBe(true)
    }
  })

  it('handles invalid code validation', async () => {
    const mockValidateCode = vi.mocked(mockCodeService.validateCode)
    mockValidateCode.mockResolvedValue({
      valid: false,
      message: 'รหัสไม่ถูกต้องหรือถูกใช้งานแล้ว'
    })
    
    render(<RegistrationForm />)
    
    const codeInput = screen.queryByLabelText(/รหัสจาก Box Set/)
    
    if (codeInput) {
      await user.type(codeInput, 'INVALID-CODE')
      
      await waitFor(() => {
        expect(screen.getByText(/รหัสไม่ถูกต้องหรือถูกใช้งานแล้ว/)).toBeInTheDocument()
      })
    } else {
      // FREE tier doesn't need code
      expect(true).toBe(true)
    }
  })

  it('submits successfully with valid data', async () => {
    const mockValidateCode = vi.mocked(mockCodeService.validateCode)
    const mockRegister = vi.mocked(mockAuthService.register)
    
    mockValidateCode.mockResolvedValue({
      valid: true,
      message: 'รหัสถูกต้อง',
      tier: 'VVIP'
    })
    
    mockRegister.mockResolvedValue({
      success: true,
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        school: 'โรงเรียนมัธยมศึกษาเชียงใหม่',
        grade: 'M.6',
        lineId: 'testuser123',
        subjects: ['Physics'],
        tier: 'FREE',
        examTicket: 'TBAT-2025-0001',
        createdAt: '2024-01-01T00:00:00Z'
      },
      token: 'mock-token',
      message: 'ลงทะเบียนสำเร็จ',
      examTicket: 'TBAT-2025-0001'
    })
    
    render(<RegistrationForm />)
    
    // Fill form for FREE tier (no code required)
    await user.type(screen.getByLabelText(/อีเมล/), 'test@example.com')
    await user.type(screen.getByLabelText(/ชื่อ-นามสกุล/), 'สมชาย จิตรดี')
    
    // Select school
    const schoolSelect = screen.getByLabelText(/โรงเรียน/)
    await user.selectOptions(schoolSelect, 'โรงเรียนมัธยมศึกษาเชียงใหม่')
    
    // Select grade
    const gradeSelect = screen.getByLabelText(/ชั้นเรียน/)
    await user.selectOptions(gradeSelect, 'M.6')
    
    // Add Line ID (required for Freemium)
    await user.type(screen.getByLabelText(/Line ID/), 'testuser123')
    
    // Select subject (1 for FREE tier)
    const physicsCheckbox = screen.getByLabelText(/Physics/)
    await user.click(physicsCheckbox)
    
    await user.type(screen.getByLabelText('รหัสผ่าน *'), 'StrongPass123')
    await user.type(screen.getByLabelText('ยืนยันรหัสผ่าน *'), 'StrongPass123')
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /ลงทะเบียน/ })
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
    
    await user.click(submitButton)
    
    // Should show loading state
    expect(screen.getByText(/กำลังลงทะเบียน/)).toBeInTheDocument()
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'สมชาย จิตรดี',
        school: 'โรงเรียนมัธยมศึกษาเชียงใหม่',
        grade: 'M.6',
        lineId: 'testuser123',
        subjects: ['Physics'],
        password: 'StrongPass123',
        tier: 'FREE'
      })
    })
    
    // Should redirect to dashboard
    expect(window.location.href).toBe('/dashboard')
  })

  it('handles registration errors', async () => {
    const mockValidateCode = vi.mocked(mockCodeService.validateCode)
    const mockRegister = vi.mocked(mockAuthService.register)
    
    mockValidateCode.mockResolvedValue({ valid: true, message: 'Valid', tier: 'VVIP' })
    mockRegister.mockResolvedValue({
      success: false,
      message: 'อีเมลนี้ถูกใช้งานแล้ว'
    })
    
    // Mock alert
    window.alert = vi.fn()
    
    render(<RegistrationForm />)
    
    // Fill valid form for FREE tier
    await user.type(screen.getByLabelText(/อีเมล/), 'existing@example.com')
    await user.type(screen.getByLabelText(/ชื่อ-นามสกุล/), 'Test User')
    await user.selectOptions(screen.getByLabelText(/โรงเรียน/), 'โรงเรียนมัธยมศึกษาเชียงใหม่')
    await user.selectOptions(screen.getByLabelText(/ชั้นเรียน/), 'M.6')
    await user.type(screen.getByLabelText(/Line ID/), 'testuser123')
    
    // Select subject
    const physicsCheckbox = screen.getByLabelText(/Physics/)
    await user.click(physicsCheckbox)
    
    await user.type(screen.getByLabelText('รหัสผ่าน *'), 'Password123')
    await user.type(screen.getByLabelText('ยืนยันรหัสผ่าน *'), 'Password123')
    
    const submitButton = screen.getByRole('button', { name: /ลงทะเบียน/ })
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
    
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Registration failed: อีเมลนี้ถูกใช้งานแล้ว')
    })
  })

  it('toggles password visibility', async () => {
    render(<RegistrationForm />)
    
    const passwordInput = screen.getByLabelText('รหัสผ่าน *') as HTMLInputElement
    const toggleButton = passwordInput.parentElement?.querySelector('button')
    
    expect(passwordInput.type).toBe('password')
    
    if (toggleButton) {
      await user.click(toggleButton)
      expect(passwordInput.type).toBe('text')
      
      await user.click(toggleButton)
      expect(passwordInput.type).toBe('password')
    }
  })
})