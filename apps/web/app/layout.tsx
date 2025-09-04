import type { Metadata } from "next"
import { Prompt } from "next/font/google"
import "./globals.css"

const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-prompt',
})

export const metadata: Metadata = {
  title: "TBAT Mock Exam Platform",
  description: "Thai Biomedical Admissions Test practice platform for medical school aspirants",
  keywords: "TBAT, medical school, entrance exam, practice test, Thailand",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={`${prompt.variable}`}>
      <body className={`${prompt.className} antialiased`}>
        {/* Variant 6 Medical Background Design */}
        <div className="fixed inset-0 -z-10">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-tbat-surface via-white to-tbat-background/20"></div>
          
          {/* Medical Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="medical-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  {/* Medical Cross Pattern */}
                  <path d="M40 10 L40 40 L10 40 L10 60 L40 60 L40 90 L60 90 L60 60 L90 60 L90 40 L60 40 L60 10 Z" 
                        fill="none" 
                        stroke="#0d7276" 
                        strokeWidth="0.5" 
                        opacity="0.3"/>
                  {/* DNA Helix Inspired Dots */}
                  <circle cx="20" cy="20" r="2" fill="#529a94" opacity="0.2"/>
                  <circle cx="80" cy="80" r="2" fill="#529a94" opacity="0.2"/>
                  <circle cx="20" cy="80" r="1.5" fill="#90bfc0" opacity="0.3"/>
                  <circle cx="80" cy="20" r="1.5" fill="#90bfc0" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#medical-grid)" />
            </svg>
          </div>

          {/* Floating Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-tbat-primary/5 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-tbat-secondary/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tbat-background/3 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>

          {/* Subtle Grid Lines */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(to right, #0d7276 1px, transparent 1px),
                linear-gradient(to bottom, #0d7276 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          ></div>
        </div>

        {/* Main Content */}
        <main className="min-h-screen relative">
          {children}
        </main>
      </body>
    </html>
  )
}