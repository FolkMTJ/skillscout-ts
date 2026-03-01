// src/app/api/organizers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const usersCol = await getCollection('users');
    const campsCol = await getCollection('camps');

    // Find organizer user
    let user = null;
    try {
      user = await usersCol.findOne({ _id: new ObjectId(id) });
    } catch {
      // invalid ObjectId
    }

    if (!user || (user.role !== 'organizer' && user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }

    // Find their camps (active ones only, or all non-draft/non-rejected)
    const camps = await campsCol
      .find({ organizerId: id, status: { $in: ['active', 'closed', 'completed'] } })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    // Aggregate all reviews from their camps
    const allReviews = camps.flatMap((c) =>
      (c.reviews || []).map((r: { author: string; rating: number; comment: string; date: string }) => ({
        ...r,
        campName: c.name,
        campId: String(c._id),
      }))
    );

    const totalReviews = allReviews.length;
    const avgRating =
      totalReviews > 0
        ? allReviews.reduce((sum: number, r: { rating: number }) => sum + (r.rating || 0), 0) / totalReviews
        : 0;

    return NextResponse.json({
      organizer: {
        id,
        name: user.name || user.email,
        email: user.email,
        image: user.profileImage || user.image || null,
        role: user.role,
        createdAt: user.createdAt,
      },
      camps: camps.map((c) => ({
        _id: String(c._id),
        name: c.name,
        image: c.image,
        date: c.date,
        location: c.location,
        price: c.price,
        category: c.category,
        enrolled: c.enrolled || 0,
        capacity: c.capacity || c.participantCount || 0,
        avgRating: c.avgRating || 0,
        reviewCount: (c.reviews || []).length,
        status: c.status,
        slug: c.slug,
      })),
      stats: {
        totalCamps: camps.length,
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
      },
      recentReviews: allReviews.slice(0, 5),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
