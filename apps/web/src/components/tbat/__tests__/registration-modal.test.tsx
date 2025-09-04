import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegistrationModal } from '../registration-modal'

// Mock the API calls
global.fetch = vi.fn()

// Mock the formatCodeInput and isValidCodeFormat functions
vi.mock('@/lib/mock-api/codes', () => ({
  formatCodeInput: vi.fn((input: string) => {
    const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (clean.length <= 4) return `TBAT-${clean}`
    return `TBAT-${clean.slice(0, 4)}-${clean.slice(4, 8)}`
  }),
  isValidCodeFormat: vi.fn((code: string) => {
    return /^TBAT-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code.trim())
  })
}))

const mockProps = {
  isOpen: true,
  onClose: vi.fn(),
  onCodeValidated: vi.fn()
}

describe('RegistrationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('Basic Rendering', () => {
    it('should render when open', () => {
      render(<RegistrationModal {...mockProps} />)
      
      expect(screen.getByText('ตรวจสอบรหัส Box Set')).toBeInTheDocument()
      expect(screen.getByText('กรุณาใส่รหัสที่ได้รับจาก Box Set ของคุณ')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('TBAT-XXXX-XXXX')).toBeInTheDocument()
    })

    it('should not render when closed', () => {
      render(<RegistrationModal {...mockProps} isOpen={false} />)
      
      expect(screen.queryByText('ตรวจสอบรหัส Box Set')).not.toBeInTheDocument()
    })

    it('should render format hint', () => {
      render(<RegistrationModal {...mockProps} />)
      
      expect(screen.getByText('รูปแบบรหัส: TBAT-XXXX-XXXX')).toBeInTheDocument()
      expect(screen.getByText('ตัวอย่าง: TBAT-A7K9-M3P4')).toBeInTheDocument()
    })

    it('should have proper ARIA attributes', () => {
      render(<RegistrationModal {...mockProps} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby')
      expect(input).toHaveAttribute('autoComplete', 'off')
      expect(input).toHaveAttribute('autoFocus')
    })
  })

  describe('Code Input Formatting', () => {
    it('should format user input in real-time', async () => {
      const user = userEvent.setup()
      render(<RegistrationModal {...mockProps} />)
      
      const input = screen.getByPlaceholderText('TBAT-XXXX-XXXX')
      
      await user.type(input, 'A7K9M3P4')
      
      expect(input).toHaveValue('TBAT-A7K9-M3P4')
    })

    it('should handle partial input', async () => {
      const user = userEvent.setup()
      render(<RegistrationModal {...mockProps} />)
      
      const input = screen.getByPlaceholderText('TBAT-XXXX-XXXX')
      
      await user.type(input, 'A7K')
      
      expect(input).toHaveValue('TBAT-A7K')
    })
  })

  describe('Code Validation', () => {
    it('should show loading state during validation', async () => {
      // Mock delayed API response
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ valid: true, message: 'Valid code' })
        }), 100))
      )

      const user = userEvent.setup()
      render(<RegistrationModal {...mockProps} />)
      
      const input = screen.getByPlaceholderText('TBAT-XXXX-XXXX')
      await user.type(input, 'A7K9M3P4')
      
      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('กำลังตรวจสอบรหัส...')).toBeInTheDocument()
      })
    })

    it('should show success state for valid codes', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          valid: true,
          message: 'รหัสถูกต้อง',
          codeId: 'valid-code-id'
        })
      })

      const user = userEvent.setup()
      render(<RegistrationModal {...mockProps} />)
      
      const input = screen.getByPlaceholderText('TBAT-XXXX-XXXX')
      await user.type(input, 'A7K9M3P4')
      
      await waitFor(() => {
        expect(screen.getByText(/รหัสถูกต้อง/)).toBeInTheDocument()
      })

      // Should auto-close after success
      await waitFor(() => {
        expect(mockProps.onCodeValidated).toHaveBeenCalledWith('valid-code-id')
      }, { timeout: 2000 })
    })

    it('should show error state for invalid codes', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({
          valid: false,
          message: 'รหัสไม่ถูกต้อง',
          error: 'CODE_NOT_FOUND'
        })
      })

      const user = userEvent.setup()
      render(<RegistrationModal {...mockProps} />)
      
      const input = screen.getByPlaceholderText('TBAT-XXXX-XXXX')
      await user.type(input, 'INVALID1')
      
      await waitFor(() => {
        expect(screen.getByText(/รหัสไม่ถูกต้อง/)).toBeInTheDocument()
      })
    })

    it('should show appropriate recovery messages for different error types', async () => {
      const errorScenarios = [
        {
          error: 'INVALID_FORMAT',
          expectedMessage: 'รหัสต้องมีรูปแบบ TBAT-XXXX-XXXX เช่น TBAT-A7K9-M3P4'
        },
        {
          error: 'CODE_NOT_FOUND',
          expectedMessage: 'กรุณาตรวจสอบรหัสใน Box Set ของคุณให้ถูกต้อง'
        },
        {
          error: 'CODE_ALREADY_USED',
          expectedMessage: 'หากคุณเป็นเจ้าของรหัสนี้ กรุณาติดต่อทีมสนับสนุน'
        },
        {
          error: 'RATE_LIMITED',
          expectedMessage: 'กรุณารอ 5 นาทีก่อนลองใหม่'
        }
      ]

      for (const scenario of errorScenarios) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          json: () => Promise.resolve({
            valid: false,
            message: 'Error message',
            error: scenario.error
          })
        })

        const user = userEvent.setup()
        render(<RegistrationModal {...mockProps} isOpen={true} />)
        
        const input = screen.getByPlaceholderText('TBAT-XXXX-XXXX')
        await user.type(input, 'TEST1234')
        
        await waitFor(() => {
          expect(screen.getByText(scenario.expectedMessage)).toBeInTheDocument()
        })

        // Clean up for next iteration
        screen.getByRole('button', { name: 'ปิด' }).click()
        await waitFor(() => {
          expect(mockProps.onClose).toHaveBeenCalled()
        })
        
        vi.clearAllMocks()
      }
    })

    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const user = userEvent.setup()
      render(<RegistrationModal {...mockProps} />)
      
      const input = screen.getByPlaceholderText('TBAT-XXXX-XXXX')
      await user.type(input, 'A7K9M3P4')
      
      await waitFor(() => {
        expect(screen.getByText(/เกิดข้อผิดพลาดในการเชื่อมต่อ/)).toBeInTheDocument()
      })
    })
  })

  describe('User Interactions', () => {
    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<RegistrationModal {...mockProps} />)
      
      const closeButton = screen.getByRole('button', { name: 'ปิด' })
      await user.click(closeButton)
      
      expect(mockProps.onClose).toHaveBeenCalled()
    })

    it('should close modal when escape key is pressed', () => {
      render(<RegistrationModal {...mockProps} />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(mockProps.onClose).toHaveBeenCalled()
    })

    it('should submit on Enter key press', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          valid: true,
          message: 'Valid code',
          codeId: 'test-id'
        })
      })

      const user = userEvent.setup()
      render(<RegistrationModal {...mockProps} />)
      
      const input = screen.getByPlaceholderText('TBAT-XXXX-XXXX')
      await user.type(input, 'A7K9M3P4{enter}')
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })
    })

    it('should prevent closing during validation', () => {
      // Mock ongoing validation
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      )

      render(<RegistrationModal {...mockProps} />)
      
      // Trigger validation
      const input = screen.getByPlaceholderText('TBAT-XXXX-XXXX')
      fireEvent.change(input, { target: { value: 'A7K9M3P4' } })
      
      // Try to close
      const closeButton = screen.getByRole('button', { name: 'ปิด' })
      expect(closeButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper focus management', () => {
      render(<RegistrationModal {...mockProps} />)
      
      const input = screen.getByPlaceholderText('TBAT-XXXX-XXXX')
      expect(input).toHaveFocus()
    })

    it('should announce errors to screen readers', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({
          valid: false,
          message: 'Invalid code'
        })
      })

      const user = userEvent.setup()
      render(<RegistrationModal {...mockProps} />)
      
      const input = screen.getByPlaceholderText('TBAT-XXXX-XXXX')
      await user.type(input, 'INVALID1')
      
      await waitFor(() => {
        const errorElement = screen.getByRole('alert')
        expect(errorElement).toBeInTheDocument()
      })
    })

    it('should maintain color contrast for error states', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({
          valid: false,
          message: 'Invalid code'
        })
      })

      const user = userEvent.setup()
      render(<RegistrationModal {...mockProps} />)
      
      const input = screen.getByPlaceholderText('TBAT-XXXX-XXXX')
      await user.type(input, 'INVALID1')
      
      await waitFor(() => {
        expect(input).toHaveClass('border-red-500')
      })
    })
  })

  describe('Debouncing', () => {
    it('should debounce validation requests', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ valid: true, message: 'Valid' })
      })

      const user = userEvent.setup({ delay: null })
      render(<RegistrationModal {...mockProps} />)
      
      const input = screen.getByPlaceholderText('TBAT-XXXX-XXXX')
      
      // Type multiple characters quickly
      await user.type(input, 'A')
      await user.type(input, '7')
      await user.type(input, 'K')
      await user.type(input, '9')
      
      // Wait for debounce delay
      await waitFor(() => {
        // Should only make one API call after debouncing
        expect(global.fetch).toHaveBeenCalledTimes(1)
      }, { timeout: 1000 })
    })
  })
})