// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const reviewSchema = z.object({
  campId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = reviewSchema.parse(body);
    
    const { db } = await connectToDatabase();

    // ตรวจสอบว่า User ได้เข้าร่วมค่ายและเช็คอินแล้วหรือยัง
    const registration = await db.collection('registrations').findOne({
      campId: new ObjectId(validatedData.campId),
      userEmail: session.user.email,
      status: 'attended' // ต้องเป็นสถานะ attended (เช็คอินแล้ว)
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'คุณต้องเข้าร่วมค่ายและเช็คอินแล้วถึงจะสามารถเขียนรีวิวได้' },
        { status: 403 }
      );
    }

    // ตรวจสอบว่าเคยรีวิวแล้วหรือยัง
    const camp = await db.collection('camps').findOne({
      _id: new ObjectId(validatedData.campId)
    });

    if (!camp) {
      return NextResponse.json(
        { error: 'Camp not found' },
        { status: 404 }
      );
    }

    const existingReview = camp.reviews?.find(
      (review: { author: string }) => review.author === registration.userName
    );

    if (existingReview) {
      return NextResponse.json(
        { error: 'คุณได้เขียนรีวิวค่ายนี้แล้ว' },
        { status: 400 }
      );
    }

    // สร้างรีวิวใหม่
    const newReview = {
      id: new ObjectId().toString(),
      author: registration.userName,
      authorEmail: session.user.email,
      rating: validatedData.rating,
      comment: validatedData.comment,
      date: new Date().toISOString(),
    };

    // อัปเดตค่าย
    const currentReviews = camp.reviews || [];
    const updatedReviews = [...currentReviews, newReview];
    
    // คำนวณคะแนนเฉลี่ย
    const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / updatedReviews.length;

    // คำนวณ rating breakdown
    const ratingBreakdown: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    updatedReviews.forEach(review => {
      ratingBreakdown[review.rating.toString()] += 1;
    });

    await db.collection('camps').updateOne(
      { _id: new ObjectId(validatedData.campId) },
      {
        $set: {
          reviews: updatedReviews,
          avgRating,
          ratingBreakdown,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      review: newReview,
      avgRating,
      totalReviews: updatedReviews.length,
    });

  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ตรวจสอบว่า User สามารถเขียนรีวิวได้หรือไม่
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { canReview: false, reason: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const campId = searchParams.get('campId');

    if (!campId) {
      return NextResponse.json(
        { error: 'Camp ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // ตรวจสอบว่า User ได้เข้าร่วมและเช็คอินแล้วหรือยัง
    const registration = await db.collection('registrations').findOne({
      campId: new ObjectId(campId),
      userEmail: session.user.email,
      status: 'attended'
    });

    if (!registration) {
      return NextResponse.json({
        canReview: false,
        reason: 'คุณต้องเข้าร่วมค่ายและเช็คอินแล้วถึงจะสามารถเขียนรีวิวได้',
      });
    }

    // ตรวจสอบว่าเคยรีวิวแล้วหรือยัง
    const camp = await db.collection('camps').findOne({
      _id: new ObjectId(campId)
    });

    if (!camp) {
      return NextResponse.json(
        { error: 'Camp not found' },
        { status: 404 }
      );
    }

    const hasReviewed = camp.reviews?.some(
      (review: { authorEmail?: string; author: string }) => 
        review.authorEmail === session.user.email || review.author === registration.userName
    );

    if (hasReviewed) {
      return NextResponse.json({
        canReview: false,
        reason: 'คุณได้เขียนรีวิวค่ายนี้แล้ว',
      });
    }

    return NextResponse.json({
      canReview: true,
      userName: registration.userName,
    });

  } catch (error) {
    console.error('Error checking review permission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
