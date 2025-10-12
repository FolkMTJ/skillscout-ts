"use client";

import React from "react";
import { Button, Input, Chip } from "@heroui/react";
import { FaSearch, FaFire, FaStar, FaUsers, FaAward, FaTrophy } from "react-icons/fa";
import CampCarousel from "@/components/(card)/CampCarousel";
import CampCard, { CampData } from "@/components/(card)/CampCard";
import Footer from "@/components/layout/Footer";

// Mock Data
const urgentCamps: CampData[] = [
  {
    id: "1",
    name: "ค่ายเขียนโปรแกรม Python",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=600&fit=crop",
    date: "15-17 ธ.ค. 2567",
    location: "มหาวิทยาลัยเกษตรศาสตร์",
    price: "฿2,500",
    deadline: "10 ธ.ค. 2567",
    daysLeft: 2,
    description: "เรียนรู้การเขียนโปรแกรมด้วย Python ตั้งแต่พื้นฐานจนถึงขั้นสูง เหมาะสำหรับผู้เริ่มต้น มีโปรเจคจริงให้ฝึกปฏิบัติ",
    category: "เทคโนโลยี"
  },
  {
    id: "2",
    name: "ค่ายภาษาอังกฤษเข้มข้น",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop",
    date: "20-22 ธ.ค. 2567",
    location: "โรงแรมริเวอร์ไซด์ กรุงเทพฯ",
    price: "฿3,200",
    deadline: "12 ธ.ค. 2567",
    daysLeft: 1,
    description: "พัฒนาทักษะภาษาอังกฤษแบบเข้มข้น เน้นการสื่อสารในชีวิตประจำวัน พร้อมกิจกรรมสนุกๆ กับเจ้าของภาษา",
    category: "ภาษา"
  },
  {
    id: "3",
    name: "ค่ายวิทยาศาสตร์สนุก",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop",
    date: "18-20 ธ.ค. 2567",
    location: "ศูนย์วิทยาศาสตร์เพื่อการศึกษา",
    price: "฿2,800",
    deadline: "13 ธ.ค. 2567",
    daysLeft: 2,
    description: "ค้นพบความมหัศจรรย์ของวิทยาศาสตร์ผ่านการทดลองสนุกๆ เรียนรู้หลักการทางวิทยาศาสตร์จากผู้เชี่ยวชาญ",
    category: "วิทยาศาสตร์"
  },
  {
    id: "4",
    name: "ค่ายดนตรีสร้างสรรค์",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop",
    date: "23-25 ธ.ค. 2567",
    location: "สตูดิโอดนตรี MusicHub",
    price: "฿3,500",
    deadline: "14 ธ.ค. 2567",
    daysLeft: 1,
    description: "เรียนรู้การแต่งเพลงและผลิตเพลงด้วยเทคโนโลยีสมัยใหม่ พร้อมบันทึกเพลงของตัวเองในสตูดิโอจริง",
    category: "ศิลปะ"
  },
  {
    id: "5",
    name: "ค่ายผู้นำเยาวชน",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop",
    date: "27-29 ธ.ค. 2567",
    location: "ค่ายลูกเสือ จ.นครนายก",
    price: "฿2,900",
    deadline: "15 ธ.ค. 2567",
    daysLeft: 2,
    description: "พัฒนาภาวะผู้นำและทักษะการทำงานเป็นทีม ฝึกการคิดวิเคราะห์และแก้ปัญหาในสถานการณ์จริง",
    category: "ภาวะผู้นำ"
  },
  {
    id: "6",
    name: "ค่ายศิลปะสร้างสรรค์",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop",
    date: "30 ธ.ค. 2567 - 1 ม.ค. 2568",
    location: "หอศิลป์กรุงเทพฯ",
    price: "฿3,800",
    deadline: "16 ธ.ค. 2567",
    daysLeft: 1,
    description: "สำรวจโลกแห่งศิลปะผ่านการสร้างสรรค์งานศิลปะหลากหลายรูปแบบ พร้อมจัดแสดงผลงาน",
    category: "ศิลปะ"
  }
];

const trendingCamps: CampData[] = [
  {
    id: "7",
    name: "ค่ายโรบอติกส์และ AI",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
    date: "5-7 ม.ค. 2568",
    location: "มหาวิทยาลัยธรรมศาสตร์",
    price: "฿4,500",
    deadline: "25 ธ.ค. 2567",
    daysLeft: 12,
    description: "เรียนรู้การสร้างและเขียนโปรแกรมหุ่นยนต์ รวมถึงพื้นฐาน AI และ Machine Learning เหมาะสำหรับผู้ที่สนใจเทคโนโลยีล้ำสมัย มีการแข่งขันหุ่นยนต์ในวันสุดท้าย",
    category: "เทคโนโลยี"
  },
  {
    id: "8",
    name: "ค่ายการเงินและการลงทุน",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    date: "12-14 ม.ค. 2568",
    location: "ตลาดหลักทรัพย์แห่งประเทศไทย",
    price: "฿3,900",
    deadline: "30 ธ.ค. 2567",
    daysLeft: 17,
    description: "เรียนรู้การวางแผนการเงิน การลงทุนในตลาดหุ้น และการจัดการเงินอย่างมีประสิทธิภาพ จากผู้เชี่ยวชาญในวงการการเงิน พร้อมเกมจำลองการลงทุน",
    category: "ธุรกิจ"
  },
  {
    id: "9",
    name: "ค่ายภาพยนตร์และสื่อดิจิทัล",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop",
    date: "19-21 ม.ค. 2568",
    location: "สตูดิโอ GMM Grammy",
    price: "฿4,200",
    deadline: "5 ม.ค. 2568",
    daysLeft: 23,
    description: "สร้างภาพยนตร์สั้นของคุณเอง ตั้งแต่การเขียนบท ถ่ายทำ ไปจนถึงตัดต่อ เรียนรู้จากผู้กำกับและช่างภาพมืออาชีพ พร้อมฉายผลงานในโรงหนังจริง",
    category: "ศิลปะ"
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 overflow-x-hidden">
      {/* Banner Section */}
      <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-black/80 to-black/90" />
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 via-transparent to-purple-500/20 animate-pulse" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-20">
          {/* Badge */}
          <Chip
            variant="flat"
            className="mb-6 bg-white/10 backdrop-blur-md border border-white/20"
            classNames={{
              content: "text-white font-semibold"
            }}
            startContent={<FaTrophy className="text-yellow-400" />}
          >
            แพลตฟอร์มค้นหาค่ายอันดับ 1 ของไทย
          </Chip>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            ค้นพบค่ายที่
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400"> ใช่ </span>
            สำหรับคุณ
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-200 mb-10 leading-relaxed max-w-3xl mx-auto">
            พัฒนาทักษะ สร้างประสบการณ์ เปิดโลกใหม่<br className="hidden md:block" />
            พร้อมเพื่อนใหม่และโอกาสใหม่ๆ ที่รอคุณอยู่
          </p>
          
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-12">
            <Input
              size="lg"
              placeholder="ค้นหาค่ายที่คุณสนใจ..."
              classNames={{
                base: "flex-1",
                inputWrapper: "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-white/20 hover:border-primary-500 h-14 shadow-xl",
                input: "text-base"
              }}
              startContent={<FaSearch className="text-zinc-400" />}
            />
            <Button
              size="lg"
              color="primary"
              className="h-14 px-10 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              endContent={<FaSearch />}
            >
              ค้นหา
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <FaAward className="text-primary-400 text-3xl mb-3 mx-auto" />
              <p className="text-4xl font-bold text-white mb-1">150+</p>
              <p className="text-zinc-300 text-sm">ค่ายทั้งหมด</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <FaUsers className="text-purple-400 text-3xl mb-3 mx-auto" />
              <p className="text-4xl font-bold text-white mb-1">5,000+</p>
              <p className="text-zinc-300 text-sm">ผู้เข้าร่วม</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <FaStar className="text-yellow-400 text-3xl mb-3 mx-auto" />
              <p className="text-4xl font-bold text-white mb-1">4.8★</p>
              <p className="text-zinc-300 text-sm">คะแนนเฉลี่ย</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <FaTrophy className="text-orange-400 text-3xl mb-3 mx-auto" />
              <p className="text-4xl font-bold text-white mb-1">95%</p>
              <p className="text-zinc-300 text-sm">ความพึงพอใจ</p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 to-transparent" />
      </section>

      {/* Urgent Registration Section */}
      <section className="max-w-[1536px] mx-auto px-6 py-20">
        <CampCarousel
          camps={urgentCamps}
          title="🔥 กำลังจะปิดรับเร็วๆ นี้"
          subtitle="รีบสมัครก่อนหมดเขต! ที่นั่งเหลือน้อย"
        />
      </section>

      {/* Trending Section */}
      <section className="bg-white dark:bg-black py-20">
        <div className="max-w-[1536px] mx-auto px-6">
          <div className="text-center mb-12">
            <Chip
              variant="flat"
              color="warning"
              className="mb-4"
              startContent={<FaStar />}
            >
              ยอดนิยม
            </Chip>
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              กำลังมาแรง
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
              ค่ายยอดนิยมที่ได้รับความสนใจสูงสุดในเดือนนี้
            </p>
          </div>

          <div className="space-y-6">
            {trendingCamps.map((camp) => (
              <CampCard key={camp.id} camp={camp} variant="detailed" />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-[1536px] mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            สำรวจตามหมวดหมู่
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            เลือกหมวดหมู่ที่คุณสนใจ
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { name: "เทคโนโลยี", icon: "💻", color: "primary" },
            { name: "ภาษา", icon: "🌍", color: "success" },
            { name: "วิทยาศาสตร์", icon: "🔬", color: "secondary" },
            { name: "ศิลปะ", icon: "🎨", color: "warning" },
            { name: "ธุรกิจ", icon: "💼", color: "danger" },
            { name: "กีฬา", icon: "⚽", color: "primary" },
            { name: "ภาวะผู้นำ", icon: "👥", color: "success" },
            { name: "อื่นๆ", icon: "✨", color: "secondary" },
          ].map((category) => (
            <Button
              key={category.name}
              variant="flat"
              className="h-24 flex flex-col gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary-500 dark:hover:border-primary-500 hover:scale-105 transition-all"
            >
              <span className="text-3xl">{category.icon}</span>
              <span className="font-semibold">{category.name}</span>
            </Button>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-purple-600 dark:from-primary-700 dark:via-primary-600 dark:to-purple-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-[1536px] mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            พร้อมที่จะเริ่มต้นแล้วหรือยัง?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            สมัครสมาชิกวันนี้ เพื่อรับข่าวสารค่ายใหม่ๆ โปรโมชั่นพิเศษ และส่วนลดสุดคุ้ม
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-white text-primary-600 font-semibold px-10 rounded-full shadow-2xl hover:scale-105 transition-all"
            >
              สมัครสมาชิกฟรี
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="border-2 border-white text-white font-semibold px-10 rounded-full hover:bg-white/10 transition-all"
            >
              เรียนรู้เพิ่มเติม
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        body {
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}