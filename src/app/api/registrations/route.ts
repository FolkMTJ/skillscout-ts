// src/app/api/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RegistrationModel } from '@/lib/db/models/Registration';
import { CampModel } from '@/lib/db/models/Camp';
import { getServerSession } from 'next-auth';

// POST /api/registrations - Create new registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('=== CREATE REGISTRATION REQUEST ===');
    console.log('Received data:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.campId || !body.userName || !body.userEmail) {
      console.error('Validation failed: Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: campId, userName, userEmail' },
        { status: 400 }
      );
    }

    // Get camp details
    const camp = await CampModel.findById(body.campId);
    if (!camp) {
      return NextResponse.json(
        { error: 'Camp not found' },
        { status: 404 }
      );
    }

    // Check if camp is full
    const capacity = camp.capacity || camp.participantCount || 0;
    const enrolled = camp.enrolled || 0;
    if (enrolled >= capacity) {
      return NextResponse.json(
        { error: 'Camp is full' },
        { status: 400 }
      );
    }

    // For now, use userEmail as userId if not authenticated
    const userId = body.userId || body.userEmail;

    // Check for duplicate registration
    const isDuplicate = await RegistrationModel.checkDuplicate(userId, body.campId);
    if (isDuplicate) {
      return NextResponse.json(
        { error: 'You have already registered for this camp' },
        { status: 400 }
      );
    }

    // Create registration with additional data
    const registrationData = {
      campId: body.campId,
      userId: userId,
      userName: body.userName,
      userEmail: body.userEmail,
      userPhone: body.userPhone,
      answers: body.answers || [
        { question: 'มหาวิทยาลัย/สถาบัน', answer: body.university || '' },
        { question: 'ชั้นปี', answer: body.year || '' },
        { question: 'เหตุผลที่ต้องการเข้าร่วม', answer: body.reason || '' }
      ]
    };

    console.log('Creating registration with data:', JSON.stringify(registrationData, null, 2));

    const registration = await RegistrationModel.create(registrationData);

    // Update camp enrolled count
    const newEnrolled = enrolled + 1;
    await CampModel.update(body.campId, { enrolled: newEnrolled });

    console.log('Registration created successfully:', registration._id);
    console.log('===========================');

    return NextResponse.json({
      success: true,
      registration,
      message: 'Registration submitted successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('=== CREATE REGISTRATION ERROR ===');
    console.error('Error:', error);
    console.error('Error type:', typeof error);
    console.error('Error name:', error instanceof Error ? error.name : 'N/A');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('========================');
    
    return NextResponse.json(
      { 
        error: 'Failed to create registration',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/registrations - Get registrations (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campId = searchParams.get('campId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let registrations;

    if (campId) {
      registrations = await RegistrationModel.findByCamp(campId);
    } else if (userId) {
      registrations = await RegistrationModel.findByUser(userId);
    } else if (status) {
      registrations = await RegistrationModel.findByStatus(status as any);
    } else {
      return NextResponse.json(
        { error: 'Please provide campId, userId, or status parameter' },
        { status: 400 }
      );
    }

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
