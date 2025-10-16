"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Chip, Spinner } from "@heroui/react";
import { FaSearch, FaTrophy, FaClock, FaFire, FaChevronDown, FaFilter, FaTimes, FaSearchPlus } from "react-icons/fa";
import CampCard from "@/components/(card)/CampCard";
import PageHeader from "@/components/layout/PageHeader";
import { Camp } from "@/types/camp";
import { useSearchParams } from 'next/navigation';

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

const categories = [
  "ทั้งหมด",
  "Web Development",
  "Mobile Development",
  "Data Science & AI",
  "Cybersecurity",
  "Cloud & DevOps",
  "Game Development",
  "UI/UX Design",
  "Networking"
];

export default function AllCampsPage() {
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';
  
  const [allCamps, setAllCamps] = useState<Camp[]>([]);
  const [filteredCamps, setFilteredCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [showMore, setShowMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch camps from API
  useEffect(() => {
    async function fetchCamps() {
      try {
        setLoading(true);
        const response = await fetch('/api/camps');
        if (!response.ok) throw new Error('Failed to fetch camps');
        
        const camps: Camp[] = await response.json();
        
        // Filter out full camps
        const availableCamps = camps.filter(camp => {
          const capacity = camp.capacity || camp.participantCount || 0;
          const enrolled = camp.enrolled || 0;
          return enrolled < capacity;
        });
        
        setAllCamps(availableCamps);
        setFilteredCamps(availableCamps);
      } catch (error) {
        console.error('Error fetching camps:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCamps();
  }, []);

  // Filter and search camps
  useEffect(() => {
    let result = [...allCamps];

    // Filter by category
    if (selectedCategory !== "ทั้งหมด") {
      result = result.filter(camp => camp.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(camp => 
        camp.name.toLowerCase().includes(query) ||
        camp.description.toLowerCase().includes(query) ||
        camp.category.toLowerCase().includes(query) ||
        camp.location.toLowerCase().includes(query)
      );
    }

    setFilteredCamps(result);
  }, [searchQuery, selectedCategory, allCamps]);

  // Get camps sorted by deadline (closest first)
  const urgentCamps = [...filteredCamps]
    .filter(camp => camp.deadline)
    .sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      return dateA - dateB;
    })
    .slice(0, 6)
    .map(campToCampData);

  // Get trending camps (sorted by views - highest first)
  const trendingCamps = [...filteredCamps]
    .sort((a, b) => {
      const viewsA = a.views || 0;
      const viewsB = b.views || 0;
      return viewsB - viewsA;
    })
    .slice(0, 6)
    .map(campToCampData);

  // Get all camps sorted by created date (newest first)
  const sortedAllCamps = [...filteredCamps]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .map(campToCampData);

  const displayedCamps = showMore ? sortedAllCamps : sortedAllCamps.slice(0, 9);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <PageHeader
        title="All Camps"
        subtitle="Explore various IT camps and find the one that suits you."
        category="EXPLORE"
      />
      
      <div className="max-w-[1536px] mx-auto px-6 py-12">
        {/* Modern Search & Filter Section */}
        <section className="mb-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            {/* Search Bar with Filter Toggle */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  size="lg"
                  placeholder="ค้นหาค่ายที่คุณสนใจ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  classNames={{
                    base: "w-full",
                    inputWrapper: "bg-white dark:bg-gray-900 border-2 border-gray-300/50 dark:border-gray-600/50 hover:border-orange-400 focus-within:border-orange-500 transition-all h-14 rounded-2xl shadow-lg",
                    input: "text-base"
                  }}
                  startContent={
                    <div className="flex items-center gap-2">
                      <FaSearch className="text-orange-500" size={20} />
                    </div>
                  }
                  endContent={
                    searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <FaTimes size={18} />
                      </button>
                    )
                  }
                />
              </div>
              
              <Button
                size="lg"
                onPress={() => setShowFilters(!showFilters)}
                className={`h-14 px-6 rounded-2xl font-bold transition-all shadow-lg ${
                  showFilters 
                    ? 'bg-orange-500 text-white hover:bg-orange-600' 
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-orange-400'
                }`}
                startContent={<FaFilter size={18} />}
              >
                {showFilters ? 'ซ่อนตัวกรอง' : 'ตัวกรอง'}
              </Button>
            </div>

            {/* Category Filter Pills */}
            <div className={`transition-all duration-300 ease-in-out ${showFilters ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">หมวดหมู่</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      className={`cursor-pointer px-4 py-2 text-sm font-semibold transition-all ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedCategory !== "ทั้งหมด" || searchQuery) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600 dark:text-gray-400">ตัวกรองที่ใช้:</span>
                  {selectedCategory !== "ทั้งหมด" && (
                    <Chip
                      onClose={() => setSelectedCategory("ทั้งหมด")}
                      className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                    >
                      {selectedCategory}
                    </Chip>
                  )}
                  {searchQuery && (
                    <Chip
                      onClose={() => setSearchQuery("")}
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    >
                      ค้นหา: {searchQuery}
                    </Chip>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Spinner size="lg" color="warning" className="mb-4" />
            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">กำลังโหลดค่าย...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">กรุณารอสักครู่</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredCamps.length === 0 && (
          <div className="text-center py-20">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                <FaSearchPlus className="text-white" size={48} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">ไม่พบค่ายที่ค้นหา</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนตัวกรอง</p>
            <Button
              onPress={() => {
                setSearchQuery("");
                setSelectedCategory("ทั้งหมด");
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold"
            >
              รีเซ็ตตัวกรอง
            </Button>
          </div>
        )}

        {/* กำลังจะปิดรับเร็วๆนี้ */}
        {!loading && urgentCamps.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/10 border-2 border-red-500/30 backdrop-blur-sm shadow-lg">
                <FaClock className="text-red-500 animate-pulse" size={20} />
                <span className="font-bold text-red-600 dark:text-red-400">กำลังจะปิดรับเร็วๆนี้</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
              <span className="text-sm text-gray-500 dark:text-gray-400">{urgentCamps.length} ค่าย</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {urgentCamps.map((camp) => (
                <div key={camp.id}>
                  <CampCard camp={camp} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ค่ายมาแรง */}
        {!loading && trendingCamps.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500/10 border-2 border-orange-500/30 backdrop-blur-sm shadow-lg">
                <FaFire className="text-orange-500" size={20} />
                <span className="font-bold text-orange-600 dark:text-orange-400">ค่ายมาแรง</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-orange-500/30 to-transparent" />
              <span className="text-sm text-gray-500 dark:text-gray-400">{trendingCamps.length} ค่าย</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingCamps.map((camp) => (
                <div key={camp.id}>
                  <CampCard camp={camp} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ค่ายทั้งหมด */}
        {!loading && sortedAllCamps.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-500/10 border-2 border-gray-500/30 backdrop-blur-sm shadow-lg">
                <FaTrophy className="text-gray-600 dark:text-gray-400" size={20} />
                <span className="font-bold text-gray-700 dark:text-gray-300">ค่ายทั้งหมด</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-500/30 to-transparent" />
              <span className="text-sm text-gray-500 dark:text-gray-400">{sortedAllCamps.length} ค่าย</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayedCamps.map((camp) => (
                <div key={camp.id}>
                  <CampCard camp={camp} />
                </div>
              ))}
            </div>

            {/* ปุ่มดูเพิ่มเติม */}
            {!showMore && sortedAllCamps.length > 9 && (
              <div className="text-center">
                <Button
                  size="lg"
                  className="px-12 py-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all rounded-2xl"
                  endContent={<FaChevronDown size={20} />}
                  onPress={() => setShowMore(true)}
                >
                  ดูเพิ่มเติม ({sortedAllCamps.length - 9} ค่าย)
                </Button>
              </div>
            )}

            {/* ปุ่มแสดงน้อยลง */}
            {showMore && sortedAllCamps.length > 9 && (
              <div className="text-center">
                <Button
                  size="lg"
                  variant="bordered"
                  className="px-12 py-6 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold text-lg hover:border-orange-500 hover:text-orange-500 transition-all rounded-2xl"
                  onPress={() => {
                    setShowMore(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  แสดงน้อยลง
                </Button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
