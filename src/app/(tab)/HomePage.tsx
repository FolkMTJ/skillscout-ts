"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaStar,
  FaUsers,
  FaTrophy,
  FaRocket,
  FaSmile,
  FaCampground,
  FaQuoteLeft,
  FaBuilding,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

import CampCarousel from "@/components/(card)/camp/CampCarousel";
import CampCard from "@/components/(card)/CampCard";

import { categories } from "@/data/categories";

import HeroSection from '@/components/HeroSection';
import HeroBanner from '@/components/HeroBanner';
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
    category: camp.category,
    avgRating: camp.avgRating,
    reviews: camp.reviews,
    capacity: camp.capacity || camp.participantCount,
    enrolled: camp.enrolled || 0
  };
}

export default function HomePage() {
  const router = useRouter();
  const [urgentCamps, setUrgentCamps] = useState<CampCardData[]>([]);
  const [trendingCamps, setTrendingCamps] = useState<CampCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);

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
          .slice(0, 6)
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
      {/* Hero Banner - SKILL SCOUT */}
      <HeroBanner title={"SKILL"} subtitle={"แพลตฟอร์มค้นหาค่ายพัฒนาทักษะที่ดีที่สุด"} />

      {/* Urgent Registration Section */}
      <section className="max-w-[1536px] mx-auto px-6 py-8">
        {loading ? (
          // Skeleton for Carousel
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : urgentCamps.length > 0 ? (
          <CampCarousel camps={urgentCamps} title="กำลังจะปิดรับเร็วๆนี้!" />
        ) : null}
      </section>

      {/* Hero Section */}
      <section className="py-6">
        <HeroSection />
      </section>

      {/* Trending Section - 2 การ์ดต่อแถว */}
      <section className="bg-white dark:from-[#1a1a1a] dark:to-[#0a0a0a] py-15 border-y border-[#F2B33D]/10 dark:border-amber-500/10">
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

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : trendingCamps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {trendingCamps.slice(0, 6).map((camp) => (
                <CampCard key={camp.id} camp={camp} variant="detailed" />
              ))}
            </div>
          ) : null}
        </div>
      </section>

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

      {/* Discover Section — search (left) + categories (right) */}
      <section className="bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-[1536px] mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-stretch">

            {/* LEFT — heading + search + popular tags */}
            <div className="lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-black text-[#2C2C2C] dark:text-white mb-3 leading-tight">
                ค้นหาและ
                <span className="text-[#F2B33D] dark:text-amber-400">สำรวจ</span>ค่าย
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                พิมพ์ชื่อค่าย เทคโนโลยี หรือทักษะที่อยากเรียน
                แล้วเราจะหาค่ายที่ใช่ให้คุณ
              </p>

              {/* search bar */}
              <div className="flex gap-2 mb-5">
                <div className="flex-1 flex items-center gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 h-12 focus-within:border-[#F2B33D] focus-within:bg-white dark:focus-within:bg-gray-700 transition-all shadow-sm">
                  <FaSearch className="text-gray-400 flex-shrink-0" size={14} />
                  <input
                    className="flex-1 bg-transparent text-sm outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
                    placeholder="เช่น Python, AI, Design..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="h-12 px-5 bg-[#F2B33D] hover:bg-[#e6a82e] text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-sm whitespace-nowrap"
                >
                  ค้นหา <FaRocket size={12} />
                </button>
              </div>

              {/* popular search chips */}
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2.5 font-medium">ยอดนิยม:</p>
                <div className="flex flex-wrap gap-2">
                  {["Python", "React", "AI / ML", "Flutter", "UI/UX"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => { setSearchQuery(tag); router.push(`/allcamps?search=${encodeURIComponent(tag)}`); }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#F2B33D] hover:text-[#F2B33D] transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* vertical divider (desktop only) */}
            <div className="hidden lg:block w-px self-stretch bg-gray-100 dark:bg-gray-800" />

            {/* RIGHT — categories */}
            <div className="flex-1 flex flex-col justify-center">
              {/* <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                เลือกตามหมวดหมู่
              </p> */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((category, idx) => {
                  const IconComponent = category.icon;
                  const isHovered = hoveredCat === idx;
                  return (
                    <button
                      key={category.name}
                      onClick={() => router.push(category.tagCategory ? `/allcamps?group=${category.tagCategory}` : '/allcamps')}
                      onMouseEnter={() => setHoveredCat(idx)}
                      onMouseLeave={() => setHoveredCat(null)}
                      className="relative h-28 flex flex-col items-center justify-center gap-2.5 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden"
                      style={{
                        background: isHovered ? `${category.color}10` : '#ffffff',
                        borderColor: isHovered ? `${category.color}35` : '#F3F4F6',
                        transform: isHovered ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
                        boxShadow: isHovered ? `0 8px 24px ${category.color}20` : 'none',
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200"
                        style={{
                          background: isHovered ? `${category.color}20` : '#F3F4F6',
                          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                        }}
                      >
                        <IconComponent
                          size={24}
                          style={{ color: isHovered ? category.color : '#9CA3AF' }}
                        />
                      </div>
                      <span
                        className="font-bold text-sm transition-colors duration-200"
                        style={{ color: isHovered ? category.color : '#6B7280' }}
                      >
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-100 dark:border-gray-800 py-14">
        <div className="max-w-[1536px] mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F2B33D]/10 border border-[#F2B33D]/30 mb-3">
              <FaStar className="text-[#F2B33D]" size={11} />
              <span className="font-bold text-[#2C2C2C] dark:text-white text-xs">รีวิวจากผู้เข้าร่วม</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#2C2C2C] dark:text-white">
              เสียงจาก<span className="text-[#F2B33D]">ผู้เข้าร่วมจริง</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "ปาล์ม ธนพล",
                role: "นักศึกษา ม.4",
                avatar: "ป",
                camp: "Tech Booster for Teens",
                rating: 5,
                text: "ได้เรียน Python จริงๆ ไม่ใช่แค่ทฤษฎี อาจารย์สอนสนุกมาก ได้เพื่อนใหม่ที่ชอบ coding เหมือนกัน แนะนำเลยครับ",
                color: "#3B82F6",
              },
              {
                name: "มิ้น พิชญา",
                role: "นักศึกษา ม.6",
                avatar: "ม",
                camp: "UX Design Camp",
                rating: 5,
                text: "ก่อนมาค่ายไม่รู้จัก Figma เลยสักนิด หลังจบได้ทำ prototype ได้จริง พี่ๆ mentors ใจดีมาก คุ้มมากค่ะ",
                color: "#EC4899",
              },
              {
                name: "โฟร์ท วรพล",
                role: "นักศึกษาปี 1",
                avatar: "ฟ",
                camp: "AI & Machine Learning Camp",
                rating: 5,
                text: "ผมหา camp นี้เจอผ่าน SkillScout เลย ระบบค้นหาดีมาก กรองตามทักษะได้ สมัครง่าย และค่าย AI ก็เกินคาดครับ",
                color: "#8B5CF6",
              },
            ].map((review, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                {/* quote icon */}
                <FaQuoteLeft size={20} style={{ color: review.color }} className="opacity-60" />

                {/* text */}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                  "{review.text}"
                </p>

                {/* stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <FaStar key={i} className="text-[#F2B33D]" size={13} />
                  ))}
                </div>

                {/* divider */}
                <div className="h-px bg-gray-100 dark:bg-gray-700" />

                {/* author */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base flex-shrink-0"
                    style={{ background: review.color }}
                  >
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#2C2C2C] dark:text-white">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.role} · {review.camp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section - กระทัดรัดมาก */}
      {/* <section className="relative overflow-hidden">
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
      </section> */}
    </div>
  );
}
