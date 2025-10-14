// src/app/api/payment/validate-promo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PromoCodeModel } from '@/lib/db/models/PromoCode';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, amount, campId } = body;

    if (!code || !amount) {
      return NextResponse.json(
        { error: 'Code and amount are required' },
        { status: 400 }
      );
    }

    const result = await PromoCodeModel.validate(code, parseFloat(amount), campId);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
