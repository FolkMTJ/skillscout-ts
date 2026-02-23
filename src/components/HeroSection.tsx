"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@heroui/react";
import { FaArrowRight, FaLightbulb, FaCompass, FaChartBar, FaBolt } from "react-icons/fa";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden">

      {/* ─── Mobile Layout (full yellow) ─── */}
      <div className="lg:hidden w-full bg-gradient-to-b from-[#F2B33D] to-[#F59E0B] px-5 pt-8 pb-10">
        {/* dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Badge */}
        <div className="flex justify-center mb-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/30 border border-white/50 shadow-sm">
            <FaCompass className="text-white" size={12} />
            <span className="text-xs font-bold tracking-wide uppercase text-white">
              ค้นหาเส้นทางของคุณ
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center text-3xl font-extrabold leading-tight text-white drop-shadow-md mb-3 relative z-10">
          ค้นหาเส้นทางไอที
          <br />
          <span className="text-[#2C2C2C]">ที่ใช่ในตัวคุณ</span>
        </h1>

        {/* Description */}
        <p className="text-center text-sm leading-relaxed font-medium text-white/90 mb-6 max-w-xs mx-auto relative z-10">
          แบบทดสอบของเราช่วยวิเคราะห์หาอาชีพไอทีที่เหมาะกับคุณ
          พร้อมแนะนำค่ายที่ตรงใจ
        </p>

        {/* CTA */}
        <div className="flex justify-center mb-5 relative z-10">
          <Link href="/path-finder/quiz" className="group">
            <Button
              size="md"
              className="h-11 px-8 font-bold text-sm bg-white text-[#2C2C2C] rounded-xl shadow-xl hover:scale-105 transition-all"
              endContent={<FaArrowRight className="text-[#F2B33D] group-hover:translate-x-1 transition-transform" size={14} />}
            >
              ทำแบบทดสอบ
            </Button>
          </Link>
        </div>

        {/* Pills */}
        <div className="flex flex-wrap justify-center gap-2 relative z-10">
          {[
            { text: "วิเคราะห์แม่นยำ", icon: FaChartBar },
            { text: "แนะนำค่ายฟรี", icon: FaLightbulb },
            { text: "รู้ผลทันที", icon: FaBolt },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/25 text-xs font-bold border border-white/40 text-white"
            >
              <item.icon size={11} className="text-white" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Desktop Layout (split diagonal) ─── */}
      <div className="hidden lg:flex relative w-full min-h-[520px] items-center bg-white dark:bg-[#2C2C2C]">

        {/* Right yellow panel */}
        <div
          className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-bl from-[#F2B33D] to-[#FFB347] z-0 shadow-[-20px_0_60px_rgba(242,179,61,0.2)]"
          style={{ clipPath: "polygon(20% 0%, 100% 0, 100% 100%, 0% 100%)" }}
        />
        <div
          className="absolute top-0 right-0 w-[55%] h-full opacity-10 z-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            clipPath: "polygon(20% 0%, 100% 0, 100% 100%, 0% 100%)",
          }}
        />

        <div className="container mx-auto px-8 relative z-10 flex items-center justify-between">
          {/* Text */}
          <div className="flex-1 max-w-xl py-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 bg-orange-50 dark:bg-white/5 border border-orange-100 dark:border-white/10 shadow-sm">
              <FaCompass className="text-[#F2B33D]" />
              <span className="text-xs font-bold tracking-wide uppercase text-orange-600 dark:text-orange-400">
                ค้นหาเส้นทางของคุณ
              </span>
            </div>

            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] tracking-tight text-[#2C2C2C] dark:text-white mb-4">
              ค้นหาเส้นทางไอที
              <br />
              <span className="bg-gradient-to-r from-[#F2B33D] to-[#F59E0B] bg-clip-text text-transparent">
                ที่ใช่ในตัวคุณ
              </span>
            </h1>

            <p className="text-base max-w-md leading-relaxed font-medium text-gray-600 dark:text-gray-300 mb-6">
              คุณสงสัยไหมว่าอาชีพในวงการไอทีแบบไหนที่เหมาะกับคุณ?
              แบบทดสอบของเราจะช่วยวิเคราะห์หาคำตอบ พร้อมแนะนำค่ายที่ตรงใจ
            </p>

            <Link href="/path-finder/quiz" className="relative group inline-block mb-6">
              <div className="absolute -inset-1 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-200 bg-[#F2B33D]" />
              <Button
                size="lg"
                className="relative h-14 px-10 font-bold text-base text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-[#F2B33D]"
                endContent={<FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
              >
                ทำแบบทดสอบ
              </Button>
            </Link>

            <div className="flex flex-wrap gap-3">
              {[
                { text: "วิเคราะห์แม่นยำ", icon: FaChartBar },
                { text: "แนะนำค่ายฟรี", icon: FaLightbulb },
                { text: "รู้ผลทันที", icon: FaBolt },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 text-sm font-bold border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300"
                >
                  <item.icon size={14} className="text-[#F2B33D]" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Logo */}
          <div className="flex-1 flex items-center justify-end">
            <div className="w-full max-w-[540px] animate-float-slow">
              <Image
                src="/logo-banner.png"
                alt="Skill Scout Banner"
                width={600}
                height={400}
                className="w-full h-auto object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}