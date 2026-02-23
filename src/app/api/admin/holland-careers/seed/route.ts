// src/app/api/admin/holland-careers/seed/route.ts
// ใช้ reseed ข้อมูล holland_careers จาก IT_CAREERS ใหม่ทั้งหมด (Admin only)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import { IT_CAREERS } from '@/data/path-finder/careers';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const collection = await getCollection('holland_careers');

    // ลบข้อมูลเก่าทั้งหมด
    await collection.deleteMany({});

    // seed ใหม่จาก careers.ts
    const now = new Date();
    const docs = IT_CAREERS.map(c => ({
      id: c.id,
      name: c.name,
      nameTh: c.nameTh,
      description: c.description,
      personality: c.personality || '',
      riasecCodes: c.riasecCodes as string[],
      requiredTags: c.requiredTags || [],
      recommendedTags: c.recommendedTags || [],
      roadmapSteps: c.roadmapSteps || [],
      averageSalary: c.averageSalary,
      demandLevel: c.demandLevel,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }));

    await collection.insertMany(docs);

    return NextResponse.json({
      success: true,
      message: `Seeded ${docs.length} careers successfully`,
      count: docs.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
