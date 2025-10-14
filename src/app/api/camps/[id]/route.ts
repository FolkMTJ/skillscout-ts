// src/app/api/camps/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CampModel } from '@/lib/db/models/Camp';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/camps/[id] - Get camp by ID or slug
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    // Try to find by ID first, then by slug
    let camp = await CampModel.findById(id);
    
    if (!camp) {
      camp = await CampModel.findBySlug(id);
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

// PATCH /api/camps/[id] - Partial update camp
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Note: You can add authentication/authorization here
    // Example: Check if user has permission to update this camp

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

// PUT /api/camps/[id] - Update camp
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Note: You can add authentication/authorization here
    // Example: Check if user has permission to update this camp

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

// DELETE /api/camps/[id] - Delete camp
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    // Note: You should add authentication/authorization here
    // Example: Check if user is admin or camp organizer

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