'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { LoginModal } from '@/components/tbat/login-modal'
import { BoxSetCodeModal } from '@/components/tbat/boxset-code-modal'
import { ModalErrorBoundary } from '@/components/error-boundary'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [boxSetModalOpen, setBoxSetModalOpen] = useState(false)
  const pathname = usePathname()

  const navigationItems = [
    { name: 'หน้าแรก', href: '/', icon: '🏠' },
    { name: 'คุณสมบัติ', href: '/#features', icon: '✨' },
    { name: 'วิชาที่สอบ', href: '/#subjects', icon: '📚' },
    { name: 'รีวิว', href: '/#testimonials', icon: '⭐' },
    { name: 'ราคา', href: '/#pricing', icon: '💎' },
    { name: 'บล็อก', href: '/blog', icon: '📝' },
    { name: 'เกี่ยวกับเรา', href: '/about', icon: '👥' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-tbat-surface/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-tbat-primary to-tbat-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-white font-bold text-2xl">T</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="font-bold text-xl text-tbat-primary">TBAT Mock</span>
              <span className="block text-xs text-gray-500 thai-text">เตรียมสอบแพทย์</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium thai-text transition-all duration-200
                  ${pathname === item.href 
                    ? 'bg-tbat-surface/20 text-tbat-primary' 
                    : 'text-gray-700 hover:bg-tbat-surface/10 hover:text-tbat-primary'
                  }
                `}
              >
                <span className="mr-1">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-600 hover:text-tbat-primary transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Login/Register */}
            <button
              onClick={() => setLoginModalOpen(true)}
              className="hidden sm:block px-4 py-2 text-tbat-primary hover:text-tbat-secondary font-medium thai-text transition-colors"
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => setBoxSetModalOpen(true)}
              className="relative overflow-hidden bg-gradient-to-r from-tbat-primary to-tbat-secondary text-white px-6 py-2.5 rounded-lg font-medium thai-text shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <span className="relative z-10">กรอก BoxSet Code</span>
              <div className="absolute inset-0 bg-gradient-to-r from-tbat-secondary to-tbat-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-tbat-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-tbat-surface/20">
          <div className="px-4 py-4 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block px-4 py-3 rounded-lg text-base font-medium thai-text transition-all duration-200
                  ${pathname === item.href 
                    ? 'bg-tbat-surface/20 text-tbat-primary' 
                    : 'text-gray-700 hover:bg-tbat-surface/10 hover:text-tbat-primary'
                  }
                `}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-tbat-surface/20">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setLoginModalOpen(true)
                }}
                className="block w-full px-4 py-3 text-center bg-tbat-surface/10 text-tbat-primary rounded-lg font-medium thai-text hover:bg-tbat-surface/20 transition-colors"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setBoxSetModalOpen(true)
                }}
                className="block w-full mt-2 px-4 py-3 text-center bg-gradient-to-r from-tbat-primary to-tbat-secondary text-white rounded-lg font-medium thai-text shadow-lg"
              >
                กรอก BoxSet Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals with Error Boundaries */}
      <ModalErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Login modal error:', error, errorInfo)
          setLoginModalOpen(false)
        }}
      >
        <LoginModal 
          isOpen={loginModalOpen} 
          onClose={() => setLoginModalOpen(false)}
          onSwitchToBoxSet={() => {
            setLoginModalOpen(false)
            setBoxSetModalOpen(true)
          }}
        />
      </ModalErrorBoundary>
      
      <ModalErrorBoundary
        onError={(error, errorInfo) => {
          console.error('BoxSet modal error:', error, errorInfo)
          setBoxSetModalOpen(false)
        }}
      >
        <BoxSetCodeModal 
          isOpen={boxSetModalOpen} 
          onClose={() => setBoxSetModalOpen(false)}
          onCodeValidated={(codeId) => {
            // Handle code validation if needed
            console.log('Code validated:', codeId)
          }}
        />
      </ModalErrorBoundary>
    </nav>
  )
}