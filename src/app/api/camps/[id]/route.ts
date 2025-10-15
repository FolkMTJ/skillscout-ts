// src/app/api/camps/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CampModel } from '@/lib/db/models/Camp';

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

    const success = await CampModel.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Camp not found' },
        { status: 404 }
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
