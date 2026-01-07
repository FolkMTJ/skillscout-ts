// src/app/api/path-finder/recommended-camps/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CampModel, PathFinderModel } from '@/lib/db/models';
import { IT_CAREERS } from '@/data/path-finder';
import { Camp } from '@/types';

/**
 * GET /api/path-finder/recommended-camps
 * แนะนำค่ายตามผลลัพธ์การทำแบบทดสอบและอาชีพที่เลือก
 */
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const careerId = searchParams.get('careerId');
    const level = searchParams.get('level') as 'beginner' | 'intermediate' | 'advanced' | null;

    // ดึงผลลัพธ์การทดสอบล่าสุด
    const testResult = await PathFinderModel.findLatestByUserId(session.user.id);
    
    if (!testResult && !careerId) {
      return NextResponse.json(
        { error: 'Please complete the Path Finder test first or select a career' },
        { status: 400 }
      );
    }

    let recommendedTags: string[] = [];

    // ถ้าระบุอาชีพมา ใช้ tags จากอาชีพนั้น
    if (careerId) {
      const career = IT_CAREERS.find(c => c.id === careerId);
      if (!career) {
        return NextResponse.json(
          { error: 'Career not found' },
          { status: 404 }
        );
      }

      // ถ้าระบุ level ด้วย ให้ดึง tags จาก roadmap step นั้น
      if (level) {
        const step = career.roadmapSteps.find(s => s.level === level);
        if (step && step.recommendedCamps) {
          recommendedTags = step.recommendedCamps;
        } else {
          recommendedTags = [...career.requiredTags, ...career.recommendedTags];
        }
      } else {
        // ไม่ระบุ level ให้ใช้ tags ทั้งหมดของอาชีพ
        recommendedTags = [...career.requiredTags, ...career.recommendedTags];
      }
    } 
    // ถ้าไม่ระบุอาชีพ ใช้จากผลทดสอบ
    else if (testResult) {
      const careers = testResult.recommendedCareers
        .map(id => IT_CAREERS.find(c => c.id === id))
        .filter(Boolean);

      // รวม tags จากทุกอาชีพที่แนะนำ
      careers.forEach(career => {
        if (career) {
          recommendedTags.push(...career.requiredTags, ...career.recommendedTags);
        }
      });
    }

    // ลบ tags ซ้ำ
    recommendedTags = [...new Set(recommendedTags)];

    // ดึงค่ายทั้งหมดที่ active
    const allCamps = await CampModel.findAll();
    const activeCamps = allCamps.filter(camp => 
      camp.status === 'active' && 
      camp.tags && 
      camp.tags.length > 0
    );

    // กรองและให้คะแนนค่ายตาม tags
    const scoredCamps = activeCamps.map(camp => {
      const matchingTags = camp.tags!.filter(tag => 
        recommendedTags.includes(tag)
      );
      
      return {
        camp,
        score: matchingTags.length,
        matchingTags,
      };
    }).filter(item => item.score > 0);

    // เรียงตามคะแนนจากมากไปน้อย
    scoredCamps.sort((a, b) => b.score - a.score);

    // จำกัดจำนวนค่ายที่แนะนำ (เช่น 12 ค่าย)
    const recommendedCamps = scoredCamps.slice(0, 12);

    return NextResponse.json({
      success: true,
      recommendedCamps: recommendedCamps.map(item => ({
        ...item.camp,
        matchScore: item.score,
        matchingTags: item.matchingTags,
      })),
      totalMatches: scoredCamps.length,
    });
  } catch (error) {
    console.error('Error fetching recommended camps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommended camps' },
      { status: 500 }
    );
  }
}
