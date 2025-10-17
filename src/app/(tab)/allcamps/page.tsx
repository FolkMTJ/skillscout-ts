import { Suspense } from 'react';
import PageHeader from "@/components/layout/PageHeader";
import AllCampsContent from './AllCampsContent';
import { Spinner } from "@heroui/react";

export default function AllCampsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <PageHeader
        title="All Camps"
        subtitle="Explore various IT camps and find the one that suits you."
        category="EXPLORE"
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
