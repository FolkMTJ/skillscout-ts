import { IconType } from "react-icons";
import {
  IoMdCode,
  IoMdCloud,
  IoLogoGameControllerA,
} from "react-icons/io";
import {
  MdPhoneAndroid,
  MdDataObject,
  MdSecurity,
  MdDesignServices,
  MdRouter,
} from "react-icons/md";

// ## TYPE DEFINITIONS ##
// This section defines the "shape" of your data.

export interface CategoryData {
  name: string;
  icon: IconType;
  gradient: string;
}

export interface CampData {
  id: string;
  name: string;
  image: string;
  date: string;
  location: string;
  price: string;
  deadline: string;
  daysLeft: number;
  description: string;
  category: string; // This should match a 'name' in CategoryData
  isTrending?: boolean;
  organizers?: Organizer[];
}
export interface Organizer {
  name: string;
  imageUrl: string;
}

// ## RAW DATA ##
// This section contains your actual mock data arrays.

const categories: CategoryData[] = [
  {
    name: "Web Development",
    icon: IoMdCode,
    gradient: "from-blue-500 to-sky-500",
  },
  {
    name: "Mobile Development",
    icon: MdPhoneAndroid,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "Data Science & AI",
    icon: MdDataObject,
    gradient: "from-purple-500 to-violet-500",
  },
  {
    name: "Cybersecurity",
    icon: MdSecurity,
    gradient: "from-red-500 to-rose-500",
  },
  {
    name: "Cloud & DevOps",
    icon: IoMdCloud,
    gradient: "from-orange-500 to-amber-500",
  },
  {
    name: "Game Development",
    icon: IoLogoGameControllerA,
    gradient: "from-indigo-500 to-fuchsia-500",
  },
  {
    name: "UI/UX Design",
    icon: MdDesignServices,
    gradient: "from-pink-500 to-cyan-500",
  },
  {
    name: "Networking",
    icon: MdRouter,
    gradient: "from-gray-500 to-slate-500",
  },
];

// In src/lib/db.ts

const allCamps: CampData[] = [
  {
    id: "1",
    name: "ค่ายเขียนโปรแกรม Python ขั้นพื้นฐาน",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=600&fit=crop",
    date: "15-17 ธ.ค. 2025",
    location: "มหาวิทยาลัยเกษตรศาสตร์",
    price: "฿2,500",
    deadline: "10 ธ.ค. 2025",
    daysLeft: 60,
    description: "เรียนรู้การเขียนโปรแกรมด้วย Python ตั้งแต่พื้นฐานจนถึงขั้นสูง เหมาะสำหรับผู้เริ่มต้น มีโปรเจคจริงให้ฝึกปฏิบัติ",
    category: "Web Development",
    organizers: [
      { name: "K'John", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&q=80" },
      { name: "P'Sarah", imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80" },
    ],
  },
  {
    id: "2",
    name: "ค่ายภาษาอังกฤษเข้มข้น",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop",
    date: "20-22 ธ.ค. 2025",
    location: "โรงแรมริเวอร์ไซด์ กรุงเทพฯ",
    price: "฿3,200",
    deadline: "12 ธ.ค. 2025",
    daysLeft: 62,
    description: "พัฒนาทักษะภาษาอังกฤษแบบเข้มข้น เน้นการสื่อสารในชีวิตประจำวัน พร้อมกิจกรรมสนุกๆ กับเจ้าของภาษา",
    category: "Mobile Development",
    organizers: [
      { name: "A'David", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80" },
    ],
  },
  {
    id: "3",
    name: "ค่ายวิทยาศาสตร์สนุก",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop",
    date: "18-20 ธ.ค. 2025",
    location: "ศูนย์วิทยาศาสตร์เพื่อการศึกษา",
    price: "฿2,800",
    deadline: "13 ธ.ค. 2025",
    daysLeft: 63,
    description: "ค้นพบความมหัศจรรย์ของวิทยาศาสตร์ผ่านการทดลองสนุกๆ เรียนรู้หลักการทางวิทยาศาสตร์จากผู้เชี่ยวชาญ",
    category: "Data Science & AI",
    organizers: [
      { name: "P'Sarah", imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80" },
      { name: "K'Emily", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80" },
    ],
  },
  {
    id: "4",
    name: "ค่ายดนตรีสร้างสรรค์",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop",
    date: "23-25 ธ.ค. 2025",
    location: "สตูดิโอดนตรี MusicHub",
    price: "฿3,500",
    deadline: "14 ธ.ค. 2025",
    daysLeft: 64,
    description: "เรียนรู้การแต่งเพลงและผลิตเพลงด้วยเทคโนโลยีสมัยใหม่ พร้อมบันทึกเพลงของตัวเองในสตูดิโอจริง",
    category: "UI/UX Design",
    organizers: [
        { name: "K'John", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&q=80" },
    ],
  },
  {
    id: "5",
    name: "ค่ายผู้นำเยาวชน",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop",
    date: "27-29 ธ.ค. 2025",
    location: "ค่ายลูกเสือ จ.นครนายก",
    price: "฿2,900",
    deadline: "15 ธ.ค. 2025",
    daysLeft: 65,
    description: "พัฒนาภาวะผู้นำและทักษะการทำงานเป็นทีม ฝึกการคิดวิเคราะห์และแก้ปัญหาในสถานการณ์จริง",
    category: "Cybersecurity",
     organizers: [
      { name: "A'David", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80" },
      { name: "K'Emily", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80" },
    ],
  },
  {
    id: "6",
    name: "ค่ายศิลปะสร้างสรรค์",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop",
    date: "30 ธ.ค. 2025 - 1 ม.ค. 2026",
    location: "หอศิลป์กรุงเทพฯ",
    price: "฿3,800",
    deadline: "16 ธ.ค. 2025",
    daysLeft: 66,
    description: "สำรวจโลกแห่งศิลปะผ่านการสร้างสรรค์งานศิลปะหลากหลายรูปแบบ พร้อมจัดแสดงผลงาน",
    category: "Game Development",
    organizers: [
      { name: "P'Sarah", imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80" },
    ],
  },
  {
    id: "7",
    name: "ค่ายโรบอติกส์และ AI",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
    date: "5-7 ม.ค. 2026",
    location: "มหาวิทยาลัยธรรมศาสตร์",
    price: "฿4,500",
    deadline: "25 ธ.ค. 2025",
    daysLeft: 75,
    description: "เรียนรู้การสร้างและเขียนโปรแกรมหุ่นยนต์ รวมถึงพื้นฐาน AI และ Machine Learning เหมาะสำหรับผู้ที่สนใจเทคโนโลยีล้ำสมัย มีการแข่งขันหุ่นยนต์ในวันสุดท้าย",
    category: "Data Science & AI",
    isTrending: true,
    organizers: [
      { name: "K'John", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&q=80" },
      { name: "A'David", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80" },
      { name: "K'Emily", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80" },
    ],
  },
  {
    id: "8",
    name: "ค่ายการเงินและการลงทุน",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    date: "12-14 ม.ค. 2026",
    location: "ตลาดหลักทรัพย์แห่งประเทศไทย",
    price: "฿3,900",
    deadline: "30 ธ.ค. 2025",
    daysLeft: 80,
    description: "เรียนรู้การวางแผนการเงิน การลงทุนในตลาดหุ้น และการจัดการเงินอย่างมีประสิทธิภาพ จากผู้เชี่ยวชาญในวงการการเงิน พร้อมเกมจำลองการลงทุน",
    category: "Networking",
    isTrending: true,
    organizers: [
      { name: "K'Emily", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80" },
    ],
  },
  {
    id: "9",
    name: "ค่ายภาพยนตร์และสื่อดิจิทัล",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop",
    date: "19-21 ม.ค. 2026",
    location: "สตูดิโอ GMM Grammy",
    price: "฿4,200",
    deadline: "5 ม.ค. 2026",
    daysLeft: 85,
    description: "สร้างภาพยนตร์สั้นของคุณเอง ตั้งแต่การเขียนบท ถ่ายทำ ไปจนถึงตัดต่อ เรียนรู้จากผู้กำกับและช่างภาพมืออาชีพ พร้อมฉายผลงานในโรงหนังจริง",
    category: "UI/UX Design",
    isTrending: true,
    organizers: [
      { name: "P'Sarah", imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80" },
      { name: "A'David", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80" },
    ],
  },
];

// This is the default export that the data service will use.
export { allCamps, categories };