import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
    const collection = await getCollection('payments');
    const payments = await collection.find({ payoutStatus: 'paid_out' }).toArray();

    return NextResponse.json({
        count: payments.length,
        payments: payments.map(p => ({
            _id: p._id,
            payoutStatus: p.payoutStatus,
            slipUrl: p.slipUrl,
            payoutSlipUrl: p.payoutSlipUrl,
            slipSenderName: p.slipSenderName,
            createdAt: p.createdAt
        }))
    });
}
