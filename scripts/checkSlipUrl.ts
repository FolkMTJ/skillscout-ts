import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

async function check() {
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();
    const payments = await db.collection('payments').find({ payoutStatus: 'paid_out' }).toArray();

    console.log(`Found ${payments.length} paid out payments`);
    for (const p of payments) {
        if (p.payoutSlipUrl) {
            console.log(`Payment ${p._id}: payoutSlipUrl = ${p.payoutSlipUrl}`);
        } else if (p.slipUrl) {
            console.log(`Payment ${p._id}: slipUrl (attendee slip?) = ${p.slipUrl}`);
        } else {
            console.log(`Payment ${p._id}: NO slip URL found`);
        }
    }

    // Quick fix for old data: copy slipUrl to payoutSlipUrl if it's an organizer payout
    // Wait, slipUrl might be the attendee's slip! Let's check what fields exist

    await client.close();
}

check().catch(console.error);
