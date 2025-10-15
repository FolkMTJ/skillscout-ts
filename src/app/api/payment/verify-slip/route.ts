// src/app/api/payment/verify-slip/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PaymentModel } from '@/lib/db/models'
import { PaymentStatus } from '@/types';
import { verifySlipWithKBank, verifySlipWithSlipOK, verifySlipWithPromptpay, verifySlipWithSlipPocket, verifySlipWithThaiQR, validateSlipData } from '@/lib/slip-verification/slipOk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    console.log('=== AUTO VERIFY SLIP ===');
    console.log('Payment ID:', paymentId);

    // Get payment details
    const payment = await PaymentModel.findById(paymentId);
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (!payment.slipUrl) {
      return NextResponse.json(
        { error: 'No slip uploaded yet' },
        { status: 400 }
      );
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      return NextResponse.json(
        { error: 'Payment is not in completed status' },
        { status: 400 }
      );
    }

    console.log('Verifying slip:', payment.slipUrl);

    // บันทึกว่าได้รับสลิปแล้ว รอ Admin ตรวจสอบ
    await PaymentModel.updateStatus(paymentId, PaymentStatus.COMPLETED, {
      slipVerified: false,
      requiresManualReview: true,
      slipUploadedAt: new Date(),
    });
    
    return NextResponse.json({
      success: true,
      verified: false,
      requiresManualReview: true,
      message: 'อัปโหลดสลิปสำเร็จ! กรุณารอ Admin ตรวจสอบภายใน 24 ชั่วโมง',
      note: 'คุณสามารถตรวจสอบสถานะการชำระเงินได้ที่หน้า My Camps หรือรอรับอีเมลยืนยัน'
    });

  } catch (error) {
    console.error('Error verifying slip:', error);
    return NextResponse.json({
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
    }, { status: 500 });
  }
}
