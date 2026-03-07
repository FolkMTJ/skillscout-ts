const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });
async function run() {
    const uri = process.env.MONGODB_URI;
    if (!uri) { console.error('No URI'); return; }
    const client = new MongoClient(uri);
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await client.connect();
        const db = client.db();
        const camps = db.collection('camps');

        const countWithDate = await camps.countDocuments({ registrationDeadline: { $gte: today } });
        console.log('Count with Date object:', countWithDate);

        const countWithString = await camps.countDocuments({ registrationDeadline: { $gte: today.toISOString() } });
        console.log('Count with String:', countWithString);

        // Find camps that match the Date query
        const activeDateCamps = await camps.find({ registrationDeadline: { $gte: today } }, { projection: { name: 1, registrationDeadline: 1, type: { $type: '$registrationDeadline' } } }).limit(2).toArray();
        console.log('Matched Date:', activeDateCamps);

        // Find camps that match the string query
        const activeStringCamps = await camps.find({ registrationDeadline: { $gte: today.toISOString() } }, { projection: { name: 1, registrationDeadline: 1, type: { $type: '$registrationDeadline' } } }).limit(2).toArray();
        console.log('Matched String:', activeStringCamps);
    } finally {
        await client.close();
    }
}
run().catch(console.error);
