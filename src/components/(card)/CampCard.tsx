"use client";

import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers } from "react-icons/fa";
import { Review } from "@/types/camp";

import Link from "next/link";

export interface CampData {
    id: string;
    name: string;
    image: string;
    date: string;
    location: string;
    price: string;
    deadline: string;
    daysLeft: number;
    description: string;
    category: string;
    avgRating?: number;
    reviews?: Review[];
    capacity?: number;
    enrolled?: number;
}

interface CampCardProps {
    camp: CampData;
    variant?: "compact" | "detailed";
    className?: string;
}

export default function CampCard({ camp, variant = "compact", className = "" }: CampCardProps) {
    
    if (variant === "detailed") {
        return (
            <Link href={`/camps/${camp.id}`} className="block">
                <Card
                    isPressable
                    className={`w-full bg-white dark:bg-[#1a1a1a] backdrop-blur-md border-2 border-zinc-200 dark:border-zinc-800 hover:border-[#F2B33D] hover:shadow-xl hover:shadow-[#F2B33D]/20 transition-all duration-300 hover:-translate-y-1 ${className}`}
                >
                    <CardBody className="p-0 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-0">
                            {/* Image Section - ลดขนาด */}
                            <div className="relative col-span-4 h-[200px] md:h-full overflow-hidden group">
                                <div
                                    className="w-full h-full bg-cover bg-center"
                                    style={{ backgroundImage: `url(${camp.image})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/80 via-transparent to-transparent" />

                                {/* Category Badge */}
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className="absolute top-3 left-3 bg-[#F2B33D] backdrop-blur-sm font-bold shadow-lg"
                                    classNames={{
                                        content: "text-[#2C2C2C] text-xs"
                                    }}
                                >
                                    {camp.category}
                                </Chip>

                                {/* Deadline Badge */}
                                {camp.daysLeft <= 2 && (
                                    <Chip
                                        size="sm"
                                        variant="solid"
                                        className="absolute top-3 right-3 font-semibold bg-red-500 text-white animate-pulse shadow-lg text-xs"
                                    >
                                        ปิดรับเร็วๆนี้
                                    </Chip>
                                )}
                            </div>

                            {/* Content Section - กระทัดรัด */}
                            <div className="col-span-3 p-4 md:p-5 flex flex-col justify-between bg-gradient-to-br from-white to-zinc-50 dark:from-[#1a1a1a] dark:to-[#2C2C2C]">
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-[#2C2C2C] dark:text-white mb-2 line-clamp-2 hover:text-[#F2B33D] transition-colors">
                                        {camp.name}
                                    </h3>

                                    <p className="text-zinc-700 dark:text-zinc-300 mb-3 line-clamp-2 leading-relaxed text-sm">
                                        {camp.description}
                                    </p>

                                    {/* Info - Compact */}
                                    <div className="flex flex-wrap items-center gap-3 mb-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#F2B33D] to-[#FFD700] flex items-center justify-center">
                                                <FaCalendarAlt className="text-[#2C2C2C]" size={11} />
                                            </div>
                                            <span className="text-xs font-medium text-[#2C2C2C] dark:text-white">{camp.date}</span>
                                        </div>

                                        <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700" />

                                        <div className="flex items-center gap-1.5">
                                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#F2B33D] to-[#FFD700] flex items-center justify-center">
                                                <FaMapMarkerAlt className="text-[#2C2C2C]" size={11} />
                                            </div>
                                            <span className="text-xs font-medium text-[#2C2C2C] dark:text-white">{camp.location}</span>
                                        </div>

                                        <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700" />

                                        <div className="flex items-center gap-1.5">
                                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                                                <FaClock className="text-white" size={11} />
                                            </div>
                                            <span className="text-xs font-medium text-red-600 dark:text-red-400">หมดเขต: {camp.deadline}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Section - เล็กลง */}
                                <div className="flex items-center justify-between pt-2">
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-0.5">ราคา</p>
                                        <p className="text-2xl md:text-3xl font-black bg-gradient-to-r from-[#F2B33D] to-[#FFD700] bg-clip-text text-transparent">
                                            {camp.price === '฿0' ? 'ฟรี' : camp.price}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Link>

        );
    }
    

    // Compact Card - Inspired by design image
    return (
        <div className="w-full">
            <Link href={`/camps/${camp.id}`} className="block w-full">
                <Card
                    isPressable
                    className={`group w-full overflow-hidden bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 hover:border-[#F2B33D] hover:shadow-xl hover:shadow-[#F2B33D]/10 transition-all duration-300 ${className}`}
                >
                    <CardBody className="p-0">
                        {/* Image Section */}
                        <div className="relative h-60 overflow-hidden">
                            <div
                                className="w-full h-full bg-cover bg-center transition-transform duration-500"
                                style={{ backgroundImage: `url(${camp.image})` }}
                            />
                            {/* Gradient overlay */}
                            {/* <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/30" /> */}
                            
                            {/* Category Badge - Top Left */}
                            <Chip
                                size="sm"
                                variant="solid"
                                className="absolute top-3 left-3 bg-[#F2B33D] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                                classNames={{
                                    content: "text-[#2C2C2C] text-xs px-2.5 py-0.5 font-extrabold"
                                }}
                            >
                                {camp.category}
                            </Chip>

                            {/* Deadline Badge - Top Right */}
                            {camp.daysLeft > 0 && (
                                <Chip
                                    size="sm"
                                    variant="solid"
                                    className={`absolute top-3 right-3 font-medium shadow-[0_4px_12px_rgba(0,0,0,0.4)] ${
                                        camp.daysLeft <= 3 
                                            ? 'bg-red-600 text-white animate-pulse' 
                                            : 'bg-[#ffffff] text-[#2C2C2C]'
                                    }`}
                                    classNames={{
                                        content: "text-xs px-2.5 py-0.5 flex items-center gap-1.5 font-medium"
                                    }}
                                >
                                    <FaClock size={10} />
                                    หมดเขตใน {camp.daysLeft} วัน
                                </Chip>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="p-4 space-y-3">
                            {/* Title */}
                            <h3 className="text-lg font-bold text-[#2C2C2C] dark:text-white line-clamp-2 leading-snug group-hover:text-[#F2B33D] transition-colors">
                                {camp.name}
                            </h3>

                            {/* 2 Column Layout: Date/Location | Reviews/Seats */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Left Column: Date & Location */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                        <FaCalendarAlt size={12} className="text-[#F2B33D] flex-shrink-0" />
                                        <span className="text-sm font-medium">{camp.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                        <FaMapMarkerAlt size={12} className="text-[#F2B33D] flex-shrink-0" />
                                        <span className="text-sm font-medium">{camp.location}</span>
                                    </div>
                                </div>

                                {/* Right Column: Seats & Price */}
                                <div className="space-y-2">
                                    {/* Available Seats */}
                                    {camp.capacity !== undefined && camp.enrolled !== undefined ? (
                                        <div className="flex items-center gap-2 justify-end">
                                            <FaUsers className="text-[#F97316] flex-shrink-0" size={12} />
                                            <span className="text-sm font-medium text-[#2C2C2C] dark:text-white">
                                                เหลือ {camp.capacity - camp.enrolled} ที่
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 justify-end">
                                            <FaUsers className="text-zinc-400" size={12} />
                                            <span className="text-sm text-zinc-400">ไม่ระบุ</span>
                                        </div>
                                    )}

                                    {/* Price */}
                                    <div className="flex items-center gap-2 justify-end">
                                        <span className="text-base font-bold text-[#F2B33D]">
                                            {camp.price === '฿0' ? 'ฟรี' : camp.price}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Link>
        </div>
    );
}
