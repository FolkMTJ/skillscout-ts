"use client";

import Image from "next/image";
import { useRouter } from "next/navigation"; // 👈 1. Import useRouter สำหรับปุ่มย้อนกลับ
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaArrowLeft } from "react-icons/fa";
import { Chip } from "@heroui/react";
import type { CampData } from "@/lib/db";

interface CampDetailViewProps {
    camp: CampData;
}

export default function CampDetailView({ camp }: CampDetailViewProps) {
    const router = useRouter(); // 👈 2. สร้าง instance ของ router

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-5">

                        {/* Image Section (ปรับแก้เล็กน้อย) */}
                        <div className="relative md:col-span-2 h-64 md:h-full min-h-[400px]">
                            <Image
                                src={camp.image}
                                alt={camp.name}
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="(max-width: 768px) 100vw, 40vw"
                            />
                        </div>

                        {/* Details Section (ปรับแก้ทั้งหมด) */}
                        <div className="md:col-span-3 p-8 md:p-10 flex flex-col">

                            {/* Header: ปุ่มย้อนกลับ และป้ายหมวดหมู่ */}
                            <div className="flex justify-between items-center mb-6">
                                <button
                                    onClick={() => router.back()}
                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <FaArrowLeft />
                                    ย้อนกลับ
                                </button>
                                <Chip
                                    size="md"
                                    variant="flat"
                                    className="bg-[#F2B33D] font-bold"
                                    classNames={{ content: "text-[#2C2C2C]" }}
                                >
                                    {camp.category}
                                </Chip>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                                {camp.name}
                            </h1>

                            {/* Details (Date, Location, Price) */}
                            <div className="space-y-3 mt-auto pt-3 dark:border-gray-700">
                                <div className="flex items-center gap-4 text-gray-800 dark:text-gray-200">
                                    <FaCalendarAlt className="text-xl text-[#F2B33D]" />
                                    <span className="font-semibold text-lg">{camp.date}</span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-800 dark:text-gray-200">
                                    <FaMapMarkerAlt className="text-xl text-[#F2B33D]" />
                                    <span className="font-semibold text-lg">{camp.location}</span>
                                </div>
                                <div className="flex items-center gap-4 text-red-500 dark:text-red-400">
                                    <FaClock className="text-xl" />
                                    <span className="font-semibold text-lg">ปิดรับสมัคร: {camp.deadline}</span>
                                </div>
                                {/* Organizers Section */}
                                {camp.organizers && camp.organizers.length > 0 && (
                                    <div className="mt-8">
                                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">ผู้จัดค่าย</h2>
                                        <div className="flex items-center gap-4 mt-3">
                                            {camp.organizers.map((organizer) => (
                                                <div key={organizer.name} className="flex flex-col items-center gap-2">
                                                    <div className="relative w-16 h-16">
                                                        <Image
                                                            src={organizer.imageUrl}
                                                            alt={organizer.name}
                                                            fill
                                                            className="rounded-full object-cover"
                                                            sizes="64px"
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        {organizer.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-6">
                                    <p className="text-5xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                        {camp.price}
                                    </p>
                                    <button className="px-8 py-4 bg-[#F2B33D] text-gray-900 font-bold text-lg rounded-xl shadow-lg hover:bg-amber-500 transition-all duration-300 transform hover:-translate-y-1">
                                        สมัครเข้าร่วม
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}