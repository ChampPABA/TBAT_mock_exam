"use client"

import { AlertCircle, Crown, CreditCard } from "lucide-react"

export type TierType = 'FREE' | 'VVIP_BOXSET' | 'VVIP_PAYMENT'

interface TierSelectorProps {
  selectedTier: TierType
  onTierChange: (tier: TierType) => void
  onCodeClear?: () => void
}

export function TierSelector({ 
  selectedTier,
  onTierChange,
  onCodeClear 
}: TierSelectorProps) {
  const handleTierChange = (tier: TierType) => {
    onTierChange(tier)
    if (tier !== 'VVIP_BOXSET' && onCodeClear) {
      onCodeClear()
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold text-blue-900 mb-3">เลือกประเภทการลงทะเบียน</h3>
      <div className="space-y-3">
        {/* FREE Tier Option */}
        <label className="flex items-start cursor-pointer hover:bg-white/50 rounded-md p-2 transition-colors">
          <input
            type="radio"
            name="tier"
            checked={selectedTier === 'FREE'}
            onChange={() => handleTierChange('FREE')}
            className="mt-1 mr-3"
          />
          <div>
            <span className="font-medium">ลงทะเบียนฟรี</span>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              เลือกสอบได้ 1 วิชา
            </p>
          </div>
        </label>

        {/* VVIP with BoxSet Code */}
        <label className="flex items-start cursor-pointer hover:bg-white/50 rounded-md p-2 transition-colors">
          <input
            type="radio"
            name="tier"
            checked={selectedTier === 'VVIP_BOXSET'}
            onChange={() => handleTierChange('VVIP_BOXSET')}
            className="mt-1 mr-3"
          />
          <div>
            <span className="font-medium flex items-center">
              <Crown className="h-4 w-4 mr-1 text-yellow-500" />
              VVIP - ใช้รหัสจาก Box Set
            </span>
            <p className="text-sm text-gray-600 mt-1">
              สอบได้ทั้ง 3 วิชา + วิเคราะห์ผลอย่างละเอียด
            </p>
          </div>
        </label>

        {/* VVIP with Payment */}
        <label className="flex items-start cursor-pointer hover:bg-white/50 rounded-md p-2 transition-colors">
          <input
            type="radio"
            name="tier"
            checked={selectedTier === 'VVIP_PAYMENT'}
            onChange={() => handleTierChange('VVIP_PAYMENT')}
            className="mt-1 mr-3"
          />
          <div>
            <span className="font-medium flex items-center">
              <Crown className="h-4 w-4 mr-1 text-yellow-500" />
              VVIP - ชำระเงิน ฿690
            </span>
            <p className="text-sm text-gray-600 mt-1 flex items-center">
              <CreditCard className="h-4 w-4 mr-1" />
              สอบได้ทั้ง 3 วิชา + วิเคราะห์ผลอย่างละเอียด
            </p>
          </div>
        </label>
      </div>

      {/* Info Box */}
      {selectedTier === 'VVIP_PAYMENT' && (
        <div className="mt-3 p-3 bg-purple-100 border border-purple-300 rounded-md">
          <p className="text-sm text-purple-900">
            💳 จะนำไปสู่หน้าชำระเงินที่ปลอดภัยผ่าน Stripe
          </p>
        </div>
      )}
    </div>
  )
}