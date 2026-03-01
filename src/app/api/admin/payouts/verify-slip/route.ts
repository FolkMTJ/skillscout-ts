// src/app/api/admin/payouts/verify-slip/route.ts
// Verify admin payout slip (admin → organizer transfer) using RDCW, then mark payments as paid_out
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PaymentModel } from '@/lib/db/models';

const RDCW_API = 'https://suba.rdcw.co.th/v1/inquiry';

interface RdcwData {
  amount?: string | number;
  date?: string;
  time?: string;
  name?: string;
  transDate?: string;
  transTime?: string;
  sender?: { name?: string };
}

function parseSlipAmount(raw: string | number | undefined, expectedBaht: number): number {
  const n = parseFloat(String(raw ?? '0'));
  if (expectedBaht > 0 && n > expectedBaht * 10) {
    const asBaht = n / 100;
    if (Math.abs(asBaht - expectedBaht) <= asBaht * 0.02 + 1) return asBaht;
  }
  return n;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(['admin', 'super_admin'].includes((session.user as { role?: string }).role ?? ''))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { paymentIds, slipQrPayload, note } = body as {
    paymentIds: string[];
    slipQrPayload: string;
    note?: string;
  };

  if (!paymentIds?.length) {
    return NextResponse.json({ error: 'paymentIds is required' }, { status: 400 });
  }
  if (!slipQrPayload) {
    return NextResponse.json({ success: false, error: 'ไม่พบ QR Code ในสลิป กรุณาใช้สลิปที่มีรหัส QR Code ของธนาคาร' });
  }

  // Load all target payments to calculate expected total
  const payments = await Promise.all(paymentIds.map(id => PaymentModel.findById(id)));
  const validPayments = payments.filter(Boolean);
  if (!validPayments.length) {
    return NextResponse.json({ error: 'ไม่พบข้อมูลการชำระเงิน' }, { status: 404 });
  }
  const totalNet = validPayments.reduce((sum, p) => sum + (p?.organizerNet ?? 0), 0);

  // ── Call RDCW ────────────────────────────────────────────────────────────
  const clientId = process.env.RDCW_CLIENT_ID;
  const clientSecret = process.env.RDCW_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ success: false, error: 'ระบบตรวจสอบสลิปยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
  }

  let rdcwData: RdcwData;
  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch(RDCW_API, {
      method: 'POST',
      headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: slipQrPayload }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`RDCW HTTP ${res.status}`);
    const rdcw = await res.json();
    if (!rdcw.valid || !rdcw.data) {
      const rdcwMsg = rdcw.message || rdcw.error || rdcw.reason || '';
      return NextResponse.json({
        success: false,
        error: rdcwMsg ? `RDCW: ${rdcwMsg}` : 'QR Code ในสลิปไม่ถูกต้องหรือหมดอายุ กรุณาใช้สลิปที่ถูกต้อง',
      });
    }
    rdcwData = rdcw.data;
  } catch (err) {
    console.error('RDCW error (payout):', err);
    return NextResponse.json({ success: false, error: 'ไม่สามารถเชื่อมต่อระบบตรวจสอบสลิปได้ กรุณาลองใหม่อีกครั้ง' });
  }

  const senderName: string = rdcwData.sender?.name || rdcwData.name || '';
  const slipAmount = parseSlipAmount(rdcwData.amount, totalNet);

  // Check amount is at least the expected net (allow ±1 baht rounding)
  if (slipAmount < totalNet - 1) {
    return NextResponse.json({
      success: false,
      error: `จำนวนเงินในสลิป ฿${slipAmount.toLocaleString('th-TH')} น้อยกว่ายอดที่ต้องโอน ฿${totalNet.toLocaleString('th-TH')}`,
    });
  }

  // ── All checks passed — mark all payments as paid_out ─────────────────
  await Promise.all(paymentIds.map(id => PaymentModel.markAsPaidOut(id, note)));

  return NextResponse.json({ success: true, senderName, receivedAmount: slipAmount });
}
