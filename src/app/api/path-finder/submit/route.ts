// src/app/api/path-finder/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PathFinderModel } from '@/lib/db/models';
import { PathFinderAnswer } from '@/types';
import { IT_CAREERS } from '@/data/path-finder';

/**
 * POST /api/path-finder/submit
 * บันทึกคำตอบและคำนวณผลลัพธ์
 */
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { answers } = body as { answers: PathFinderAnswer[] };

    // Validation
    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามีคำตอบครบ 18 ข้อ
    if (answers.length !== 18) {
      return NextResponse.json(
        { error: 'All 18 questions must be answered' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าคะแนนอยู่ในช่วง 1-5
    const invalidAnswers = answers.filter(
      answer => answer.rating < 1 || answer.rating > 5
    );
    if (invalidAnswers.length > 0) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // บันทึกผลลัพธ์
    const result = await PathFinderModel.create({
      userId: session.user.id,
      userEmail: session.user.email,
      answers,
    });

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
    console.error('Error submitting path finder:', error);
    return NextResponse.json(
      { error: 'Failed to submit path finder test' },
      { status: 500 }
    );
  }
}
