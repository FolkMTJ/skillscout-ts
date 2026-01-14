// src/app/api/path-finder/results/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PathFinderModel } from '@/lib/db/models';
import { IT_CAREERS } from '@/data/path-finder';

/**
 * GET /api/path-finder/results
 * ดึงผลลัพธ์ล่าสุดของ user
 */
export async function GET() {
  try {
    // ตรวจสอบ authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ดึงผลลัพธ์ล่าสุด
    const result = await PathFinderModel.findLatestByUserId(session.user.id);

    if (!result) {
      return NextResponse.json(
        { error: 'No test results found' },
        { status: 404 }
      );
    }

    // ดึงข้อมูลอาชีพที่แนะนำ
    const recommendedCareerDetails = result.recommendedCareers
      .map(careerId => IT_CAREERS.find(career => career.id === careerId))
      .filter(Boolean)
      .map(career => ({
        id: career!.id,
        name: career!.name,
        nameTh: career!.nameTh,
        description: career!.description,
        personality: career!.personality,
        riasecCodes: career!.riasecCodes,
        requiredTags: career!.requiredTags,
        recommendedTags: career!.recommendedTags,
      }));

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        recommendedCareerDetails,
      },
    });
  } catch (error) {
    console.error('Error fetching path finder results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
