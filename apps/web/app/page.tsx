'use client'

import { useState } from 'react'
import Link from 'next/link'
import PendingContent, { PendingBadge } from '../src/components/ui/PendingContent'
import { LoginModal } from '../src/components/tbat/login-modal'
import { BoxSetCodeModal } from '../src/components/tbat/boxset-code-modal'

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [boxSetModalOpen, setBoxSetModalOpen] = useState(false)

  const features = [
    {
      icon: '📚',
      title: 'ข้อสอบครบทุกวิชา',
      description: 'ชีววิทยา เคมี ฟิสิกส์ คณิตศาสตร์ ภาษาอังกฤษ',
      gradient: 'from-tbat-primary/20 to-tbat-primary/30',
      borderColor: 'border-tbat-primary/30'
    },
    {
      icon: '📊',
      title: 'วิเคราะห์ผลอัจฉริยะ',
      description: 'AI วิเคราะห์จุดแข็ง-จุดอ่อน พร้อมแนะนำการพัฒนา',
      gradient: 'from-tbat-secondary/20 to-tbat-secondary/30',
      borderColor: 'border-tbat-secondary/30'
    },
    {
      icon: '🎯',
      title: 'เรียนรู้แบบเจาะจง',
      description: 'แบบฝึกหัดเฉพาะบท ตามหลักสูตร TBAT จริง',
      gradient: 'from-purple-500/20 to-purple-600/30',
      borderColor: 'border-purple-500/30'
    },
    {
      icon: '⏱️',
      title: 'จำลองสอบจริง',
      description: 'จับเวลา บรรยากาศเหมือนสอบจริง 100%',
      gradient: 'from-blue-500/20 to-blue-600/30',
      borderColor: 'border-blue-500/30'
    },
    {
      icon: '📈',
      title: 'ติดตามความก้าวหน้า',
      description: 'กราฟแสดงพัฒนาการ เปรียบเทียบกับเพื่อน',
      gradient: 'from-green-500/20 to-green-600/30',
      borderColor: 'border-green-500/30'
    },
    {
      icon: '🏆',
      title: 'ระบบแข่งขัน',
      description: 'Leaderboard จัดอันดับ สร้างแรงจูงใจ',
      gradient: 'from-yellow-500/20 to-amber-600/30',
      borderColor: 'border-yellow-500/30'
    }
  ]

  const testimonials = [
    {
      name: 'นภัสสร ส.',
      school: 'โรงเรียนสาธิต มช.',
      score: 'TBAT 89.5',
      text: 'ระบบวิเคราะห์ผลช่วยให้รู้จุดอ่อนชัดเจน พัฒนาได้ตรงจุด',
      avatar: '👩‍🎓'
    },
    {
      name: 'ณัฐพล ว.',
      school: 'โรงเรียนมงฟอร์ต',
      score: 'TBAT 92.3',
      text: 'ข้อสอบเหมือนจริงมาก ทำให้ไม่ตื่นเต้นตอนสอบจริง',
      avatar: '👨‍🎓'
    },
    {
      name: 'พิมพ์ชนก ก.',
      school: 'โรงเรียนเรยีนา',
      score: 'TBAT 87.8',
      text: 'ชอบระบบ AI ที่แนะนำว่าควรอ่านอะไรเพิ่ม ประหยัดเวลามาก',
      avatar: '👩‍🎓'
    }
  ]

  const examSubjects = [
    { name: 'ชีววิทยา', questions: 40, time: '60 นาที', icon: '🧬' },
    { name: 'เคมี', questions: 40, time: '60 นาที', icon: '⚗️' },
    { name: 'ฟิสิกส์', questions: 40, time: '60 นาที', icon: '⚛️' },
    { name: 'คณิตศาสตร์', questions: 30, time: '60 นาที', icon: '📐' },
    { name: 'ภาษาอังกฤษ', questions: 50, time: '60 นาที', icon: '📝' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-tbat-white via-tbat-surface/10 to-tbat-white">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-tbat-surface/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-tbat-primary to-tbat-secondary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="font-bold text-xl text-tbat-primary">TBAT Mock</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-tbat-primary transition-colors thai-text">คุณสมบัติ</a>
              <a href="#subjects" className="text-gray-700 hover:text-tbat-primary transition-colors thai-text">วิชาที่สอบ</a>
              <a href="#testimonials" className="text-gray-700 hover:text-tbat-primary transition-colors thai-text">รีวิว</a>
              <a href="#pricing" className="text-gray-700 hover:text-tbat-primary transition-colors thai-text">ราคา</a>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setLoginModalOpen(true)}
                className="text-tbat-primary hover:text-tbat-secondary font-medium thai-text transition-colors"
              >
                เข้าสู่ระบบ
              </button>
              <button 
                onClick={() => setBoxSetModalOpen(true)}
                className="bg-gradient-to-r from-tbat-primary to-tbat-secondary text-white px-6 py-2 rounded-lg font-medium thai-text hover:shadow-lg transition-shadow"
              >
                กรอก BoxSet Code
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Medical Theme */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-tbat-primary/20 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-tbat-secondary/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-tbat-background/30 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-tbat-surface/30 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                <span className="text-sm text-tbat-primary font-medium thai-text">🎯 เปิดรับสมัครรุ่นใหม่ 2025</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-tbat-primary mb-6 thai-text leading-tight">
                เตรียมพร้อม
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-tbat-primary to-tbat-secondary">
                  สอบ TBAT
                </span>
                <span className="text-4xl lg:text-5xl">อย่างมั่นใจ</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 thai-text leading-relaxed">
                แพลตฟอร์มสอบจำลอง TBAT ออนไลน์ที่ใหญ่ที่สุดในเชียงใหม่
                <br />พร้อม <span className="font-semibold text-tbat-secondary">AI วิเคราะห์ผล</span> แบบเรียลไทม์
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <button 
                  onClick={() => setBoxSetModalOpen(true)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-tbat-primary to-tbat-secondary text-white rounded-xl font-semibold thai-text shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="relative z-10">🚀 เริ่มทดลองใช้ฟรี</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-tbat-secondary to-tbat-primary rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                <button className="relative px-8 py-4 bg-white border-2 border-tbat-surface text-tbat-primary rounded-xl font-semibold thai-text hover:border-tbat-primary hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                  📹 ดูวิดีโอแนะนำ
                  <PendingBadge className="absolute -top-2 -right-2" />
                </button>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">✅</span>
                  <span className="text-gray-600 thai-text">ข้อสอบ 5,000+ ข้อ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⭐</span>
                  <span className="text-gray-600 thai-text">4.9/5 คะแนนรีวิว</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🎓</span>
                  <span className="text-gray-600 thai-text">ผ่านเข้า 85%</span>
                </div>
              </div>
            </div>

            {/* Right Visual - Mock Exam Interface */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-tbat-surface/20">
                {/* Mock Exam Card */}
                <div className="bg-gradient-to-br from-tbat-surface/20 to-tbat-background/10 rounded-xl p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-tbat-secondary thai-text">แบบทดสอบจำลอง</span>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full thai-text">กำลังทำ</span>
                  </div>
                  <h3 className="text-lg font-bold text-tbat-primary mb-2 thai-text">TBAT Mock Exam Set A</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/80 rounded-lg p-3">
                      <p className="text-xs text-gray-500 thai-text">เวลาที่เหลือ</p>
                      <p className="text-xl font-bold text-tbat-primary">2:45:30</p>
                    </div>
                    <div className="bg-white/80 rounded-lg p-3">
                      <p className="text-xs text-gray-500 thai-text">ความคืบหน้า</p>
                      <p className="text-xl font-bold text-tbat-secondary">65/200</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-tbat-primary to-tbat-secondary h-2 rounded-full" style={{ width: '32.5%' }}></div>
                  </div>
                </div>

                {/* Question Preview */}
                <div className="bg-white border border-tbat-surface/20 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2 thai-text">ข้อที่ 66</p>
                  <p className="text-gray-700 mb-3 thai-text">การหายใจระดับเซลล์เกิดขึ้นที่ออร์แกเนลล์ใด?</p>
                  <div className="space-y-2">
                    {['ไมโตคอนเดรีย', 'คลอโรพลาสต์', 'ไรโบโซม', 'นิวเคลียส'].map((option, i) => (
                      <label key={i} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-tbat-surface/10 cursor-pointer transition-colors">
                        <input type="radio" name="answer" className="text-tbat-primary" />
                        <span className="text-gray-700 thai-text">{String.fromCharCode(65 + i)}. {option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 animate-bounce">
                <span className="text-2xl">🏆</span>
                <p className="text-xs font-semibold text-tbat-primary thai-text">Top 10%</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 animate-pulse">
                <span className="text-2xl">📊</span>
                <p className="text-xs font-semibold text-tbat-secondary thai-text">AI Analytics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-tbat-primary mb-4 thai-text">คุณสมบัติที่โดดเด่น</h2>
            <p className="text-xl text-gray-600 thai-text">ครบครันทุกฟีเจอร์ที่จำเป็นสำหรับการเตรียมสอบ</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 border-2 border-tbat-surface/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
                onMouseEnter={() => setActiveFeature(index)}
              >
                {/* Hover Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
                
                {/* Border Color on Hover */}
                <div className={`absolute inset-0 rounded-2xl border-2 ${feature.borderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-tbat-primary mb-3 thai-text group-hover:text-tbat-secondary transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 thai-text">{feature.description}</p>
                </div>
                
                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Subjects Section */}
      <section id="subjects" className="py-20 bg-gradient-to-br from-tbat-surface/10 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-tbat-primary mb-4 thai-text">วิชาที่สอบ TBAT</h2>
            <p className="text-xl text-gray-600 thai-text">ครอบคลุมทุกวิชาตามหลักสูตรจริง</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {examSubjects.map((subject, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-3">{subject.icon}</div>
                <h3 className="font-bold text-tbat-primary mb-2 thai-text">{subject.name}</h3>
                <p className="text-sm text-gray-500 thai-text">{subject.questions} ข้อ</p>
                <p className="text-sm text-gray-500 thai-text">{subject.time}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-tbat-primary to-tbat-secondary rounded-2xl p-8 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 thai-text">📚 คลังข้อสอบมากกว่า 5,000 ข้อ</h3>
                <p className="text-white/90 mb-6 thai-text">รวบรวมข้อสอบจากสถาบันชั้นนำ พร้อมเฉลยละเอียด อธิบายทุกตัวเลือก</p>
                <button className="relative bg-white text-tbat-primary px-6 py-3 rounded-lg font-semibold thai-text hover:shadow-lg transition-shadow">
                  ดูตัวอย่างข้อสอบ
                  <PendingBadge className="absolute -top-2 -right-2" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-3xl font-bold">1,200+</p>
                  <p className="text-sm thai-text">ข้อสอบชีววิทยา</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-3xl font-bold">1,000+</p>
                  <p className="text-sm thai-text">ข้อสอบเคมี</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-3xl font-bold">1,000+</p>
                  <p className="text-sm thai-text">ข้อสอบฟิสิกส์</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-3xl font-bold">1,800+</p>
                  <p className="text-sm thai-text">ข้อสอบอื่นๆ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-tbat-primary mb-4 thai-text">เสียงจากผู้ใช้งานจริง</h2>
            <p className="text-xl text-gray-600 thai-text">นักเรียนที่ผ่านเข้าคณะแพทย์ด้วย TBAT Mock</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-tbat-surface/10 to-white rounded-2xl p-8 border border-tbat-surface/20">
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <p className="font-bold text-tbat-primary thai-text">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 thai-text">{testimonial.school}</p>
                    <p className="text-xs font-semibold text-tbat-secondary">{testimonial.score}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic thai-text">"{testimonial.text}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-tbat-surface/10 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-tbat-primary mb-4 thai-text">แพ็กเกจที่คุ้มค่า</h2>
            <p className="text-xl text-gray-600 thai-text">เลือกแพ็กเกจที่เหมาะกับคุณ</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border border-tbat-surface/20 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-700 mb-2 thai-text">ทดลองใช้</h3>
              <p className="text-4xl font-bold text-tbat-primary mb-6">฿0<span className="text-lg text-gray-500">/เดือน</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600 thai-text">
                  <span className="text-green-500 mr-2">✓</span> ข้อสอบ 100 ข้อ
                </li>
                <li className="flex items-center text-gray-600 thai-text">
                  <span className="text-green-500 mr-2">✓</span> วิเคราะห์ผลพื้นฐาน
                </li>
                <li className="flex items-center text-gray-600 thai-text">
                  <span className="text-green-500 mr-2">✓</span> ใช้งาน 7 วัน
                </li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold thai-text hover:bg-gray-200 transition-colors">
                เริ่มทดลองใช้
              </button>
            </div>

            {/* Premium Plan */}
            <div className="relative bg-gradient-to-br from-tbat-primary to-tbat-secondary rounded-2xl p-8 text-white transform scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-800 px-4 py-1 rounded-full text-sm font-semibold thai-text">
                🔥 ยอดนิยม
              </div>
              <h3 className="text-xl font-bold mb-2 thai-text">Premium</h3>
              <p className="text-4xl font-bold mb-6">฿499<span className="text-lg opacity-80">/เดือน</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center thai-text">
                  <span className="text-white mr-2">✓</span> ข้อสอบไม่จำกัด
                </li>
                <li className="flex items-center thai-text">
                  <span className="text-white mr-2">✓</span> AI วิเคราะห์แบบละเอียด
                </li>
                <li className="flex items-center thai-text">
                  <span className="text-white mr-2">✓</span> แบบฝึกหัดเฉพาะบุคคล
                </li>
                <li className="flex items-center thai-text">
                  <span className="text-white mr-2">✓</span> ติวเตอร์ AI 24/7
                </li>
              </ul>
              <button className="w-full bg-white text-tbat-primary py-3 rounded-lg font-semibold thai-text hover:shadow-lg transition-shadow">
                สมัครเลย
              </button>
            </div>

            {/* School Plan */}
            <div className="bg-white rounded-2xl p-8 border border-tbat-surface/20 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-700 mb-2 thai-text">สถาบัน</h3>
              <p className="text-4xl font-bold text-tbat-primary mb-6">ติดต่อ<span className="text-lg text-gray-500">/ปี</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600 thai-text">
                  <span className="text-green-500 mr-2">✓</span> สำหรับ 50+ คน
                </li>
                <li className="flex items-center text-gray-600 thai-text">
                  <span className="text-green-500 mr-2">✓</span> Dashboard ผู้สอน
                </li>
                <li className="flex items-center text-gray-600 thai-text">
                  <span className="text-green-500 mr-2">✓</span> รายงานประจำเดือน
                </li>
                <li className="flex items-center text-gray-600 thai-text">
                  <span className="text-green-500 mr-2">✓</span> Support พิเศษ
                </li>
              </ul>
              <button className="w-full bg-tbat-primary text-white py-3 rounded-lg font-semibold thai-text hover:bg-tbat-secondary transition-colors">
                ติดต่อเรา
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-tbat-primary to-tbat-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6 thai-text">พร้อมเริ่มต้นการเตรียมสอบแล้วหรือยัง?</h2>
          <p className="text-xl text-white/90 mb-8 thai-text">เข้าร่วมกับนักเรียนกว่า 200+ คน ที่ประสบความสำเร็จ</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setBoxSetModalOpen(true)}
              className="bg-white text-tbat-primary px-8 py-4 rounded-xl font-semibold thai-text shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              🚀 เริ่มต้นเลย - ฟรี 7 วัน
            </button>
            <button className="relative bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold thai-text hover:bg-white/10 transition-colors">
              📞 ปรึกษาฟรี
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-800 text-xs px-2 py-1 rounded-full">เร็วๆนี้</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pending Content Sections */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 thai-text">🚀 ฟีเจอร์ที่กำลังพัฒนา</h2>
            <p className="text-lg text-gray-600 thai-text">เรากำลังพัฒนาฟีเจอร์ใหม่ๆ เพื่อประสบการณ์การเรียนรู้ที่ดีที่สุด</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <PendingContent 
              type="feature" 
              label="ระบบ AI Tutor ตอบคำถามแบบ Real-time" 
            />
            <PendingContent 
              type="feature" 
              label="Live Streaming สอนสดจากติวเตอร์ชั้นนำ" 
            />
            <PendingContent 
              type="feature" 
              label="Community Forum แลกเปลี่ยนความรู้" 
            />
            <PendingContent 
              type="feature" 
              label="Achievement System และ Rewards" 
            />
          </div>

          <div className="mt-12">
            <PendingContent 
              type="section" 
              label="ส่วนนี้จะมีการอัพเดตเนื้อหาเพิ่มเติม รวมถึงบทความ วิดีโอ และเครื่องมือการเรียนรู้ใหม่ๆ ในเร็วๆ นี้" 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-tbat-primary to-tbat-secondary rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <span className="font-bold text-xl">TBAT Mock</span>
              </div>
              <p className="text-gray-400 thai-text">แพลตฟอร์มเตรียมสอบ TBAT ชั้นนำของเชียงใหม่</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 thai-text">เมนู</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white thai-text">หน้าแรก</a></li>
                <li><a href="#" className="hover:text-white thai-text">คุณสมบัติ</a></li>
                <li><a href="#" className="hover:text-white thai-text">ราคา</a></li>
                <li><a href="#" className="hover:text-white thai-text">บล็อก</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 thai-text">ช่วยเหลือ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white thai-text">คำถามที่พบบ่อย</a></li>
                <li><a href="#" className="hover:text-white thai-text">วิธีใช้งาน</a></li>
                <li><a href="#" className="hover:text-white thai-text">ติดต่อเรา</a></li>
                <li><a href="#" className="hover:text-white thai-text">นโยบายความเป็นส่วนตัว</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 thai-text">ติดตามเรา</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-tbat-primary transition-colors">
                  <span>f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-tbat-primary transition-colors">
                  <span>ig</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-tbat-primary transition-colors">
                  <span>yt</span>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p className="thai-text">© 2025 TBAT Mock. สงวนลิขสิทธิ์.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        onSwitchToBoxSet={() => {
          setLoginModalOpen(false)
          setBoxSetModalOpen(true)
        }}
      />
      <BoxSetCodeModal 
        isOpen={boxSetModalOpen} 
        onClose={() => setBoxSetModalOpen(false)}
        onCodeValidated={(codeId) => {
          console.log('Code validated:', codeId)
        }}
      />
    </div>
  )
}