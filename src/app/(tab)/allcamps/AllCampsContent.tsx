"use client";
import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import CampCard from "@/components/(card)/CampCard";
import Pagination from "@/components/Pagination";
import { Camp } from "@/types/camp";
import { useSearchParams } from 'next/navigation';
import { STANDARD_TAGS, TAG_CATEGORIES } from "@/data/tags";
type TagCategoryKey = keyof typeof TAG_CATEGORIES;
type TagGroupId = TagCategoryKey | "all";

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

// ─── Tag category config ───────────────────────────────────
const TAG_CATEGORY_LABELS: Record<TagCategoryKey, { label: string; icon: string }> = {
  frontend:  { label: 'Frontend',   icon: '' },
  backend:   { label: 'Backend',    icon: '' },
  data:      { label: 'Data & AI',  icon: '' },
  design:    { label: 'Design',     icon: '' },
  mobile:    { label: 'Mobile',     icon: '' },
  devops:    { label: 'DevOps',     icon: '' },
  other:     { label: 'อื่นๆ',       icon: '' },
};
const ALL_CATEGORY_KEYS = Object.keys(TAG_CATEGORY_LABELS) as TagCategoryKey[];

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
  const groupFromUrl = searchParams.get('group') || '';
  const validGroups = ['frontend', 'backend', 'data', 'design', 'mobile', 'devops', 'other'];
  const initialGroup: TagGroupId = validGroups.includes(groupFromUrl) ? (groupFromUrl as TagCategoryKey) : "all";
  const [allCamps, setAllCamps] = useState<Camp[]>([]);
  const [filteredCamps, setFilteredCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedGroup, setSelectedGroup] = useState<TagGroupId>(initialGroup);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter & Sort States
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('deadline-near');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  function isCampExpired(camp: Camp): boolean {
    if (!camp.registrationDeadline && !camp.deadline) return false;
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
        const res = await fetch('/api/camps');
        const data = await res.json();
        const camps: Camp[] = Array.isArray(data) ? data : data.camps || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const availableCamps = camps.filter(camp => {
          const capacity = camp.capacity || camp.participantCount || 0;
          const enrolled = camp.enrolled || 0;
          if (enrolled >= capacity) return false;
          if (isCampExpired(camp)) return false;
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

  // Advanced Filtering & Sorting
  useEffect(() => {
    let result = [...allCamps];

    // Filter by Tag Category (group)
    if (selectedGroup !== "all") {
      const tagsInCategory = STANDARD_TAGS
        .filter(t => t.category === selectedGroup)
        .map(t => t.id);
      result = result.filter(camp => {
        const campTags = camp.tags || [];
        return campTags.some(tag => tagsInCategory.includes(tag));
      });
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

    // Filter by selected Tags
    if (selectedTags.length > 0) {
      result = result.filter(camp => {
        const campTags = camp.tags || [];
        return selectedTags.some(tag => campTags.includes(tag));
      });
    }

    // Filter by Price Range
    result = result.filter(camp => {
      const price = camp.fee || parseFloat((camp.price || '0').replace(/[^0-9]/g, '')) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - 
                 (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        case 'oldest':
          return (a.createdAt ? new Date(a.createdAt).getTime() : 0) - 
                 (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        case 'deadline-near': {
          const getDeadline = (camp: Camp) => {
            const d = camp.registrationDeadline || camp.deadline;
            return d ? new Date(d).getTime() : Infinity;
          };
          return getDeadline(a) - getDeadline(b);
        }
        case 'deadline-far': {
          const getDeadline = (camp: Camp) => {
            const d = camp.registrationDeadline || camp.deadline;
            return d ? new Date(d).getTime() : 0;
          };
          return getDeadline(b) - getDeadline(a);
        }
        case 'price-low': {
          const getPrice = (camp: Camp) => camp.fee || parseFloat((camp.price || '0').replace(/[^0-9]/g, '')) || 0;
          return getPrice(a) - getPrice(b);
        }
        case 'price-high': {
          const getPrice = (camp: Camp) => camp.fee || parseFloat((camp.price || '0').replace(/[^0-9]/g, '')) || 0;
          return getPrice(b) - getPrice(a);
        }
        case 'popular':
          return (b.enrolled || 0) - (a.enrolled || 0);
        default:
          return 0;
      }
    });

    setFilteredCamps(result);
    setCurrentPage(1);
  }, [searchQuery, selectedGroup, selectedTags, sortBy, priceRange, allCamps]);

  const clearFilters = () => {
    setSelectedGroup("all");
    setSelectedTags([]);
    setSortBy('deadline-near');
    setPriceRange([0, 10000]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedGroup !== "all" ||
    selectedTags.length > 0 ||
    sortBy !== 'deadline-near' ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 10000 ||
    searchQuery !== '';

  // Pagination
  const totalPages = Math.ceil(filteredCamps.length / itemsPerPage);
  const displayedCamps = filteredCamps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ).map(campToCampData);

  // ── Tags shown in expanded panel: filtered by selectedGroup
  const visibleTags = selectedGroup === "all"
    ? STANDARD_TAGS
    : STANDARD_TAGS.filter(t => t.category === selectedGroup);

  return (
    <div className="max-w-[1536px] mx-auto px-3 md:px-6 py-6 md:py-12 mb-30">
      <section className="mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">

          {/* ─── Row 1: Search + Sort + Filter toggle ─── */}
          <div className="flex items-center gap-2 p-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 h-10 focus-within:border-[#F2B33D] transition-all">
              <FaSearch className="text-gray-400 flex-shrink-0" size={13} />
              <input
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
                placeholder="ค้นหาค่าย..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={12} />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 px-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 focus:border-[#F2B33D] focus:outline-none cursor-pointer"
            >
              <option value="newest">ใหม่สุด</option>
              <option value="deadline-near">ใกล้ปิด</option>
              <option value="popular">ยอดนิยม</option>
              <option value="price-low">ราคา ↑</option>
              <option value="price-high">ราคา ↓</option>
              <option value="oldest">เก่าสุด</option>
            </select>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all relative ${
                showFilters || hasActiveFilters
                  ? 'bg-[#F2B33D] text-white shadow-md'
                  : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500'
              }`}
            >
              <FaFilter size={13} />
              {hasActiveFilters && !showFilters && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F97316] rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                  {(selectedGroup !== 'all' ? 1 : 0) + selectedTags.length + (priceRange[0] !== 0 || priceRange[1] !== 10000 ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* ─── Row 2: Tag Category pills (always visible) ─── */}
          <div className="px-3 pb-3">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
              {/* ทั้งหมด */}
              <button
                onClick={() => { setSelectedGroup("all"); setSelectedTags([]); }}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                  selectedGroup === "all"
                    ? 'bg-[#F2B33D] border-[#F2B33D] text-[#1a1a1a]'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                ทั้งหมด
              </button>
              {/* หมวดหมู่จาก STANDARD_TAGS */}
              {ALL_CATEGORY_KEYS.map((key) => {
                const { label } = TAG_CATEGORY_LABELS[key];
                const tagCount = STANDARD_TAGS.filter(t => t.category === key).length;
                return (
                  <button
                    key={key}
                    onClick={() => { setSelectedGroup(key); setSelectedTags([]); }}
                    className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                      selectedGroup === key
                        ? 'bg-[#F2B33D] border-[#F2B33D] text-[#1a1a1a]'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`text-[10px] ${selectedGroup === key ? 'text-[#1a1a1a]/60' : 'text-gray-400'}`}>
                      {tagCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Row 3: Tags ของหมวดที่เลือก (always visible when group selected) ─── */}
          {selectedGroup !== "all" && (
            <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-800 pt-2">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
                {visibleTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      if (selectedTags.includes(tag.id)) setSelectedTags(selectedTags.filter(t => t !== tag.id));
                      else setSelectedTags([...selectedTags, tag.id]);
                    }}
                    className={`flex-shrink-0 text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'bg-[#F97316] border-[#F97316] text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-[#F97316]'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Expanded filters (price + clear) ─── */}
          <div className={`transition-all duration-200 ease-in-out overflow-hidden ${
            showFilters ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="px-3 pb-3 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-3">

              {/* Price range */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">ราคา</span>
                  <span className="text-xs font-bold text-[#F2B33D]">
                    ฿{priceRange[0].toLocaleString()} – {priceRange[1] >= 10000 ? '฿10k+' : `฿${priceRange[1].toLocaleString()}`}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <input
                    type="range" min="0" max="10000" step="500"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full h-1.5 rounded-full accent-[#F2B33D] cursor-pointer"
                  />
                  <input
                    type="range" min="0" max="10000" step="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-1.5 rounded-full accent-[#F97316] cursor-pointer"
                  />
                </div>
              </div>

              {/* Clear all */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full h-8 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-semibold border border-red-100 dark:border-red-800 hover:bg-red-100 transition-all"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          พบ <strong className="text-gray-700 dark:text-gray-300">{filteredCamps.length}</strong> ค่าย
          {hasActiveFilters && ' (มีตัวกรอง)'}
        </span>
        {selectedTags.length > 0 && (
          <button onClick={() => setSelectedTags([])} className="text-red-400 hover:text-red-600 font-semibold">
            ล้าง tags ({selectedTags.length})
          </button>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <section>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 animate-pulse">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="aspect-video bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Camps */}
      {!loading && displayedCamps.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4 md:mb-8">
  
            <div>
              <h2 className="text-lg md:text-2xl font-black text-gray-800 dark:text-white">
                {selectedGroup !== "all" 
                  ? TAG_CATEGORY_LABELS[selectedGroup as TagCategoryKey]?.label
                  : "ค่ายทั้งหมด"}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                สำรวจค่ายที่น่าสนใจทั้งหมด
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {displayedCamps.map((camp) => (
              <CampCard key={camp.id} camp={camp} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </section>
      )}

      {/* Empty state */}
      {!loading && filteredCamps.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">ไม่พบค่ายที่ตรงกับเงื่อนไข</h3>
          <p className="text-gray-500 mb-6">ลองปรับตัวกรองหรือคำค้นหาใหม่</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-[#F2B33D] text-white font-bold rounded-xl hover:bg-[#e6a82e] transition-all"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      )}
    </div>
  );
}
