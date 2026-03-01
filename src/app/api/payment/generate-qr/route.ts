// src/app/api/payment/generate-qr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import generatePayload from 'promptpay-qr';
import qrcode from 'qrcode';
import { UserModel } from '@/lib/db/models';
import { getPlatformSettings } from '@/lib/platformSettings';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, organizerId } = body;

    if (!amount || !organizerId) {
      return NextResponse.json(
        { error: 'Amount and organizerId are required' },
        { status: 400 }
      );
    }

    // Platform fee mode: read from DB (admin-configurable), fallback to env
    const platform = await getPlatformSettings();

    let promptpayId: string;
    let accountName: string;

    if (platform.enabled) {
      // Platform collects the money
      promptpayId = platform.promptpayId;
      accountName = platform.accountName;
    } else {
      // Legacy mode: organizer receives directly
      const organizer = await UserModel.findById(organizerId);
      if (!organizer?.payoutInfo?.promptpayId) {
        return NextResponse.json(
          { error: 'Organizer ยังไม่ได้ตั้งค่า PromptPay กรุณาติดต่อ Organizer' },
          { status: 400 }
        );
      }
      promptpayId = organizer.payoutInfo.promptpayId;
      accountName = organizer.payoutInfo.accountName;
    }

    // Generate PromptPay payload
    const payload = generatePayload(promptpayId, { amount: parseFloat(amount) });

    // Generate QR code as data URL
    const qrCodeDataUrl = await qrcode.toDataURL(payload, { width: 300 });

    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      payload,
      amount,
      promptpayId,
      accountName,
      platformMode: platform.enabled,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
