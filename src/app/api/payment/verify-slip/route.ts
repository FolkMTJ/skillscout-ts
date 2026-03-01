// src/app/api/payment/verify-slip/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { PaymentModel, RegistrationModel } from '@/lib/db/models';
import { PaymentStatus } from '@/types';

const RDCW_API = 'https://suba.rdcw.co.th/v1/inquiry';

// Handle both flat format (suba direct) and SDK-style format
interface RdcwData {
  amount?: string | number;
  date?: string;
  time?: string;
  bank?: string;
  name?: string;
  // SDK-style aliases
  transDate?: string;
  transTime?: string;
  sendingBank?: string;
  sender?: { name?: string };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function normalizeName(name: string): string {
  const prefixes = ['นาย', 'นางสาว', 'น.ส.', 'นาง', 'ด.ช.', 'ด.ญ.', 'Mr.', 'Mrs.', 'Ms.', 'Miss'];
  let s = name.trim();
  for (const p of prefixes) {
    if (s.startsWith(p)) { s = s.slice(p.length).trim(); break; }
  }
  return s.replace(/\s+/g, '').toLowerCase();
}

function namesMatch(slipName: string, paymentName: string): boolean {
  if (!slipName || !paymentName) return true;
  const a = normalizeName(slipName);
  const b = normalizeName(paymentName);
  return a.includes(b) || b.includes(a);
}

// Parse YYYYMMDD or DD/MM/YYYY — handles Buddhist Era (BE = CE + 543)
function parseSlipDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr) return null;

  let year: number, month: number, day: number;

  if (/^\d{8}$/.test(dateStr)) {
    year  = parseInt(dateStr.slice(0, 4));
    month = parseInt(dateStr.slice(4, 6));
    day   = parseInt(dateStr.slice(6, 8));
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const p = dateStr.split('/');
    day = parseInt(p[0]); month = parseInt(p[1]); year = parseInt(p[2]);
  } else {
    return null;
  }

  if (year > 2500) year -= 543; // Buddhist Era → CE

  let h = 0, m = 0, s = 0;
  if (timeStr) {
    const p = timeStr.split(':');
    h = parseInt(p[0] || '0'); m = parseInt(p[1] || '0'); s = parseInt(p[2] || '0');
  }

  const d = new Date(year, month - 1, day, h, m, s);
  return isNaN(d.getTime()) ? null : d;
}

// Auto-detect satang vs baht: if value is ~100× expected → divide by 100
function parseSlipAmount(raw: string | number | undefined, expectedBaht: number): number {
  const n = parseFloat(String(raw ?? '0'));
  if (expectedBaht > 0 && n > expectedBaht * 10) {
    const asBaht = n / 100;
    if (Math.abs(asBaht - expectedBaht) <= asBaht * 0.02 + 1) return asBaht;
  }
  return n;
}

// ── Route ──────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, slipQrPayload } = body;

    if (!paymentId) {
      return NextResponse.json({ success: false, error: 'Payment ID is required' }, { status: 400 });
    }

    const payment = await PaymentModel.findById(paymentId);
    if (!payment) {
      return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลการชำระเงิน' }, { status: 404 });
    }
    if (!payment.slipUrl) {
      return NextResponse.json({ success: false, error: 'ยังไม่มีสลิป' }, { status: 400 });
    }

    const qrPayload: string =
      slipQrPayload || (payment as unknown as Record<string, string>).slipQrPayload || '';

    if (!qrPayload) {
      return NextResponse.json({
        success: false,
        error: 'ไม่พบ QR Code ในสลิป กรุณาใช้สลิปที่มีรหัส QR Code ของธนาคาร',
      });
    }

    // ── 1. Duplicate slip check ─────────────────────────────────────────────
    const slipQrHash = createHash('sha256').update(qrPayload).digest('hex');
    const duplicate = await PaymentModel.findBySlipQrHash(slipQrHash, paymentId);
    if (duplicate) {
      return NextResponse.json({
        success: false,
        error: 'สลิปนี้ถูกใช้ยืนยันการชำระเงินอื่นไปแล้ว ไม่สามารถใช้สลิปเดิมซ้ำได้',
      });
    }

    // ── RDCW credentials ─────────────────────────────────────────────────────
    const clientId = process.env.RDCW_CLIENT_ID;
    const clientSecret = process.env.RDCW_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'ระบบตรวจสอบสลิปยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
      });
    }

    // ── Call RDCW ────────────────────────────────────────────────────────────
    let rdcwData: RdcwData;
    try {
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const res = await fetch(RDCW_API, {
        method: 'POST',
        headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: qrPayload }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`RDCW HTTP ${res.status}`);
      const rdcw = await res.json();
      console.log('[RDCW raw response]', JSON.stringify(rdcw, null, 2));
      if (!rdcw.success || !rdcw.data) throw new Error('RDCW returned no data');
      rdcwData = rdcw.data;
    } catch (err) {
      console.error('RDCW error:', err);
      return NextResponse.json({
        success: false,
        error: 'ไม่สามารถตรวจสอบสลิปได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
      });
    }

    // Normalize field names — handle both API formats
    const rawAmount  = rdcwData.amount;
    const dateStr    = rdcwData.transDate  || rdcwData.date  || '';
    const timeStr    = rdcwData.transTime  || rdcwData.time  || '';
    const senderName = rdcwData.sender?.name || rdcwData.name || '';

    // ── 2. Amount ────────────────────────────────────────────────────────────
    const slipAmount = parseSlipAmount(rawAmount, payment.finalAmount);
    if (slipAmount < payment.finalAmount - 1) {
      return NextResponse.json({
        success: false,
        error: `จำนวนเงินไม่ถูกต้อง: สลิปแสดง ฿${slipAmount.toLocaleString('th-TH')} แต่ต้องชำระ ฿${payment.finalAmount.toLocaleString('th-TH')}`,
      });
    }

    // ── 3. Date / Time ───────────────────────────────────────────────────────
    const slipDate = parseSlipDateTime(dateStr, timeStr);
    if (slipDate) {
      const now = new Date();
      const paymentCreatedAt = new Date(payment.createdAt);
      const BUFFER_MS = 5 * 60 * 1000; // 5-minute clock-skew tolerance

      if (slipDate.getTime() < paymentCreatedAt.getTime() - BUFFER_MS) {
        const slipStr    = slipDate.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
        const createdStr = paymentCreatedAt.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
        return NextResponse.json({
          success: false,
          error: `สลิปนี้โอนเมื่อ ${slipStr} แต่ลงทะเบียนเมื่อ ${createdStr} กรุณาใช้สลิปที่โอนหลังจากสมัครแล้ว`,
        });
      }

      if (slipDate.getTime() > now.getTime() + BUFFER_MS) {
        return NextResponse.json({
          success: false,
          error: 'วันที่ในสลิปเป็นอนาคต ไม่สามารถยืนยันได้',
        });
      }
    } else {
      console.warn('[RDCW] Cannot parse slip date/time:', { dateStr, timeStr });
    }

    // ── 4. Sender name ───────────────────────────────────────────────────────
    if (senderName && !namesMatch(senderName, payment.userName ?? '')) {
      return NextResponse.json({
        success: false,
        error: `ชื่อผู้โอน "${senderName}" ไม่ตรงกับชื่อผู้จอง "${payment.userName}" กรุณาโอนด้วยชื่อบัญชีของผู้จองเท่านั้น`,
      });
    }

    // ── ✅ All checks passed ─────────────────────────────────────────────────
    await PaymentModel.updateStatus(paymentId, PaymentStatus.COMPLETED, {
      slipVerified: true,
      requiresManualReview: false,
      slipUploadedAt: new Date(),
      slipQrHash,
      slipSenderName: senderName,
      slipReceivedAmount: slipAmount,
      verifiedAt: new Date(),
      verifiedBy: 'rdcw-auto',
    });

    // Auto-confirm registration so organizer sees it as CONFIRMED immediately
    try {
      await RegistrationModel.updateStatus(
        payment.registrationId,
        'confirmed' as Parameters<typeof RegistrationModel.updateStatus>[1],
        'rdcw-auto',
      );
    } catch (err) {
      console.warn('Could not auto-confirm registration:', err);
    }

    return NextResponse.json({
      success: true,
      senderName,
      receivedAmount: slipAmount,
      message: 'ตรวจสอบสลิปสำเร็จ',
    });

  } catch (error) {
    console.error('Error verifying slip:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    );
  }
}
