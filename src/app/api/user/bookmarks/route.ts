// src/app/api/user/bookmarks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';

interface UserDoc {
  email: string;
  bookmarks?: string[];
}

// GET: ดึงรายการ bookmark
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await getCollection<UserDoc>('users');
  const user = await users.findOne({ email: session.user.email });
  return NextResponse.json({ bookmarks: user?.bookmarks || [] });
}

// POST: เพิ่ม / ลบ bookmark (toggle)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { campId } = await req.json() as { campId: string };
  if (!campId) {
    return NextResponse.json({ error: 'campId is required' }, { status: 400 });
  }

  const users = await getCollection<UserDoc>('users');
  const user = await users.findOne({ email: session.user.email });
  const bookmarks: string[] = user?.bookmarks || [];

  const isBookmarked = bookmarks.includes(campId);

  if (isBookmarked) {
    await users.updateOne(
      { email: session.user.email },
      { $pull: { bookmarks: campId } }
    );
    return NextResponse.json({ bookmarked: false });
  } else {
    await users.updateOne(
      { email: session.user.email },
      { $addToSet: { bookmarks: campId } }
    );
    return NextResponse.json({ bookmarked: true });
  }
}
