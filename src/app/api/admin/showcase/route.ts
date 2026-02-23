// src/app/api/admin/showcase/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const SHOWCASE_TAG = '__showcase__';

const SHOWCASE_CAMPS = [
  {
    name: 'Web Development Bootcamp',
    category: 'Programming',
    tags: ['frontend', 'web', 'javascript', SHOWCASE_TAG],
    date: '15-17 มีนาคม 2568',
    location: 'ห้องปฏิบัติการ IT อาคาร A ชั้น 3',
    price: '500',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80',
    description: 'เรียนรู้การพัฒนาเว็บไซต์ตั้งแต่พื้นฐานถึงระดับกลาง ครอบคลุม HTML, CSS, JavaScript และ React ผ่านโปรเจกต์จริง',
    deadline: '10 มีนาคม 2568',
    registrationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    participantCount: 40,
    capacity: 40,
    enrolled: 28,
    fee: 500,
    activityFormat: 'Workshop',
    qualifications: { level: 'มัธยมปลาย', fields: ['วิทยาศาสตร์', 'คณิตศาสตร์'] },
    additionalInfo: ['นำโน้ตบุ๊คมาเอง', 'มีอาหารกลางวันให้'],
    reviews: [
      { id: 'r1', author: 'สมชาย ใจดี', rating: 5, comment: 'ค่ายนี้สอนดีมากครับ วิทยากรอธิบายชัดเจน ได้ความรู้เยอะเลย', date: '2025-01-15' },
      { id: 'r2', author: 'มินตรา สุขใจ', rating: 4, comment: 'สนุกมากค่ะ ได้ทำโปรเจกต์จริง แต่อยากให้เวลาเรียนมากกว่านี้', date: '2025-01-16' },
      { id: 'r3', author: 'ธนภัทร รักเรียน', rating: 5, comment: 'เนื้อหาแน่นมาก ได้ทักษะที่ใช้งานได้จริง แนะนำเลยครับ', date: '2025-01-17' },
    ],
    avgRating: 4.7,
    ratingBreakdown: { '5': 2, '4': 1 },
    organizerName: 'SkillScout Team',
    organizerEmail: 'showcase@skillscout.site',
    status: 'active',
    featured: true,
    views: 120,
    slug: 'web-dev-bootcamp-showcase',
    galleryImages: [],
    organizers: [],
  },
  {
    name: 'Data Science & AI Workshop',
    category: 'Data Science',
    tags: ['data', 'ai', 'machine-learning', SHOWCASE_TAG],
    date: '22-23 มีนาคม 2568',
    location: 'ห้อง Data Lab อาคาร B ชั้น 2',
    price: '800',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    description: 'สำรวจโลกของ Data Science และ AI เรียนรู้ Python, Pandas, Machine Learning พื้นฐาน และการวิเคราะห์ข้อมูลจริง',
    deadline: '18 มีนาคม 2568',
    registrationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    participantCount: 30,
    capacity: 30,
    enrolled: 21,
    fee: 800,
    activityFormat: 'Workshop',
    qualifications: { level: 'มัธยมปลาย', fields: ['วิทยาศาสตร์', 'คณิตศาสตร์'] },
    additionalInfo: ['นำโน้ตบุ๊คมาเอง', 'ติดตั้ง Python ก่อนมา'],
    reviews: [
      { id: 'r4', author: 'กานต์ดา หวังดี', rating: 5, comment: 'เปิดโลก AI มากเลยค่ะ ไม่เคยรู้มาก่อนว่า Machine Learning น่าสนุกขนาดนี้', date: '2025-02-01' },
      { id: 'r5', author: 'ปิยะ ฉลาดเรียน', rating: 4, comment: 'เนื้อหาดีมากครับ แต่ค่อนข้างเร็ว ต้องทบทวนเองเพิ่ม', date: '2025-02-02' },
    ],
    avgRating: 4.5,
    ratingBreakdown: { '5': 1, '4': 1 },
    organizerName: 'SkillScout Team',
    organizerEmail: 'showcase@skillscout.site',
    status: 'active',
    featured: true,
    views: 98,
    slug: 'data-science-ai-showcase',
    galleryImages: [],
    organizers: [],
  },
  {
    name: 'Cybersecurity Essentials',
    category: 'Security',
    tags: ['cybersecurity', 'network', 'ethical-hacking', SHOWCASE_TAG],
    date: '5-6 เมษายน 2568',
    location: 'ห้อง Cyber Lab คณะวิศวกรรมศาสตร์',
    price: '600',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
    description: 'เรียนรู้ความปลอดภัยทางไซเบอร์เบื้องต้น การป้องกันระบบ และ Ethical Hacking พื้นฐาน เพื่อเตรียมพร้อมสู่สายงาน Security',
    deadline: '1 เมษายน 2568',
    registrationDeadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    participantCount: 25,
    capacity: 25,
    enrolled: 18,
    fee: 600,
    activityFormat: 'Workshop',
    qualifications: { level: 'มัธยมปลาย', fields: ['วิทยาศาสตร์'] },
    additionalInfo: ['นำโน้ตบุ๊คมาเอง', 'ห้ามใช้ความรู้ผิดกฎหมาย'],
    reviews: [
      { id: 'r6', author: 'ภูมิ ปลอดภัย', rating: 5, comment: 'ได้รู้เรื่อง Hacking ที่ถูกต้องเลยครับ วิทยากรเก่งมาก', date: '2025-02-10' },
      { id: 'r7', author: 'แนน รักษาความปลอดภัย', rating: 5, comment: 'น่าสนใจมากค่ะ อยากเรียนต่อในด้านนี้เลย', date: '2025-02-11' },
      { id: 'r8', author: 'กิตติ เทคโนโลยี', rating: 4, comment: 'ดีมากครับ เนื้อหาทันสมัย ตรงกับที่อยากรู้', date: '2025-02-12' },
    ],
    avgRating: 4.7,
    ratingBreakdown: { '5': 2, '4': 1 },
    organizerName: 'SkillScout Team',
    organizerEmail: 'showcase@skillscout.site',
    status: 'active',
    featured: false,
    views: 85,
    slug: 'cybersecurity-essentials-showcase',
    galleryImages: [],
    organizers: [],
  },
  {
    name: 'Mobile App Development',
    category: 'Programming',
    tags: ['mobile', 'flutter', 'app-development', SHOWCASE_TAG],
    date: '19-21 เมษายน 2568',
    location: 'ห้อง Innovation Hub ชั้น 4',
    price: '700',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    description: 'พัฒนาแอปมือถือด้วย Flutter ตั้งแต่การออกแบบ UI ถึงการ Deploy บน App Store โดยไม่ต้องมีพื้นฐานมาก่อน',
    deadline: '15 เมษายน 2568',
    registrationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    participantCount: 35,
    capacity: 35,
    enrolled: 30,
    fee: 700,
    activityFormat: 'Hackathon',
    qualifications: { level: 'มัธยมปลาย', fields: ['วิทยาศาสตร์', 'คณิตศาสตร์'] },
    additionalInfo: ['นำโน้ตบุ๊คมาเอง', 'ติดตั้ง Flutter SDK ก่อนมา'],
    reviews: [
      { id: 'r9', author: 'พิมพ์ชนก สร้างแอป', rating: 5, comment: 'ทำแอปได้จริงใน 3 วันค่ะ ภูมิใจมาก โปรเจกต์ยังใช้ได้อยู่เลย', date: '2025-03-01' },
      { id: 'r10', author: 'ต้น นักพัฒนา', rating: 4, comment: 'สนุกมากครับ ได้แอปจริงกลับบ้านด้วย แต่อยากให้มีสอน backend เพิ่ม', date: '2025-03-02' },
    ],
    avgRating: 4.5,
    ratingBreakdown: { '5': 1, '4': 1 },
    organizerName: 'SkillScout Team',
    organizerEmail: 'showcase@skillscout.site',
    status: 'active',
    featured: true,
    views: 110,
    slug: 'mobile-app-dev-showcase',
    galleryImages: [],
    organizers: [],
  },
  {
    name: 'Game Development with Unity',
    category: 'Game Development',
    tags: ['game', 'unity', '3d', SHOWCASE_TAG],
    date: '3-4 พฤษภาคม 2568',
    location: 'ห้อง Creative Studio อาคาร C',
    price: '900',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80',
    description: 'สร้างเกม 2D/3D ด้วย Unity Game Engine เรียนรู้การออกแบบเกม โปรแกรมเกม และการ Publish เกมของตัวเอง',
    deadline: '28 เมษายน 2568',
    registrationDeadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    participantCount: 30,
    capacity: 30,
    enrolled: 22,
    fee: 900,
    activityFormat: 'Workshop',
    qualifications: { level: 'มัธยมปลาย', fields: ['ทุกสาขา'] },
    additionalInfo: ['นำโน้ตบุ๊คมาเอง (RAM 8GB+)', 'ติดตั้ง Unity ก่อนมา'],
    reviews: [
      { id: 'r11', author: 'เกม รักเกมส์', rating: 5, comment: 'ฝันมาตลอดว่าจะทำเกมได้ ค่ายนี้ทำให้ฝันนั้นเป็นจริงครับ', date: '2025-03-15' },
      { id: 'r12', author: 'แพรว ครีเอทีฟ', rating: 5, comment: 'วิทยากรเก่งมากค่ะ อธิบายเข้าใจง่าย มีเกมที่ทำเสร็จกลับไปด้วย', date: '2025-03-16' },
      { id: 'r13', author: 'ชนะ เกมมิ่ง', rating: 4, comment: 'สนุกมากครับ แต่อยากให้มีเวลาเพิ่มขึ้นสักวันหนึ่ง', date: '2025-03-17' },
    ],
    avgRating: 4.7,
    ratingBreakdown: { '5': 2, '4': 1 },
    organizerName: 'SkillScout Team',
    organizerEmail: 'showcase@skillscout.site',
    status: 'active',
    featured: false,
    views: 145,
    slug: 'game-dev-unity-showcase',
    galleryImages: [],
    organizers: [],
  },
  {
    name: 'Cloud & DevOps Fundamentals',
    category: 'Infrastructure',
    tags: ['cloud', 'devops', 'docker', 'aws', SHOWCASE_TAG],
    date: '17-18 พฤษภาคม 2568',
    location: 'ห้อง Server Room จำลอง อาคาร IT',
    price: '750',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    description: 'เรียนรู้ Cloud Computing, Docker, CI/CD และ DevOps practices ที่บริษัท IT ชั้นนำใช้งานจริง เตรียมพร้อมสู่ตลาดงาน',
    deadline: '12 พฤษภาคม 2568',
    registrationDeadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
    participantCount: 25,
    capacity: 25,
    enrolled: 15,
    fee: 750,
    activityFormat: 'Workshop',
    qualifications: { level: 'มัธยมปลาย', fields: ['วิทยาศาสตร์', 'คณิตศาสตร์'] },
    additionalInfo: ['นำโน้ตบุ๊คมาเอง', 'สมัคร AWS Free Tier ก่อนมา'],
    reviews: [
      { id: 'r14', author: 'คลาวด์ ดิจิทัล', rating: 5, comment: 'เนื้อหาตรงกับที่ใช้งานจริงในบริษัทเลยครับ ได้ประสบการณ์มากมาย', date: '2025-04-01' },
      { id: 'r15', author: 'นิว เทคโนโลยี', rating: 4, comment: 'ดีมากค่ะ ได้รู้จัก DevOps ที่ไม่เคยรู้มาก่อน แต่อยากให้ AWS credit เพิ่ม', date: '2025-04-02' },
    ],
    avgRating: 4.5,
    ratingBreakdown: { '5': 1, '4': 1 },
    organizerName: 'SkillScout Team',
    organizerEmail: 'showcase@skillscout.site',
    status: 'active',
    featured: true,
    views: 76,
    slug: 'cloud-devops-showcase',
    galleryImages: [],
    organizers: [],
  },
];

// GET — ดึงจำนวน showcase camps ที่มีอยู่
export async function GET() {
  try {
    const col = await getCollection('camps');
    const count = await col.countDocuments({ tags: SHOWCASE_TAG });
    return NextResponse.json({ count, tag: SHOWCASE_TAG });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST action=seed | action=clear
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const col = await getCollection('camps');

    if (body.action === 'clear') {
      const result = await col.deleteMany({ tags: SHOWCASE_TAG });
      return NextResponse.json({ success: true, deleted: result.deletedCount });
    }

    if (body.action === 'seed') {
      // ลบของเก่าก่อน
      await col.deleteMany({ tags: SHOWCASE_TAG });

      const now = new Date();
      const docs = SHOWCASE_CAMPS.map(camp => ({
        ...camp,
        _id: new ObjectId(),
        createdAt: now,
        updatedAt: now,
      }));

      await col.insertMany(docs);
      return NextResponse.json({ success: true, inserted: docs.length });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
