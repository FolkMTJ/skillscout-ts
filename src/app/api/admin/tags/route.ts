// src/app/api/admin/tags/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminRole } from '@/lib/auth-check';
import { TagModel, TagDoc } from '@/lib/db/models/Tag';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !isAdminRole(session.user?.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const tags = await TagModel.findAll(true); // admin sees all, including inactive
        return NextResponse.json({ tags });
    } catch (error) {
        console.error('Error fetching tags in admin:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !isAdminRole(session.user?.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json() as Partial<TagDoc>;
        const { name, nameTh, category, riasecMapping, isCore, isActive } = body;

        if (!name || !nameTh || !category || !riasecMapping) {
            return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
        }

        const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        // Check if slug already exists
        const existing = await TagModel.findBySlug(id);
        if (existing) {
            return NextResponse.json({ error: 'Tag นี้มีอยู่แล้ว' }, { status: 400 });
        }

        const tag = await TagModel.create({
            id,
            name,
            nameTh,
            category,
            riasecMapping,
            isCore: isCore ?? false,
            isActive: isActive ?? true,
            createdBy: session.user.id
        });

        return NextResponse.json({ tag }, { status: 201 });
    } catch (error) {
        console.error('Error creating tag:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
