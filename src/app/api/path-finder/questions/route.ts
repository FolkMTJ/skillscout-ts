// src/app/api/path-finder/questions/route.ts
import { NextResponse } from 'next/server';
import { PATH_FINDER_QUESTIONS } from '@/data/path-finder';

/**
 * GET /api/path-finder/questions
 * ดึงคำถามทั้งหมดสำหรับแบบทดสอบ
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      questions: PATH_FINDER_QUESTIONS,
      total: PATH_FINDER_QUESTIONS.length,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
