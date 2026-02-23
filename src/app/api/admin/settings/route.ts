// src/app/api/admin/settings/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const col = await getCollection('settings');
    const doc = await col.findOne({ key: 'showcase' });
    return NextResponse.json({
      showcaseMode: doc?.showcaseMode ?? false,
      showcaseName: doc?.showcaseName ?? '',
    });
  } catch {
    return NextResponse.json({ showcaseMode: false, showcaseName: '' });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const col = await getCollection('settings');

    await col.updateOne(
      { key: 'showcase' },
      {
        $set: {
          showcaseMode: Boolean(body.showcaseMode),
          showcaseName: String(body.showcaseName ?? ''),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
