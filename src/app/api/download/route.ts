import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  if (!url.startsWith('https://res.cloudinary.com/')) {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  const match = url.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/);
  if (!match) return NextResponse.json({ error: 'Cannot parse URL' }, { status: 400 });

  const publicId = match[1];
  const rawName = publicId.split('/').pop() || 'portfolio';
  const filename = rawName.toLowerCase().endsWith('.pdf') ? rawName : `${rawName}.pdf`;

  // Approach 1: private_download_url — goes through API endpoint, not CDN
  // so CDN auth/access_mode restrictions don't apply
  try {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const downloadUrl = cloudinary.utils.private_download_url(publicId, '', {
      resource_type: 'raw',
      type: 'upload',
      expires_at: expiresAt,
      attachment: true,
    });
    console.log('[download] private_download_url:', downloadUrl);

    const res = await fetch(downloadUrl);
    console.log('[download] private_download status:', res.status);

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': buffer.byteLength.toString(),
          'Cache-Control': 'no-store',
        },
      });
    }
    console.warn('[download] private_download failed:', res.status, await res.text().catch(() => ''));
  } catch (err) {
    console.warn('[download] private_download_url error:', err);
  }

  // Approach 2: explicit() to update access_mode to public + invalidate CDN, then fetch
  try {
    console.log('[download] trying explicit() to update access_mode...');
    const explicit = await cloudinary.uploader.explicit(publicId, {
      resource_type: 'raw',
      type: 'upload',
      access_mode: 'public',
      invalidate: true,
    });
    console.log('[download] explicit result secure_url:', explicit.secure_url);

    const res2 = await fetch(explicit.secure_url);
    console.log('[download] explicit fetch status:', res2.status);

    if (res2.ok) {
      const buffer = await res2.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': buffer.byteLength.toString(),
          'Cache-Control': 'no-store',
        },
      });
    }
    console.warn('[download] explicit fetch still failed:', res2.status);
  } catch (err) {
    console.warn('[download] explicit() error:', err);
  }

  // Approach 3: api.resource() to confirm existence, then private_download without format
  try {
    const info = await cloudinary.api.resource(publicId, { resource_type: 'raw' });
    console.log('[download] resource format:', info.format, 'access_mode:', info.access_mode, 'type:', info.type);

    // Try private_download with detected format
    const fmt = info.format || '';
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const downloadUrl2 = cloudinary.utils.private_download_url(publicId, fmt, {
      resource_type: 'raw',
      type: info.type || 'upload',
      expires_at: expiresAt,
    });
    console.log('[download] private_download_url v2:', downloadUrl2);

    const res3 = await fetch(downloadUrl2);
    console.log('[download] private_download v2 status:', res3.status);

    if (res3.ok) {
      const buffer = await res3.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': buffer.byteLength.toString(),
          'Cache-Control': 'no-store',
        },
      });
    }
  } catch (err) {
    console.warn('[download] approach 3 error:', err);
  }

  return NextResponse.json({ error: 'Could not fetch PDF from Cloudinary', publicId }, { status: 502 });
}
