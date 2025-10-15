// src/app/api/ticket/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RegistrationModel } from '@/lib/db/models/Registration';
import { CampModel } from '@/lib/db/models/Camp';

// GET /api/ticket/verify?id=xxx - Verify and check-in by scanning QR
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('id');

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    console.log('=== TICKET VERIFICATION ===');
    console.log('Registration ID:', registrationId);

    // Get registration
    const registration = await RegistrationModel.findById(registrationId);
    
    if (!registration) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Registration not found',
          message: 'ไม่พบการลงทะเบียนนี้ในระบบ'
        },
        { status: 404 }
      );
    }

    // Get camp details
    const camp = await CampModel.findById(registration.campId);
    
    if (!camp) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Camp not found',
          message: 'ไม่พบค่ายนี้ในระบบ'
        },
        { status: 404 }
      );
    }

    // Check if already checked in
    if (registration.status === 'attended') {
      console.log('⚠️ Already checked in');
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        message: 'ผู้เข้าร่วมท่านนี้ได้เช็คอินแล้ว',
        registration: {
          id: registration._id,
          userName: registration.userName,
          userEmail: registration.userEmail,
          campName: camp.name,
          campDate: camp.date,
          campLocation: camp.location,
          status: registration.status,
          checkedInAt: registration.updatedAt,
        }
      });
    }

    // Check if registration is approved
    if (registration.status !== 'approved' && registration.status !== 'pending') {
      console.log('❌ Registration not approved, status:', registration.status);
      return NextResponse.json({
        success: false,
        error: 'Registration not approved',
        message: 'การลงทะเบียนยังไม่ได้รับการอนุมัติ',
        registration: {
          userName: registration.userName,
          status: registration.status,
        }
      });
    }

    // Mark as attended (check-in)
    const updated = await RegistrationModel.updateStatus(
      registrationId,
      'attended'
    );

    if (!updated) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update attendance',
        message: 'ไม่สามารถบันทึกการเข้าร่วมได้'
      }, { status: 500 });
    }

    console.log('✓ Check-in successful!');

    return NextResponse.json({
      success: true,
      message: 'เช็คอินสำเร็จ!',
      registration: {
        id: registration._id,
        userName: registration.userName,
        userEmail: registration.userEmail,
        campName: camp.name,
        campDate: camp.date,
        campLocation: camp.location,
        status: 'attended',
        checkedInAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error verifying ticket:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to verify ticket',
        message: 'เกิดข้อผิดพลาดในการตรวจสอบบัตร'
      },
      { status: 500 }
    );
  }
}
