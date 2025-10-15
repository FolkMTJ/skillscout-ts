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

    await connectDB();

    const { id } = await params;
    const payment = await PaymentModel.findById(id);
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // อนุมัติสลิป
    await PaymentModel.updateStatus(id, PaymentStatus.COMPLETED, {
      slipVerified: true,
      verifiedAt: new Date(),
      verifiedBy: session.user.email,
    });

    // อัปเดต Registration status เป็น approved
    await RegistrationModel.updateStatus(
      payment.registrationId,
      RegistrationStatus.APPROVED,
      session.user.id || session.user.email,
      'อนุมัติการชำระเงิน'
    );

    return NextResponse.json({
      success: true,
      message: 'Payment approved successfully'
    });

  } catch (error) {
    console.error('Error approving payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
