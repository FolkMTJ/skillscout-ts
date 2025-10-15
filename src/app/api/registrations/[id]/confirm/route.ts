import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { RegistrationModel } from '@/lib/db/models';
import { RegistrationStatus } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const registration = await RegistrationModel.findById(id);
    
    if (!registration) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลการสมัคร' },
        { status: 404 }
      );
    }

    if (registration.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้' },
        { status: 403 }
      );
    }

    if (registration.status !== RegistrationStatus.APPROVED) {
      return NextResponse.json(
        { error: 'กรุณารอการอนุมัติก่อนยืนยันการเข้าร่วม' },
        { status: 400 }
      );
    }

    const updatedRegistration = await RegistrationModel.updateStatus(
      id,
      RegistrationStatus.CONFIRMED,
      session.user.id,
      'ยืนยันการเข้าร่วมจากผู้ใช้'
    );

    return NextResponse.json({
      success: true,
      message: 'ยืนยันการเข้าร่วมสำเร็จ',
      registration: updatedRegistration
    });
    
  } catch (error) {
    console.error('Error confirming attendance:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการยืนยันการเข้าร่วม' },
      { status: 500 }
    );
  }
}
