// src/lib/slip-verification/slipOk.ts
// ใช้ SlipOK API (ฟรี) สำหรับตรวจสอบสลิป
// Docs: https://developer.slipok.com/

export interface SlipVerificationResult {
  success: boolean;
  verified: boolean;
  amount?: number;
  date?: string;
  time?: string;
  sender?: {
    name?: string;
    account?: string;
  };
  receiver?: {
    name?: string;
    account?: string;
  };
  transRef?: string;
  error?: string;
}

export async function verifySlipWithSlipOK(
  imageUrl: string
): Promise<SlipVerificationResult> {
  try {
    // SlipOK API endpoint
    const apiUrl = 'https://api.slipok.com/api/line/apikey/verify';
    
    // ต้องสมัคร API Key ที่ https://www.slipok.com/
    const apiKey = process.env.SLIPOK_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        verified: false,
        error: 'SlipOK API key not configured'
      };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-authorization': apiKey,
      },
      body: JSON.stringify({
        files: [imageUrl],
        log: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`SlipOK API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse response
    if (data.success && data.data) {
      const slipData = data.data;
      
      return {
        success: true,
        verified: true,
        amount: parseFloat(slipData.amount?.value || '0'),
        date: slipData.transDate,
        time: slipData.transTime,
        sender: {
          name: slipData.sender?.displayName,
          account: slipData.sender?.account?.value,
        },
        receiver: {
          name: slipData.receiver?.displayName,
          account: slipData.receiver?.account?.value,
        },
        transRef: slipData.transRef,
      };
    }

    return {
      success: false,
      verified: false,
      error: 'Unable to verify slip'
    };

  } catch (error) {
    console.error('Error verifying slip:', error);
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Alternative: Use Tesseract.js (OCR) - ฟรีแต่แม่นยำน้อยกว่า
export async function verifySlipWithOCR(
  imageUrl: string,
  expectedAmount: number
): Promise<SlipVerificationResult> {
  try {
    // ใช้ Google Cloud Vision API หรือ AWS Textract
    // สำหรับการทดสอบ เราจะใช้ logic แบบง่าย
    
    // TODO: Implement actual OCR logic
    // For now, return a mock response
    
    return {
      success: true,
      verified: false,
      error: 'OCR verification not implemented yet'
    };

  } catch (error) {
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Validate slip data against payment
export function validateSlipData(
  slipData: SlipVerificationResult,
  expectedAmount: number,
  expectedAccount?: string
): {
  isValid: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (!slipData.verified) {
    reasons.push('ไม่สามารถตรวจสอบสลิปได้');
    return { isValid: false, reasons };
  }

  // Check amount (allow 1 baht difference for rounding)
  if (slipData.amount) {
    const diff = Math.abs(slipData.amount - expectedAmount);
    if (diff > 1) {
      reasons.push(`ยอดเงินไม่ตรง (คาดหวัง: ฿${expectedAmount}, ได้รับ: ฿${slipData.amount})`);
    }
  } else {
    reasons.push('ไม่พบข้อมูลยอดเงิน');
  }

  // Check receiver account (if provided)
  if (expectedAccount && slipData.receiver?.account) {
    if (!slipData.receiver.account.includes(expectedAccount.replace(/-/g, ''))) {
      reasons.push('บัญชีผู้รับไม่ตรง');
    }
  }

  // Check if slip is recent (within 24 hours)
  if (slipData.date) {
    const slipDate = new Date(slipData.date);
    const now = new Date();
    const hoursDiff = (now.getTime() - slipDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      reasons.push('สลิปเก่าเกิน 24 ชั่วโมง');
    }
  }

  return {
    isValid: reasons.length === 0,
    reasons
  };
}
