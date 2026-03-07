import { RIASECProfile, RIASECCode } from '@/data/riasec';

export interface SimplifiedTag {
  id: string;
  name?: string;
  nameTh?: string;
  riasecMapping: { code: string; weight: number }[];
}

/**
 * คำนวณ RIASEC Profile จาก tags ของค่าย
 */
export function calculateCampRIASEC(tags: string[], allTags: SimplifiedTag[]): RIASECProfile {
  const scores: RIASECProfile = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0
  };

  tags.forEach(tagId => {
    const tag = allTags.find(t => t.id === tagId);
    if (!tag) return;

    tag.riasecMapping.forEach(mapping => {
      scores[mapping.code as RIASECCode] += mapping.weight;
    });
  });

  // Normalize to 0-100
  const maxScore = Math.max(...Object.values(scores), 1);
  Object.keys(scores).forEach(key => {
    scores[key as RIASECCode] = Math.round((scores[key as RIASECCode] / maxScore) * 100);
  });

  return scores;
}

// Map Review rating 1–5 → weight factor
function ratingToWeight(rating: number): number {
  if (rating >= 5) return 1.0;
  if (rating >= 4) return 0.8;
  if (rating >= 3) return 0.5;
  if (rating >= 2) return 0.25;
  return 0.1; // rating 1 — ยังนับอยู่เพราะเคยสัมผัสจริง
}

/**
 * คำนวณ RIASEC Profile ของ User จากค่ายที่เข้าทั้งหมด
 * weights: คะแนน Review 1–5 ต่อค่าย (optional, default = 5 = weight 1.0 ทุกค่าย)
 */
export function calculateUserRIASEC(campRIASECs: RIASECProfile[], weights?: number[]): RIASECProfile {
  if (campRIASECs.length === 0) {
    return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  }

  const totalScores: RIASECProfile = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  let totalWeight = 0;

  campRIASECs.forEach((profile, idx) => {
    const w = weights ? ratingToWeight(weights[idx] ?? 5) : 1.0;
    Object.entries(profile).forEach(([key, value]) => {
      totalScores[key as RIASECCode] += value * w;
    });
    totalWeight += w;
  });

  if (totalWeight === 0) return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  Object.keys(totalScores).forEach(key => {
    totalScores[key as RIASECCode] = Math.round(totalScores[key as RIASECCode] / totalWeight);
  });

  return totalScores;
}

/**
 * คำนวณ Skill Profile จาก tags ของค่ายทั้งหมด
 * weights: คะแนน Review 1–5 ต่อค่าย (optional, default = 1.0 ทุกค่าย)
 * แสดงเป็นสัดส่วนประสบการณ์ (%) จากค่ายทั้งหมด
 */
export function calculateSkillProfile(campTags: string[][], weights: number[] | undefined, allTags: SimplifiedTag[]): {
  name: string;
  experienceCount: number;
  percentage: number;
  level: 'novice' | 'intermediate' | 'experienced' | 'expert';
}[] {
  const skillMap = new Map<string, { weightedCount: number; campCount: number; tag: string }>();

  campTags.forEach((tags, idx) => {
    const w = weights ? ratingToWeight(weights[idx] ?? 5) : 1.0;
    tags.forEach(tagId => {
      const current = skillMap.get(tagId) || { weightedCount: 0, campCount: 0, tag: tagId };
      skillMap.set(tagId, {
        weightedCount: current.weightedCount + w,
        campCount: current.campCount + 1,
        tag: tagId,
      });
    });
  });

  const totalWeighted = Array.from(skillMap.values()).reduce((sum, item) => sum + item.weightedCount, 0);

  const skills = Array.from(skillMap.entries()).map(([tagId, data]) => {
    const tag = allTags.find(t => t.id === tagId);
    const name = tag?.nameTh || tag?.name || tagId;

    const percentage = totalWeighted > 0 ? Math.round((data.weightedCount / totalWeighted) * 100) : 0;

    // ใช้ campCount (จำนวนค่ายจริง) สำหรับกำหนด level label
    let level: 'novice' | 'intermediate' | 'experienced' | 'expert';
    if (data.campCount === 1) {
      level = 'novice';
    } else if (data.campCount === 2) {
      level = 'intermediate';
    } else if (data.campCount >= 3 && data.campCount < 5) {
      level = 'experienced';
    } else {
      level = 'expert';
    }

    return { name, experienceCount: data.campCount, percentage, level };
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
