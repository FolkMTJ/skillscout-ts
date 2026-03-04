import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'super_admin' && session.user?.role !== 'organizer')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const form = await request.formData();
        const file = form.get('file') as File | null;
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload as base64 data URI using API credentials (bypasses upload preset restrictions)
        const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

        const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'avatars',
            access_mode: 'public',
            type: 'upload',
            use_filename: true,
            unique_filename: true,
        });

        console.log('[upload] uploaded:', result.public_id);
        return NextResponse.json({ url: result.secure_url, public_id: result.public_id });
    } catch (err) {
        console.error('[upload] error:', err);
        return NextResponse.json({ error: 'Upload failed', detail: String(err) }, { status: 500 });
    }
}
