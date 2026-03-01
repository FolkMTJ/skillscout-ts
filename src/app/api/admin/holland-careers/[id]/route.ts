// src/app/api/admin/holland-careers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { isAdminRole } from '@/lib/auth-check';

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
  updatedAt: Date;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminRole(session.user?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json() as Partial<HollandCareerDoc>;

    const collection = await getCollection<HollandCareerDoc>('holland_careers');
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...body, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminRole(session.user?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const collection = await getCollection<HollandCareerDoc>('holland_careers');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
