// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

// GET /api/users - Get all users (Admin only)
export async function GET() {
  try {
    const users = await getCollection('users');
    const allUsers = await users.find({}).sort({ createdAt: -1 }).toArray();

    // Convert _id to string
    const formattedUsers = allUsers.map(user => ({
      ...user,
      _id: user._id.toString(),
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
