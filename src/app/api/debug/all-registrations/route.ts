import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

/**
 * DEBUG: ดู registrations ทั้งหมดในระบบ (สำหรับ debug เท่านั้น)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const registrationsCollection = db.collection('registrations');

    // ดึงทั้งหมด (limit 50 รายการ)
    const allRegistrations = await registrationsCollection
      .find({})
      .limit(50)
      .toArray();

    console.log('📊 Total registrations in DB:', allRegistrations.length);

    return NextResponse.json({
      total: allRegistrations.length,
      currentUser: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name
      },
      registrations: allRegistrations.map(r => ({
        _id: r._id.toString(),
        userId: r.userId,
        userIdType: typeof r.userId,
        userEmail: r.userEmail,
        userName: r.userName,
        campId: r.campId ? r.campId.toString() : null,
        status: r.status,
        createdAt: r.appliedAt || r.createdAt
      }))
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
