// src/app/api/payment/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PaymentModel } from '@/lib/db/models/Payment';
import { PaymentStatus } from '@/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH /api/payment/[id] - Update payment (add slip, change status)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('=== UPDATE PAYMENT ===');
    console.log('Payment ID:', id);
    console.log('Update data:', body);

    const { slipUrl, status, ...otherData } = body;

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      ...otherData
    };

    if (slipUrl) {
      updateData.slipUrl = slipUrl;
    }

    // Update with new status
    const success = await PaymentModel.updateStatus(
      id,
      status || PaymentStatus.PENDING,
      updateData
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Payment not found or not updated' },
        { status: 404 }
      );
    }

    const updatedPayment = await PaymentModel.findById(id);

    console.log('Payment updated successfully');
    return NextResponse.json({
      success: true,
      payment: updatedPayment
    });

  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

// GET /api/payment/[id] - Get payment by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const payment = await PaymentModel.findById(id);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(payment);

  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}
