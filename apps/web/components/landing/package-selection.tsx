"use client";

import React, { useState } from 'react';
import { mockPackages, PackageType, mockSubjects, SubjectOption } from '@/lib/mock-data';

interface PackageSelectionProps {
  onPackageSelect?: (packageType: "FREE" | "ADVANCED", selectedSubject?: string) => void;
  className?: string;
}

export default function PackageSelection({ onPackageSelect, className = "" }: PackageSelectionProps) {
  const [selectedPackage, setSelectedPackage] = useState<"FREE" | "ADVANCED" | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const handlePackageClick = (packageType: "FREE" | "ADVANCED") => {
    setSelectedPackage(packageType);
    
    if (packageType === "ADVANCED") {
      // Advanced package doesn't need subject selection
      if (onPackageSelect) {
        onPackageSelect(packageType);
      }
    } else {
      // Free package needs subject selection - don't call onPackageSelect until subject is selected
      setSelectedSubject("");
    }
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    if (onPackageSelect && selectedPackage === "FREE") {
      onPackageSelect("FREE", subjectId);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getBadgeClasses = (badgeColor?: string) => {
    switch (badgeColor) {
      case "green":
        return "bg-green-100 text-green-700";
      case "yellow":
        return "bg-yellow-400 text-yellow-900";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <section className={`py-16 bg-white ${className}`} id="pricing">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 font-prompt">
            เลือกแพ็กเกจที่เหมาะกับคุณ
          </h2>
          <p className="text-lg text-gray-600 font-prompt">
            เริ่มต้นฟรี หรือปลดล็อกความสามารถเต็มรูปแบบ
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {mockPackages.map((pkg) => (
            <div 
              key={pkg.type}
              className={`
                relative rounded-2xl p-8 transition-all duration-300 cursor-pointer
                ${pkg.type === "FREE" 
                  ? "bg-white border-2 border-gray-200 hover:border-tbat-primary" 
                  : "bg-gradient-to-br from-tbat-primary to-tbat-secondary text-white hover:shadow-2xl"
                }
                ${selectedPackage === pkg.type ? "ring-4 ring-tbat-accent ring-opacity-50 scale-105" : ""}
              `}
              onClick={() => handlePackageClick(pkg.type)}
            >
              {/* Status Badge */}
              {pkg.badge && (
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${getBadgeClasses(pkg.badgeColor)}`}>
                  {pkg.badge}
                </div>
              )}
              
              {/* Package Header */}
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold mb-2 font-prompt ${pkg.type === "FREE" ? "text-gray-800" : "text-white"}`}>
                  {pkg.name}
                </h3>
                <div className="mb-1">
                  {pkg.originalPrice && (
                    <span className={`text-2xl line-through mr-2 ${pkg.type === "FREE" ? "text-gray-400" : "text-gray-300"}`}>
                      {formatPrice(pkg.originalPrice)}
                    </span>
                  )}
                  <span className={`text-4xl font-bold font-prompt ${pkg.type === "FREE" ? "text-gray-800" : "text-white"}`}>
                    {pkg.price === 0 ? "฿0" : formatPrice(pkg.price)}
                  </span>
                </div>
                <p className={`font-prompt ${pkg.type === "FREE" ? "text-gray-600" : "text-tbat-light"}`}>
                  {pkg.description}
                </p>
                
                {/* Capacity Status for FREE package */}
                {pkg.type === "FREE" && pkg.limitations && (
                  <div className="mt-2">
                    {pkg.limitations.map((limitation, index) => (
                      <p 
                        key={index}
                        className={`text-sm font-semibold font-prompt ${
                          limitation.includes("⚠️") ? "text-orange-600" : "text-red-600"
                        }`}
                      >
                        {limitation}
                      </p>
                    ))}
                  </div>
                )}
                
                {/* Limited Status for ADVANCED package */}
                {pkg.type === "ADVANCED" && (
                  <p className="text-yellow-300 text-sm font-semibold mt-2 font-prompt">
                    {pkg.availability.statusText}
                  </p>
                )}
              </div>
              
              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, index) => (
                  <li key={index} className={`flex items-center ${pkg.type === "FREE" ? "text-gray-700" : "text-white"}`}>
                    <span className={`
                      w-5 h-5 rounded-full flex items-center justify-center text-sm mr-3 font-bold
                      ${feature.included 
                        ? (pkg.type === "FREE" 
                            ? "bg-green-100 text-green-600" 
                            : "bg-white text-tbat-primary"
                          )
                        : "bg-gray-100 text-gray-400"
                      }
                    `}>
                      {feature.included ? "✓" : "–"}
                    </span>
                    <span className={`font-prompt ${feature.included ? "" : "text-gray-400"}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              
              {/* Action Button */}
              <button 
                className={`
                  w-full py-3 px-6 rounded-xl font-semibold transition-colors duration-200 font-prompt
                  ${pkg.type === "FREE"
                    ? "border-2 border-tbat-primary text-tbat-primary hover:bg-tbat-primary hover:text-white"
                    : "bg-white text-tbat-primary hover:bg-gray-100 btn-hover-effect"
                  }
                `}
              >
                {pkg.type === "ADVANCED" && pkg.originalPrice ? (
                  <>
                    {pkg.buttonText} <span className="line-through text-gray-400">{formatPrice(pkg.originalPrice)}</span> {formatPrice(pkg.price)}
                  </>
                ) : (
                  pkg.buttonText
                )}
              </button>
              
              {/* Footer Note */}
              {pkg.footerNote && (
                <p className={`text-xs text-center mt-4 font-prompt ${pkg.type === "FREE" ? "text-gray-500" : "text-tbat-light"}`}>
                  {pkg.footerNote}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Subject Selection for Free Package */}
        {selectedPackage === "FREE" && (
          <div className="max-w-2xl mx-auto mt-12 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-xl font-bold text-center text-gray-800 mb-4 font-prompt">
              เลือกวิชาที่ต้องการสอบ (Free Package)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockSubjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => handleSubjectSelect(subject.id)}
                  disabled={!subject.enabled}
                  className={`
                    p-4 rounded-lg border-2 transition-colors duration-200 font-prompt
                    ${selectedSubject === subject.id
                      ? "border-tbat-primary bg-tbat-primary text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-tbat-primary"
                    }
                    ${!subject.enabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <div className="text-lg font-semibold">{subject.shortName}</div>
                  <div className="text-sm">{subject.name}</div>
                </button>
              ))}
            </div>
            {selectedSubject && (
              <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg text-center">
                <p className="text-green-800 font-semibold font-prompt">
                  ✅ เลือกวิชา: {mockSubjects.find(s => s.id === selectedSubject)?.name}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Selection Summary */}
        {selectedPackage && (selectedPackage === "ADVANCED" || selectedSubject) && (
          <div className="max-w-2xl mx-auto mt-8 p-6 bg-tbat-primary text-white rounded-xl text-center">
            <h3 className="text-xl font-bold mb-2 font-prompt">🎉 การเลือกแพ็กเกจของคุณ</h3>
            <p className="font-prompt">
              แพ็กเกจ: <strong>{mockPackages.find(p => p.type === selectedPackage)?.name}</strong>
              {selectedSubject && (
                <> | วิชา: <strong>{mockSubjects.find(s => s.id === selectedSubject)?.name}</strong></>
              )}
            </p>
            <button className="mt-4 px-6 py-2 bg-white text-tbat-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors font-prompt">
              ดำเนินการต่อ
            </button>
          </div>
        )}
      </div>
    </section>
  );
}