"use client";

import React from "react";
import { Card, CardBody } from "@heroui/react";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaArrowRight, FaBolt } from "react-icons/fa";
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

interface CampCardCompactProps {
    camp: CampData;
    className?: string;
}

export default function CampCardCompact({ camp, className = "" }: CampCardCompactProps) {
    const isUrgent = camp.daysLeft <= 3;
    const isFree = camp.price === '฿0';

    // Format date to be VERY short - DD/MM only
    const formatDate = (dateStr: string) => {
        // "31 ตุลาคม - 8 พฤศจิกายน 2567" -> "31/10-8/11"
        // "21-23 ธันวาคม 2568" -> "21-23/12"
        // "15 มกราคม 2568" -> "15/1"
        
        const monthMap: { [key: string]: string } = {
            'มกราคม': '1', 'ม.ค.': '1',
            'กุมภาพันธ์': '2', 'ก.พ.': '2',
            'มีนาคม': '3', 'มี.ค.': '3',
            'เมษายน': '4', 'เม.ย.': '4',
            'พฤษภาคม': '5', 'พ.ค.': '5',
            'มิถุนายน': '6', 'มิ.ย.': '6',
            'กรกฎาคม': '7', 'ก.ค.': '7',
            'สิงหาคม': '8', 'ส.ค.': '8',
            'กันยายน': '9', 'ก.ย.': '9',
            'ตุลาคม': '10', 'ต.ค.': '10',
            'พฤศจิกายน': '11', 'พ.ย.': '11',
            'ธันวาคม': '12', 'ธ.ค.': '12'
        };

        // Check for date range with different months: "31 ตุลาคม - 8 พฤศจิกายน"
        if (dateStr.includes(' - ')) {
            let result = dateStr;
            // Replace each month with its number
            for (const [thai, num] of Object.entries(monthMap)) {
                result = result.replace(new RegExp(`(\\d+)\\s*${thai}`, 'g'), `$1/${num}`);
            }
            // Remove year and extra spaces
            result = result.replace(/\s*25?\d{2,3}\s*/g, '').replace(/\s+/g, '');
            return result;
        }

        // Single date or same month range
        for (const [thai, num] of Object.entries(monthMap)) {
            if (dateStr.includes(thai)) {
                const dayPart = dateStr.split(thai)[0].trim();
                return `${dayPart}/${num}`;
            }
        }
        
        // If already in DD/MM format, return as is
        if (/^\d{1,2}(-\d{1,2})?\/\d{1,2}$/.test(dateStr)) {
            return dateStr;
        }
        
        return dateStr;
    };

    const formatDeadline = (deadlineStr: string) => {
        // Same as formatDate - DD/MM only
        const monthMap: { [key: string]: string } = {
            'มกราคม': '1', 'ม.ค.': '1',
            'กุมภาพันธ์': '2', 'ก.พ.': '2',
            'มีนาคม': '3', 'มี.ค.': '3',
            'เมษายน': '4', 'เม.ย.': '4',
            'พฤษภาคม': '5', 'พ.ค.': '5',
            'มิถุนายน': '6', 'มิ.ย.': '6',
            'กรกฎาคม': '7', 'ก.ค.': '7',
            'สิงหาคม': '8', 'ส.ค.': '8',
            'กันยายน': '9', 'ก.ย.': '9',
            'ตุลาคม': '10', 'ต.ค.': '10',
            'พฤศจิกายน': '11', 'พ.ย.': '11',
            'ธันวาคม': '12', 'ธ.ค.': '12'
        };

        // Check for date range with different months
        if (deadlineStr.includes(' - ')) {
            let result = deadlineStr;
            for (const [thai, num] of Object.entries(monthMap)) {
                result = result.replace(new RegExp(`(\\d+)\\s*${thai}`, 'g'), `$1/${num}`);
            }
            result = result.replace(/\s*25?\d{2,3}\s*/g, '').replace(/\s+/g, '');
            return result;
        }

        for (const [thai, num] of Object.entries(monthMap)) {
            if (deadlineStr.includes(thai)) {
                const dayPart = deadlineStr.split(thai)[0].trim();
                return `${dayPart}/${num}`;
            }
        }
        
        if (/^\d{1,2}(-\d{1,2})?\/\d{1,2}$/.test(deadlineStr)) {
            return deadlineStr;
        }
        
        return deadlineStr;
    };

    return (
        <div className={`w-full h-[380px] ${className}`}>
            <Link href={`/camps/${camp.id}`} className="block w-full h-full group">
                <Card
                    isPressable
                    className="relative w-full h-full overflow-hidden bg-black border-4 border-gray-900 dark:border-gray-700 hover:border-[#FF6B00] transition-all duration-300 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(255,107,0,1)] dark:hover:shadow-[0_0_50px_rgba(255,107,0,0.8)] hover:-translate-x-1 hover:-translate-y-1"
                >
                    <CardBody className="p-0 h-full relative overflow-hidden">
                        {/* Background Image - FULL SIZE */}
                        <div className="absolute inset-0 z-0">
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${camp.image})` }}
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 group-hover:from-black group-hover:via-black/85 group-hover:to-black/40 transition-all duration-500" />
                        </div>

                        {/* Top Badges - Always Visible */}
                        <div className="absolute top-3 left-3 right-3 z-30 flex items-start justify-between gap-2">
                            {/* Category Badge */}
                            <div className="relative flex-shrink-0">
                                <div className="absolute -inset-1 bg-[#FF6B00] blur-md opacity-60 dark:opacity-80" />
                                <div className="relative bg-[#FF6B00] border-2 border-white px-3 py-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                    <span className="text-black font-black text-xs tracking-wider uppercase">
                                        {camp.category}
                                    </span>
                                </div>
                            </div>

                            {/* Urgent Badge */}
                            {isUrgent && (
                                <div className="relative flex-shrink-0">
                                    <div className="absolute -inset-1 bg-red-600 blur-md opacity-80 animate-pulse" />
                                    <div className="relative bg-red-600 border-2 border-white px-2 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="flex items-center gap-1">
                                            <FaBolt className="text-white animate-pulse" size={10} />
                                            <span className="text-white font-black text-xs">{camp.daysLeft}D</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* STATE 1: Default - Title & Price Only */}
                        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 group-hover:opacity-0 group-hover:invisible transition-all duration-300">
                            {/* Title - Line Clamp 2 */}
                            <h3 className="text-xl font-black text-white mb-3 line-clamp-2 leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">
                                {camp.name}
                            </h3>

                            {/* Price Bar */}
                            <div className="bg-gradient-to-r from-[#FF6B00] to-[#FFB800] border-3 border-white p-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] text-white/90 font-bold tracking-wider mb-0.5">PRICE</p>
                                        <p className="text-2xl font-black text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] truncate">
                                            {isFree ? 'FREE' : camp.price}
                                        </p>
                                    </div>
                                    {isFree && (
                                        <div className="bg-white border-2 border-black px-2 py-0.5 ml-2 flex-shrink-0">
                                            <span className="text-black font-black text-[10px]">FREE</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* STATE 2: Hover - Full Details */}
                        <div className="absolute inset-0 z-20 px-4 pb-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col justify-end">
                            {/* Title - Line Clamp 2 */}
                            <div className="mb-2">
                                <h3 className="text-lg font-black leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)] line-clamp-2">
                                    <span className="text-white bg-gradient-to-r from-[#FF6B00] to-[#FFB800] bg-clip-text drop-shadow-none" style={{
                                        WebkitTextStroke: '0.5px rgba(255,255,255,0.3)'
                                    }}>
                                        {camp.name}
                                    </span>
                                </h3>
                            </div>

                            {/* Description - Fixed Height */}
                            <div className="mb-2 bg-black/70 backdrop-blur-md border-2 border-white/30 p-2 rounded-sm h-[90px] overflow-hidden">
                                <p className="text-small text-white font-medium leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,1)] line-clamp-3">
                                    {camp.description}
                                </p>
                            </div>

                            {/* Info Grid - Compact & Fixed */}
                            <div className="grid grid-cols-3 gap-1.5 mb-2">
                                {/* Date */}
                                <div className="bg-[#FF6B00]/90 border border-white/50 p-1.5 backdrop-blur-sm min-h-[50px] flex flex-col items-center justify-center">
                                    <FaCalendarAlt className="text-white mb-1" size={11} />
                                    <p className="text-[8px] text-white/80 font-bold tracking-wider mb-0.5">DATE</p>
                                    <p className="text-[14px] font-black text-white leading-tight text-center w-full px-0.5 line-clamp-2">{formatDate(camp.date)}</p>
                                </div>

                                {/* Location */}
                                <div className="bg-[#FFB800]/90 border border-white/50 p-1.5 backdrop-blur-sm min-h-[50px] flex flex-col items-center justify-center">
                                    <FaMapMarkerAlt className="text-black mb-1" size={11} />
                                    <p className="text-[8px] text-black/80 font-bold tracking-wider mb-0.5">LOCATION</p>
                                    <p className="text-[14px] font-black text-black leading-tight text-center w-full px-0.5 line-clamp-2">{camp.location}</p>
                                </div>

                                {/* Deadline */}
                                <div className="bg-red-600/90 border border-white/50 p-1.5 backdrop-blur-sm min-h-[50px] flex flex-col items-center justify-center">
                                    <FaClock className="text-white mb-1" size={11} />
                                    <p className="text-[8px] text-white/80 font-bold tracking-wider mb-0.5">DEADLINE</p>
                                    <p className="text-[14px] font-black text-white leading-tight text-center w-full px-0.5 line-clamp-2">{formatDeadline(camp.deadline)}</p>
                                </div>
                            </div>

                            {/* Bottom: Price + CTA */}
                            <div className="grid grid-cols-5 gap-2">
                                {/* Price */}
                                <div className="col-span-2 bg-gradient-to-r from-[#FF6B00] to-[#FFB800] border-2 border-white p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                                    <p className="text-[8px] text-white/80 font-bold tracking-wider mb-0.5">PRICE</p>
                                    <p className="text-lg font-black text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] truncate">
                                        {isFree ? 'FREE' : camp.price}
                                    </p>
                                </div>

                                {/* CTA Button */}
                                <div className="col-span-3 bg-white border-2 border-[#FF6B00] p-2 shadow-[3px_3px_0px_0px_rgba(255,107,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(255,107,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-black text-[#FF6B00] tracking-wider">
                                            VIEW
                                        </span>
                                        <FaArrowRight className="text-[#FF6B00]" size={14} />
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
