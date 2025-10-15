"use client";

import React, { useState } from 'react';

interface LocationMapProps {
    location: string;
    className?: string;
    height?: string;
}

/**
 * LocationMap component - แสดงแผนที่ตามสถานที่ที่กำหนด
 * ใช้ Google Maps Search โดยไม่ต้อง API key
 */
export default function LocationMap({ location, className = "", height = "h-64" }: LocationMapProps) {
    const [mapError, setMapError] = useState(false);
    
    // สร้าง Google Maps search URL
    const googleMapsSearchUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    
    // สร้างลิงก์เปิด Google Maps แอป
    const openInMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

    if (mapError) {
        return (
            <div className={`${height} ${className} rounded-2xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-6`}>
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        ไม่สามารถโหลดแผนที่ได้
                    </p>
                    <a
                        href={openInMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        เปิดใน Google Maps
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className={`${height} ${className} rounded-2xl overflow-hidden shadow-lg relative group`}>
            {/* แผนที่ */}
            <iframe
                src={googleMapsSearchUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`แผนที่แสดงตำแหน่ง ${location}`}
                onError={() => setMapError(true)}
            />
            
            {/* ปุ่มเปิดใน Google Maps (แสดงตอน hover) */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <a
                    href={openInMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg shadow-lg hover:shadow-xl transition-all text-sm font-medium"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    เปิดใน Maps
                </a>
            </div>
        </div>
    );
}
