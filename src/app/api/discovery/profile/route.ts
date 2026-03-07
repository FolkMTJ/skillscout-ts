import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { Collection, ObjectId, Db } from 'mongodb';
import { calculateUserRIASEC, calculateSkillProfile, calculateCampRIASEC, SimplifiedTag } from '@/lib/utils/riasec-calculator';
import { TagModel } from '@/lib/db/models/Tag';

interface Registration {
  _id: ObjectId;
  userId: ObjectId | string;
  campId: ObjectId | string;
  userEmail?: string;
  status: string;
}

interface Camp {
  _id: ObjectId;
  name: string;
  tags?: string[];
  image?: string;
  reviews?: { author: string; userId?: string; rating: number; comment: string; date: string }[];
}

interface SkillProfile {
  name: string;
  experienceCount: number;
  percentage: number;
  level: 'novice' | 'intermediate' | 'experienced' | 'expert';
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    const db = await getDatabase();
    const allTags = await TagModel.findAll() as SimplifiedTag[];

    // ดึงข้อมูล registrations ที่ confirmed
    const registrationsCollection = db.collection('registrations') as Collection<Registration>;
    const campsCollection = db.collection('camps') as Collection<Camp>;

    //  ค้นหาทั้ง ObjectId, string userId, และ email
    //  เฉพาะค่ายที่เข้าร่วมจริงแล้ว (attended) เท่านั้น
    const registrations = await registrationsCollection
      .find({
        $or: [
          { userId: new ObjectId(userId) } as never,
          { userId: userId } as never,
          { userEmail: userEmail } as never
        ],
        status: { $in: ['attended', 'completed'] } //  เข้าร่วมแล้ว หรือจบค่ายแล้ว
      })
      .toArray();


    console.log('🔍 Discovery Debug:', {
      userId,
      userEmail,
      totalRegistrations: registrations.length,
      statuses: registrations.map(r => ({ id: r._id.toString(), status: r.status }))
    });

    const campsAttended = registrations.length;

    if (campsAttended === 0) {
      return NextResponse.json({
        campsAttended: 0,
        skillProfile: [],
        riasecProfile: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
        recommendedCareers: [],
        recommendedCamps: []
      });
    }

    // ดึงข้อมูลค่ายทั้งหมดที่เข้า
    const campIds = registrations.map(r => {
      try {
        if (typeof r.campId === 'string') {
          return new ObjectId(r.campId);
        }
        return r.campId;
      } catch {
        console.warn('Invalid campId:', r.campId);
        return null;
      }
    }).filter((id): id is ObjectId => id !== null);

    console.log('🔍 Looking for camps with IDs:', campIds.map(id => id.toString()));

    const camps = await campsCollection
      .find({ _id: { $in: campIds } })
      .toArray();

    console.log('Found camps:', camps.length);
    console.log('Camp details:', camps.map(c => ({
      id: c._id.toString(),
      name: c.name,
      tagsCount: (c.tags || []).length,
      tags: c.tags || []
    })));

    // คำนวณ Skill Profile และ RIASEC โดยใช้ rating เป็น weight
    // ค่ายที่ user review แล้ว → ใช้ rating เป็น weight
    // ค่ายที่ยังไม่ review → ใช้ weight เต็ม (5 = 100%)
    const campTags = camps.map(camp => camp.tags || []);
    const campRIASECs = camps.map(camp => calculateCampRIASEC(camp.tags || [], allTags));

    // หา review rating ของ user สำหรับแต่ละค่าย
    const ratingWeights = camps.map(camp => {
      const userReview = (camp.reviews || []).find(
        r => r.author === userEmail || r.userId === userId
      );
      return userReview ? userReview.rating : 5; // ถ้ายังไม่ review ให้ weight เต็ม
    });

    const skillProfile = calculateSkillProfile(campTags, ratingWeights, allTags);
    const riasecProfile = calculateUserRIASEC(campRIASECs, ratingWeights);

    // แนะนำอาชีพตาม RIASEC Profile
    const recommendedCareers = getCareerRecommendations(riasecProfile, skillProfile);

    // แนะนำค่ายตาม skill gaps
    const recommendedCamps = await getRecommendedCamps(
      db,
      skillProfile,
      riasecProfile,
      campIds,
      allTags
    );

    return NextResponse.json({
      campsAttended,
      skillProfile: skillProfile.slice(0, 10), // Top 10 skills
      riasecProfile,
      recommendedCareers,
      recommendedCamps
    });
  } catch (error) {
    console.error('Error in discovery profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper: แนะนำอาชีพตาม RIASEC (sync กับ IT_CAREERS ใน path-finder)
function getCareerRecommendations(
  riasecProfile: { R: number; I: number; A: number; S: number; E: number; C: number },
  skillProfile: SkillProfile[]
) {
  // ใช้รายการอาชีพที่ sync กับ path-finder/careers.ts
  const careers = [
    {
      id: 'software-engineer', name: 'Software Engineer',
      riasec: { I: 85, R: 60 },
      requiredSkills: ['Python', 'JavaScript', 'HTML/CSS'],
      salary: '30,000 - 90,000 บาท',
      description: 'ออกแบบ พัฒนา และทดสอบซอฟต์แวร์และแอปพลิเคชันต่างๆ',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'frontend-dev', name: 'Frontend Developer',
      riasec: { A: 80, I: 60 },
      requiredSkills: ['HTML/CSS', 'JavaScript', 'UI/UX'],
      salary: '30,000 - 80,000 บาท',
      description: 'สร้างและพัฒนาส่วนที่ผู้ใช้มองเห็นและโต้ตอบกับเว็บไซต์',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'backend-dev', name: 'Backend Developer',
      riasec: { I: 80, C: 70 },
      requiredSkills: ['Python', 'JavaScript', 'Database'],
      salary: '35,000 - 90,000 บาท',
      description: 'พัฒนาระบบฝั่งเซิร์ฟเวอร์และจัดการข้อมูล',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'fullstack-dev', name: 'Full-stack Developer',
      riasec: { I: 75, A: 50, C: 60 },
      requiredSkills: ['JavaScript', 'Python', 'HTML/CSS', 'Database'],
      salary: '40,000 - 100,000 บาท',
      description: 'พัฒนาทั้งส่วน Frontend และ Backend ของแอปพลิเคชัน',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'ui-ux-designer', name: 'UI/UX Designer',
      riasec: { A: 90, S: 60 },
      requiredSkills: ['Figma', 'UI/UX', 'Graphic Design'],
      salary: '28,000 - 75,000 บาท',
      description: 'ออกแบบประสบการณ์ผู้ใช้และส่วนติดต่อผู้ใช้',
      growthOutlook: 'สูง'
    },
    {
      id: 'devops-engineer', name: 'DevOps Engineer',
      riasec: { R: 70, C: 80 },
      requiredSkills: ['Docker', 'Cloud', 'DevOps'],
      salary: '40,000 - 110,000 บาท',
      description: 'จัดการโครงสร้างพื้นฐานและระบบ Deployment',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'cybersecurity-analyst', name: 'Cybersecurity Analyst',
      riasec: { I: 80, C: 75 },
      requiredSkills: ['Cybersecurity'],
      salary: '35,000 - 100,000 บาท',
      description: 'ปกป้องระบบและเครือข่ายจากภัยคุกคาม',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'mobile-dev', name: 'Mobile App Developer',
      riasec: { A: 70, I: 65 },
      requiredSkills: ['Mobile Dev', 'JavaScript', 'UI/UX'],
      salary: '30,000 - 85,000 บาท',
      description: 'พัฒนาแอปพลิเคชันบนมือถือสำหรับ iOS และ Android',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'cloud-architect', name: 'Cloud Architect',
      riasec: { I: 80, R: 60 },
      requiredSkills: ['Cloud', 'DevOps'],
      salary: '60,000 - 150,000 บาท',
      description: 'ออกแบบโครงสร้างพื้นฐาน Cloud ให้กับองค์กร',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'ai-ml-engineer', name: 'AI/ML Engineer',
      riasec: { I: 90, R: 60 },
      requiredSkills: ['Machine Learning', 'AI', 'Python'],
      salary: '50,000 - 130,000 บาท',
      description: 'สร้างและ deploy โมเดล Machine Learning และ AI',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'data-analyst', name: 'Data Analyst',
      riasec: { I: 75, C: 70 },
      requiredSkills: ['Data Science', 'Data Visualization', 'Python'],
      salary: '28,000 - 75,000 บาท',
      description: 'วิเคราะห์ข้อมูลเชิงธุรกิจและสร้าง Dashboard',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'data-scientist', name: 'Data Scientist',
      riasec: { I: 90, A: 50 },
      requiredSkills: ['Data Science', 'Machine Learning', 'Python'],
      salary: '45,000 - 120,000 บาท',
      description: 'วิเคราะห์ข้อมูลขนาดใหญ่และสร้างโมเดล ML',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'game-developer', name: 'Game Developer',
      riasec: { R: 65, A: 70 },
      requiredSkills: ['Game Dev', 'Graphic Design'],
      salary: '25,000 - 80,000 บาท',
      description: 'สร้างเกมบน Mobile, PC และ Console',
      growthOutlook: 'ปานกลาง'
    },
    {
      id: 'network-engineer', name: 'Network Engineer',
      riasec: { R: 70, I: 65 },
      requiredSkills: ['DevOps', 'Cloud', 'Cybersecurity'],
      salary: '30,000 - 80,000 บาท',
      description: 'ดูแลและจัดการโครงสร้างพื้นฐานเครือข่ายในองค์กร',
      growthOutlook: 'สูง'
    },
    {
      id: 'database-administrator', name: 'Database Administrator',
      riasec: { I: 80, C: 75 },
      requiredSkills: ['Database'],
      salary: '30,000 - 85,000 บาท',
      description: 'จัดการและดูแลฐานข้อมูลขององค์กร',
      growthOutlook: 'สูง'
    },
    {
      id: 'business-analyst', name: 'Business Analyst',
      riasec: { I: 70, S: 65 },
      requiredSkills: ['Data Visualization'],
      salary: '28,000 - 70,000 บาท',
      description: 'วิเคราะห์ความต้องการทางธุรกิจและแปลงเป็นข้อกำหนดสำหรับทีมพัฒนา',
      growthOutlook: 'สูง'
    },
    {
      id: 'product-manager', name: 'Product Manager',
      riasec: { I: 65, E: 70 },
      requiredSkills: ['UI/UX'],
      salary: '40,000 - 120,000 บาท',
      description: 'วางแผนและจัดการผลิตภัณฑ์ตั้งแต่แนวคิดจนเปิดตัว',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'computer-graphics-designer', name: 'Computer Graphics Designer',
      riasec: { R: 55, A: 80 },
      requiredSkills: ['Graphic Design', 'Figma'],
      salary: '22,000 - 60,000 บาท',
      description: 'สร้างสรรค์กราฟิก ภาพเคลื่อนไหว หรือโมเดล 3D',
      growthOutlook: 'ปานกลาง'
    },
    {
      id: 'it-consultant', name: 'IT Consultant',
      riasec: { S: 70, E: 75 },
      requiredSkills: ['Cloud', 'DevOps'],
      salary: '40,000 - 110,000 บาท',
      description: 'ให้คำปรึกษาและแก้ไขปัญหาทางเทคนิคให้กับลูกค้า',
      growthOutlook: 'สูง'
    },
    {
      id: 'digital-marketing-manager', name: 'Digital Marketing Manager',
      riasec: { A: 70, E: 75 },
      requiredSkills: ['UI/UX', 'Graphic Design'],
      salary: '28,000 - 80,000 บาท',
      description: 'วางแผนและบริหารจัดการแคมเปญการตลาดออนไลน์',
      growthOutlook: 'สูง'
    }
  ];

  // คำนวณ match score
  const withScores = careers.map(career => {
    let riasecScore = 0;
    let riasecWeight = 0;

    Object.entries(career.riasec).forEach(([code, weight]) => {
      const userScore = riasecProfile[code as keyof typeof riasecProfile];
      riasecScore += (userScore / 100) * weight;
      riasecWeight += weight;
    });

    const normalizedRiasecScore = riasecWeight > 0 ? (riasecScore / riasecWeight) * 100 : 0;

    // คำนวณ skill match
    const matchedSkills = career.requiredSkills.filter(reqSkill =>
      skillProfile.some(userSkill =>
        userSkill.name.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(userSkill.name.toLowerCase())
      )
    );

    const skillScore = career.requiredSkills.length > 0
      ? (matchedSkills.length / career.requiredSkills.length) * 100
      : 0;

    // รวมคะแนน (70% RIASEC, 30% Skills)
    const matchScore = Math.round(normalizedRiasecScore * 0.7 + skillScore * 0.3);

    return {
      ...career,
      matchScore
    };
  });

  return withScores
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6); // เพิ่มเป็น 6 อาชีพ
}

// Helper: แนะนำค่ายที่ยังไม่ได้เข้า
async function getRecommendedCamps(
  db: Db,
  skillProfile: SkillProfile[],
  riasecProfile: { R: number; I: number; A: number; S: number; E: number; C: number },
  attendedCampIds: ObjectId[],
  allTags: SimplifiedTag[]
) {
  const campsCollection = db.collection('camps');

  // หา skills ที่ยังอ่อน (experienceCount < 3)
  const weakSkills = skillProfile.filter(s => s.experienceCount < 3).map(s => s.name);

  // หา top RIASEC code
  const topRIASEC = Object.entries(riasecProfile)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 2)
    .map(([code]) => code);

  const camps = await campsCollection
    .find({
      _id: { $nin: attendedCampIds },
      status: 'active',
      tags: { $exists: true, $ne: [] }
    })
    .limit(10)
    .toArray();

  const recommended = camps
    .map((camp) => {
      const campData = camp as unknown as Camp;
      const campRIASEC = calculateCampRIASEC(campData.tags || [], allTags);

      // คำนวณความเกี่ยวข้อง
      const riasecRelevance = topRIASEC.reduce((sum, code) => {
        return sum + campRIASEC[code as keyof typeof campRIASEC];
      }, 0);

      return {
        id: campData._id.toString(),
        name: campData.name,
        image: campData.image || '/images/camp-placeholder.png',
        reason: generateRecommendationReason(campData.tags || [], weakSkills),
        relevance: riasecRelevance
      };
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);

  return recommended;
}

function generateRecommendationReason(
  campTags: string[],
  weakSkills: string[]
): string {
  // ถ้ามี tag ที่ตรงกับ weak skills
  const matchingSkills = campTags.filter(tag =>
    weakSkills.some(skill => skill.toLowerCase().includes(tag.toLowerCase()))
  );

  if (matchingSkills.length > 0) {
    return `จะช่วยเสริมทักษะที่คุณยังพัฒนาได้อีก`;
  }

  return `เหมาะกับบุคลิกภาพและความสนใจของคุณ`;
}
