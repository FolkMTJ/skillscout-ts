// src/app/api/ticket/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RegistrationModel } from '@/lib/db/models/Registration';
import { CampModel } from '@/lib/db/models/Camp';
import { PaymentModel } from '@/lib/db/models/Payment';
import { RegistrationStatus } from '@/types';
import qrcode from 'qrcode';


// GET /api/ticket?userId=xxx&campId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const campId = searchParams.get('campId');

    if (!userId || !campId) {
      return NextResponse.json(
        { error: 'userId and campId are required' },
        { status: 400 }
      );
    }

    // Check if user has registered
    const isDuplicate = await RegistrationModel.checkDuplicate(userId, campId);

    if (!isDuplicate) {
      return NextResponse.json(
        {
          registered: false,
          message: 'User has not registered for this camp'
        }
      );
    }

    // Get registration details
    const registrations = await RegistrationModel.findByUser(userId);
    const registration = registrations.find(r => r.campId === campId);

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Get camp details
    const camp = await CampModel.findById(campId);

    if (!camp) {
      return NextResponse.json(
        { error: 'Camp not found' },
        { status: 404 }
      );
    }

    // ── Portfolio review check ────────────────────────────────────────────────
    if (camp.requiresPortfolio) {
      if (registration.status === RegistrationStatus.PENDING) {
        return NextResponse.json({
          registered: true,
          canGetTicket: false,
          status: 'pending_portfolio_review',
          message: 'รอ Organizer ตรวจสอบ Portfolio',
        });
      }
      if (registration.status === RegistrationStatus.REJECTED) {
        return NextResponse.json({
          registered: true,
          canGetTicket: false,
          status: 'portfolio_rejected',
          message: registration.notes || 'Portfolio ไม่ผ่านการตรวจสอบ',
        });
      }
      // status === APPROVED → fall through to payment check below
      // (CONFIRMED also falls through — already paid)
    }

    // 🔧 FIX: ตรวจสอบการชำระเงิน - ถ้าค่ายไม่ฟรีต้องมีการชำระเงินที่ approved
    const isFree = !camp.fee || camp.fee === 0;

    if (!isFree) {
      // ค่ายเสียเงิน - ต้องตรวจสอบ payment
      const payment = await PaymentModel.findByRegistrationId(registration._id.toString());

      if (!payment) {
        // portfolio camp + approved → ready to pay
        if (camp.requiresPortfolio && registration.status === RegistrationStatus.APPROVED) {
          return NextResponse.json({
            registered: true,
            canGetTicket: false,
            status: 'ready_to_pay',
            registrationId: registration._id.toString(),
            message: 'Portfolio ผ่านแล้ว กรุณาชำระเงิน',
          });
        }
        // ไม่มี payment record → รอชำระเงิน
        return NextResponse.json(
          {
            registered: true,
            canGetTicket: false,
            message: 'รอการชำระเงิน',
            status: 'pending_payment'
          }
        );
      }

      // ถ้าใช้ส่วนลด 100% (finalAmount = 0) → ให้ ticket ทันที ไม่ต้องรอ approve
      if (payment.finalAmount === 0) {
        console.log('Discount 100% applied - auto-approve and skip verification');
        // Auto-approve registration ถ้ายังเป็น pending (กรณีที่ PATCH ยังไม่เสร็จ)
        if (registration.status === 'pending') {
          await RegistrationModel.updateStatus(
            registration._id.toString(),
            'approved' as RegistrationStatus,
            'system',
            'Auto-approved: ใช้ส่วนลด 100% ราคาสุทธิ ฿0'
          );
          registration.status = 'approved' as RegistrationStatus;
          console.log('Auto-approved registration for 100% discount');
        }
        // Skip ทั้ง payment check และ registration check → ให้ ticket ทันที
        // ไปต่อที่ generate QR (ไม่ return error)
      } else if (payment.status !== 'completed' || !payment.slipVerified) {

        // ยังไม่ชำระเงิน / สลิปยังไม่ผ่านการตรวจสอบอัตโนมัติ
        return NextResponse.json(
          {
            registered: true,
            canGetTicket: false,
            message: 'กรุณาอัปโหลดสลิปและยืนยันการชำระเงินให้สำเร็จก่อน',
            status: 'pending_payment',
            paymentStatus: payment.status,
            slipVerified: payment.slipVerified,
            paymentId: payment._id.toString(),
            paymentCreatedAt: payment.createdAt,
            registrationId: registration._id.toString(),
          }
        );
      }
    }


    // ตรวจสอบ registration status - ต้องเป็น confirmed
    console.log('🔍 Checking registration status:', registration.status);

    if (!['confirmed', 'approved', 'attended', 'completed'].includes(registration.status)) {
      console.log('⚠️ Registration status not allowed for ticket:', registration.status);
      return NextResponse.json(
        {
          registered: true,
          canGetTicket: false,
          message: 'รอการอนุมัติ',
          status: registration.status,
          registrationStatus: registration.status,
          debugInfo: {
            status: registration.status,
            expected: ['confirmed', 'approved', 'attended', 'completed']
          }
        }
      );
    }

    console.log('Registration is confirmed/approved');
    console.log('All checks passed - can get ticket');

    // Generate verification URL (สแกนแล้วเปิดหน้า verify)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_BASE_URL is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    const verifyUrl = `${baseUrl}/verify?id=${registration._id}`;

    // Generate QR Code with verification URL
    const qrCodeDataUrl = await qrcode.toDataURL(verifyUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log('✓ Generated ticket QR:', verifyUrl);

    return NextResponse.json({
      registered: true,
      canGetTicket: true,
      ticket: {
        registrationId: registration._id,
        userName: registration.userName,
        userEmail: registration.userEmail,
        campName: camp.name,
        campDate: camp.date,
        campLocation: camp.location,
        qrCode: qrCodeDataUrl,
        verifyUrl: verifyUrl, // สำหรับ debug
        status: registration.status,
        createdAt: registration.appliedAt,
      }
    });

  } catch (error) {
    console.error('Error generating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to generate ticket' },
      { status: 500 }
    );
  }
}
