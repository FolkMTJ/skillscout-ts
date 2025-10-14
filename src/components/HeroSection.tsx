"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { FaArrowRight, FaCheckCircle, FaLightbulb, FaCompass } from "react-icons/fa";

export default function HeroSection() {
  return (
    <section className="relative w-full bg-gradient-to-br from-amber-50 via-orange-50/30 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/20 dark:bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-3xl" />
      
      <div 
        className="absolute inset-0 opacity-30 dark:opacity-10" 
        style={{
          backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      
      <div className="container mx-auto px-6 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          
          {/* Left Column: Text Content */}
          <div className="text-center md:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 mb-4">
              <FaCompass className="text-orange-500" size={14} />
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">ค้นหาเส้นทางของคุณ</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-3">
              ค้นหาเส้นทาง<span className="text-orange-500">ไอที</span>
              <br/>
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">ที่ใช่ในตัวคุณ</span>
            </h1>
            
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto md:mx-0 mb-6">
              แบบทดสอบของเราจะช่วยค้นหาอาชีพไอทีที่เหมาะกับคุณ พร้อมคำแนะนำค่ายที่ตรงใจ
            </p>

            {/* Features List - Compact */}
            <div className="space-y-2 mb-6">
              {[
                { icon: FaCheckCircle, color: "text-green-500", text: "ค้นพบจุดแข็งและความถนัด" },
                { icon: FaCompass, color: "text-blue-500", text: "สำรวจเส้นทางอาชีพไอที" },
                { icon: FaLightbulb, color: "text-amber-500", text: "รับคำแนะนำค่ายที่เหมาะกับคุณ" }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-left">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                    <feature.icon className={feature.color} size={12} />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
            
            <Link href="/quiz">
              <Button
                size="lg"
                className="h-11 px-8 font-bold text-sm shadow-lg hover:shadow-xl hover:shadow-amber-500/30 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:scale-105 transform transition-all duration-300 border-2 border-orange-400/50"
                endContent={<FaArrowRight size={14} />}
              >
                ทำแบบทดสอบเลย
              </Button>
            </Link>
          </div>

          {/* Right Column: Illustration */}
          <div className="relative flex items-center justify-center h-64 md:h-80">
            {/* Animated background circles */}
            <div className="absolute w-[280px] h-[280px] md:w-[350px] md:h-[350px] bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-full opacity-60 animate-pulse" />
            <div className="absolute w-[240px] h-[240px] md:w-[300px] md:h-[300px] bg-gradient-to-br from-amber-200 to-yellow-200 dark:from-amber-800/20 dark:to-yellow-800/20 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }} />
            
            {/* Icon Grid Pattern */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="grid grid-cols-3 gap-4 p-8">
                {[
                  { emoji: "💻", delay: "0s" },
                  { emoji: "🎨", delay: "0.1s" },
                  { emoji: "📊", delay: "0.2s" },
                  { emoji: "🚀", delay: "0.3s" },
                  { emoji: "🎯", delay: "0.4s" },
                  { emoji: "⚡", delay: "0.5s" },
                  { emoji: "🔧", delay: "0.6s" },
                  { emoji: "📱", delay: "0.7s" },
                  { emoji: "🌟", delay: "0.8s" }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-2xl md:text-3xl hover:scale-110 transition-transform duration-300 hover:shadow-xl border-2 border-orange-100 dark:border-orange-900/30"
                    style={{
                      animation: 'float 6s ease-in-out infinite',
                      animationDelay: item.delay
                    }}
                  >
                    {item.emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* Center highlight */}
            <div className="absolute w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full blur-2xl opacity-40" />
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
}