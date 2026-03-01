// src/app/api/ticket/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { RegistrationModel } from '@/lib/db/models/Registration';
import { CampModel } from '@/lib/db/models/Camp';
import { RegistrationStatus } from '@/types';

const ALLOWED_ROLES = ['admin', 'super_admin', 'organizer'];

// GET /api/ticket/verify?id=xxx - Verify and check-in by scanning QR
export async function GET(request: NextRequest) {
  try {
    // ต้อง login และต้องเป็น admin/super_admin/organizer เท่านั้น
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'กรุณาเข้าสู่ระบบก่อนสแกนบัตร' },
        { status: 401 }
      );
    }
    if (!ALLOWED_ROLES.includes(session.user.role || '')) {
      return NextResponse.json(
        { success: false, message: 'ไม่มีสิทธิ์สแกนบัตร — เฉพาะ Admin และ Organizer เท่านั้น' },
        { status: 403 }
      );
    }

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

    // Check if today is the camp day (startDate → endDate, inclusive)
    if (camp.startDate) {
      const now = new Date();
      const campStart = new Date(camp.startDate);
      campStart.setHours(0, 0, 0, 0);

      const campEnd = camp.endDate ? new Date(camp.endDate) : new Date(camp.startDate);
      campEnd.setHours(23, 59, 59, 999);

      if (now < campStart || now > campEnd) {
        const startStr = campStart.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
        const endStr = campEnd.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
        const rangeStr = camp.endDate && campStart.toDateString() !== campEnd.toDateString()
          ? `${startStr} – ${endStr}`
          : startStr;
        return NextResponse.json({
          success: false,
          error: 'Not camp day',
          message: `E-Ticket สแกนได้เฉพาะวันจัดค่าย (${rangeStr}) เท่านั้น`,
        }, { status: 403 });
      }
    }

    // Check if already checked in
    if (registration.status === RegistrationStatus.ATTENDED) {
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
          checkedInAt: registration.reviewedAt || registration.appliedAt,
        }
      });
    }

    // Check if registration is approved/confirmed
    // รองรับทั้ง APPROVED, CONFIRMED, และ PENDING
    const validStatuses = [
      RegistrationStatus.APPROVED,
      RegistrationStatus.CONFIRMED,
      RegistrationStatus.PENDING
    ];
    
    if (!validStatuses.includes(registration.status as RegistrationStatus)) {
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
      RegistrationStatus.ATTENDED,
      'system',
      'เช็คอินที่หน้างาน'
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
