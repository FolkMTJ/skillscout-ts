// src/app/api/path-finder/careers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { IT_CAREERS } from '@/data/path-finder';
import { getCollection } from '@/lib/mongodb';

interface HollandCareerDoc {
  id: string;
  name: string;
  nameTh: string;
  description: string;
  personality: string;
  riasecCodes: string[];
  requiredTags: string[];
  recommendedTags: string[];
  averageSalary?: string;
  demandLevel?: 'high' | 'medium' | 'low';
  isActive: boolean;
}

async function getCareersFromDB() {
  try {
    const collection = await getCollection<HollandCareerDoc>('holland_careers');
    const count = await collection.countDocuments();
    if (count === 0) return null; // ยังไม่มีข้อมูล -> ใช้ static
    const careers = await collection.find({ isActive: true }).sort({ createdAt: 1 }).toArray();
    return careers;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const careerId = searchParams.get('id');

    // ดึงจาก DB ก่อน fallback ไป static
    const dbCareers = await getCareersFromDB();
    const careers = dbCareers ?? IT_CAREERS;

    if (careerId) {
      const career = careers.find(c => c.id === careerId);
      if (!career) {
        return NextResponse.json({ error: 'Career not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, career });
    }

    return NextResponse.json({ success: true, careers });
  } catch (error) {
    console.error('Error fetching careers:', error);
    return NextResponse.json({ error: 'Failed to fetch careers' }, { status: 500 });
  }
}
