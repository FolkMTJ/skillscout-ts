// src/app/api/path-finder/careers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { IT_CAREERS, getCareersByTags } from '@/data/path-finder';
import { RegistrationModel } from '@/lib/db/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { STANDARD_TAGS } from '@/data/tags';

/**
 * GET /api/path-finder/careers
 * ดึงรายการอาชีพทั้งหมด หรือกรองตาม query params
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const careerId = searchParams.get('id');
    const filterByTags = searchParams.get('filterByTags'); // 'true' = ใช้ tags จากค่ายที่เข้าร่วม

    // ถ้าขอข้อมูลอาชีพเฉพาะ
    if (careerId) {
      const career = IT_CAREERS.find(c => c.id === careerId);
      if (!career) {
        return NextResponse.json(
          { error: 'Career not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, career });
    }

    // ถ้าต้องการกรองตาม tags
    if (filterByTags === 'true') {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // ดึงค่ายที่ user เข้าร่วมแล้ว (status = "attended")
      const registrations = await RegistrationModel.findByUserId(session.user.id);
      const attendedRegistrations = registrations.filter(reg => reg.status === 'attended');

      // รวม tags จากค่ายที่เข้าร่วม
      const userTags = new Set<string>();
      
      // สมมติว่า registration มี campId, ต้องดึง camp เพื่อเอา tags
      // (ถ้ายังไม่มีการเก็บ tags ใน registration ต้องไปดึงจาก CampModel)
      
      // ตอนนี้ให้ส่ง all careers ไปก่อน แล้วค่อยกรองใน client
      return NextResponse.json({
        success: true,
        careers: IT_CAREERS,
        message: 'Tag-based filtering requires camp tags implementation',
      });
    }

    // ส่งอาชีพทั้งหมด
    return NextResponse.json({
      success: true,
      careers: IT_CAREERS,
    });
  } catch (error) {
    console.error('Error fetching careers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch careers' },
      { status: 500 }
    );
  }
}
