// src/app/api/camps/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CampModel } from '@/lib/db/models/Camp';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import { isAdminRole } from '@/lib/auth-check';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const incrementView = searchParams.get('incrementView') === 'true';

    let camp = await CampModel.findById(id, incrementView);

    if (!camp) {
      camp = await CampModel.findBySlug(id, incrementView);
    }

    if (!camp) {
      return NextResponse.json(
        { error: 'Camp not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(camp);
  } catch (error) {
    console.error('Error fetching camp:', error);
    return NextResponse.json(
      { error: 'Failed to fetch camp' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const success = await CampModel.update(id, body);

    if (!success) {
      return NextResponse.json(
        { error: 'Camp not found or no changes made' },
        { status: 404 }
      );
    }

    const updatedCamp = await CampModel.findById(id);
    return NextResponse.json(updatedCamp);
  } catch (error) {
    console.error('Error updating camp:', error);
    return NextResponse.json(
      { error: 'Failed to update camp' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const success = await CampModel.update(id, body);

    if (!success) {
      return NextResponse.json(
        { error: 'Camp not found or no changes made' },
        { status: 404 }
      );
    }

    const updatedCamp = await CampModel.findById(id);
    return NextResponse.json(updatedCamp);
  } catch (error) {
    console.error('Error updating camp:', error);
    return NextResponse.json(
      { error: 'Failed to update camp' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const role = (session.user as { role?: string })?.role;
    const isAdmin = isAdminRole(role);

    const camp = await CampModel.findById(id);
    if (!camp) {
      return NextResponse.json(
        { error: 'Camp not found' },
        { status: 404 }
      );
    }

    // Check if user is organizer or admin
    if (!isAdmin && camp.organizerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If the requester is NOT an admin, block deletion when registrations exist
    if (!isAdmin) {
      const regCollection = await getCollection('registrations');
      const regCount = await regCollection.countDocuments({ campId: id });
      if (regCount > 0) {
        return NextResponse.json(
          { error: `ไม่สามารถลบค่ายได้ เนื่องจากมีผู้สมัครแล้ว ${regCount} คน` },
          { status: 400 }
        );
      }
    }

    // Admins bypass the registration count check and force delete
    const success = await CampModel.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete camp from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Camp deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting camp:', error);
    return NextResponse.json(
      { error: 'Failed to delete camp' },
      { status: 500 }
    );
  }
}
