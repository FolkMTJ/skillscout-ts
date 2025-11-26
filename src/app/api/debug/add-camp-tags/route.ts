import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * DEBUG: เพิ่ม tags ให้กับค่ายที่ไม่มี tags
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const campsCollection = db.collection('camps');

    // หาค่ายที่ไม่มี tags
    const campsWithoutTags = await campsCollection
      .find({
        $or: [
          { tags: { $exists: false } },
          { tags: [] },
          { tags: null }
        ]
      })
      .toArray();

    console.log('📊 Found', campsWithoutTags.length, 'camps without tags');

    // Default tags ตามชื่อค่าย
    const defaultTags = {
      'web': ['html-css', 'javascript', 'web-development', 'frontend'],
      'react': ['javascript', 'react', 'frontend', 'ui-ux'],
      'python': ['python', 'programming', 'backend', 'data-science'],
      'ai': ['python', 'ai', 'machine-learning', 'data-science'],
      'iot': ['iot', 'hardware', 'embedded-systems', 'sensors'],
      'game': ['game-development', 'unity', 'programming', 'graphics'],
      'mobile': ['mobile-app', 'react-native', 'flutter', 'app-development'],
      'data': ['data-science', 'python', 'data-analysis', 'statistics'],
      'design': ['graphic-design', 'ui-ux', 'figma', 'adobe'],
      'default': ['programming', 'workshop', 'it-skills', 'technology']
    };

    const updated = [];

    for (const camp of campsWithoutTags) {
      const campName = camp.name.toLowerCase();
      
      // หา tags ที่เหมาะสมจากชื่อ
      let tags = defaultTags.default;
      
      for (const [keyword, keywordTags] of Object.entries(defaultTags)) {
        if (campName.includes(keyword)) {
          tags = keywordTags;
          break;
        }
      }

      // อัปเดต
      await campsCollection.updateOne(
        { _id: camp._id },
        { $set: { tags } }
      );

      updated.push({
        campId: camp._id.toString(),
        campName: camp.name,
        tagsAdded: tags
      });
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updated.length} camps with tags`,
      updated,
      instructions: [
        '1. ไปที่ /api/debug/camp-tags เพื่อเช็คว่าค่ายมี tags แล้ว',
        '2. Refresh หน้า /discovery',
        '3. ควรเห็นข้อมูลแล้ว!'
      ]
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
