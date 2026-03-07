// src/app/api/admin/users/[id]/role/route.ts
// Super Admin only — change user role
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const ALLOWED_ROLES = ['user', 'organizer', 'admin', 'super_admin'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized — Super Admin only' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    let objectId: ObjectId;
    try { objectId = new ObjectId(id); } catch {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const users = await getCollection('users');
    const target = await users.findOne({ _id: objectId });
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Prevent demoting yourself
    if (target.email === session.user.email) {
      return NextResponse.json({ error: 'ไม่สามารถเปลี่ยน Role ของตัวเองได้' }, { status: 400 });
    }

    await users.updateOne({ _id: objectId }, { $set: { role, updatedAt: new Date() } });

    return NextResponse.json({ success: true, newRole: role });
  } catch (error) {
    console.error('Error changing role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
