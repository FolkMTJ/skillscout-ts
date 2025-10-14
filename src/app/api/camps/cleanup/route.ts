// src/app/api/camps/cleanup/route.ts
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

// DELETE /api/camps/cleanup - ลบค่ายที่มี slug ผิดปกติ
export async function DELETE() {
  try {
    const collection = await getCollection('camps');
    
    // ลบค่ายที่มี slug เป็น "-" หรือ "" หรือ null
    const result = await collection.deleteMany({
      $or: [
        { slug: "-" },
        { slug: "" },
        { slug: null },
      ]
    });

    return NextResponse.json({
      message: 'Cleanup successful',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup' },
      { status: 500 }
    );
  }
}
