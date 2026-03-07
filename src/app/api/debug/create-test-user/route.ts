import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

/**
 * DEBUG: สร้าง test user พร้อม registrations สำหรับทดสอบ Discovery Path
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    // ต้อง login เป็น admin หรือ organizer
    if (!session || !session.user || session.user.role === 'user') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin or Organizer only' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const registrationsCollection = db.collection('registrations');
    const paymentsCollection = db.collection('payments');
    const campsCollection = db.collection('camps');

    // 1. สร้าง test user (แบบไม่มี password - ใช้สำหรับ manual insert)
    const testUserEmail = 'testuser@skillscout.com';
    
    // เช็คว่ามีอยู่แล้วหรือไม่
    let testUser = await usersCollection.findOne({ email: testUserEmail });
    
    if (!testUser) {
      // สร้าง user โดยไม่มี password (ต้อง set ผ่าน MongoDB หรือ reset password)
      const result = await usersCollection.insertOne({
        email: testUserEmail,
        name: 'Test Student',
        role: 'user',
        createdAt: new Date(),
        // password จะถูก set ทีหลัง
      });
      testUser = await usersCollection.findOne({ _id: result.insertedId });
    }

    const testUserId = testUser!._id;

    // 2. หาค่ายที่ approved (หรือไม่มี status field = approved อยู่แล้ว)
    const approvedCamps = await campsCollection
      .find({
        $or: [
          { status: 'approved' },
          { status: { $exists: false } } // ค่ายเก่าที่ไม่มี status field
        ]
      })
      .limit(3)
      .toArray();

    if (approvedCamps.length === 0) {
      return NextResponse.json({
        error: 'No approved camps found',
        message: 'กรุณาสร้างและอนุมัติค่ายก่อน',
      }, { status: 400 });
    }

    // 3. สร้าง registrations
    const createdRegistrations = [];
    for (const camp of approvedCamps) {
      // เช็คว่ามี registration อยู่แล้วหรือไม่
      const existing = await registrationsCollection.findOne({
        userId: testUserId,
        campId: camp._id
      });

      if (!existing) {
        const regResult = await registrationsCollection.insertOne({
          userId: testUserId,
          campId: camp._id,
          userName: testUser!.name,
          userEmail: testUser!.email,
          status: 'confirmed', // ตั้งเป็น confirmed เลย
          appliedAt: new Date(),
          reviewedAt: new Date(),
          answers: []
        });

        // สร้าง payment ด้วย
        await paymentsCollection.insertOne({
          registrationId: regResult.insertedId.toString(),
          userId: testUserId.toString(),
          amount: camp.price || 0,
          status: 'completed',
          slipVerified: true,
          verifiedAt: new Date(),
          createdAt: new Date()
        });

        createdRegistrations.push({
          registrationId: regResult.insertedId.toString(),
          campName: camp.name,
          status: 'confirmed'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      testUser: {
        email: testUserEmail,
        userId: testUserId.toString(),
        name: testUser!.name,
        note: 'User สร้างสำเร็จ! แต่ยังไม่มี password - ใช้ Google Login หรือ set password ผ่าน MongoDB'
      },
      registrations: {
        created: createdRegistrations.length,
        details: createdRegistrations
      },
      instructions: [
        '1. User ถูกสร้างแล้ว แต่ยังไม่มี password',
        '2. วิธีที่ 1: สร้าง user ใหม่ผ่านหน้า /register แทน',
        '3. วิธีที่ 2: ใช้ existing user account ที่เป็น role=user',
        '4. Login แล้วไป /discovery ดูผลลัพธ์'
      ]
    });

  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
