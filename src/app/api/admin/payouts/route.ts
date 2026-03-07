// src/app/api/admin/payouts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PaymentModel, UserModel, CampModel } from '@/lib/db/models';

// GET /api/admin/payouts — all payments with payout info (admin only)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !(['admin', 'super_admin'].includes((session.user as { role?: string }).role ?? ''))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payments = await PaymentModel.findAllForAdmin();

  // Only include payments that have platform fee set and are completed (actual money received)
  const feePayments = payments.filter(p => p.platformFee !== undefined && p.finalAmount > 0 && p.status === 'completed');

  // Aggregate totals from completed payments only
  const totalPlatformFee = feePayments.reduce((sum, p) => sum + (p.platformFee ?? 0), 0);
  const totalOrganizerNet = feePayments.reduce((sum, p) => sum + (p.organizerNet ?? 0), 0);
  const pendingPayouts = feePayments.filter(p => p.payoutStatus === 'pending');
  let paidOutPayouts = feePayments.filter(p => p.payoutStatus === 'paid_out');

  const pendingTotal = pendingPayouts.reduce((sum, p) => sum + (p.organizerNet ?? 0), 0);
  const paidOutTotal = paidOutPayouts.reduce((sum, p) => sum + (p.organizerNet ?? 0), 0);

  // Helper to fetch organizer and camp info
  const enrichPayment = async (p: any) => {
    let organizerPromptpay = '';
    let organizerAccountName = '';
    let campName = '';
    let endDate = null;

    try {
      const organizer = await UserModel.findById(p.organizerId);
      organizerPromptpay = organizer?.payoutInfo?.promptpayId ?? '';
      organizerAccountName = organizer?.payoutInfo?.accountName ?? '';
    } catch { /* ignore */ }

    try {
      const camp = await CampModel.findById(p.campId);
      campName = camp?.name ?? 'ไม่ทราบชื่อค่าย';
      endDate = camp?.endDate ?? camp?.createdAt ?? null;
    } catch { /* ignore */ }

    return { ...p, organizerPromptpay, organizerAccountName, campName, endDate };
  };

  // Enrich pending payouts with organizer PromptPay info and Camp details
  const enrichedPending = await Promise.all(pendingPayouts.map(enrichPayment));

  // Also enrich the history with camp names so the frontend can display them
  paidOutPayouts = await Promise.all(paidOutPayouts.map(enrichPayment));

  // Group pending by Camp for bulk payout UI
  const groupMap = new Map<string, {
    campId: string;
    campName: string;
    endDate: Date | string | null;
    organizerId: string;
    organizerAccountName: string;
    organizerPromptpay: string;
    totalNet: number;
    totalPlatformFee: number;
    totalFinalAmount: number;
    payments: typeof enrichedPending;
  }>();

  for (const p of enrichedPending) {
    const key = p.campId; // Grouping by Camp ID
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        campId: p.campId,
        campName: p.campName,
        endDate: p.endDate,
        organizerId: p.organizerId,
        organizerAccountName: p.organizerAccountName,
        organizerPromptpay: p.organizerPromptpay,
        totalNet: 0,
        totalPlatformFee: 0,
        totalFinalAmount: 0,
        payments: [],
      });
    }
    const g = groupMap.get(key)!;
    g.totalNet += p.organizerNet ?? 0;
    g.totalPlatformFee += p.platformFee ?? 0;
    g.totalFinalAmount += p.finalAmount;
    g.payments.push(p);
  }
  const pendingGrouped = Array.from(groupMap.values());

  return NextResponse.json({
    summary: {
      totalPlatformFee,
      totalOrganizerNet,
      pendingTotal,
      paidOutTotal,
      pendingCount: pendingPayouts.length,
      paidOutCount: paidOutPayouts.length,
    },
    pendingGrouped,
    pending: enrichedPending, // kept for backwards compat
    history: paidOutPayouts,
  });
}

// PATCH /api/admin/payouts — mark payment(s) as paid out
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(['admin', 'super_admin'].includes((session.user as { role?: string }).role ?? ''))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { paymentId, paymentIds, note, slipUrl, slipQrPayload } = body;

  // Support single ID or array of IDs
  const ids: string[] = paymentIds ?? (paymentId ? [paymentId] : []);
  if (!ids.length) {
    return NextResponse.json({ error: 'paymentId or paymentIds is required' }, { status: 400 });
  }

  // 1. Fetch payments to calculate remaining required amount
  const paymentsToPay = [];
  let expectedTotal = 0;
  for (const id of ids) {
    const payment = await PaymentModel.findById(id);
    if (payment && payment.payoutStatus !== 'paid_out') {
      paymentsToPay.push(payment);
      const remainingForPayment = (payment.organizerNet ?? 0) - (payment.payoutAmountPaid ?? 0);
      expectedTotal += remainingForPayment;
    }
  }

  if (paymentsToPay.length === 0) {
    return NextResponse.json({ error: 'No unpaid payments found' }, { status: 404 });
  }

  let slipDataParams: any = undefined;
  let remainingSlipAmount = expectedTotal; // By default assume full payment if no slip amount validation 

  if (slipUrl && slipQrPayload) {
    // Check duplicate slip across any OTHER payment not in our target list
    const crypto = await import('crypto');
    const slipQrHash = crypto.createHash('sha256').update(slipQrPayload).digest('hex');
    const duplicate = await PaymentModel.findBySlipQrHash(slipQrHash, ids);
    if (duplicate) {
      return NextResponse.json({
        success: false,
        error: 'สลิปนี้ถูกใช้ยืนยันการชำระเงินอื่นไปแล้ว ไม่สามารถใช้สลิปเดิมซ้ำได้',
      }, { status: 400 });
    }

    const clientId = process.env.RDCW_CLIENT_ID;
    const clientSecret = process.env.RDCW_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'ระบบตรวจสอบสลิปยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
      }, { status: 400 });
    }

    try {
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const res = await fetch('https://suba.rdcw.co.th/v1/inquiry', {
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
          error: rdcwMsg ? `RDCW: ${rdcwMsg}` : 'QR Code ในสลิปไม่ถูกต้องหรือหมดอายุ',
        }, { status: 400 });
      }

      const rdcwData = rdcw.data;
      const rawAmount = rdcwData.amount;
      const parsedAmount = parseFloat(String(rawAmount ?? '0'));

      // Allow minor discrepancy or auto-parse format
      let slipAmount = parsedAmount;
      if (expectedTotal > 0 && parsedAmount > expectedTotal * 10) {
        const asBaht = parsedAmount / 100;
        slipAmount = asBaht;
      }

      remainingSlipAmount = slipAmount;

      slipDataParams = {
        slipUrl,
        slipQrHash,
        slipSenderName: rdcwData.sender?.name || rdcwData.name || '',
        slipReceivedAmount: slipAmount,
      };

    } catch (err) {
      console.error('RDCW error during payout:', err);
      return NextResponse.json({
        success: false,
        error: 'ไม่สามารถเชื่อมต่อระบบตรวจสอบสลิปได้ กรุณาลองใหม่อีกครั้ง',
      }, { status: 500 });
    }
  } else if (!slipUrl) {
    return NextResponse.json({
      success: false,
      error: 'กรุณาแนบสลิปการโอนเงินและรอให้ระบบตรวจพบ QR ก่อนกดยืนยัน',
    }, { status: 400 });
  }

  // Distribute remainingSlipAmount across payments
  let successCount = 0;
  for (const payment of paymentsToPay) {
    if (remainingSlipAmount <= 0.01) break; // Slip amount exhausted

    const targetRemaining = (payment.organizerNet ?? 0) - (payment.payoutAmountPaid ?? 0);
    const amountToApply = Math.min(targetRemaining, remainingSlipAmount);

    const success = await PaymentModel.addPayout(payment._id, amountToApply, note, slipDataParams);
    if (success) {
      successCount++;
      remainingSlipAmount -= amountToApply;
    }
  }

  if (successCount === 0) {
    return NextResponse.json({ error: 'ยอดอัปเดตไม่สำเร็จ (อาจโอนยอดไม่เพียงพอ หรือโอนครบแล้ว)' }, { status: 400 });
  }

  return NextResponse.json({ success: true, updatedCount: successCount, remainingSlipAmount });
}
