"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@heroui/react";
// Added new icons for the features list
import { FaArrowRight, FaCheckCircle, FaLightbulb, FaCompass } from "react-icons/fa";

export default function HeroSection() {
  return (
    <section className="relative w-full bg-[#fefbf2] dark:bg-gray-900 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-40 dark:opacity-20" 
        style={{
          backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />
      
      <div className="container mx-auto px-6 py-24 md:py-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* ## Left Column: Text Content ## */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-amber-900 dark:text-amber-300 leading-tight">
              ค้นหาเส้นทางไอที
              <br/>
              <span className="text-orange-500">ที่ใช่ในตัวคุณ</span>
            </h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-400 max-w-lg mx-auto md:mx-0">
              คุณสงสัยไหมว่าอาชีพในวงการไอทีแบบไหนที่เหมาะกับคุณ? แบบทดสอบของเราออกแบบมาเพื่อช่วยคุณค้นหาคำตอบ
            </p>

            {/* --- Key Features List --- */}
            <div className="mt-8 space-y-3 inline-block text-left">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-green-500" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">ค้นพบจุดแข็งและความถนัดของคุณ</span>
              </div>
              <div className="flex items-center gap-3">
                <FaCompass className="text-blue-500" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">สำรวจเส้นทางอาชีพที่เป็นไปได้</span>
              </div>
              <div className="flex items-center gap-3">
                <FaLightbulb className="text-yellow-500" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">รับคำแนะนำค่ายที่เหมาะกับคุณโดยเฉพาะ</span>
              </div>
            </div>
            
            <div>
              <Link href="/quiz">
                <Button
                  size="lg"
                  className="mt-10 h-14 px-10 font-bold text-lg shadow-lg hover:shadow-amber-500/30 bg-amber-500 text-white hover:scale-105 transform transition-all duration-300 ease-in-out"
                  endContent={<FaArrowRight />}
                >
                  ทำแบบทดสอบ
                </Button>
              </Link>
            </div>


          </div>

          {/* ## Right Column: New Illustration ## */}
          <div className="relative flex items-center justify-center h-80 md:h-full">
            {/* Background Circle with subtle animation */}
            <div className="absolute w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-gray-800 dark:to-zinc-800 rounded-full animate-pulse-slow" />
            
            {/* The new illustration - will try to make one based on the description */}
            <div className="relative w-full h-full p-4">
                 
                 {/* This is where the new illustrative image will go */}
                 {/* I'll generate a suitable image for this spot */}
                 <Image
                  src="/new-hero-illustration.png" // Placeholder, will be replaced by generated image
                  alt="Abstract illustration of a person exploring IT career paths"
                  fill
                  priority
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 768px) 80vw, 40vw"
                  className="animate-[float_6s_ease-in-out_infinite]"
                />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}