// src/app/api/payment/verify-slip/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PaymentModel, PaymentStatus } from '@/lib/db/models/Payment';
import { verifySlipWithSlipOK, validateSlipData } from '@/lib/slip-verification/slipOk';

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

    // Verify slip using SlipOK API
    const slipVerification = await verifySlipWithSlipOK(payment.slipUrl);

    console.log('Verification result:', slipVerification);

    if (!slipVerification.success) {
      return NextResponse.json({
        success: false,
        verified: false,
        error: slipVerification.error || 'Unable to verify slip',
        message: 'ไม่สามารถตรวจสอบสลิปอัตโนมัติได้ กรุณารอ Admin ตรวจสอบ'
      });
    }

    // Validate slip data
    const validation = validateSlipData(
      slipVerification,
      payment.finalAmount,
      '0813259525' // Expected receiver phone number
    );

    console.log('Validation result:', validation);

    if (validation.isValid) {
      // Auto-approve payment
      await PaymentModel.updateStatus(paymentId, PaymentStatus.COMPLETED, {
        slipVerified: true,
        verifiedAt: new Date(),
        verificationData: {
          amount: slipVerification.amount,
          date: slipVerification.date,
          transRef: slipVerification.transRef,
          autoVerified: true,
        }
      });

      console.log('✓ Payment auto-approved');

      return NextResponse.json({
        success: true,
        verified: true,
        autoApproved: true,
        message: 'ตรวจสอบสลิปสำเร็จ! การชำระเงินได้รับการยืนยันแล้ว',
        slipData: slipVerification
      });
    } else {
      // Mark for manual review
      await PaymentModel.updateStatus(paymentId, PaymentStatus.COMPLETED, {
        slipVerified: false,
        requiresManualReview: true,
        verificationIssues: validation.reasons,
        verificationData: {
          amount: slipVerification.amount,
          date: slipVerification.date,
          transRef: slipVerification.transRef,
          autoVerified: false,
        }
      });

      console.log('⚠ Requires manual review:', validation.reasons);

      return NextResponse.json({
        success: true,
        verified: false,
        requiresManualReview: true,
        reasons: validation.reasons,
        message: 'พบข้อผิดพลาดในการตรวจสอบ กรุณารอ Admin ตรวจสอบภายใน 24 ชั่วโมง',
        slipData: slipVerification
      });
    }

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
