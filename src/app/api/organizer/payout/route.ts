// src/app/api/organizer/payout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserModel } from '@/lib/db/models';

/**
 * GET /api/organizer/payout
 * ดึง payoutInfo ของ organizer ที่ login อยู่
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.role !== 'organizer' && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await UserModel.findByEmail(session.user.email!);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      payoutInfo: user.payoutInfo ?? null,
    });
  } catch (error) {
    console.error('Error fetching payout info:', error);
    return NextResponse.json({ error: 'Failed to fetch payout info' }, { status: 500 });
  }
}

/**
 * POST /api/organizer/payout
 * บันทึก PromptPay info ลง DB
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.role !== 'organizer' && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { promptpayId, accountName } = body;

    // Validate promptpayId: 10-digit phone or 13-digit national ID
    if (!promptpayId || !/^(\d{10}|\d{13})$/.test(promptpayId)) {
      return NextResponse.json(
        { error: 'PromptPay ID ต้องเป็นเบอร์โทร 10 หลัก หรือเลขบัตรประชาชน 13 หลัก' },
        { status: 400 }
      );
    }

    if (!accountName || accountName.trim().length === 0) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อบัญชี' }, { status: 400 });
    }

    const user = await UserModel.findByEmail(session.user.email!);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const payoutInfo = {
      promptpayId,
      accountName: accountName.trim(),
      createdAt: user.payoutInfo?.createdAt ?? now,
      updatedAt: now,
    };

    const userId = user._id!.toString();
    await UserModel.update(userId, { payoutInfo });

    return NextResponse.json({ success: true, payoutInfo });
  } catch (error) {
    console.error('Error saving payout info:', error);
    return NextResponse.json({ error: 'Failed to save payout info' }, { status: 500 });
  }
}
