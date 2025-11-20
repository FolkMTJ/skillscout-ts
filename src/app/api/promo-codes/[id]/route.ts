// src/app/api/promo-codes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PromoCodeModel } from '@/lib/db/models/PromoCode';

interface RouteParams {
  params: {
    id: string;
  };
}

// PATCH /api/promo-codes/[id] - อัพเดทโปรโมชั่น
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // ดึงข้อมูลโปรโมชั่นเดิม
    const promoCode = await PromoCodeModel.findById(id);
    if (!promoCode) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }

    // ตรวจสอบสิทธิ์
    if (session.user.role !== 'admin' && promoCode.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // อัพเดท
    const updated = await PromoCodeModel.update(id, body);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to update promo code' },
      { status: 500 }
    );
  }
}

// DELETE /api/promo-codes/[id] - ลบโปรโมชั่น
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // ดึงข้อมูลโปรโมชั่นเดิม
    const promoCode = await PromoCodeModel.findById(id);
    if (!promoCode) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }

    // ตรวจสอบสิทธิ์
    if (session.user.role !== 'admin' && promoCode.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ลบ
    await PromoCodeModel.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json(
      { error: 'Failed to delete promo code' },
      { status: 500 }
    );
  }
}
