// src/app/api/admin/payouts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PaymentModel } from '@/lib/db/models';
import { UserModel } from '@/lib/db/models';

// GET /api/admin/payouts — all payments with payout info (admin only)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !(['admin','super_admin'].includes((session.user as { role?: string }).role ?? ''))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payments = await PaymentModel.findAllForAdmin();

  // Only include payments that have platform fee set (fee-bearing payments)
  const feePayments = payments.filter(p => p.platformFee !== undefined && p.finalAmount > 0);

  // Aggregate totals
  const totalPlatformFee = feePayments.reduce((sum, p) => sum + (p.platformFee ?? 0), 0);
  const totalOrganizerNet = feePayments.reduce((sum, p) => sum + (p.organizerNet ?? 0), 0);
  const pendingPayouts = feePayments.filter(p => p.payoutStatus === 'pending' && p.status === 'completed');
  const paidOutPayouts = feePayments.filter(p => p.payoutStatus === 'paid_out');

  const pendingTotal = pendingPayouts.reduce((sum, p) => sum + (p.organizerNet ?? 0), 0);
  const paidOutTotal = paidOutPayouts.reduce((sum, p) => sum + (p.organizerNet ?? 0), 0);

  // Enrich pending payouts with organizer PromptPay info
  const enriched = await Promise.all(
    pendingPayouts.map(async (p) => {
      let organizerPromptpay = '';
      let organizerAccountName = '';
      try {
        const organizer = await UserModel.findById(p.organizerId);
        organizerPromptpay = organizer?.payoutInfo?.promptpayId ?? '';
        organizerAccountName = organizer?.payoutInfo?.accountName ?? '';
      } catch {
        // ignore
      }
      return { ...p, organizerPromptpay, organizerAccountName };
    })
  );

  return NextResponse.json({
    summary: {
      totalPlatformFee,
      totalOrganizerNet,
      pendingTotal,
      paidOutTotal,
      pendingCount: pendingPayouts.length,
      paidOutCount: paidOutPayouts.length,
    },
    pending: enriched,
    history: paidOutPayouts,
  });
}

// PATCH /api/admin/payouts — mark payment as paid out
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(['admin','super_admin'].includes((session.user as { role?: string }).role ?? ''))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { paymentId, note } = body;

  if (!paymentId) {
    return NextResponse.json({ error: 'paymentId is required' }, { status: 400 });
  }

  const success = await PaymentModel.markAsPaidOut(paymentId, note);
  if (!success) {
    return NextResponse.json({ error: 'Payment not found or already paid out' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
