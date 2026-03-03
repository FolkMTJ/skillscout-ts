// src/app/api/admin/tags/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminRole } from '@/lib/auth-check';
import { TagModel } from '@/lib/db/models/Tag';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !isAdminRole(session.user?.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const updates = await request.json();

        const tag = await TagModel.update(id, updates);
        if (!tag) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }

        return NextResponse.json({ tag });
    } catch (error) {
        console.error('Error updating tag:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !isAdminRole(session.user?.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;

        // Ensure it's not a core tag if there are rules against deleting core tags
        // Optional check depending on business logic. 
        // We'll trust admin in this case.

        const success = await TagModel.delete(id);
        if (!success) {
            return NextResponse.json({ error: 'Tag not found or could not be deleted' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tag:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
