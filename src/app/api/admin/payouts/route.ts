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

  // Only include payments that have platform fee set and are completed (actual money received)
  const feePayments = payments.filter(p => p.platformFee !== undefined && p.finalAmount > 0 && p.status === 'completed');

  // Aggregate totals from completed payments only
  const totalPlatformFee = feePayments.reduce((sum, p) => sum + (p.platformFee ?? 0), 0);
  const totalOrganizerNet = feePayments.reduce((sum, p) => sum + (p.organizerNet ?? 0), 0);
  const pendingPayouts = feePayments.filter(p => p.payoutStatus === 'pending');
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

  // Group pending by organizer for bulk payout UI
  const groupMap = new Map<string, {
    organizerId: string;
    organizerAccountName: string;
    organizerPromptpay: string;
    totalNet: number;
    totalPlatformFee: number;
    totalFinalAmount: number;
    payments: typeof enriched;
  }>();

  for (const p of enriched) {
    const key = p.organizerId;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        organizerId: p.organizerId,
        organizerAccountName: p.organizerAccountName ?? '',
        organizerPromptpay: p.organizerPromptpay ?? '',
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
    pending: enriched,        // kept for backwards compat
    history: paidOutPayouts,
  });
}

// PATCH /api/admin/payouts — mark payment(s) as paid out
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(['admin','super_admin'].includes((session.user as { role?: string }).role ?? ''))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { paymentId, paymentIds, note } = body;

  // Support single ID or array of IDs
  const ids: string[] = paymentIds ?? (paymentId ? [paymentId] : []);
  if (!ids.length) {
    return NextResponse.json({ error: 'paymentId or paymentIds is required' }, { status: 400 });
  }

  const results = await Promise.all(ids.map(id => PaymentModel.markAsPaidOut(id, note)));
  const successCount = results.filter(Boolean).length;

  if (successCount === 0) {
    return NextResponse.json({ error: 'No payments updated (not found or already paid out)' }, { status: 404 });
  }

  return NextResponse.json({ success: true, updatedCount: successCount });
}
