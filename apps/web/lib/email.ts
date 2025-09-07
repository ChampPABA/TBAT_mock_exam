import { Resend } from "resend"

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined")
}

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "TBAT Mock Exam <noreply@tbat-exam.com>"

export interface EmailTemplate {
  to: string
  subject: string
  html: string
}

// Email templates with Thai language support
export const emailTemplates = {
  registration: (userName: string, email: string): EmailTemplate => ({
    to: email,
    subject: "ยินดีต้อนรับสู่ TBAT Mock Exam Platform",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ยินดีต้อนรับสู่ TBAT Mock Exam</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">ยินดีต้อนรับสู่ TBAT Mock Exam Platform</h1>
          
          <p>สวัสดีคุณ ${userName},</p>
          
          <p>ขอบคุณที่สมัครสมาชิกกับ TBAT Mock Exam Platform ระบบจำลองสอบเข้าแพทย์ชั้นนำ</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>ข้อมูลบัญชีของคุณ:</h3>
            <ul>
              <li><strong>อีเมล:</strong> ${email}</li>
              <li><strong>แพ็กเกจ:</strong> FREE (ทดลองใช้ 1 วิชา)</li>
            </ul>
          </div>
          
          <p>คุณสามารถเข้าใช้งานระบบได้ทันที:</p>
          <a href="${process.env.NEXTAUTH_URL}/dashboard" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
            เข้าสู่ระบบ
          </a>
          
          <hr style="margin: 30px 0;">
          
          <h3>🎯 แพ็กเกจ Advanced (690 บาท)</h3>
          <ul>
            <li>ทำสอบครบ 3 วิชา (ชีววิทยา เคมี ฟิสิกส์)</li>
            <li>วิเคราะห์ผลแบบละเอียด พร้อมเปรียบเทียบ</li>
            <li>ดาวน์โหลดเฉลยและคำอธิบาย PDF</li>
          </ul>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            หากมีคำถาม ติดต่อ: support@tbat-exam.com<br>
            ทีม TBAT Mock Exam Platform
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  examCode: (userName: string, email: string, examCode: string, packageType: string, subject?: string): EmailTemplate => ({
    to: email,
    subject: "รหัสสอบของคุณพร้อมแล้ว - TBAT Mock Exam",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>รหัสสอบ TBAT Mock Exam</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">🎯 รหัสสอบของคุณพร้อมแล้ว</h1>
          
          <p>สวัสดีคุณ ${userName},</p>
          
          <div style="background-color: #dbeafe; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h2 style="color: #1e40af; margin-bottom: 10px;">รหัสสอบของคุณ</h2>
            <div style="font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 2px; font-family: monospace;">
              ${examCode}
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>รายละเอียดการสอบ:</h3>
            <ul>
              <li><strong>แพ็กเกจ:</strong> ${packageType}</li>
              ${subject ? `<li><strong>วิชา:</strong> ${subject}</li>` : '<li><strong>วิชา:</strong> ชีววิทยา เคมี ฟิสิกส์ (ครบ 3 วิชา)</li>'}
              <li><strong>เวลาสอบ:</strong> 09:00-12:00 หรือ 13:00-16:00</li>
              <li><strong>สถานที่:</strong> ตามที่ระบุในรหัสสอบ</li>
            </ul>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>⚠️ สำคัญ:</strong> กรุณาเก็บรหัสสอบนี้ไว้ให้ดี และนำมาในวันสอบ</p>
          </div>
          
          <a href="${process.env.NEXTAUTH_URL}/dashboard" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
            ดูรายละเอียดเพิ่มเติม
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            หากมีคำถาม ติดต่อ: support@tbat-exam.com<br>
            ทีม TBAT Mock Exam Platform
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  examResults: (userName: string, email: string, totalScore: number, packageType: string): EmailTemplate => ({
    to: email,
    subject: "ผลสอบของคุณพร้อมแล้ว - TBAT Mock Exam",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ผลสอบ TBAT Mock Exam</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">📊 ผลสอบของคุณพร้อมแล้ว</h1>
          
          <p>สวัสดีคุณ ${userName},</p>
          
          <div style="background-color: #ecfdf5; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h2 style="color: #065f46; margin-bottom: 10px;">คะแนนรวม</h2>
            <div style="font-size: 48px; font-weight: bold; color: #065f46;">
              ${totalScore}
            </div>
            <p style="color: #047857; margin-top: 10px;">จาก 300 คะแนนเต็ม</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>รายละเอียดผลสอบ:</h3>
            <ul>
              <li><strong>แพ็กเกจ:</strong> ${packageType}</li>
              <li><strong>วันที่สอบ:</strong> ${new Date().toLocaleDateString('th-TH')}</li>
              <li><strong>สถานะ:</strong> ดูผลได้ถึง ${new Date(Date.now() + 6*30*24*60*60*1000).toLocaleDateString('th-TH')}</li>
            </ul>
          </div>
          
          ${packageType === 'FREE' ? `
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🎯 อัปเกรดเป็น Advanced เพื่อรับสิทธิ์เพิ่มเติม</h3>
            <ul>
              <li>วิเคราะห์ผลแบบละเอียด พร้อมเปรียบเทียบ</li>
              <li>ดาวน์โหลดเฉลยและคำอธิบาย PDF</li>
              <li>ข้อมูลการแข่งขันเชิงลึก</li>
            </ul>
            <p><strong>ราคา:</strong> เพียง 290 บาท (ลด 400 บาทจากราคาปกติ)</p>
          </div>
          ` : ''}
          
          <a href="${process.env.NEXTAUTH_URL}/results" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
            ดูผลสอบแบบละเอียด
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            หากมีคำถาม ติดต่อ: support@tbat-exam.com<br>
            ทีม TBAT Mock Exam Platform
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  paymentSuccess: (userName: string, email: string, amount: number, packageType: string): EmailTemplate => ({
    to: email,
    subject: "การชำระเงินสำเร็จ - TBAT Mock Exam",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>การชำระเงินสำเร็จ</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #059669;">✅ การชำระเงินสำเร็จ</h1>
          
          <p>สวัสดีคุณ ${userName},</p>
          
          <p>ขอบคุณสำหรับการชำระเงิน บัญชีของคุณได้รับการอัปเกรดเรียบร้อยแล้ว</p>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>รายละเอียดการชำระเงิน:</h3>
            <ul>
              <li><strong>จำนวนเงิน:</strong> ฿${(amount / 100).toLocaleString('th-TH')}</li>
              <li><strong>แพ็กเกจ:</strong> ${packageType === 'ADVANCED_PACKAGE' ? 'Advanced Package' : 'Post-Exam Upgrade'}</li>
              <li><strong>วันที่:</strong> ${new Date().toLocaleDateString('th-TH')}</li>
              <li><strong>สถานะ:</strong> สำเร็จ</li>
            </ul>
          </div>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🎉 สิทธิ์ที่คุณได้รับ:</h3>
            <ul>
              <li>✅ ทำสอบครบ 3 วิชา (ชีววิทยา เคมี ฟิสิกส์)</li>
              <li>✅ วิเคราะห์ผลแบบละเอียด พร้อมเปรียบเทียบ</li>
              <li>✅ ดาวน์โหลดเฉลยและคำอธิบาย PDF</li>
              <li>✅ ข้อมูลการแข่งขันเชิงลึก</li>
            </ul>
          </div>
          
          <a href="${process.env.NEXTAUTH_URL}/dashboard" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
            เข้าใช้งานระบบ
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            หากมีคำถาม ติดต่อ: support@tbat-exam.com<br>
            ทีม TBAT Mock Exam Platform
          </p>
        </div>
      </body>
      </html>
    `,
  }),
}

export async function sendEmail(template: EmailTemplate) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: template.to,
      subject: template.subject,
      html: template.html,
    })

    if (error) {
      console.error("Error sending email:", error)
      throw error
    }

    console.log("Email sent successfully:", data?.id)
    return data
  } catch (error) {
    console.error("Failed to send email:", error)
    throw error
  }
}

// Utility functions for common email scenarios
export async function sendRegistrationEmail(userName: string, email: string) {
  const template = emailTemplates.registration(userName, email)
  return await sendEmail(template)
}

export async function sendExamCodeEmail(
  userName: string, 
  email: string, 
  examCode: string, 
  packageType: string, 
  subject?: string
) {
  const template = emailTemplates.examCode(userName, email, examCode, packageType, subject)
  return await sendEmail(template)
}

export async function sendExamResultsEmail(
  userName: string, 
  email: string, 
  totalScore: number, 
  packageType: string
) {
  const template = emailTemplates.examResults(userName, email, totalScore, packageType)
  return await sendEmail(template)
}

export async function sendPaymentSuccessEmail(
  userName: string, 
  email: string, 
  amount: number, 
  packageType: string
) {
  const template = emailTemplates.paymentSuccess(userName, email, amount, packageType)
  return await sendEmail(template)
}