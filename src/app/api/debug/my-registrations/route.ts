import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
    const userEmail = session.user.email;
    const db = await getDatabase();

    const registrationsCollection = db.collection('registrations');

    // Debug: ค้นหาทั้ง 3 แบบ
    console.log('Searching registrations for:');
    console.log('  - userId as ObjectId:', userId);
    console.log('  - userId as string:', userId);
    console.log('  - userEmail:', userEmail);

    // ค้นหาทั้ง 3 รูปแบบ
    const registrations = await registrationsCollection
      .find({
        $or: [
          { userId: new ObjectId(userId) },      // ObjectId
          { userId: userId },                     // string
          { userEmail: userEmail }                // email
        ]
      })
      .toArray();

    console.log('Found', registrations.length, 'registrations');

    const confirmedCount = registrations.filter(r => r.status === 'confirmed').length;
    const approvedCount = registrations.filter(r => r.status === 'approved').length;
    const pendingCount = registrations.filter(r => r.status === 'pending').length;
    const rejectedCount = registrations.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      userId,
      totalRegistrations: registrations.length,
      confirmedCount,
      approvedCount,
      pendingCount,
      rejectedCount,
      registrations: registrations.map(r => ({
        id: r._id.toString(),
        campId: r.campId.toString(),
        status: r.status,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('Error in debug API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
