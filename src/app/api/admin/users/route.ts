import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserModel } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || (session.user.role !== 'admin' && session.user.role !== 'organizer')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin/Organizer only' },
        { status: 403 }
      );
    }

    const users = await UserModel.findAll();

    return NextResponse.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
