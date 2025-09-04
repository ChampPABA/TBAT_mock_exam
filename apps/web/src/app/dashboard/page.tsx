import { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { mockAuthService } from "@/lib/mock-api"

export const metadata: Metadata = {
  title: "แดชบอร์ด - TBAT Mock Exam",
  description: "แดชบอร์ดส่วนตัว - ดูผลคะแนนและประวัติการทำแบบทดสอบ",
}

export default async function DashboardPage() {
  // Check authentication
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    redirect("/login")
  }

  // Validate token and get user data
  const tokenValidation = await mockAuthService.validateToken(token)
  
  if (!tokenValidation.valid || !tokenValidation.user) {
    redirect("/login")
  }

  const user = tokenValidation.user

  return (
    <div className="min-h-screen bg-tbat-surface/20">
      {/* Header - TBAT Variant 6 Design */}
      <header className="bg-tbat-white shadow-sm border-b border-tbat-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-tbat-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <h1 className="text-xl font-semibold text-tbat-primary thai-text">
                  TBAT Mock Exam
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm thai-text text-gray-700 bg-tbat-surface/30 px-3 py-1 rounded-full">
                สวัสดี, {user.name}
              </span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm thai-text text-tbat-secondary hover:text-tbat-primary focus:outline-none focus:ring-2 focus:ring-tbat-primary focus:ring-offset-2 transition-colors"
                >
                  ออกจากระบบ
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section - Variant 6 Style */}
        <div className="bg-tbat-gradient rounded-2xl overflow-hidden shadow-xl mb-8">
          <div className="px-6 py-8 sm:p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-white thai-text mb-2">
                ยินดีต้อนรับ, {user.name}
              </h2>
              <p className="text-white/90 thai-text mb-6">
                พร้อมที่จะท้าทายตัวเองกับแบบทดสอบ TBAT แล้วหรือยัง?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                  <span className="text-white/70 text-sm thai-text block mb-1">อีเมล</span>
                  <p className="font-medium text-white thai-text">{user.email}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                  <span className="text-white/70 text-sm thai-text block mb-1">โรงเรียน</span>
                  <p className="font-medium text-white thai-text">{user.school}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                  <span className="text-white/70 text-sm thai-text block mb-1">ชั้นเรียน</span>
                  <p className="font-medium text-white thai-text">{user.grade}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Variant 6 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Primary Action - Start Exam */}
          <div className="group bg-tbat-white hover:bg-tbat-surface/30 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl rounded-2xl border border-tbat-surface/50">
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-tbat-gradient rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="w-2 h-2 bg-tbat-primary rounded-full group-hover:scale-125 transition-transform"></div>
              </div>
              <h3 className="text-xl font-bold text-tbat-primary thai-text mb-3">
                แบบทดสอบใหม่
              </h3>
              <p className="text-gray-600 thai-text mb-6 leading-relaxed">
                เริ่มทำแบบทดสอบ TBAT จำลองและท้าทายความรู้ของคุณ
              </p>
              <button className="w-full bg-tbat-gradient text-white px-6 py-3 rounded-xl font-medium thai-text hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-tbat-primary/30">
                เริ่มทำแบบทดสอบ
              </button>
            </div>
          </div>

          {/* Secondary Action - View Scores */}
          <div className="group bg-tbat-white hover:bg-tbat-surface/30 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl rounded-2xl border border-tbat-surface/50">
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-tbat-secondary rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="w-2 h-2 bg-tbat-secondary rounded-full group-hover:scale-125 transition-transform"></div>
              </div>
              <h3 className="text-xl font-bold text-tbat-primary thai-text mb-3">
                ผลคะแนนของฉัน
              </h3>
              <p className="text-gray-600 thai-text mb-6 leading-relaxed">
                ดูผลคะแนนและวิเคราะห์จุดแข็งจุดอ่อนของตัวเอง
              </p>
              <button className="w-full bg-tbat-secondary text-white px-6 py-3 rounded-xl font-medium thai-text hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-tbat-secondary/30">
                ดูผลคะแนน
              </button>
            </div>
          </div>

          {/* Tertiary Action - History */}
          <div className="group bg-tbat-white hover:bg-tbat-surface/30 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl rounded-2xl border border-tbat-surface/50">
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-tbat-background rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-tbat-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="w-2 h-2 bg-tbat-background rounded-full group-hover:scale-125 transition-transform"></div>
              </div>
              <h3 className="text-xl font-bold text-tbat-primary thai-text mb-3">
                ประวัติการทำแบบทดสอบ
              </h3>
              <p className="text-gray-600 thai-text mb-6 leading-relaxed">
                ติดตามความก้าวหน้าและประวัติการเรียนรู้
              </p>
              <button className="w-full bg-tbat-background text-tbat-primary border-2 border-tbat-background px-6 py-3 rounded-xl font-medium thai-text hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-tbat-background/30">
                ดูประวัติ
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}