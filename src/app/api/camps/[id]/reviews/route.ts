// src/app/api/camps/[id]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CampModel } from '@/lib/db/models/Camp';
import { Review } from '@/types';

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
