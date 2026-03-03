// src/app/api/tags/route.ts
import { NextResponse } from 'next/server';
import { TagModel } from '@/lib/db/models/Tag';

export async function GET() {
    try {
        // Public fetch only gets active tags
        const tags = await TagModel.findAll(false);
        return NextResponse.json({ tags });
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
