// src/app/api/admin/holland-careers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import { IT_CAREERS } from '@/data/path-finder/careers';

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
  createdAt: Date;
  updatedAt: Date;
}

async function seedIfEmpty() {
  const collection = await getCollection<HollandCareerDoc>('holland_careers');
  const count = await collection.countDocuments();
  if (count === 0) {
    const now = new Date();
    const docs = IT_CAREERS.map(c => ({
      id: c.id,
      name: c.name,
      nameTh: c.nameTh,
      description: c.description,
      personality: c.personality || '',
      riasecCodes: c.riasecCodes as string[],
      requiredTags: c.requiredTags || [],
      recommendedTags: c.recommendedTags || [],
      averageSalary: c.averageSalary,
      demandLevel: c.demandLevel,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }));
    await collection.insertMany(docs);
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await seedIfEmpty();
    const collection = await getCollection<HollandCareerDoc>('holland_careers');
    const careers = await collection.find({}).sort({ createdAt: 1 }).toArray();
    return NextResponse.json({ careers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json() as Partial<HollandCareerDoc>;
    const { name, nameTh, description, personality, riasecCodes, requiredTags, recommendedTags, averageSalary, demandLevel } = body;

    if (!name || !nameTh || !description || !riasecCodes?.length) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
    }

    const collection = await getCollection<HollandCareerDoc>('holland_careers');
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const now = new Date();

    const doc: HollandCareerDoc = {
      id,
      name,
      nameTh,
      description,
      personality: personality || '',
      riasecCodes,
      requiredTags: requiredTags || [],
      recommendedTags: recommendedTags || [],
      averageSalary,
      demandLevel,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(doc);
    return NextResponse.json({ career: { ...doc, _id: result.insertedId } }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
