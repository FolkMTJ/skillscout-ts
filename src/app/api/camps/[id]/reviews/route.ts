// src/app/api/camps/[id]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CampModel } from '@/lib/db/models/Camp';
import { RegistrationModel } from '@/lib/db/models/Registration';
import { Review } from '@/types';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** คำนวณ avgRating และ ratingBreakdown จาก reviews array */
function recalcStats(reviews: Review[]) {
  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;
  const ratingBreakdown: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  for (const r of reviews) {
    const key = String(Math.round(r.rating));
    if (key in ratingBreakdown) ratingBreakdown[key]++;
  }
  return { avgRating, ratingBreakdown };
}


// ─── POST /api/camps/[id]/reviews ────────────────────────────────────────────
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนเขียนรีวิว' }, { status: 401 });
    }

    // ต้องมี status = attended หรือ completed
    const registrations = await RegistrationModel.findByUser(session.user.email);
    const attended = registrations.find(
      r => r.campId === id && (r.status === ('attended' as never) || r.status === ('completed' as never))
    );
    if (!attended) {
      return NextResponse.json(
        { error: 'ต้องเข้าร่วมค่าย (สแกนบัตรเข้างาน) หรือจบค่าย ก่อนจึงจะเขียนรีวิวได้' },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.author || !body.rating || !body.comment) {
      return NextResponse.json({ error: 'Missing required fields: author, rating, comment' }, { status: 400 });
    }
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // ── 1 review ต่อ 1 คน ─────────────────────────────────────────────────
    const db = await getDatabase();
    const campsCol = db.collection('camps');
    const camp = await campsCol.findOne({ _id: new ObjectId(id) });
    if (!camp) return NextResponse.json({ error: 'Camp not found' }, { status: 404 });

    const existingReviews: Review[] = camp.reviews || [];
    const userEmail = session.user.email;
    // ตรวจสอบ 1 review/user โดยใช้ authorEmail ก่อน fallback เป็น author
    const alreadyReviewed = existingReviews.some(
      r => r.authorEmail === userEmail || r.author === userEmail
    );
    if (alreadyReviewed) {
      return NextResponse.json({ error: 'คุณเขียนรีวิวค่ายนี้ไปแล้ว สามารถแก้ไขรีวิวเดิมได้' }, { status: 409 });
    }

    const review: Review = {
      id: Date.now().toString(),
      author: session.user.name || session.user.email || 'ผู้ใช้งาน',
      authorEmail: userEmail,
      authorImage: session.user.image || undefined,
      rating: body.rating,
      comment: body.comment,
      date: new Date().toISOString(),
    };


    const success = await CampModel.addReview(id, review);
    if (!success) return NextResponse.json({ error: 'Camp not found' }, { status: 404 });

    const updatedCamp = await CampModel.findById(id);
    return NextResponse.json(updatedCamp, { status: 201 });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}

// ─── PATCH /api/camps/[id]/reviews — แก้ review ────────────────────────────
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId, rating, comment } = body;
    if (!reviewId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const db = await getDatabase();
    const campsCol = db.collection('camps');
    const camp = await campsCol.findOne({ _id: new ObjectId(id) });
    if (!camp) return NextResponse.json({ error: 'Camp not found' }, { status: 404 });

    const reviews: Review[] = camp.reviews || [];
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    if (reviewIndex === -1) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    // ตรวจสอบ ownership (ใช้ authorEmail ก่อน fallback เดิม)
    const rev = reviews[reviewIndex];
    const isOwner = rev.authorEmail === session.user.email || rev.author === session.user.email || rev.author === session.user.name;
    if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    reviews[reviewIndex] = { ...rev, rating: Number(rating), comment: String(comment).trim() };

    const { avgRating, ratingBreakdown } = recalcStats(reviews);
    await campsCol.updateOne(
      { _id: camp._id },
      { $set: { reviews, avgRating, ratingBreakdown } }
    );

    return NextResponse.json({ success: true, review: reviews[reviewIndex] });
  } catch (error) {
    console.error('Error editing review:', error);
    return NextResponse.json({ error: 'Failed to edit review' }, { status: 500 });
  }
}

// ─── DELETE /api/camps/[id]/reviews — ลบ review ─────────────────────────────
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviewId } = await request.json();
    if (!reviewId) return NextResponse.json({ error: 'Missing reviewId' }, { status: 400 });

    const db = await getDatabase();
    const campsCol = db.collection('camps');
    const camp = await campsCol.findOne({ _id: new ObjectId(id) });
    if (!camp) return NextResponse.json({ error: 'Camp not found' }, { status: 404 });

    const reviews: Review[] = camp.reviews || [];
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    if (reviewIndex === -1) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    // ตรวจสอบ ownership (ใช้ authorEmail ก่อน fallback เดิม)
    const rev = reviews[reviewIndex];
    const isOwner = rev.authorEmail === session.user.email || rev.author === session.user.email || rev.author === session.user.name;
    if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // ลบออกจาก array
    reviews.splice(reviewIndex, 1);
    const { avgRating, ratingBreakdown } = recalcStats(reviews);
    await campsCol.updateOne(
      { _id: camp._id },
      { $set: { reviews, avgRating, ratingBreakdown } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
