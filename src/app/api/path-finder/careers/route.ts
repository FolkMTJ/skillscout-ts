// src/app/api/path-finder/careers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

interface RoadmapStepDoc {
  level: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  requiredSkills: string[];
  recommendedCamps?: string[];
  duration?: string;
}

interface HollandCareerDoc {
  id: string;
  name: string;
  nameTh: string;
  description: string;
  personality: string;
  riasecCodes: string[];
  requiredTags: string[];
  recommendedTags: string[];
  roadmapSteps: RoadmapStepDoc[];
  averageSalary?: string;
  demandLevel?: 'high' | 'medium' | 'low';
  isActive: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const careerId = searchParams.get('id');

    const collection = await getCollection<HollandCareerDoc>('holland_careers');
    const careers = await collection
      .find({ isActive: true })
      .sort({ createdAt: 1 })
      .toArray();

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
