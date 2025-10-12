"use client";

import React from "react";
import { Button, Input } from "@heroui/react";
import { 
  FaSearch, 
  FaFire, 
  FaStar, 
  FaUsers, 
  FaTrophy,
  FaRocket,
  FaSmile,
  FaChartLine
} from "react-icons/fa";
import { 
  IoMdLaptop, 
  IoMdGlobe, 
  IoMdFootball 
} from "react-icons/io";
import { 
  MdScience, 
  MdBrush, 
  MdBusinessCenter,
  MdGroups,
  MdMoreHoriz
} from "react-icons/md";
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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] overflow-x-hidden">
      {/* Banner Section */}
      <section className="relative min-h-[750px] flex items-center justify-center overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-[#2C2C2C]">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `linear-gradient(#F2B33D 1px, transparent 1px), linear-gradient(90deg, #F2B33D 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
          
          {/* Animated Yellow Gradients */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F2B33D]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD700]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop')",
          }}
        />
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F2B33D]/20 backdrop-blur-md border-2 border-[#F2B33D] mb-8 hover:scale-105 transition-transform">
            <FaTrophy className="text-[#F2B33D]" size={20} />
            <span className="font-bold text-white">แพลตฟอร์มค้นหาค่ายอันดับ 1 ของไทย</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white mb-6 leading-tight tracking-tight">
            ค้นพบค่ายที่
            <span className="block text-[#F2B33D] drop-shadow-[0_0_30px_rgba(242,179,61,0.5)]">
              ใช่สำหรับคุณ
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-300 mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
            พัฒนาทักษะ สร้างประสบการณ์ เปิดโลกใหม่<br className="hidden md:block" />
            <span className="text-[#F2B33D]">พร้อมเพื่อนใหม่และโอกาสใหม่ๆ</span> ที่รอคุณอยู่
          </p>
          
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto mb-16">
            <div className="flex-1">
              <Input
                size="lg"
                placeholder="ค้นหาค่ายที่คุณสนใจ เช่น Python, AI, ภาษา..."
                classNames={{
                  base: "w-full",
                  inputWrapper: "bg-white dark:bg-white h-16 shadow-2xl border-2 border-transparent hover:border-[#F2B33D] transition-all",
                  input: "text-base text-[#2C2C2C] placeholder:text-zinc-400"
                }}
                startContent={<FaSearch className="text-[#F2B33D]" size={20} />}
              />
            </div>
            <Button
              size="lg"
              className="h-16 px-12 font-bold text-lg shadow-2xl hover:shadow-[#F2B33D]/50 hover:scale-105 transition-all bg-gradient-to-r from-[#F2B33D] to-[#FFD700] text-[#2C2C2C] border-2 border-[#2C2C2C]"
              endContent={<FaRocket size={20} />}
            >
              ค้นหา
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border-2 border-[#F2B33D]/30 rounded-2xl p-6 hover:bg-[#F2B33D]/20 hover:border-[#F2B33D] hover:scale-105 transition-all duration-300 group">
              <FaTrophy className="text-[#F2B33D] text-4xl mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-5xl font-black text-white mb-1">150+</p>
              <p className="text-zinc-300 font-semibold">ค่ายทั้งหมด</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border-2 border-[#F2B33D]/30 rounded-2xl p-6 hover:bg-[#F2B33D]/20 hover:border-[#F2B33D] hover:scale-105 transition-all duration-300 group">
              <FaUsers className="text-[#F2B33D] text-4xl mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-5xl font-black text-white mb-1">5K+</p>
              <p className="text-zinc-300 font-semibold">ผู้เข้าร่วม</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border-2 border-[#F2B33D]/30 rounded-2xl p-6 hover:bg-[#F2B33D]/20 hover:border-[#F2B33D] hover:scale-105 transition-all duration-300 group">
              <FaStar className="text-[#F2B33D] text-4xl mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-5xl font-black text-white mb-1">4.8★</p>
              <p className="text-zinc-300 font-semibold">คะแนนเฉลี่ย</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border-2 border-[#F2B33D]/30 rounded-2xl p-6 hover:bg-[#F2B33D]/20 hover:border-[#F2B33D] hover:scale-105 transition-all duration-300 group">
              <FaSmile className="text-[#F2B33D] text-4xl mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-5xl font-black text-white mb-1">95%</p>
              <p className="text-zinc-300 font-semibold">ความพึงพอใจ</p>
            </div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-[#0a0a0a] to-transparent" />
      </section>

      {/* Urgent Registration Section */}
      <section className="max-w-[1536px] mx-auto px-6 py-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-12 bg-gradient-to-b from-[#F2B33D] to-[#FFD700] rounded-full" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaFire className="text-red-500 animate-pulse" size={24} />
              <h2 className="text-4xl font-black text-[#2C2C2C] dark:text-white">
                กำลังจะปิดรับเร็วๆ นี้
              </h2>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium">
              รีบสมัครก่อนหมดเขต! ที่นั่งเหลือน้อย
            </p>
          </div>
        </div>
        <CampCarousel camps={urgentCamps} title="" />
      </section>

      {/* Trending Section */}
      <section className="bg-gradient-to-br from-zinc-50 to-white dark:from-[#1a1a1a] dark:to-[#0a0a0a] py-20 border-y-2 border-[#F2B33D]/20">
        <div className="max-w-[1536px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F2B33D]/20 backdrop-blur-md border-2 border-[#F2B33D] mb-4">
              <FaStar className="text-[#F2B33D]" />
              <span className="font-bold text-[#2C2C2C] dark:text-white">ยอดนิยม</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-[#2C2C2C] dark:text-white mb-4">
              กำลัง<span className="text-[#F2B33D]">มาแรง</span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-xl max-w-2xl mx-auto font-medium">
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
          <h2 className="text-5xl md:text-6xl font-black text-[#2C2C2C] dark:text-white mb-4">
            สำรวจตาม<span className="text-[#F2B33D]">หมวดหมู่</span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-xl font-medium">
            เลือกหมวดหมู่ที่คุณสนใจและเริ่มต้นการเรียนรู้
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { name: "เทคโนโลยี", icon: <IoMdLaptop size={40} />, gradient: "from-blue-500 to-cyan-500" },
            { name: "ภาษา", icon: <IoMdGlobe size={40} />, gradient: "from-green-500 to-emerald-500" },
            { name: "วิทยาศาสตร์", icon: <MdScience size={40} />, gradient: "from-purple-500 to-pink-500" },
            { name: "ศิลปะ", icon: <MdBrush size={40} />, gradient: "from-orange-500 to-red-500" },
            { name: "ธุรกิจ", icon: <MdBusinessCenter size={40} />, gradient: "from-yellow-500 to-orange-500" },
            { name: "กีฬา", icon: <IoMdFootball size={40} />, gradient: "from-indigo-500 to-blue-500" },
            { name: "ภาวะผู้นำ", icon: <MdGroups size={40} />, gradient: "from-teal-500 to-green-500" },
            { name: "อื่นๆ", icon: <MdMoreHoriz size={40} />, gradient: "from-gray-500 to-slate-500" },
          ].map((category) => (
            <Button
              key={category.name}
              variant="flat"
              className="h-32 flex flex-col gap-3 bg-white dark:bg-[#2C2C2C] border-2 border-zinc-200 dark:border-zinc-800 hover:border-[#F2B33D] hover:shadow-lg hover:shadow-[#F2B33D]/20 hover:scale-105 transition-all duration-300 group"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${category.gradient} group-hover:scale-110 transition-transform`}>
                <span className="text-white">
                  {category.icon}
                </span>
              </div>
              <span className="font-bold text-lg text-[#2C2C2C] dark:text-white group-hover:text-[#F2B33D] transition-colors">
                {category.name}
              </span>
            </Button>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2C2C2C] via-[#1a1a1a] to-[#2C2C2C]">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F2B33D] rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFD700] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(#F2B33D 2px, transparent 2px), linear-gradient(90deg, #F2B33D 2px, transparent 2px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        <div className="relative max-w-[1536px] mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F2B33D]/20 backdrop-blur-md border-2 border-[#F2B33D] mb-6">
            <FaRocket className="text-[#F2B33D]" />
            <span className="font-bold text-white">เริ่มต้นวันนี้</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            พร้อมที่จะ<span className="text-[#F2B33D]">เริ่มต้น</span>แล้วหรือยัง?
          </h2>
          <p className="text-xl text-zinc-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            สมัครสมาชิกวันนี้ เพื่อรับข่าวสารค่ายใหม่ๆ<br />
            <span className="text-[#F2B33D]">โปรโมชั่นพิเศษ</span> และ<span className="text-[#F2B33D]">ส่วนลดสุดคุ้ม</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="h-16 px-12 font-bold text-lg shadow-2xl hover:scale-105 transition-all bg-gradient-to-r from-[#F2B33D] to-[#FFD700] text-[#2C2C2C] border-2 border-white"
            >
              สมัครสมาชิกฟรี
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="h-16 px-12 font-bold text-lg border-2 border-[#F2B33D] text-[#F2B33D] hover:bg-[#F2B33D]/10 transition-all"
            >
              เรียนรู้เพิ่มเติม
            </Button>
          </div>

          {/* Bottom Stats */}
          <div className="flex justify-center items-center gap-8 mt-16 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#F2B33D] flex items-center justify-center">
                <FaChartLine className="text-[#2C2C2C]" size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm text-zinc-400">การเติบโต</p>
                <p className="text-xl font-bold text-white">+250%</p>
              </div>
            </div>
            <div className="w-px h-12 bg-zinc-700" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#F2B33D] flex items-center justify-center">
                <FaUsers className="text-[#2C2C2C]" size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm text-zinc-400">สมาชิกใหม่</p>
                <p className="text-xl font-bold text-white">1,200+</p>
              </div>
            </div>
            <div className="w-px h-12 bg-zinc-700" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#F2B33D] flex items-center justify-center">
                <FaTrophy className="text-[#2C2C2C]" size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm text-zinc-400">รางวัลที่ได้รับ</p>
                <p className="text-xl font-bold text-white">15+</p>
              </div>
            </div>
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