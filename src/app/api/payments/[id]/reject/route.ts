import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { PaymentModel } from '@/lib/db/models/Payment';
import { PaymentStatus, RegistrationStatus } from '@/types';
import { RegistrationModel } from '@/lib/db/models';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    await connectDB();

    const { id } = await params;
    const payment = await PaymentModel.findById(id);
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // ปฏิเสธสลิป
    await PaymentModel.updateStatus(id, PaymentStatus.CANCELLED, {
      slipVerified: false,
      rejectedAt: new Date(),
      rejectedBy: session.user.email,
      rejectionReason: reason,
    });

    // อัปเดต Registration status เป็น rejected
    await RegistrationModel.updateStatus(
      payment.registrationId,
      RegistrationStatus.REJECTED,
      session.user.id || session.user.email,
      `สลิปไม่ถูกต้อง: ${reason}`
    );

    return NextResponse.json({
      success: true,
      message: 'Payment rejected successfully'
    });

  } catch (error) {
    console.error('Error rejecting payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
