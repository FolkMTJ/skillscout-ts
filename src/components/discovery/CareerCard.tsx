'use client';

import { useRouter } from 'next/navigation';
import { Card, CardBody, Divider, Chip } from '@heroui/react';
import { FiTrendingUp, FiDollarSign, FiArrowRight, FiTarget } from 'react-icons/fi';

interface Career {
  id: string;
  name: string;
  matchScore: number;
  description: string;
  salary: string;
  requiredSkills: string[];
  growthOutlook: string;
}

interface CareerCardProps {
  career: Career;
  rank: number;
}

export default function CareerCard({ career, rank }: CareerCardProps) {
  const router = useRouter();
  
  // Helper function to get styles based on rank
// Helper function to get styles based on rank
  const getRankStyle = (rank: number) => {
    // Rank 1: Gold (Theme Color)
    if (rank === 1) return { 
        badge: "bg-[#F2B33D] text-white shadow-sm shadow-amber-100", 
        border: "border-[#F2B33D]" 
    };
    // Rank 2: Silver (Gray)
    if (rank === 2) return { 
        badge: "bg-[#9CA3AF] text-white shadow-sm shadow-gray-200",
        border: "border-gray-300"
    };
    // Rank 3: Bronze (Orange/Brown)
    if (rank === 3) return { 
        badge: "bg-[#D97706] text-white shadow-sm shadow-orange-200",
        border: "border-orange-300"
    };
    // Others: Default Gray
    return { 
        badge: "bg-gray-100 text-gray-600",
        border: "border-gray-200"
    };
  };

  const rankStyle = getRankStyle(rank);
  const isTopRank = rank <= 3;

  return (
    <Card 
      isPressable
      onPress={() => router.push(`/path-finder/careers/${career.id}`)}
      // ใช้ border สีพิเศษสำหรับ Top 3 เพื่อให้ดูเด่นขึ้น
      className={`w-full h-full group border-2 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden
        ${isTopRank ? rankStyle.border : 'border-gray-100 hover:border-[#F2B33D]/50'}`}
    >
      <CardBody className="p-5 flex flex-col h-full text-left">
        
        {/* --- 1. Header Row: Rank & Match Score --- */}
        <div className="flex items-center justify-between mb-4">
           {/* Rank Badge - วางอย่างมั่นคงมุมซ้ายบน */}
           <div className={`flex items-center justify-center px-3 py-1.5 rounded-md font-black text-sm ${rankStyle.badge}`}>
             อันดับ #{rank}
           </div>

           {/* Match Score Tag */}
           <Chip
              variant="flat"
              size="sm"
              className={`font-bold border-0 ${career.matchScore >= 80 ? 'bg-[#F2B33D]/10 text-[#d99f32]' : 'bg-gray-100 text-gray-500'}`}
              startContent={<FiTarget className={career.matchScore >= 80 ? 'text-[#d99f32]' : 'text-gray-400'} />}
            >
              {career.matchScore}% Match
            </Chip>
        </div>
          
        {/* --- 2. Title --- */}
        <h3 className="text-lg font-bold text-[#2C2C2C] group-hover:text-[#F2B33D] transition-colors line-clamp-2 leading-tight mb-2">
          {career.name}
        </h3>

        {/* --- 3. Description (นำกลับมาแล้ว) --- */}
        {/* จำกัดแค่ 2 บรรทัดพอให้เห็นภาพรวม ไม่รกเกินไป */}
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-5 font-medium">
          {career.description}
        </p>

        {/* --- 4. Stats Grid --- */}
        <div className="grid grid-cols-2 gap-3 mt-auto mb-5">
          <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 group-hover:border-[#F2B33D]/30 transition-colors">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <FiDollarSign className="text-[#F2B33D] text-xs" />
              <span className="text-[10px] uppercase font-bold tracking-wide">เงินเดือน</span>
            </div>
            <p className="text-xs font-bold text-gray-700 truncate">{career.salary}</p>
          </div>
          
          <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 group-hover:border-[#F2B33D]/30 transition-colors">
             <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <FiTrendingUp className="text-[#10B981] text-xs" />
              <span className="text-[10px] uppercase font-bold tracking-wide">แนวโน้ม</span>
            </div>
            <p className="text-xs font-bold text-gray-700 truncate">{career.growthOutlook}</p>
          </div>
        </div>

        <Divider className="mb-4" />

        {/* --- 5. Footer Action --- */}
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 group-hover:text-[#F2B33D] transition-colors">
              ดูเส้นทางอาชีพนี้
            </span>
            <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#F2B33D] flex items-center justify-center text-gray-400 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
                <FiArrowRight size={16} />
            </div>
        </div>

      </CardBody>
    </Card>
  );
}