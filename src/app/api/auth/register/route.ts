// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { UserModel } from '@/lib/db/models';
import { UserRole } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, role, phone, lineId, organization, idCard, address, province, district } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'กรุณากรอกอีเมลและชื่อ' },
        { status: 400 }
      );
    }

    if (role === UserRole.ORGANIZER) {
      if (!organization || !idCard || !phone || !lineId || !address || !province || !district) {
        return NextResponse.json(
          { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
          { status: 400 }
        );
      }
    }

    const user = await UserModel.create({
      email,
      name,
      role: role || UserRole.USER,
      phone,
      lineId,
      organization,
      idCard,
      address,
      province,
      district,
    });

    return NextResponse.json({
      message: 'สมัครสมาชิกสำเร็จ',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
