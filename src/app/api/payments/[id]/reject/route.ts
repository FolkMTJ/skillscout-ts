// src/app/api/payments/[id]/reject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { PaymentModel } from '@/lib/db/models/Payment';
import { RegistrationModel } from '@/lib/db/models';

// 🔧 FIX BUG 3: เมื่อ Organizer ปฏิเสธ ต้องลบข้อมูลทั้งหมดออกจากระบบ
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

    // ลบ Payment
    await PaymentModel.delete(id);

    // ลบ Registration ด้วย
    await RegistrationModel.delete(payment.registrationId);

    return NextResponse.json({
      success: true,
      message: 'Payment and registration deleted successfully',
      rejectionReason: reason
    });

  } catch (error) {
    console.error('Error rejecting payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
