// src/app/api/camps/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CampModel } from '@/lib/db/models/Camp';
import { createCampSchema } from '@/lib/validation/schemas';
import { sanitizeString } from '@/lib/utils/sanitize';
import { rateLimit, getRateLimitKey } from '@/lib/middleware/rateLimit';
import { ensureIndexes } from '@/lib/db/ensureIndexes';

// GET /api/camps
// Params: category, featured, search, includeAll, type (urgent|trending), limit
export async function GET(request: NextRequest) {
  await ensureIndexes();

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const includeAll = searchParams.get('includeAll');
    const type = searchParams.get('type'); // 'urgent' | 'trending'
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : undefined;

    let camps;

    if (type === 'urgent') {
      // ค่ายที่ deadline ใกล้ที่สุด กรองใน DB ทันที
      camps = await CampModel.findUrgent(limit ?? 6);
    } else if (type === 'trending') {
      // ค่ายที่ views สูงสุด กรองใน DB ทันที
      camps = await CampModel.findTrending(limit ?? 6);
    } else if (search) {
      camps = await CampModel.search(search, { activeOnly: !includeAll });
    } else if (category) {
      camps = await CampModel.findByCategory(category, { activeOnly: !includeAll });
    } else if (featured === 'true') {
      camps = await CampModel.getFeatured();
    } else {
      camps = await CampModel.findAll({ activeOnly: !includeAll });
    }

    if (limit && type !== 'urgent' && type !== 'trending') {
      camps = camps.slice(0, limit);
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
  // Rate limiting: 3 camps per 5 minutes
  const rateLimitKey = getRateLimitKey(request);
  const { allowed } = rateLimit(rateLimitKey, 3, 300000);
  
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many camp creation requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    console.log('=== CREATE CAMP REQUEST ===');
    console.log('Received camp data:', JSON.stringify(body, null, 2));

    // Validate only critical fields
    const criticalFields = {
      name: body.name,
      description: body.description,
      location: body.location,
      fee: typeof body.fee === 'string' ? (parseInt(body.fee) || 0) : (body.fee || 0),
      capacity: typeof body.capacity === 'string' ? (parseInt(body.capacity) || 1) : (body.capacity || 1),
    };

    // Validate with Zod
    const validation = createCampSchema.safeParse(criticalFields);
    if (!validation.success) {
      console.error('Validation failed:', validation.error.issues);
      return NextResponse.json(
        { error: 'Validation failed', issues: validation.error.issues },
        { status: 400 }
      );
    }

    // Sanitize strings
    const sanitizedData = {
      ...body,
      name: sanitizeString(body.name),
      description: sanitizeString(body.description),
      location: sanitizeString(body.location),
    };

    // Create camp with all data
    const camp = await CampModel.create(sanitizedData);

    console.log('Camp created successfully:', camp._id);
    console.log('===========================');

    return NextResponse.json(
      { success: true, camp },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating camp:', error);
    return NextResponse.json(
      { error: 'Failed to create camp' },
      { status: 500 }
    );
  }
}
