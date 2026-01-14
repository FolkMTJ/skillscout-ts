"use client";

import React from "react";
import { Button } from "@heroui/react";
import { FaSearch, FaChevronRight } from "react-icons/fa";


export default function HeroBanner() {
    return (
        <section className="relative w-full h-[300px] md:h-[500px] overflow-hidden">
            {/* 1. Background สีเหลือง */}
            <div className="absolute inset-0 bg-[#F2B33D]" />

            {/* 2. Decorative Logo Overlay (รูปนกสีขาว) */}

            {/* Original */}
            {/* <div
                className="absolute right-[10%] top-[-5%] w-[60%] h-[120%] bg-contain bg-no-repeat bg-right opacity-100 pointer-events-none hidden md:block"
                style={{ backgroundImage: "url('/logo-banner.png')" }}
            /> */}

            {/* Format */}
            <div
                className="absolute right-[10%] top-[10%] w-[60%] h-[80%] bg-contain bg-no-repeat bg-right opacity-100 pointer-events-none hidden md:block"
                style={{ backgroundImage: "url('/logo-banner.png')" }}
            />

            {/* 3. Content */}
            <div className="container mx-auto px-6 h-full relative z-10 flex items-center">
                <div className="max-w-3xl">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full mb-6 border border-white/30">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">New Opportunities</span>
                    </div>

                    {/* Heading */}
                    <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter mb-2 drop-shadow-sm">
                        SKILL <span className="text-[#2C2C2C] not-italic">SCOUT</span>
                    </h1>

                    <p className="text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-2 leading-tight drop-shadow-sm">
                        ก้าวแรกสู่ความสำเร็จในแบบของคุณ
                    </p>
                    <p className="text-lg md:text-xl font-medium text-white/90 mb-8 italic drop-shadow-md">
                        ค้นหาศักยภาพที่ซ่อนอยู่ผ่านค่ายกิจกรรมทั่วกรุงเทพ
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <Button
                            href="/allcamps"
                            size="lg"
                            className="bg-[#2C2C2C] text-white font-black px-10 rounded-2xl h-16 text-lg shadow-2xl hover:bg-black transition-all group"
                            startContent={<FaSearch className="group-hover:scale-110 transition-transform" />}
                        >
                            ค้นหาค่ายกิจกรรม
                        </Button>

                        <Button
                            href="/path-finder"
                            variant="light"
                            size="lg"
                            className="text-[#2C2C2C] font-black text-lg group h-16"
                            endContent={<FaChevronRight className="group-hover:translate-x-1 transition-transform" />}
                        >
                            ทำแบบทดสอบ
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
