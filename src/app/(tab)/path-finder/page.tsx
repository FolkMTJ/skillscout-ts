// src/app/(tab)/path-finder/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiCompass, FiArrowRight, FiTarget, FiZap, FiBarChart2, FiRepeat, FiLock } from 'react-icons/fi';
import HeroBanner from '@/components/HeroBanner';
import { loadGuestResult } from '@/lib/path-finder-utils';

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

  // ตรวจสอบว่ามีผลลัพธ์เก็บไว้หรือไม่ (DB สำหรับ user / localStorage สำหรับ guest)
  const checkExistingResult = useCallback(async () => {
    let redirecting = false;
    try {
      if (status === 'authenticated') {
        // ตรวจสอบผลจาก DB
        const res = await fetch('/api/path-finder/results');
        if (res.ok) {
          setHasResult(true);
          redirecting = true;
          router.push('/path-finder/results');
          return;
        }
      } else if (status === 'unauthenticated') {
        // ตรวจสอบผลจาก localStorage
        const guestResult = loadGuestResult();
        if (guestResult) {
          setHasResult(true);
          redirecting = true;
          router.push('/path-finder/results');
          return;
        }
      }
    } catch {
      // ไม่มีผล → แสดงหน้า landing
    } finally {
      if (!redirecting) setLoading(false);
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'loading') return;
    checkExistingResult();
  }, [status, checkExistingResult]);

  const handleStart = () => {
    // ทั้ง guest และ user ทำได้เหมือนกัน
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
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-950 pb-12">
      <HeroBanner
        badge="Holland Codes · RIASEC"
        title="PATH"
        titleHighlight="FINDER"
        subtitle="รู้ใจตัวเองใน 3 นาที เล็งเป้าหมายอาชีพไอทีที่ใช่"
        description="เลิกเดา! แบบทดสอบความถนัดระดับสากล วิเคราะห์จุดเด่นของคุณใน 6 ด้าน พร้อมเจาะจงสายงานไอทีและค่ายที่ 'เกิดมาเพื่อคุณ'"
        showButtons={false}
      >
        <div className="flex gap-3 flex-wrap mt-4">
          <button
            onClick={handleStart}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-[#2C2C2C] hover:bg-black text-white font-black rounded-2xl text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            {hasResult ? <><FiRepeat size={18} /> ทำใหม่เพื่ออัปเดตตัวเอง</> : <><FiZap size={18} /> เริ่มค้นหาตัวตน ฟรี!</>}
          </button>

          {hasResult && (
            <button
              onClick={() => router.push('/path-finder/results')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 text-[#2C2C2C] font-bold rounded-2xl text-base transition-all backdrop-blur-md border border-[#2C2C2C]/10 hover:border-[#2C2C2C]/20"
            >
              ดูผลลัพธ์ล่าสุด <FiArrowRight size={18} />
            </button>
          )}
        </div>
      </HeroBanner>

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 py-12">
        {/* Free Feature Banner */}
        {status === 'unauthenticated' && (
          <div className="flex items-center justify-between gap-4 bg-[#FFFBF0] border border-[#F2B33D]/30 rounded-3xl p-5 mb-10 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F2B33D]/20 flex items-center justify-center flex-shrink-0">
                <FiZap className="text-[#F2B33D] w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#2C2C2C]">ลองทำฟรี! ไม่ต้องเหนื่อย Login</h3>
                <p className="text-sm text-gray-600 font-medium">ทำเสร็จดูผลลัพธ์ได้ทันที! ข้อมูลจะถูกเก็บไว้บนเครื่องของคุณ</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="hidden md:flex items-center gap-2 text-sm font-bold text-[#2C2C2C] hover:text-[#F2B33D] bg-white hover:bg-[#FFFBF0] border border-[#F2B33D]/30 px-5 py-2.5 rounded-xl transition-all shadow-sm flex-shrink-0"
            >
              <FiLock size={14} />
              สมัครสมาชิกเพื่อฟินกว่า (บันทึกถาวร)
            </button>
          </div>
        )}

        {/* What is RIASEC? */}
        <div className="mb-16">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 md:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F2B33D]/10 text-[#2C2C2C] dark:text-[#F2B33D] rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-[#F2B33D]/20">
                  <FiCompass size={14} className="text-[#F2B33D]" /> ความน่าเชื่อถือระดับโลก
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#2C2C2C] dark:text-white mb-4 leading-tight">
                  ทฤษฎี <span className="text-[#F2B33D]">RIASEC</span> คืออะไร? <br className="hidden md:block" /> ทำไมถึงแม่นยำและได้รับการยอมรับ?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 text-sm md:text-base">
                  <strong>RIASEC (Holland Codes)</strong> คือทฤษฎีการประเมินและการเลือกอาชีพที่คิดค้นโดยนักจิตวิทยา <strong>Dr. John L. Holland</strong> ซึ่งเป็นที่ยอมรับและถูกนำไปใช้อย่างแพร่หลายในองค์กรชั้นนำ รวมถึงระบบการศึกษาทั่วโลก ทฤษฎีนี้ตั้งอยู่บนหลักการที่ว่า <em>"ผู้คนจะทำงานได้ดีที่สุดและมีความสุขที่สุด เมื่อได้อยู่ในสภาพแวดล้อมที่สอดคล้องกับบุคลิกภาพของตนเอง"</em>
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 text-sm md:text-base">
                  แบบทดสอบนี้ไม่ได้บอกแค่ว่าคุณ "เก่ง" อะไร แต่ช่วยเจาะลึกไปถึง <strong>"ความชอบและธรรมชาติที่แท้จริงของคุณ"</strong> ตามทฤษฎีได้แบ่งลักษณะทักษะและความสนใจของบุคคล รวมถึงสภาพแวดล้อมการทำงานออกเป็น 6 กลุ่มหลัก ดังนี้:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 transition-all hover:border-[#F2B33D]/50 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#2C2C2C] text-[#F2B33D] flex items-center justify-center font-black text-lg">R</div>
                      <span className="font-bold text-[#2C2C2C] dark:text-white">Realistic</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">กลุ่มนักปฏิบัติ ชอบลงมือทำ จัดการกับเครื่องมือ เครื่องจักร หรือรันระบบฮาร์ดแวร์จริง</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 transition-all hover:border-[#F2B33D]/50 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#2C2C2C] text-[#F2B33D] flex items-center justify-center font-black text-lg">I</div>
                      <span className="font-bold text-[#2C2C2C] dark:text-white">Investigative</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">กลุ่มนักคิดวิเคราะห์ ชอบค้นคว้า แก้ปัญหาที่ซับซ้อน และทำงานกับข้อมูลหรือการเขียนโค้ด</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 transition-all hover:border-[#F2B33D]/50 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#2C2C2C] text-[#F2B33D] flex items-center justify-center font-black text-lg">A</div>
                      <span className="font-bold text-[#2C2C2C] dark:text-white">Artistic</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">กลุ่มสายอาร์ต คิดนอกกรอบ รักอิสระ ชอบความสร้างสรรค์ เช่น งานออกแบบภาพ หรือ UI/UX</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 transition-all hover:border-[#F2B33D]/50 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#2C2C2C] text-[#F2B33D] flex items-center justify-center font-black text-lg">S</div>
                      <span className="font-bold text-[#2C2C2C] dark:text-white">Social</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">กลุ่มสังคม ชอบช่วยเหลือ สอน ให้คำปรึกษา และการทำงานร่วมกับผู้คนหรือเป็นตัวกลางประสานงาน</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 transition-all hover:border-[#F2B33D]/50 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#2C2C2C] text-[#F2B33D] flex items-center justify-center font-black text-lg">E</div>
                      <span className="font-bold text-[#2C2C2C] dark:text-white">Enterprising</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">กลุ่มผู้นำ กล้าตัดสินใจ มีทักษะการโน้มน้าวใจ เหมาะกับการบริหาร จัดการโปรเจกต์ไอที หรือทำธุรกิจ</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 transition-all hover:border-[#F2B33D]/50 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#2C2C2C] text-[#F2B33D] flex items-center justify-center font-black text-lg">C</div>
                      <span className="font-bold text-[#2C2C2C] dark:text-white">Conventional</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">กลุ่มคนมีระเบียบวงจร ชอบแผนงานที่แน่ชัด เป๊ะเรื่องตัวเลขและเอกสาร เช่น การจัดระบบหรือทำ QA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Combined CTA & Features Grid */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Big CTA Card (lg:col-span-2) */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-10 md:p-16 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
              {/* Decorative background glow for a premium feel without being overwhelming */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFFBF0] dark:bg-gray-800 rounded-full blur-3xl opacity-50 -z-0 group-hover:bg-[#F2B33D]/10 transition-colors duration-700 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFFBF0] dark:bg-gray-800 rounded-full blur-3xl opacity-50 -z-0 group-hover:bg-[#F2B33D]/10 transition-colors duration-700 pointer-events-none"></div>

              <div className="relative z-10 w-16 h-16 rounded-full bg-[#FFFBF0] dark:bg-gray-800 flex items-center justify-center mb-8 shadow-sm">
                <FiZap className="w-8 h-8 text-[#F2B33D]" />
              </div>

              <h2 className="relative z-10 text-3xl md:text-4xl lg:text-5xl font-black text-[#2C2C2C] dark:text-white mb-6 leading-tight">
                ใช้เวลาแค่ 18 คำถาม <br className="hidden sm:block" /> แล้วไปคว้าอนาคตกัน
              </h2>

              <p className="relative z-10 text-gray-500 dark:text-gray-400 mb-10 font-medium text-lg max-w-lg">
                ยิงตรงประเด็น ไม่มีน้ำ! ค้นหาว่าสายงานไอทีไหนที่ 'เกิดมาเพื่อคุณ'
              </p>

              <button
                onClick={handleStart}
                className="relative z-10 flex items-center gap-3 px-8 py-4 bg-[#2C2C2C] dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-[#F2B33D] dark:text-[#2C2C2C] font-black rounded-2xl text-lg transition-all shadow-md hover:shadow-xl hover:-translate-y-1"
              >
                {hasResult ? <><FiRepeat size={22} /> ทำใหม่อีกครั้ง</> : <><FiZap size={22} /> เริ่มทำแบบทดสอบฟรี</>}
              </button>
            </div>

            {/* Right: Small Feature Cards (cols-span-1) */}
            <div className="flex flex-col gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm flex-1 flex flex-col justify-center hover:border-[#F2B33D]/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#FFFBF0] dark:bg-gray-800 flex items-center justify-center mb-5">
                  <FiTarget className="w-6 h-6 text-[#F2B33D]" />
                </div>
                <h3 className="text-lg font-black text-[#2C2C2C] dark:text-white mb-2">เจาะลึก 6 มิติตัวตน</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                  ค้นหาว่าคุณถนัด ลงมือทำ, วิเคราะห์, สร้างสรรค์, เข้าสังคม, เป็นผู้นำ หรือ จัดการระบบ?
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm flex-1 flex flex-col justify-center hover:border-[#F2B33D]/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#FFFBF0] dark:bg-gray-800 flex items-center justify-center mb-5">
                  <FiBarChart2 className="w-6 h-6 text-[#F2B33D]" />
                </div>
                <h3 className="text-lg font-black text-[#2C2C2C] dark:text-white mb-2">ได้ 'อาชีพ' ที่จับต้องได้</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                  ได้รายชื่อสายงานไอทีที่เหมาะกับคาร์แรคเตอร์คุณ พร้อมทักษะตีบวกที่ต้องรีบเก็บ
                </p>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/path-finder/careers')}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#2C2C2C] font-bold transition-colors pb-1 border-b border-transparent hover:border-[#2C2C2C]"
          >
            ฉันรู้แล้วว่าตัวเองชอบอะไร ขอข้ามไปดูอาชีพเลยละกัน <FiArrowRight size={14} />
          </button>
        </div>
      </div >
    </div >
  );
}
