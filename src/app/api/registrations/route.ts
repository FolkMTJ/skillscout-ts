// src/app/api/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RegistrationModel } from '@/lib/db/models/Registration';
import { CampModel } from '@/lib/db/models/Camp';
import { RegistrationStatus } from '@/types';

// POST /api/registrations - Create new registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('=== CREATE REGISTRATION REQUEST ===');
    console.log('Received data:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.campId || !body.userName || !body.userEmail) {
      console.error('Validation failed: Missing required fields');
      console.error('campId:', body.campId);
      console.error('userName:', body.userName);
      console.error('userEmail:', body.userEmail);
      return NextResponse.json(
        { 
          error: 'Missing required fields: campId, userName, userEmail',
          received: {
            campId: !!body.campId,
            userName: !!body.userName,
            userEmail: !!body.userEmail
          }
        },
        { status: 400 }
      );
    }

    console.log('✓ Validation passed');
    console.log('Fetching camp with ID:', body.campId);

    // Get camp details
    let camp;
    try {
      camp = await CampModel.findById(body.campId);
      console.log('Camp found:', camp ? 'YES' : 'NO');
    } catch (campError) {
      console.error('Error fetching camp:', campError);
      return NextResponse.json(
        { 
          error: 'Error fetching camp details',
          message: campError instanceof Error ? campError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    if (!camp) {
      console.error('Camp not found with ID:', body.campId);
      return NextResponse.json(
        { error: 'Camp not found' },
        { status: 404 }
      );
    }

    console.log('✓ Camp found:', camp.name);

    // Check if camp is full
    const capacity = camp.capacity || camp.participantCount || 0;
    const enrolled = camp.enrolled || 0;
    console.log('Capacity check - Enrolled:', enrolled, 'Capacity:', capacity);
    
    if (enrolled >= capacity) {
      console.error('Camp is full');
      return NextResponse.json(
        { error: 'Camp is full' },
        { status: 400 }
      );
    }

    console.log('✓ Camp has space');

    // For now, use userEmail as userId if not authenticated
    const userId = body.userId || body.userEmail;
    console.log('Using userId:', userId);

    // Check for duplicate registration
    console.log('Checking for duplicate registration...');
    let isDuplicate;
    try {
      isDuplicate = await RegistrationModel.checkDuplicate(userId, body.campId);
      console.log('Duplicate check result:', isDuplicate);
    } catch (dupError) {
      console.error('Error checking duplicate:', dupError);
      return NextResponse.json(
        { 
          error: 'Error checking duplicate registration',
          message: dupError instanceof Error ? dupError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    if (isDuplicate) {
      console.error('Duplicate registration detected');
      return NextResponse.json(
        { error: 'You have already registered for this camp' },
        { status: 400 }
      );
    }

    console.log('✓ No duplicate found');

    // Create registration with additional data
    const registrationData = {
      campId: body.campId,
      userId: userId,
      userName: body.userName,
      userEmail: body.userEmail,
      userPhone: body.userPhone,
      answers: body.answers || [
        { question: 'ที่อยู่', answer: body.university || '' },
        { question: 'มหาวิทยาลัย/สถาบัน', answer: body.year || '' },
        { question: 'เหตุผลที่ต้องการเข้าร่วม', answer: body.reason || '' }
      ]
    };

    console.log('Creating registration...');
    console.log('Registration data:', JSON.stringify(registrationData, null, 2));

    let registration;
    try {
      registration = await RegistrationModel.create(registrationData);
      console.log('✓ Registration created:', registration._id);
    } catch (createError) {
      console.error('Error creating registration:', createError);
      return NextResponse.json(
        { 
          error: 'Failed to create registration',
          message: createError instanceof Error ? createError.message : 'Unknown error',
          details: createError
        },
        { status: 500 }
      );
    }

    // Update camp enrolled count
    console.log('Updating camp enrolled count...');
    const newEnrolled = enrolled + 1;
    try {
      await CampModel.update(body.campId, { enrolled: newEnrolled });
      console.log('✓ Camp enrolled count updated:', newEnrolled);
    } catch (updateError) {
      console.error('Error updating camp:', updateError);
      // Don't fail the whole request if this fails
      console.warn('Warning: Could not update camp enrolled count');
    }

    console.log('=== REGISTRATION SUCCESS ===');
    console.log('Registration ID:', registration._id);
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
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.name : typeof error
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
      registrations = await RegistrationModel.findByStatus(status as RegistrationStatus);
    } else {
      return NextResponse.json(
        { error: 'Please provide campId, userId, or status parameter' },
        { status: 400 }
      );
    }

    console.log('Fetched registrations:', registrations?.length || 0);
    return NextResponse.json({ registrations: registrations || [] });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
