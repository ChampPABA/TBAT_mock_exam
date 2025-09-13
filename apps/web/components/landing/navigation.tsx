"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavigationProps {
  onRegisterClick?: () => void;
  onLoginClick?: () => void;
}

export default function Navigation({ onRegisterClick, onLoginClick }: NavigationProps) {
  const router = useRouter();
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleRegisterClick = () => {
    try {
      if (onRegisterClick) {
        onRegisterClick();
      } else {
        // Use Link component instead of router.push to avoid prefetch issues
        window.location.href = '/register';
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to regular navigation
      window.location.href = '/register';
    }
  };

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      alert('Login functionality coming soon!');
    }
  };

  return (
    <nav 
      className="bg-white shadow-sm sticky top-0 z-50" 
      role="navigation" 
      aria-label="หลัก"
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center group" 
            aria-label="TBAT Mock Exam หน้าหลัก"
          >
            <div className="flex items-center">
              <span className="text-3xl font-bold text-tbat-primary group-hover:text-tbat-secondary transition-colors duration-200">
                TBAT
              </span>
            </div>
            <span className="text-2xl font-light text-gray-600 ml-2">
              Mock Exam
            </span>
          </Link>
          
          {/* Navigation Links - Always visible like in mockup */}
          <div className="flex items-center gap-6">
            <a
              href="#details"
              className="nav-link text-gray-700 hover:text-tbat-primary font-medium transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('details');
              }}
            >
              รายละเอียด
            </a>
            <a
              href="#features"
              className="nav-link text-gray-700 hover:text-tbat-primary font-medium transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('features');
              }}
            >
              คุณสมบัติ
            </a>
            <a
              href="#pricing"
              className="nav-link text-gray-700 hover:text-tbat-primary font-medium transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('pricing');
              }}
            >
              แพ็กเกจ
            </a>
            <a
              href="#faq"
              className="nav-link text-gray-700 hover:text-tbat-primary font-medium transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('faq');
              }}
            >
              คำถามที่พบบ่อย
            </a>
            <Link
              href="/contact"
              className="nav-link text-gray-700 hover:text-tbat-primary font-medium transition-colors duration-200"
            >
              ติดต่อเรา
            </Link>
            
            {/* Action Buttons */}
            <button 
              onClick={handleLoginClick}
              className="px-3 py-2 text-tbat-primary border border-tbat-primary rounded-lg hover:bg-tbat-primary hover:text-white transition-colors duration-200 font-medium text-sm"
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={handleRegisterClick}
              data-testid="nav-register-button"
              className="px-4 py-2 bg-tbat-primary text-white rounded-lg hover:bg-tbat-secondary transition-colors duration-200 font-medium text-sm btn-hover-effect relative overflow-hidden"
            >
              สมัครสมาชิก
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}