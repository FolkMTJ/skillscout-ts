// src/app/api/camps/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CampModel } from '@/lib/db/models/Camp';

// GET /api/camps - ดึงค่ายทั้งหมด หรือตามเงื่อนไข
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    let camps;

    if (search) {
      camps = await CampModel.search(search);
    } else if (category) {
      camps = await CampModel.findByCategory(category);
    } else if (featured === 'true') {
      camps = await CampModel.getFeatured();
    } else {
      camps = await CampModel.findAll();
    }

    return NextResponse.json(camps);
  } catch (error) {
    console.error('Error fetching camps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch camps' },
      { status: 500 }
    );
  }
}

// POST /api/camps - สร้างค่ายใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'name',
      'category',
      'date',
      'location',
      'price',
      'image',
      'description',
      'deadline',
      'participantCount',
      'activityFormat',
      'qualifications',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Set defaults
    const campData = {
      ...body,
      galleryImages: body.galleryImages || [],
      additionalInfo: body.additionalInfo || [],
      organizers: body.organizers || [],
      reviews: [],
      featured: body.featured || false,
    };

    const camp = await CampModel.create(campData);

    return NextResponse.json(camp, { status: 201 });
  } catch (error) {
    console.error('Error creating camp:', error);
    return NextResponse.json(
      { error: 'Failed to create camp' },
      { status: 500 }
    );
  }
}