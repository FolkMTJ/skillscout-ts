// src/app/api/auth/send-otp/route.ts
import { NextResponse } from 'next/server';
import { UserModel } from '@/lib/db/models';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'กรุณากรอกอีเมล' },
        { status: 400 }
      );
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบอีเมลนี้ในระบบ กรุณาสมัครสมาชิกก่อน' },
        { status: 404 }
      );
    }

    const otp = await UserModel.createOTP(email);

    const sent = await sendOTPEmail(email, otp);

    if (!sent) {
      return NextResponse.json(
        { error: 'ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว',
      email,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
