import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import { LoginForm } from "@/components/forms/LoginForm"

// Mock fetch for API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
})

describe("Login Flow Integration", () => {
  beforeEach(() => {
    mockFetch.mockClear()
    window.location.href = ''
  })

  it("completes full login journey and redirects to dashboard", async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: {
          id: "user_123",
          email: "student@school.com",
          name: "นักเรียน ทดสอบ",
          school: "โรงเรียนทดสอบ",
          grade: "M.6"
        },
        message: "เข้าสู่ระบบสำเร็จ"
      })
    })

    render(<LoginForm />)

    // Step 1: User sees the login form
    expect(screen.getByText(/เข้าสู่ระบบ/)).toBeInTheDocument()
    expect(screen.getByLabelText(/อีเมล/)).toBeInTheDocument()
    expect(screen.getByLabelText(/รหัสผ่าน/)).toBeInTheDocument()

    // Step 2: User fills in valid credentials
    const emailInput = screen.getByLabelText(/อีเมล/)
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/)
    
    fireEvent.change(emailInput, { target: { value: "student@school.com" } })
    fireEvent.change(passwordInput, { target: { value: "SecurePass123" } })

    // Step 3: Form validation passes
    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: /เข้าสู่ระบบ/ })
      expect(submitButton).not.toBeDisabled()
    })

    // Step 4: User submits the form
    const submitButton = screen.getByRole("button", { name: /เข้าสู่ระบบ/ })
    fireEvent.click(submitButton)

    // Step 5: Loading state appears
    await waitFor(() => {
      expect(screen.getByText(/กำลังเข้าสู่ระบบ/)).toBeInTheDocument()
    })

    // Step 6: API is called with correct data
    expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "student@school.com",
        password: "SecurePass123"
      }),
    })

    // Step 7: User is redirected to dashboard after successful login
    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard")
    })
  })

  it("handles network errors gracefully", async () => {
    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error("Network connection failed"))

    render(<LoginForm />)

    // Fill in form
    const emailInput = screen.getByLabelText(/อีเมล/)
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/)
    
    fireEvent.change(emailInput, { target: { value: "test@email.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })

    // Submit form
    const submitButton = screen.getByRole("button", { name: /เข้าสู่ระบบ/ })
    fireEvent.click(submitButton)

    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText(/เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์/)).toBeInTheDocument()
    })

    // User should remain on login page
    expect(window.location.href).toBe('')
  })

  it("maintains session state after successful login", async () => {
    // Mock successful login response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: {
          id: "user_456",
          email: "test@email.com",
          name: "Test User",
          school: "Test School",
          grade: "M.5"
        },
        message: "เข้าสู่ระบบสำเร็จ"
      })
    })

    render(<LoginForm />)

    // Complete login flow
    const emailInput = screen.getByLabelText(/อีเมล/)
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/)
    
    fireEvent.change(emailInput, { target: { value: "test@email.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })

    const submitButton = screen.getByRole("button", { name: /เข้าสู่ระบบ/ })
    fireEvent.click(submitButton)

    // Verify redirect happens (indicating session was established)
    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard")
    })

    // Verify the API was called (which would set HTTP-only cookies)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it("handles multiple consecutive login attempts", async () => {
    // First attempt - wrong password
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: "รหัสผ่านไม่ถูกต้อง (Invalid password)"
        })
      })
      // Second attempt - success
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: {
            id: "user_789",
            email: "retry@email.com",
            name: "Retry User",
            school: "Retry School",
            grade: "M.4"
          },
          message: "เข้าสู่ระบบสำเร็จ"
        })
      })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/อีเมล/)
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/)
    const submitButton = screen.getByRole("button", { name: /เข้าสู่ระบบ/ })

    // First attempt
    fireEvent.change(emailInput, { target: { value: "retry@email.com" } })
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } })
    fireEvent.click(submitButton)

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/รหัสผ่านไม่ถูกต้อง/)).toBeInTheDocument()
    })

    // Second attempt with correct password
    fireEvent.change(passwordInput, { target: { value: "correctpassword" } })
    fireEvent.click(submitButton)

    // Should succeed and redirect
    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard")
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it("validates form fields before allowing submission", async () => {
    render(<LoginForm />)

    const submitButton = screen.getByRole("button", { name: /เข้าสู่ระบบ/ })

    // Initially button should be disabled (empty form)
    expect(submitButton).toBeDisabled()

    // Fill email only
    const emailInput = screen.getByLabelText(/อีเมล/)
    fireEvent.change(emailInput, { target: { value: "test@email.com" } })

    // Still disabled (missing password)
    expect(submitButton).toBeDisabled()

    // Add password
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/)
    fireEvent.change(passwordInput, { target: { value: "password123" } })

    // Now should be enabled
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })

    // Invalid email should disable again
    fireEvent.change(emailInput, { target: { value: "invalid-email" } })
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })
})