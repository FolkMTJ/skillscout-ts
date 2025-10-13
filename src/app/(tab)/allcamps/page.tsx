"use client";

import React, { useState } from "react";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import { FaSearch, FaTrophy, FaClock, FaFire, FaChevronDown } from "react-icons/fa";
import CampCard from "@/components/(card)/CampCard";
import PageHeader from "@/components/layout/PageHeader";
import { urgentCamps, trendingCamps } from "@/data/mockCamps";

// Mock data สำหรับค่ายทั้งหมด (ในการใช้งานจริงให้ดึงจาก API)
const allCamps = [
  ...urgentCamps,
  ...trendingCamps,
  // เพิ่มข้อมูลเพื่อให้ครบ 9 รายการ
  {
    id: "7",
    name: "วิทยาศาสตร์สนุก Summer Camp",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800",
    date: "15-20 มิ.ย. 2568",
    location: "มหาวิทยาลัยเชียงใหม่",
    price: "฿3,500",
    deadline: "1 มิ.ย. 68",
    daysLeft: 15,
    description: "เรียนรู้วิทยาศาสตร์ผ่านการทดลองสนุกๆ",
    category: "วิทยาศาสตร์"
  },
  {
    id: "8",
    name: "English Speaking Camp",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800",
    date: "1-5 ก.ค. 2568",
    location: "กรุงเทพฯ",
    price: "฿4,200",
    deadline: "20 มิ.ย. 68",
    daysLeft: 25,
    description: "พัฒนาทักษะการพูดภาษาอังกฤษแบบเข้มข้น",
    category: "ภาษา"
  },
  {
    id: "9",
    name: "Game Development Workshop",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
    date: "10-14 ก.ค. 2568",
    location: "ออนไลน์",
    price: "฿2,500",
    deadline: "30 มิ.ย. 68",
    daysLeft: 28,
    description: "สร้างเกมของคุณเองด้วย Unity",
    category: "เทคโนโลยี"
  }
];

const categories = [
  { key: "all", label: "ทั้งหมด" },
  { key: "tech", label: "เทคโนโลยี" },
  { key: "language", label: "ภาษา" },
  { key: "science", label: "วิทยาศาสตร์" },
  { key: "art", label: "ศิลปะ" },
];

const sortOptions = [
  { key: "latest", label: "ล่าสุด" },
  { key: "popular", label: "ยอดนิยม" },
  { key: "deadline", label: "ใกล้ปิดรับ" },
  { key: "price-low", label: "ราคาต่ำ-สูง" },
  { key: "price-high", label: "ราคาสูง-ต่ำ" },
];

export default function AllCampsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <PageHeader
        title="All Camps"
        subtitle="Explore various IT camps and find the one that suits you."
        category="EXPLORE"
      />
      <div className="max-w-[1536px] mx-auto px-6 py-12">
        {/* Search & Filter Section */}
        <section className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border-2 border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-6">
                <Input
                  size="lg"
                  placeholder="ค้นหาค่ายที่คุณสนใจ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  classNames={{
                    inputWrapper: "bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 hover:border-orange-400 transition-all"
                  }}
                  startContent={<FaSearch className="text-orange-500" size={20} />}
                />
              </div>

              {/* Category Filter */}
              <div className="md:col-span-3">
                <Select
                  size="lg"
                  placeholder="เลือกหมวดหมู่"
                  selectedKeys={[selectedCategory]}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  classNames={{
                    trigger: "bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 hover:border-orange-400"
                  }}
                >
                  {categories.map((category) => (
                    <SelectItem key={category.key}>
                      {category.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Sort */}
              <div className="md:col-span-3">
                <Select
                  size="lg"
                  placeholder="เรียงตาม"
                  selectedKeys={[sortBy]}
                  onChange={(e) => setSortBy(e.target.value)}
                  classNames={{
                    trigger: "bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 hover:border-orange-400"
                  }}
                >
                  {sortOptions.map((option) => (
                    <SelectItem key={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* กำลังจะปิดรับเร็วๆนี้ */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/10 border border-red-500/30">
              <FaClock className="text-red-500" size={20} />
              <span className="font-bold text-red-600 dark:text-red-400">กำลังจะปิดรับเร็วๆนี้</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {urgentCamps.slice(0, 3).map((camp) => (
              <CampCard key={camp.id} camp={camp} variant="compact" />
            ))}
          </div>
        </section>

        {/* ค่ายมาแรง */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500/10 border border-orange-500/30">
              <FaFire className="text-orange-500" size={20} />
              <span className="font-bold text-orange-600 dark:text-orange-400">ค่ายมาแรง</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-orange-500/30 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingCamps.slice(0, 3).map((camp) => (
              <CampCard key={camp.id} camp={camp} variant="compact" />
            ))}
          </div>
        </section>

        {/* ค่ายทั้งหมด */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-gray-500/10 border border-gray-500/30">
              <FaTrophy className="text-gray-600 dark:text-gray-400" size={20} />
              <span className="font-bold text-gray-700 dark:text-gray-300">ค่ายทั้งหมด</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-500/30 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {(showMore ? allCamps : allCamps.slice(0, 9)).map((camp) => (
              <CampCard key={camp.id} camp={camp} variant="compact" />
            ))}
          </div>

          {/* ปุ่มดูเพิ่มเติม */}
          {!showMore && allCamps.length > 9 && (
            <div className="text-center">
              <Button
                size="lg"
                className="px-12 py-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                endContent={<FaChevronDown size={20} />}
                onPress={() => setShowMore(true)}
              >
                ดูเพิ่มเติม
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}