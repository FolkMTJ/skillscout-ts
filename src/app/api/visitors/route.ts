import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

interface VisitorCountDoc {
  key: string;
  total: number;
  updatedAt: Date;
}

// POST /api/visitors — เพิ่ม +1 ทุกครั้งที่ session ใหม่เข้ามา
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { sessionId?: string };
    if (!body.sessionId) {
      return NextResponse.json({ error: 'No session ID' }, { status: 400 });
    }

    const collection = await getCollection<VisitorCountDoc>('visitor_counts');

    // increment total +1
    const result = await collection.findOneAndUpdate(
      { key: 'total_visitors' },
      {
        $inc: { total: 1 },
        $set: { updatedAt: new Date() },
        $setOnInsert: { key: 'total_visitors' },
      },
      { upsert: true, returnDocument: 'after' }
    );

    const total = result?.total ?? 1;
    return NextResponse.json({ total });
  } catch (error) {
    console.error('Error incrementing visitor:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// GET /api/visitors — ดึงยอดรวม
export async function GET() {
  try {
    const collection = await getCollection<VisitorCountDoc>('visitor_counts');
    const doc = await collection.findOne({ key: 'total_visitors' });
    return NextResponse.json({ total: doc?.total ?? 0 });
  } catch {
    return NextResponse.json({ total: 0 });
  }
}
