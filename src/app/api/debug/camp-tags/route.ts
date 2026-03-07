import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * DEBUG: เช็คว่าค่ายที่ user สมัครมี tags หรือไม่
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

    // หา registrations ที่ confirmed/approved
    const registrations = await registrationsCollection
      .find({
        $or: [
          { userId: new ObjectId(userId) },
          { userId: userId },
          { userEmail: userEmail }
        ],
        status: { $in: ['confirmed', 'approved'] }
      })
      .toArray();

    console.log('Found', registrations.length, 'confirmed/approved registrations');

    // ดึงข้อมูลค่าย
    const campIds = registrations.map(r => {
      try {
        // ลอง parse เป็น ObjectId
        if (typeof r.campId === 'string') {
          return new ObjectId(r.campId);
        }
        return r.campId;
      } catch {
        console.warn('Invalid campId:', r.campId);
        return null;
      }
    }).filter(id => id !== null);

    console.log('Searching for camps:', campIds.map(id => id?.toString()));

    const camps = await campsCollection
      .find({ _id: { $in: campIds } })
      .toArray();

    console.log('Found camps:', camps.length);
    console.log('Camp names:', camps.map(c => c.name));

    return NextResponse.json({
      user: {
        userId,
        email: userEmail
      },
      registrationCount: registrations.length,
      camps: camps.map(c => ({
        _id: c._id.toString(),
        name: c.name,
        tags: c.tags || [],
        tagsCount: (c.tags || []).length,
        hasTags: !!(c.tags && c.tags.length > 0)
      })),
      summary: {
        totalCamps: camps.length,
        campsWithTags: camps.filter(c => c.tags && c.tags.length > 0).length,
        campsWithoutTags: camps.filter(c => !c.tags || c.tags.length === 0).length
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
