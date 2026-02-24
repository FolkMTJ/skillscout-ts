// src/app/api/share/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json() as { imageBase64: string };
    if (!imageBase64) return NextResponse.json({ error: 'No image' }, { status: 400 });

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload(
        imageBase64,
        {
          folder: 'skillscout/share',
          resource_type: 'image',
          format: 'png',
          // หมดอายุใน 1 ชั่วโมง (optional, ลบ invalidate ถ้าไม่ต้องการ)
        },
        (error, res) => {
          if (error || !res) reject(error);
          else resolve(res as { secure_url: string });
        }
      );
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
