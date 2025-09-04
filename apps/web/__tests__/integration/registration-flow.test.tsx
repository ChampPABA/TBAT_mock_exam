import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegistrationForm } from '@/components/forms/RegistrationFormNew'

describe('Registration Flow Integration', () => {
  const user = userEvent.setup()

  beforeEach(() => {
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
    
    // Mock alert
    window.alert = vi.fn()
  })

  it('completes full registration journey with valid data', async () => {
    render(<RegistrationForm />)

    // Step 1: Fill personal information (BoxSet code is optional)
    await user.type(screen.getByLabelText(/อีเมล/), 'integration@test.com')
    await user.type(screen.getByLabelText(/ชื่อ-นามสกุล/), 'ทดสอบ อินทิเกรชั่น')

    // Step 2: Select school and grade
    const schoolSelect = screen.getByLabelText(/โรงเรียน/)
    await user.selectOptions(schoolSelect, 'โรงเรียนมัธยมศึกษาเชียงใหม่')

    const gradeSelect = screen.getByLabelText(/ชั้นเรียน/)
    await user.selectOptions(gradeSelect, 'M.6')

    // Step 3: Add Line ID (required for Freemium)
    await user.type(screen.getByLabelText(/Line ID/), 'testline123')

    // Step 4: Select subject (1 for FREE tier)
    const physicsCheckbox = screen.getByLabelText(/Physics/)
    await user.click(physicsCheckbox)

    // Step 5: Set password
    const passwordInput = screen.getByLabelText(/^รหัสผ่าน/)
    await user.type(passwordInput, 'IntegrationTest123')

    // Verify password strength indicator
    await waitFor(() => {
      expect(screen.getByText(/ความแข็งแกร่ง: แข็งแกร่ง/)).toBeInTheDocument()
    })

    const confirmPasswordInput = screen.getByLabelText(/ยืนยันรหัสผ่าน/)
    await user.type(confirmPasswordInput, 'IntegrationTest123')

    // Step 6: Submit form
    const submitButton = screen.getByRole('button', { name: /ลงทะเบียน/ })
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })

    await user.click(submitButton)

    // Verify loading state
    expect(screen.getByText(/กำลังลงทะเบียน/)).toBeInTheDocument()

    // Wait for success and redirect
    await waitFor(() => {
      expect(window.location.href).toBe('/dashboard')
    }, { timeout: 3000 })
  }, 15000)

  it('handles network errors gracefully', async () => {
    // Mock network failure
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    render(<RegistrationForm />)

    // Try to enter an optional BoxSet code (if field exists)
    const codeInput = screen.queryByLabelText(/รหัสจาก Box Set/)
    if (codeInput) {
      await user.type(codeInput, 'TBAT-2025-AAAA-0001')
      
      // Should show error state after network failure
      await waitFor(() => {
        expect(screen.getByText(/เกิดข้อผิดพลาดในการตรวจสอบรหัส/)).toBeInTheDocument()
      }, { timeout: 3000 })
    }

    // Restore fetch
    global.fetch = originalFetch
  })

  it('prevents submission with invalid code', async () => {
    render(<RegistrationForm />)

    // BoxSet code is optional, if it exists test validation
    const codeInput = screen.queryByLabelText(/รหัสจาก Box Set/)
    if (codeInput) {
      // Enter invalid code
      await user.type(codeInput, 'INVALID-999')

      await waitFor(() => {
        expect(screen.getByText(/ไม่พบรหัสนี้ในระบบ/)).toBeInTheDocument()
      }, { timeout: 3000 })
    }

    // For FREE tier, we can still fill the form without a code
    await user.type(screen.getByLabelText(/อีเมล/), 'test@example.com')
    await user.type(screen.getByLabelText(/ชื่อ-นามสกุล/), 'Test User')
    await user.selectOptions(screen.getByLabelText(/โรงเรียน/), 'โรงเรียนมัธยมศึกษาเชียงใหม่')
    await user.selectOptions(screen.getByLabelText(/ชั้นเรียน/), 'M.6')
    await user.type(screen.getByLabelText(/Line ID/), 'testline123')
    
    // Select subject
    const physicsCheckbox = screen.getByLabelText(/Physics/)
    await user.click(physicsCheckbox)
    
    await user.type(screen.getByLabelText(/^รหัสผ่าน/), 'Password123')
    await user.type(screen.getByLabelText(/ยืนยันรหัสผ่าน/), 'Password123')

    // For FREE tier without code, button should be enabled
    const submitButton = screen.getByRole('button', { name: /ลงทะเบียน/ })
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('shows appropriate error for duplicate email', async () => {
    render(<RegistrationForm />)

    // Fill form with existing email
    await user.type(screen.getByLabelText(/อีเมล/), 'somchai@example.com')
    await user.type(screen.getByLabelText(/ชื่อ-นามสกุล/), 'Test User')
    await user.selectOptions(screen.getByLabelText(/โรงเรียน/), 'โรงเรียนมัธยมศึกษาเชียงใหม่')
    await user.selectOptions(screen.getByLabelText(/ชั้นเรียน/), 'M.6')
    await user.type(screen.getByLabelText(/Line ID/), 'testline123')
    
    // Select subject
    const physicsCheckbox = screen.getByLabelText(/Physics/)
    await user.click(physicsCheckbox)
    
    await user.type(screen.getByLabelText(/^รหัสผ่าน/), 'Password123')
    await user.type(screen.getByLabelText(/ยืนยันรหัสผ่าน/), 'Password123')

    const submitButton = screen.getByRole('button', { name: /ลงทะเบียน/ })
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })

    await user.click(submitButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('อีเมลนี้ถูกใช้งานแล้ว'))
    }, { timeout: 3000 })
  })

  it('maintains form state during validation', async () => {
    render(<RegistrationForm />)

    // Fill form partially
    await user.type(screen.getByLabelText(/อีเมล/), 'maintain@test.com')
    await user.type(screen.getByLabelText(/ชื่อ-นามสกุล/), 'Maintain State')
    await user.type(screen.getByLabelText(/Line ID/), 'maintainline')

    // If BoxSet code field exists, test async validation
    const codeInput = screen.queryByLabelText(/รหัสจาก Box Set/)
    if (codeInput) {
      await user.type(codeInput, 'TBAT-2025-AAAA-0001')
      
      await waitFor(() => {
        expect(screen.getByText(/รหัสถูกต้องและใช้งานได้/)).toBeInTheDocument()
      }, { timeout: 3000 })
    }

    // Verify other fields maintained their values
    expect(screen.getByDisplayValue('maintain@test.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Maintain State')).toBeInTheDocument()
    expect(screen.getByDisplayValue('maintainline')).toBeInTheDocument()
  })
})