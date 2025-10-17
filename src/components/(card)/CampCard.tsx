"use client";

import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock } from "react-icons/fa";

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
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                            {/* Image Section - ลดขนาด */}
                            <div className="relative col-span-2 h-[200px] md:h-full overflow-hidden group">
                                <div
                                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
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

    // Compact Card - Mobile Optimized
    return (
        <div className="w-full h-[320px] sm:h-[380px]">
            <Link href={`/camps/${camp.id}`} className="block w-full h-full">
                <Card
                    isPressable
                    className={`group relative w-full h-full overflow-hidden bg-white dark:bg-[#2C2C2C] border-2 border-zinc-200 dark:border-zinc-800 hover:border-[#F2B33D] transition-all duration-300 ${className}`}
                >
                    <CardBody className="p-0 overflow-hidden">
                        {/* Background Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${camp.image})` }}
                        />

                        {/* Overlays - Mobile แสดง dark overlay ค้างไว้ */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/95 via-[#2C2C2C]/50 to-transparent md:via-[#2C2C2C]/40" />
                        <div className="absolute inset-0 bg-[#2C2C2C]/60 md:bg-[#2C2C2C]/0 md:group-hover:bg-[#2C2C2C]/70 transition-all duration-300 backdrop-blur-[2px] md:backdrop-brightness-70 md:group-hover:backdrop-blur-sm z-10" />
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F2B33D] to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-20" />

                        {/* Badges - Mobile Optimized */}
                        <Chip
                            size="sm"
                            variant="flat"
                            className="absolute top-2 left-2 z-30 bg-[#F2B33D] backdrop-blur-sm font-bold shadow-lg"
                            classNames={{
                                content: "text-[#2C2C2C] text-[10px] px-1"
                            }}
                        >
                            {camp.category}
                        </Chip>

                        {camp.daysLeft <= 2 && (
                            <Chip
                                size="sm"
                                variant="solid"
                                className="absolute top-2 right-2 z-30 font-semibold bg-red-500 text-white animate-pulse shadow-lg"
                                classNames={{
                                    content: "text-[10px] px-1"
                                }}
                            >
                                เหลือ {camp.daysLeft} วัน
                            </Chip>
                        )}

                        {/* Content - Mobile: แสดง hover state ค้างไว้ */}
                        <div className="md:hidden absolute inset-0 p-3 sm:p-4 z-20 flex flex-col justify-center">
                            <div className="space-y-2">
                                <h3 className="text-base font-bold text-white drop-shadow-lg line-clamp-2 leading-tight">
                                    {camp.name}
                                </h3>

                                <p className="text-white/90 text-[11px] line-clamp-2 leading-relaxed drop-shadow">
                                    {camp.description}
                                </p>

                                <div className="space-y-1.5 pt-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                                            <div className="w-5 h-5 rounded-md bg-[#F2B33D] flex items-center justify-center flex-shrink-0">
                                                <FaCalendarAlt size={9} className="text-[#2C2C2C]" />
                                            </div>
                                            <span className="text-[10px] font-medium text-white truncate">{camp.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                                            <div className="w-5 h-5 rounded-md bg-[#F2B33D] flex items-center justify-center flex-shrink-0">
                                                <FaMapMarkerAlt size={9} className="text-[#2C2C2C]" />
                                            </div>
                                            <span className="text-[10px] font-medium text-white truncate">{camp.location}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 p-1 rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-500/30">
                                        <div className="w-5 h-5 rounded-md bg-red-500 flex items-center justify-center flex-shrink-0">
                                            <FaClock size={9} className="text-white" />
                                        </div>
                                        <span className="text-[10px] font-medium text-white truncate">หมดเขต: {camp.deadline}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t-2 border-[#F2B33D]/50">
                                    <span className="text-white font-medium text-xs">ราคา</span>
                                    <span className="text-xl font-black text-[#F2B33D] drop-shadow-[0_0_10px_rgba(242,179,61,0.5)]">
                                        {camp.price}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content - Desktop (ไม่ hover): แสดงแบบเดิม (ด้านล่าง) */}
                        <div className="hidden md:block absolute inset-x-0 bottom-0 p-5 z-20 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 drop-shadow-lg leading-tight">
                                {camp.name}
                            </h3>

                            <div className="space-y-1.5 mb-3">
                                <div className="flex items-center gap-2 text-white/95">
                                    <div className="w-5 h-5 rounded-md bg-[#F2B33D] flex items-center justify-center flex-shrink-0">
                                        <FaCalendarAlt size={10} className="text-[#2C2C2C]" />
                                    </div>
                                    <span className="text-xs font-medium drop-shadow">{camp.date}</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/95">
                                    <div className="w-5 h-5 rounded-md bg-[#F2B33D] flex items-center justify-center flex-shrink-0">
                                        <FaMapMarkerAlt size={10} className="text-[#2C2C2C]" />
                                    </div>
                                    <span className="text-xs font-medium drop-shadow">{camp.location}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/20">
                                <span className="text-white/90 text-xs font-medium">ราคา</span>
                                <span className="text-xl font-black text-[#F2B33D] drop-shadow-lg">{camp.price}</span>
                            </div>
                        </div>

                        {/* Hover Details - Desktop only (แสดงเมื่อ hover) */}
                        <div className="hidden md:flex absolute inset-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                            <div className="flex flex-col justify-center h-full space-y-3">
                                <h3 className="text-xl font-bold text-white drop-shadow-lg line-clamp-2">
                                    {camp.name}
                                </h3>

                                <p className="text-white/90 text-sm line-clamp-3 leading-relaxed drop-shadow">
                                    {camp.description}
                                </p>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                                            <div className="w-6 h-6 rounded-md bg-[#F2B33D] flex items-center justify-center flex-shrink-0">
                                                <FaCalendarAlt size={11} className="text-[#2C2C2C]" />
                                            </div>
                                            <span className="text-xs font-medium text-white">{camp.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                                            <div className="w-6 h-6 rounded-md bg-[#F2B33D] flex items-center justify-center flex-shrink-0">
                                                <FaMapMarkerAlt size={11} className="text-[#2C2C2C]" />
                                            </div>
                                            <span className="text-xs font-medium text-white">{camp.location}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-500/30">
                                        <div className="w-6 h-6 rounded-md bg-red-500 flex items-center justify-center flex-shrink-0">
                                            <FaClock size={11} className="text-white" />
                                        </div>
                                        <span className="text-xs font-medium text-white">หมดเขต: {camp.deadline}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t-2 border-[#F2B33D]/50">
                                    <span className="text-white font-medium text-sm">ราคา</span>
                                    <span className="text-2xl font-black text-[#F2B33D] drop-shadow-[0_0_10px_rgba(242,179,61,0.5)]">
                                        {camp.price}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Link>
        </div>
    );
}
