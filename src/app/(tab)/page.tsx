"use client";

import React, { useEffect, useState } from "react";
import { Button, Input, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaStar,
  FaUsers,
  FaTrophy,
  FaRocket,
  FaSmile,
  FaChartLine,
  FaCampground
} from "react-icons/fa";

import CampCarousel from "@/components/(card)/CampCarousel";
import CampCard from "@/components/(card)/CampCard";

import { categories } from "@/data/categories";

import HeroSection from '@/components/HeroSection';
import { Camp } from "@/types/camp";


type CampCardData = ReturnType<typeof campToCampData>;

// Helper function to convert Camp to CampData format for CampCard
function campToCampData(camp: Camp) {
  // Calculate days left from deadline
  let daysLeft = 0;
  if (camp.deadline) {
    try {
      // Parse Thai date format or ISO date
      let deadlineDate: Date;
      
      if (camp.registrationDeadline) {
        // Use registrationDeadline if available (ISO format)
        deadlineDate = new Date(camp.registrationDeadline);
      } else {
        // Try to parse Thai format (e.g., "25 ธ.ค. 2567")
        deadlineDate = new Date(camp.deadline);
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      deadlineDate.setHours(0, 0, 0, 0);
      
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysLeft = diffDays > 0 ? diffDays : 0;
    } catch {
      daysLeft = 0;
    }
  }

  return {
    id: camp._id,
    name: camp.name,
    image: camp.image,
    date: camp.date,
    location: camp.location,
    price: camp.price,
    deadline: camp.deadline,
    daysLeft: daysLeft,
    description: camp.description,
    category: camp.category
  };
}

export default function HomePage() {
  const router = useRouter();
  const [urgentCamps, setUrgentCamps] = useState<CampCardData[]>([]);
  const [trendingCamps, setTrendingCamps] = useState<CampCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchCamps() {
      try {
        setLoading(true);
        
        // Fetch all camps
        const response = await fetch('/api/camps');
        if (!response.ok) throw new Error('Failed to fetch camps');
        
        const camps: Camp[] = await response.json();
        
        // Filter out full camps (where enrolled >= capacity)
        const availableCamps = camps.filter(camp => {
          const capacity = camp.capacity || camp.participantCount || 0;
          const enrolled = camp.enrolled || 0;
          return enrolled < capacity;
        });

        // Sort by deadline (closest first) for urgent camps
        const urgent = [...availableCamps]
          .filter(camp => camp.deadline || camp.registrationDeadline) // Only camps with deadline
          .sort((a, b) => {
            const dateA = new Date(a.registrationDeadline || a.deadline).getTime();
            const dateB = new Date(b.registrationDeadline || b.deadline).getTime();
            return dateA - dateB;
          })
          .slice(0, 6)
          .map(campToCampData);

        // For trending, sort by views (highest first)
        const trending = [...availableCamps]
          .sort((a, b) => {
            const viewsA = a.views || 0;
            const viewsB = b.views || 0;
            return viewsB - viewsA;
          })
          .slice(0, 4)
          .map(campToCampData);

        setUrgentCamps(urgent);
        setTrendingCamps(trending);
      } catch (error) {
        console.error('Error fetching camps:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCamps();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to allcamps page with search query
      router.push(`/allcamps?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-2C2C2C dark:bg-zinc-900 overflow-x-hidden">
      {/* Banner Section - กระทัดรัดมากขึ้น */}
      <section className="relative min-h-[480px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-white-50 from-0% via-yellow-500 via-50% to-orange-400 to-100% dark:from-gray-900 dark:via-orange-900/30 dark:to-gray-900">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute inset-0 opacity-10 dark:opacity-20" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop')" }}
        />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/30 backdrop-blur-md border-2 border-white/50 mb-4 hover:scale-105 transition-transform shadow-lg">
            <FaTrophy className="text-white drop-shadow-lg" size={16} />
            <span className="font-bold text-white drop-shadow-lg text-xs">แพลตฟอร์มจัดการค่ายอันดับ 1</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight tracking-tight drop-shadow-2xl">
            ค้นพบค่ายที่ใช่สำหรับคุณ
          </h1>

          <p className="text-base md:text-lg text-white/95 mb-6 leading-relaxed max-w-xl mx-auto font-medium drop-shadow-lg">
            พัฒนาทักษะ ประสบการณ์ และสร้างโอกาสใหม่สำหรับคุณ
          </p>

          <div className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto mb-6">
            <div className="flex-1">
              <Input
                size="md"
                placeholder="ค้นหาค่าย เช่น Python, AI..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                onKeyPress={handleKeyPress}
                classNames={{
                  base: "w-full",
                  inputWrapper: "bg-white h-11 shadow-2xl border-2 border-white hover:border-orange-300 transition-all",
                  input: "text-sm text-gray-700 placeholder:text-gray-400"
                }}
                startContent={<FaSearch className="text-orange-500" size={16} />}
              />
            </div>
            <Button
              size="md"
              onPress={handleSearch}
              className="h-11 px-6 font-bold text-sm shadow-2xl hover:shadow-orange-400/50 hover:scale-105 transition-all bg-white text-orange-600 border-2 border-white hover:bg-orange-50"
              endContent={<FaRocket size={16} />}
            >
              ค้นหา
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-3xl mx-auto">
            {[
              { icon: FaTrophy, value: "150+", label: "ค่ายทั้งหมด" },
              { icon: FaUsers, value: "5K+", label: "ผู้เข้าร่วม" },
              { icon: FaStar, value: "4.8★", label: "คะแนนเฉลี่ย" },
              { icon: FaSmile, value: "95%", label: "ความพึงพอใจ" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/95 dark:bg-black/50 backdrop-blur-md border-2 border-white/50 rounded-lg p-3 hover:bg-white dark:hover:bg-black/70 hover:scale-105 transition-all duration-300 group shadow-xl">
                <stat.icon className="text-orange-500 text-2xl mb-1.5 mx-auto group-hover:scale-110 transition-transform" />
                <p className="text-3xl font-black text-gray-800 dark:text-white">{stat.value}</p>
                <p className="text-gray-600 dark:text-gray-300 font-semibold text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white-50 to-transparent dark:from-zinc-900" />
      </section>

      {/* Loading State */}
      {loading && (
        <section className="max-w-[1536px] mx-auto px-6 py-16">
          <div className="flex flex-col items-center justify-center">
            <Spinner size="lg" color="warning" className="mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-semibold">กำลังโหลดค่าย...</p>
          </div>
        </section>
      )}

      {/* Urgent Registration Section */}
      {!loading && urgentCamps.length > 0 && (
        <section className="max-w-[1536px] mx-auto px-6 py-8">
          <CampCarousel camps={urgentCamps} title="กำลังจะปิดรับเร็วๆนี้!" />
        </section>
      )}

      {/* Hero Section */}
      <section className="py-6">
        <HeroSection />
      </section>

      {/* Trending Section - 2 การ์ดต่อแถว */}
      {!loading && trendingCamps.length > 0 && (
        <section className="bg-gradient-to-br from-zinc-50 to-white dark:from-[#1a1a1a] dark:to-[#0a0a0a] py-8 border-y border-[#F2B33D]/10 dark:border-amber-500/10">
          <div className="max-w-[1536px] mx-auto px-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F2B33D]/10 backdrop-blur-md border border-[#F2B33D]/30 dark:bg-amber-500/10 dark:border-amber-500/20 mb-2 hover:scale-105 transition-transform">
                <FaStar className="text-[#F2B33D] dark:text-amber-400" size={12} />
                <span className="font-bold text-[#2C2C2C] dark:text-white text-xs">ยอดนิยม</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#2C2C2C] dark:text-white mb-1.5">
                ค่ายที่กำลัง<span className="text-[#F2B33D] dark:text-amber-400">มาแรง!</span>
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-xl mx-auto">
                ค่ายยอดนิยมที่ได้รับความสนใจสูงสุดในเดือนนี้
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {trendingCamps.map((camp) => (
                <CampCard key={camp.id} camp={camp} variant="detailed" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && urgentCamps.length === 0 && trendingCamps.length === 0 && (
        <section className="max-w-[1536px] mx-auto px-6 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <FaCampground className="text-white" size={48} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">ยังไม่มีค่ายในขณะนี้</h3>
            <p className="text-gray-600 dark:text-gray-400">กรุณารอสักครู่ หรือลองรีเฟรชหน้าใหม่</p>
          </div>
        </section>
      )}

      {/* Categories Section - กระทัดรัดขึ้น */}
      <section className="max-w-[1536px] mx-auto px-6 py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white mb-2">
            สำรวจตาม<span className="text-orange-600 dark:text-amber-500">หมวดหมู่</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            เลือกหมวดหมู่ที่คุณสนใจและเริ่มต้นการเรียนรู้
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.name}
                variant="flat"
                className="h-24 flex flex-col gap-2 bg-white border-2 border-gray-200 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-200/50 hover:scale-105 transition-all duration-300 group dark:bg-gray-800/50 dark:border-gray-700 dark:hover:border-amber-500 dark:hover:shadow-amber-500/10"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${category.gradient} group-hover:scale-110 transition-transform shadow-lg`}>
                  <IconComponent size={28} className="text-white" />
                </div>
                <span className="font-bold text-sm text-gray-800 group-hover:text-orange-600 transition-colors dark:text-white dark:group-hover:text-amber-400">
                  {category.name}
                </span>
              </Button>
            );
          })}
        </div>
      </section>

      {/* CTA Section - กระทัดรัดมาก */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 dark:from-gray-900 dark:via-orange-900/40 dark:to-gray-900">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>
        <div className="relative max-w-[1536px] mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/30 backdrop-blur-md border-2 border-white/50 mb-3 shadow-lg">
            <FaRocket className="text-white" size={14} />
            <span className="font-bold text-white text-xs">เริ่มต้นวันนี้</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white mb-3 drop-shadow-2xl">
            พร้อมที่จะ<span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]">เริ่มต้น</span>แล้วหรือยัง?
          </h2>
          <p className="text-base text-white/95 mb-6 max-w-xl mx-auto leading-relaxed font-medium drop-shadow-lg">
            สมัครสมาชิกวันนี้ รับข่าวสารค่ายใหม่ <span className="font-bold">โปรโมชั่นพิเศษ</span> และ<span className="font-bold">ส่วนลดสุดคุ้ม</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <Button
              size="md"
              className="h-11 px-8 font-bold text-sm shadow-2xl hover:scale-105 transition-all bg-white text-orange-600 border-2 border-white hover:bg-orange-50"
            >
              สมัครสมาชิกฟรี
            </Button>
            <Button
              size="md"
              variant="bordered"
              className="h-11 px-8 font-bold text-sm border-2 border-white text-white hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              เรียนรู้เพิ่มเติม
            </Button>
          </div>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            {[
              { icon: FaChartLine, label: "การเติบโต", value: "+250%" },
              { icon: FaUsers, label: "สมาชิกใหม่", value: "1,200+" },
              { icon: FaTrophy, label: "รางวัลที่ได้รับ", value: "15+" }
            ].map((stat, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-2 bg-white/95 dark:bg-black/50 backdrop-blur-sm px-4 py-2.5 rounded-lg shadow-xl hover:scale-105 transition-all">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <stat.icon className="text-white" size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-base font-bold text-gray-800 dark:text-white">{stat.value}</p>
                  </div>
                </div>
                {idx < 2 && <div className="w-px h-8 bg-white/30" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
