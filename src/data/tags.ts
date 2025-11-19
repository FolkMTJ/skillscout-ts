import { RIASECCode } from './riasec';

export interface TechnicalTag {
  id: string;
  name: string;
  nameTh: string;
  category: 'frontend' | 'backend' | 'data' | 'design' | 'mobile' | 'devops' | 'other';
  riasecMapping: {
    code: RIASECCode;
    weight: number; // 0-1
  }[];
  isCore: boolean;
}

export const STANDARD_TAGS: TechnicalTag[] = [
  // Frontend
  {
    id: 'html-css',
    name: 'HTML/CSS',
    nameTh: 'HTML/CSS',
    category: 'frontend',
    riasecMapping: [
      { code: 'A', weight: 0.6 },
      { code: 'C', weight: 0.4 }
    ],
    isCore: true
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    nameTh: 'JavaScript',
    category: 'frontend',
    riasecMapping: [
      { code: 'I', weight: 0.7 },
      { code: 'C', weight: 0.3 }
    ],
    isCore: true
  },
  {
    id: 'react',
    name: 'React',
    nameTh: 'React',
    category: 'frontend',
    riasecMapping: [
      { code: 'I', weight: 0.6 },
      { code: 'A', weight: 0.4 }
    ],
    isCore: true
  },
  {
    id: 'vue',
    name: 'Vue.js',
    nameTh: 'Vue.js',
    category: 'frontend',
    riasecMapping: [
      { code: 'I', weight: 0.6 },
      { code: 'A', weight: 0.4 }
    ],
    isCore: true
  },

  // Backend
  {
    id: 'nodejs',
    name: 'Node.js',
    nameTh: 'Node.js',
    category: 'backend',
    riasecMapping: [
      { code: 'I', weight: 0.7 },
      { code: 'C', weight: 0.3 }
    ],
    isCore: true
  },
  {
    id: 'python',
    name: 'Python',
    nameTh: 'Python',
    category: 'backend',
    riasecMapping: [
      { code: 'I', weight: 0.8 },
      { code: 'C', weight: 0.2 }
    ],
    isCore: true
  },
  {
    id: 'api-development',
    name: 'API Development',
    nameTh: 'การพัฒนา API',
    category: 'backend',
    riasecMapping: [
      { code: 'I', weight: 0.6 },
      { code: 'C', weight: 0.4 }
    ],
    isCore: true
  },
  {
    id: 'database',
    name: 'Database',
    nameTh: 'ฐานข้อมูล',
    category: 'backend',
    riasecMapping: [
      { code: 'C', weight: 0.7 },
      { code: 'I', weight: 0.3 }
    ],
    isCore: true
  },

  // Data & AI
  {
    id: 'data-science',
    name: 'Data Science',
    nameTh: 'วิทยาศาสตร์ข้อมูล',
    category: 'data',
    riasecMapping: [
      { code: 'I', weight: 0.9 },
      { code: 'C', weight: 0.1 }
    ],
    isCore: true
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    nameTh: 'การเรียนรู้ของเครื่อง',
    category: 'data',
    riasecMapping: [
      { code: 'I', weight: 1.0 }
    ],
    isCore: true
  },
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    nameTh: 'ปัญญาประดิษฐ์',
    category: 'data',
    riasecMapping: [
      { code: 'I', weight: 0.9 },
      { code: 'R', weight: 0.1 }
    ],
    isCore: true
  },
  {
    id: 'data-visualization',
    name: 'Data Visualization',
    nameTh: 'การแสดงผลข้อมูล',
    category: 'data',
    riasecMapping: [
      { code: 'I', weight: 0.5 },
      { code: 'A', weight: 0.5 }
    ],
    isCore: true
  },

  // Design
  {
    id: 'ui-ux',
    name: 'UI/UX Design',
    nameTh: 'การออกแบบ UI/UX',
    category: 'design',
    riasecMapping: [
      { code: 'A', weight: 0.8 },
      { code: 'S', weight: 0.2 }
    ],
    isCore: true
  },
  {
    id: 'graphic-design',
    name: 'Graphic Design',
    nameTh: 'การออกแบบกราฟิก',
    category: 'design',
    riasecMapping: [
      { code: 'A', weight: 0.9 },
      { code: 'I', weight: 0.1 }
    ],
    isCore: true
  },
  {
    id: 'figma',
    name: 'Figma',
    nameTh: 'Figma',
    category: 'design',
    riasecMapping: [
      { code: 'A', weight: 0.7 },
      { code: 'C', weight: 0.3 }
    ],
    isCore: true
  },

  // Mobile
  {
    id: 'mobile-dev',
    name: 'Mobile Development',
    nameTh: 'การพัฒนาแอปมือถือ',
    category: 'mobile',
    riasecMapping: [
      { code: 'I', weight: 0.6 },
      { code: 'A', weight: 0.4 }
    ],
    isCore: true
  },
  {
    id: 'react-native',
    name: 'React Native',
    nameTh: 'React Native',
    category: 'mobile',
    riasecMapping: [
      { code: 'I', weight: 0.6 },
      { code: 'A', weight: 0.4 }
    ],
    isCore: true
  },
  {
    id: 'flutter',
    name: 'Flutter',
    nameTh: 'Flutter',
    category: 'mobile',
    riasecMapping: [
      { code: 'I', weight: 0.6 },
      { code: 'A', weight: 0.4 }
    ],
    isCore: true
  },

  // DevOps & Infrastructure
  {
    id: 'devops',
    name: 'DevOps',
    nameTh: 'DevOps',
    category: 'devops',
    riasecMapping: [
      { code: 'C', weight: 0.6 },
      { code: 'I', weight: 0.4 }
    ],
    isCore: true
  },
  {
    id: 'docker',
    name: 'Docker',
    nameTh: 'Docker',
    category: 'devops',
    riasecMapping: [
      { code: 'C', weight: 0.5 },
      { code: 'I', weight: 0.5 }
    ],
    isCore: true
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    nameTh: 'Kubernetes',
    category: 'devops',
    riasecMapping: [
      { code: 'C', weight: 0.6 },
      { code: 'I', weight: 0.4 }
    ],
    isCore: true
  },
  {
    id: 'cloud',
    name: 'Cloud Computing',
    nameTh: 'คลาวด์คอมพิวติ้ง',
    category: 'devops',
    riasecMapping: [
      { code: 'C', weight: 0.5 },
      { code: 'I', weight: 0.5 }
    ],
    isCore: true
  },

  // Other
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    nameTh: 'ความปลอดภัยไซเบอร์',
    category: 'other',
    riasecMapping: [
      { code: 'I', weight: 0.8 },
      { code: 'C', weight: 0.2 }
    ],
    isCore: true
  },
  {
    id: 'game-dev',
    name: 'Game Development',
    nameTh: 'การพัฒนาเกม',
    category: 'other',
    riasecMapping: [
      { code: 'A', weight: 0.6 },
      { code: 'I', weight: 0.4 }
    ],
    isCore: true
  },
  {
    id: 'iot',
    name: 'Internet of Things',
    nameTh: 'อินเทอร์เน็ตของสรรพสิ่ง',
    category: 'other',
    riasecMapping: [
      { code: 'R', weight: 0.6 },
      { code: 'I', weight: 0.4 }
    ],
    isCore: true
  },
  {
    id: 'blockchain',
    name: 'Blockchain',
    nameTh: 'บล็อกเชน',
    category: 'other',
    riasecMapping: [
      { code: 'I', weight: 0.7 },
      { code: 'C', weight: 0.3 }
    ],
    isCore: true
  }
];

export const TAG_CATEGORIES = {
  frontend: 'Frontend Development',
  backend: 'Backend Development',
  data: 'Data & AI',
  design: 'Design',
  mobile: 'Mobile Development',
  devops: 'DevOps & Infrastructure',
  other: 'Other Technologies'
};

export function getTagById(id: string): TechnicalTag | undefined {
  return STANDARD_TAGS.find(tag => tag.id === id);
}

export function getTagsByCategory(category: string): TechnicalTag[] {
  return STANDARD_TAGS.filter(tag => tag.category === category);
}
