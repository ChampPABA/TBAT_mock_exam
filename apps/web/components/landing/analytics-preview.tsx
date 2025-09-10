"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, TrendingUp, BarChart3, PieChart, Target, Award, Unlock } from "lucide-react";

interface AnalyticsPreviewProps {
  onUpgradeClick?: () => void;
  className?: string;
}

export function AnalyticsPreview({ onUpgradeClick, className = "" }: AnalyticsPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleUpgradeClick = () => {
    onUpgradeClick?.();
    // Scroll to package selection and auto-select ADVANCED
    const packageSelection = document.querySelector('[data-testid="package-selection"]');
    if (packageSelection) {
      packageSelection.scrollIntoView({ behavior: 'smooth' });
      // Auto-select Advanced package
      const packageToggle = document.querySelector('[data-testid="package-toggle"]') as HTMLButtonElement;
      if (packageToggle) {
        packageToggle.click();
      }
    }
  };

  return (
    <div className={`relative ${className}`} data-testid="analytics-preview">
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BarChart3 className="h-6 w-6 text-tbat-primary" />
            <CardTitle className="text-xl">รายงานการวิเคราะห์แบบละเอียด</CardTitle>
          </div>
          <CardDescription>
            ดูผลการสอบของคุณเปรียบเทียบกับสถิติโรงเรียนดัง และรับคำแนะนำเพื่อปรับปรุง
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Mock Chart 1: Score Comparison */}
          <div className="relative">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              เปรียบเทียบคะแนนกับโรงเรียนดัง
            </h3>
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex justify-between items-end h-32 gap-2">
                <div className="flex-1 space-y-2">
                  <div className="bg-blue-200 h-20 rounded"></div>
                  <p className="text-xs text-center">ตรียรก</p>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="bg-green-200 h-24 rounded"></div>
                  <p className="text-xs text-center">สวนกุหลาบ</p>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="bg-tbat-primary/30 h-16 rounded border-2 border-tbat-primary"></div>
                  <p className="text-xs text-center font-semibold">คุณ</p>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="bg-purple-200 h-28 rounded"></div>
                  <p className="text-xs text-center">มหิดล</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mock Chart 2: Subject Breakdown */}
          <div className="relative">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              การวิเคราะห์แยกตามวิชา
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg border text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-600">85%</span>
                </div>
                <p className="text-sm font-medium">ชีววิทยา</p>
                <p className="text-xs text-green-600">ดีมาก</p>
              </div>
              <div className="bg-white p-3 rounded-lg border text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-lg font-bold text-yellow-600">72%</span>
                </div>
                <p className="text-sm font-medium">เคมี</p>
                <p className="text-xs text-yellow-600">ปานกลาง</p>
              </div>
              <div className="bg-white p-3 rounded-lg border text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-lg font-bold text-red-600">68%</span>
                </div>
                <p className="text-sm font-medium">ฟิสิกส์</p>
                <p className="text-xs text-red-600">ต้องปรับปรุง</p>
              </div>
            </div>
          </div>

          {/* Mock Chart 3: Improvement Recommendations */}
          <div className="relative">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              คำแนะนำการปรับปรุง
            </h3>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded-lg border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">หัวข้อที่ควรทบทวน: กลศาสตร์</span>
                </div>
                <Badge variant="outline" className="text-xs">ฟิสิกส์</Badge>
              </div>
              <div className="bg-white p-3 rounded-lg border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">จุดแข็ง: ระบบหายใจและไหลเวียนโลหิต</span>
                </div>
                <Badge variant="outline" className="text-xs">ชีวะ</Badge>
              </div>
              <div className="bg-white p-3 rounded-lg border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">ควรฝึกเพิ่ม: สมดุลเคมี</span>
                </div>
                <Badge variant="outline" className="text-xs">เคมี</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blur Overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center rounded-lg transition-all duration-300"
        data-testid="blur-overlay"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="text-center p-6 bg-white/90 rounded-lg border-2 border-tbat-primary shadow-lg max-w-sm mx-4">
          <Lock className="h-12 w-12 text-tbat-primary mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2 text-tbat-primary">
            รายงานการวิเคราะห์แบบละเอียด
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            ดูการวิเคราะห์ผลสอบแบบละเอียด เปรียบเทียบกับโรงเรียนดัง และรับคำแนะนำเฉพาะ
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-xs text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              เปรียบเทียบคะแนนกับสถิติโรงเรียนดัง
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              การวิเคราะห์จุดแข็ง-จุดอ่อนแยกตามวิชา
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              คำแนะนำเฉพาะสำหรับการปรับปรุง
            </div>
          </div>

          <Button 
            onClick={handleUpgradeClick}
            className={`w-full transition-all duration-300 ${
              isHovered 
                ? 'bg-gradient-to-r from-tbat-primary to-tbat-secondary hover:from-tbat-secondary hover:to-tbat-primary transform scale-105' 
                : 'bg-tbat-primary hover:bg-tbat-primary/90'
            }`}
            data-testid="unlock-cta"
          >
            <Unlock className="h-4 w-4 mr-2" />
            อัพเกรดเป็น Advanced Package
          </Button>
          
          <p className="text-xs text-gray-500 mt-2">
            เพียง ฿690 (จากราคาปกติ ฿990)
          </p>
        </div>
      </div>
    </div>
  );
}