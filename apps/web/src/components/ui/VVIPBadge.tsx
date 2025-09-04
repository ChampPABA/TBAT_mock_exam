/**
 * VVIP Badge Component
 * Displays VVIP status in dashboard and other UI areas
 */

"use client"

import { Crown, Star, CheckCircle } from 'lucide-react'

interface VVIPBadgeProps {
  size?: 'small' | 'medium' | 'large'
  showBenefits?: boolean
  className?: string
}

export function VVIPBadge({ 
  size = 'medium',
  showBenefits = false,
  className = ""
}: VVIPBadgeProps) {
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2'
  }

  const iconSize = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5'
  }

  return (
    <div className={className}>
      {/* Badge */}
      <div className={`
        inline-flex items-center gap-1
        bg-gradient-to-r from-purple-600 to-blue-600 
        text-white font-semibold rounded-full
        shadow-lg shadow-purple-500/25
        ${sizeClasses[size]}
      `}>
        <Crown className={`${iconSize[size]} text-yellow-300`} />
        <span>VVIP Member</span>
        <Star className={`${iconSize[size]} text-yellow-300`} />
      </div>

      {/* Benefits List (optional) */}
      {showBenefits && (
        <div className="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
            <Crown className="h-5 w-5 mr-2 text-purple-600" />
            สิทธิพิเศษ VVIP
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start text-purple-700">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-green-600" />
              <span>สอบได้ทั้ง 3 วิชา (Physics, Chemistry, Biology)</span>
            </li>
            <li className="flex items-start text-purple-700">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-green-600" />
              <span>ดูเฉลยและคำอธิบายละเอียดทุกข้อ</span>
            </li>
            <li className="flex items-start text-purple-700">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-green-600" />
              <span>รายงานวิเคราะห์ผลเชิงลึก</span>
            </li>
            <li className="flex items-start text-purple-700">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-green-600" />
              <span>เปรียบเทียบผลกับนักเรียนทั้งหมด</span>
            </li>
            <li className="flex items-start text-purple-700">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-green-600" />
              <span>ดาวน์โหลดรายงาน PDF</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * Simple VVIP indicator for inline use
 */
export function VVIPIndicator({ className = "" }: { className?: string }) {
  return (
    <span className={`
      inline-flex items-center gap-1 
      text-xs font-semibold text-purple-600
      ${className}
    `}>
      <Crown className="h-3 w-3 text-yellow-500" />
      VVIP
    </span>
  )
}