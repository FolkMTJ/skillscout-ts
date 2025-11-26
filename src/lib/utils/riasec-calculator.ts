import { RIASECProfile, RIASECCode } from '@/data/riasec';
import { getTagById } from '@/data/tags';

/**
 * คำนวณ RIASEC Profile จาก tags ของค่าย
 */
export function calculateCampRIASEC(tags: string[]): RIASECProfile {
  const scores: RIASECProfile = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0
  };

  tags.forEach(tagId => {
    const tag = getTagById(tagId);
    if (!tag) return;

    tag.riasecMapping.forEach(mapping => {
      scores[mapping.code] += mapping.weight * 10;
    });
  });

  // Normalize to 0-100
  const maxScore = Math.max(...Object.values(scores), 1);
  Object.keys(scores).forEach(key => {
    scores[key as RIASECCode] = Math.round((scores[key as RIASECCode] / maxScore) * 100);
  });

  return scores;
}

/**
 * คำนวณ RIASEC Profile ของ User จากค่ายที่เข้าทั้งหมด
 */
export function calculateUserRIASEC(campRIASECs: RIASECProfile[]): RIASECProfile {
  if (campRIASECs.length === 0) {
    return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  }

  const totalScores: RIASECProfile = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0
  };

  campRIASECs.forEach(profile => {
    Object.entries(profile).forEach(([key, value]) => {
      totalScores[key as RIASECCode] += value;
    });
  });

  // Average
  const count = campRIASECs.length;
  Object.keys(totalScores).forEach(key => {
    totalScores[key as RIASECCode] = Math.round(totalScores[key as RIASECCode] / count);
  });

  return totalScores;
}

/**
 * คำนวณ Skill Profile จาก tags ของค่ายทั้งหมด
 * แสดงเป็นสัดส่วนประสบการณ์ (%) จากค่ายทั้งหมด
 */
export function calculateSkillProfile(campTags: string[][]): {
  name: string;
  experienceCount: number;
  percentage: number;
  level: 'novice' | 'intermediate' | 'experienced' | 'expert';
}[] {
  const skillMap = new Map<string, { count: number; tag: string }>();

  // นับความถี่ของแต่ละ tag
  campTags.flat().forEach(tagId => {
    const current = skillMap.get(tagId) || { count: 0, tag: tagId };
    skillMap.set(tagId, { count: current.count + 1, tag: tagId });
  });

  // คำนวณผลรวมทั้งหมด
  const totalCount = Array.from(skillMap.values()).reduce((sum, item) => sum + item.count, 0);

  // แปลงเป็น array และคำนวณ percentage
  const skills = Array.from(skillMap.entries()).map(([tagId, data]) => {
    const tag = getTagById(tagId);
    const name = tag?.nameTh || tag?.name || tagId;
    
    // คำนวณ % จากประสบการณ์ทั้งหมด
    const percentage = totalCount > 0 ? Math.round((data.count / totalCount) * 100) : 0;
    
    // กำหนด level label ตามจำนวนค่าย
    let level: 'novice' | 'intermediate' | 'experienced' | 'expert';
    if (data.count === 1) {
      level = 'novice';        // ผู้เริ่มต้น
    } else if (data.count === 2) {
      level = 'intermediate';  // 📚 มีพื้นฐาน
    } else if (data.count >= 3 && data.count < 5) {
      level = 'experienced';   // มีประสบการณ์
    } else {
      level = 'expert';        // ชำนาญ
    }

    return {
      name,
      experienceCount: data.count,
      percentage,
      level
    };
  });

  return skills.sort((a, b) => b.experienceCount - a.experienceCount);
}

/**
 * ดึงข้อมูลแสดง Level Label ที่เหมาะสม
 */
export function getSkillLevelInfo(level: 'novice' | 'intermediate' | 'experienced' | 'expert') {
  const levelInfo = {
    novice: {
      label: 'ผู้เริ่มต้น',
      labelEn: 'Novice',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-400',
      description: 'มีประสบการณ์เบื้องต้น'
    },
    intermediate: {
      label: 'มีพื้นฐาน',
      labelEn: 'Intermediate',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-400',
      description: 'มีความรู้และประสบการณ์เพิ่มเติม'
    },
    experienced: {
      label: 'มีประสบการณ์',
      labelEn: 'Experienced',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-400',
      description: 'มีประสบการณ์หลากหลายค่าย'
    },
    expert: {
      label: 'ชำนาญ',
      labelEn: 'Expert',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-400',
      description: 'มีประสบการณ์สูงและเชี่ยวชาญ'
    }
  };

  return levelInfo[level];
}

/**
 * หา Top RIASEC codes จาก profile
 */
export function getTopRIASECCodes(profile: RIASECProfile, count: number = 3): RIASECCode[] {
  return (Object.entries(profile) as [RIASECCode, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([code]) => code);
}
