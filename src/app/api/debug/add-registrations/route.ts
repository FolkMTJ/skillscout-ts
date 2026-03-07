import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * DEBUG: เพิ่ม confirmed registrations ให้กับ user ปัจจุบัน
 * ใช้สำหรับทดสอบ Discovery Path โดยไม่ต้องสร้าง user ใหม่
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
    
    const registrationsCollection = db.collection('registrations');
    const paymentsCollection = db.collection('payments');
    const campsCollection = db.collection('camps');

    // 1. หาค่ายที่ approved (หรือไม่มี status field = approved อยู่แล้ว)
    const approvedCamps = await campsCollection
      .find({
        $or: [
          { status: 'approved' },
          { status: { $exists: false } } // ค่ายเก่าที่ไม่มี status field
        ]
      })
      .limit(3)
      .toArray();

    console.log('🔍 Found camps:', approvedCamps.length, 'camps');
    console.log('Camp IDs:', approvedCamps.map(c => c._id.toString()));

    if (approvedCamps.length === 0) {
      return NextResponse.json({
        error: 'No approved camps found',
        message: 'กรุณาสร้างและอนุมัติค่ายก่อน',
      }, { status: 400 });
    }

    // 2. สร้าง registrations
    const createdRegistrations = [];
    for (const camp of approvedCamps) {
      // เช็คว่ามี registration อยู่แล้วหรือไม่
      const existing = await registrationsCollection.findOne({
        userId: new ObjectId(userId),
        campId: camp._id
      });

      if (!existing) {
        const regResult = await registrationsCollection.insertOne({
          userId: new ObjectId(userId),
          campId: camp._id,
          userName: session.user.name,
          userEmail: session.user.email,
          status: 'confirmed', // ตั้งเป็น confirmed เลย
          appliedAt: new Date(),
          reviewedAt: new Date(),
          answers: []
        });

        // สร้าง payment ด้วย
        await paymentsCollection.insertOne({
          registrationId: regResult.insertedId.toString(),
          userId: userId,
          amount: camp.price || 0,
          status: 'completed',
          slipVerified: true,
          verifiedAt: new Date(),
          createdAt: new Date()
        });

        createdRegistrations.push({
          registrationId: regResult.insertedId.toString(),
          campName: camp.name,
          campId: camp._id.toString(),
          status: 'confirmed'
        });
      } else {
        // ถ้ามีอยู่แล้วแต่ status ไม่ใช่ confirmed ให้อัปเดต
        if (existing.status !== 'confirmed') {
          await registrationsCollection.updateOne(
            { _id: existing._id },
            { 
              $set: { 
                status: 'confirmed',
                reviewedAt: new Date()
              } 
            }
          );

          // อัปเดต payment ด้วย
          await paymentsCollection.updateOne(
            { registrationId: existing._id.toString() },
            { 
              $set: { 
                status: 'completed',
                slipVerified: true,
                verifiedAt: new Date()
              } 
            }
          );

          createdRegistrations.push({
            registrationId: existing._id.toString(),
            campName: camp.name,
            campId: camp._id.toString(),
            status: 'confirmed (updated)'
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added/Updated ${createdRegistrations.length} registrations`,
      currentUser: {
        userId: userId,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      },
      registrations: {
        created: createdRegistrations.length,
        details: createdRegistrations
      },
      nextSteps: [
        '1. Go to /discovery to see your Discovery Path',
        '2. Check /debug-registrations to verify registrations'
      ]
    });

  } catch (error) {
    console.error('Error in add-registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
