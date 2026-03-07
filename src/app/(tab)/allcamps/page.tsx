import { Suspense } from 'react';
import HeroBanner from "@/components/HeroBanner";
import AllCampsContent from './AllCampsContent';
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
            {/* Skeleton Loading */}
            <div className="animate-pulse">
              {/* Filter Bar Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-12 w-32 bg-gray-200 rounded-xl"></div>
                    <div className="h-12 w-32 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              </div>

              {/* Results Header Skeleton */}
              <div className="mb-6">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
              </div>

              {/* Camps Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                        <div className="h-10 bg-gray-200 rounded-xl w-28"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <AllCampsContent />
      </Suspense>
    </div>
  );
}
