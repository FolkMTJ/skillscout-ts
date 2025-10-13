"use client";

import React from "react";
import { Button, Input } from "@heroui/react";
import {
  FaSearch,
  FaStar,
  FaUsers,
  FaTrophy,
  FaRocket,
  FaSmile,
  FaChartLine
} from "react-icons/fa";

import CampCarousel from "@/components/(card)/CampCarousel";
import CampCard from "@/components/(card)/CampCard";
import Footer from "@/components/layout/Footer";

import { urgentCamps, trendingCamps } from "@/data/mockCamps";
import { categories } from "@/data/categories";

import HeroSection from '@/components/HeroSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-2C2C2C dark:bg-zinc-900 overflow-x-hidden">
      {/* Banner Section */}
      <section className="relative min-h-[750px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-400 dark:from-gray-900 dark:via-orange-900/30 dark:to-gray-900">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute inset-0 opacity-10 dark:opacity-20" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop')" }}
        />

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto py-20">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/30 backdrop-blur-md border-2 border-white/50 mb-8 hover:scale-105 transition-transform shadow-lg">
            <FaTrophy className="text-white drop-shadow-lg" size={20} />
            <span className="font-bold text-white drop-shadow-lg">แพลตฟอร์มจัดการค่ายอันดับ 1 ของไทย</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
            <span className="block text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.8)]">
              ค้นพบค่ายที่ใช่สำหรับคุณ
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/95 mb-12 leading-relaxed max-w-3xl mx-auto font-medium drop-shadow-lg">
            พัฒนาทักษะ ประสบการณ์ เปิดโลกพร้อมเพื่อนๆ<br className="hidden md:block" />
            <span className="font-bold">และการสร้างโอกาสใหม่</span> สำหรับคุณ
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto mb-16">
            <div className="flex-1">
              <Input
                size="lg"
                placeholder="ค้นหาค่ายที่คุณสนใจ เช่น Python, AI, ภาษา..."
                classNames={{
                  base: "w-full",
                  inputWrapper: "bg-white h-16 shadow-2xl border-2 border-white hover:border-orange-300 transition-all",
                  input: "text-base text-gray-700 placeholder:text-gray-400"
                }}
                startContent={<FaSearch className="text-orange-500" size={20} />}
              />
            </div>
            <Button
              size="lg"
              className="h-16 px-12 font-bold text-lg shadow-2xl hover:shadow-orange-400/50 hover:scale-105 transition-all bg-white text-orange-600 border-2 border-white hover:bg-orange-50"
              endContent={<FaRocket size={20} />}
            >
              ค้นหา
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="bg-white/95 dark:bg-black/50 backdrop-blur-md border-2 border-white/50 rounded-2xl p-6 hover:bg-white dark:hover:bg-black/70 hover:scale-105 transition-all duration-300 group shadow-xl">
              <FaTrophy className="text-orange-500 text-4xl mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-5xl font-black text-gray-800 dark:text-white mb-1">150+</p>
              <p className="text-gray-600 dark:text-gray-300 font-semibold">ค่ายทั้งหมด</p>
            </div>
            <div className="bg-white/95 dark:bg-black/50 backdrop-blur-md border-2 border-white/50 rounded-2xl p-6 hover:bg-white dark:hover:bg-black/70 hover:scale-105 transition-all duration-300 group shadow-xl">
              <FaUsers className="text-orange-500 text-4xl mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-5xl font-black text-gray-800 dark:text-white mb-1">5K+</p>
              <p className="text-gray-600 dark:text-gray-300 font-semibold">ผู้เข้าร่วม</p>
            </div>
            <div className="bg-white/95 dark:bg-black/50 backdrop-blur-md border-2 border-white/50 rounded-2xl p-6 hover:bg-white dark:hover:bg-black/70 hover:scale-105 transition-all duration-300 group shadow-xl">
              <FaStar className="text-orange-500 text-4xl mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-5xl font-black text-gray-800 dark:text-white mb-1">4.8★</p>
              <p className="text-gray-600 dark:text-gray-300 font-semibold">คะแนนเฉลี่ย</p>
            </div>
            <div className="bg-white/95 dark:bg-black/50 backdrop-blur-md border-2 border-white/50 rounded-2xl p-6 hover:bg-white dark:hover:bg-black/70 hover:scale-105 transition-all duration-300 group shadow-xl">
              <FaSmile className="text-orange-500 text-4xl mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-5xl font-black text-gray-800 dark:text-white mb-1">95%</p>
              <p className="text-gray-600 dark:text-gray-300 font-semibold">ความพึงพอใจ</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-50 to-transparent dark:from-zinc-900" />
      </section>

      {/* Urgent Registration Section */}
      <section className="max-w-[1536px] mx-auto px-6 py-20">
        <CampCarousel camps={urgentCamps} title="กำลังจะปิดรับเร็วๆนี้!" />
      </section>

      <section>
        <HeroSection />
      </section>

      {/* Trending Section*/}
      <section className="bg-gradient-to-br from-zinc-50 to-white dark:from-[#1a1a1a] dark:to-[#0a0a0a] py-16 border-y border-[#F2B33D]/10 dark:border-amber-500/10">
        <div className="max-w-[1536px] mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#F2B33D]/10 backdrop-blur-md border border-[#F2B33D]/30 dark:bg-amber-500/10 dark:border-amber-500/20 mb-3 hover:scale-105 transition-transform">
              <FaStar className="text-[#F2B33D] dark:text-amber-400" size={16} />
              <span className="font-bold text-[#2C2C2C] dark:text-white text-sm">ยอดนิยม</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[#2C2C2C] dark:text-white mb-3">
              ค่ายที่กำลัง<span className="text-[#F2B33D] dark:text-amber-400">มาแรง!</span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-xl mx-auto">
              ค่ายยอดนิยมที่ได้รับความสนใจสูงสุดในเดือนนี้
            </p>
          </div>
          <div className="space-y-4">
            {trendingCamps.map((camp) => (
              <CampCard key={camp.id} camp={camp} variant="detailed" />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-[1536px] mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-black text-gray-800 dark:text-white mb-4">
            สำรวจตาม<span className="text-orange-600 dark:text-amber-500">หมวดหมู่</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-xl font-medium">
            เลือกหมวดหมู่ที่คุณสนใจและเริ่มต้นการเรียนรู้
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.name}
                variant="flat"
                className="h-32 flex flex-col gap-3 bg-white border-2 border-gray-200 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-200/50 hover:scale-105 transition-all duration-300 group dark:bg-gray-800/50 dark:border-gray-700 dark:hover:border-amber-500 dark:hover:shadow-amber-500/10"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${category.gradient} group-hover:scale-110 transition-transform shadow-lg`}>
                  <IconComponent size={40} className="text-white" />
                </div>
                <span className="font-bold text-lg text-gray-800 group-hover:text-orange-600 transition-colors dark:text-white dark:group-hover:text-amber-400">
                  {category.name}
                </span>
              </Button>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 dark:from-gray-900 dark:via-orange-900/40 dark:to-gray-900">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(white 2px, transparent 2px), linear-gradient(90deg, white 2px, transparent 2px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        <div className="relative max-w-[1536px] mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/30 backdrop-blur-md border-2 border-white/50 mb-6 shadow-lg">
            <FaRocket className="text-white" />
            <span className="font-bold text-white">เริ่มต้นวันนี้</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-2xl">
            พร้อมที่จะ<span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]">เริ่มต้น</span>แล้วหรือยัง?
          </h2>
          <p className="text-xl text-white/95 mb-12 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-lg">
            สมัครสมาชิกวันนี้ เพื่อรับข่าวสารค่ายใหม่ๆ<br />
            <span className="font-bold">โปรโมชั่นพิเศษ</span> และ<span className="font-bold">ส่วนลดสุดคุ้ม</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="h-16 px-12 font-bold text-lg shadow-2xl hover:scale-105 transition-all bg-white text-orange-600 border-2 border-white hover:bg-orange-50"
            >
              สมัครสมาชิกฟรี
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="h-16 px-12 font-bold text-lg border-2 border-white text-white hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              เรียนรู้เพิ่มเติม
            </Button>
          </div>
          <div className="flex justify-center items-center gap-8 mt-16 flex-wrap">
            <div className="flex items-center gap-3 bg-white/95 dark:bg-black/50 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <FaChartLine className="text-white" size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">การเติบโต</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">+250%</p>
              </div>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="flex items-center gap-3 bg-white/95 dark:bg-black/50 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <FaUsers className="text-white" size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">สมาชิกใหม่</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">1,200+</p>
              </div>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="flex items-center gap-3 bg-white/95 dark:bg-black/50 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <FaTrophy className="text-white" size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">รางวัลที่ได้รับ</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">15+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}