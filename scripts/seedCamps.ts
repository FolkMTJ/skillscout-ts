// Run with: npx tsx scripts/seedCamps.ts
// Install tsx if needed: npm install -D tsx

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { resolve } from 'path';

// โหลด environment variables
config({ path: resolve(__dirname, '../.env.local') });

// MongoDB Connection
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }
  
  await mongoose.connect(MONGODB_URI);
}

// Camp Schema
const OrganizerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

const QualificationsSchema = new mongoose.Schema({
  level: { type: String, required: true },
  fields: [{ type: String }],
});

const ReviewSchema = new mongoose.Schema({
  id: { type: String, required: true },
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: String, required: true },
});

const CampSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String, required: true },
  galleryImages: [{ type: String }],
  description: { type: String, required: true },
  deadline: { type: String, required: true },
  participantCount: { type: Number, required: true },
  activityFormat: { type: String, required: true },
  qualifications: { type: QualificationsSchema, required: true },
  additionalInfo: [{ type: String }],
  organizers: [OrganizerSchema],
  reviews: [ReviewSchema],
  avgRating: { type: Number, default: 0 },
  ratingBreakdown: {
    type: Map,
    of: Number,
    default: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
  },
  featured: { type: Boolean, default: false },
  slug: { type: String, unique: true, required: true },
}, {
  timestamps: true,
});

CampSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

interface ReviewType {
  rating: number;
}

CampSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    const breakdown: { [key: string]: number } = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    let totalRating = 0;

    this.reviews.forEach((review: ReviewType) => {
      totalRating += review.rating;
      breakdown[review.rating.toString()]++;
    });

    this.avgRating = totalRating / this.reviews.length;
    this.ratingBreakdown = new Map(Object.entries(breakdown));
  }
  next();
});

const Camp = mongoose.models.Camp || mongoose.model('Camp', CampSchema);

const sampleCamps = [
  {
    name: "Data Science Bootcamp 2024",
    category: "Data Science",
    date: "15-20 มกราคม 2025",
    location: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี",
    price: "ฟรี",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    galleryImages: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3"
    ],
    description: "ค่ายเข้มข้นสำหรับผู้ที่สนใจด้าน Data Science เรียนรู้ตั้งแต่พื้นฐานจนถึงการประยุกต์ใช้งานจริง",
    deadline: "31 ธันวาคม 2024",
    participantCount: 50,
    activityFormat: "Workshop + Hands-on Project",
    qualifications: {
      level: "นิสิต/นักศึกษาปี 2-4 หรือผู้สนใจทั่วไป",
      fields: ["วิทยาการคอมพิวเตอร์", "วิศวกรรมคอมพิวเตอร์", "คณิตศาสตร์"]
    },
    additionalInfo: [
      "มีใบประกาศนียบัตร",
      "มีอาหารว่างและเครื่องดื่มตลอดค่าย",
      "แจกของที่ระลึก"
    ],
    organizers: [
      {
        name: "KMUTT",
        imageUrl: "https://via.placeholder.com/100"
      }
    ],
    reviews: [
      {
        id: "1",
        author: "สมชาย ใจดี",
        rating: 5,
        comment: "ค่ายดีมาก ได้ความรู้เยอะ วิทยากรสอนดี",
        date: "2024-12-01"
      }
    ],
    featured: true
  },
  {
    name: "Web Development Workshop",
    category: "Web Development",
    date: "10-12 กุมภาพันธ์ 2025",
    location: "จุฬาลงกรณ์มหาวิทยาลัย",
    price: "500 บาท",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    galleryImages: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      "https://images.unsplash.com/photo-1593720213428-28a5b9e94613",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6"
    ],
    description: "เรียนรู้การพัฒนาเว็บไซต์สมัยใหม่ด้วย React, Next.js และ Tailwind CSS",
    deadline: "31 มกราคม 2025",
    participantCount: 40,
    activityFormat: "Lecture + Workshop",
    qualifications: {
      level: "มีพื้นฐาน HTML, CSS, JavaScript",
      fields: ["วิทยาการคอมพิวเตอร์", "วิศวกรรมซอฟต์แวร์"]
    },
    additionalInfo: [
      "ต้องนำ Laptop มาเอง",
      "มีใบประกาศนียบัตร",
      "โปรเจ็กต์จบค่าย"
    ],
    organizers: [
      {
        name: "Chula Engineering",
        imageUrl: "https://via.placeholder.com/100"
      }
    ],
    reviews: [],
    featured: true
  },
  {
    name: "AI & Machine Learning Camp",
    category: "AI/ML",
    date: "1-5 มีนาคม 2025",
    location: "มหาวิทยาลัยเกษตรศาสตร์",
    price: "ฟรี",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
    galleryImages: [
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
      "https://images.unsplash.com/photo-1677442136019-21780ecad995",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485"
    ],
    description: "ค่าย AI และ Machine Learning เข้มข้น เรียนรู้การสร้างโมเดล AI ตั้งแต่เริ่มต้น",
    deadline: "15 กุมภาพันธ์ 2025",
    participantCount: 60,
    activityFormat: "Lecture + Project-based Learning",
    qualifications: {
      level: "นักศึกษาปี 2-4 หรือผู้มีพื้นฐาน Python",
      fields: ["วิทยาการคอมพิวเตอร์", "วิศวกรรมคอมพิวเตอร์", "วิศวกรรมไฟฟ้า"]
    },
    additionalInfo: [
      "มีใบประกาศนียบัตร",
      "ที่พักฟรี (สำหรับต่างจังหวัด)",
      "อาหาร 3 มื้อ"
    ],
    organizers: [
      {
        name: "KU Engineering",
        imageUrl: "https://via.placeholder.com/100"
      }
    ],
    reviews: [
      {
        id: "2",
        author: "สมหญิง รักเรียน",
        rating: 5,
        comment: "ค่ายสุดยอด ได้ทำโปรเจ็กต์จริง",
        date: "2024-11-15"
      },
      {
        id: "3",
        author: "ธนา เทคนิค",
        rating: 4,
        comment: "ดีมาก แต่เนื้อหาเยอะไปนิด",
        date: "2024-11-20"
      }
    ],
    featured: false
  },
  {
    name: "Mobile App Development",
    category: "Mobile Development",
    date: "20-24 มีนาคม 2025",
    location: "มหาวิทยาลัยธรรมศาสตร์",
    price: "800 บาท",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c",
    galleryImages: [
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c",
      "https://images.unsplash.com/photo-1551650975-87deedd944c3",
      "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb"
    ],
    description: "เรียนรู้การพัฒนาแอพมือถือด้วย React Native และ Flutter",
    deadline: "10 มีนาคม 2025",
    participantCount: 35,
    activityFormat: "Workshop + Team Project",
    qualifications: {
      level: "มีพื้นฐานการเขียนโปรแกรม",
      fields: ["วิทยาการคอมพิวเตอร์", "วิศวกรรมซอฟต์แวร์", "เทคโนโลยีสารสนเทศ"]
    },
    additionalInfo: [
      "ต้องนำ Laptop มาเอง",
      "มีใบประกาศนียบัตร",
      "Workshop โดยวิทยากรจากบริษัทชั้นนำ"
    ],
    organizers: [
      {
        name: "TU Engineering",
        imageUrl: "https://via.placeholder.com/100"
      }
    ],
    reviews: [],
    featured: true
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('Clearing existing camps...');
    await Camp.deleteMany({});
    
    console.log('Seeding camps...');
    
    // สร้าง slug ให้แต่ละค่ายก่อน insert
    const campsWithSlug = sampleCamps.map(camp => ({
      ...camp,
      slug: camp.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }));
    
    const createdCamps = await Camp.insertMany(campsWithSlug);
    
    console.log(`✅ Successfully seeded ${createdCamps.length} camps!`);
    console.log('📊 Created camps:');
    createdCamps.forEach(camp => {
      console.log(`   - ${camp.name} (${camp.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

seedDatabase();