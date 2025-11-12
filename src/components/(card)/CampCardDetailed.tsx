"use client";

import React from "react";
import { Card, CardBody } from "@heroui/react";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaArrowRight } from "react-icons/fa";
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

interface CampCardDetailedProps {
    camp: CampData;
    className?: string;
}

export default function CampCardDetailed({ camp, className = "" }: CampCardDetailedProps) {
    const isFree = camp.price === '฿0';

    // Format date
    const formatDate = (dateStr: string) => {
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

        if (dateStr.includes(' - ')) {
            let result = dateStr;
            for (const [thai, num] of Object.entries(monthMap)) {
                result = result.replace(new RegExp(`(\\d+)\\s*${thai}`, 'g'), `$1/${num}`);
            }
            result = result.replace(/\s*25?\d{2,3}\s*/g, '').replace(/\s+/g, '');
            return result;
        }

        for (const [thai, num] of Object.entries(monthMap)) {
            if (dateStr.includes(thai)) {
                const dayPart = dateStr.split(thai)[0].trim();
                return `${dayPart}/${num}`;
            }
        }
        
        return dateStr;
    };

    return (
        <Link href={`/camps/${camp.id}`} className="block group h-full">
            <Card
                isPressable
                className={`relative w-full h-full bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-black border-4 border-gray-900 dark:border-gray-700 hover:border-[#FF6B00] transition-all duration-300 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-[12px_12px_0px_0px_rgba(255,107,0,1)] dark:hover:shadow-[0_0_50px_rgba(255,107,0,0.7)] hover:-translate-x-1 hover:-translate-y-1 overflow-hidden ${className}`}
            >
                <CardBody className="p-0 h-full">
                    {/* Horizontal Layout: Image (40%) | Content (60%) */}
                    <div className="grid grid-cols-5 h-full min-h-[280px]">
                        {/* LEFT: Image Section */}
                        <div className="col-span-2 relative overflow-hidden">
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${camp.image})` }}
                            />
                            
                            {/* Dark Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                            {/* Price - Bottom */}
                            <div className="absolute bottom-4 left-4 right-4 z-10">
                                <div className="bg-gradient-to-r from-[#FF6B00] to-[#FFB800] border-3 border-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <p className="text-[10px] text-white/90 font-bold tracking-wider mb-1">PRICE</p>
                                    <p className="text-3xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                        {isFree ? 'FREE' : camp.price}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Content Section */}
                        <div className="col-span-3 p-5 bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 flex flex-col">
                            {/* Category Badge */}
                            <div className="mb-3">
                                <div className="inline-block bg-[#FF6B00] border-2 border-gray-900 dark:border-white px-3 py-1">
                                    <span className="text-black font-black text-xs tracking-wider uppercase">
                                        {camp.category}
                                    </span>
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-3 line-clamp-2 group-hover:text-[#FF6B00] transition-colors">
                                {camp.name}
                            </h3>

                            {/* Description - FOCAL POINT */}
                            <div className="mb-4 flex-1">
                                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4 font-medium">
                                    {camp.description}
                                </p>
                            </div>

                            {/* Info Row - Compact */}
                            <div className="flex items-center gap-4 mb-4 flex-wrap">
                                {/* Date */}
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#FF6B00] flex items-center justify-center">
                                        <FaCalendarAlt className="text-white" size={12} />
                                    </div>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">
                                        {formatDate(camp.date)}
                                    </span>
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#FFB800] flex items-center justify-center">
                                        <FaMapMarkerAlt className="text-black" size={12} />
                                    </div>
                                    <span className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[150px]">
                                        {camp.location}
                                    </span>
                                </div>

                                {/* Deadline */}
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-red-600 flex items-center justify-center">
                                        <FaClock className="text-white" size={12} />
                                    </div>
                                    <span className="text-sm font-black text-red-600 dark:text-red-400">
                                        {formatDate(camp.deadline)}
                                    </span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="bg-black dark:bg-gray-950 border-3 border-[#FF6B00] p-3 hover:bg-[#FF6B00] transition-all">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-[#FF6B00] group-hover:text-black tracking-wider">
                                        VIEW DETAILS
                                    </span>
                                    <FaArrowRight className="text-[#FF6B00] group-hover:text-black" size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Link>
    );
}
