"use client";

import React from "react";
import { Card, CardBody, Chip, Badge } from "@heroui/react";
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
                    className={`w-full bg-white dark:bg-[#1a1a1a] backdrop-blur-md border-2 border-zinc-200 dark:border-zinc-800 hover:border-[#F2B33D] hover:shadow-2xl hover:shadow-[#F2B33D]/20 transition-all duration-300 hover:-translate-y-1 ${className}`}
                >
                    <CardBody className="p-0 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                            {/* Image Section */}
                            <div className="relative col-span-2 h-[280px] md:h-full overflow-hidden group">
                                <div
                                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${camp.image})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/80 via-transparent to-transparent" />

                                {/* Animated corner accent */}
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#F2B33D]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Category Badge */}
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className="absolute top-4 left-4 bg-[#F2B33D] backdrop-blur-sm font-bold shadow-lg"
                                    classNames={{
                                        content: "text-[#2C2C2C]"
                                    }}
                                >
                                    {camp.category}
                                </Chip>

                                {/* Deadline Badge */}
                                {camp.daysLeft <= 2 && (
                                    <Badge
                                        content={`${camp.daysLeft} วัน`}
                                        color="danger"
                                        placement="top-right"
                                        className="absolute top-4 right-4"
                                        classNames={{
                                            badge: "text-xs font-bold px-2 py-1 bg-red-500 animate-pulse"
                                        }}
                                    >
                                        <Chip
                                            size="sm"
                                            variant="solid"
                                            className="font-semibold bg-red-500 text-white"
                                        >
                                            ปิดรับเร็วๆนี้
                                        </Chip>
                                    </Badge>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="col-span-3 p-6 md:p-8 flex flex-col justify-between bg-gradient-to-br from-white to-zinc-50 dark:from-[#1a1a1a] dark:to-[#2C2C2C]">
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] dark:text-white mb-3 line-clamp-2 hover:text-[#F2B33D] transition-colors">
                                        {camp.name}
                                    </h3>

                                    <p className="text-zinc-700 dark:text-zinc-300 mb-5 line-clamp-3 leading-relaxed text-base">
                                        {camp.description}
                                    </p>

                                    {/* Info - Compact Single Line */}
                                    <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F2B33D] to-[#FFD700] flex items-center justify-center">
                                                <FaCalendarAlt className="text-[#2C2C2C]" size={14} />
                                            </div>
                                            <span className="text-sm font-medium text-[#2C2C2C] dark:text-white">{camp.date}</span>
                                        </div>

                                        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700" />

                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F2B33D] to-[#FFD700] flex items-center justify-center">
                                                <FaMapMarkerAlt className="text-[#2C2C2C]" size={14} />
                                            </div>
                                            <span className="text-sm font-medium text-[#2C2C2C] dark:text-white">{camp.location}</span>
                                        </div>

                                        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700" />

                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                                                <FaClock className="text-white" size={14} />
                                            </div>
                                            <span className="text-sm font-medium text-red-600 dark:text-red-400">หมดเขต: {camp.deadline}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Section */}
                                <div className="flex items-center justify-between pt-4">
                                    <div>
                                        <p className="text-sm text-zinc-500 mb-1">ราคา</p>
                                        <p className="text-4xl font-black bg-gradient-to-r from-[#F2B33D] to-[#FFD700] bg-clip-text text-transparent">
                                            {camp.price}
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

    // Compact Card with Hover Effect
    return (
        <div className="w-full h-[450px] p-1">
            <Link href={`/camps/${camp.id}`} className="block w-full h-[450px] p-1">
                <Card
                    isPressable
                    className={`group relative w-full h-full overflow-hidden bg-white dark:bg-[#2C2C2C] border-2 border-zinc-200 dark:border-zinc-800 hover:border-[#F2B33D] transition-all duration-300${className}`}
                >
                    <CardBody className="p-0 overflow-hidden">
                        {/* Background Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${camp.image})` }}
                        />

                        {/* Base Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/90 via-[#2C2C2C]/30 to-transparent" />

                        {/* Hover Overlay - Black BG with 70% opacity */}
                        <div className="absolute inset-0 bg-[#2C2C2C]/0 group-hover:bg-[#2C2C2C]/70 transition-all duration-300 backdrop-blur-[2px] group-hover:backdrop-blur-sm z-10" />

                        {/* Yellow accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F2B33D] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

                        {/* Category Badge */}
                        <Chip
                            size="sm"
                            variant="flat"
                            className="absolute top-4 left-4 z-30 bg-[#F2B33D] backdrop-blur-sm font-bold shadow-lg"
                            classNames={{
                                content: "text-[#2C2C2C]"
                            }}
                        >
                            {camp.category}
                        </Chip>

                        {/* Deadline Badge */}
                        {camp.daysLeft <= 2 && (
                            <Chip
                                size="sm"
                                variant="solid"
                                className="absolute top-4 right-4 z-30 font-semibold bg-red-500 text-white animate-pulse shadow-lg"
                            >
                                หมดเขตใน {camp.daysLeft} วัน
                            </Chip>
                        )}

                        {/* Content - Default State */}
                        <div className="absolute inset-x-0 bottom-0 p-6 z-20 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                            <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2 drop-shadow-lg">
                                {camp.name}
                            </h3>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-white/95">
                                    <div className="w-6 h-6 rounded-md bg-[#F2B33D] flex items-center justify-center">
                                        <FaCalendarAlt size={12} className="text-[#2C2C2C]" />
                                    </div>
                                    <span className="text-sm font-medium drop-shadow">{camp.date}</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/95">
                                    <div className="w-6 h-6 rounded-md bg-[#F2B33D] flex items-center justify-center">
                                        <FaMapMarkerAlt size={12} className="text-[#2C2C2C]" />
                                    </div>
                                    <span className="text-sm font-medium drop-shadow">{camp.location}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-white/20">
                                <span className="text-white/90 text-sm font-medium">ราคา</span>
                                <span className="text-2xl font-black text-[#F2B33D] drop-shadow-lg">{camp.price}</span>
                            </div>
                        </div>

                        {/* Hover Details - Full Info */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-white drop-shadow-lg line-clamp-2">
                                    {camp.name}
                                </h3>

                                <p className="text-white/90 text-sm line-clamp-3 leading-relaxed drop-shadow">
                                    {camp.description}
                                </p>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                                            <div className="w-8 h-8 rounded-md bg-[#F2B33D] flex items-center justify-center flex-shrink-0">
                                                <FaCalendarAlt size={14} className="text-[#2C2C2C]" />
                                            </div>
                                            <span className="text-sm font-medium text-white">{camp.date}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                                            <div className="w-8 h-8 rounded-md bg-[#F2B33D] flex items-center justify-center flex-shrink-0">
                                                <FaMapMarkerAlt size={14} className="text-[#2C2C2C]" />
                                            </div>
                                            <span className="text-sm font-medium text-white">{camp.location}</span>
                                        </div>

                                    </div>

                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-500/30">
                                        <div className="w-8 h-8 rounded-md bg-red-500 flex items-center justify-center flex-shrink-0">
                                            <FaClock size={14} className="text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-white">หมดเขต: {camp.deadline}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t-2 border-[#F2B33D]/50">
                                    <span className="text-white font-medium">ราคา</span>
                                    <span className="text-3xl font-black text-[#F2B33D] drop-shadow-[0_0_10px_rgba(242,179,61,0.5)]">
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