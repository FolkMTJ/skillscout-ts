// src/types/evaluation.ts

export interface EvaluationQuestion {
  id: string;
  question: string;
  type: 'rating' | 'text' | 'choice';
  required: boolean;
  options?: string[]; // สำหรับ type: 'choice'
}

export interface EvaluationAnswer {
  questionId: string;
  answer: number | string; // number สำหรับ rating, string สำหรับ text/choice
}

export interface Evaluation {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  campId: string;
  campName: string;
  registrationId: string;
  answers: EvaluationAnswer[];
  overallRating: number; // คะแนนรวมจาก 1-5
  comment?: string; // ความคิดเห็นเพิ่มเติม
  createdAt: Date;
  updatedAt: Date;
}

// Template แบบประเมินมาตรฐาน
export const DEFAULT_EVALUATION_QUESTIONS: EvaluationQuestion[] = [
  {
    id: 'content_quality',
    question: 'เนื้อหาของค่ายมีคุณภาพและตรงกับที่คาดหวังหรือไม่?',
    type: 'rating',
    required: true
  },
  {
    id: 'instructor_quality',
    question: 'วิทยากรมีความรู้ความสามารถและถ่ายทอดได้ดีหรือไม่?',
    type: 'rating',
    required: true
  },
  {
    id: 'organization',
    question: 'การจัดการและการประสานงานเป็นอย่างไร?',
    type: 'rating',
    required: true
  },
  {
    id: 'venue_facilities',
    question: 'สถานที่และสิ่งอำนวยความสะดวกเหมาะสมหรือไม่?',
    type: 'rating',
    required: true
  },
  {
    id: 'materials',
    question: 'เอกสารและสื่อการเรียนรู้มีคุณภาพหรือไม่?',
    type: 'rating',
    required: true
  },
  {
    id: 'practical_value',
    question: 'สามารถนำความรู้ที่ได้รับไปใช้ประโยชน์ได้จริงหรือไม่?',
    type: 'rating',
    required: true
  },
  {
    id: 'most_liked',
    question: 'สิ่งที่ชอบที่สุดในค่ายนี้คืออะไร?',
    type: 'text',
    required: true
  },
  {
    id: 'improvement',
    question: 'มีข้อเสนอแนะในการปรับปรุงค่ายหรือไม่?',
    type: 'text',
    required: false
  },
  {
    id: 'recommend',
    question: 'คุณจะแนะนำค่ายนี้ให้เพื่อนหรือไม่?',
    type: 'choice',
    required: true,
    options: ['แน่นอน', 'อาจจะแนะนำ', 'ไม่แน่ใจ', 'ไม่แนะนำ']
  }
];
