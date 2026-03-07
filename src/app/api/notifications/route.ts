// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationModel } from '@/lib/db/models/Notification';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/notifications — ดึง notifications + สร้าง review_reminder แบบ on-demand
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email!;

    // On-demand: finalize ค่ายที่จบแล้ว (attended→completed, confirmed→absent)
    try {
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/camps/finalize`, { method: 'POST' });
    } catch (e) {
        console.error('finalize error (non-critical):', e);
    }

    // On-demand: ตรวจสอบค่ายที่จบแล้วและยังไม่ได้ review → สร้าง review_reminder

    try {
        await generateReviewReminders(userId, userEmail);
    } catch (e) {
        console.error('review reminder error', e);
    }

    const notifications = await NotificationModel.findByUser(userId);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/notifications — mark read
export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = session.user.id;

    if (body.markAll) {
        await NotificationModel.markAllRead(userId);
    } else if (body.id) {
        await NotificationModel.markRead(body.id);
    }

    return NextResponse.json({ success: true });
}

// ── helper: สร้าง review_reminder สำหรับค่ายที่จบแล้ว ──────────────────────────
async function generateReviewReminders(userId: string, userEmail: string) {
    const db = await getDatabase();
    const now = new Date();

    // 1. หาค่ายที่ attended แล้ว
    const registrations = await db.collection('registrations').find({
        $or: [
            { userId: new ObjectId(userId) },
            { userId: userId },
            { userEmail: userEmail },
        ],
        status: 'attended',
    }).toArray();

    if (registrations.length === 0) return;

    const campIds = registrations
        .map(r => {
            try { return new ObjectId(String(r.campId)); } catch { return null; }
        })
        .filter((id): id is ObjectId => id !== null);


    // 2. หาค่ายที่ endDate < now (จบแล้ว)
    const endedCamps = await db.collection('camps').find({
        _id: { $in: campIds },
        endDate: { $lt: now },
    }).toArray();

    for (const camp of endedCamps) {
        const campId = camp._id.toString();

        // ตรวจสอบว่า user review แล้วหรือยัง
        const hasReviewed = (camp.reviews || []).some(
            (r: { author: string; userId?: string }) =>
                r.author === userEmail || r.userId === userId
        );
        if (hasReviewed) continue;

        // ตรวจสอบว่ามี reminder นี้แล้วหรือยัง
        const alreadyExists = await NotificationModel.exists(userId, 'review_reminder', campId);
        if (alreadyExists) continue;

        await NotificationModel.create({
            userId,
            type: 'review_reminder',
            title: 'รีวิวค่ายของคุณ',
            message: `ค่าย "${camp.name}" จบแล้ว ✨ รีวิวความประทับใจของคุณเพื่อช่วยพัฒนา Discovery Path ด้วยนะ!`,
            campId,
            campName: camp.name,
        });
    }
}
