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

export interface CategoryData {
    name: string;
    icon: IconType;
    gradient: string;
}

export interface Organizer {
    name: string;
    imageUrl: string;
}

export interface Review {
    id: number;
    author: string;
    rating: number;
    comment: string;
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
    category: string;
    isTrending?: boolean;
    organizers?: Organizer[];
    // --- Fields for Detail View ---
    activityFormat: string;
    participantCount: number;
    qualifications: {
        level: string;
        fields?: string[];
    };
    additionalInfo: string[];
    galleryImages: string[];
    reviews: Review[];
    avgRating: number;
    ratingBreakdown: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}

// ## RAW DATA ##

const categories: CategoryData[] = [
    { name: "Web Development", icon: IoMdCode, gradient: "from-blue-500 to-sky-500" },
    { name: "Mobile Development", icon: MdPhoneAndroid, gradient: "from-green-500 to-emerald-500" },
    { name: "Data Science & AI", icon: MdDataObject, gradient: "from-purple-500 to-violet-500" },
    { name: "Cybersecurity", icon: MdSecurity, gradient: "from-red-500 to-rose-500" },
    { name: "Cloud & DevOps", icon: IoMdCloud, gradient: "from-orange-500 to-amber-500" },
    { name: "Game Development", icon: IoLogoGameControllerA, gradient: "from-indigo-500 to-fuchsia-500" },
    { name: "UI/UX Design", icon: MdDesignServices, gradient: "from-pink-500 to-cyan-500" },
    { name: "Networking", icon: MdRouter, gradient: "from-gray-500 to-slate-500" },
];

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
        description: "AI + MODEL MAKING ARCHITECTURE WORKSHOP 🤖✏️ A 2-day hands-on workshop where high school students turn ideas into real architectural models using AI tools like Midjourney and DALL·E. Learn how to create stunning visuals, sketch, and build your own designs while exploring space, form, and proportion. No experience needed—just imagination! 🧠 Learn AI design tools ✏️ Sketch + model your ideas 👫 Collaborate in a fun, beginner-friendly space 🎓 Perfect for portfolios! 🎟 Limited seats available – sign up now before it’s full ",
        category: "Web Development",
        organizers: [
            { name: "K'John", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&q=80" },
            { name: "P'Sarah", imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80" },
        ],
        activityFormat: "On-site",
        participantCount: 50,
        qualifications: { level: "ม.4 - ม.6", fields: ["สายวิทย์-คณิต", "สายศิลป์-คำนวณ"] },
        additionalInfo: ["มีประกาศนียบัตร", "มีอาหารกลางวัน", "ต้องนำคอมพิวเตอร์มาเอง"],
        galleryImages: [
            "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&h=600&fit=crop",
        ],
        reviews: [
            { id: 1, author: "สมชาย", rating: 5, comment: "เนื้อหาดีมากครับ สอนเข้าใจง่าย" },
            { id: 2, author: "มานี", rating: 4, comment: "ได้ความรู้เยอะเลยค่ะ แต่เวลาทำโปรเจคน้อยไปหน่อย" },
        ],
        avgRating: 4.5,
        ratingBreakdown: { 5: 1, 4: 1, 3: 0, 2: 0, 1: 0 },
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
        organizers: [{ name: "A'David", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80" }],
        activityFormat: "On-site",
        participantCount: 30,
        qualifications: { level: "ม.1 - ม.6" },
        additionalInfo: ["มีประกาศนียบัตร", "มีอาหารกลางวันและเย็น"],
        galleryImages: [
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
            "https://images.unsplash.com/photo-1524178232363-1fb2b075b655",
            "https://images.unsplash.com/photo-1556761175-b413da4b2488",
        ],
        reviews: [{ id: 1, author: "ปิติ", rating: 5, comment: "สนุกมากครับ ได้เพื่อนใหม่เยอะเลย" }],
        avgRating: 5.0,
        ratingBreakdown: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
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
        activityFormat: "On-site",
        participantCount: 40,
        qualifications: { level: "ประถมปลาย - ม.ต้น" },
        additionalInfo: ["มีประกาศนียบัตร", "อุปกรณ์การทดลองครบครัน"],
        galleryImages: [
            "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1554475901-4538adb79245?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=800&h=600&fit=crop",
        ],
        reviews: [
            { id: 1, author: "ชูใจ", rating: 5, comment: "ลูกชายชอบมาก กลับมาเล่าให้ฟังทุกวันเลยค่ะ" },
            { id: 2, author: "วีระ", rating: 5, comment: "การทดลองสนุกและน่าตื่นเต้นมากครับ" },
        ],
        avgRating: 5.0,
        ratingBreakdown: { 5: 2, 4: 0, 3: 0, 2: 0, 1: 0 },
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
        organizers: [{ name: "K'John", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&q=80" }],
        activityFormat: "Hybrid",
        participantCount: 20,
        qualifications: { level: "ไม่จำกัดอายุ" },
        additionalInfo: ["ได้ไฟล์เพลงของตัวเอง", "ดูงานเบื้องหลังการผลิต"],
        galleryImages: [
            "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1499415479124-43c32433a620?w=800&h=600&fit=crop",
        ],
        reviews: [{ id: 1, author: "แก้ว", rating: 4, comment: "ดีค่ะ แต่คนเยอะไปหน่อย" }],
        avgRating: 4.0,
        ratingBreakdown: { 5: 0, 4: 1, 3: 0, 2: 0, 1: 0 },
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
        activityFormat: "On-site (ค้างคืน)",
        participantCount: 60,
        qualifications: { level: "ม.4 - ม.6" },
        additionalInfo: ["มีประกาศนียบัตร", "รวมค่าที่พักและอาหารทุกมื้อ"],
        galleryImages: [
            "https://images.unsplash.com/photo-1573496773905-f5b17e76b254?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1549490105-d85c5f4b3613?w=800&h=600&fit=crop",
        ],
        reviews: [],
        avgRating: 0.0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
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
        organizers: [{ name: "P'Sarah", imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80" }],
        activityFormat: "On-site",
        participantCount: 25,
        qualifications: { level: "ไม่จำกัดอายุ" },
        additionalInfo: ["มีประกาศนียบัตร", "รวมอุปกรณ์ศิลปะ"],
        galleryImages: [
            "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop",
        ],
        reviews: [{ id: 1, author: "มานะ", rating: 5, comment: "ได้ปลดปล่อยจินตนาการเต็มที่เลยครับ" }],
        avgRating: 5.0,
        ratingBreakdown: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
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
        ],
        activityFormat: "On-site",
        participantCount: 30,
        qualifications: { level: "ม.ปลาย", fields: ["สายวิทย์-คณิต"] },
        additionalInfo: ["มีประกาศนียบัตร", "มีชุดหุ่นยนต์ให้ยืม"],
        galleryImages: [
            "https://images.unsplash.com/photo-1581092921462-20526958197c?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1620712943543-2858200f7456?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=600&fit=crop",
        ],
        reviews: [
            { id: 1, author: "สมศักดิ์", rating: 5, comment: "พี่ๆ สอนดีมากครับ ได้ความรู้ AI เพียบ" },
            { id: 2, author: "ธิดา", rating: 4, comment: "หุ่นยนต์น่ารักมากค่ะ อยากได้กลับบ้านเลย" },
        ],
        avgRating: 4.5,
        ratingBreakdown: { 5: 1, 4: 1, 3: 0, 2: 0, 1: 0 },
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
        organizers: [{ name: "K'Emily", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80" }],
        activityFormat: "Online",
        participantCount: 100,
        qualifications: { level: "มหาวิทยาลัย - วัยทำงาน" },
        additionalInfo: ["เอกสารประกอบการเรียน", "เข้าร่วมกลุ่มปรึกษาการลงทุน"],
        galleryImages: [
            "https://images.unsplash.com/photo-1554224155-1696413565d3?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1579621970795-87f54f2c5d8a?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=800&h=600&fit=crop",
        ],
        reviews: [{ id: 1, author: "นักลงทุน", rating: 5, comment: "ข้อมูลแน่นมากครับ" }],
        avgRating: 5.0,
        ratingBreakdown: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
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
        activityFormat: "On-site",
        participantCount: 25,
        qualifications: { level: "ม.ปลาย - มหาวิทยาลัย" },
        additionalInfo: ["มีประกาศนียบัตร", "ใช้อุปกรณ์ถ่ายทำระดับมืออาชีพ"],
        galleryImages: [
            "https://images.unsplash.com/photo-1521923239330-9c2b545415f3?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1489599849927-2ee91e3b43d3?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&h=600&fit=crop",
        ],
        reviews: [{ id: 1, author: "คนรักหนัง", rating: 5, comment: "เป็นประสบการณ์ที่ดีที่สุดในชีวิตเลยครับ!" }],
        avgRating: 5.0,
        ratingBreakdown: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
    },
];

export { allCamps, categories };