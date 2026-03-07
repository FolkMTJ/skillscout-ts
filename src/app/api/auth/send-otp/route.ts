// src/app/api/auth/send-otp/route.ts
import { NextResponse } from 'next/server';
import { UserModel } from '@/lib/db/models';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'กรุณากรอกอีเมล' },
        { status: 400 }
      );
    }

    const existingUser = await UserModel.findByEmail(email);

    if (name) {
      // Register flow: ถ้ามี user อยู่แล้ว → ห้ามสมัครซ้ำ
      if (existingUser) {
        return NextResponse.json(
          { error: 'อีเมลนี้มีในระบบแล้ว กรุณาเข้าสู่ระบบแทน' },
          { status: 409 }
        );
      }
    } else {
      // Login flow: ต้องมี user ในระบบก่อน
      if (!existingUser) {
        return NextResponse.json(
          { error: 'ไม่พบอีเมลนี้ในระบบ กรุณาสมัครสมาชิกก่อน' },
          { status: 404 }
        );
      }
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