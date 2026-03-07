// RIASEC Theory - Holland Codes for IT Careers
export type RIASECCode = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface RIASECType {
  code: RIASECCode;
  name: string;
  thaiName: string;
  description: string;
  color: string;
  careers: string[];
}

export const RIASEC_TYPES: Record<RIASECCode, RIASECType> = {
  R: {
    code: 'R',
    name: 'Realistic',
    thaiName: 'นักปฏิบัติ',
    description: 'ชอบงานที่เป็นรูปธรรม ใช้มือทำ ทำงานกับเครื่องมือและอุปกรณ์',
    color: 'bg-red-500',
    careers: ['Hardware Engineer', 'Network Engineer', 'IoT Developer', 'Robotics Engineer']
  },
  I: {
    code: 'I',
    name: 'Investigative',
    thaiName: 'นักวิเคราะห์',
    description: 'ชอบแก้ปัญหา วิเคราะห์ข้อมูล ค้นคว้าหาคำตอบ',
    color: 'bg-blue-500',
    careers: ['Data Scientist', 'AI Researcher', 'Security Analyst', 'Software Architect']
  },
  A: {
    code: 'A',
    name: 'Artistic',
    thaiName: 'นักสร้างสรรค์',
    description: 'ชอบออกแบบ สร้างสรรค์ งานที่ไม่ซ้ำใครและมีเอกลักษณ์',
    color: 'bg-purple-500',
    careers: ['UI/UX Designer', 'Game Designer', 'Creative Technologist', 'Frontend Developer']
  },
  S: {
    code: 'S',
    name: 'Social',
    thaiName: 'นักสื่อสาร',
    description: 'ชอบทำงานกับคน สอน ช่วยเหลือ สร้างความสัมพันธ์',
    color: 'bg-green-500',
    careers: ['Technical Trainer', 'Community Manager', 'Product Manager', 'UX Researcher']
  },
  E: {
    code: 'E',
    name: 'Enterprising',
    thaiName: 'ผู้นำ',
    description: 'ชอบวางแผน จัดการ นำทีม และสร้างธุรกิจ',
    color: 'bg-yellow-500',
    careers: ['Tech Lead', 'Startup Founder', 'Project Manager', 'Engineering Manager']
  },
  C: {
    code: 'C',
    name: 'Conventional',
    thaiName: 'นักจัดระบบ',
    description: 'ชอบงานที่เป็นระเบียบ มีโครงสร้าง และความแม่นยำ',
    color: 'bg-gray-500',
    careers: ['Database Admin', 'QA Engineer', 'DevOps Engineer', 'System Administrator']
  }
};

export interface RIASECProfile {
  R: number;
  I: number;
  A: number;
  S: number;
  E: number;
  C: number;
}
