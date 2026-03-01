// src/app/api/admin/careers/route.ts
// Admin CRUD สำหรับ Holland Code / IT Careers

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { HollandCareerModel } from '@/lib/db/models';
import { IT_CAREERS } from '@/data/path-finder/careers';
import { isAdminRole } from '@/lib/auth-check';
import { RIASECCode } from '@/data/riasec';

/**
 * GET /api/admin/careers - ดึงรายการอาชีพทั้งหมด (รวม inactive)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminRole(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ดึงจาก DB ก่อน
    const dbCareers = await HollandCareerModel.findAll(true);
    
    // ถ้า DB ยังว่างอยู่ ให้ seed จากไฟล์ static ก่อน
    if (dbCareers.length === 0) {
      await seedCareersFromStatic();
      const seeded = await HollandCareerModel.findAll(true);
      return NextResponse.json({ success: true, careers: seeded, total: seeded.length });
    }

    return NextResponse.json({ success: true, careers: dbCareers, total: dbCareers.length });
  } catch (error) {
    console.error('Error fetching careers:', error);
    return NextResponse.json({ error: 'Failed to fetch careers' }, { status: 500 });
  }
}

/**
 * POST /api/admin/careers - สร้างอาชีพใหม่
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminRole(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, nameTh, description, personality, riasecCodes, requiredTags, recommendedTags, roadmapSteps, averageSalary, demandLevel } = body;

    if (!id || !name || !nameTh || !description || !personality || !riasecCodes?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ตรวจสอบ slug ซ้ำ
    const existing = await HollandCareerModel.findBySlug(id);
    if (existing) {
      return NextResponse.json({ error: 'Career ID already exists' }, { status: 409 });
    }

    const career = await HollandCareerModel.create({
      id,
      name,
      nameTh,
      description,
      personality,
      riasecCodes: riasecCodes as RIASECCode[],
      requiredTags: requiredTags || [],
      recommendedTags: recommendedTags || [],
      roadmapSteps: roadmapSteps || [],
      averageSalary,
      demandLevel: demandLevel || 'medium',
      isActive: true,
      createdBy: session.user.id,
    });

    return NextResponse.json({ success: true, career }, { status: 201 });
  } catch (error) {
    console.error('Error creating career:', error);
    return NextResponse.json({ error: 'Failed to create career' }, { status: 500 });
  }
}

/**
 * Seed careers จากไฟล์ static ลง MongoDB
 */
async function seedCareersFromStatic() {
  for (const career of IT_CAREERS) {
    await HollandCareerModel.create({
      id: career.id,
      name: career.name,
      nameTh: career.nameTh,
      description: career.description,
      personality: career.personality,
      riasecCodes: career.riasecCodes,
      requiredTags: career.requiredTags,
      recommendedTags: career.recommendedTags,
      roadmapSteps: career.roadmapSteps,
      averageSalary: career.averageSalary,
      demandLevel: career.demandLevel || 'medium',
      isActive: true,
    });
  }
}
