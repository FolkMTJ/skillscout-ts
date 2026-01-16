"use client";
import React, { useState, useEffect } from "react";
import { Button, Input, Chip } from "@heroui/react";
import { FaSearch, FaTrophy, FaFilter, FaTimes } from "react-icons/fa";
import CampCard from "@/components/(card)/CampCard";
import Pagination from "@/components/Pagination";
import { Camp } from "@/types/camp";
import { useSearchParams } from 'next/navigation';

// Helper function to convert Camp to CampData format for CampCard
function campToCampData(camp: Camp) {
  let daysLeft = 0;
  if (camp.deadline) {
    try {
      let deadlineDate: Date;
      if (camp.registrationDeadline) {
        deadlineDate = new Date(camp.registrationDeadline);
      } else {
        deadlineDate = new Date(camp.deadline);
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
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

// 🎯 ระบบ Tags ทั้งหมด
const ALL_TAGS = [
  "Python", "JavaScript", "React", "Node.js", "TypeScript",
  "Java", "C++", "Machine Learning", "Deep Learning", "AI",
  "Blockchain", "Cloud Computing", "AWS", "Azure", "Docker",
  "Kubernetes", "Cybersecurity", "Ethical Hacking", "Penetration Testing",
  "UI/UX", "Figma", "Adobe XD", "Mobile App", "iOS", "Android",
  "Flutter", "React Native", "Game Design", "Unity", "Unreal Engine",
  "Data Science", "Big Data", "SQL", "NoSQL", "MongoDB"
];

type SortOption = 
  | 'newest' 
  | 'oldest' 
  | 'deadline-near' 
  | 'deadline-far' 
  | 'price-high' 
  | 'price-low'
  | 'popular';

export default function AllCampsContent() {
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';
  const [allCamps, setAllCamps] = useState<Camp[]>([]);
  const [filteredCamps, setFilteredCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  // const [showMore, setShowMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // 🎯 NEW: Filter & Sort States
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // 🔧 Helper function to check if camp is expired
  function isCampExpired(camp: Camp): boolean {
    if (!camp.registrationDeadline && !camp.deadline) {
      return false;
    }

    try {
      const deadlineDate = camp.registrationDeadline 
        ? new Date(camp.registrationDeadline) 
        : new Date(camp.deadline);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadlineDate.setHours(0, 0, 0, 0);
      
      return deadlineDate < today;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    async function fetchCamps() {
      try {
        setLoading(true);
        const response = await fetch('/api/camps');
        if (!response.ok) throw new Error('Failed to fetch camps');
        const camps: Camp[] = await response.json();
        
        // 🔧 FIX: กรองค่ายที่หมดเขตและเต็มแล้วออก
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const availableCamps = camps.filter(camp => {
          // เช็คว่าเต็มหรือยัง
          const capacity = camp.capacity || camp.participantCount || 0;
          const enrolled = camp.enrolled || 0;
          if (enrolled >= capacity) {
            return false;
          }

          // 🔧 เช็คว่าหมดเขตรับสมัครหรือยัง
          if (isCampExpired(camp)) {
            return false;
          }

          return true;
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

  // 🎯 NEW: Advanced Filtering & Sorting
  useEffect(() => {
    let result = [...allCamps];

    // Filter by Category
    if (selectedCategory !== "ทั้งหมด") {
      result = result.filter(camp => camp.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(camp => 
        camp.name.toLowerCase().includes(query) ||
        camp.description.toLowerCase().includes(query) ||
        camp.category.toLowerCase().includes(query) ||
        camp.location.toLowerCase().includes(query)
      );
    }

    // 🎯 Filter by Tags (เลือกได้หลายอัน)
    if (selectedTags.length > 0) {
      result = result.filter(camp => {
        const campTags = camp.tags || [];
        // ค่ายต้องมี tag ที่เลือกอย่างน้อย 1 อัน
        return selectedTags.some(tag => campTags.includes(tag));
      });
    }

    // 🎯 Filter by Price Range
    result = result.filter(camp => {
      const price = camp.fee || parseFloat((camp.price || '0').replace(/[^0-9]/g, '')) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // 🎯 Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - 
                 (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        
        case 'oldest':
          return (a.createdAt ? new Date(a.createdAt).getTime() : 0) - 
                 (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        
        case 'deadline-near':
          const deadlineA = a.registrationDeadline ? new Date(a.registrationDeadline).getTime() : Infinity;
          const deadlineB = b.registrationDeadline ? new Date(b.registrationDeadline).getTime() : Infinity;
          return deadlineA - deadlineB;
        
        case 'deadline-far':
          const deadlineA2 = a.registrationDeadline ? new Date(a.registrationDeadline).getTime() : 0;
          const deadlineB2 = b.registrationDeadline ? new Date(b.registrationDeadline).getTime() : 0;
          return deadlineB2 - deadlineA2;
        
        case 'price-high':
          const priceA = a.fee || parseFloat((a.price || '0').replace(/[^0-9]/g, '')) || 0;
          const priceB = b.fee || parseFloat((b.price || '0').replace(/[^0-9]/g, '')) || 0;
          return priceB - priceA;
        
        case 'price-low':
          const priceA2 = a.fee || parseFloat((a.price || '0').replace(/[^0-9]/g, '')) || 0;
          const priceB2 = b.fee || parseFloat((b.price || '0').replace(/[^0-9]/g, '')) || 0;
          return priceA2 - priceB2;
        
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        
        default:
          return 0;
      }
    });

    setFilteredCamps(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedCategory, selectedTags, sortBy, priceRange, allCamps]);

  // const urgentCamps = [...filteredCamps]
  //   .filter(camp => camp.deadline)
  //   .sort((a, b) => {
  //     const dateA = new Date(a.deadline).getTime();
  //     const dateB = new Date(b.deadline).getTime();
  //     return dateA - dateB;
  //   })
  //   .slice(0, 6)
  //   .map(campToCampData);

  // const trendingCamps = [...filteredCamps]
  //   .sort((a, b) => {
  //     const viewsA = a.views || 0;
  //     const viewsB = b.views || 0;
  //     return viewsB - viewsA;
  //   })
  //   .slice(0, 6)
  //   .map(campToCampData);

  const sortedAllCamps = filteredCamps.map(campToCampData);
  
  // Pagination Logic
  const totalPages = Math.ceil(sortedAllCamps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedCamps = sortedAllCamps.slice(startIndex, endIndex);

  // 🎯 Clear All Filters
  const clearFilters = () => {
    setSelectedCategory("ทั้งหมด");
    setSelectedTags([]);
    setSortBy('newest');
    setPriceRange([0, 10000]);
    setSearchQuery('');
    setCurrentPage(1); // Reset page when clearing filters
  };

  const hasActiveFilters = 
    selectedCategory !== "ทั้งหมด" || 
    selectedTags.length > 0 || 
    sortBy !== 'newest' || 
    priceRange[0] !== 0 || 
    priceRange[1] !== 10000 ||
    searchQuery !== '';

  return (
    <div className="max-w-[1536px] mx-auto px-6 py-12 mb-30">
      <section className="mb-12">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
          
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1">
              <Input
                size="md"
                placeholder="ค้นหาค่ายที่คุณสนใจ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                classNames={{
                  base: "w-full",
                  inputWrapper: "bg-white dark:bg-gray-900 border border-gray-300/50 dark:border-gray-600/50 hover:border-[#F2B33D] focus-within:border-[#F2B33D] transition-all h-10 rounded-xl",
                  input: "text-sm"
                }}
                startContent={<FaSearch className="text-[#F97316]" size={16} />}
                endContent={
                  searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes size={14} />
                    </button>
                  )
                }
              />
            </div>
            <Button
              size="md"
              onPress={() => setShowFilters(!showFilters)}
              className={`h-10 px-5 rounded-xl font-bold transition-all ${
                showFilters 
                  ? 'bg-[#F97316] text-white hover:bg-[#F97316]/90' 
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-[#F2B33D]'
              }`}
              startContent={<FaFilter size={14} />}
            >
              {showFilters ? 'ซ่อน' : 'ตัวกรอง'}
            </Button>
          </div>

          {/* 🎯 Compact Filters - Horizontal Layout */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showFilters ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              
              {/* Row 1: เรียงตาม + ราคา */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Sort */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    เรียงตาม
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-[#F2B33D] focus:border-[#F2B33D] focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="newest">ใอม่สุด</option>
                    <option value="deadline-near">ใกล้ปิดสุด</option>
                    <option value="popular">ยอดนิยม</option>
                    <option value="price-low">ราคาน้อย-มาก</option>
                    <option value="price-high">ราคามาก-น้อย</option>
                    <option value="deadline-far">ไกลปิดสุด</option>
                    <option value="oldest">เก่าสุด</option>
                  </select>
                </div>

                {/* Price Range - Compact */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    ราคา: ฿{priceRange[0].toLocaleString()} - {priceRange[1] >= 10000 ? '฿10k+' : `฿${priceRange[1].toLocaleString()}`}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">฿0</span>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-[#F2B33D]"
                    />
                    <span className="text-xs text-gray-400">฿10k+</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">฿0</span>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-[#F97316]"
                    />
                    <span className="text-xs text-gray-400">฿10k+</span>
                  </div>
                </div>
              </div>

              {/* Row 2: หมวดหมู่ */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  หมวดหมู่
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      size="sm"
                      variant={selectedCategory === category ? "solid" : "bordered"}
                      className={`cursor-pointer transition-all text-xs h-6 ${
                        selectedCategory === category 
                          ? 'bg-[#F2B33D] text-[#2C2C2C] font-bold border-[#F2B33D]' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-[#F2B33D]'
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Row 3: Tags - Collapsible */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                  </label>
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      ล้างทั้งหมด
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-gray-50/50 dark:bg-gray-900/30 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                  {ALL_TAGS.map((tag) => (
                    <Chip
                      key={tag}
                      size="sm"
                      variant={selectedTags.includes(tag) ? "solid" : "bordered"}
                      className={`cursor-pointer transition-all text-xs h-5 ${
                        selectedTags.includes(tag)
                          ? 'bg-[#F97316] text-white font-semibold border-[#F97316]'
                          : 'border-gray-300 dark:border-gray-600 hover:border-[#F97316]'
                      }`}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                    >
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Clear All */}
              {hasActiveFilters && (
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={clearFilters}
                  startContent={<FaTimes size={12} />}
                  className="w-full font-semibold h-7 text-xs"
                >
                  ล้างตัวกรองทั้งหมด
                </Button>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Results Count - อยู่ข้างนอก */}
      <div className="mb-6 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          พบ <strong className="text-gray-700 dark:text-gray-300">{filteredCamps.length}</strong> ค่าย
          {hasActiveFilters && ' (มีตัวกรอง)'}
        </span>
        {selectedTags.length > 0 && (
          <div className="flex items-center gap-1">
            {selectedTags.slice(0, 2).map(tag => (
              <Chip key={tag} size="sm" className="bg-[#F97316]/10 text-[#F97316] h-5 text-xs">
                {tag}
              </Chip>
            ))}
            {selectedTags.length > 2 && (
              <Chip size="sm" className="bg-gray-200 dark:bg-gray-700 h-5 text-xs">+{selectedTags.length - 2}</Chip>
            )}
          </div>
        )}
      </div>

      {/* Loading State - Skeleton */}
      {loading && (
        <section>
          <div className="flex items-center gap-3 mb-8">
            <FaTrophy className="text-3xl text-yellow-500" />
            <div>
              <h2 className="text-2xl font-black text-gray-800 dark:text-white">
                ค่ายทั้งหมด
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                สำรวจค่ายที่น่าสนใจทั้งหมด
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-28"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* No Results */}
      {!loading && filteredCamps.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            ไม่พบค่ายที่ตรงกับเงื่อนไข
          </p>
          <Button color="primary" onPress={clearFilters}>
            ล้างตัวกรอง
          </Button>
        </div>
      )}

      {/* Urgent Camps */}
      {/* {!loading && urgentCamps.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <FaClock className="text-3xl text-red-500 animate-pulse" />
            <div>
              <h2 className="text-2xl font-black text-gray-800 dark:text-white">
                ใกล้ปิดรับสมัคร!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                รีบสมัครก่อนหมดเขต
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {urgentCamps.map((camp) => (
              <CampCard key={camp.id} camp={camp} />
            ))}
          </div>
        </section>
      )} */}

      {/* Trending Camps */}
      {/* {!loading && trendingCamps.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <FaFire className="text-3xl text-orange-500" />
            <div>
              <h2 className="text-2xl font-black text-gray-800 dark:text-white">
                ค่ายยอดนิยม
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                ค่ายที่ได้รับความสนใจมากที่สุด
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingCamps.map((camp) => (
              <CampCard key={camp.id} camp={camp} />
            ))}
          </div>
        </section>
      )} */}

      {/* All Camps */}
      {!loading && displayedCamps.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-8">
            <FaTrophy className="text-3xl text-yellow-500" />
            <div>
              <h2 className="text-2xl font-black text-gray-800 dark:text-white">
                ค่ายทั้งหมด
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                สำรวจค่ายที่น่าสนใจทั้งหมด
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedCamps.map((camp) => (
              <CampCard key={camp.id} camp={camp} />
            ))}
          </div>

          {/* Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </section>
      )}
    </div>
  );
}
