// src/app/api/visitors/route.ts
// Track unique visitors per device per hour (no auth required)
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

interface VisitorDoc {
  deviceId: string;
  lastSeen: Date;
  hourKey: string; // "2025-01-01T14" - unique per hour
}

interface VisitorCountDoc {
  key: string; // 'current_visitors'
  count: number;
  updatedAt: Date;
}

function getHourKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}`;
}

/**
 * POST /api/visitors - รายงาน visit ของ device นี้ (ทำทุกครั้งที่ load หน้าเว็บ)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { deviceId?: string };
    const deviceId = body.deviceId || request.headers.get('x-device-id') || '';

    if (!deviceId) {
      return NextResponse.json({ error: 'No device ID' }, { status: 400 });
    }

    const hourKey = getHourKey();
    const collection = await getCollection<VisitorDoc>('visitors');

    // Upsert visitor record สำหรับ device นี้ในชั่วโมงนี้
    await collection.updateOne(
      { deviceId, hourKey },
      { $set: { deviceId, hourKey, lastSeen: new Date() } },
      { upsert: true }
    );

    // นับ unique devices ในชั่วโมงปัจจุบัน
    const count = await collection.countDocuments({ hourKey });

    // ลบ visitor records เก่ากว่า 3 ชั่วโมง (cleanup)
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    await collection.deleteMany({ lastSeen: { $lt: threeHoursAgo } });

    // Cache count
    const countCollection = await getCollection<VisitorCountDoc>('visitor_counts');
    await countCollection.updateOne(
      { key: 'current_visitors' },
      { $set: { key: 'current_visitors', count, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

/**
 * GET /api/visitors - ดึงจำนวน visitors ปัจจุบัน
 */
export async function GET() {
  try {
    const hourKey = getHourKey();
    const collection = await getCollection<VisitorDoc>('visitors');
    const count = await collection.countDocuments({ hourKey });

    return NextResponse.json({ count, hourKey });
  } catch (error) {
    console.error('Error getting visitor count:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
