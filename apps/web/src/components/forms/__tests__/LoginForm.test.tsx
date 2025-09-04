import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import { LoginForm } from "../LoginForm"

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
})

describe("LoginForm", () => {
  beforeEach(() => {
    mockFetch.mockClear()
    window.location.href = ''
  })

  it("renders login form with all required fields", () => {
    render(<LoginForm />)
    
    expect(screen.getByLabelText(/อีเมล/)).toBeInTheDocument()
    expect(screen.getByLabelText(/รหัสผ่าน/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /เข้าสู่ระบบ/ })).toBeInTheDocument()
    expect(screen.getByText(/ลืมรหัสผ่าน/)).toBeInTheDocument()
    expect(screen.getByText(/ยังไม่มีบัญชี/)).toBeInTheDocument()
  })

  it("validates required email field", async () => {
    render(<LoginForm />)
    
    const submitButton = screen.getByRole("button", { name: /เข้าสู่ระบบ/ })
    const emailInput = screen.getByLabelText(/อีเมล/)
    
    // Try to submit without email
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/กรุณากรอกอีเมล/)).toBeInTheDocument()
    })

    // Submit button should be disabled when form is invalid
    expect(submitButton).toBeDisabled()
  })

  it("validates email format", async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/อีเมล/)
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/)
    
    // Enter invalid email format
    fireEvent.change(emailInput, { target: { value: "invalid-email" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    
    await waitFor(() => {
      expect(screen.getByText(/รูปแบบอีเมลไม่ถูกต้อง/)).toBeInTheDocument()
    })
  })

  it("validates required password field", async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/อีเมล/)
    const submitButton = screen.getByRole("button", { name: /เข้าสู่ระบบ/ })
    
    // Enter valid email but no password
    fireEvent.change(emailInput, { target: { value: "test@email.com" } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/กรุณากรอกรหัสผ่าน/)).toBeInTheDocument()
    })
  })

  it("toggles password visibility", () => {
    render(<LoginForm />)
    
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/)
    const toggleButton = screen.getByLabelText(/แสดงรหัสผ่าน/)
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute("type", "password")
    
    // Click to show password
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute("type", "text")
    
    // Click to hide password
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute("type", "password")
  })

  it("submits successfully with valid credentials", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: "1", email: "test@email.com", name: "Test User" },
        message: "เข้าสู่ระบบสำเร็จ"
      })
    })

    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/อีเมล/)
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/)
    const submitButton = screen.getByRole("button", { name: /เข้าสู่ระบบ/ })
    
    // Fill form with valid data
    fireEvent.change(emailInput, { target: { value: "test@email.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    
    // Submit form
    fireEvent.click(submitButton)
    
    // Check loading state
    await waitFor(() => {
      expect(screen.getByText(/กำลังเข้าสู่ระบบ/)).toBeInTheDocument()
    })
    
    // Verify API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@email.com",
          password: "password123"
        }),
      })
    })

    // Check redirect
    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard")
    })
  })

  it("displays appropriate error messages for invalid credentials", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: "ไม่พบผู้ใช้งาน (User not found)"
      })
    })

    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/อีเมล/)
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/)
    const submitButton = screen.getByRole("button", { name: /เข้าสู่ระบบ/ })
    
    // Fill form with invalid credentials
    fireEvent.change(emailInput, { target: { value: "wrong@email.com" } })
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } })
    
    // Submit form
    fireEvent.click(submitButton)
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/ไม่พบผู้ใช้งาน/)).toBeInTheDocument()
    })
  })

  it("shows loading state during authentication", async () => {
    // Mock a delayed response
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({ success: true })
          })
        }, 100)
      })
    )

    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/อีเมล/)
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/)
    const submitButton = screen.getByRole("button", { name: /เข้าสู่ระบบ/ })
    
    // Fill form
    fireEvent.change(emailInput, { target: { value: "test@email.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    
    // Submit form
    fireEvent.click(submitButton)
    
    // Check loading state
    expect(screen.getByText(/กำลังเข้าสู่ระบบ/)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it("handles network errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"))

    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/อีเมล/)
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/)
    const submitButton = screen.getByRole("button", { name: /เข้าสู่ระบบ/ })
    
    // Fill form
    fireEvent.change(emailInput, { target: { value: "test@email.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    
    // Submit form
    fireEvent.click(submitButton)
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์/)).toBeInTheDocument()
    })
  })
})