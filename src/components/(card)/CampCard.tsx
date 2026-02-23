"use client";

import React, { useState } from "react";
import { Card, CardBody } from "@heroui/react";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaBookmark, FaRegBookmark } from "react-icons/fa";
import { Review } from "@/types/camp";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";

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
    initialBookmarked?: boolean;
}

interface CampCardProps {
    camp: CampData;
    variant?: "compact" | "detailed";
    className?: string;
}

export default function CampCard({ camp, variant = "compact", className = "" }: CampCardProps) {
    const { data: session } = useSession();
    const [bookmarked, setBookmarked] = useState(camp.initialBookmarked ?? false);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);

    const handleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session?.user) {
            toast.error('กรุณาเข้าสู่ระบบก่อน');
            return;
        }

        setBookmarkLoading(true);
        try {
            const res = await fetch('/api/user/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campId: camp.id }),
            });
            const data = await res.json() as { bookmarked: boolean };
            setBookmarked(data.bookmarked);
            toast.success(data.bookmarked ? 'บันทึกแล้ว' : 'ยกเลิก Bookmark แล้ว');
        } catch {
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setBookmarkLoading(false);
        }
    };
    
    if (variant === "detailed") {
        return (
            <Link href={`/camps/${camp.id}`} className="block">
                <Card
                    isPressable
                    className={`group w-full overflow-hidden rounded-2xl hover:shadow-2xl hover:shadow-[#F2B33D]/20 hover:-translate-y-1 transition-all duration-300 ${className}`}
                >
                    <CardBody className="p-0">
                        {/* Full-image 16:9 */}
                        <div className="relative w-full aspect-video overflow-hidden">
                            {/* รูปพื้นหลัง */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                style={{ backgroundImage: `url(${camp.image})` }}
                            />

                            {/* Gradient overlay — เข้มด้านล่างสำหรับอ่านข้อความ */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

                            {/* ── TOP ROW ── */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                {/* Category — ซ้ายบน */}
                                <span className="bg-[#F2B33D] text-[#1a1a1a] text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">
                                    {camp.category}
                                </span>

                                {/* หมดเขตในกี่วัน — ขวาบน */}
                                {camp.daysLeft > 0 ? (
                                    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full shadow-lg ${
                                        camp.daysLeft <= 3
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-white/90 text-[#1a1a1a]'
                                    }`}>
                                        <FaClock size={10} />
                                        หมดเขตใน {camp.daysLeft} วัน
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-red-600 text-white shadow-lg">
                                        <FaClock size={10} />
                                        ปิดรับสมัครแล้ว
                                    </span>
                                )}
                            </div>

                            {/* Bookmark — บนขวาซ้อนกับ daysLeft ไม่ได้ → วางใต้ row บน */}
                            <div
                                role="button"
                                aria-label={bookmarked ? 'ยกเลิก Bookmark' : 'Bookmark ค่าย'}
                                onClick={handleBookmark}
                                aria-disabled={bookmarkLoading}
                                className="absolute top-10 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-all z-10 cursor-pointer select-none"
                            >
                                {bookmarked
                                    ? <FaBookmark className="text-[#F2B33D] text-sm" />
                                    : <FaRegBookmark className="text-white text-sm" />
                                }
                            </div>

                            {/* ── BOTTOM ROW ── */}
                            <div className="absolute bottom-3 left-3 right-3">
                                {/* ชื่อค่าย */}
                                <h3 className="text-white font-bold text-base md:text-lg leading-snug line-clamp-1 mb-2 drop-shadow-md">
                                    {camp.name}
                                </h3>

                                <div className="flex items-center justify-between">
                                    {/* สถานที่ — ซ้ายล่าง */}
                                    <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full max-w-[55%] truncate">
                                        <FaMapMarkerAlt size={10} className="text-[#F2B33D] flex-shrink-0" />
                                        <span className="truncate">{camp.location}</span>
                                    </span>

                                    {/* ราคา — ขวาล่าง */}
                                    <span className="bg-[#F2B33D] text-[#1a1a1a] text-sm font-black px-3 py-1 rounded-full shadow-lg">
                                        {camp.price === '฿0' ? 'ฟรี' : camp.price}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Link>
        );
    }

    // Compact Card — classic style (used in CampCarousel)
    return (
        <div className="w-full">
            <Link href={`/camps/${camp.id}`} className="block w-full">
                <Card
                    isPressable
                    className={`group w-full overflow-hidden bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 hover:border-[#F2B33D] hover:shadow-xl hover:shadow-[#F2B33D]/10 transition-all duration-300 ${className}`}
                >
                    <CardBody className="p-0">
                        {/* Image 16:9 */}
                        <div className="relative w-full aspect-video overflow-hidden">
                            <div
                                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                style={{ backgroundImage: `url(${camp.image})` }}
                            />
                            <span className="absolute top-3 left-3 bg-[#F2B33D] text-[#1a1a1a] text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">
                                {camp.category}
                            </span>
                            <div
                                role="button"
                                aria-label={bookmarked ? 'ยกเลิก Bookmark' : 'Bookmark ค่าย'}
                                onClick={handleBookmark}
                                aria-disabled={bookmarkLoading}
                                className="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-black/70 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all z-10 cursor-pointer select-none"
                            >
                                {bookmarked
                                    ? <FaBookmark className="text-[#F2B33D] text-sm" />
                                    : <FaRegBookmark className="text-gray-500 text-sm" />
                                }
                            </div>
                            {camp.daysLeft > 0 && (
                                <span className={`absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shadow-lg ${
                                    camp.daysLeft <= 3 ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-[#1a1a1a]'
                                }`}>
                                    <FaClock size={10} />
                                    หมดเขตใน {camp.daysLeft} วัน
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            <h3 className="text-lg font-bold text-[#2C2C2C] dark:text-white line-clamp-2 leading-snug group-hover:text-[#F2B33D] transition-colors">
                                {camp.name}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                        <FaCalendarAlt size={12} className="text-[#F2B33D] flex-shrink-0" />
                                        <span className="text-sm font-medium">{camp.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                        <FaMapMarkerAlt size={12} className="text-[#F2B33D] flex-shrink-0" />
                                        <span className="text-sm font-medium truncate">{camp.location}</span>
                                    </div>
                                </div>
                                <div className="space-y-2 text-right">
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
                                    <span className="text-base font-bold text-[#F2B33D]">
                                        {camp.price === '฿0' ? 'ฟรี' : camp.price}
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
