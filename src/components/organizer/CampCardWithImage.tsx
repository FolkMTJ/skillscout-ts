// src/components/organizer/CampCardWithImage.tsx
'use client';

import { Button, Tooltip, Progress } from '@heroui/react';
import { 
  FiEdit2, 
  FiTrash2, 
  FiCheckCircle, 
  FiMapPin, 
  FiCalendar, 
  FiUsers, 
  FiClock 
} from 'react-icons/fi';
import { Camp } from '@/types';
import Image from 'next/image';

interface CampCardWithImageProps {
  camp: Camp;
  pendingCount?: number;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onComplete?: () => void;
}

export default function CampCardWithImage({ 
  camp, 
  pendingCount = 0, 
  onEdit, 
  onDelete,
  onView,
  onComplete
}: CampCardWithImageProps) {
  // คำนวณ % ความคืบหน้า
  const capacity = camp.capacity || camp.participantCount || 1;
  const enrolled = camp.enrolled || 0;
  const enrollmentPercentage = Math.min((enrolled / capacity) * 100, 100);
  
  // เช็คสถานะ
  const isCompleted = camp.status === 'completed' || (camp.endDate && new Date(camp.endDate) < new Date());
  const isActive = camp.status === 'active';
  const isPending = camp.status === 'pending';
  const isRejected = camp.status === 'rejected';

  // กำหนดสีตามสถานะ
  const getStatusConfig = () => {
    if (isCompleted) return { label: 'จบแล้ว', color: 'bg-gray-500', text: 'text-gray-500', border: 'border-gray-200' };
    if (isRejected) return { label: 'ถูกปฏิเสธ', color: 'bg-red-500', text: 'text-red-500', border: 'border-red-200' };
    if (isPending) return { label: 'รอตรวจสอบ', color: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-200' };
    return { label: 'เปิดรับสมัคร', color: 'bg-green-500', text: 'text-green-500', border: 'border-green-200' };
  };

  const statusConfig = getStatusConfig();

  return (
    <div 
      onClick={onView}
      className="group relative flex flex-col h-full w-full min-w-[300px] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* --- Image Section --- */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {camp.image ? (
          <Image
            src={camp.image}
            alt={camp.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-300">
             <FiCalendar size={48} />
             <span className="text-xs mt-2">No Image</span>
          </div>
        )}
        
        {/* Overlay Gradient (ทำให้ตัวหนังสืออ่านง่ายขึ้นเวลามีข้อความทับ) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

        {/* Status Badge (Top Left) */}
        <div className="absolute top-3 left-3 z-10">
           <div className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm backdrop-blur-md ${statusConfig.color} bg-opacity-90`}>
             {statusConfig.label}
           </div>
        </div>

        {/* Floating Actions (Top Right) - Show on Hover */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          <Tooltip content="แก้ไขค่าย">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 bg-white/90 backdrop-blur text-gray-700 rounded-full hover:bg-[#F2B33D] hover:text-white shadow-lg transition-colors"
            >
              <FiEdit2 size={16} />
            </button>
          </Tooltip>
          <Tooltip content="ลบค่าย" color="danger">
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 bg-white/90 backdrop-blur text-red-500 rounded-full hover:bg-red-500 hover:text-white shadow-lg transition-colors"
            >
              <FiTrash2 size={16} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* --- Content Section --- */}
      <div className="p-5 flex flex-col flex-1">
        {/* Tags & Price Row */}
        <div className="flex justify-between items-start mb-2">
           <div className="flex gap-1 overflow-hidden">
             {camp.tags && camp.tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {tag}
                </span>
             ))}
           </div>
           <span className="text-sm font-bold text-[#F2B33D] shrink-0">
             {camp.price === '฿0' || camp.price === '0' ? 'ฟรี' : camp.price}
           </span>
        </div>

        {/* Title - ชิดซ้าย */}
        <h3 className="font-bold text-gray-800 text-lg leading-snug line-clamp-2 mb-2 group-hover:text-[#F2B33D] transition-colors text-left">
          {camp.name}
        </h3>

        {/* Meta Info */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FiCalendar className="shrink-0 text-[#F2B33D]" />
            <span className="truncate">
               {camp.startDate ? new Date(camp.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : camp.date}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FiMapPin className="shrink-0 text-[#F2B33D]" />
            <span className="truncate">{camp.location}</span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-auto pt-4 border-t border-gray-50">
           {/* รออนุมัติ - แสดงด้านบนสุด */}
           {pendingCount > 0 && (
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg w-fit">
                <FiClock />
                รออนุมัติ {pendingCount} คน
              </div>
           )}

           <div className="flex justify-between text-xs mb-1.5">
             <div className="flex items-center gap-1 text-gray-600 font-medium">
               <FiUsers />
               <span>ผู้สมัคร {enrolled}/{capacity}</span>
             </div>
             <span className={`${statusConfig.text} font-bold`}>{enrollmentPercentage.toFixed(0)}%</span>
           </div>
           
           <Progress 
             aria-label="Camp capacity" 
             value={enrollmentPercentage} 
             size="sm"
             radius="full"
             classNames={{
               indicator: `${statusConfig.color}`,
               track: "bg-gray-100",
             }}
           />
        </div>

        {/* Action Button - เช็คสถานะแบบ exclusive */}
        {isCompleted ? (
           // ค่ายจบแล้ว - ปุ่ม disabled
           <Button
             className="w-full mt-4 font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
             size="sm"
             startContent={<FiCheckCircle />}
             isDisabled
           >
             จบค่ายแล้ว
           </Button>
        ) : isActive && onComplete ? (
           // ค่ายยังไม่จบและ active - ปุ่มกดจบค่าย
           <Button
             className="w-full mt-4 font-semibold bg-gray-900 text-white hover:bg-green-600 transition-colors shadow-md"
             size="sm"
             startContent={<FiCheckCircle />}
             onClick={(e) => { 
                  e.stopPropagation(); 
                  onComplete(); 
                }}
           >
             กดเพื่อจบค่ายนี้
           </Button>
        ) : null}
      </div>
    </div>
  );
}
