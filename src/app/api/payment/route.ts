// src/app/api/payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PaymentModel } from '@/lib/db/models'
import { PaymentStatus } from '@/types';
import { PromoCodeModel } from '@/lib/db/models/PromoCode';

// POST /api/payment - Create payment record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('=== CREATE PAYMENT REQUEST ===');
    console.log('Received data:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.registrationId || !body.campId || !body.userId || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create payment
    const payment = await PaymentModel.create({
      registrationId: body.registrationId,
      campId: body.campId,
      userId: body.userId,
      userEmail: body.userEmail, // เพิ่ม
      userName: body.userName, // เพิ่ม
      organizerId: body.organizerId || 'default',
      amount: body.amount,
      discount: body.discount || 0,
      finalAmount: body.finalAmount,
      promoCode: body.promoCode,
    });

    // If promo code was used, increment its usage
    if (body.promoCode) {
      await PromoCodeModel.incrementUsage(body.promoCode);
    }

    console.log('Payment created successfully:', payment._id);

    return NextResponse.json({
      success: true,
      payment
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

// GET /api/payment - Get payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('registrationId');
    const organizerId = searchParams.get('organizerId');

    if (registrationId) {
      const payment = await PaymentModel.findByRegistration(registrationId);
      return NextResponse.json(payment);
    }

    if (organizerId) {
      const payments = await PaymentModel.findByOrganizer(organizerId);
      return NextResponse.json(payments);
    }

    return NextResponse.json(
      { error: 'Please provide registrationId or organizerId' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
