// src/app/api/path-finder/results/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PathFinderModel } from '@/lib/db/models';
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
  roadmapSteps: {
    level: 'beginner' | 'intermediate' | 'advanced';
    title: string;
    description: string;
    requiredSkills: string[];
    recommendedCamps?: string[];
    duration?: string;
  }[];
  averageSalary?: string;
  demandLevel?: 'high' | 'medium' | 'low';
  isActive: boolean;
}

/**
 * GET /api/path-finder/results
 * ดึงผลลัพธ์ล่าสุดของ user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await PathFinderModel.findLatestByUserId(session.user.id);

    if (!result) {
      return NextResponse.json({ error: 'No test results found' }, { status: 404 });
    }

    // ดึงอาชีพจาก DB
    const collection = await getCollection<HollandCareerDoc>('holland_careers');
    const allCareers = await collection.find({ isActive: true }).toArray();

    const recommendedCareerDetails = result.recommendedCareers
      .map(careerId => allCareers.find(c => c.id === careerId))
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
        roadmapSteps: career!.roadmapSteps || [],
        averageSalary: career!.averageSalary,
        demandLevel: career!.demandLevel,
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
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
