// src/app/api/camps/finalize/route.ts
// เรียกหลังค่ายจบ: attended → completed, confirmed (ไม่สแกน QR) → absent
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST() {
    try {
        const db = await getDatabase();
        const now = new Date();

        // หาค่ายทั้งหมดที่จบแล้ว (endDate < now)
        const endedCamps = await db.collection('camps').find({
            endDate: { $lt: now },
            status: { $ne: 'finalized' },
        }).toArray();

        let completedCount = 0;
        let absentCount = 0;

        for (const camp of endedCamps) {
            const campId = camp._id;

            // attended → completed (เข้าร่วมจริง รอ organizer push จบค่าย)
            // ในกรณีนี้: ถ้าค่ายจบแล้วและ endDate ผ่านมาแล้ว 1 วัน → auto-complete attended
            const oneDayAfterEnd = new Date(camp.endDate);
            oneDayAfterEnd.setDate(oneDayAfterEnd.getDate() + 1);

            if (now >= oneDayAfterEnd) {
                const completedResult = await db.collection('registrations').updateMany(
                    { campId: campId, status: 'attended' } as never,
                    { $set: { status: 'completed', completedAt: now } }
                );
                completedCount += completedResult.modifiedCount;

                // confirmed แต่ไม่ได้สแกน QR → absent
                const absentResult = await db.collection('registrations').updateMany(
                    { campId: campId, status: { $in: ['confirmed', 'approved'] } } as never,
                    { $set: { status: 'absent', absentAt: now } }
                );
                absentCount += absentResult.modifiedCount;
            }
        }

        return NextResponse.json({
            success: true,
            completed: completedCount,
            absent: absentCount,
            campsProcessed: endedCamps.length,
        });
    } catch (error) {
        console.error('Finalize error:', error);
        return NextResponse.json({ error: 'Failed to finalize camps' }, { status: 500 });
    }
}

// GET — เรียกแบบ on-demand trigger (เช่น จาก notifications, หรือ admin panel)
export async function GET() {
    return POST();
}
