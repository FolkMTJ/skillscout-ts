// src/app/api/camps/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CampModel } from '@/lib/db/models/Camp';
import { Camp } from '@/types';

// GET /api/camps
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const includeAll = searchParams.get('includeAll');

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

    // ถ้าไม่ได้ขอ includeAll ให้แสดงเฉพาะ active camps
    if (!includeAll) {
      camps = camps.filter((c: Camp) => c.status === 'active');
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

// POST /api/camps
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('=== CREATE CAMP REQUEST ===');
    console.log('Received camp data:', JSON.stringify(body, null, 2));

    if (!body.name || !body.description || !body.location) {
      console.error('Validation failed: Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: name, description, location' },
        { status: 400 }
      );
    }

    const campData = {
      name: body.name,
      category: body.category || 'General',
      date: body.date || '',
      location: body.location,
      price: body.price || '฿0',
      image: body.image || '/api/placeholder/800/600',
      galleryImages: body.galleryImages || [],
      description: body.description,
      deadline: body.deadline || '',
      participantCount: body.participantCount || body.capacity || 0,
      activityFormat: body.activityFormat || 'On-site',
      qualifications: body.qualifications || { level: 'ทุกระดับ' },
      additionalInfo: body.additionalInfo || [],
      organizers: body.organizers || [],
      reviews: [],
      avgRating: 0,
      ratingBreakdown: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
      featured: body.featured || false,
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      organizerId: body.organizerId,
      organizerName: body.organizerName,
      organizerEmail: body.organizerEmail,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : undefined,
      capacity: body.capacity || body.participantCount || 0,
      enrolled: body.enrolled || 0,
      fee: body.fee || 0,
      tags: body.tags || [],
      status: body.status || 'active',
    };

    console.log('Mapped camp data:', JSON.stringify(campData, null, 2));
    console.log('Calling CampModel.create...');

    const camp = await CampModel.create(campData);

    console.log('Camp created successfully:', camp._id);
    console.log('===========================');

    return NextResponse.json(camp, { status: 201 });
  } catch (error) {
    console.error('=== CREATE CAMP ERROR ===');
    console.error('Error creating camp:', error);
    console.error('Error type:', typeof error);
    console.error('Error name:', error instanceof Error ? error.name : 'N/A');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('========================');
    
    return NextResponse.json(
      { 
        error: 'Failed to create camp',
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.name : typeof error
      },
      { status: 500 }
    );
  }
}
