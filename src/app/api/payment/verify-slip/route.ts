// src/app/api/payment/verify-slip/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { PaymentModel, RegistrationModel, UserModel } from '@/lib/db/models';
import { NotificationModel } from '@/lib/db/models/Notification';
import { PaymentStatus, RegistrationStatus } from '@/types';
import { getPlatformSettings } from '@/lib/platformSettings';


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
  receiver?: {
    name?: string;
    proxy?: {
      type?: string;
      value?: string;
    };
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

// Parse YYYYMMDD or DD/MM/YYYY — handles Buddhist Era (BE = CE + 543)
function parseSlipDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr) return null;

  let year: number, month: number, day: number;

  if (/^\d{8}$/.test(dateStr)) {
    year = parseInt(dateStr.slice(0, 4));
    month = parseInt(dateStr.slice(4, 6));
    day = parseInt(dateStr.slice(6, 8));
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

  // สลิปไทยใช้ timezone UTC+7 (Asia/Bangkok)
  // ใช้ Date.UTC แล้วลบ 7 ชั่วโมง เพื่อ convert เป็น UTC ให้ถูกต้อง
  const utcMs = Date.UTC(year, month - 1, day, h, m, s) - 7 * 60 * 60 * 1000;
  const d = new Date(utcMs);
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

// Strip common Thai titles for looser name matching
function stripTitles(name: string): string {
  if (!name) return '';
  let str = name.replace(/\s+/g, ' ').trim().toLowerCase();
  const titles = ['นาย ', 'นางสาว ', 'นาง ', 'ด.ช. ', 'ด.ญ. ', 'mr. ', 'ms. ', 'mrs. ', 'miss '];
  for (const t of titles) {
    if (str.startsWith(t)) {
      str = str.substring(t.length);
    } else if (str.startsWith(t.trim())) {
      str = str.substring(t.trim().length);
    }
  }
  return str.trim();
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
      if (!rdcw.valid || !rdcw.data) {
        const rdcwMsg = rdcw.message || rdcw.error || rdcw.reason || '';
        return NextResponse.json({
          success: false,
          error: rdcwMsg
            ? `RDCW: ${rdcwMsg}`
            : 'QR Code ในสลิปไม่ถูกต้องหรือหมดอายุ กรุณาใช้สลิปที่ถูกต้อง',
        });
      }
      rdcwData = rdcw.data;
    } catch (err) {
      console.error('RDCW error:', err);
      return NextResponse.json({
        success: false,
        error: 'ไม่สามารถเชื่อมต่อระบบตรวจสอบสลิปได้ กรุณาลองใหม่อีกครั้ง',
      });
    }

    // ── 1.5. Receiver Validation ─────────────────────────────────────────────
    let expectedPromptpay = '';
    let expectedAccountName = '';
    const platform = await getPlatformSettings();

    if (platform.enabled) {
      expectedPromptpay = platform.promptpayId;
      expectedAccountName = platform.accountName;
    } else {
      const organizer = await UserModel.findById(payment.organizerId);
      if (organizer?.payoutInfo?.promptpayId) {
        expectedPromptpay = organizer.payoutInfo.promptpayId;
        expectedAccountName = organizer.payoutInfo.accountName;
      }
    }

    const receiverMatch = () => {
      if (!expectedPromptpay && !expectedAccountName) return true; // No expectation set, allow bypass

      const rName = rdcwData.receiver?.name || '';
      const rProxy = rdcwData.receiver?.proxy?.value || ''; // usually account number or promptpay

      // 1. Check account / promptpay number match. RDCW might mask like xxx-x-1234.
      // We check if the last 4 visible digits match.
      const cleanExpectedProxy = expectedPromptpay.replace(/\D/g, '');
      const cleanReceivedProxy = rProxy.replace(/\D/g, '');

      if (cleanExpectedProxy && cleanReceivedProxy.length >= 4) {
        if (cleanExpectedProxy.endsWith(cleanReceivedProxy.slice(-4))) {
          return true;
        }
      } else if (cleanExpectedProxy === cleanReceivedProxy && cleanExpectedProxy.length > 0) {
        return true;
      }

      // 2. Check name match (loose)
      if (expectedAccountName && rName) {
        const cleanExpected = stripTitles(expectedAccountName);
        const cleanReceived = stripTitles(rName);

        // Exact match or partial match (one contains another)
        if (cleanExpected === cleanReceived ||
          cleanExpected.includes(cleanReceived) ||
          cleanReceived.includes(cleanExpected)) {
          return true;
        }

        // Check if at least the first name matches tightly
        const expectedFirst = cleanExpected.split(' ')[0];
        const receivedFirst = cleanReceived.split(' ')[0];
        if (expectedFirst && receivedFirst && expectedFirst === receivedFirst) {
          return true;
        }
      }

      return false; // Neither number nor name matched
    };

    if (!receiverMatch()) {
      return NextResponse.json({
        success: false,
        error: `สลิปนี้โอนไปผิดบัญชี (รับโอน: ${rdcwData.receiver?.name || 'ไม่ทราบชื่อ'}) กรุณาโอนเงินให้ถูกต้องตรงตามบัญชีที่กำหนด`,
      });
    }

    // Normalize field names — handle both API formats
    const rawAmount = rdcwData.amount;
    const dateStr = rdcwData.transDate || rdcwData.date || '';
    const timeStr = rdcwData.transTime || rdcwData.time || '';
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
        const slipStr = slipDate.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
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

    // ── All checks passed ─────────────────────────────────────────────────
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

    // อัปเดต registration status → confirmed เพื่อให้ปุ่มรับ Ticket โชว์
    const updatedReg = await RegistrationModel.updateStatus(
      payment.registrationId,
      RegistrationStatus.CONFIRMED,
      'rdcw-auto',
      'ชำระเงินสำเร็จ (ยืนยันอัตโนมัติ)'
    );

    // 🔔 แจ้งเตือน user ว่าชำระเงินสำเร็จและลงทะเบียนค่ายสำเร็จ
    try {
      if (updatedReg?.userId) {
        const userId = String(updatedReg.userId);
        const campId = String(payment.campId);
        const alreadyNotified = await NotificationModel.exists(userId, 'camp_confirmed', campId);
        if (!alreadyNotified) {
          await NotificationModel.create({
            userId,
            type: 'camp_confirmed',
            title: 'ลงทะเบียนค่ายสำเร็จ! 🎉',
            message: 'การชำระเงินได้รับการยืนยันแล้ว สามารถกด "รับ Ticket" เพื่อดาวน์โหลดบัตรผ่านประตูได้เลย',
            campId,
            registrationId: payment.registrationId,
          });
        }
      }
    } catch (e) {
      console.error('notification error (non-critical):', e);
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
