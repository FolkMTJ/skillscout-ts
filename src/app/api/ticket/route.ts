// src/app/api/ticket/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RegistrationModel } from '@/lib/db/models/Registration';
import { CampModel } from '@/lib/db/models/Camp';
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

    // Generate verification URL (สแกนแล้วเปิดหน้า verify)
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify?id=${registration._id}`;

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
