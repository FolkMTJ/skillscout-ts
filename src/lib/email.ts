// src/lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendOTPEmail(email: string, otp: string) {
  const mailOptions = {
    from: `"SkillScout" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'รหัส OTP สำหรับเข้าสู่ระบบ SkillScout',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 SkillScout</h1>
              <p>ยืนยันตัวตนเพื่อเข้าสู่ระบบ</p>
            </div>
            <div class="content">
              <p>สวัสดีค่ะ,</p>
              <p>คุณได้ขอรหัส OTP เพื่อเข้าสู่ระบบ SkillScout</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666;">รหัส OTP ของคุณคือ:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">รหัสนี้จะหมดอายุใน 10 นาที</p>
              </div>
              
              <p style="color: #f59e0b; font-weight: bold;">⚠️ คำเตือน:</p>
              <ul style="color: #666;">
                <li>อย่าแชร์รหัส OTP ให้ผู้อื่น</li>
                <li>SkillScout จะไม่มีทางขอรหัส OTP จากคุณ</li>
                <li>หากคุณไม่ได้ขอรหัสนี้ โปรดเพิกเฉยอีเมลนี้</li>
              </ul>
              
              <div class="footer">
                <p>ขอบคุณที่ใช้บริการ SkillScout</p>
                <p>© 2025 SkillScout. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}
