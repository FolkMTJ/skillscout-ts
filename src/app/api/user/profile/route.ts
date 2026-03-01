// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserModel } from '@/lib/db/models';
import { isAdminRole } from '@/lib/auth-check';

// GET - ดึงข้อมูลโปรไฟล์
export async function GET() {
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

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}

// PATCH - อัปเดตโปรไฟล์
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      phone,
      lineId,
      bio,
      organization,
      address,
      province,
      district,
      profileImage,
    } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'กรุณากรอกชื่อ' },
        { status: 400 }
      );
    }

    const user = await UserModel.findByEmail(session.user.email);

    if (!user || !user._id) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลผู้ใช้' },
        { status: 404 }
      );
    }

    // Update user profile
    const success = await UserModel.update(user._id.toString(), {
      name: name.trim(),
      phone: phone?.trim() || undefined,
      lineId: lineId?.trim() || undefined,
      bio: bio?.trim() || undefined,
      organization: organization?.trim() || undefined,
      address: address?.trim() || undefined,
      province: province?.trim() || undefined,
      district: district?.trim() || undefined,
      profileImage: profileImage || undefined,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'ไม่สามารถอัปเดตข้อมูลได้' },
        { status: 500 }
      );
    }

    // Fetch updated user
    const updatedUser = await UserModel.findByEmail(session.user.email);

    return NextResponse.json({
      success: true,
      message: 'อัปเดตโปรไฟล์สำเร็จ',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์' },
      { status: 500 }
    );
  }
}

// DELETE - ลบบัญชี
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    const user = await UserModel.findByEmail(session.user.email);

    if (!user || !user._id) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลผู้ใช้' },
        { status: 404 }
      );
    }

    // ป้องกันไม่ให้ลบ admin/super_admin account
    if (isAdminRole(user.role)) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบบัญชี Admin ได้' },
        { status: 403 }
      );
    }

    // ลบบัญชี
    const success = await UserModel.delete(user._id.toString());

    if (!success) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบบัญชีได้' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ลบบัญชีสำเร็จ',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบบัญชี' },
      { status: 500 }
    );
  }
}
