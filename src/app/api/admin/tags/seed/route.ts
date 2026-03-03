// src/app/api/admin/tags/seed/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminRole } from '@/lib/auth-check';
import { TagModel } from '@/lib/db/models/Tag';
import { STANDARD_TAGS } from '@/data/tags';

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !isAdminRole(session.user?.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const count = await TagModel.count();
        if (count > 0) {
            return NextResponse.json({ message: 'Tags collection is not empty. Seed skipped.', count });
        }

        const now = new Date();
        const docs = STANDARD_TAGS.map(tag => ({
            id: tag.id,
            name: tag.name,
            nameTh: tag.nameTh,
            category: tag.category,
            riasecMapping: tag.riasecMapping,
            isCore: tag.isCore,
            isActive: true,
            createdAt: now,
            updatedAt: now,
            createdBy: session.user.id
        }));

        const success = await TagModel.insertMany(docs);
        if (!success) {
            return NextResponse.json({ error: 'Failed to insert standard tags' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Seed successful', count: docs.length });
    } catch (error) {
        console.error('Error seeding tags:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
