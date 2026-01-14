"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@heroui/react";
import { FaArrowRight, FaLightbulb, FaCompass, FaChartBar, FaBolt } from "react-icons/fa";

// Theme Colors
const theme = {
  primary: "#F2B33D", // Amber Gold
  white: "#FFFFFF",
  dark: "#2C2C2C",
};

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[100px] flex items-center bg-white dark:bg-[#2C2C2C] overflow-hidden">

      {/* --- Background Shape (ย้ายไปด้านขวา เพื่อรองรับโลโก้สีขาว) --- */}
      <div
        className="absolute top-0 right-0 w-full lg:w-[55%] h-full bg-gradient-to-bl from-[#F2B33D] to-[#FFB347] z-0 shadow-[-20px_0_60px_rgba(242,179,61,0.2)]"
        style={{
          // ปรับมุมตัด: ตัดเฉียงจากซ้ายบนลงขวาล่าง
          clipPath: "polygon(20% 0%, 100% 0, 100% 100%, 0% 100%)"
        }}
      />

      {/* Pattern Overlay บนพื้นสีทอง */}
      <div className="absolute top-0 right-0 w-full lg:w-[55%] h-full opacity-10 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${theme.white} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          clipPath: "polygon(20% 0%, 100% 0, 100% 100%, 0% 100%)"
        }}
      />

      <div className="container mx-auto px-6 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between">

          {/* --- Left Column: Text Content (พื้นหลังขาว -> Text สีเข้ม) --- */}
          <div className="flex-1 text-center lg:text-left relative z-20">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 bg-orange-50 dark:bg-white/5 border border-orange-100 dark:border-white/10 shadow-sm cursor-default">
              <FaCompass style={{ color: theme.primary }} />
              <span className="text-xs font-bold tracking-wide uppercase text-orange-600 dark:text-orange-400">
                ค้นหาเส้นทางของคุณ
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] mb-3 font-extrabold leading-[1.1] tracking-tight text-[#2C2C2C] dark:text-white">
              ค้นหาเส้นทางไอที
              <br />
              <span className="relative inline-block">
                {/* ใช้สีทองไล่เฉดให้เด่นบนพื้นขาว */}
                <span className="relative z-10 bg-gradient-to-r from-[#F2B33D] to-[#F59E0B] bg-clip-text text-transparent">
                  ที่ใช่ในตัวคุณ
                </span>
              </span>
            </h1>

            {/* Paragraph */}
            <div className="mb-5">
              <p className="text-base md:text-lg max-w-xl leading-relaxed font-medium text-gray-600 dark:text-gray-300">
                คุณสงสัยไหมว่าอาชีพในวงการไอทีแบบไหนที่เหมาะกับคุณ?
              </p>
              <p className="text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium text-gray-600 dark:text-gray-300">
                แบบทดสอบของเราจะช่วยวิเคราะห์หาคำตอบ พร้อมแนะนำค่ายที่ตรงใจ
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 mb-5">
              <Link href="/path-finder/quiz" className="relative group">
                <div className="absolute -inset-1 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-200" style={{ background: theme.primary }}></div>
                <Button
                  size="lg"
                  className="relative h-14 px-10 font-bold text-base text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  style={{ backgroundColor: theme.primary }}
                  endContent={<FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
                >
                  ทำแบบทดสอบ
                </Button>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4">
              {[
                { text: "วิเคราะห์แม่นยำ", icon: FaChartBar },
                { text: "แนะนำค่ายฟรี", icon: FaLightbulb },
                { text: "รู้ผลทันที", icon: FaBolt }
              ].map((item, idx) => (
                <div key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 text-sm font-bold border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300">
                  <item.icon size={14} className="text-[#F2B33D]" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* --- Right Column: Logo Banner (พื้นหลังทอง -> Logo ขาวขึ้นชัด) --- */}
          <div className="flex-1 relative w-full flex items-center justify-center lg:justify-end z-10 p-8 lg:p-0">

            {/* Logo Image */}
            <div className="relative w-full max-w-[500px] lg:max-w-[600px] animate-float-slow">
              {/* Logo สีขาวจะมองเห็นชัดเจนเพราะวางอยู่บนพื้นหลัง Gradient สีทอง (#F2B33D) 
                  เพิ่ม Drop Shadow สีเข้มเล็กน้อยให้ตัวโลโก้มีมิติ 
               */}
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