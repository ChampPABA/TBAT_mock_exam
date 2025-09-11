'use client';

import React from 'react';

interface PackageFeature {
  id: number;
  text: string;
  included: boolean;
}

interface Package {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  subtitle: string;
  badge?: {
    text: string;
    color: string;
  };
  features: PackageFeature[];
  buttonText: string;
  buttonStyle: string;
  description: string;
  note?: string;
  gradient?: boolean;
}

interface PricingSectionProps {
  packages?: Package[];
  onSelectPackage?: (packageId: number) => void;
}

const defaultPackages: Package[] = [
  {
    id: 1,
    name: "Free Package",
    price: 0,
    subtitle: "ทดลองฟรี",
    badge: {
      text: "เปิดรับสมัคร",
      color: "bg-green-100 text-green-700"
    },
    features: [
      { id: 1, text: "เลือกสอบได้ 1 วิชา", included: true },
      { id: 2, text: "ผลสอบพื้นฐาน", included: true },
      { id: 3, text: "คะแนนรวมและเปรียบเทียบ", included: true },
      { id: 4, text: "การวิเคราะห์แบบจำกัด", included: false },
      { id: 5, text: "PDF เฉลยและคำอธิบาย", included: false },
      { id: 6, text: "รายงานการวิเคราะห์ละเอียด", included: false },
      { id: 7, text: "เอาข้อสอบกลับบ้านไม่ได้", included: false }
    ],
    buttonText: "เลือกแพ็กเกจฟรี",
    buttonStyle: "border-2 border-tbat-primary text-tbat-primary hover:bg-tbat-primary hover:text-white",
    description: "เหมาะสำหรับผู้ที่ต้องการทดลองสอบเบื้องต้น",
    note: "⚠️ หมายเหตุ: เมื่อ Free Package เต็ม จะเปิดเฉพาะ Advanced Package เท่านั้น",
    gradient: false
  },
  {
    id: 2,
    name: "Advanced Package",
    price: 690,
    originalPrice: 990,
    subtitle: "สิทธิพิเศษ สมัคร 3 วันแรกเท่านั้น",
    badge: {
      text: "แนะนำ",
      color: "bg-yellow-400 text-yellow-900"
    },
    features: [
      { id: 1, text: "ครบทั้ง 3 วิชา (ชีวะ เคมี ฟิสิกส์)", included: true },
      { id: 2, text: "รายงานการวิเคราะห์แบบละเอียด", included: true },
      { id: 3, text: "ดาวน์โหลด PDF เฉลยและคำอธิบาย", included: true },
      { id: 4, text: "เปรียบเทียบกับสถิติโรงเรียนดัง", included: true },
      { id: 5, text: "แนะนำจุดที่ต้องปรับปรุง", included: true },
      { id: 6, text: "การวิเคราะห์ผลการสอบ", included: true },
      { id: 7, text: "เอาข้อสอบกลับบ้านได้", included: true }
    ],
    buttonText: "อัพเกรดเลย ฿690",
    buttonStyle: "bg-white text-tbat-primary hover:bg-gray-100",
    description: "เหมาะสำหรับผู้ที่ต้องการเตรียมตัวอย่างจริงจัง",
    gradient: true
  }
];

const PricingSection: React.FC<PricingSectionProps> = ({
  packages = defaultPackages,
  onSelectPackage
}) => {
  const handleSelectPackage = (packageId: number) => {
    if (onSelectPackage) {
      onSelectPackage(packageId);
    } else {
      console.log(`Selected package: ${packageId}`);
      alert(`เลือก Package ID: ${packageId} - จะเชื่อมต่อกับระบบสมัครในอนาคต`);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-white" id="pricing">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            เลือกแพ็กเกจที่เหมาะกับคุณ
          </h2>
          <p className="text-lg text-gray-600">
            เริ่มต้นฟรี หรือปลดล็อกความสามารถเต็มรูปแบบ
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-2xl p-8 relative ${
                pkg.gradient
                  ? 'bg-gradient-to-br from-tbat-primary to-tbat-secondary text-white overflow-hidden'
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              {/* Status Badge */}
              {pkg.badge && (
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${pkg.badge.color}`}>
                  {pkg.badge.text}
                </div>
              )}
              
              {/* Package Header */}
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${pkg.gradient ? 'text-white' : 'text-gray-800'}`}>
                  {pkg.name}
                </h3>
                <div className="mb-1">
                  {pkg.originalPrice && (
                    <span className={`text-2xl line-through mr-2 ${pkg.gradient ? 'text-gray-300' : 'text-gray-400'}`}>
                      ฿{pkg.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className={`text-4xl font-bold ${pkg.gradient ? 'text-white' : 'text-gray-800'}`}>
                    ฿{pkg.price.toLocaleString()}
                  </span>
                </div>
                <p className={`${pkg.gradient ? 'text-tbat-light' : 'text-gray-600'}`}>
                  {pkg.subtitle}
                </p>
                {pkg.id === 1 && (
                  <p className="text-red-600 text-sm font-semibold mt-2">
                    จำกัด 300 ที่ (ไม่เกิน 150 ที่/รอบ)
                  </p>
                )}
                {pkg.id === 2 && (
                  <p className="text-yellow-300 text-sm font-semibold mt-2">
                    จำนวนจำกัด
                  </p>
                )}
              </div>
              
              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li
                    key={feature.id}
                    className={`flex items-center ${
                      feature.included
                        ? pkg.gradient
                          ? 'text-white'
                          : 'text-gray-700'
                        : 'text-gray-400'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-sm mr-3 ${
                        feature.included
                          ? pkg.gradient
                            ? 'bg-white text-tbat-primary font-bold'
                            : 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {feature.included ? '✓' : '–'}
                    </span>
                    {feature.text}
                  </li>
                ))}
              </ul>
              
              {/* CTA Button */}
              <button
                onClick={() => handleSelectPackage(pkg.id)}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors duration-200 ${pkg.buttonStyle}`}
              >
                {pkg.buttonText}
              </button>
              
              {/* Package Description */}
              <p className={`text-xs text-center mt-4 ${pkg.gradient ? 'text-tbat-light' : 'text-gray-500'}`}>
                {pkg.description}
                {pkg.note && (
                  <>
                    <br />
                    <span className="text-orange-800 font-semibold">{pkg.note}</span>
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;