// src/lib/platformSettings.ts
// Helper to read platform fee settings — DB first, env fallback
import { getCollection } from '@/lib/mongodb';

export interface PlatformSettings {
  promptpayId: string;
  accountName: string;
  feePercent: number;
  enabled: boolean;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const col = await getCollection('settings');
    const doc = await col.findOne({ key: 'platform' });

    const promptpayId = (doc?.promptpayId as string | undefined) || process.env.PLATFORM_PROMPTPAY_ID || '';
    const accountName = (doc?.accountName as string | undefined) || process.env.PLATFORM_ACCOUNT_NAME || 'SkillScout';
    const feePercent = (doc?.feePercent as number | undefined) ?? parseFloat(process.env.PLATFORM_FEE_PERCENT || '5');

    return {
      promptpayId,
      accountName,
      feePercent,
      enabled: !!promptpayId,
    };
  } catch {
    // Fallback to env if DB unavailable
    const promptpayId = process.env.PLATFORM_PROMPTPAY_ID || '';
    return {
      promptpayId,
      accountName: process.env.PLATFORM_ACCOUNT_NAME || 'SkillScout',
      feePercent: parseFloat(process.env.PLATFORM_FEE_PERCENT || '5'),
      enabled: !!promptpayId,
    };
  }
}
