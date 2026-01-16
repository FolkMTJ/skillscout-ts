'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@heroui/react';
import { FiSearch, FiArrowRight, FiFilter } from 'react-icons/fi';
import HeroBanner from '@/components/HeroBanner';
import { Career } from '@/data/path-finder';
import { RIASEC_TYPES, RIASECCode } from '@/data/riasec';

// Theme Constants

export default function CareersPage() {
  const router = useRouter();
  const [careers, setCareers] = useState<Career[]>([]);
  const [filteredCareers, setFilteredCareers] = useState<Career[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRIASEC, setSelectedRIASEC] = useState<RIASECCode[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" color="warning" label="กำลังโหลดข้อมูลอาชีพ..." />
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
        <div className="relative max-w-2xl">
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

      <div className="container mx-auto px-4 max-w-8xl mt-12">
        
        {/* --- Filter Section --- */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
             <FiFilter className="text-[#F2B33D]" />
             <span className="font-bold text-[#2C2C2C]">กรองตามกลุ่มบุคลิกภาพ (RIASEC)</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {Object.entries(RIASEC_TYPES).map(([code, info]) => {
              const isSelected = selectedRIASEC.includes(code as RIASECCode);
              return (
                <button
                  key={code}
                  onClick={() => toggleRIASEC(code as RIASECCode)}
                  className={`
                    group relative px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-200
                    flex items-center gap-2
                    ${isSelected 
                      ? 'bg-[#2C2C2C] border-[#2C2C2C] text-white shadow-lg transform -translate-y-1' 
                      : 'bg-white border-gray-100 text-gray-500 hover:border-[#F2B33D] hover:text-[#F2B33D]'}
                  `}
                >
                  <span className={`
                    w-6 h-6 rounded-lg flex items-center justify-center text-[10px]
                    ${isSelected ? 'bg-[#F2B33D] text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-[#F2B33D]/10 group-hover:text-[#F2B33D]'}
                  `}>
                    {code}
                  </span>
                  <span>{info.thaiName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- Results Header --- */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
           <h2 className="text-xl font-bold text-[#2C2C2C]">
             ผลลัพธ์การค้นหา <span className="text-gray-400 font-normal">({filteredCareers.length} อาชีพ)</span>
           </h2>
           {/* Reset Filter Button (Show only if filtering) */}
           {(searchQuery || selectedRIASEC.length > 0) && (
             <button 
                onClick={() => { setSearchQuery(''); setSelectedRIASEC([]); }}
                className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
             >
               ล้างตัวกรองทั้งหมด
             </button>
           )}
        </div>

        {/* --- Careers Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCareers.map((career) => (
            <div
              key={career.id}
              onClick={() => router.push(`/path-finder/careers/${career.id}`)}
              className="group relative bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer hover:border-[#F2B33D]/50 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
               {/* Decorative Gradient on Hover */}
               <div className="absolute inset-0 bg-gradient-to-br from-[#F2B33D]/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 pointer-events-none" />

               {/* Header: Title & RIASEC */}
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="pr-4">
                    <h3 className="text-lg font-bold text-[#2C2C2C] group-hover:text-[#F2B33D] transition-colors leading-tight mb-1">
                      {career.nameTh}
                    </h3>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {career.name}
                    </p>
                  </div>
                  
                  {/* RIASEC Dots */}
                  <div className="flex -space-x-1 flex-shrink-0">
                    {career.riasecCodes.slice(0, 3).map((code) => (
                       <div key={code} className="w-7 h-7 rounded-lg bg-[#F2B33D] border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm">
                         {code}
                       </div>
                    ))}
                  </div>
               </div>

               {/* Description - ซ่อนไว้เพื่อให้การ์ดกระทัดรัดขึ้น */}
               {/* <p className="text-sm text-gray-500 line-clamp-3 mb-6 relative z-10 font-medium leading-relaxed">
                 {career.description}
               </p> */}

               {/* Footer: Tags & Action */}
               <div className="mt-auto relative z-10">
                  <div className="flex flex-wrap gap-2 mb-4 h-[24px] overflow-hidden">
                     {career.requiredTags.slice(0, 3).map((tag) => (
                       <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-100">
                         {tag}
                       </span>
                     ))}
                     {career.requiredTags.length > 3 && (
                       <span className="text-[10px] text-gray-400 self-center">+{career.requiredTags.length - 3}</span>
                     )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 group-hover:border-[#F2B33D]/20 transition-colors">
                     <span className="text-xs font-bold text-gray-400 group-hover:text-[#F2B33D] transition-colors">
                       ดูข้อมูลอาชีพ
                     </span>
                     <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-[#F2B33D] text-gray-400 group-hover:text-white flex items-center justify-center transition-all duration-300 transform group-hover:translate-x-1">
                       <FiArrowRight size={14} />
                     </div>
                  </div>
               </div>
            </div>
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
        
      </div>
    </div>
  );
}
