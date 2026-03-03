// src/app/api/admin/settings/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const col = await getCollection('settings');
    const [showcase, platform, site, contact, social, testimonials] = await Promise.all([
      col.findOne({ key: 'showcase' }),
      col.findOne({ key: 'platform' }),
      col.findOne({ key: 'site' }),
      col.findOne({ key: 'contact' }),
      col.findOne({ key: 'social' }),
      col.findOne({ key: 'testimonials' }),
    ]);
    return NextResponse.json({
      showcaseMode: showcase?.showcaseMode ?? false,
      showcaseName: showcase?.showcaseName ?? '',
      // Platform fee settings (DB values take precedence over env)
      platformPromptpayId: platform?.promptpayId ?? process.env.PLATFORM_PROMPTPAY_ID ?? '',
      platformAccountName: platform?.accountName ?? process.env.PLATFORM_ACCOUNT_NAME ?? 'SkillScout',
      platformFeePercent: platform?.feePercent ?? parseFloat(process.env.PLATFORM_FEE_PERCENT ?? '5'),
      platformEnabled: !!(platform?.promptpayId || process.env.PLATFORM_PROMPTPAY_ID),
      // Site settings
      visitorOffset: site?.visitorOffset ?? 59,
      // Contact settings
      contactEmail: contact?.email ?? 'contact@skillscout.com',
      contactPhone: contact?.phone ?? '02-xxx-xxxx',
      // Social settings
      socialFacebook: social?.facebook ?? '#',
      socialTwitter: social?.twitter ?? '#',
      socialInstagram: social?.instagram ?? '#',
      socialLinkedin: social?.linkedin ?? '#',
      socialGithub: social?.github ?? '#',
      // Testimonials
      testimonials: testimonials?.data ?? []
    });
  } catch {
    return NextResponse.json({
      showcaseMode: false,
      showcaseName: '',
      visitorOffset: 59,
      contactEmail: 'contact@skillscout.com',
      contactPhone: '02-xxx-xxxx',
      socialFacebook: '#',
      socialTwitter: '#',
      socialInstagram: '#',
      socialLinkedin: '#',
      socialGithub: '#',
      testimonials: []
    });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const col = await getCollection('settings');

    // Showcase settings
    if ('showcaseMode' in body) {
      await col.updateOne(
        { key: 'showcase' },
        { $set: { showcaseMode: Boolean(body.showcaseMode), showcaseName: String(body.showcaseName ?? ''), updatedAt: new Date() } },
        { upsert: true }
      );
    }

    // Site settings (visitor offset)
    if ('visitorOffset' in body) {
      await col.updateOne(
        { key: 'site' },
        { $set: { visitorOffset: parseInt(body.visitorOffset) || 0, updatedAt: new Date() } },
        { upsert: true }
      );
    }

    // Platform fee settings
    if ('platformPromptpayId' in body) {
      const feePercent = Math.max(0, Math.min(100, parseFloat(body.platformFeePercent) || 0));
      await col.updateOne(
        { key: 'platform' },
        {
          $set: {
            promptpayId: String(body.platformPromptpayId ?? '').trim(),
            accountName: String(body.platformAccountName ?? 'SkillScout').trim(),
            feePercent,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    // Contact settings
    if ('contactEmail' in body || 'contactPhone' in body) {
      await col.updateOne(
        { key: 'contact' },
        { $set: { email: String(body.contactEmail ?? ''), phone: String(body.contactPhone ?? ''), updatedAt: new Date() } },
        { upsert: true }
      );
    }

    // Social settings
    if ('socialFacebook' in body) {
      await col.updateOne(
        { key: 'social' },
        {
          $set: {
            facebook: String(body.socialFacebook ?? ''),
            twitter: String(body.socialTwitter ?? ''),
            instagram: String(body.socialInstagram ?? ''),
            linkedin: String(body.socialLinkedin ?? ''),
            github: String(body.socialGithub ?? ''),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }

    // Testimonials settings
    if ('testimonials' in body && Array.isArray(body.testimonials)) {
      await col.updateOne(
        { key: 'testimonials' },
        { $set: { data: body.testimonials, updatedAt: new Date() } },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
