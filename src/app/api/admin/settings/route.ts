// src/app/api/admin/settings/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const col = await getCollection('settings');
    const [showcase, platform] = await Promise.all([
      col.findOne({ key: 'showcase' }),
      col.findOne({ key: 'platform' }),
    ]);
    return NextResponse.json({
      showcaseMode: showcase?.showcaseMode ?? false,
      showcaseName: showcase?.showcaseName ?? '',
      // Platform fee settings (DB values take precedence over env)
      platformPromptpayId: platform?.promptpayId ?? process.env.PLATFORM_PROMPTPAY_ID ?? '',
      platformAccountName: platform?.accountName ?? process.env.PLATFORM_ACCOUNT_NAME ?? 'SkillScout',
      platformFeePercent: platform?.feePercent ?? parseFloat(process.env.PLATFORM_FEE_PERCENT ?? '5'),
      platformEnabled: !!(platform?.promptpayId || process.env.PLATFORM_PROMPTPAY_ID),
    });
  } catch {
    return NextResponse.json({ showcaseMode: false, showcaseName: '' });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== 'admin') {
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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
