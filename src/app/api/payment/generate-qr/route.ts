// src/app/api/payment/generate-qr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import generatePayload from 'promptpay-qr';
import qrcode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, phoneNumber } = body;

    if (!amount || !phoneNumber) {
      return NextResponse.json(
        { error: 'Amount and phone number are required' },
        { status: 400 }
      );
    }

    // Generate PromptPay payload
    const payload = generatePayload(phoneNumber, { amount: parseFloat(amount) });
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await qrcode.toDataURL(payload);

    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      payload,
      amount,
      phoneNumber
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
