// scripts/update-camp-status.ts
// สคริปต์สำหรับ update ค่ายเก่าที่ไม่มี status ให้เป็น active
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'skillscout';

async function updateCampStatus() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');

    const db = client.db(DB_NAME);
    const campsCollection = db.collection('camps');

    // หา camps ที่ไม่มี status หรือ status เป็น null/undefined
    const campsWithoutStatus = await campsCollection.find({
      $or: [
        { status: { $exists: false } },
        { status: null },
        { status: '' }
      ]
    }).toArray();

    console.log(`\nพบค่ายที่ไม่มี status: ${campsWithoutStatus.length} ค่าย`);

    if (campsWithoutStatus.length === 0) {
      console.log('✓ ทุกค่ายมี status แล้ว!');
      return;
    }

    console.log('\nรายชื่อค่าย:');
    campsWithoutStatus.forEach((camp, index) => {
      console.log(`${index + 1}. ${camp.name}`);
    });

    // Update camps ที่ไม่มี status ให้เป็น 'active'
    const result = await campsCollection.updateMany(
      {
        $or: [
          { status: { $exists: false } },
          { status: null },
          { status: '' }
        ]
      },
      {
        $set: { status: 'active' }
      }
    );

    console.log(`\n✓ อัพเดทสำเร็จ: ${result.modifiedCount} ค่าย`);
    console.log('✓ ค่ายเหล่านี้ถูกตั้งเป็น "active" และจะแสดงบนหน้าหลัก');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n✓ ปิดการเชื่อมต่อ MongoDB');
  }
}

// Run the script
updateCampStatus()
  .then(() => {
    console.log('\nเสร็จสิ้น!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ สคริปต์ล้มเหลว:', error);
    process.exit(1);
  });
