// src/lib/path-finder-utils.ts
// คำนวณ RIASEC scores ฝั่ง client สำหรับ Guest mode (ไม่บันทึกลง DB)

import { PATH_FINDER_QUESTIONS } from '@/data/path-finder/questions';
import { IT_CAREERS } from '@/data/path-finder/careers';

export type RIASECCode = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface RIASECScores {
    R: number;
    I: number;
    A: number;
    S: number;
    E: number;
    C: number;
}

export interface GuestAnswer {
    questionId: number;
    rating: number;
}

export interface GuestResult {
    answers: GuestAnswer[];
    riasecScores: RIASECScores;
    topRIASECCodes: RIASECCode[];
    recommendedCareers: string[];
    recommendedCareerDetails: ReturnType<typeof buildCareerDetails>;
    createdAt: string;
    isGuest: true;
}

/** คำนวณ RIASEC scores จากคำตอบทั้งหมด */
export function calculateRIASECScores(answers: GuestAnswer[]): RIASECScores {
    const scores: RIASECScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

    for (const answer of answers) {
        const question = PATH_FINDER_QUESTIONS.find(q => q.id === answer.questionId);
        if (question) {
            scores[question.category as RIASECCode] += answer.rating;
        }
    }

    return scores;
}

/** ดึง top 2-3 codes ที่มีคะแนนสูงสุด */
export function getTopCodes(scores: RIASECScores): RIASECCode[] {
    return (Object.entries(scores) as [RIASECCode, number][])
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([code]) => code);
}

/** หาอาชีพที่แนะนำจาก topCodes */
export function getRecommendedCareerIds(topCodes: RIASECCode[]): string[] {
    // คะแนน match: primary code = 2 pts, secondary code = 1 pt
    const scored = IT_CAREERS.map(career => {
        let score = 0;
        if (topCodes[0] && career.riasecCodes.includes(topCodes[0])) score += 2;
        if (topCodes[1] && career.riasecCodes.includes(topCodes[1])) score += 1;
        if (topCodes[2] && career.riasecCodes.includes(topCodes[2])) score += 1;
        return { id: career.id, score };
    });

    return scored
        .filter(c => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(c => c.id);
}

/** สร้าง career detail objects สำหรับแสดงผล */
function buildCareerDetails(careerIds: string[]) {
    return careerIds
        .map(id => IT_CAREERS.find(c => c.id === id))
        .filter((c): c is NonNullable<typeof c> => c !== undefined)
        .map(career => ({
            id: career.id,
            name: career.name,
            nameTh: career.nameTh,
            description: career.description,
            personality: career.personality,
            riasecCodes: career.riasecCodes,
            requiredTags: career.requiredTags,
            recommendedTags: career.recommendedTags,
            roadmapSteps: career.roadmapSteps,
            averageSalary: career.averageSalary,
            demandLevel: career.demandLevel,
        }));
}

/** จัดเก็บ key ของ localStorage */
export const GUEST_RESULT_KEY = 'skillscout_pf_guest';

/** คำนวณและสร้าง GuestResult ครบ */
export function buildGuestResult(answers: GuestAnswer[]): GuestResult {
    const riasecScores = calculateRIASECScores(answers);
    const topRIASECCodes = getTopCodes(riasecScores);
    const recommendedCareers = getRecommendedCareerIds(topRIASECCodes);
    const recommendedCareerDetails = buildCareerDetails(recommendedCareers);

    return {
        answers,
        riasecScores,
        topRIASECCodes,
        recommendedCareers,
        recommendedCareerDetails,
        createdAt: new Date().toISOString(),
        isGuest: true,
    };
}

/** บันทึก GuestResult ลง localStorage */
export function saveGuestResult(result: GuestResult): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GUEST_RESULT_KEY, JSON.stringify(result));
}

/** โหลด GuestResult จาก localStorage */
export function loadGuestResult(): GuestResult | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(GUEST_RESULT_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as GuestResult;
    } catch {
        return null;
    }
}

/** ลบ GuestResult จาก localStorage */
export function clearGuestResult(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_RESULT_KEY);
}
