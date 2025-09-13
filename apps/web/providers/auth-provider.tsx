'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id: string
  email: string
  thaiName: string
  packageType: 'FREE' | 'ADVANCED'
  lastLoginAt?: string
  isActive: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  sessionInfo: {
    expiresAt?: string
    timeRemaining?: string
  } | null
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  updateSessionTimer: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionInfo, setSessionInfo] = useState<{
    expiresAt?: string
    timeRemaining?: string
  } | null>(null)

  // Timer for session countdown
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null)

  const isAuthenticated = !!user

  // Initialize authentication state on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  // Set up session timer when user is authenticated
  useEffect(() => {
    if (user && sessionInfo?.expiresAt) {
      startSessionTimer()
    } else {
      stopSessionTimer()
    }

    return () => stopSessionTimer()
  }, [user, sessionInfo?.expiresAt])

  const initializeAuth = async () => {
    try {
      setIsLoading(true)

      // Check for existing session
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
          setSessionInfo({
            expiresAt: data.expiresAt,
            timeRemaining: data.timeRemaining
          })
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: {
    email: string
    password: string
    rememberMe?: boolean
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setSessionInfo({
          expiresAt: data.expiresAt,
          timeRemaining: data.timeRemaining
        })

        // Store session info in localStorage if "remember me" is checked
        if (credentials.rememberMe && typeof window !== 'undefined') {
          localStorage.setItem('tbat_session', JSON.stringify({
            userId: data.user.id,
            expiresAt: data.expiresAt
          }))
        }

        return { success: true }
      } else {
        return { success: false, error: data.error || 'การเข้าสู่ระบบไม่สำเร็จ' }
      }
    } catch (error) {
      return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear state regardless of API response
      setUser(null)
      setSessionInfo(null)
      stopSessionTimer()

      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tbat_session')
        sessionStorage.clear()
      }
    }
  }

  const refreshSession = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setSessionInfo({
          expiresAt: data.expiresAt,
          timeRemaining: data.timeRemaining
        })
      } else {
        // Session expired, logout user
        await logout()
      }
    } catch (error) {
      console.error('Failed to refresh session:', error)
      // On error, logout user for security
      await logout()
    }
  }

  const startSessionTimer = () => {
    if (sessionTimer) {
      clearInterval(sessionTimer)
    }

    const timer = setInterval(() => {
      updateSessionTimer()
    }, 1000) // Update every second

    setSessionTimer(timer)
  }

  const stopSessionTimer = () => {
    if (sessionTimer) {
      clearInterval(sessionTimer)
      setSessionTimer(null)
    }
  }

  const updateSessionTimer = () => {
    if (!sessionInfo?.expiresAt) return

    const expiresAt = new Date(sessionInfo.expiresAt)
    const now = new Date()
    const timeLeft = expiresAt.getTime() - now.getTime()

    if (timeLeft <= 0) {
      // Session expired
      logout()
      return
    }

    // Calculate remaining time
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

    let timeRemaining = ''
    if (hours > 0) {
      timeRemaining = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } else {
      timeRemaining = `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    setSessionInfo(prev => prev ? {
      ...prev,
      timeRemaining
    } : null)

    // Show warning when less than 5 minutes remaining
    if (timeLeft < 5 * 60 * 1000 && timeLeft > 4 * 60 * 1000) {
      // This could trigger a notification or modal warning
      console.warn('Session expiring soon:', timeRemaining)
    }
  }

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    sessionInfo,
    login,
    logout,
    refreshSession,
    updateSessionTimer
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}