import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/providers/auth-provider'
import '@testing-library/jest-dom'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Test component to access auth context
function TestComponent() {
  const { user, isAuthenticated, isLoading, login, logout, refreshSession } = useAuth()

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'No User'}</div>
      <button onClick={() => login({ email: 'test@medical.ac.th', password: 'password' })}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => refreshSession()}>Refresh Session</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    mockFetch.mockClear()
  })

  it('provides initial unauthenticated state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated')
    expect(screen.getByTestId('user')).toHaveTextContent('No User')
  })

  it('restores session on mount when session exists', async () => {
    const mockUser = {
      id: '1',
      email: 'test@medical.ac.th',
      thaiName: 'Test User',
      packageType: 'ADVANCED',
      isActive: true
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: mockUser,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        timeRemaining: '30:00'
      })
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated')
    })

    expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser))
  })

  it('handles login successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@medical.ac.th',
      thaiName: 'Test User',
      packageType: 'ADVANCED',
      isActive: true
    }

    // Mock initial session check (no session)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    // Mock login API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: mockUser,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        timeRemaining: '30:00'
      })
    })

    const loginButton = screen.getByText('Login')

    await act(async () => {
      loginButton.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated')
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@medical.ac.th',
        password: 'password'
      })
    })
  })

  it('handles login failure', async () => {
    // Mock initial session check (no session)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    // Mock failed login
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' })
    })

    const loginButton = screen.getByText('Login')

    await act(async () => {
      loginButton.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated')
    })

    expect(screen.getByTestId('user')).toHaveTextContent('No User')
  })

  it('handles logout', async () => {
    const mockUser = {
      id: '1',
      email: 'test@medical.ac.th',
      thaiName: 'Test User',
      packageType: 'ADVANCED',
      isActive: true
    }

    // Mock initial session with authenticated user
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: mockUser,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        timeRemaining: '30:00'
      })
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated')
    })

    // Mock logout API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logged out successfully' })
    })

    const logoutButton = screen.getByText('Logout')
    await act(async () => {
      logoutButton.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated')
    })

    expect(screen.getByTestId('user')).toHaveTextContent('No User')
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('tbat_session')
  })

  it('handles session refresh', async () => {
    const mockUser = {
      id: '1',
      email: 'test@medical.ac.th',
      thaiName: 'Test User',
      packageType: 'ADVANCED',
      isActive: true
    }

    // Mock initial session with authenticated user
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: mockUser,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        timeRemaining: '30:00'
      })
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated')
    })

    // Mock session refresh
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        timeRemaining: '60:00'
      })
    })

    const refreshButton = screen.getByText('Refresh Session')
    await act(async () => {
      refreshButton.click()
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    })
  })

  it('handles network errors gracefully', async () => {
    // Mock network error on initial session check
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated')
    })

    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
  })

  it('handles remember me functionality', async () => {
    const mockUser = {
      id: '1',
      email: 'test@medical.ac.th',
      thaiName: 'Test User',
      packageType: 'ADVANCED',
      isActive: true
    }

    // Mock initial session check (no session)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    })

    function TestComponentWithRememberMe() {
      const { login } = useAuth()

      return (
        <button onClick={() => login({ email: 'test@medical.ac.th', password: 'password', rememberMe: true })}>
          Login With Remember Me
        </button>
      )
    }

    render(
      <AuthProvider>
        <TestComponentWithRememberMe />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Login With Remember Me')).toBeInTheDocument()
    })

    // Mock successful login with remember me
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: mockUser,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        timeRemaining: '7 days'
      })
    })

    const loginButton = screen.getByText('Login With Remember Me')

    await act(async () => {
      loginButton.click()
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@medical.ac.th',
        password: 'password',
        rememberMe: true
      })
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('tbat_session', expect.any(String))
  })

  it('provides loading state during authentication', async () => {
    // Mock slow initial session check
    mockFetch.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: false,
        status: 401
      }), 100))
    )

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Should show loading initially
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })
  })

  it('clears session data on logout API failure', async () => {
    const mockUser = {
      id: '1',
      email: 'test@medical.ac.th',
      thaiName: 'Test User',
      packageType: 'ADVANCED',
      isActive: true
    }

    // Mock initial session with authenticated user
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: mockUser,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        timeRemaining: '30:00'
      })
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated')
    })

    // Mock failed logout API call
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const logoutButton = screen.getByText('Logout')
    await act(async () => {
      logoutButton.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated')
    })

    // Should still clear state even if API call fails
    expect(screen.getByTestId('user')).toHaveTextContent('No User')
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('tbat_session')
  })

  it('automatically logs out on session refresh failure', async () => {
    const mockUser = {
      id: '1',
      email: 'test@medical.ac.th',
      thaiName: 'Test User',
      packageType: 'ADVANCED',
      isActive: true
    }

    // Mock initial session with authenticated user
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: mockUser,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        timeRemaining: '30:00'
      })
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated')
    })

    // Mock failed session refresh
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    })

    // Mock logout call that will be triggered automatically
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logged out' })
    })

    const refreshButton = screen.getByText('Refresh Session')
    await act(async () => {
      refreshButton.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated')
    })
  })

  it('updates session timer when session info changes', async () => {
    jest.useFakeTimers()

    const mockUser = {
      id: '1',
      email: 'test@medical.ac.th',
      thaiName: 'Test User',
      packageType: 'ADVANCED',
      isActive: true
    }

    // Mock initial session with authenticated user
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: mockUser,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        timeRemaining: '5:00'
      })
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated')
    })

    // Timer should be running
    expect(setInterval).toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })

  it('clears session timer on logout', async () => {
    jest.useFakeTimers()

    const mockUser = {
      id: '1',
      email: 'test@medical.ac.th',
      thaiName: 'Test User',
      packageType: 'ADVANCED',
      isActive: true
    }

    // Mock initial session with authenticated user
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: mockUser,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        timeRemaining: '30:00'
      })
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated')
    })

    // Mock logout API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logged out successfully' })
    })

    const logoutButton = screen.getByText('Logout')
    await act(async () => {
      logoutButton.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated')
    })

    // Timer should be cleared
    expect(clearInterval).toHaveBeenCalled()

    jest.useRealTimers()
  })
})