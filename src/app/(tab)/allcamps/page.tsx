import { Suspense } from 'react';
import HeroBanner from "@/components/HeroBanner";
import AllCampsContent from './AllCampsContent';
import { Spinner } from "@heroui/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Camps | SkillScout",
  description: "ค้นหาค่าย IT ที่เหมาะกับคุณ",
};

export default function AllCampsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#171717]">
      {/* Hero Banner */}
      <HeroBanner
        badge="Explore All Camps"
        title="ALL"
        titleHighlight="CAMPS"
        subtitle="ค่ายทั้งหมดที่เราคัดสรรมาเพื่อคุณโดยเฉพาะ"
        description="ค้นพบค่ายกิจกรรม IT ที่เหมาะกับคุณและเริ่มต้นเส้นทางสู่อาชีพในฝัน"
        showButtons={false}
      />
      
      {/* Content with Suspense */}
      <Suspense 
        fallback={
          <div className="max-w-[1536px] mx-auto px-6 py-12">
            <div className="text-center py-20">
              <Spinner size="lg" color="warning" className="mb-4" />
              <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">กำลังโหลดค่าย...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">กรุณารอสักครู่</p>
            </div>
          </div>
        }
      >
        <AllCampsContent />
      </Suspense>
    </div>
  );
}
