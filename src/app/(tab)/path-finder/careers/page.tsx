'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@heroui/react';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import { FaLightbulb } from 'react-icons/fa';
import HeroBanner from '@/components/HeroBanner';
import { Career } from '@/data/path-finder';
import { RIASEC_TYPES, RIASECCode } from '@/data/riasec';

export default function CareersPage() {
  const router = useRouter();
  const [careers, setCareers] = useState<Career[]>([]);
  const [filteredCareers, setFilteredCareers] = useState<Career[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRIASEC, setSelectedRIASEC] = useState<RIASECCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch careers
  const fetchCareers = useCallback(async () => {
    try {
      const res = await fetch('/api/path-finder/careers');
      if (res.ok) {
        const data = await res.json();
        setCareers(data.careers);
        setFilteredCareers(data.careers);
      }
    } catch (error) {
      console.error('Error fetching careers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter Logic
  const filterCareers = useCallback(() => {
    let filtered = careers;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (career) =>
          career.nameTh.toLowerCase().includes(q) ||
          career.name.toLowerCase().includes(q) ||
          career.description.toLowerCase().includes(q)
      );
    }

    if (selectedRIASEC.length > 0) {
      filtered = filtered.filter((career) =>
        selectedRIASEC.some((code) => career.riasecCodes.includes(code))
      );
    }

    setFilteredCareers(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [careers, searchQuery, selectedRIASEC]);

  useEffect(() => {
    fetchCareers();
  }, [fetchCareers]);

  useEffect(() => {
    filterCareers();
  }, [filterCareers]);

  const toggleRIASEC = (code: RIASECCode) => {
    if (selectedRIASEC.includes(code)) {
      setSelectedRIASEC(selectedRIASEC.filter((c) => c !== code));
    } else {
      setSelectedRIASEC([...selectedRIASEC, code]);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredCareers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCareers = filteredCareers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        {/* Hero Banner - แสดงจริง */}
        <HeroBanner
          badge="IT Career Library"
          title="CAREER"
          titleHighlight="PATH"
          subtitle="สำรวจเส้นทางอาชีพของคุณ"
          description="กำลังโหลดข้อมูลอาชีพ..."
          showButtons={false}
        >
          {/* Search Box Skeleton */}
          <div className="relative w-full max-w-3xl animate-pulse">
            <div className="h-14 bg-white/50 rounded-2xl"></div>
          </div>
        </HeroBanner>

        <div className="container mx-auto px-4 max-w-8xl mt-12 mb-20">
          {/* Filter Section Skeleton */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-40"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            
            {/* Filter Buttons Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-3 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-2xl w-full lg:w-48"></div>
              ))}
            </div>
          </div>

          {/* Results Header Skeleton */}
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4 animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-64"></div>
          </div>

          {/* Careers Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
                {/* Header */}
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-6 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Banner with Search */}
      <HeroBanner
        badge="IT Career Library"
        title="CAREER"
        titleHighlight="PATH"
        subtitle="สำรวจเส้นทางอาชีพของคุณ"
        description="ค้นหาข้อมูลเชิงลึกเกี่ยวกับสายงาน IT ทั้งหมด เส้นทางการเรียนรู้ และทักษะที่จำเป็น"
        showButtons={false}
      >
        {/* Search Box ใน Hero Banner */}
        <div className="relative w-full max-w-3xl">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400 text-xl" />
          </div>
          <input
            type="text"
            placeholder="ค้นหาชื่ออาชีพ, ทักษะ หรือคีย์เวิร์ด..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-transparent bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-base placeholder-gray-400 focus:outline-none focus:border-[#2C2C2C] focus:ring-4 focus:ring-white/30 transition-all duration-300"
          />
        </div>
      </HeroBanner>

      <div className="container mx-auto px-4 max-w-8xl mt-12 mb-20">
        {/* --- Filter Section --- */}
        <div className="mb-10">
          {/* --- Filter Header --- */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-10 h-10 bg-white border border-gray-100 rounded-xl shadow-sm text-[#F2B33D]">
              {/* Icon Filter */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">กรองตามกลุ่มอาชีพ</h3>
              <p className="text-xs text-gray-400 font-medium">เลือกบุคลิกภาพ (RIASEC)</p>
            </div>
          </div>

          {/* --- Filter Buttons Grid --- */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-3">
            {Object.entries(RIASEC_TYPES).map(([code, info]) => {
              const isSelected = selectedRIASEC.includes(code as RIASECCode);
              return (
                <button
                  key={code}
                  onClick={() => toggleRIASEC(code as RIASECCode)}
                  className={`
                group relative flex items-center gap-3 p-3 pr-5 rounded-2xl border-2 text-left transition-all duration-300 ease-out
                ${isSelected
                      ? 'bg-[#F2B33D] border-[#F2B33D] text-white shadow-lg shadow-orange-200 translate-y-[-2px]'
                      : 'bg-white border-gray-100 text-gray-600 hover:border-[#F2B33D]/50 hover:bg-orange-50/30'
                    }
              `}
                >
                  {/* Box ตัวอักษรย่อ (R, I, A...) */}
                  <span
                    className={`
                  flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-colors
                  ${isSelected
                        ? 'bg-white text-[#F2B33D]'
                        : 'bg-gray-50 text-gray-400 group-hover:bg-[#F2B33D] group-hover:text-white'
                      }
                `}
                  >
                    {code}
                  </span>

                  {/* ข้อความ */}
                  <div className="flex flex-col">
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${isSelected ? 'text-white/80' : 'text-gray-400 group-hover:text-[#F2B33D]'}`}>
                      Type {code}
                    </span>
                    <span className={`text-sm font-bold leading-tight ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                      {info.thaiName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- Results Header --- */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-[#2C2C2C]">
            ผลลัพธ์การค้นหา <span className="text-gray-400 font-normal">({filteredCareers.length} อาชีพ)</span>
            {totalPages > 1 && (
              <span className="text-sm text-gray-400 font-normal ml-2">
                • หน้า {currentPage} / {totalPages}
              </span>
            )}
          </h2>
        </div>

        {/* --- Careers Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {currentCareers.map((career) => (
            <Card
              key={career.id}
              isPressable
              onPress={() => router.push(`/path-finder/careers/${career.id}`)}
              className="group relative w-full h-full bg-white border border-gray-100 hover:border-[#F2B33D] shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <CardBody className="p-5 flex flex-col h-full">

                {/* Header: Icon & Name */}
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-[#F2B33D]">
                    <FaLightbulb size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[#2C2C2C] group-hover:text-[#F2B33D] transition-colors truncate">
                      {career.nameTh}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">
                      {career.name}
                    </p>
                  </div>
                </div>

                {/* Middle: Description */}
                <div className="mb-6 pl-1">
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    <span className="text-[#F2B33D] mr-2">●</span>
                    {career.description}
                  </p>
                </div>

                {/* Footer: Tags & Action */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">

                  {/* RIASEC Tags */}
                  <div className="flex gap-1.5">
                    {career.riasecCodes.slice(0, 3).map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center justify-center w-6 h-6 text-[10px] font-bold rounded-md bg-gray-100 text-gray-600 group-hover:bg-[#F2B33D] group-hover:text-white transition-colors"
                      >
                        {code}
                      </span>
                    ))}
                  </div>

                  {/* Arrow Button */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#F2B33D] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    ดูรายละเอียด <FiArrowRight />
                  </div>

                </div>

              </CardBody>
            </Card>
          ))}
        </div>

        {/* --- Empty State --- */}
        {filteredCareers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <FiSearch size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่พบอาชีพที่ค้นหา</h3>
            <p className="text-gray-500">ลองเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อดูผลลัพธ์ใหม่อีกครั้ง</p>
          </div>
        )}

        {/* --- Pagination --- */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12 select-none">
            {/* ปุ่มย้อนกลับ (Previous Button) */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`group flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ease-in-out
          ${currentPage === 1
                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-[#F2B33D] hover:text-[#F2B33D] hover:shadow-md active:scale-95'
                }`}
            >
              {/* ไอคอนลูกศรซ้าย */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {/* ส่วนแสดงเลขหน้า (Page Numbers) */}
            <div className="flex gap-2 p-1 bg-gray-50 rounded-full">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-full font-medium text-sm transition-all duration-300 transform
              ${currentPage === page
                      ? 'bg-[#F2B33D] text-white shadow-lg shadow-orange-200 scale-105'
                      : 'text-gray-500 hover:bg-white hover:text-[#F2B33D] hover:shadow-sm'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* ปุ่มถัดไป (Next Button) */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`group flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ease-in-out
          ${currentPage === totalPages
                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-[#F2B33D] hover:text-[#F2B33D] hover:shadow-md active:scale-95'
                }`}
            >
              {/* ไอคอนลูกศรขวา */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
