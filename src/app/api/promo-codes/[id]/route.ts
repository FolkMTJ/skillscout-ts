// src/app/api/promo-codes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PromoCodeModel, UserModel, CampModel } from '@/lib/db/models';
import { DiscountType } from '@/types';

// PATCH - แก้ไข promo code
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'คุณไม่มีสิทธิ์แก้ไข' },
        { status: 403 }
      );
    }

    const promoCode = await PromoCodeModel.findById(params.id);

    if (!promoCode) {
      return NextResponse.json(
        { error: 'ไม่พบโค้ดนี้' },
        { status: 404 }
      );
    }

    // Organizer สามารถแก้ไขได้เฉพาะของตัวเอง
    if (user.role === 'organizer' && promoCode.createdBy !== user._id) {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์แก้ไขโค้ดนี้' },
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
    if (discountType && !Object.values(DiscountType).includes(discountType)) {
      return NextResponse.json(
        { error: 'ประเภทส่วนลดไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    if (discountValue !== undefined && discountValue <= 0) {
      return NextResponse.json(
        { error: 'มูลค่าส่วนลดต้องมากกว่า 0' },
        { status: 400 }
      );
    }

    if (discountType === DiscountType.PERCENTAGE && discountValue && discountValue > 100) {
      return NextResponse.json(
        { error: 'เปอร์เซ็นต์ส่วนลดไม่เกิน 100%' },
        { status: 400 }
      );
    }

    // Organizer ต้องตรวจสอบว่าค่ายเป็นของตัวเอง
    if (user.role === 'organizer' && applicableCamps) {
      for (const campId of applicableCamps) {
        const camp = await CampModel.findById(campId);
        if (!camp || camp.organizerId !== user._id) {
          return NextResponse.json(
            { error: 'คุณสามารถกำหนดค่ายได้เฉพาะค่ายของตัวเองเท่านั้น' },
            { status: 403 }
          );
        }
      }
    }

    const updates: any = {};
    if (code !== undefined) updates.code = code;
    if (discountType !== undefined) updates.discountType = discountType;
    if (discountValue !== undefined) updates.discountValue = discountValue;
    if (minAmount !== undefined) updates.minAmount = minAmount;
    if (maxDiscount !== undefined) updates.maxDiscount = maxDiscount;
    if (usageLimit !== undefined) updates.usageLimit = usageLimit;
    if (validFrom !== undefined) updates.validFrom = new Date(validFrom);
    if (validUntil !== undefined) updates.validUntil = new Date(validUntil);
    if (isActive !== undefined) updates.isActive = isActive;
    if (applicableCamps !== undefined) updates.applicableCamps = applicableCamps;

    const success = await PromoCodeModel.update(params.id, updates);

    if (!success) {
      return NextResponse.json(
        { error: 'ไม่สามารถแก้ไขได้' },
        { status: 500 }
      );
    }

    const updatedPromoCode = await PromoCodeModel.findById(params.id);

    return NextResponse.json({
      success: true,
      message: 'แก้ไขโค้ดสำเร็จ',
      promoCode: updatedPromoCode,
    });
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}

// DELETE - ลบ promo code
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'คุณไม่มีสิทธิ์ลบ' },
        { status: 403 }
      );
    }

    const promoCode = await PromoCodeModel.findById(params.id);

    if (!promoCode) {
      return NextResponse.json(
        { error: 'ไม่พบโค้ดนี้' },
        { status: 404 }
      );
    }

    // Organizer สามารถลบได้เฉพาะของตัวเอง
    if (user.role === 'organizer' && promoCode.createdBy !== user._id) {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์ลบโค้ดนี้' },
        { status: 403 }
      );
    }

    const success = await PromoCodeModel.delete(params.id);

    if (!success) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบได้' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ลบโค้ดสำเร็จ',
    });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
