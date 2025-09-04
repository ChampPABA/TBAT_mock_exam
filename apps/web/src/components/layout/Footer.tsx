import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'เกี่ยวกับเรา',
      links: [
        { name: 'ประวัติ', href: '/about' },
        { name: 'ทีมงาน', href: '/team' },
        { name: 'พันธกิจ', href: '/mission' },
        { name: 'ติดต่อเรา', href: '/contact' }
      ]
    },
    {
      title: 'บริการ',
      links: [
        { name: 'แบบทดสอบ TBAT', href: '/exams' },
        { name: 'วิเคราะห์ผล AI', href: '/analytics' },
        { name: 'ติวเตอร์ออนไลน์', href: '/tutoring' },
        { name: 'คลังข้อสอบ', href: '/question-bank' }
      ]
    },
    {
      title: 'ทรัพยากร',
      links: [
        { name: 'บล็อก', href: '/blog' },
        { name: 'คู่มือเตรียมสอบ', href: '/guides' },
        { name: 'FAQ', href: '/faq' },
        { name: 'วิดีโอแนะนำ', href: '/tutorials' }
      ]
    },
    {
      title: 'ข้อมูลสำคัญ',
      links: [
        { name: 'นโยบายความเป็นส่วนตัว', href: '/privacy' },
        { name: 'เงื่อนไขการใช้งาน', href: '/terms' },
        { name: 'นโยบายคืนเงิน', href: '/refund' },
        { name: 'ความปลอดภัย', href: '/security' }
      ]
    }
  ]

  const socialLinks = [
    { name: 'Facebook', icon: 'f', href: '#', color: 'hover:bg-blue-600' },
    { name: 'Instagram', icon: 'ig', href: '#', color: 'hover:bg-pink-600' },
    { name: 'YouTube', icon: 'yt', href: '#', color: 'hover:bg-red-600' },
    { name: 'Line', icon: 'L', href: '#', color: 'hover:bg-green-500' },
    { name: 'Twitter', icon: 'X', href: '#', color: 'hover:bg-black' }
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2 thai-text">📬 รับข่าวสารและเทคนิคการเตรียมสอบ</h3>
              <p className="text-gray-400 thai-text">อัพเดตข้อสอบใหม่ เทคนิคการทำข้อสอบ และโปรโมชั่นพิเศษ</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="กรอกอีเมลของคุณ"
                className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-tbat-primary focus:ring-2 focus:ring-tbat-primary/20 transition-all"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-tbat-primary to-tbat-secondary rounded-lg font-semibold thai-text hover:shadow-lg hover:shadow-tbat-primary/25 transition-all duration-300">
                สมัครรับข่าวสาร
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-tbat-primary to-tbat-secondary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">T</span>
              </div>
              <div>
                <h4 className="font-bold text-xl">TBAT Mock</h4>
                <p className="text-xs text-gray-400 thai-text">by Chiang Mai Tutors</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4 thai-text">
              แพลตฟอร์มเตรียมสอบ TBAT ชั้นนำของเชียงใหม่ ด้วยระบบ AI วิเคราะห์ผลแบบเรียลไทม์
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>📍</span>
              <span className="thai-text">เชียงใหม่, ประเทศไทย</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
              <span>📞</span>
              <span>099-123-4567</span>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4 text-tbat-surface thai-text">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 text-sm hover:text-white hover:translate-x-1 inline-block transition-all duration-200 thai-text"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-gray-700">
          <div className="text-center">
            <p className="text-3xl font-bold text-tbat-primary">200+</p>
            <p className="text-sm text-gray-400 thai-text">นักเรียนที่ใช้งาน</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-tbat-secondary">5,000+</p>
            <p className="text-sm text-gray-400 thai-text">ข้อสอบในระบบ</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-tbat-background">95%</p>
            <p className="text-sm text-gray-400 thai-text">ความพึงพอใจ</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">85%</p>
            <p className="text-sm text-gray-400 thai-text">ผ่านเข้าแพทย์</p>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400 thai-text">ติดตามเรา:</span>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-400 hover:text-white ${social.color} transition-all duration-300 transform hover:scale-110`}
                    aria-label={social.name}
                  >
                    <span className="font-bold text-sm">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
              <p className="thai-text">© {currentYear} TBAT Mock. สงวนลิขสิทธิ์.</p>
              <div className="flex items-center space-x-1">
                <span>Made with</span>
                <span className="text-red-500">❤️</span>
                <span className="thai-text">in เชียงใหม่</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-wrap justify-center items-center gap-6">
            <div className="flex items-center space-x-2 text-gray-400">
              <span className="text-2xl">🔒</span>
              <span className="text-sm thai-text">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <span className="text-2xl">✅</span>
              <span className="text-sm thai-text">ได้รับการรับรอง</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <span className="text-2xl">🏆</span>
              <span className="text-sm thai-text">Best Platform 2025</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <span className="text-2xl">🌟</span>
              <span className="text-sm thai-text">4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}