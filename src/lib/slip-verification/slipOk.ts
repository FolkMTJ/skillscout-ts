// KBank Slip Verification API
// Docs: https://developer.kasikornbank.com/
export async function verifySlipWithKBank(
  imageBase64: string
): Promise<SlipVerificationResult> {
  try {
    const apiKey = process.env.KBANK_API_KEY;
    const apiSecret = process.env.KBANK_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      console.warn('KBank API credentials not configured');
      return {
        success: false,
        verified: false,
        error: 'KBank API credentials not configured'
      };
    }

    // Step 1: Get access token
    const tokenResponse = await fetch('https://openapi.kasikornbank.com/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token request failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Step 2: Verify slip
    const verifyResponse = await fetch('https://openapi.kasikornbank.com/v2/slipverify/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        image: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
      }),
    });

    if (!verifyResponse.ok) {
      throw new Error(`KBank API error: ${verifyResponse.status}`);
    }

    const data = await verifyResponse.json();

    if (data.status === 'success' && data.data) {
      const slip = data.data;
      return {
        success: true,
        verified: true,
        amount: parseFloat(slip.amount?.replace(/,/g, '') || '0'),
        date: slip.transDate,
        time: slip.transTime,
        sender: {
          name: slip.sender?.name,
          account: slip.sender?.account?.no,
        },
        receiver: {
          name: slip.receiver?.name,
          account: slip.receiver?.account?.no,
        },
        transRef: slip.transRef,
      };
    }

    return {
      success: false,
      verified: false,
      error: data.message || 'Unable to verify slip'
    };

  } catch (error) {
    console.error('Error verifying with KBank:', error);
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Thai QR Promptpay API - ฟรี!
// ใช้ API จาก https://qr-prompt-pay.vercel.app/ 
// หรือ https://github.com/dtinth/promptpay-qr
export async function verifySlipWithThaiQR(
  imageUrl: string
): Promise<SlipVerificationResult> {
  try {
    // ใช้ Thai QR Payment API (ฟรี 100%)
    const response = await fetch('https://api.thai-qr-payment.com/v2/slip/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: imageUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      const slip = data.data;
      return {
        success: true,
        verified: true,
        amount: parseFloat(slip.amount?.replace(/,/g, '') || '0'),
        date: slip.transactionDate,
        time: slip.transactionTime,
        sender: {
          name: slip.sender?.displayName || slip.sender?.name,
          account: slip.sender?.account,
        },
        receiver: {
          name: slip.receiver?.displayName || slip.receiver?.name,
          account: slip.receiver?.account,
        },
        transRef: slip.transactionId || slip.ref,
      };
    }

    return {
      success: false,
      verified: false,
      error: 'Unable to read slip data'
    };

  } catch (error) {
    console.error('Error verifying with Thai QR:', error);
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// SlipPocket API - ใช้งานง่าย ราคาถูก มี Free Tier
// Docs: https://slip.pk/docs
export async function verifySlipWithSlipPocket(
  imageBase64: string
): Promise<SlipVerificationResult> {
  try {
    const apiKey = process.env.SLIP_POCKET_API_KEY;
    
    if (!apiKey) {
      console.warn('SlipPocket API key not configured');
      return {
        success: false,
        verified: false,
        error: 'API key not configured'
      };
    }

    const response = await fetch('https://api.slip.pk/v1/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
      }),
    });

    if (!response.ok) {
      throw new Error(`SlipPocket API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      const slip = data.data;
      return {
        success: true,
        verified: true,
        amount: parseFloat(slip.amount || '0'),
        date: slip.transDate,
        time: slip.transTime,
        sender: {
          name: slip.sender?.name,
          account: slip.sender?.account,
        },
        receiver: {
          name: slip.receiver?.name,
          account: slip.receiver?.account,
        },
        transRef: slip.refNo,
      };
    }

    return {
      success: false,
      verified: false,
      error: 'Unable to verify slip'
    };

  } catch (error) {
    console.error('Error verifying with SlipPocket:', error);
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Promptpay Slip Verification (ใช้งานได้จริง ไม่ต้อง API Key)
export async function verifySlipWithPromptpay(
  imageBase64: string
): Promise<SlipVerificationResult> {
  try {
    // ใช้ API จาก slip-verify.com (ฟรี)
    const apiUrl = 'https://api.slip-verify.com/verify';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      return {
        success: true,
        verified: true,
        amount: parseFloat(data.data.amount || '0'),
        date: data.data.date,
        time: data.data.time,
        sender: {
          name: data.data.sender?.name,
          account: data.data.sender?.account,
        },
        receiver: {
          name: data.data.receiver?.name,
          account: data.data.receiver?.account,
        },
        transRef: data.data.ref,
      };
    }

    return {
      success: false,
      verified: false,
      error: 'Unable to verify slip'
    };

  } catch (error) {
    console.error('Error verifying slip with Promptpay:', error);
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

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
      console.warn('SlipOK API key not configured - auto verification disabled');
      return {
        success: false,
        verified: false,
        error: 'Auto verification disabled. Waiting for manual review.'
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
