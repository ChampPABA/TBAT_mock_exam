"use client";

import * as React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PackageType, RegistrationData, mockSubjects, mockSessionCapacity } from "@/lib/mock-data";

// Validation schema with Thai language support
const registrationSchema = z.object({
  packageType: z.enum(["FREE", "ADVANCED"]),
  selectedSubject: z.string().optional(),
  sessionTime: z.enum(["09:00-12:00", "13:00-16:00"]),
  firstName: z.string()
    .min(2, "กรุณาระบุชื่อ (อย่างน้อย 2 ตัวอักษร)")
    .max(50, "ชื่อยาวเกินไป"),
  lastName: z.string()
    .min(2, "กรุณาระบุนามสกุล (อย่างน้อย 2 ตัวอักษร)")
    .max(50, "นามสกุลยาวเกินไป"),
  email: z.string()
    .min(1, "กรุณาระบุอีเมล")
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
  phone: z.string()
    .min(10, "หมายเลขโทรศัพท์ต้องมี 10 หลัก")
    .max(10, "หมายเลขโทรศัพท์ต้องมี 10 หลัก")
    .regex(/^0[0-9]{9}$/, "รูปแบบหมายเลขโทรศัพท์ไม่ถูกต้อง (เริ่มต้นด้วย 0)"),
  school: z.string()
    .min(3, "กรุณาระบุชื่อโรงเรียน (อย่างน้อย 3 ตัวอักษร)")
    .max(100, "ชื่อโรงเรียนยาวเกินไป"),
  grade: z.string()
    .min(1, "กรุณาเลือกระดับชั้น"),
  pdpaConsent: z.boolean()
    .refine(val => val === true, "กรุณายอมรับเงื่อนไขการประมวลผลข้อมูลส่วนบุคคล")
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPackage?: PackageType;
  onRegistrationSuccess?: (data: RegistrationData) => void;
}

export function RegistrationModal({ 
  isOpen, 
  onClose, 
  initialPackage,
  onRegistrationSuccess 
}: RegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState<'package' | 'details' | 'consent' | 'confirmation'>('package');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      packageType: initialPackage?.type || "FREE",
      sessionTime: "09:00-12:00",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      school: "",
      grade: "",
      pdpaConsent: false
    }
  });

  const selectedPackageType = form.watch("packageType");
  const pdpaConsent = form.watch("pdpaConsent");

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const registrationData: RegistrationData = {
      packageType: data.packageType,
      selectedSubject: data.selectedSubject,
      sessionTime: data.sessionTime,
      personalInfo: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        school: data.school,
        grade: data.grade,
      },
      pdpaConsent: data.pdpaConsent
    };

    setRegistrationComplete(true);
    setCurrentStep('confirmation');
    onRegistrationSuccess?.(registrationData);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setCurrentStep('package');
      setRegistrationComplete(false);
      form.reset();
      onClose();
    }
  };

  const nextStep = () => {
    switch (currentStep) {
      case 'package':
        setCurrentStep('details');
        break;
      case 'details':
        setCurrentStep('consent');
        break;
      case 'consent':
        form.handleSubmit(onSubmit)();
        break;
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case 'details':
        setCurrentStep('package');
        break;
      case 'consent':
        setCurrentStep('details');
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-md w-full max-h-screen sm:max-h-[90vh] overflow-y-auto"
        data-testid="registration-modal"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-tbat-primary">
              สมัครสอบ TBAT Mock Exam
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            {currentStep === 'confirmation' 
              ? "การสมัครสำเร็จแล้ว!"
              : `ขั้นตอนที่ ${currentStep === 'package' ? '1' : currentStep === 'details' ? '2' : '3'} จาก 3`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {/* Progress Indicator */}
          {!registrationComplete && (
            <div className="flex justify-between mb-6">
              <div className={`flex-1 h-2 rounded ${currentStep !== 'package' ? 'bg-tbat-primary' : 'bg-gray-200'} mr-1`} />
              <div className={`flex-1 h-2 rounded ${currentStep === 'consent' ? 'bg-tbat-primary' : 'bg-gray-200'} mx-1`} />
              <div className="flex-1 h-2 rounded bg-gray-200 ml-1" />
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Step 1: Package Selection */}
              {currentStep === 'package' && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="packageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เลือกแพ็กเกจ</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="space-y-3"
                            data-testid="package-toggle"
                          >
                            <div className="flex items-center space-x-3 p-4 border rounded-lg">
                              <RadioGroupItem value="FREE" id="free" />
                              <div className="flex-1">
                                <label htmlFor="free" className="font-medium">Free Package</label>
                                <p className="text-sm text-gray-600">เลือกสอบ 1 วิชา - ฟรี</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-4 border rounded-lg">
                              <RadioGroupItem value="ADVANCED" id="advanced" />
                              <div className="flex-1">
                                <label htmlFor="advanced" className="font-medium">Advanced Package</label>
                                <p className="text-sm text-gray-600">ครบ 3 วิชา + รายงานละเอียด - ฿690</p>
                              </div>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedPackageType === "FREE" && (
                    <FormField
                      control={form.control}
                      name="selectedSubject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>เลือกวิชาที่ต้องการสอบ</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกวิชา" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockSubjects.map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="sessionTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เลือกเวลาสอบ</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="space-y-2"
                          >
                            {mockSessionCapacity.map((session) => (
                              <div key={session.session_time} className="flex items-center space-x-3 p-3 border rounded">
                                <RadioGroupItem value={session.session_time} />
                                <div className="flex-1">
                                  <span className="font-medium">{session.session_time}</span>
                                  <span className="ml-2 text-sm text-gray-600">
                                    ({session.current_count}/{session.max_capacity} คน)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Personal Details */}
              {currentStep === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ชื่อ</FormLabel>
                          <FormControl>
                            <Input placeholder="ชื่อ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>นามสกุล</FormLabel>
                          <FormControl>
                            <Input placeholder="นามสกุล" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>อีเมล</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="example@email.com" 
                            {...field} 
                            data-testid="email-field"
                          />
                        </FormControl>
                        <FormMessage data-testid="email-error" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>หมายเลขโทรศัพท์</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="0812345678" 
                            {...field} 
                            maxLength={10}
                            data-testid="phone-field"
                          />
                        </FormControl>
                        <FormMessage data-testid="phone-error" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="school"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>โรงเรียน</FormLabel>
                        <FormControl>
                          <Input placeholder="ชื่อโรงเรียน" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ระดับชั้น</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกระดับชั้น" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ม.4">ม.4</SelectItem>
                            <SelectItem value="ม.5">ม.5</SelectItem>
                            <SelectItem value="ม.6">ม.6</SelectItem>
                            <SelectItem value="มหาลัย">มหาลัย</SelectItem>
                            <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: PDPA Consent */}
              {currentStep === 'consent' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">เงื่อนไขการประมวลผลข้อมูลส่วนบุคคล (PDPA)</h3>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p>เราจะใช้ข้อมูลของคุณเพื่อ:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>การจัดการสอบและส่งผลสอบ</li>
                        <li>การติดต่อและแจ้งข้อมูลสำคัญ</li>
                        <li>การปรับปรุงระบบและบริการ</li>
                      </ul>
                      <p className="mt-3">
                        ข้อมูลของคุณจะถูกเก็บเป็นเวลา 6 เดือน และจะถูกลบออกโดยอัตโนมัติหลังจากนั้น
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="pdpaConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="pdpa-consent"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">
                            ข้าพเจ้ายอมรับเงื่อนไขการประมวลผลข้อมูลส่วนบุคคล
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormMessage data-testid="pdpa-error" />
                </div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 'confirmation' && registrationComplete && (
                <div className="text-center space-y-4" data-testid="registration-success">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <h3 className="text-lg font-semibold">สมัครสำเร็จแล้ว!</h3>
                  <p className="text-gray-600">
                    เราได้ส่งอีเมลยืนยันการสมัครไปยัง {form.getValues("email")} แล้ว
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">ขั้นตอนต่อไป:</h4>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      <li>ตรวจสอบอีเมลของคุณสำหรับรายละเอียดการสอบ</li>
                      <li>เตรียมตัวสำหรับวันสอบ: วันเสาร์ที่ 27 กันยายน 2568</li>
                      <li>มาถึงก่อนเวลาสอบ 30 นาที</li>
                      {selectedPackageType === "ADVANCED" && (
                        <li>ชำระเงินได้ที่หน้าเว็บไซต์หรือหน้างาน</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t">
                {currentStep !== 'package' && currentStep !== 'confirmation' && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={isSubmitting}
                  >
                    ย้อนกลับ
                  </Button>
                )}
                
                {currentStep === 'confirmation' ? (
                  <Button 
                    type="button" 
                    onClick={handleClose}
                    className="w-full bg-tbat-primary hover:bg-tbat-primary/90"
                  >
                    ปิด
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    onClick={nextStep}
                    disabled={isSubmitting || (currentStep === 'consent' && !pdpaConsent)}
                    className="ml-auto bg-tbat-primary hover:bg-tbat-primary/90"
                  >
                    {isSubmitting ? (
                      "กำลังดำเนินการ..."
                    ) : currentStep === 'consent' ? (
                      "ยืนยันการสมัคร"
                    ) : (
                      "ต่อไป"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}