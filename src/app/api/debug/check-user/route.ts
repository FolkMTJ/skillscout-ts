import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * DEBUG: ตรวจสอบข้อมูล user และ registrations ทั้งหมดในระบบ
 */
export async function GET() {
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
    
    // 1. ข้อมูล User
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    // 2. ข้อมูล Registrations ทั้งหมด (ไม่ filter user)
    const registrationsCollection = db.collection('registrations');
    
    const allRegistrations = await registrationsCollection.find({}).toArray();
    const myRegistrations = await registrationsCollection.find({ 
      userId: new ObjectId(userId) 
    }).toArray();

    // ลองหาด้วย email
    const myRegistrationsByEmail = await registrationsCollection.find({ 
      userEmail: session.user.email 
    }).toArray();

    // ลองหาด้วย string userId (case บันทึกเป็น string แทน ObjectId)
    const myRegistrationsByStringId = await registrationsCollection.find({ 
      userId: userId 
    }).toArray();

    // 3. ข้อมูล Payments
    const paymentsCollection = db.collection('payments');
    const myPayments = await paymentsCollection.find({
      userId: userId
    }).toArray();

    return NextResponse.json({
      session: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      },
      user: user ? {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      } : null,
      registrations: {
        totalInSystem: allRegistrations.length,
        myRegistrations: myRegistrations.length,
        myRegistrationsByEmail: myRegistrationsByEmail.length,
        myRegistrationsByStringId: myRegistrationsByStringId.length,
        details: {
          byObjectId: myRegistrations.map(r => ({
            id: r._id.toString(),
            campId: r.campId.toString(),
            userId: r.userId.toString(),
            userIdType: typeof r.userId,
            status: r.status,
            createdAt: r.createdAt
          })),
          byEmail: myRegistrationsByEmail.map(r => ({
            id: r._id.toString(),
            userEmail: r.userEmail,
            status: r.status
          })),
          byStringId: myRegistrationsByStringId.map(r => ({
            id: r._id.toString(),
            userId: r.userId,
            userIdType: typeof r.userId,
            status: r.status
          }))
        }
      },
      payments: {
        total: myPayments.length,
        details: myPayments.map(p => ({
          id: p._id.toString(),
          registrationId: p.registrationId,
          status: p.status,
          amount: p.amount
        }))
      },
      debug: {
        userIdFromSession: userId,
        userIdType: typeof userId,
        userIdAsObjectId: new ObjectId(userId).toString()
      }
    });

  } catch (error) {
    console.error('Error in check-user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
