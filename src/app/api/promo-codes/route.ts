// src/app/api/promo-codes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PromoCodeModel } from '@/lib/db/models/PromoCode';

// GET /api/promo-codes - ดึงรายการโปรโมชั่น
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizerId = searchParams.get('organizerId');

    console.log('🔍 GET Promo Codes - User:', {
      userId: session.user.id,
      role: session.user.role,
      organizerId
    });

    let promoCodes;

    if (session.user.role === 'admin') {
      // Admin ดูได้ทั้งหมด
      if (organizerId) {
        // ดูโค้ดของ organizer คนหนึ่ง
        console.log('🔍 Admin viewing organizer codes:', organizerId);
        promoCodes = await PromoCodeModel.findByOrganizer(organizerId);
      } else {
        // ดูทั้งหมด
        console.log('🔍 Admin viewing all codes');
        promoCodes = await PromoCodeModel.findAll();
      }
    } else if (session.user.role === 'organizer') {
      // Organizer ดูได้แค่ของตัวเอง
      console.log('🔍 Organizer viewing own codes:', session.user.id);
      promoCodes = await PromoCodeModel.findByOrganizer(session.user.id);
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log('✅ Found', promoCodes.length, 'promo codes');
    console.log('Codes:', promoCodes.map(p => ({ code: p.code, createdBy: p.createdBy })));

    return NextResponse.json(promoCodes);
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    );
  }
}

// POST /api/promo-codes - สร้างโปรโมชั่นใหม่
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // เฉพาะ admin และ organizer
    if (session.user.role !== 'admin' && session.user.role !== 'organizer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      code,
      discountType,
      discountValue,
      maxUses,
      validFrom,
      validUntil,
      applicableToAllCamps,
      applicableCamps,
      description,
      minPurchaseAmount,
      maxDiscountAmount,
    } = body;

    // Validation
    if (!code || !discountType || !discountValue || !maxUses || !validFrom || !validUntil) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ถ้าเป็น organizer ต้องระบุค่ายที่ใช้ได้
    if (session.user.role === 'organizer') {
      if (applicableToAllCamps) {
        return NextResponse.json(
          { error: 'Organizers cannot create site-wide promo codes' },
          { status: 403 }
        );
      }
      if (!applicableCamps || applicableCamps.length === 0) {
        return NextResponse.json(
          { error: 'Please select at least one camp' },
          { status: 400 }
        );
      }

      // ตรวจสอบว่าค่ายทั้งหมดเป็นของ organizer คนนี้
      const { CampModel } = await import('@/lib/db/models');
      for (const campId of applicableCamps) {
        const camp = await CampModel.findById(campId);
        if (!camp || camp.organizerId !== session.user.id) {
          return NextResponse.json(
            { error: 'You can only create promo codes for your own camps' },
            { status: 403 }
          );
        }
      }
    }

    // สร้างโปรโมชั่น
    console.log('🚀 Creating promo code with:', {
      code,
      createdBy: session.user.id,
      createdByRole: session.user.role,
      applicableCamps: applicableCamps || []
    });
    
    const promoCode = await PromoCodeModel.create(
      {
        code,
        discountType,
        discountValue: parseFloat(discountValue),
        maxUses: parseInt(maxUses),
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        applicableToAllCamps: applicableToAllCamps || false,
        applicableCamps: applicableCamps || [],
        description,
        minPurchaseAmount: minPurchaseAmount ? parseFloat(minPurchaseAmount) : undefined,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : undefined,
      },
      session.user.id,
      session.user.role as 'admin' | 'organizer'
    );

    console.log('✅ Promo code created successfully:', promoCode);

    return NextResponse.json(promoCode, { status: 201 });
  } catch (error) {
    console.error('Error creating promo code:', error);
    
    // ตรวจสอบ duplicate code
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Promo code already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create promo code' },
      { status: 500 }
    );
  }
}
