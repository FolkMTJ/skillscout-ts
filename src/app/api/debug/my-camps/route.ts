import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * DEBUG: ดูว่า registrations ของ user ชี้ไปที่ค่ายไหนบ้าง
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

    const userId = session.user.id;
    const userEmail = session.user.email;
    const db = await getDatabase();
    
    const registrationsCollection = db.collection('registrations');
    const campsCollection = db.collection('camps');

    // หา registrations ทั้งหมด (ไม่กรอง status)
    const allRegistrations = await registrationsCollection
      .find({
        $or: [
          { userId: new ObjectId(userId) },
          { userId: userId },
          { userEmail: userEmail }
        ]
      })
      .toArray();

    console.log('📊 Total registrations:', allRegistrations.length);

    // ดึงข้อมูลค่ายทั้งหมด
    const campIds = allRegistrations.map(r => {
      try {
        if (typeof r.campId === 'string') {
          return new ObjectId(r.campId);
        }
        return r.campId;
      } catch (e) {
        return null;
      }
    }).filter(id => id !== null);

    const camps = await campsCollection
      .find({ _id: { $in: campIds } })
      .toArray();

    // สร้าง map ของ camp
    const campMap = new Map(camps.map(c => [c._id.toString(), c]));

    // แสดงผล registrations พร้อมชื่อค่าย
    const registrationsWithCampNames = allRegistrations.map(r => {
      const campIdStr = typeof r.campId === 'string' ? r.campId : r.campId.toString();
      const camp = campMap.get(campIdStr);
      
      return {
        registrationId: r._id.toString(),
        campId: campIdStr,
        campName: camp ? camp.name : '❌ ไม่พบค่าย',
        campTags: camp ? camp.tags || [] : [],
        status: r.status,
        createdAt: r.appliedAt || r.createdAt,
        isConfirmed: r.status === 'confirmed' || r.status === 'approved'
      };
    });

    return NextResponse.json({
      user: {
        userId,
        email: userEmail
      },
      totalRegistrations: allRegistrations.length,
      confirmedRegistrations: registrationsWithCampNames.filter(r => r.isConfirmed).length,
      registrations: registrationsWithCampNames,
      summary: {
        byStatus: {
          pending: registrationsWithCampNames.filter(r => r.status === 'pending').length,
          confirmed: registrationsWithCampNames.filter(r => r.status === 'confirmed').length,
          approved: registrationsWithCampNames.filter(r => r.status === 'approved').length,
          attended: registrationsWithCampNames.filter(r => r.status === 'attended').length
        },
        campsFound: camps.length,
        campsNotFound: allRegistrations.length - camps.length
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
