// src/app/api/camps/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CampModel } from '@/lib/db/models/Camp';
import { Camp, CampStatus } from '@/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { adminId, action } = body;

    console.log('=== CAMP APPROVAL ===');
    console.log('Camp ID:', id);
    console.log('Action:', action);
    console.log('Admin ID:', adminId);

    const camp = await CampModel.findById(id);
    
    if (!camp) {
      return NextResponse.json(
        { error: 'Camp not found' },
        { status: 404 }
      );
    }

    const verificationResult = await autoVerifyCamp(camp);
    
    if (action === 'approve') {
      await CampModel.update(id, { 
        status: CampStatus.ACTIVE,
      });

      console.log('✓ Camp approved');

      return NextResponse.json({
        success: true,
        message: 'Camp approved successfully',
        verificationScore: verificationResult.score,
        issues: verificationResult.issues
      });
    } else if (action === 'reject') {
      const { reason } = body;
      
      await CampModel.update(id, { 
        status: CampStatus.REJECTED,
      });

      console.log('✗ Camp rejected');

      return NextResponse.json({
        success: true,
        message: 'Camp rejected',
        reason
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error approving camp:', error);
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    );
  }
}

async function autoVerifyCamp(camp: Camp) {
  const issues: string[] = [];
  let score = 100;

  if (!camp.name || camp.name.length < 5) {
    issues.push('ชื่อค่ายสั้นเกินไป (ควรมากกว่า 5 ตัวอักษร)');
    score -= 10;
  }

  if (!camp.description || camp.description.length < 50) {
    issues.push('คำอธิบายสั้นเกินไป (ควรมากกว่า 50 ตัวอักษร)');
    score -= 15;
  }

  if (!camp.image || !camp.image.startsWith('http')) {
    issues.push('ไม่มีรูปภาพหรือ URL ไม่ถูกต้อง');
    score -= 10;
  }

  if (camp.startDate && camp.endDate) {
    const start = new Date(camp.startDate);
    const end = new Date(camp.endDate);
    const now = new Date();

    if (start < now) {
      issues.push('วันเริ่มค่ายผ่านมาแล้ว');
      score -= 20;
    }

    if (end <= start) {
      issues.push('วันจบค่ายต้องหลังวันเริ่ม');
      score -= 15;
    }
  }

  if (!camp.capacity || camp.capacity < 1) {
    issues.push('จำนวนที่รับไม่ถูกต้อง');
    score -= 10;
  }

  if (!camp.location || camp.location.length < 5) {
    issues.push('สถานที่จัดงานไม่ชัดเจน');
    score -= 10;
  }

  if (!camp.organizerEmail) {
    issues.push('ไม่มีข้อมูลติดต่อผู้จัด');
    score -= 5;
  }

  const inappropriateWords = ['หลอกลวง', 'โกง', 'ฉ้อโกง'];
  const text = `${camp.name} ${camp.description}`.toLowerCase();
  
  for (const word of inappropriateWords) {
    if (text.includes(word)) {
      issues.push(`พบคำไม่เหมาะสม: "${word}"`);
      score -= 30;
    }
  }

  console.log('Auto-verification score:', score);
  console.log('Issues found:', issues.length);

  return {
    score: Math.max(0, score),
    issues,
    passed: score >= 70
  };
}
