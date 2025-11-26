import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { Collection, ObjectId } from 'mongodb';
import { calculateUserRIASEC, calculateSkillProfile, calculateCampRIASEC } from '@/lib/utils/riasec-calculator';

interface Registration {
  _id: ObjectId;
  userId: ObjectId;
  campId: ObjectId;
  status: string;
}

interface Camp {
  _id: ObjectId;
  name: string;
  tags?: string[];
  image?: string;
}

export async function GET(req: NextRequest) {
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
    
    // ดึงข้อมูล registrations ที่ confirmed
    const registrationsCollection = db.collection('registrations') as Collection<Registration>;
    const campsCollection = db.collection('camps') as Collection<Camp>;

    // 🔍 ค้นหาทั้ง ObjectId, string userId, และ email
    // ⚠️ เฉพาะค่ายที่เข้าร่วมจริงแล้ว (attended) เท่านั้น
    const registrations = await registrationsCollection
      .find({
        $or: [
          { userId: new ObjectId(userId) },
          { userId: userId },
          { userEmail: userEmail }
        ],
        status: 'attended' // ✅ เฉพาะที่เข้าร่วมแล้วเท่านั้น
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
      } catch (e) {
        console.warn('⚠️ Invalid campId:', r.campId);
        return null;
      }
    }).filter(id => id !== null) as ObjectId[];

    console.log('🔍 Looking for camps with IDs:', campIds.map(id => id.toString()));

    const camps = await campsCollection
      .find({ _id: { $in: campIds } })
      .toArray();

    console.log('✅ Found camps:', camps.length);
    console.log('📋 Camp details:', camps.map(c => ({
      id: c._id.toString(),
      name: c.name,
      tagsCount: (c.tags || []).length,
      tags: c.tags || []
    })));

    // คำนวณ Skill Profile
    const campTags = camps.map(camp => camp.tags || []);
    const skillProfile = calculateSkillProfile(campTags);

    // คำนวณ RIASEC Profile
    const campRIASECs = camps.map(camp => calculateCampRIASEC(camp.tags || []));
    const riasecProfile = calculateUserRIASEC(campRIASECs);

    // แนะนำอาชีพตาม RIASEC Profile
    const recommendedCareers = getCareerRecommendations(riasecProfile, skillProfile);

    // แนะนำค่ายตาม skill gaps
    const recommendedCamps = await getRecommendedCamps(
      db,
      skillProfile,
      riasecProfile,
      campIds
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

// Helper: แนะนำอาชีพตาม RIASEC
function getCareerRecommendations(
  riasecProfile: { R: number; I: number; A: number; S: number; E: number; C: number },
  skillProfile: { name: string; level: number; experienceCount: number }[]
) {
  const careers = [
    {
      id: 'frontend-dev',
      name: 'Frontend Developer',
      riasec: { I: 60, A: 80, C: 50 },
      requiredSkills: ['HTML/CSS', 'JavaScript', 'React', 'UI/UX'],
      salary: '30,000 - 80,000 บาท/เดือน',
      description: 'สร้างและพัฒนาส่วนที่ผู้ใช้มองเห็นและโต้ตอบกับเว็บไซต์',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'backend-dev',
      name: 'Backend Developer',
      riasec: { I: 80, C: 70, E: 30 },
      requiredSkills: ['Node.js', 'Python', 'Database', 'API'],
      salary: '35,000 - 90,000 บาท/เดือน',
      description: 'พัฒนาระบบฝั่งเซิร์ฟเวอร์และจัดการข้อมูล',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'fullstack-dev',
      name: 'Full-stack Developer',
      riasec: { I: 75, A: 50, C: 60 },
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'Database'],
      salary: '40,000 - 100,000 บาท/เดือน',
      description: 'พัฒนาทั้งส่วน Frontend และ Backend ของแอปพลิเคชัน',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'data-scientist',
      name: 'Data Scientist',
      riasec: { I: 95, C: 60, A: 40 },
      requiredSkills: ['Python', 'Machine Learning', 'Statistics', 'Data Visualization'],
      salary: '45,000 - 120,000 บาท/เดือน',
      description: 'วิเคราะห์ข้อมูลและสร้างโมเดล Machine Learning',
      growthOutlook: 'สูงมาก'
    },
    {
      id: 'ui-ux-designer',
      name: 'UI/UX Designer',
      riasec: { A: 90, S: 60, I: 40 },
      requiredSkills: ['Figma', 'UI/UX', 'Design Thinking', 'Prototyping'],
      salary: '28,000 - 75,000 บาท/เดือน',
      description: 'ออกแบบประสบการณ์ผู้ใช้และส่วนติดต่อผู้ใช้',
      growthOutlook: 'สูง'
    },
    {
      id: 'devops-engineer',
      name: 'DevOps Engineer',
      riasec: { C: 80, I: 70, R: 50 },
      requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'Cloud'],
      salary: '40,000 - 110,000 บาท/เดือน',
      description: 'จัดการโครงสร้างพื้นฐานและระบบ Deployment',
      growthOutlook: 'สูงมาก'
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
    
    const skillScore = (matchedSkills.length / career.requiredSkills.length) * 100;

    // รวมคะแนน (70% RIASEC, 30% Skills)
    const matchScore = Math.round(normalizedRiasecScore * 0.7 + skillScore * 0.3);

    return {
      ...career,
      matchScore
    };
  });

  return withScores
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

// Helper: แนะนำค่ายที่ยังไม่ได้เข้า
async function getRecommendedCamps(
  db: any,
  skillProfile: { name: string; level: number }[],
  riasecProfile: { R: number; I: number; A: number; S: number; E: number; C: number },
  attendedCampIds: ObjectId[]
) {
  const campsCollection = db.collection('camps');

  // หา skills ที่ยังอ่อน (level < 60)
  const weakSkills = skillProfile.filter(s => s.level < 60).map(s => s.name);

  // หา top RIASEC code
  const topRIASEC = Object.entries(riasecProfile)
    .sort(([, a], [, b]) => (b as number) - (a as number))
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
    .map((camp: Camp) => {
      const campRIASEC = calculateCampRIASEC(camp.tags || []);
      
      // คำนวณความเกี่ยวข้อง
      const riasecRelevance = topRIASEC.reduce((sum, code) => {
        return sum + campRIASEC[code as keyof typeof campRIASEC];
      }, 0);

      return {
        id: camp._id.toString(),
        name: camp.name,
        image: camp.image || '/images/camp-placeholder.png',
        reason: generateRecommendationReason(camp.tags || [], weakSkills, topRIASEC),
        relevance: riasecRelevance
      };
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);

  return recommended;
}

function generateRecommendationReason(
  campTags: string[],
  weakSkills: string[],
  topRIASEC: string[]
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
