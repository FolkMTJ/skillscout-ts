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
 */
export function calculateSkillProfile(campTags: string[][]): {
  name: string;
  level: number;
  experienceCount: number;
}[] {
  const skillMap = new Map<string, { count: number; tag: string }>();

  // นับความถี่ของแต่ละ tag
  campTags.flat().forEach(tagId => {
    const current = skillMap.get(tagId) || { count: 0, tag: tagId };
    skillMap.set(tagId, { count: current.count + 1, tag: tagId });
  });

  // แปลงเป็น array และคำนวณ level
  const skills = Array.from(skillMap.entries()).map(([tagId, data]) => {
    const tag = getTagById(tagId);
    const name = tag?.nameTh || tag?.name || tagId;
    
    // คำนวณ level จากจำนวนค่ายที่เข้า (1 ค่าย = 20%, max 100%)
    const level = Math.min(data.count * 20, 100);

    return {
      name,
      level,
      experienceCount: data.count
    };
  });

  return skills.sort((a, b) => b.level - a.level);
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
