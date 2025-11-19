// src/app/api/camps/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CampModel } from '@/lib/db/models/Camp';
import { Camp } from '@/types';
import { createCampSchema } from '@/lib/validation/schemas';
import { sanitizeString } from '@/lib/utils/sanitize';
import { rateLimit, getRateLimitKey } from '@/lib/middleware/rateLimit';

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

    // 🔧 FIX BUG 6: กรองค่ายที่หมดเขตและเต็มแล้ว
    if (!includeAll) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      camps = camps.filter((camp: Camp) => {
        // กรอง status ที่ไม่ใช่ active
        if (camp.status !== 'active') {
          return false;
        }

        // กรองค่ายที่หมดเขตรับสมัครแล้ว
        if (camp.registrationDeadline) {
          const deadline = new Date(camp.registrationDeadline);
          deadline.setHours(0, 0, 0, 0);
          if (deadline < today) {
            return false;
          }
        }

        // กรองค่ายที่เต็มแล้ว (enrolled >= capacity)
        const capacity = camp.capacity || camp.participantCount || 0;
        const enrolled = camp.enrolled || 0;
        if (enrolled >= capacity) {
          return false;
        }

        return true;
      });
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
      fee: typeof body.fee === 'string' ? parseInt(body.fee) : body.fee,
      capacity: typeof body.capacity === 'string' ? parseInt(body.capacity) : body.capacity,
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
