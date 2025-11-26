import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * DEBUG ENDPOINT: อนุมัติ registrations ทั้งหมดที่ pending
 * ใช้สำหรับ testing เท่านั้น!
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const db = await getDatabase();
    
    // ดึง registrations ที่ pending ของ user นี้
    const registrationsCollection = db.collection('registrations');
    const paymentsCollection = db.collection('payments');

    const pendingRegistrations = await registrationsCollection
      .find({
        userId: new ObjectId(userId),
        status: 'pending'
      })
      .toArray();

    console.log('🔧 Found', pendingRegistrations.length, 'pending registrations for user:', userId);

    let approvedCount = 0;
    const errors = [];

    for (const reg of pendingRegistrations) {
      try {
        // 1. อัปเดต registration เป็น confirmed
        await registrationsCollection.updateOne(
          { _id: reg._id },
          { 
            $set: { 
              status: 'confirmed',
              updatedAt: new Date()
            } 
          }
        );

        // 2. ถ้ามี payment ให้อัปเดตด้วย
        await paymentsCollection.updateOne(
          { registrationId: reg._id.toString() },
          { 
            $set: { 
              status: 'completed',
              slipVerified: true,
              verifiedAt: new Date(),
              verifiedBy: 'DEBUG_AUTO_APPROVE'
            } 
          }
        );

        approvedCount++;
        console.log('✅ Approved registration:', reg._id.toString());
      } catch (error) {
        console.error('❌ Error approving registration:', reg._id.toString(), error);
        errors.push({ registrationId: reg._id.toString(), error: String(error) });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Approved ${approvedCount} registrations`,
      approvedCount,
      totalPending: pendingRegistrations.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in approve-all:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
