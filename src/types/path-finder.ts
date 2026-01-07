// src/types/path-finder.ts
import { RIASECCode } from '@/data/riasec';

// คำตอบแบบทดสอบ Path Finder
export interface PathFinderAnswer {
  questionId: number;
  rating: number; // 1-5
}

// ผลลัพธ์ RIASEC
export interface RIASECScore {
  R: number; // Realistic
  I: number; // Investigative
  A: number; // Artistic
  S: number; // Social
  E: number; // Enterprising
  C: number; // Conventional
}

// ผลลัพธ์การทำแบบทดสอบ
export interface PathFinderResult {
  _id: string;
  userId: string;
  userEmail: string;
  answers: PathFinderAnswer[];
  riasecScores: RIASECScore;
  topRIASECCodes: RIASECCode[]; // top 2-3 codes
  recommendedCareers: string[]; // career IDs
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// สำหรับส่งข้อมูลจาก client
export interface PathFinderSubmission {
  answers: PathFinderAnswer[];
}

// ผลลัพธ์ที่ส่งกลับไปให้ client (รวมข้อมูลเพิ่มเติม)
export interface PathFinderResultWithDetails extends PathFinderResult {
  recommendedCareerDetails?: Array<{
    id: string;
    name: string;
    nameTh: string;
    description: string;
    personality: string;
    riasecCodes: RIASECCode[];
    requiredTags: string[];
    recommendedTags: string[];
  }>;
}
