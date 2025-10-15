import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { PaymentModel } from '@/lib/db/models/Payment';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campId: string }> }
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

    const { campId } = await params;

    // ดึง Payments ของค่ายนี้
    const payments = await PaymentModel.find({
      campId: campId
    });

    return NextResponse.json({
      success: true,
      payments
    });

  } catch (error) {
    console.error('Error fetching camp payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
