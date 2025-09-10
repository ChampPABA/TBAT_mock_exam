"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/landing/navigation';
import HeroSection from '@/components/landing/hero-section';
import ValidatorSection from '@/components/landing/validator-section';
import ExamDetailsSection from '@/components/landing/exam-details-section';
import FeaturesSection from '@/components/landing/features-section';
import PricingSection from '@/components/landing/pricing-section';
import CostSavingsSection from '@/components/landing/cost-savings-section';
import DentoriumSection from '@/components/landing/dentorium-section';
import TestimonialsSection from '@/components/landing/testimonials-section';
import FAQSection from '@/components/landing/faq-section';
import FinalCTASection from '@/components/landing/final-cta-section';
import Footer from '@/components/landing/footer';

export default function Home() {
  const router = useRouter();

  const handleRegisterClick = () => {
    router.push('/register');
  };

  const handleLoginClick = () => {
    console.log('Login clicked!');
    alert('เปิดหน้าเข้าสู่ระบบ - จะเชื่อมต่อกับ NextAuth ในอนาคต');
  };

  const handleViewPackagesClick = () => {
    console.log('View packages clicked!');
    // Scroll to pricing section
    const element = document.getElementById('pricing');
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleSelectPackage = (packageId: number) => {
    console.log(`Package selected: ${packageId}`);
    router.push('/register');
  };

  const handleRegisterFreeClick = () => {
    router.push('/register');
  };

  const handleUpgradeClick = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation 
        onRegisterClick={handleRegisterClick}
        onLoginClick={handleLoginClick}
      />
      
      {/* Hero Section */}
      <HeroSection 
        onRegisterClick={handleRegisterClick}
        onViewPackagesClick={handleViewPackagesClick}
      />
      
      {/* Validator Section */}
      <ValidatorSection />
      
      {/* Exam Details Section */}
      <ExamDetailsSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Pricing Section */}
      <PricingSection onSelectPackage={handleSelectPackage} />
      
      {/* Cost Savings Section */}
      <CostSavingsSection />
      
      {/* Dentorium Section */}
      <DentoriumSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* Final CTA Section */}
      <FinalCTASection 
        onRegisterFreeClick={handleRegisterFreeClick}
        onUpgradeClick={handleUpgradeClick}
      />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
