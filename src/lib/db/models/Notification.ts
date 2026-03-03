// src/lib/db/models/Notification.ts
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export type NotificationType =
    | 'portfolio_approved'
    | 'portfolio_rejected'
    | 'camp_confirmed'
    | 'review_reminder';

export interface Notification {
    _id?: ObjectId | string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    campId?: string;
    campName?: string;
    registrationId?: string;
    isRead: boolean;
    createdAt: Date;
}

export const NotificationModel = {
    async create(data: Omit<Notification, '_id' | 'isRead' | 'createdAt'>): Promise<Notification> {
        const db = await getDatabase();
        const col = db.collection<Notification>('notifications');
        const doc: Notification = { ...data, isRead: false, createdAt: new Date() };
        const result = await col.insertOne(doc as never);
        return { ...doc, _id: result.insertedId };
    },

    async findByUser(userId: string, limit = 30): Promise<Notification[]> {
        const db = await getDatabase();
        const col = db.collection<Notification>('notifications');
        return col
            .find({ userId } as never)
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray() as Promise<Notification[]>;
    },

    async countUnread(userId: string): Promise<number> {
        const db = await getDatabase();
        const col = db.collection<Notification>('notifications');
        return col.countDocuments({ userId, isRead: false } as never);
    },

    async markRead(notificationId: string): Promise<void> {
        const db = await getDatabase();
        const col = db.collection<Notification>('notifications');
        await col.updateOne(
            { _id: new ObjectId(notificationId) } as never,
            { $set: { isRead: true } }
        );
    },

    async markAllRead(userId: string): Promise<void> {
        const db = await getDatabase();
        const col = db.collection<Notification>('notifications');
        await col.updateMany({ userId, isRead: false } as never, { $set: { isRead: true } });
    },

    /** ตรวจสอบว่ามี notification type นี้สำหรับ user+camp อยู่แล้วหรือไม่ (ป้องกัน duplicate) */
    async exists(userId: string, type: NotificationType, campId?: string): Promise<boolean> {
        const db = await getDatabase();
        const col = db.collection<Notification>('notifications');
        const query: Record<string, unknown> = { userId, type };
        if (campId) query.campId = campId;
        const count = await col.countDocuments(query as never);
        return count > 0;
    },
};
