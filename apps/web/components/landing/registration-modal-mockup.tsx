"use client";

import * as React from "react";
import { useState } from "react";
import { X, CheckCircle } from "lucide-react";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistrationSuccess?: (data: RegistrationFormData) => void;
}

interface RegistrationFormData {
  // Step 1: Personal Information
  fullname: string;
  nickname: string;
  email: string;
  phone: string;
  lineid: string;
  school: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  
  // Step 2: Subject Selection
  subject: "biology" | "chemistry" | "physics";
  
  // Step 3: Terms
  termsAccepted: boolean;
}

export function RegistrationModalMockup({ isOpen, onClose, onRegistrationSuccess }: RegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullname: "",
    nickname: "",
    email: "",
    phone: "",
    lineid: "",
    school: "",
    grade: "",
    parentName: "",
    parentPhone: "",
    subject: "biology",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({});

  if (!isOpen) return null;

  const validateStep1 = () => {
    const newErrors: Partial<Record<keyof RegistrationFormData, string>> = {};
    
    if (!formData.fullname.trim()) newErrors.fullname = "กรุณากรอกชื่อ-นามสกุล";
    if (!formData.email.trim()) newErrors.email = "กรุณากรอกอีเมล";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    if (!formData.phone.trim()) newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
    else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[- ]/g, ""))) newErrors.phone = "เบอร์โทรศัพท์ต้องมี 10 หลัก";
    if (!formData.lineid.trim()) newErrors.lineid = "กรุณากรอก Line ID";
    if (!formData.school) newErrors.school = "กรุณาเลือกโรงเรียน";
    if (!formData.grade) newErrors.grade = "กรุณาเลือกระดับชั้น";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!formData.termsAccepted) {
      setErrors({ termsAccepted: "กรุณายอมรับข้อตกลงและเงื่อนไข" });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate exam code
    const subjectCodes = {
      biology: "BIO",
      chemistry: "CHE",
      physics: "PHY"
    };
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const examCode = `FREE-${randomCode}-${subjectCodes[formData.subject]}`;
    
    setGeneratedCode(examCode);
    setShowSuccess(true);
    setIsSubmitting(false);
    
    onRegistrationSuccess?.(formData);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setCurrentStep(1);
      setShowSuccess(false);
      setFormData({
        fullname: "",
        nickname: "",
        email: "",
        phone: "",
        lineid: "",
        school: "",
        grade: "",
        parentName: "",
        parentPhone: "",
        subject: "biology",
        termsAccepted: false,
      });
      setErrors({});
      onClose();
    }
  };

  const schools = [
    { value: "montfort", label: "มงฟอร์ตวิทยาลัย" },
    { value: "yuparaj", label: "ยุพราชวิทยาลัย" },
    { value: "dara", label: "ดาราวิทยาลัย" },
    { value: "regina", label: "เรยีนาเชลีวิทยาลัย" },
    { value: "prince", label: "ปรินส์รอยแยลส์วิทยาลัย" },
    { value: "wachirawit", label: "วชิรวิทย์" },
    { value: "nawaminda", label: "นวมินทราชูทิศ" },
    { value: "other", label: "อื่นๆ" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-6xl w-full h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">ลงทะเบียนสอบ Mock TBAT</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Progress Steps */}
          {!showSuccess && (
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                {/* Step 1 */}
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    currentStep >= 1 ? 'bg-tbat-primary text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    1
                  </div>
                  <span className="ml-3 text-sm font-medium hidden sm:block">ข้อมูลส่วนตัว</span>
                </div>

                {/* Connector 1 */}
                <div className={`flex-1 h-1 mx-4 ${currentStep > 1 ? 'bg-tbat-primary' : 'bg-gray-300'}`} />

                {/* Step 2 */}
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    currentStep >= 2 ? 'bg-tbat-primary text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    2
                  </div>
                  <span className="ml-3 text-sm font-medium hidden sm:block">เลือกวิชา</span>
                </div>

                {/* Connector 2 */}
                <div className={`flex-1 h-1 mx-4 ${currentStep > 2 ? 'bg-tbat-primary' : 'bg-gray-300'}`} />

                {/* Step 3 */}
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    currentStep >= 3 ? 'bg-tbat-primary text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    3
                  </div>
                  <span className="ml-3 text-sm font-medium hidden sm:block">ยืนยันข้อมูล</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && !showSuccess && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-8 h-8 bg-tbat-bg text-tbat-primary rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                  ข้อมูลส่วนตัว
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ-นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullname}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullname: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tbat-primary focus:border-transparent"
                      placeholder="เช่น สมชาย ใจดี"
                    />
                    {errors.fullname && <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อเล่น</label>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tbat-primary focus:border-transparent"
                      placeholder="เช่น ชาย"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อีเมล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tbat-primary focus:border-transparent"
                      placeholder="example@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tbat-primary focus:border-transparent"
                      placeholder="08X-XXX-XXXX"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Line ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lineid}
                      onChange={(e) => setFormData(prev => ({ ...prev, lineid: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tbat-primary focus:border-transparent"
                      placeholder="@lineID"
                    />
                    {errors.lineid && <p className="text-red-500 text-xs mt-1">{errors.lineid}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      โรงเรียน <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.school}
                      onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tbat-primary focus:border-transparent"
                    >
                      <option value="">เลือกโรงเรียน</option>
                      {schools.map((school) => (
                        <option key={school.value} value={school.value}>{school.label}</option>
                      ))}
                    </select>
                    {errors.school && <p className="text-red-500 text-xs mt-1">{errors.school}</p>}
                  </div>
                </div>

                <div>
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 mb-3">
                      ระดับชั้น <span className="text-red-500">*</span>
                    </legend>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {["m4", "m5", "m6", "other"].map((grade) => (
                        <label key={grade} className="cursor-pointer">
                          <input
                            type="radio"
                            name="grade"
                            value={grade}
                            checked={formData.grade === grade}
                            onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                            className="sr-only"
                          />
                          <div className={`px-4 py-3 border rounded-lg text-center font-medium transition-all ${
                            formData.grade === grade 
                              ? 'bg-tbat-primary text-white border-tbat-primary' 
                              : 'border-gray-300 hover:bg-tbat-bg/20'
                          }`}>
                            {grade === "other" ? "อื่นๆ" : grade.replace("m", "ม.")}
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade}</p>}
                  </fieldset>
                </div>

                {/* Parent Information */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-700 mb-4">ข้อมูลผู้ปกครอง (ไม่บังคับ)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อผู้ปกครอง</label>
                      <input
                        type="text"
                        value={formData.parentName}
                        onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tbat-primary focus:border-transparent"
                        placeholder="ชื่อ-นามสกุล"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์ติดต่อผู้ปกครอง</label>
                      <input
                        type="tel"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tbat-primary focus:border-transparent"
                        placeholder="08X-XXX-XXXX"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Subject Selection */}
            {currentStep === 2 && !showSuccess && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-8 h-8 bg-tbat-bg text-tbat-primary rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                  เลือกวิชาที่ต้องการทดลองสอบ
                </h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>สมาชิก FREE:</strong> สามารถเลือกทดลองสอบได้ 1 วิชา | อัพเกรดเป็น Advanced Package เพื่อสอบทั้ง 3 วิชา
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { value: "biology", name: "Biology (ชีววิทยา)", time: "60 นาที", questions: "55 ข้อ", color: "green" },
                    { value: "chemistry", name: "Chemistry (เคมี)", time: "60 นาที", questions: "55 ข้อ", color: "blue" },
                    { value: "physics", name: "Physics (ฟิสิกส์)", time: "60 นาที", questions: "30 ข้อ", color: "purple" }
                  ].map((subject) => (
                    <label key={subject.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="subject"
                        value={subject.value}
                        checked={formData.subject === subject.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value as any }))}
                        className="sr-only"
                      />
                      <div className={`p-6 border-2 rounded-xl transition-all ${
                        formData.subject === subject.value 
                          ? 'border-tbat-primary bg-tbat-bg/10' 
                          : 'border-gray-200 hover:border-tbat-primary hover:shadow-lg'
                      }`}>
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-800">{subject.name}</h4>
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            subject.color === 'green' ? 'bg-green-100 text-green-700' :
                            subject.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {subject.time}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2">{subject.questions} | ครอบคลุมตามโครงสร้าง TBAT</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Upgrade Option */}
                <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">อยากสอบทั้ง 3 วิชา?</h4>
                      <p className="text-gray-600 text-sm">Advanced Package เพื่อสอบครบทุกวิชา พร้อมวิเคราะห์ผลละเอียด</p>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg hover:shadow-lg transition-all">
                      Advanced Package ฿690
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && !showSuccess && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-8 h-8 bg-tbat-bg text-tbat-primary rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                  ยืนยันข้อมูลการลงทะเบียน
                </h3>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">สรุปข้อมูลของคุณ</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ชื่อ-นามสกุล:</span>
                      <span className="font-medium">{formData.fullname}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">อีเมล:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">เบอร์โทร:</span>
                      <span className="font-medium">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">โรงเรียน:</span>
                      <span className="font-medium">{schools.find(s => s.value === formData.school)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">วิชาที่เลือก:</span>
                      <span className="font-medium text-tbat-primary">
                        {formData.subject === "biology" ? "Biology (ชีววิทยา)" :
                         formData.subject === "chemistry" ? "Chemistry (เคมี)" : 
                         "Physics (ฟิสิกส์)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                      className="mt-1 mr-3 w-5 h-5 text-tbat-primary rounded"
                    />
                    <span className="text-sm text-gray-600">
                      ข้าพเจ้ายอมรับ{" "}
                      <button type="button" className="text-tbat-primary underline hover:text-tbat-secondary">
                        ข้อตกลงและเงื่อนไข
                      </button>
                      {" "}การใช้งาน และยินยอมให้ Mock TBAT เก็บข้อมูลเพื่อการวิเคราะห์ผลสอบ
                    </span>
                  </label>
                  {errors.termsAccepted && <p className="text-red-500 text-xs mt-1">{errors.termsAccepted}</p>}
                </div>
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">ลงทะเบียนสำเร็จ!</h3>
                <p className="text-gray-600 mb-6">รหัสสอบของคุณคือ</p>
                <div className="text-3xl font-mono font-bold text-tbat-primary mb-6">
                  {generatedCode}
                </div>
                <p className="text-sm text-gray-600 mb-8">
                  เราได้ส่งรหัสสอบและรายละเอียดไปยังอีเมลของคุณ<br />
                  กรุณาเก็บรหัสนี้ไว้สำหรับเข้าสอบในวันที่ 27 กันยายน 2568
                </p>
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={handleClose}
                    className="px-6 py-3 bg-tbat-primary text-white rounded-lg hover:bg-tbat-secondary transition-colors"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          {!showSuccess && (
            <div className="flex justify-between p-6 border-t border-gray-200">
              {currentStep > 1 ? (
                <button 
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1) as any)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  ย้อนกลับ
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button 
                  onClick={handleNext}
                  className="px-8 py-3 bg-tbat-primary text-white rounded-lg hover:bg-tbat-secondary transition-colors"
                >
                  ถัดไป →
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-tbat-primary to-tbat-secondary text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "กำลังลงทะเบียน..." : "ยืนยันการลงทะเบียน"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}