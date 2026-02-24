// src/app/api/auth/verify-otp/route.ts
import { NextResponse } from 'next/server';
import { UserModel } from '@/lib/db/models';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'กรุณากรอกอีเมลและรหัส OTP' },
        { status: 400 }
      );
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { error: 'รหัส OTP ต้องมี 6 หลัก' },
        { status: 400 }
      );
    }

    const isValid = await UserModel.verifyOTP(email, otp);

    if (!isValid) {
      return NextResponse.json(
        { error: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ยืนยัน OTP สำเร็จ',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
