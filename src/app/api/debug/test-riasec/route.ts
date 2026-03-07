import { NextResponse } from 'next/server';
import { calculateCampRIASEC, calculateUserRIASEC, calculateSkillProfile, SimplifiedTag } from '@/lib/utils/riasec-calculator';
import { TagModel } from '@/lib/db/models/Tag';

/**
 * DEBUG: ทดสอบ RIASEC calculation
 */
export async function GET() {
  try {
    const testTags = ['devops', 'docker', 'kubernetes'];

    const allTags = await TagModel.findAll() as SimplifiedTag[];

    // เช็คว่า tags เหล่านี้มีใน database ไหม
    const tagDetails = testTags.map(tagId => {
      const tag = allTags.find(t => t.id === tagId);
      return {
        id: tagId,
        found: !!tag,
        data: tag
      };
    });

    // คำนวณ RIASEC
    const campRIASEC = calculateCampRIASEC(testTags, allTags);
    const userRIASEC = calculateUserRIASEC([campRIASEC, campRIASEC]); // simulate 2 camps
    const skillProfile = calculateSkillProfile([testTags, testTags], undefined, allTags);

    return NextResponse.json({
      testTags,
      tagDetails,
      campRIASEC,
      userRIASEC,
      skillProfile: skillProfile.slice(0, 5),
      summary: {
        tagsFound: tagDetails.filter(t => t.found).length,
        tagsNotFound: tagDetails.filter(t => !t.found).length,
        totalRIASEC: Object.values(userRIASEC).reduce((a, b) => a + b, 0),
        hasData: Object.values(userRIASEC).some(v => v > 0)
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
