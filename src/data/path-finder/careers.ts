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

  // R + S: ผู้ฝึกอบรมด้านไอที (IT Trainer)
  {
    id: 'it-trainer',
    name: 'IT Trainer',
    nameTh: 'ผู้ฝึกอบรมด้านไอที',
    description: 'มีหน้าที่ออกแบบหลักสูตรและให้ความรู้เกี่ยวกับเทคโนโลยีแก่พนักงานหรือลูกค้า',
    personality: 'คุณมีความรู้เชิงเทคนิคและชอบช่วยเหลือหรือสอนผู้อื่นให้เข้าใจ',
    riasecCodes: ['R', 'S'],
    requiredTags: [],
    recommendedTags: ['python', 'javascript', 'html-css'],
    demandLevel: 'medium',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐานเทคโนโลยี',
        description: 'เรียนรู้เทคโนโลยีพื้นฐานต่างๆ',
        requiredSkills: ['Basic Programming', 'Teaching Skills'],
        recommendedCamps: ['python', 'javascript'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'การออกแบบหลักสูตร',
        description: 'ฝึกทักษะการสอนและออกแบบหลักสูตร',
        requiredSkills: ['Course Design', 'Presentation Skills'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'การฝึกอบรมระดับมืออาชีพ',
        description: 'พัฒนาทักษะการฝึกอบรมระดับสูง',
        requiredSkills: ['Advanced Teaching', 'Training Management'],
        duration: '6-12 เดือน'
      }
    ]
  },

  // R + E: ผู้จัดการฝ่ายปฏิบัติการด้านไอท (IT Operations Manager)
  {
    id: 'it-operations-manager-re',
    name: 'IT Operations Manager',
    nameTh: 'ผู้จัดการฝ่ายปฏิบัติการด้านไอที',
    description: 'วางแผนและควบคุมการดำเนินงานด้านไอทีทั้งหมดขององค์กร เพื่อให้มั่นใจว่าระบบจะทำงานได้อย่างมีประสิทธิภาพสูงสุด',
    personality: 'คุณมีความสามารถในการจัดการทีมเพื่อดูแลระบบและอุปกรณ์ต่างๆ ให้ทำงานได้อย่างราบรื่น',
    riasecCodes: ['R', 'E'],
    requiredTags: ['devops'],
    recommendedTags: ['cloud', 'docker', 'kubernetes'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐานระบบและการจัดการ',
        description: 'เรียนรู้พื้นฐานระบบ IT และการจัดการ',
        requiredSkills: ['IT Fundamentals', 'Basic Management'],
        recommendedCamps: ['devops'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'การจัดการโครงการและทีม',
        description: 'พัฒนาทักษะการจัดการโครงการ',
        requiredSkills: ['Project Management', 'Team Leadership'],
        recommendedCamps: ['devops', 'cloud'],
        duration: '6-9 เดือน'
      },
      {
        level: 'advanced',
        title: 'Strategic IT Management',
        description: 'เรียนรู้การวางแผนกลยุทธ์ IT',
        requiredSkills: ['Strategic Planning', 'Budget Management'],
        recommendedCamps: ['devops', 'cloud'],
        duration: '12+ เดือน'
      }
    ]
  },

  // R + C: เจ้าหน้าที่ซ่อมบำรุงระบบ (System Maintenance Officer)
  {
    id: 'system-maintenance-officer',
    name: 'System Maintenance Officer',
    nameTh: 'เจ้าหน้าที่ซ่อมบำรุงระบบ',
    description: 'มีหน้าที่ซ่อมบำรุงและดูแลรักษาระบบคอมพิวเตอร์และอุปกรณ์ต่างๆ ให้พร้อมใช้งานอยู่เสมอ',
    personality: 'คุณชอบงานเชิงปฏิบัติและทำงานตามขั้นตอนหรือกฎระเบียบได้อย่างแม่นยำ',
    riasecCodes: ['R', 'C'],
    requiredTags: ['devops'],
    recommendedTags: ['docker', 'cloud'],
    demandLevel: 'medium',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐานระบบคอมพิวเตอร์',
        description: 'เรียนรู้การทำงานของระบบคอมพิวเตอร์',
        requiredSkills: ['Computer Hardware', 'OS Basics'],
        recommendedCamps: ['devops'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'การซ่อมบำรุงและแก้ไขปัญหา',
        description: 'ฝึกทักษะการซ่อมแซมและแก้ไขปัญหา',
        requiredSkills: ['Troubleshooting', 'System Monitoring'],
        recommendedCamps: ['devops', 'cloud'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'การบำรุงรักษาขั้นสูง',
        description: 'เชี่ยวชาญการบำรุงรักษาระบบขั้นสูง',
        requiredSkills: ['Advanced Diagnostics', 'Preventive Maintenance'],
        recommendedCamps: ['devops'],
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

  // A + S: ผู้จัดการโซเชียลมีเดีย (Social Media Manager)
  {
    id: 'social-media-manager',
    name: 'Social Media Manager',
    nameTh: 'ผู้จัดการโซเชียลมีเดีย',
    description: 'มีหน้าที่วางแผนและสร้างเนื้อหาสำหรับแพลตฟอร์มโซเชียลมีเดียต่างๆ เพื่อสร้างแบรนด์, เพิ่มการมีส่วนร่วม และขยายฐานลูกค้า',
    personality: 'คุณมีความคิดสร้างสรรค์สูงและชอบการทำงานกับผู้คน ชอบสร้างเนื้อหาใหม่ๆ และสื่อสารกับชุมชนออนไลน์',
    riasecCodes: ['A', 'S'],
    requiredTags: ['graphic-design', 'ui-ux'],
    recommendedTags: ['figma'],
    demandLevel: 'medium',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐาน Social Media',
        description: 'เรียนรู้การใช้งาน social media platforms',
        requiredSkills: ['Social Media Basics', 'Content Creation'],
        recommendedCamps: ['graphic-design'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Content Strategy',
        description: 'ฝึกวางแผนและสร้างเนื้อหา',
        requiredSkills: ['Content Strategy', 'Community Management'],
        recommendedCamps: ['graphic-design', 'ui-ux'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'Social Media Strategy',
        description: 'เชี่ยวชาญการวางกลยุทธ์ social media',
        requiredSkills: ['Social Analytics', 'Campaign Management'],
        recommendedCamps: ['ui-ux', 'graphic-design'],
        duration: '8-12 เดือน'
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

  // A + C: ผู้จัดการเนื้อหาเว็บไซต์ (Web Content Manager)
  {
    id: 'web-content-manager',
    name: 'Web Content Manager',
    nameTh: 'ผู้จัดการเนื้อหาเว็บไซต์',
    description: 'มีหน้าที่ดูแลและจัดการเนื้อหาทั้งหมดบนเว็บไซต์ขององค์กร รวมถึงการอัปเดตและจัดระเบียบข้อมูล',
    personality: 'คุณสร้างสรรค์และออกแบบเนื้อหา และจัดการให้เนื้อหาเหล่านั้นเป็นระบบและถูกต้องตามกฎระเบียบ',
    riasecCodes: ['A', 'C'],
    requiredTags: ['html-css', 'ui-ux'],
    recommendedTags: ['javascript', 'graphic-design'],
    demandLevel: 'medium',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐาน Web และ Content',
        description: 'เรียนรู้ HTML/CSS และการสร้างเนื้อหา',
        requiredSkills: ['HTML/CSS', 'Content Writing'],
        recommendedCamps: ['html-css'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Web Content Management',
        description: 'ฝึกจัดการเนื้อหาเว็บไซต์',
        requiredSkills: ['CMS', 'SEO', 'Content Strategy'],
        recommendedCamps: ['html-css', 'ui-ux'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'Advanced Content Strategy',
        description: 'เชี่ยวชาญการวางกลยุทธ์เนื้อหา',
        requiredSkills: ['Content Analytics', 'Information Architecture'],
        recommendedCamps: ['ui-ux', 'javascript'],
        duration: '8-12 เดือน'
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

  // S + C: ผู้ประสานงานโครงการไอที (IT Project Coordinator)
  {
    id: 'it-project-coordinator',
    name: 'IT Project Coordinator',
    nameTh: 'ผู้ประสานงานโครงการไอที',
    description: 'สนับสนุนการทำงานของผู้จัดการโครงการ โดยมีหน้าที่ในการจัดตารางงาน, ติดตามความคืบหน้า และประสานงานกับทีมงาน',
    personality: 'คุณทำงานร่วมกับทีมเพื่อตรวจสอบและจัดการเอกสารและตารางเวลาของโครงการให้เป็นระเบียบ',
    riasecCodes: ['S', 'C'],
    requiredTags: [],
    recommendedTags: ['devops'],
    demandLevel: 'medium',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐานการจัดการโครงการ',
        description: 'เรียนรู้หลักการจัดการโครงการ',
        requiredSkills: ['Project Management Basics', 'Documentation'],
        duration: '2-3 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Project Coordination',
        description: 'ฝึกประสานงานและติดตามโครงการ',
        requiredSkills: ['Scheduling', 'Stakeholder Management'],
        recommendedCamps: ['devops'],
        duration: '4-6 เดือน'
      },
      {
        level: 'advanced',
        title: 'Advanced Project Management',
        description: 'เชี่ยวชาญการจัดการโครงการขั้นสูง',
        requiredSkills: ['Agile/Scrum', 'Risk Management'],
        recommendedCamps: ['devops'],
        duration: '8-12 เดือน'
      }
    ]
  },

  // E + C: IT Operations Manager (ซ้ำกับ R+E แต่มี description ต่างกัน)
  {
    id: 'it-operations-manager-ec',
    name: 'IT Operations Manager',
    nameTh: 'ผู้จัดการฝ่ายปฏิบัติการด้านไอที',
    description: 'วางแผนและบริหารจัดการระบบปฏิบัติการ, บุคลากร และกระบวนการต่างๆ ด้านไอที เพื่อให้การดำเนินงานมีประสิทธิภาพและเป็นไปตามข้อกำหนด',
    personality: 'คุณวางแผนและบริหารจัดการระบบการทำงานให้เป็นไปตามขั้นตอนและกฎเกณฑ์',
    riasecCodes: ['E', 'C'],
    requiredTags: ['devops'],
    recommendedTags: ['cloud', 'docker', 'kubernetes'],
    demandLevel: 'high',
    roadmapSteps: [
      {
        level: 'beginner',
        title: 'พื้นฐาน IT Operations',
        description: 'เรียนรู้การจัดการระบบ IT',
        requiredSkills: ['IT Operations Basics', 'Process Management'],
        recommendedCamps: ['devops'],
        duration: '3-4 เดือน'
      },
      {
        level: 'intermediate',
        title: 'Operations Management',
        description: 'ฝึกบริหารจัดการปฏิบัติการ',
        requiredSkills: ['Team Management', 'SLA Management'],
        recommendedCamps: ['devops', 'cloud'],
        duration: '6-9 เดือน'
      },
      {
        level: 'advanced',
        title: 'Strategic Operations Leadership',
        description: 'เชี่ยวชาญการบริหารปฏิบัติการระดับสูง',
        requiredSkills: ['Strategic Planning', 'Compliance', 'Budget Management'],
        recommendedCamps: ['devops', 'cloud', 'kubernetes'],
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
