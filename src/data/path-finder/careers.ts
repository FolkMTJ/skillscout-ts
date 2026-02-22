// Path Finder - IT Careers Data
import { RIASECCode } from '../riasec';

export interface Career {
  id: string;
  name: string;
  nameTh: string;
  description: string;
  personality: string;
  riasecCodes: RIASECCode[];
  requiredTags: string[]; // tags ที่ควรมีสำหรับอาชีพนี้
  recommendedTags: string[]; // tags เสริมที่น่าสนใจ
  roadmapSteps: RoadmapStep[];
  averageSalary?: string;
  demandLevel?: 'high' | 'medium' | 'low';
}

export interface RoadmapStep {
  level: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  requiredSkills: string[];
  recommendedCamps?: string[]; // camp tags ที่แนะนำ
  duration?: string;
}

// อาชีพตาม RIASEC Combinations
export const IT_CAREERS: Career[] = [
  // ─── อาชีพหลัก ───────────────────────────────────────────────────────────

  // Software Engineer / Developer (I+R)
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    nameTh: 'วิศวกรซอฟต์แวร์',
    description: 'ออกแบบ พัฒนา และทดสอบซอฟต์แวร์และแอปพลิเคชันต่างๆ โดยใช้หลักการวิศวกรรมซอฟต์แวร์เพื่อสร้างระบบที่มีคุณภาพสูง',
    personality: 'คุณชอบแก้ปัญหาเชิงตรรกะ มีความคิดวิเคราะห์ และสนใจในการสร้างสิ่งใหม่ด้วยโค้ด',
    riasecCodes: ['I', 'R'],
    requiredTags: ['python', 'javascript', 'html-css'],
    recommendedTags: ['database', 'devops', 'mobile-dev'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐานการเขียนโปรแกรม',
        description: 'เรียนรู้ภาษาโปรแกรมมิ่งพื้นฐาน โครงสร้างข้อมูล และ algorithms',
        requiredSkills: ['Programming Basics', 'Problem Solving', 'Git'],
        recommendedCamps: ['python', 'javascript', 'html-css'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'การพัฒนาแอปพลิเคชัน',
        description: 'สร้าง web/mobile application และเรียนรู้ design patterns',
        requiredSkills: ['OOP', 'Design Patterns', 'Testing', 'Database'],
        recommendedCamps: ['javascript', 'database', 'devops'],
        duration: '6-12 เดือน'
      },
      {
        level: 'advanced',
        title: 'Software Architecture',
        description: 'ออกแบบระบบขนาดใหญ่ Microservices และ System Design',
        requiredSkills: ['System Design', 'Microservices', 'Performance Optimization'],
        recommendedCamps: ['devops', 'cloud', 'database'],
        duration: '12+ เดือน'
      }
    ]
  },

  // Frontend Developer (A+I)
  {
    id: 'frontend-dev',
    name: 'Frontend Developer',
    nameTh: 'นักพัฒนาส่วนหน้า',
    description: 'สร้างและพัฒนาส่วนที่ผู้ใช้มองเห็นและโต้ตอบกับเว็บไซต์และแอปพลิเคชัน ให้ดูสวยงามและใช้งานง่าย',
    personality: 'คุณมีความคิดสร้างสรรค์และชอบออกแบบ รวมกับความสามารถในการแปลงไอเดียให้เป็นโค้ดได้จริง',
    riasecCodes: ['A', 'I'],
    requiredTags: ['html-css', 'javascript', 'ui-ux'],
    recommendedTags: ['figma', 'mobile-dev'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'HTML, CSS และ JavaScript พื้นฐาน',
        description: 'เรียนรู้ HTML, CSS และ JavaScript เพื่อสร้างเว็บเพจพื้นฐาน',
        requiredSkills: ['HTML5', 'CSS3', 'JavaScript Basics', 'Responsive Design'],
        recommendedCamps: ['html-css', 'javascript'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'React/Next.js และ UI Framework',
        description: 'เรียนรู้ React, Framework และการสร้าง UI ที่ซับซ้อน',
        requiredSkills: ['React', 'TypeScript', 'CSS Framework', 'State Management'],
        recommendedCamps: ['javascript', 'ui-ux', 'figma'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'Performance & Advanced Patterns',
        description: 'เพิ่มประสิทธิภาพ เรียนรู้ Testing และ Advanced Patterns',
        requiredSkills: ['Performance Optimization', 'Testing', 'CI/CD', 'Accessibility'],
        recommendedCamps: ['devops', 'ui-ux'],
        duration: '6-12 เดือน'
      }
    ]
  },

  // Backend Developer (I+C)
  {
    id: 'backend-dev',
    name: 'Backend Developer',
    nameTh: 'นักพัฒนาส่วนหลัง',
    description: 'พัฒนาระบบฝั่งเซิร์ฟเวอร์ จัดการข้อมูล และสร้าง API เพื่อให้ Frontend สามารถเรียกใช้งานได้',
    personality: 'คุณชอบงานที่ต้องใช้ตรรกะและการวิเคราะห์ เหมาะกับงานที่มีความเป็นระบบและมีโครงสร้างชัดเจน',
    riasecCodes: ['I', 'C'],
    requiredTags: ['python', 'javascript', 'database'],
    recommendedTags: ['devops', 'cloud', 'docker'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Backend Programming Basics',
        description: 'เรียนรู้ภาษาโปรแกรมสำหรับ Backend และการจัดการข้อมูล',
        requiredSkills: ['Python/Node.js', 'SQL Basics', 'REST API Basics'],
        recommendedCamps: ['python', 'database'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'API Development & Database',
        description: 'สร้าง API ที่ซับซ้อน จัดการฐานข้อมูล และ Authentication',
        requiredSkills: ['RESTful API', 'Database Design', 'Authentication', 'Security'],
        recommendedCamps: ['database', 'javascript', 'python'],
        duration: '6-9 เดือน'
      },
      {
        level: 'advanced',
        title: 'Scalable Architecture',
        description: 'ออกแบบระบบที่ scale ได้ Microservices และ Cloud Deployment',
        requiredSkills: ['Microservices', 'Docker', 'Cloud Services', 'Performance'],
        recommendedCamps: ['devops', 'cloud', 'docker'],
        duration: '9-12 เดือน'
      }
    ]
  },

  // Full-stack Developer (I+A)
  {
    id: 'fullstack-dev',
    name: 'Full-stack Developer',
    nameTh: 'นักพัฒนาเต็มรูปแบบ',
    description: 'พัฒนาทั้งส่วน Frontend และ Backend ของแอปพลิเคชัน ครอบคลุมทุกส่วนของการพัฒนาซอฟต์แวร์',
    personality: 'คุณสนุกกับการเรียนรู้สิ่งใหม่และสามารถทำงานได้หลากหลาย ชอบเห็นผลลัพธ์ที่สมบูรณ์',
    riasecCodes: ['I', 'A'],
    requiredTags: ['html-css', 'javascript', 'python', 'database'],
    recommendedTags: ['devops', 'mobile-dev', 'ui-ux'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Web Development Fundamentals',
        description: 'เรียนรู้ HTML, CSS, JavaScript และ Backend เบื้องต้น',
        requiredSkills: ['HTML/CSS', 'JavaScript', 'Basic Backend', 'Database Basics'],
        recommendedCamps: ['html-css', 'javascript', 'python'],
        duration: '4-6 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Full-stack Framework',
        description: 'เรียนรู้ Framework ทั้ง Frontend และ Backend',
        requiredSkills: ['React/Next.js', 'Node.js/Django', 'REST API', 'SQL/NoSQL'],
        recommendedCamps: ['javascript', 'database', 'ui-ux'],
        duration: '6-12 เดือน'
      },
      {
        level: 'advanced',
        title: 'Deployment & DevOps',
        description: 'Deploy แอปพลิเคชัน จัดการ Server และ CI/CD',
        requiredSkills: ['Docker', 'CI/CD', 'Cloud Platforms', 'Performance'],
        recommendedCamps: ['devops', 'cloud'],
        duration: '12+ เดือน'
      }
    ]
  },

  // UI/UX Designer (A+S)
  {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    nameTh: 'นักออกแบบ UI/UX',
    description: 'ออกแบบประสบการณ์ผู้ใช้ (UX) และส่วนติดต่อผู้ใช้ (UI) ที่สวยงามและใช้งานง่าย เพื่อให้ผลิตภัณฑ์ดิจิทัลตอบสนองความต้องการของผู้ใช้',
    personality: 'คุณมีความคิดสร้างสรรค์สูง ชอบเข้าใจผู้คน และสนุกกับการแก้ปัญหาด้วยการออกแบบ',
    riasecCodes: ['A', 'S'],
    requiredTags: ['ui-ux', 'figma', 'graphic-design'],
    recommendedTags: ['html-css', 'mobile-dev'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Design Fundamentals',
        description: 'เรียนรู้หลักการออกแบบ และเครื่องมือเบื้องต้น',
        requiredSkills: ['Design Principles', 'Color Theory', 'Typography', 'Figma Basics'],
        recommendedCamps: ['figma', 'graphic-design', 'ui-ux'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'UX Research & Prototyping',
        description: 'วิจัยผู้ใช้ สร้าง Wireframe และ Prototype',
        requiredSkills: ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing'],
        recommendedCamps: ['ui-ux', 'figma'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'Advanced UX & Design Systems',
        description: 'สร้าง Design System และ Advanced Interaction Design',
        requiredSkills: ['Design System', 'Motion Design', 'Design Thinking', 'A/B Testing'],
        recommendedCamps: ['ui-ux', 'mobile-dev'],
        duration: '8-12 เดือน'
      }
    ]
  },

  // DevOps Engineer (R+C)
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    nameTh: 'วิศวกร DevOps',
    description: 'จัดการโครงสร้างพื้นฐาน ระบบ Deployment และ CI/CD Pipeline เพื่อให้การพัฒนาและ Deploy ซอฟต์แวร์เป็นไปอย่างรวดเร็วและปลอดภัย',
    personality: 'คุณชอบงานที่เป็นระบบ ทำงานกับเครื่องมือและโครงสร้างพื้นฐาน และชอบปรับปรุงกระบวนการ',
    riasecCodes: ['R', 'C'],
    requiredTags: ['devops', 'docker', 'cloud'],
    recommendedTags: ['cybersecurity', 'kubernetes'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Linux & Scripting',
        description: 'เรียนรู้ Linux, Shell Scripting และ Version Control',
        requiredSkills: ['Linux CLI', 'Shell Scripting', 'Git', 'Basic Networking'],
        recommendedCamps: ['devops'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Containerization & CI/CD',
        description: 'เรียนรู้ Docker, Kubernetes และ CI/CD Pipeline',
        requiredSkills: ['Docker', 'CI/CD Tools', 'Cloud Basics', 'Monitoring'],
        recommendedCamps: ['docker', 'devops', 'cloud'],
        duration: '4-8 เดือน'
      },
      {
        level: 'advanced',
        title: 'Cloud Architecture & SRE',
        description: 'บริหาร Cloud Infrastructure และ Site Reliability Engineering',
        requiredSkills: ['Kubernetes', 'Infrastructure as Code', 'SRE Practices'],
        recommendedCamps: ['cloud', 'cybersecurity'],
        duration: '8-12 เดือน'
      }
    ]
  },

  // Cybersecurity Analyst (I+C)
  {
    id: 'cybersecurity-analyst',
    name: 'Cybersecurity Analyst',
    nameTh: 'นักวิเคราะห์ความปลอดภัยไซเบอร์',
    description: 'ปกป้องระบบคอมพิวเตอร์และเครือข่ายจากการโจมตีและภัยคุกคามต่างๆ รวมถึงวิเคราะห์และตอบสนองต่อเหตุการณ์ด้านความปลอดภัย',
    personality: 'คุณชอบวิเคราะห์ปัญหา คิดเหมือนแฮกเกอร์เพื่อป้องกันการโจมตี และใส่ใจในรายละเอียด',
    riasecCodes: ['I', 'C'],
    requiredTags: ['cybersecurity'],
    recommendedTags: ['devops', 'cloud', 'network'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Security Fundamentals',
        description: 'เรียนรู้พื้นฐาน Networking, OS และ Security Concepts',
        requiredSkills: ['Networking Basics', 'OS Security', 'Cryptography Basics', 'Security Tools'],
        recommendedCamps: ['cybersecurity'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Security Assessment & Monitoring',
        description: 'Penetration Testing, Vulnerability Assessment และ SIEM',
        requiredSkills: ['Penetration Testing', 'Vulnerability Scanning', 'Log Analysis', 'Incident Response'],
        recommendedCamps: ['cybersecurity', 'devops'],
        duration: '6-9 เดือน'
      },
      {
        level: 'advanced',
        title: 'Advanced Threat Intelligence',
        description: 'Threat Hunting, Malware Analysis และ Security Architecture',
        requiredSkills: ['Threat Intelligence', 'Malware Analysis', 'Security Architecture', 'Forensics'],
        recommendedCamps: ['cybersecurity', 'cloud'],
        duration: '12+ เดือน'
      }
    ]
  },

  // Mobile App Developer (A+I)
  {
    id: 'mobile-dev',
    name: 'Mobile App Developer',
    nameTh: 'นักพัฒนาแอปมือถือ',
    description: 'พัฒนาแอปพลิเคชันบนมือถือสำหรับ iOS และ Android ทั้งแบบ Native และ Cross-platform',
    personality: 'คุณชอบสร้างแอปที่ผู้คนใช้งานจริงในชีวิตประจำวัน สนุกกับการออกแบบ UX สำหรับ Mobile',
    riasecCodes: ['A', 'I'],
    requiredTags: ['mobile-dev', 'javascript'],
    recommendedTags: ['ui-ux', 'figma', 'html-css'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Mobile Development Basics',
        description: 'เรียนรู้พื้นฐาน Mobile Development และ UI Components',
        requiredSkills: ['Programming Basics', 'Mobile UI Concepts', 'Flutter/React Native'],
        recommendedCamps: ['mobile-dev', 'javascript'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'App Features & API Integration',
        description: 'เพิ่มฟีเจอร์ต่างๆ เชื่อมต่อ API และจัดการ State',
        requiredSkills: ['State Management', 'REST API Integration', 'Local Storage', 'Push Notifications'],
        recommendedCamps: ['mobile-dev', 'ui-ux'],
        duration: '6-9 เดือน'
      },
      {
        level: 'advanced',
        title: 'Publishing & Performance',
        description: 'Publish แอปใน App Store, Performance Optimization',
        requiredSkills: ['App Store Deployment', 'Performance Optimization', 'Testing', 'Analytics'],
        recommendedCamps: ['mobile-dev', 'devops'],
        duration: '6-12 เดือน'
      }
    ]
  },

  // Cloud Architect (I+R)
  {
    id: 'cloud-architect',
    name: 'Cloud Architect',
    nameTh: 'สถาปนิกระบบ Cloud',
    description: 'ออกแบบและวางแผนโครงสร้างพื้นฐาน Cloud ให้กับองค์กร เพื่อให้ระบบมีความยืดหยุ่น ปลอดภัย และคุ้มค่า',
    personality: 'คุณชอบคิดภาพรวมของระบบขนาดใหญ่ และมีความรู้เชิงเทคนิคในการจัดการโครงสร้างพื้นฐาน',
    riasecCodes: ['I', 'R'],
    requiredTags: ['cloud', 'devops'],
    recommendedTags: ['docker', 'kubernetes', 'cybersecurity'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Cloud Fundamentals',
        description: 'เรียนรู้พื้นฐาน Cloud Computing และ services ต่างๆ',
        requiredSkills: ['Cloud Basics', 'Networking', 'Virtualization', 'Storage Concepts'],
        recommendedCamps: ['cloud', 'devops'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Cloud Services & Management',
        description: 'ใช้งาน Cloud Services ขั้นสูง Security และ Cost Management',
        requiredSkills: ['AWS/GCP/Azure Services', 'Security', 'Cost Optimization', 'Migration'],
        recommendedCamps: ['cloud', 'docker'],
        duration: '6-12 เดือน'
      },
      {
        level: 'advanced',
        title: 'Cloud Architecture Design',
        description: 'ออกแบบ Multi-cloud, Hybrid Architecture และ Enterprise Solutions',
        requiredSkills: ['Architecture Design', 'Enterprise Patterns', 'Disaster Recovery', 'Governance'],
        recommendedCamps: ['cloud', 'devops', 'cybersecurity'],
        duration: '12+ เดือน'
      }
    ]
  },

  // AI/ML Engineer (I+R)
  {
    id: 'ai-ml-engineer',
    name: 'AI/ML Engineer',
    nameTh: 'วิศวกร AI และ Machine Learning',
    description: 'สร้างและ deploy โมเดล Machine Learning และ AI เพื่อแก้ปัญหาทางธุรกิจ ตั้งแต่การเก็บข้อมูลจนถึงการนำโมเดลไปใช้งานจริง',
    personality: 'คุณมีความสนใจด้าน Math, Statistics และชอบทดลองสิ่งใหม่ๆ เพื่อหาคำตอบจากข้อมูล',
    riasecCodes: ['I', 'R'],
    requiredTags: ['machine-learning', 'ai', 'python'],
    recommendedTags: ['data-science', 'cloud'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Math & Programming for ML',
        description: 'เรียนรู้ Python, Linear Algebra, Statistics สำหรับ ML',
        requiredSkills: ['Python', 'Linear Algebra', 'Statistics', 'Data Manipulation'],
        recommendedCamps: ['python', 'machine-learning'],
        duration: '3-6 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Machine Learning Models',
        description: 'สร้างและ train โมเดล ML ประเภทต่างๆ',
        requiredSkills: ['Supervised/Unsupervised Learning', 'Feature Engineering', 'Model Evaluation'],
        recommendedCamps: ['machine-learning', 'data-science', 'ai'],
        duration: '6-12 เดือน'
      },
      {
        level: 'advanced',
        title: 'Deep Learning & MLOps',
        description: 'Deep Learning, Neural Networks และ Deploy โมเดลใน Production',
        requiredSkills: ['Deep Learning', 'Neural Networks', 'MLOps', 'GPU Computing'],
        recommendedCamps: ['ai', 'cloud', 'machine-learning'],
        duration: '12+ เดือน'
      }
    ]
  },

  // Data Analyst (I+C)
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    nameTh: 'นักวิเคราะห์ข้อมูล',
    description: 'วิเคราะห์ข้อมูลเชิงธุรกิจ สร้าง Dashboard และ Report เพื่อช่วยให้องค์กรตัดสินใจได้อย่างมีข้อมูลรองรับ',
    personality: 'คุณชอบตีความข้อมูลและเล่าเรื่องจากตัวเลข มีความละเอียดรอบคอบและชอบค้นหาแบบแผนในข้อมูล',
    riasecCodes: ['I', 'C'],
    requiredTags: ['data-science', 'data-visualization', 'python'],
    recommendedTags: ['database', 'machine-learning'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Data Analysis Basics',
        description: 'เรียนรู้ Excel, SQL และ Python สำหรับวิเคราะห์ข้อมูล',
        requiredSkills: ['Excel/Sheets', 'SQL Basics', 'Python/Pandas', 'Statistics'],
        recommendedCamps: ['python', 'data-science'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Data Visualization & BI Tools',
        description: 'สร้าง Dashboard และ Report ด้วย BI Tools',
        requiredSkills: ['Data Visualization', 'Tableau/Power BI', 'Advanced SQL', 'A/B Testing'],
        recommendedCamps: ['data-visualization', 'data-science'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'Advanced Analytics',
        description: 'Predictive Analytics, Statistical Modeling และ ML basics',
        requiredSkills: ['Statistical Modeling', 'Predictive Analytics', 'Big Data Tools'],
        recommendedCamps: ['data-science', 'machine-learning', 'database'],
        duration: '6-12 เดือน'
      }
    ]
  },

  // Game Developer (R+A)
  {
    id: 'game-developer',
    name: 'Game Developer',
    nameTh: 'นักพัฒนาเกม',
    description: 'สร้างเกมทั้งบน Mobile, PC และ Console โดยใช้ Game Engine และทักษะการเขียนโปรแกรม ร่วมกับความคิดสร้างสรรค์ด้านการออกแบบเกม',
    personality: 'คุณชอบทั้งการเขียนโค้ดและการออกแบบ สนุกกับการสร้างประสบการณ์ที่ผู้เล่นจะสนุกไปด้วย',
    riasecCodes: ['R', 'A'],
    requiredTags: ['game-dev', 'graphic-design'],
    recommendedTags: ['python', 'javascript', 'ui-ux'],
    demandLevel: 'medium',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Game Development Basics',
        description: 'เรียนรู้ Game Engine (Unity/Unreal) และการสร้างเกมพื้นฐาน',
        requiredSkills: ['Unity/Unreal Basics', 'Game Design Concepts', 'C#/Blueprint', '2D/3D Basics'],
        recommendedCamps: ['game-dev'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Game Mechanics & Assets',
        description: 'สร้าง Game Mechanics ที่ซับซ้อน Physics และ AI เบื้องต้น',
        requiredSkills: ['Game Mechanics', 'Physics Engine', 'Sound Design', 'Level Design'],
        recommendedCamps: ['game-dev', 'graphic-design'],
        duration: '6-9 เดือน'
      },
      {
        level: 'advanced',
        title: 'Publishing & Live Ops',
        description: 'Publish เกม จัดการ Monetization และ Live Operations',
        requiredSkills: ['Game Publishing', 'Monetization', 'Analytics', 'Multiplayer'],
        recommendedCamps: ['game-dev'],
        duration: '12+ เดือน'
      }
    ]
  },

  // ─── อาชีพเพิ่มเติมจาก RIASEC combinations ──────────────────────────────

  // R + I: วิศวกรเครือข่าย (Network Engineer)
  {
    id: 'network-engineer',
    name: 'Network Engineer',
    nameTh: 'วิศวกรเครือข่าย',
    description: 'มีหน้าที่ดูแลและจัดการโครงสร้างพื้นฐานของระบบเครือข่ายในองค์กร เพื่อให้ระบบทำงานได้อย่างมีประสิทธิภาพและปลอดภัย',
    personality: 'คุณชอบการลงมือปฏิบัติและแก้ไขปัญหาเชิงตรรกะ เหมาะกับงานที่ต้องจัดการกับระบบและโครงสร้างพื้นฐานของไอที',
    riasecCodes: ['R', 'I'],
    requiredTags: ['devops', 'cloud', 'cybersecurity'],
    recommendedTags: ['docker', 'kubernetes'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐานคอมพิวเตอร์และเครือข่าย',
        description: 'เรียนรู้พื้นฐานการทำงานของคอมพิวเตอร์และระบบเครือข่าย',
        requiredSkills: ['Basic Computer', 'Network Fundamentals'],
        recommendedCamps: ['iot', 'cybersecurity'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'การจัดการระบบและเครือข่าย',
        description: 'ฝึกปฏิบัติการตั้งค่าและจัดการระบบเครือข่าย',
        requiredSkills: ['Network Configuration', 'Server Management'],
        recommendedCamps: ['devops', 'cloud'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'ความปลอดภัยและ Cloud Infrastructure',
        description: 'เชี่ยวชาญด้านความปลอดภัยและการจัดการ cloud',
        requiredSkills: ['Network Security', 'Cloud Architecture', 'Automation'],
        recommendedCamps: ['cybersecurity', 'cloud', 'devops'],
        duration: '6-12 เดือน'
      }
    ]
  },

  // I + A: นักวิทยาศาสตร์ข้อมูล (Data Scientist)
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    nameTh: 'นักวิทยาศาสตร์ข้อมูล',
    description: 'มีหน้าที่ใช้ทักษะทางคณิตศาสตร์, สถิติ และการเขียนโปรแกรม เพื่อวิเคราะห์ข้อมูลขนาดใหญ่และค้นหาแบบแผนที่ซ่อนอยู่',
    personality: 'คุณเป็นคนช่างคิดวิเคราะห์และมีความคิดสร้างสรรค์ เหมาะกับงานที่ต้องวิเคราะห์ข้อมูลเชิงลึกและนำเสนอผลลัพธ์ในรูปแบบที่เข้าใจง่าย',
    riasecCodes: ['I', 'A'],
    requiredTags: ['data-science', 'machine-learning', 'python'],
    recommendedTags: ['data-visualization', 'ai'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐาน Python และสถิติ',
        description: 'เรียนรู้ Python และสถิติพื้นฐาน',
        requiredSkills: ['Python Programming', 'Basic Statistics'],
        recommendedCamps: ['python', 'data-science'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Data Analysis และ Machine Learning',
        description: 'ฝึกวิเคราะห์ข้อมูลและสร้างโมเดล ML',
        requiredSkills: ['Data Analysis', 'Machine Learning Basics'],
        recommendedCamps: ['data-science', 'machine-learning'],
        duration: '6-8 เดือน'
      },
      {
        level: 'advanced',
        title: 'Advanced ML และ AI',
        description: 'เชี่ยวชาญด้าน Machine Learning และ AI',
        requiredSkills: ['Deep Learning', 'Advanced ML', 'Big Data'],
        recommendedCamps: ['machine-learning', 'ai', 'data-science'],
        duration: '12+ เดือน'
      }
    ]
  },

  // I + S: นักวิเคราะห์ธุรกิจ (Business Analyst)
  {
    id: 'business-analyst',
    name: 'Business Analyst',
    nameTh: 'นักวิเคราะห์ธุรกิจ',
    description: 'มีหน้าที่วิเคราะห์ความต้องการทางธุรกิจและปัญหาต่างๆ แล้วนำมาแปลงเป็นข้อกำหนดที่ชัดเจนสำหรับทีมพัฒนา',
    personality: 'คุณใช้ทักษะการวิเคราะห์เพื่อทำความเข้าใจปัญหาและสื่อสารกับผู้ใช้งานหรือลูกค้า',
    riasecCodes: ['I', 'S'],
    requiredTags: ['data-visualization'],
    recommendedTags: ['python', 'database'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐานการวิเคราะห์ธุรกิจ',
        description: 'เรียนรู้หลักการวิเคราะห์ธุรกิจ',
        requiredSkills: ['Business Analysis Basics', 'Communication'],
        recommendedCamps: ['data-visualization'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'การวิเคราะห์ข้อมูลและรายงาน',
        description: 'ฝึกวิเคราะห์และนำเสนอข้อมูล',
        requiredSkills: ['Data Analysis', 'Reporting', 'SQL'],
        recommendedCamps: ['data-visualization', 'database'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'Strategic Business Analysis',
        description: 'เชี่ยวชาญการวิเคราะห์เชิงกลยุทธ์',
        requiredSkills: ['Strategic Analysis', 'Process Improvement'],
        recommendedCamps: ['data-science'],
        duration: '8-12 เดือน'
      }
    ]
  },

  // I + E: ผู้จัดการผลิตภัณฑ์ (Product Manager)
  {
    id: 'product-manager',
    name: 'Product Manager',
    nameTh: 'ผู้จัดการผลิตภัณฑ์',
    description: 'รับผิดชอบการวางแผนและจัดการผลิตภัณฑ์ตั้งแต่แนวคิดเริ่มต้นจนถึงการเปิดตัวและดูแลผลิตภัณฑ์ในตลาด',
    personality: 'คุณวิเคราะห์ความเสี่ยงและวางแผนผลิตภัณฑ์อย่างรอบด้าน และใช้ทักษะความเป็นผู้นำในการบริหารจัดการทีมให้บรรลุเป้าหมาย',
    riasecCodes: ['I', 'E'],
    requiredTags: ['ui-ux'],
    recommendedTags: ['data-visualization', 'mobile-dev'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐานการจัดการผลิตภัณฑ์',
        description: 'เรียนรู้หลักการ Product Management',
        requiredSkills: ['Product Basics', 'User Research'],
        recommendedCamps: ['ui-ux'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Product Development',
        description: 'ฝึกพัฒนาและจัดการผลิตภัณฑ์',
        requiredSkills: ['Product Strategy', 'Roadmap Planning'],
        recommendedCamps: ['ui-ux', 'data-visualization'],
        duration: '6-9 เดือน'
      },
      {
        level: 'advanced',
        title: 'Strategic Product Leadership',
        description: 'เชี่ยวชาญการบริหารผลิตภัณฑ์',
        requiredSkills: ['Product Strategy', 'Market Analysis', 'Leadership'],
        recommendedCamps: ['ui-ux'],
        duration: '12+ เดือน'
      }
    ]
  },

  // I + C: ผู้ดูแลฐานข้อมูล (Database Administrator)
  {
    id: 'database-administrator',
    name: 'Database Administrator',
    nameTh: 'ผู้ดูแลฐานข้อมูล',
    description: 'มีหน้าที่จัดการและดูแลฐานข้อมูลขององค์กรให้มีประสิทธิภาพและปลอดภัย รวมถึงการออกแบบโครงสร้างฐานข้อมูล',
    personality: 'คุณชอบวิเคราะห์โครงสร้างข้อมูลและจัดการฐานข้อมูลให้เป็นระบบระเบียบและปลอดภัย',
    riasecCodes: ['I', 'C'],
    requiredTags: ['database'],
    recommendedTags: ['cloud', 'devops'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐานฐานข้อมูล',
        description: 'เรียนรู้ SQL และฐานข้อมูลพื้นฐาน',
        requiredSkills: ['SQL Basics', 'Database Design'],
        recommendedCamps: ['database'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'การจัดการฐานข้อมูล',
        description: 'ฝึกจัดการและดูแลฐานข้อมูล',
        requiredSkills: ['Database Administration', 'Performance Tuning'],
        recommendedCamps: ['database', 'cloud'],
        duration: '6-8 เดือน'
      },
      {
        level: 'advanced',
        title: 'Advanced Database Management',
        description: 'เชี่ยวชาญการจัดการฐานข้อมูลขั้นสูง',
        requiredSkills: ['High Availability', 'Disaster Recovery', 'Cloud Databases'],
        recommendedCamps: ['database', 'cloud', 'devops'],
        duration: '12+ เดือน'
      }
    ]
  },

  // R + A: นักออกแบบกราฟิกคอมพิวเตอร์ (Computer Graphics Designer)
  {
    id: 'computer-graphics-designer',
    name: 'Computer Graphics Designer',
    nameTh: 'นักออกแบบกราฟิกคอมพิวเตอร์',
    description: 'มีหน้าที่สร้างสรรค์ผลงานกราฟิก, ภาพเคลื่อนไหว หรือโมเดล 3 มิติสำหรับภาพยนตร์, เกม หรือแอปพลิเคชัน',
    personality: 'คุณถนัดงานเชิงปฏิบัติและมีความคิดสร้างสรรค์ในการสร้างภาพหรือโมเดล 3 มิติ',
    riasecCodes: ['R', 'A'],
    requiredTags: ['graphic-design', 'figma', 'game-dev'],
    recommendedTags: ['ui-ux'],
    demandLevel: 'medium',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐานการออกแบบ',
        description: 'เรียนรู้หลักการออกแบบและเครื่องมือพื้นฐาน',
        requiredSkills: ['Design Principles', 'Figma Basics'],
        recommendedCamps: ['graphic-design', 'figma'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'การสร้างภาพและแอนิเมชัน',
        description: 'ฝึกทักษะการสร้างกราฟิกและภาพเคลื่อนไหว',
        requiredSkills: ['2D/3D Graphics', 'Animation'],
        recommendedCamps: ['graphic-design', 'game-dev'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'การออกแบบเกมและโมเดล 3D',
        description: 'เชี่ยวชาญการสร้างโมเดล 3D และออกแบบสำหรับเกม',
        requiredSkills: ['3D Modeling', 'Game Design', 'VFX'],
        recommendedCamps: ['game-dev'],
        duration: '6-12 เดือน'
      }
    ]
  },

  // S + E: ที่ปรึกษาด้านเทคโนโลยี (IT Consultant)
  {
    id: 'it-consultant',
    name: 'IT Consultant',
    nameTh: 'ที่ปรึกษาด้านเทคโนโลยี',
    description: 'ทำหน้าที่ให้คำปรึกษาและแก้ไขปัญหาทางเทคนิคให้กับลูกค้า โดยต้องทำความเข้าใจความต้องการทางธุรกิจของลูกค้า และนำเสนอโซลูชันที่เหมาะสม',
    personality: 'คุณใช้ทักษะการสื่อสารเพื่อช่วยเหลือลูกค้าและใช้ทักษะการบริหารจัดการเพื่อนำเสนอโซลูชันทางธุรกิจ',
    riasecCodes: ['S', 'E'],
    requiredTags: [],
    recommendedTags: ['cloud', 'devops', 'database'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐาน IT และธุรกิจ',
        description: 'เรียนรู้พื้นฐาน IT และการวิเคราะห์ธุรกิจ',
        requiredSkills: ['IT Fundamentals', 'Business Analysis'],
        recommendedCamps: ['cloud'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Solution Design',
        description: 'ฝึกออกแบบและนำเสนอโซลูชัน',
        requiredSkills: ['Solution Architecture', 'Client Management'],
        recommendedCamps: ['cloud', 'devops'],
        duration: '6-9 เดือน'
      },
      {
        level: 'advanced',
        title: 'Strategic IT Consulting',
        description: 'เชี่ยวชาญการให้คำปรึกษาระดับกลยุทธ์',
        requiredSkills: ['Strategic Planning', 'Change Management'],
        recommendedCamps: ['cloud', 'devops'],
        duration: '12+ เดือน'
      }
    ]
  },

  // A + E: ผู้จัดการฝ่ายการตลาดดิจิทัล (Digital Marketing Manager)
  {
    id: 'digital-marketing-manager',
    name: 'Digital Marketing Manager',
    nameTh: 'ผู้จัดการฝ่ายการตลาดดิจิทัล',
    description: 'รับผิดชอบการวางแผนและบริหารจัดการแคมเปญการตลาดออนไลน์ทั้งหมด เพื่อเพิ่มการรับรู้แบรนด์และยอดขาย',
    personality: 'คุณใช้ความคิดสร้างสรรค์เพื่อวางแผนแคมเปญการตลาด และใช้ทักษะการเป็นผู้นำเพื่อผลักดันให้ประสบความสำเร็จ',
    riasecCodes: ['A', 'E'],
    requiredTags: ['ui-ux', 'graphic-design'],
    recommendedTags: ['data-visualization'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐาน Digital Marketing',
        description: 'เรียนรู้หลักการตลาดดิจิทัล',
        requiredSkills: ['Marketing Basics', 'SEO/SEM'],
        recommendedCamps: ['ui-ux', 'graphic-design'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Campaign Management',
        description: 'ฝึกวางแผนและบริหารแคมเปญ',
        requiredSkills: ['Campaign Planning', 'Analytics'],
        recommendedCamps: ['ui-ux', 'data-visualization'],
        duration: '6-8 เดือน'
      },
      {
        level: 'advanced',
        title: 'Strategic Marketing Leadership',
        description: 'เชี่ยวชาญการบริหารการตลาดดิจิทัล',
        requiredSkills: ['Marketing Strategy', 'Team Leadership', 'ROI Analysis'],
        recommendedCamps: ['data-visualization'],
        duration: '12+ เดือน'
      }
    ]
  }
];

// Helper function สำหรับหาอาชีพที่เหมาะสมตาม RIASEC scores
export function getRecommendedCareers(riasecScores: Record<RIASECCode, number>): Career[] {
  // หา top 2 RIASEC codes
  const sortedCodes = Object.entries(riasecScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([code]) => code as RIASECCode);

  // หาอาชีพที่ match กับ RIASEC codes
  return IT_CAREERS.filter(career => {
    const careerCodes = career.riasecCodes;
    return (
      (careerCodes.includes(sortedCodes[0]) && careerCodes.includes(sortedCodes[1])) ||
      careerCodes.includes(sortedCodes[0])
    );
  });
}

// Helper function สำหรับหาอาชีพที่เหมาะสมตาม tags
export function getCareersByTags(userTags: string[]): Career[] {
  return IT_CAREERS.filter(career => {
    const careerTags = [...career.requiredTags, ...career.recommendedTags];
    // ถ้ามี tag ตรงกันอย่างน้อย 1 tag
    return userTags.some(tag => careerTags.includes(tag));
  }).sort((a, b) => {
    // เรียงตามจำนวน tags ที่ตรงกัน
    const aTags = [...a.requiredTags, ...a.recommendedTags];
    const bTags = [...b.requiredTags, ...b.recommendedTags];
    const aMatches = userTags.filter(tag => aTags.includes(tag)).length;
    const bMatches = userTags.filter(tag => bTags.includes(tag)).length;
    return bMatches - aMatches;
  });
}
