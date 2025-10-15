import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserModel } from '@/lib/db/models';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const user = await UserModel.findById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot ban admin user' },
        { status: 403 }
      );
    }

    const newBanStatus = !user.isBanned;
    await UserModel.update(id, { isBanned: newBanStatus });

    return NextResponse.json({
      success: true,
      isBanned: newBanStatus,
      message: newBanStatus ? 'User banned successfully' : 'User unbanned successfully'
    });

  } catch (error) {
    console.error('Error banning user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
