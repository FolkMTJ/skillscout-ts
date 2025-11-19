"use client";
import React, { useState, useEffect } from "react";
import { Button, Input, Chip, Spinner, Select, SelectItem, Checkbox, CheckboxGroup } from "@heroui/react";
import { FaSearch, FaTrophy, FaClock, FaFire, FaChevronDown, FaFilter, FaTimes, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import CampCard from "@/components/(card)/CampCard";
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
  const [showMore, setShowMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // 🎯 NEW: Filter & Sort States
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

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
  }, [searchQuery, selectedCategory, selectedTags, sortBy, priceRange, allCamps]);

  const urgentCamps = [...filteredCamps]
    .filter(camp => camp.deadline)
    .sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      return dateA - dateB;
    })
    .slice(0, 6)
    .map(campToCampData);

  const trendingCamps = [...filteredCamps]
    .sort((a, b) => {
      const viewsA = a.views || 0;
      const viewsB = b.views || 0;
      return viewsB - viewsA;
    })
    .slice(0, 6)
    .map(campToCampData);

  const sortedAllCamps = filteredCamps.map(campToCampData);
  const displayedCamps = showMore ? sortedAllCamps : sortedAllCamps.slice(0, 9);

  // 🎯 Clear All Filters
  const clearFilters = () => {
    setSelectedCategory("ทั้งหมด");
    setSelectedTags([]);
    setSortBy('newest');
    setPriceRange([0, 10000]);
    setSearchQuery('');
  };

  const hasActiveFilters = 
    selectedCategory !== "ทั้งหมด" || 
    selectedTags.length > 0 || 
    sortBy !== 'newest' || 
    priceRange[0] !== 0 || 
    priceRange[1] !== 10000 ||
    searchQuery !== '';

  return (
    <div className="max-w-[1536px] mx-auto px-6 py-12">
      <section className="mb-12">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
          
          {/* Search Bar & Filter Toggle */}
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

          {/* 🎯 Advanced Filters Panel */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showFilters ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              
              {/* Sort By */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  เรียงตาม
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    size="sm"
                    variant={sortBy === 'newest' ? 'solid' : 'bordered'}
                    color={sortBy === 'newest' ? 'primary' : 'default'}
                    onPress={() => setSortBy('newest')}
                    startContent={<FaSortAmountDown />}
                  >
                    ใหม่สุด
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'deadline-near' ? 'solid' : 'bordered'}
                    color={sortBy === 'deadline-near' ? 'warning' : 'default'}
                    onPress={() => setSortBy('deadline-near')}
                    startContent={<FaClock />}
                  >
                    ใกล้ปิดสุด
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'price-low' ? 'solid' : 'bordered'}
                    color={sortBy === 'price-low' ? 'success' : 'default'}
                    onPress={() => setSortBy('price-low')}
                    startContent={<FaSortAmountUp />}
                  >
                    ราคาน้อย-มาก
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'price-high' ? 'solid' : 'bordered'}
                    color={sortBy === 'price-high' ? 'danger' : 'default'}
                    onPress={() => setSortBy('price-high')}
                    startContent={<FaSortAmountDown />}
                  >
                    ราคามาก-น้อย
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'popular' ? 'solid' : 'bordered'}
                    color={sortBy === 'popular' ? 'secondary' : 'default'}
                    onPress={() => setSortBy('popular')}
                    startContent={<FaFire />}
                  >
                    ยอดนิยม
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'deadline-far' ? 'solid' : 'bordered'}
                    color={sortBy === 'deadline-far' ? 'default' : 'default'}
                    onPress={() => setSortBy('deadline-far')}
                  >
                    ไกลปิดสุด
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'oldest' ? 'solid' : 'bordered'}
                    color={sortBy === 'oldest' ? 'default' : 'default'}
                    onPress={() => setSortBy('oldest')}
                  >
                    เก่าสุด
                  </Button>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  หมวดหมู่
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      variant={selectedCategory === category ? "solid" : "bordered"}
                      color={selectedCategory === category ? "primary" : "default"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* 🎯 Tag Filter (Multiple Selection) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Tags (เลือกได้หลายอัน)
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  {ALL_TAGS.map((tag) => (
                    <Chip
                      key={tag}
                      variant={selectedTags.includes(tag) ? "solid" : "bordered"}
                      color={selectedTags.includes(tag) ? "warning" : "default"}
                      className="cursor-pointer"
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
                {selectedTags.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    เลือกแล้ว: {selectedTags.length} tags
                  </p>
                )}
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  ช่วงราคา: ฿{priceRange[0].toLocaleString()} - ฿{priceRange[1].toLocaleString()}
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>฿0</span>
                  <span>฿10,000+</span>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  color="danger"
                  variant="flat"
                  onPress={clearFilters}
                  startContent={<FaTimes />}
                  className="w-full"
                >
                  ล้างตัวกรองทั้งหมด
                </Button>
              )}

            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              พบ <strong>{filteredCamps.length}</strong> ค่าย
              {hasActiveFilters && ' (มีตัวกรอง)'}
            </p>
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Tags ที่เลือก:</span>
                {selectedTags.slice(0, 3).map(tag => (
                  <Chip key={tag} size="sm" color="warning" variant="flat">
                    {tag}
                  </Chip>
                ))}
                {selectedTags.length > 3 && (
                  <Chip size="sm" color="default">+{selectedTags.length - 3}</Chip>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" color="warning" label="กำลังโหลดค่าย..." />
        </div>
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
      {!loading && urgentCamps.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <FaClock className="text-4xl text-red-500 animate-pulse" />
            <div>
              <h2 className="text-3xl font-black text-gray-800 dark:text-white">
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
      )}

      {/* Trending Camps */}
      {!loading && trendingCamps.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <FaFire className="text-4xl text-orange-500" />
            <div>
              <h2 className="text-3xl font-black text-gray-800 dark:text-white">
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
      )}

      {/* All Camps */}
      {!loading && displayedCamps.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-8">
            <FaTrophy className="text-4xl text-yellow-500" />
            <div>
              <h2 className="text-3xl font-black text-gray-800 dark:text-white">
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

          {/* Show More Button */}
          {sortedAllCamps.length > 9 && (
            <div className="flex justify-center mt-12">
              <Button
                size="lg"
                color="primary"
                variant={showMore ? "bordered" : "solid"}
                onPress={() => setShowMore(!showMore)}
                endContent={<FaChevronDown className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />}
                className="px-8 font-bold"
              >
                {showMore ? 'แสดงน้อยลง' : `แสดงเพิ่มเติม (${sortedAllCamps.length - 9} ค่าย)`}
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
