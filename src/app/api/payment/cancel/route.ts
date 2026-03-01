// src/app/api/payment/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PaymentModel, RegistrationModel } from '@/lib/db/models';
import { PaymentStatus, RegistrationStatus } from '@/types';

// POST /api/payment/cancel — ยกเลิก payment + registration ที่หมดเวลาชำระ
export async function POST(request: NextRequest) {
  try {
    const { paymentId, registrationId } = await request.json();

    if (!paymentId || !registrationId) {
      return NextResponse.json(
        { success: false, error: 'paymentId and registrationId are required' },
        { status: 400 }
      );
    }

    // Cancel payment
    await PaymentModel.updateStatus(paymentId, PaymentStatus.CANCELLED, {
      rejectedAt: new Date(),
      rejectedBy: 'system-timeout',
      rejectionReason: 'หมดเวลาชำระเงิน (20 นาที)',
    });

    // Cancel registration — checkDuplicate จะข้ามสถานะ cancelled ทำให้ user register ใหม่ได้
    await RegistrationModel.updateStatus(
      registrationId,
      RegistrationStatus.CANCELLED,
      'system-timeout',
      'หมดเวลาชำระเงิน (20 นาที)'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling payment:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
