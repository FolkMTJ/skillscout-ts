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
  },

  // ─── 19 อาชีพเพิ่มเติม ครบ 30 permutations ──────────────────────────────

  // AR - Artistic + Realistic
  {
    id: 'ux-researcher',
    name: 'UX Researcher',
    nameTh: 'นักวิจัย UX',
    description: 'ทำการวิจัยพฤติกรรมผู้ใช้ด้วยการทดสอบ Prototype และวิเคราะห์ข้อมูลเชิงคุณภาพ เพื่อนำมาออกแบบประสบการณ์ที่ดีที่สุด',
    personality: 'คุณมีความคิดสร้างสรรค์ในการออกแบบ และชอบทำการทดลองเชิงปฏิบัติกับผู้ใช้จริง',
    riasecCodes: ['A', 'R'],
    requiredTags: ['ux-design', 'html-css'],
    recommendedTags: ['data-analytics', 'mobile-dev'],
    demandLevel: 'high',
    averageSalary: '45,000 - 80,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐาน UX Research',
        description: 'เรียนรู้วิธี User Interview, Usability Testing และ Survey Design',
        requiredSkills: ['User Interview', 'Usability Testing', 'Wireframing'],
        recommendedCamps: ['ux-design', 'html-css'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Research Methods & Prototyping',
        description: 'เชี่ยวชาญ Prototype ทดสอบ A/B Testing และ Heuristic Evaluation',
        requiredSkills: ['Figma', 'A/B Testing', 'Affinity Mapping'],
        recommendedCamps: ['ux-design', 'data-analytics'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'Strategic UX Research',
        description: 'กำหนดกลยุทธ์งานวิจัยระดับองค์กรและ Mixed Methods Research',
        requiredSkills: ['Research Strategy', 'Quantitative Analysis', 'Stakeholder Management'],
        recommendedCamps: ['data-analytics'],
        duration: '12+ เดือน'
      }
    ]
  },

  // RS - Realistic + Social
  {
    id: 'it-support-engineer',
    name: 'IT Support Engineer',
    nameTh: 'วิศวกรซัพพอร์ต IT',
    description: 'ให้บริการและแก้ไขปัญหาระบบ IT ให้กับองค์กร ทั้งฮาร์ดแวร์ ซอฟต์แวร์ และเครือข่าย โดยทำงานใกล้ชิดกับผู้ใช้โดยตรง',
    personality: 'คุณชอบทำงานกับระบบจริงๆ และสนุกกับการช่วยเหลือผู้อื่นแก้ปัญหาด้านเทคโนโลยี',
    riasecCodes: ['R', 'S'],
    requiredTags: ['networking', 'cybersecurity'],
    recommendedTags: ['cloud', 'devops'],
    demandLevel: 'high',
    averageSalary: '25,000 - 50,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐาน IT Support',
        description: 'เรียนรู้ระบบปฏิบัติการ เครือข่ายพื้นฐาน และการแก้ปัญหาเบื้องต้น',
        requiredSkills: ['Windows/Linux', 'Networking Basics', 'Troubleshooting'],
        recommendedCamps: ['networking', 'cybersecurity'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'System & Network Administration',
        description: 'บริหารจัดการ Server, Active Directory และระบบเครือข่ายองค์กร',
        requiredSkills: ['Active Directory', 'Server Administration', 'ITIL'],
        recommendedCamps: ['networking', 'cloud'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'IT Infrastructure Management',
        description: 'วางแผนและบริหาร IT Infrastructure ระดับองค์กรขนาดใหญ่',
        requiredSkills: ['Infrastructure Planning', 'Virtualization', 'Disaster Recovery'],
        recommendedCamps: ['cloud', 'devops'],
        duration: '12+ เดือน'
      }
    ]
  },

  // SR - Social + Realistic
  {
    id: 'developer-advocate',
    name: 'Developer Advocate',
    nameTh: 'Developer Advocate',
    description: 'สร้างสะพานเชื่อมระหว่างชุมชนนักพัฒนากับบริษัท ด้วยการสาธิต สอน และรับฟัง Feedback จากนักพัฒนาจริงๆ',
    personality: 'คุณรักการสื่อสารและการสร้างชุมชน พร้อมทั้งสนุกกับการลงมือสร้างของจริงเพื่อใช้สาธิต',
    riasecCodes: ['S', 'R'],
    requiredTags: ['python', 'javascript', 'html-css'],
    recommendedTags: ['cloud', 'ai'],
    demandLevel: 'medium',
    averageSalary: '50,000 - 100,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Technical Communication',
        description: 'เรียนรู้การเขียน Blog เทคนิค การทำ Demo และการพูดต่อหน้าชุมชน',
        requiredSkills: ['Technical Writing', 'Public Speaking', 'Coding Basics'],
        recommendedCamps: ['python', 'javascript'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Community Building',
        description: 'จัด Workshop สร้าง Tutorial สาธิต API และบริหาร Developer Community',
        requiredSkills: ['Workshop Facilitation', 'API Design', 'Content Creation'],
        recommendedCamps: ['cloud', 'javascript'],
        duration: '6-12 เดือน'
      },
      {
        level: 'advanced',
        title: 'Developer Relations Strategy',
        description: 'กำหนดกลยุทธ์ Developer Relations ระดับองค์กรและวัด Community KPIs',
        requiredSkills: ['DevRel Strategy', 'Community Analytics', 'Partner Management'],
        recommendedCamps: ['cloud', 'ai'],
        duration: '12+ เดือน'
      }
    ]
  },

  // RE - Realistic + Enterprising
  {
    id: 'solutions-engineer',
    name: 'Solutions Engineer',
    nameTh: 'วิศวกรโซลูชัน',
    description: 'ออกแบบและนำเสนอโซลูชันทางเทคนิคให้กับลูกค้า เชื่อมโยงความต้องการทางธุรกิจกับการแก้ปัญหาด้านเทคโนโลยี',
    personality: 'คุณชอบแก้ปัญหาเชิงปฏิบัติ และมีทักษะในการนำเสนอโซลูชันให้ผู้อื่นเข้าใจ',
    riasecCodes: ['R', 'E'],
    requiredTags: ['networking', 'cloud', 'database'],
    recommendedTags: ['devops', 'cybersecurity'],
    demandLevel: 'high',
    averageSalary: '55,000 - 110,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Technical Foundation',
        description: 'เรียนรู้ระบบ IT หลายด้านและทักษะการนำเสนอทางเทคนิค',
        requiredSkills: ['Networking', 'Cloud Basics', 'Presentation Skills'],
        recommendedCamps: ['networking', 'cloud'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Solution Design',
        description: 'ออกแบบโซลูชันสำหรับลูกค้า ทำ POC และ Demo ระบบ',
        requiredSkills: ['Solution Architecture', 'POC Development', 'Business Analysis'],
        recommendedCamps: ['cloud', 'database'],
        duration: '6-12 เดือน'
      },
      {
        level: 'advanced',
        title: 'Enterprise Solutions',
        description: 'บริหารโปรเจกต์ใหญ่ระดับ Enterprise และสร้าง Partnership',
        requiredSkills: ['Enterprise Architecture', 'Project Management', 'Sales Engineering'],
        recommendedCamps: ['devops', 'cybersecurity'],
        duration: '12+ เดือน'
      }
    ]
  },

  // ER - Enterprising + Realistic
  {
    id: 'cto',
    name: 'Chief Technology Officer',
    nameTh: 'ประธานเจ้าหน้าที่ฝ่ายเทคโนโลยี',
    description: 'บริหารทิศทางเทคโนโลยีขององค์กร ตัดสินใจด้าน Tech Stack วางแผน Roadmap และนำทีมวิศวกรรม',
    personality: 'คุณมีวิสัยทัศน์ทางธุรกิจ ชอบตัดสินใจใหญ่ และยังคงรักษาความเชี่ยวชาญด้านเทคนิคไว้',
    riasecCodes: ['E', 'R'],
    requiredTags: ['devops', 'cloud', 'database'],
    recommendedTags: ['ai', 'cybersecurity'],
    demandLevel: 'high',
    averageSalary: '150,000 - 350,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Technical Leadership Foundation',
        description: 'พัฒนาทักษะ Tech Lead เข้าใจ Business Model และ Team Management',
        requiredSkills: ['Leadership', 'System Design', 'Agile/Scrum'],
        recommendedCamps: ['devops', 'cloud'],
        duration: '6-12 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Engineering Management',
        description: 'บริหารทีมวิศวกร กำหนด Tech Strategy และ OKRs',
        requiredSkills: ['Engineering Management', 'OKR Setting', 'Budget Planning'],
        recommendedCamps: ['cloud', 'ai'],
        duration: '2-4 ปี'
      },
      {
        level: 'advanced',
        title: 'Executive Technology Leadership',
        description: 'กำหนดทิศทาง Innovation ระดับองค์กร สร้าง Tech Culture',
        requiredSkills: ['Executive Leadership', 'Innovation Strategy', 'Board Communication'],
        recommendedCamps: ['ai', 'cybersecurity'],
        duration: '5+ ปี'
      }
    ]
  },

  // CR - Conventional + Realistic
  {
    id: 'qa-engineer',
    name: 'QA Engineer',
    nameTh: 'วิศวกรประกันคุณภาพ',
    description: 'ออกแบบและดำเนินการทดสอบซอฟต์แวร์ทั้ง Manual และ Automated เพื่อรับประกันคุณภาพก่อนส่งมอบ',
    personality: 'คุณมีความละเอียดรอบคอบ ชอบทำงานอย่างเป็นระบบ และมีความพึงพอใจในการค้นหา Bug',
    riasecCodes: ['C', 'R'],
    requiredTags: ['python', 'javascript', 'devops'],
    recommendedTags: ['cybersecurity', 'database'],
    demandLevel: 'high',
    averageSalary: '35,000 - 75,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Manual Testing',
        description: 'เรียนรู้ Test Case Design, Bug Reporting และ Testing Lifecycle',
        requiredSkills: ['Test Case Design', 'Bug Reporting', 'Testing Concepts'],
        recommendedCamps: ['python', 'javascript'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Test Automation',
        description: 'เขียน Automated Test ด้วย Selenium, Cypress หรือ Playwright',
        requiredSkills: ['Selenium/Cypress', 'API Testing', 'CI/CD Integration'],
        recommendedCamps: ['javascript', 'devops'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'QA Strategy & Performance Testing',
        description: 'กำหนดกลยุทธ์ Quality Assurance และ Performance/Load Testing',
        requiredSkills: ['Test Strategy', 'Performance Testing', 'Security Testing'],
        recommendedCamps: ['devops', 'cybersecurity'],
        duration: '12+ เดือน'
      }
    ]
  },

  // SI - Social + Investigative
  {
    id: 'technical-educator',
    name: 'Technical Educator',
    nameTh: 'นักการศึกษาด้านเทคโนโลยี',
    description: 'สอน ออกแบบหลักสูตร และพัฒนาสื่อการเรียนรู้ด้านเทคโนโลยีสำหรับผู้เรียนทุกระดับ',
    personality: 'คุณรักการสอนและการถ่ายทอดความรู้ ควบคู่ไปกับความหลงใหลในการเรียนรู้สิ่งใหม่ๆ ตลอดเวลา',
    riasecCodes: ['S', 'I'],
    requiredTags: ['python', 'javascript', 'html-css'],
    recommendedTags: ['ai', 'database'],
    demandLevel: 'medium',
    averageSalary: '35,000 - 70,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Teaching Fundamentals',
        description: 'เรียนรู้ Instructional Design, Pedagogy และทักษะการนำเสนอ',
        requiredSkills: ['Instructional Design', 'Curriculum Planning', 'Teaching Methods'],
        recommendedCamps: ['python', 'javascript'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'EdTech & Content Creation',
        description: 'สร้างหลักสูตรออนไลน์ Learning Management System และ Interactive Content',
        requiredSkills: ['LMS Administration', 'E-learning Design', 'Assessment Design'],
        recommendedCamps: ['html-css', 'javascript'],
        duration: '6-12 เดือน'
      },
      {
        level: 'advanced',
        title: 'Education Program Leadership',
        description: 'บริหารโปรแกรมการศึกษา วัดผล Learning Outcomes และวิจัยนวัตกรรม EdTech',
        requiredSkills: ['Program Management', 'Learning Analytics', 'EdTech Research'],
        recommendedCamps: ['ai', 'data-analytics'],
        duration: '12+ เดือน'
      }
    ]
  },

  // EI - Enterprising + Investigative
  {
    id: 'innovation-manager',
    name: 'Innovation Manager',
    nameTh: 'ผู้จัดการนวัตกรรม',
    description: 'ขับเคลื่อนนวัตกรรมในองค์กร ค้นหาเทคโนโลยีใหม่ ทำ R&D และนำไปต่อยอดเป็นโอกาสทางธุรกิจ',
    personality: 'คุณมีวิสัยทัศน์ด้านธุรกิจ และชอบค้นคว้าทดลองเทคโนโลยีใหม่เพื่อสร้างความได้เปรียบในตลาด',
    riasecCodes: ['E', 'I'],
    requiredTags: ['ai', 'cloud'],
    recommendedTags: ['data-analytics', 'cybersecurity'],
    demandLevel: 'high',
    averageSalary: '70,000 - 140,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Innovation Fundamentals',
        description: 'เรียนรู้ Design Thinking, Lean Startup และการประเมินเทคโนโลยีใหม่',
        requiredSkills: ['Design Thinking', 'Lean Startup', 'Technology Scouting'],
        recommendedCamps: ['ai', 'cloud'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'R&D & Prototyping',
        description: 'ทำ Proof of Concept นำเทคโนโลยีใหม่มาทดลองใช้ในองค์กร',
        requiredSkills: ['POC Development', 'Agile Innovation', 'Stakeholder Buy-in'],
        recommendedCamps: ['ai', 'data-analytics'],
        duration: '6-12 เดือน'
      },
      {
        level: 'advanced',
        title: 'Innovation Strategy',
        description: 'กำหนด Innovation Roadmap ระดับองค์กรและสร้าง Innovation Culture',
        requiredSkills: ['Innovation Strategy', 'Corporate Venture', 'Open Innovation'],
        recommendedCamps: ['ai', 'cybersecurity'],
        duration: '12+ เดือน'
      }
    ]
  },

  // CI - Conventional + Investigative
  {
    id: 'it-auditor',
    name: 'IT Auditor',
    nameTh: 'ผู้ตรวจสอบ IT',
    description: 'ตรวจสอบและประเมินระบบ IT ด้านความปลอดภัย การปฏิบัติตามกฎระเบียบ และความเสี่ยงของระบบสารสนเทศ',
    personality: 'คุณมีความละเอียดถี่ถ้วนสูง ชอบวิเคราะห์ระบบเชิงลึก และพอใจกับการค้นพบช่องโหว่ที่ซ่อนอยู่',
    riasecCodes: ['C', 'I'],
    requiredTags: ['cybersecurity', 'database'],
    recommendedTags: ['networking', 'cloud'],
    demandLevel: 'medium',
    averageSalary: '40,000 - 85,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'IT Audit Fundamentals',
        description: 'เรียนรู้ COBIT, ITIL มาตรฐาน ISO 27001 และกระบวนการ Audit',
        requiredSkills: ['COBIT', 'ISO 27001', 'Risk Assessment Basics'],
        recommendedCamps: ['cybersecurity', 'database'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Compliance & Risk Analysis',
        description: 'ดำเนินการ IT Audit จริง วิเคราะห์ความเสี่ยงและเขียนรายงาน',
        requiredSkills: ['Audit Execution', 'Compliance Analysis', 'Report Writing'],
        recommendedCamps: ['cybersecurity', 'networking'],
        duration: '6-12 เดือน'
      },
      {
        level: 'advanced',
        title: 'Enterprise Governance',
        description: 'กำหนด IT Governance Framework และบริหาร Enterprise Risk',
        requiredSkills: ['IT Governance', 'Enterprise Risk Management', 'Regulatory Compliance'],
        recommendedCamps: ['cloud', 'cybersecurity'],
        duration: '12+ เดือน'
      }
    ]
  },

  // SA - Social + Artistic
  {
    id: 'digital-content-creator',
    name: 'Digital Content Creator',
    nameTh: 'ผู้สร้างคอนเทนต์ดิจิทัล',
    description: 'สร้างสรรค์เนื้อหาดิจิทัลที่น่าสนใจในรูปแบบต่างๆ ทั้งวิดีโอ บทความ และโซเชียลมีเดีย เพื่อเชื่อมต่อกับผู้ชม',
    personality: 'คุณชอบสื่อสารกับผู้คน มีความคิดสร้างสรรค์ และสนุกกับการสร้างคอนเทนต์ที่สร้างผลกระทบ',
    riasecCodes: ['S', 'A'],
    requiredTags: ['ux-design', 'html-css'],
    recommendedTags: ['data-analytics', 'ai'],
    demandLevel: 'high',
    averageSalary: '25,000 - 70,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Content Creation Basics',
        description: 'เรียนรู้การผลิตวิดีโอ การเขียน Copywriting และใช้ Social Media',
        requiredSkills: ['Video Production', 'Copywriting', 'Social Media Basics'],
        recommendedCamps: ['ux-design', 'html-css'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Multi-platform Content Strategy',
        description: 'สร้าง Content Strategy ข้ามแพลตฟอร์ม วิเคราะห์ Analytics และ SEO',
        requiredSkills: ['Content Strategy', 'SEO', 'Analytics'],
        recommendedCamps: ['data-analytics', 'html-css'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'Brand Content Leadership',
        description: 'กำหนดทิศทาง Brand Storytelling และบริหารทีม Content',
        requiredSkills: ['Brand Strategy', 'Team Leadership', 'Content Monetization'],
        recommendedCamps: ['ai', 'data-analytics'],
        duration: '12+ เดือน'
      }
    ]
  },

  // AE - Artistic + Enterprising
  {
    id: 'creative-tech-director',
    name: 'Creative Tech Director',
    nameTh: 'ผู้อำนวยการสร้างสรรค์ด้านเทคโนโลยี',
    description: 'นำทีม Design และเทคโนโลยีเพื่อสร้างผลิตภัณฑ์ที่ดีทั้งด้านภาพลักษณ์และฟังก์ชัน พร้อมขับเคลื่อนทิศทาง Creative ขององค์กร',
    personality: 'คุณมีวิสัยทัศน์ด้าน Design และชอบนำทีมสร้างงานที่สวยงามและมีผลกระทบทางธุรกิจ',
    riasecCodes: ['A', 'E'],
    requiredTags: ['ux-design', 'html-css'],
    recommendedTags: ['mobile-dev', 'game-dev'],
    demandLevel: 'medium',
    averageSalary: '70,000 - 150,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Creative & Leadership Foundation',
        description: 'พัฒนาทักษะ Design หลายด้านและเริ่มบริหารทีม Creative เล็กๆ',
        requiredSkills: ['UI/UX Design', 'Brand Identity', 'Team Collaboration'],
        recommendedCamps: ['ux-design', 'html-css'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Creative Direction',
        description: 'กำหนด Visual Direction ของโปรเจกต์ บริหาร Creative Team และทำงานกับ Stakeholder',
        requiredSkills: ['Art Direction', 'Creative Briefing', 'Stakeholder Management'],
        recommendedCamps: ['ux-design', 'mobile-dev'],
        duration: '6-12 เดือน'
      },
      {
        level: 'advanced',
        title: 'Executive Creative Leadership',
        description: 'กำหนด Creative Strategy ระดับองค์กร สร้าง Design Culture และวัด Business Impact',
        requiredSkills: ['Creative Strategy', 'Brand Architecture', 'Business Acumen'],
        recommendedCamps: ['mobile-dev', 'game-dev'],
        duration: '12+ เดือน'
      }
    ]
  },

  // EA - Enterprising + Artistic
  {
    id: 'growth-hacker',
    name: 'Growth Hacker',
    nameTh: 'Growth Hacker',
    description: 'ใช้ความคิดสร้างสรรค์และข้อมูลเพื่อออกแบบและทดลองกลยุทธ์การเติบโตของผลิตภัณฑ์อย่างรวดเร็ว',
    personality: 'คุณมีไฟในการขับเคลื่อนการเติบโต ชอบทดลองไอเดียใหม่ และมีทักษะทั้งด้านธุรกิจและงาน Creative',
    riasecCodes: ['E', 'A'],
    requiredTags: ['data-analytics', 'html-css'],
    recommendedTags: ['ai', 'javascript'],
    demandLevel: 'high',
    averageSalary: '45,000 - 100,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Growth Fundamentals',
        description: 'เรียนรู้ AARRR Metrics, A/B Testing และ Basic Digital Marketing',
        requiredSkills: ['Growth Metrics', 'A/B Testing', 'Digital Marketing Basics'],
        recommendedCamps: ['html-css', 'data-analytics'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Growth Experiments',
        description: 'ออกแบบและรันการทดลอง Growth Hack ด้วย Data-driven approach',
        requiredSkills: ['Funnel Optimization', 'Viral Mechanics', 'Marketing Automation'],
        recommendedCamps: ['data-analytics', 'javascript'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'Growth Strategy',
        description: 'กำหนดกลยุทธ์ Growth ระดับบริษัท บริหารทีม Growth และวัด CAC/LTV',
        requiredSkills: ['Growth Strategy', 'Product-Led Growth', 'Revenue Optimization'],
        recommendedCamps: ['ai', 'data-analytics'],
        duration: '12+ เดือน'
      }
    ]
  },

  // AC - Artistic + Conventional
  {
    id: 'technical-writer',
    name: 'Technical Writer',
    nameTh: 'นักเขียนด้านเทคนิค',
    description: 'เขียนเอกสาร API คู่มือผู้ใช้ และเนื้อหาทางเทคนิคที่ซับซ้อนให้เข้าใจง่าย สวยงาม และมีโครงสร้างชัดเจน',
    personality: 'คุณมีความคิดสร้างสรรค์ในการนำเสนอข้อมูล ชอบความเป็นระเบียบ และสื่อสารเทคนิคได้อย่างชัดเจน',
    riasecCodes: ['A', 'C'],
    requiredTags: ['html-css', 'javascript'],
    recommendedTags: ['ux-design', 'database'],
    demandLevel: 'medium',
    averageSalary: '30,000 - 65,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Technical Writing Basics',
        description: 'เรียนรู้การเขียน Documentation สำหรับ Developer, API Docs และการใช้ Markdown',
        requiredSkills: ['Technical Writing', 'Markdown', 'API Documentation'],
        recommendedCamps: ['html-css', 'javascript'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Documentation Systems',
        description: 'สร้าง Doc Sites ด้วย Docusaurus/GitBook และวางโครงสร้าง Information Architecture',
        requiredSkills: ['Docs-as-Code', 'Information Architecture', 'Style Guide'],
        recommendedCamps: ['javascript', 'ux-design'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'Docs Strategy & Management',
        description: 'กำหนดกลยุทธ์ Documentation ระดับองค์กรและวัด Docs Quality',
        requiredSkills: ['Content Strategy', 'Docs Metrics', 'Developer Experience'],
        recommendedCamps: ['ux-design', 'database'],
        duration: '12+ เดือน'
      }
    ]
  },

  // CA - Conventional + Artistic
  {
    id: 'digital-asset-manager',
    name: 'Digital Asset Manager',
    nameTh: 'ผู้จัดการสินทรัพย์ดิจิทัล',
    description: 'จัดระบบ จัดเก็บ และบริหาร Asset ดิจิทัลทั้งหมดขององค์กร ทั้งภาพ วิดีโอ และสื่อ ให้เป็นระเบียบและเข้าถึงได้ง่าย',
    personality: 'คุณชอบความเป็นระเบียบ มีรสนิยมด้านภาพ และพอใจกับการสร้างระบบจัดการที่มีประสิทธิภาพ',
    riasecCodes: ['C', 'A'],
    requiredTags: ['ux-design', 'database'],
    recommendedTags: ['cloud', 'html-css'],
    demandLevel: 'low',
    averageSalary: '25,000 - 55,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'DAM Fundamentals',
        description: 'เรียนรู้หลักการจัดการ Digital Asset, Metadata และ Taxonomy',
        requiredSkills: ['Asset Organization', 'Metadata Management', 'File Naming'],
        recommendedCamps: ['ux-design', 'database'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'DAM Systems & Workflows',
        description: 'ใช้งาน DAM Software บริหาร Workflow และ Version Control ของ Assets',
        requiredSkills: ['DAM Software', 'Workflow Design', 'Rights Management'],
        recommendedCamps: ['database', 'cloud'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'Enterprise DAM Strategy',
        description: 'กำหนด DAM Strategy ระดับองค์กร ผสาน AI-powered tagging และวัด ROI',
        requiredSkills: ['DAM Strategy', 'AI Tagging', 'Brand Governance'],
        recommendedCamps: ['cloud', 'html-css'],
        duration: '12+ เดือน'
      }
    ]
  },

  // ES - Enterprising + Social
  {
    id: 'tech-sales-manager',
    name: 'Tech Sales Manager',
    nameTh: 'ผู้จัดการฝ่ายขายเทคโนโลยี',
    description: 'ขับเคลื่อนยอดขายผลิตภัณฑ์และบริการด้านเทคโนโลยี สร้างความสัมพันธ์กับลูกค้าและนำทีม Sales',
    personality: 'คุณมีพลังงานสูง ชอบพูดคุยกับผู้คน และสามารถอธิบายเทคโนโลยีที่ซับซ้อนให้เข้าใจง่ายได้',
    riasecCodes: ['E', 'S'],
    requiredTags: ['cloud', 'database'],
    recommendedTags: ['cybersecurity', 'ai'],
    demandLevel: 'high',
    averageSalary: '45,000 - 120,000 บาท/เดือน + Commission',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Tech Sales Foundation',
        description: 'เรียนรู้ Sales Process, Product Knowledge และทักษะการนำเสนอ',
        requiredSkills: ['Sales Process', 'Product Knowledge', 'Presentation Skills'],
        recommendedCamps: ['cloud', 'database'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Account Management',
        description: 'บริหาร Pipeline ทำ Demo และ Negotiation กับลูกค้าองค์กร',
        requiredSkills: ['CRM', 'Account Management', 'Negotiation'],
        recommendedCamps: ['cloud', 'cybersecurity'],
        duration: '6-12 เดือน'
      },
      {
        level: 'advanced',
        title: 'Sales Leadership',
        description: 'บริหารทีม Sales กำหนด Territory Strategy และวัด Revenue KPIs',
        requiredSkills: ['Sales Leadership', 'Revenue Forecasting', 'Partner Channel'],
        recommendedCamps: ['ai', 'cybersecurity'],
        duration: '12+ เดือน'
      }
    ]
  },

  // SC - Social + Conventional
  {
    id: 'it-support-coordinator',
    name: 'IT Support Coordinator',
    nameTh: 'ผู้ประสานงาน IT Support',
    description: 'ประสานงานระหว่างผู้ใช้และทีมเทคนิค บริหาร Help Desk Ticket และรับประกันว่าปัญหาได้รับการแก้ไขตาม SLA',
    personality: 'คุณชอบช่วยเหลือผู้คน มีความเป็นระเบียบสูง และพอใจกับการแก้ปัญหาตามขั้นตอน',
    riasecCodes: ['S', 'C'],
    requiredTags: ['networking', 'cybersecurity'],
    recommendedTags: ['cloud', 'database'],
    demandLevel: 'medium',
    averageSalary: '22,000 - 45,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Help Desk Fundamentals',
        description: 'เรียนรู้การใช้ Ticketing System, ITIL Basics และทักษะการสื่อสาร',
        requiredSkills: ['Ticketing Systems', 'ITIL Basics', 'Customer Service'],
        recommendedCamps: ['networking', 'cybersecurity'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Service Management',
        description: 'บริหาร SLA วิเคราะห์ Trend ของ Tickets และปรับปรุง Process',
        requiredSkills: ['SLA Management', 'Trend Analysis', 'Process Improvement'],
        recommendedCamps: ['networking', 'cloud'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'IT Service Management',
        description: 'ออกแบบ Service Catalog กำหนด KPIs และนำ ITSM Framework ไปใช้',
        requiredSkills: ['ITSM', 'Service Catalog Design', 'Knowledge Management'],
        recommendedCamps: ['cloud', 'database'],
        duration: '12+ เดือน'
      }
    ]
  },

  // CS - Conventional + Social
  {
    id: 'data-entry-specialist',
    name: 'Data Administrator',
    nameTh: 'ผู้ดูแลระบบข้อมูล',
    description: 'จัดการ บำรุงรักษา และรับประกันความถูกต้องของข้อมูลในองค์กร พร้อมทั้งให้ความช่วยเหลือด้านข้อมูลแก่ทีมงาน',
    personality: 'คุณมีความละเอียดถี่ถ้วน ชอบทำงานกับข้อมูลอย่างเป็นระบบ และยินดีช่วยเหลือทีมด้านข้อมูล',
    riasecCodes: ['C', 'S'],
    requiredTags: ['database', 'python'],
    recommendedTags: ['cloud', 'data-analytics'],
    demandLevel: 'medium',
    averageSalary: '20,000 - 40,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Data Management Basics',
        description: 'เรียนรู้ Database Basics, Data Entry Standards และ Data Quality',
        requiredSkills: ['Database Basics', 'Data Quality', 'Excel/Spreadsheets'],
        recommendedCamps: ['database', 'python'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Data Governance',
        description: 'บริหาร Master Data, Data Governance และ Data Lifecycle',
        requiredSkills: ['Master Data Management', 'Data Governance', 'SQL'],
        recommendedCamps: ['database', 'data-analytics'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'Enterprise Data Management',
        description: 'กำหนดนโยบาย Data Management ระดับองค์กรและ Data Architecture',
        requiredSkills: ['Data Architecture', 'Compliance', 'Data Strategy'],
        recommendedCamps: ['cloud', 'database'],
        duration: '12+ เดือน'
      }
    ]
  },

  // EC - Enterprising + Conventional
  {
    id: 'erp-consultant',
    name: 'ERP Consultant',
    nameTh: 'ที่ปรึกษาระบบ ERP',
    description: 'วางแผน ติดตั้ง และปรับแต่งระบบ ERP เช่น SAP หรือ Oracle เพื่อให้ตรงกับกระบวนการทางธุรกิจขององค์กร',
    personality: 'คุณมีทักษะทางธุรกิจ ชอบวางแผนระบบ และสามารถผลักดันโปรเจกต์ใหญ่ให้สำเร็จได้',
    riasecCodes: ['E', 'C'],
    requiredTags: ['database', 'cloud'],
    recommendedTags: ['python', 'devops'],
    demandLevel: 'high',
    averageSalary: '55,000 - 120,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'ERP Fundamentals',
        description: 'เรียนรู้โมดูลพื้นฐานของ ERP เข้าใจกระบวนการธุรกิจและ Business Analysis',
        requiredSkills: ['ERP Basics', 'Business Process', 'Business Analysis'],
        recommendedCamps: ['database', 'cloud'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'ERP Implementation',
        description: 'ติดตั้งและ Configure ERP ทำ Data Migration และ User Training',
        requiredSkills: ['ERP Configuration', 'Data Migration', 'Change Management'],
        recommendedCamps: ['database', 'python'],
        duration: '6-12 เดือน'
      },
      {
        level: 'advanced',
        title: 'Enterprise ERP Leadership',
        description: 'บริหารโปรเจกต์ ERP ขนาดใหญ่ กำหนด Integration Strategy และ ROI',
        requiredSkills: ['Program Management', 'ERP Strategy', 'ROI Analysis'],
        recommendedCamps: ['cloud', 'devops'],
        duration: '12+ เดือน'
      }
    ]
  },

  // CE - Conventional + Enterprising
  {
    id: 'financial-systems-analyst',
    name: 'Financial Systems Analyst',
    nameTh: 'นักวิเคราะห์ระบบการเงิน',
    description: 'วิเคราะห์ ออกแบบ และบริหารระบบสารสนเทศด้านการเงินและบัญชี เพื่อให้สอดคล้องกับกฎระเบียบและเป้าหมายธุรกิจ',
    personality: 'คุณมีความเชี่ยวชาญด้านตัวเลขและระเบียบ ชอบวิเคราะห์ระบบอย่างเป็นระบบ และมีทักษะธุรกิจ',
    riasecCodes: ['C', 'E'],
    requiredTags: ['database', 'python'],
    recommendedTags: ['cloud', 'data-analytics'],
    demandLevel: 'medium',
    averageSalary: '45,000 - 95,000 บาท/เดือน',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'Financial Systems Basics',
        description: 'เรียนรู้ Financial Accounting Basics, Regulatory Compliance และ ERP Finance Module',
        requiredSkills: ['Financial Accounting', 'Regulatory Compliance', 'ERP Finance'],
        recommendedCamps: ['database', 'python'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Systems Analysis & Design',
        description: 'วิเคราะห์ความต้องการ ออกแบบ Workflow และทำ System Integration',
        requiredSkills: ['Requirements Analysis', 'System Design', 'Financial Modeling'],
        recommendedCamps: ['database', 'data-analytics'],
        duration: '6-12 เดือน'
      },
      {
        level: 'advanced',
        title: 'Enterprise Finance Technology',
        description: 'กำหนด Finance Technology Strategy และบริหาร Digital Finance Transformation',
        requiredSkills: ['Finance Transformation', 'Digital Strategy', 'Risk Management'],
        recommendedCamps: ['cloud', 'data-analytics'],
        duration: '12+ เดือน'
      }
    ]
  },
];

// Helper function สำหรับหาอาชีพที่เหมาะสมตาม RIASEC scores
export function getRecommendedCareers(riasecScores: Record<RIASECCode, number>): Career[] {
  // หา top 2 RIASEC codes
  const sortedCodes = Object.entries(riasecScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([code]) => code as RIASECCode);

  // หาอาชีพที่ match โดยสนลำดับ (dominant type ต้องตรงกับ riasecCodes[0])
  const exactMatches = IT_CAREERS.filter(career =>
    career.riasecCodes[0] === sortedCodes[0] &&
    career.riasecCodes[1] === sortedCodes[1]
  );

  if (exactMatches.length > 0) return exactMatches;

  // fallback: dominant type ตรง แต่ secondary ไม่ตรง
  const dominantMatches = IT_CAREERS.filter(career =>
    career.riasecCodes[0] === sortedCodes[0]
  );

  if (dominantMatches.length > 0) return dominantMatches;

  // fallback สุดท้าย: มี code ใดก็ได้ตรง
  return IT_CAREERS.filter(career =>
    career.riasecCodes.includes(sortedCodes[0])
  );
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