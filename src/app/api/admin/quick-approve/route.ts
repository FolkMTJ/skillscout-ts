import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { registrationId, action } = await req.json();

    if (!registrationId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const registrationsCollection = db.collection('registrations');
    const usersCollection = db.collection('users');

    // ตรวจสอบว่าเป็น admin หรือ organizer
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(session.user.id) 
    });

    if (!user || (user.role !== 'admin' && user.role !== 'organizer')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Organizer only' },
        { status: 403 }
      );
    }

    // Update registration status
    const newStatus = action === 'approve' ? 'confirmed' : 'rejected';
    
    const result = await registrationsCollection.updateOne(
      { _id: new ObjectId(registrationId) },
      { 
        $set: { 
          status: newStatus,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Registration ${action}d successfully`,
      newStatus
    });

  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
