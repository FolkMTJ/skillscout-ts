import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload/portfolio
// Server-side upload using API credentials (not upload preset), ensuring access_mode: public
export async function POST(request: NextRequest) {
  try {
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
      resource_type: 'raw',
      folder: 'portfolios',
      access_mode: 'public',
      type: 'upload',
      use_filename: true,
      unique_filename: true,
    });

    console.log('[upload/portfolio] uploaded:', result.public_id, 'access_mode:', result.access_mode);
    return NextResponse.json({ secure_url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error('[upload/portfolio] error:', err);
    return NextResponse.json({ error: 'Upload failed', detail: String(err) }, { status: 500 });
  }
}
