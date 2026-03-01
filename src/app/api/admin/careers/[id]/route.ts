// src/app/api/admin/careers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { HollandCareerModel } from '@/lib/db/models';
import { RIASECCode } from '@/data/riasec';
import { isAdminRole } from '@/lib/auth-check';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/careers/[id]
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminRole(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const career = await HollandCareerModel.findById(id);
    if (!career) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, career });
  } catch (error) {
    console.error('Error fetching career:', error);
    return NextResponse.json({ error: 'Failed to fetch career' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/careers/[id] - แก้ไขอาชีพ
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminRole(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, nameTh, description, personality, riasecCodes, requiredTags, recommendedTags, roadmapSteps, averageSalary, demandLevel, isActive } = body;

    const updated = await HollandCareerModel.update(id, {
      name,
      nameTh,
      description,
      personality,
      riasecCodes: riasecCodes as RIASECCode[],
      requiredTags: requiredTags || [],
      recommendedTags: recommendedTags || [],
      roadmapSteps: roadmapSteps || [],
      averageSalary,
      demandLevel,
      isActive: isActive !== undefined ? isActive : true,
    });

    if (!updated) return NextResponse.json({ error: 'Career not found' }, { status: 404 });
    return NextResponse.json({ success: true, career: updated });
  } catch (error) {
    console.error('Error updating career:', error);
    return NextResponse.json({ error: 'Failed to update career' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/careers/[id]
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminRole(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await HollandCareerModel.delete(id);
    if (!deleted) return NextResponse.json({ error: 'Career not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Career deleted' });
  } catch (error) {
    console.error('Error deleting career:', error);
    return NextResponse.json({ error: 'Failed to delete career' }, { status: 500 });
  }
}
