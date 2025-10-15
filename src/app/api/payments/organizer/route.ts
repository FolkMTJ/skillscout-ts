import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { PaymentModel } from '@/lib/db/models/Payment';
import { CampModel } from '@/lib/db/models/Camp';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Admin สามารถดูค่ายทั้งหมด
    const camps = await CampModel.findAll();
    const myCamps = session.user.role === 'admin' 
      ? camps 
      : camps.filter(camp => camp.organizerEmail === session.user.email);
    const campIds = myCamps.map(camp => camp._id);

    // ดึง Payments ของค่ายเหล่านั้น
    const payments = await PaymentModel.find({
      campId: { $in: campIds }
    });

    // เพิ่มข้อมูลค่าย
    const paymentsWithDetails = await Promise.all(
      payments.map(async (payment) => {
        const camp = myCamps.find(c => c._id === payment.campId);
        return {
          _id: payment._id,
          registrationId: payment.registrationId,
          userId: payment.userId,
          userEmail: payment.userEmail,
          userName: payment.userName || 'N/A',
          campId: payment.campId,
          campName: camp?.name || 'N/A',
          amount: payment.amount,
          finalAmount: payment.finalAmount,
          status: payment.status,
          slipUrl: payment.slipUrl,
          slipVerified: payment.slipVerified,
          requiresManualReview: payment.requiresManualReview,
          slipUploadedAt: payment.slipUploadedAt,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      payments: paymentsWithDetails
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
