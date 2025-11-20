// src/app/api/promo-codes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PromoCodeModel, UserModel, CampModel } from '@/lib/db/models';
import { DiscountType } from '@/types';

// GET - ดึงรายการ promo codes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    const user = await UserModel.findByEmail(session.user.email);

    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลผู้ใช้' },
        { status: 404 }
      );
    }

    // Admin เห็นทั้งหมด, Organizer เห็นแค่ของตัวเอง
    let promoCodes;
    if (user.role === 'admin') {
      promoCodes = await PromoCodeModel.findAll();
    } else if (user.role === 'organizer') {
      promoCodes = await PromoCodeModel.findByCreator(user._id);
    } else {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      promoCodes,
    });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}

// POST - สร้าง promo code ใหม่
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    const user = await UserModel.findByEmail(session.user.email);

    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลผู้ใช้' },
        { status: 404 }
      );
    }

    if (user.role !== 'admin' && user.role !== 'organizer') {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์สร้างโค้ด' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      code,
      discountType,
      discountValue,
      minAmount,
      maxDiscount,
      usageLimit,
      validFrom,
      validUntil,
      isActive,
      applicableCamps,
    } = body;

    // Validation
    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: 'กรุณากรอกรหัสโปรโมชั่น' },
        { status: 400 }
      );
    }

    if (!discountType || !Object.values(DiscountType).includes(discountType)) {
      return NextResponse.json(
        { error: 'ประเภทส่วนลดไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    if (!discountValue || discountValue <= 0) {
      return NextResponse.json(
        { error: 'มูลค่าส่วนลดต้องมากกว่า 0' },
        { status: 400 }
      );
    }

    if (discountType === DiscountType.PERCENTAGE && discountValue > 100) {
      return NextResponse.json(
        { error: 'เปอร์เซ็นต์ส่วนลดไม่เกิน 100%' },
        { status: 400 }
      );
    }

    if (!validFrom || !validUntil) {
      return NextResponse.json(
        { error: 'กรุณาระบุวันที่ใช้งาน' },
        { status: 400 }
      );
    }

    // Organizer ต้องระบุค่ายที่ใช้ได้
    if (user.role === 'organizer') {
      if (!applicableCamps || applicableCamps.length === 0) {
        return NextResponse.json(
          { error: 'กรุณาเลือกค่ายที่ใช้โค้ดได้' },
          { status: 400 }
        );
      }

      // ตรวจสอบว่าค่ายทั้งหมดเป็นของ Organizer คนนี้
      for (const campId of applicableCamps) {
        const camp = await CampModel.findById(campId);
        if (!camp || camp.organizerId !== user._id) {
          return NextResponse.json(
            { error: 'คุณสามารถสร้างโค้ดได้เฉพาะค่ายของตัวเองเท่านั้น' },
            { status: 403 }
          );
        }
      }
    }

    // Admin สามารถสร้างโค้ดใช้ได้ทั้งหมด (applicableCamps = null หรือ [])
    // Organizer ต้องระบุค่าย

    const promoCode = await PromoCodeModel.create({
      code: code.trim(),
      discountType,
      discountValue,
      minAmount: minAmount || undefined,
      maxDiscount: maxDiscount || undefined,
      usageLimit: usageLimit || undefined,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      isActive: isActive !== false,
      applicableCamps: user.role === 'admin' && (!applicableCamps || applicableCamps.length === 0) 
        ? undefined 
        : applicableCamps,
      createdBy: user._id,
    });

    return NextResponse.json({
      success: true,
      message: 'สร้างโค้ดสำเร็จ',
      promoCode,
    });
  } catch (error) {
    console.error('Error creating promo code:', error);
    
    if (error instanceof Error && error.message.includes('มีอยู่แล้ว')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
