'use client'

interface PendingContentProps {
  type?: 'text' | 'image' | 'section' | 'feature'
  label?: string
  className?: string
}

export default function PendingContent({ 
  type = 'text', 
  label = 'เนื้อหาจะมีการปรับปรุงในภายหลัง',
  className = ''
}: PendingContentProps) {
  
  const baseClass = "relative overflow-hidden rounded-lg"
  
  if (type === 'text') {
    return (
      <div className={`${baseClass} bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 p-4 border-2 border-dashed border-gray-300 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl animate-pulse">⏳</span>
          <span className="text-gray-500 text-sm thai-text italic">{label}</span>
        </div>
      </div>
    )
  }
  
  if (type === 'image') {
    return (
      <div className={`${baseClass} bg-gradient-to-br from-gray-100 to-gray-200 aspect-video flex items-center justify-center ${className}`}>
        <div className="text-center">
          <span className="text-4xl mb-2 block animate-bounce">🖼️</span>
          <span className="text-gray-500 text-sm thai-text">{label}</span>
        </div>
      </div>
    )
  }
  
  if (type === 'section') {
    return (
      <div className={`${baseClass} bg-yellow-50 border-2 border-yellow-200 p-8 ${className}`}>
        <div className="flex items-start space-x-3">
          <span className="text-3xl">🚧</span>
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 thai-text mb-1">กำลังพัฒนา</h3>
            <p className="text-yellow-600 text-sm thai-text">{label}</p>
          </div>
        </div>
      </div>
    )
  }
  
  if (type === 'feature') {
    return (
      <div className={`${baseClass} bg-gradient-to-r from-tbat-surface/20 to-tbat-background/10 p-6 border-2 border-tbat-primary/20 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-tbat-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-xl animate-pulse">✨</span>
            </div>
            <div>
              <h4 className="font-semibold text-tbat-primary thai-text">ฟีเจอร์ใหม่</h4>
              <p className="text-sm text-gray-600 thai-text">{label}</p>
            </div>
          </div>
          <span className="text-xs bg-tbat-secondary/20 text-tbat-secondary px-2 py-1 rounded-full thai-text">เร็วๆ นี้</span>
        </div>
      </div>
    )
  }
  
  return null
}

// Skeleton Loading Component
export function SkeletonLoader({ lines = 3, className = '' }: { lines?: number, className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{
          width: `${Math.random() * 40 + 60}%`,
          animationDelay: `${i * 0.1}s`
        }}></div>
      ))}
    </div>
  )
}

// Content Badge for marking pending areas
export function PendingBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full ${className}`}>
      <span className="mr-1">⚠️</span>
      <span className="thai-text">รอปรับปรุง</span>
    </span>
  )
}