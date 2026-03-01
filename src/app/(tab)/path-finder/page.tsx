// src/app/(tab)/path-finder/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiCompass, FiArrowRight, FiTarget, FiZap, FiBarChart2, FiRepeat } from 'react-icons/fi';
import HeroBanner from '@/components/HeroBanner';

const FEATURES = [
  {
    icon: <FiTarget className="w-6 h-6 text-[#F2B33D]" />,
    title: 'แม่นยำด้วย RIASEC',
    desc: 'ใช้ทฤษฎีที่ได้รับการยอมรับระดับสากลวิเคราะห์บุคลิกภาพและความถนัดของคุณใน 6 ด้าน',
  },
  {
    icon: <FiBarChart2 className="w-6 h-6 text-[#F2B33D]" />,
    title: 'เส้นทางอาชีพชัดเจน',
    desc: 'แนะนำเส้นทางการเรียนรู้ตั้งแต่ระดับเริ่มต้นจนถึงขั้นสูง พร้อมทักษะที่ต้องพัฒนา',
  },
  {
    icon: <FiZap className="w-6 h-6 text-[#F2B33D]" />,
    title: 'ค่ายที่เหมาะกับคุณ',
    desc: 'แนะนำค่ายที่ตรงกับความถนัดและเป้าหมายอาชีพของคุณโดยเฉพาะ',
  },
];

export default function PathFinderLandingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [hasResult, setHasResult] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkExistingResult = useCallback(async () => {
    try {
      const res = await fetch('/api/path-finder/results');
      if (res.ok) {
        setHasResult(true);
        router.push('/path-finder/results');
        return;
      }
    } catch {
      // no result yet — show landing page
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === 'authenticated') {
      checkExistingResult();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, checkExistingResult]);

  const handleStart = () => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    router.push('/path-finder/quiz');
  };

  // ─── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-950">
        <div className="bg-[#F2B33D] px-4 py-16 md:py-24">
          <div className="max-w-[1536px] mx-auto animate-pulse space-y-4">
            <div className="h-5 bg-white/30 rounded-full w-32" />
            <div className="h-10 bg-white/30 rounded-xl w-72" />
            <div className="h-6 bg-white/20 rounded-lg w-96 max-w-full" />
            <div className="h-12 bg-white/40 rounded-2xl w-44 mt-4" />
          </div>
        </div>
        <div className="max-w-[1536px] mx-auto px-3 md:px-6 py-10">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#F2B33D]/20 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-4/5" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                <div className="w-11 h-11 bg-[#F2B33D]/20 rounded-xl mb-4" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-5/6" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Main page ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-950">
      <HeroBanner
        badge="Holland Codes · RIASEC"
        title="PATH"
        titleHighlight="FINDER"
        subtitle="ค้นพบความถนัดของคุณ"
        description="แบบทดสอบความถนัดในอาชีพสายไอที วิเคราะห์ความถนัดใน 6 ด้าน พร้อมแนะนำเส้นทางอาชีพและค่ายที่เหมาะสม"
        showButtons={false}
      />

      <div className="max-w-[1536px] mx-auto px-3 md:px-6 py-8 md:py-12">
        {/* Theory callout */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 md:p-7 mb-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF3D0] flex items-center justify-center flex-shrink-0 mt-0.5">
              <FiCompass className="text-[#F2B33D]" size={22} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-[#2C2C2C] dark:text-white mb-1">
                ทฤษฎี RIASEC (Holland Codes)
              </h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                แบบทดสอบนี้ใช้ทฤษฎี RIASEC (Holland Codes) ซึ่งเป็นทฤษฎีที่ใช้กันอย่างแพร่หลายในการประเมินบุคลิกภาพและแนะนำอาชีพ
                โดยจะวิเคราะห์ความถนัดของคุณใน 6 ด้าน และแนะนำเส้นทางอาชีพที่เหมาะสม
                พร้อมค่ายที่ควรเข้าร่วมตั้งแต่ระดับเริ่มต้นจนถึงขั้นสูง
              </p>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-[#FFF3D0] flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-1.5 text-sm md:text-base">{f.title}</h3>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#F2B33D] to-orange-400" />
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-[#2C2C2C] dark:text-white mb-2">
                {hasResult ? 'คุณเคยทำแบบทดสอบแล้ว' : 'พร้อมค้นพบเส้นทางอาชีพของคุณหรือยัง?'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hasResult
                  ? 'ดูผลลัพธ์ที่มีอยู่ หรือเริ่มทำแบบทดสอบใหม่เพื่อรับการวิเคราะห์ล่าสุด'
                  : 'ใช้เวลาเพียง 10–15 นาที ค้นพบความถนัดด้วย Holland Codes'}
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0 flex-wrap justify-center md:justify-end">
              {hasResult && (
                <button
                  onClick={() => router.push('/path-finder/results')}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#2C2C2C] dark:text-white font-semibold rounded-2xl text-sm transition-all"
                >
                  ดูผลลัพธ์ <FiArrowRight size={15} />
                </button>
              )}
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-8 py-3 bg-[#F2B33D] hover:bg-[#e0a530] text-white font-bold rounded-2xl text-sm transition-all shadow-sm hover:shadow-md"
              >
                {hasResult ? <><FiRepeat size={15} /> ทำใหม่อีกครั้ง</> : <><FiZap size={15} /> เริ่มทำแบบทดสอบ</>}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/path-finder/careers')}
            className="text-sm text-gray-500 hover:text-[#F2B33D] font-medium transition-colors flex items-center gap-1.5 mx-auto"
          >
            หรือเลือกค้นหาเส้นทางอาชีพด้วยตัวเอง <FiArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
