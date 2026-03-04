"use client";

import React from "react";
import Image from "next/image";
import { Button, Link } from "@heroui/react";
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
  centered?: boolean;
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
  centered = false,
}: HeroBannerProps) {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#F2B33D]" />

      {/* Bird overlay
          md–xl  (768–1535px) = MacBook & laptop → left-[55%]
          2xl+   (1536px+)    = large desktop    → left-[45%]
      */}
      <div className="absolute top-[10%] left-[55%] 2xl:left-[45%] w-[42%] h-[80%] opacity-100 pointer-events-none hidden md:block">
        <Image
          src="/logo-banner.png"
          alt="SkillScout Brand Logo"
          fill
          priority
          sizes="(min-width: 768px) 42vw, 0vw"
          className="object-contain object-right"
        />
      </div>

      {/* Content */}
      <div className={`container mx-auto px-6 py-10 md:py-16 relative z-10 ${centered ? 'flex justify-center' : ''}`}>
        <div className={`${centered ? 'max-w-4xl text-center' : 'max-w-full md:max-w-sm lg:max-w-lg xl:max-w-xl w-full'}`}>

          {/* Badge */}
          {badge && (
            <div className={`inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full mb-4 border border-white/30 ${centered ? 'mx-auto' : ''}`}>
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">{badge}</span>
            </div>
          )}

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white italic tracking-tighter mb-2 drop-shadow-sm">
            {title} {titleHighlight && <span className="text-[#2C2C2C] not-italic">{titleHighlight}</span>}
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-[#2C2C2C] mb-2 leading-tight drop-shadow-sm">
            {subtitle}
          </p>

          {description && (
            <p className={`text-base md:text-lg font-medium text-white/90 mb-5 italic drop-shadow-md ${centered ? 'max-w-3xl mx-auto' : ''}`}>
              {description}
            </p>
          )}

          {/* Custom Children */}
          {children && (
            <div className={`flex flex-row flex-wrap gap-3 items-center ${centered ? 'justify-center' : ''}`}>
              {children}
            </div>
          )}

          {/* Default Buttons */}
          {showButtons && (
            <div className={`flex flex-row flex-wrap gap-3 items-center ${centered ? 'justify-center' : ''}`}>
              {primaryButtonText && primaryButtonHref && (
                <Button
                  as={Link}
                  href={primaryButtonHref}
                  size="lg"
                  className="bg-[#2C2C2C] text-white font-black px-8 rounded-2xl h-14 text-base hover:bg-black transition-all"
                  startContent={primaryButtonIcon}
                >
                  {primaryButtonText}
                </Button>
              )}
              {secondaryButtonText && secondaryButtonHref && (
                <Button
                  as={Link}
                  href={secondaryButtonHref}
                  variant="light"
                  size="lg"
                  className="text-[#2C2C2C] font-black text-base h-14"
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
