import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
export const emailTemplates = {
  registration: {
    subject: "ยินดีต้อนรับสู่ TBAT Mock Exam - ลงทะเบียนสำเร็จ",
    html: (data: { name: string; email: string }) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>ยินดีต้อนรับ</title>
        </head>
        <body style="font-family: 'Noto Sans Thai', sans-serif; background-color: #f7fafc; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px;">
            <h1 style="color: #2d3748; margin-bottom: 20px;">สวัสดีคุณ ${data.name}</h1>
            <p style="color: #4a5568; line-height: 1.6;">
              ขอบคุณที่ลงทะเบียนกับ TBAT Mock Exam Platform
            </p>
            <p style="color: #4a5568; line-height: 1.6;">
              อีเมล: ${data.email}<br>
              คุณสามารถเข้าสู่ระบบและเริ่มทำข้อสอบได้ทันที
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 14px;">
                หากมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อเราที่ support@tbat-exam.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  },
  examTicket: {
    subject: "ตั๋วสอบ TBAT Mock Exam - รหัสสอบของคุณ",
    html: (data: { name: string; code: string; sessionTime: string; subjects: string[] }) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>ตั๋วสอบ</title>
        </head>
        <body style="font-family: 'Noto Sans Thai', sans-serif; background-color: #f7fafc; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px;">
            <h1 style="color: #2d3748; margin-bottom: 20px;">ตั๋วสอบ TBAT Mock Exam</h1>
            <div style="background-color: #edf2f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #2d3748; margin: 0 0 10px 0;">รหัสสอบของคุณ</h2>
              <p style="font-size: 24px; font-weight: bold; color: #3182ce; margin: 10px 0;">
                ${data.code}
              </p>
            </div>
            <div style="margin: 20px 0;">
              <p style="color: #4a5568; line-height: 1.6;">
                <strong>ชื่อ:</strong> ${data.name}<br>
                <strong>เวลาสอบ:</strong> ${data.sessionTime}<br>
                <strong>วิชา:</strong> ${data.subjects.join(", ")}<br>
                <strong>วันที่สอบ:</strong> 27 กันยายน 2568
              </p>
            </div>
            <div style="background-color: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #fc8181;">
              <p style="color: #742a2a; margin: 0;">
                <strong>สำคัญ:</strong> กรุณาเก็บรหัสสอบนี้ไว้เป็นความลับและนำมาในวันสอบ
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  },
  results: {
    subject: "ผลสอบ TBAT Mock Exam พร้อมแล้ว",
    html: (data: { name: string; totalScore: number; packageType: string }) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>ผลสอบ</title>
        </head>
        <body style="font-family: 'Noto Sans Thai', sans-serif; background-color: #f7fafc; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px;">
            <h1 style="color: #2d3748; margin-bottom: 20px;">ผลสอบของคุณพร้อมแล้ว!</h1>
            <p style="color: #4a5568; line-height: 1.6;">
              สวัสดีคุณ ${data.name}
            </p>
            <div style="background-color: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #22543d; margin: 0 0 10px 0;">คะแนนรวม</h2>
              <p style="font-size: 36px; font-weight: bold; color: #38a169; margin: 10px 0;">
                ${data.totalScore} คะแนน
              </p>
            </div>
            ${
              data.packageType === "ADVANCED"
                ? `
              <p style="color: #4a5568; line-height: 1.6;">
                คุณสามารถดูรายละเอียดผลสอบ การวิเคราะห์เชิงลึก และเฉลยละเอียด PDF ได้ในระบบ
              </p>
            `
                : `
              <p style="color: #4a5568; line-height: 1.6;">
                อัพเกรดเป็น Advanced Package เพื่อดูการวิเคราะห์เชิงลึกและเฉลยละเอียด PDF
              </p>
            `
            }
            <div style="margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL}/results" 
                 style="display: inline-block; background-color: #3182ce; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
                ดูผลสอบละเอียด
              </a>
            </div>
          </div>
        </body>
      </html>
    `,
  },
  pdfReady: {
    subject: "เฉลยละเอียด PDF พร้อมดาวน์โหลดแล้ว",
    html: (data: { name: string; subject: string }) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>PDF พร้อมแล้ว</title>
        </head>
        <body style="font-family: 'Noto Sans Thai', sans-serif; background-color: #f7fafc; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px;">
            <h1 style="color: #2d3748; margin-bottom: 20px;">เฉลยละเอียด PDF พร้อมแล้ว!</h1>
            <p style="color: #4a5568; line-height: 1.6;">
              สวัสดีคุณ ${data.name}
            </p>
            <p style="color: #4a5568; line-height: 1.6;">
              เฉลยละเอียดวิชา <strong>${data.subject}</strong> พร้อมให้ดาวน์โหลดแล้ว
            </p>
            <div style="margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL}/pdf-solutions" 
                 style="display: inline-block; background-color: #3182ce; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
                ดาวน์โหลด PDF
              </a>
            </div>
            <p style="color: #718096; font-size: 14px; margin-top: 20px;">
              หมายเหตุ: ลิงก์ดาวน์โหลดจะหมดอายุใน 24 ชั่วโมง
            </p>
          </div>
        </body>
      </html>
    `,
  },
};

// Send email function
export async function sendEmail(to: string, template: keyof typeof emailTemplates, data: any) {
  try {
    const emailTemplate = emailTemplates[template];

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html(data),
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

// Send bulk emails
export async function sendBulkEmails(
  recipients: string[],
  template: keyof typeof emailTemplates,
  data: any
) {
  const results = await Promise.allSettled(
    recipients.map((email) => sendEmail(email, template, data))
  );

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return {
    total: recipients.length,
    successful,
    failed,
  };
}

// Queue email for retry
export async function queueEmail(
  to: string,
  template: keyof typeof emailTemplates,
  data: any,
  retries = 3
) {
  let attempt = 0;
  let lastError;

  while (attempt < retries) {
    const result = await sendEmail(to, template, data);

    if (result.success) {
      return result;
    }

    lastError = result.error;
    attempt++;

    // Exponential backoff
    await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
  }

  console.error(`Failed to send email after ${retries} attempts:`, lastError);
  return { success: false, error: lastError };
}
