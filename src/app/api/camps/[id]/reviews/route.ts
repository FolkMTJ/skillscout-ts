// src/app/api/camps/[id]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CampModel } from '@/lib/db/models/Camp';
import { RegistrationModel } from '@/lib/db/models/Registration';
import { RegistrationStatus, Review } from '@/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/camps/[id]/reviews
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // ต้อง login ก่อน
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อนเขียนรีวิว' },
        { status: 401 }
      );
    }

    // ต้องมี registration status = attended หรือ completed เท่านั้น
    const registrations = await RegistrationModel.findByUser(session.user.email);
    const attended = registrations.find(
      r => r.campId === id && (r.status === ('attended' as any) || r.status === ('completed' as any))
    );
    if (!attended) {
      return NextResponse.json(
        { error: 'ต้องเข้าร่วมค่าย (สแกนบัตรเข้างาน) หรือจบค่าย ก่อนจึงจะเขียนรีวิวได้' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.author || !body.rating || !body.comment) {
      return NextResponse.json(
        { error: 'Missing required fields: author, rating, comment' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const review: Review = {
      id: Date.now().toString(),
      author: body.author,
      rating: body.rating,
      comment: body.comment,
      date: new Date().toISOString(),
    };

    const success = await CampModel.addReview(id, review);

    if (!success) {
      return NextResponse.json(
        { error: 'Camp not found' },
        { status: 404 }
      );
    }

    const updatedCamp = await CampModel.findById(id);
    return NextResponse.json(updatedCamp, { status: 201 });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json(
      { error: 'Failed to add review' },
      { status: 500 }
    );
  }
}
