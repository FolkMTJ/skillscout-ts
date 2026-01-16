"use client";

import React from "react";
import { Button } from "@heroui/react";
import { FaSearch, FaChevronRight } from "react-icons/fa";

interface HeroBannerProps {
  badge?: string;
  title: string;
  titleHighlight?: string;
  subtitle: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  primaryButtonIcon?: React.ReactNode;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  showButtons?: boolean;
  children?: React.ReactNode;
  centered?: boolean; // เพิ่ม prop สำหรับจัด content ตรงกลาง
}

export default function HeroBanner({
  badge = "New Opportunities",
  title = "SKILL",
  titleHighlight = "SCOUT",
  subtitle = "ก้าวแรกสู่ความสำเร็จในแบบของคุณ",
  description = "ค้นหาศักยภาพที่ซ่อนอยู่ผ่านค่ายกิจกรรมทั่วกรุงเทพ",
  primaryButtonText = "ค้นหาค่ายกิจกรรม",
  primaryButtonHref = "/allcamps",
  primaryButtonIcon = <FaSearch />,
  secondaryButtonText = "ทำแบบทดสอบ",
  secondaryButtonHref = "/path-finder",
  showButtons = true,
  children,
  centered = false, // default ไม่จัดกลาง
}: HeroBannerProps) {
    return (
        <section className="relative w-full h-[300px] md:h-[500px] overflow-hidden">
            {/* 1. Background สีเหลือง */}
            <div className="absolute inset-0 bg-[#F2B33D]" />

            {/* 2. Decorative Logo Overlay (รูปนกสีขาว) */}
            <div
                className={`absolute top-[10%] w-[60%] h-[80%] bg-contain bg-no-repeat opacity-100 pointer-events-none hidden md:block ${
                  centered ? 'right-0 bg-right' : 'right-[10%] bg-right'
                }`}
                style={{ backgroundImage: "url('/logo-banner.png')" }}
            />

            {/* 3. Content */}
            <div className={`container mx-auto px-6 h-full relative z-10 flex items-center ${centered ? 'justify-center' : ''}`}>
                <div className={`${centered ? 'max-w-4xl text-center' : 'max-w-3xl'}`}>
                    {/* Badge */}
                    {badge && (
                      <div className={`inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full mb-6 border border-white/30 ${centered ? 'mx-auto' : ''}`}>
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">{badge}</span>
                      </div>
                    )}

                    {/* Heading */}
                    <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter mb-2 drop-shadow-sm">
                        {title} {titleHighlight && <span className="text-[#2C2C2C] not-italic">{titleHighlight}</span>}
                    </h1>

                    <p className="text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-2 leading-tight drop-shadow-sm">
                        {subtitle}
                    </p>
                    {description && (
                      <p className={`text-lg md:text-xl font-medium text-white/90 mb-8 italic drop-shadow-md ${centered ? 'max-w-3xl mx-auto' : ''}`}>
                          {description}
                      </p>
                    )}

                    {/* Custom Children Content (เช่น search box) */}
                    {children && (
                      <div className={`mb-8 ${centered ? 'flex justify-center' : ''}`}>
                        {children}
                      </div>
                    )}

                    {/* Buttons */}
                    {showButtons && (
                      <div className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center ${centered ? 'justify-center' : ''}`}>
                          {primaryButtonText && primaryButtonHref && (
                            <Button
                                href={primaryButtonHref}
                                size="lg"
                                className="bg-[#2C2C2C] text-white font-black px-10 rounded-2xl h-16 text-lg shadow-2xl hover:bg-black transition-all group"
                                startContent={primaryButtonIcon}
                            >
                                {primaryButtonText}
                            </Button>
                          )}

                          {secondaryButtonText && secondaryButtonHref && (
                            <Button
                                href={secondaryButtonHref}
                                variant="light"
                                size="lg"
                                className="text-[#2C2C2C] font-black text-lg group h-16"
                                endContent={<FaChevronRight className="group-hover:translate-x-1 transition-transform" />}
                            >
                                {secondaryButtonText}
                            </Button>
                          )}
                      </div>
                    )}
                </div>
            </div>
        </section>
    );
}
