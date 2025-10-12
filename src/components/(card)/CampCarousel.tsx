"use client";

import React, { useState, useRef } from "react";
import { Button } from "@heroui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CampCard, { CampData } from "./CampCard";

interface CampCarouselProps {
  camps: CampData[];
  title: string;
  subtitle?: string;
}

export default function CampCarousel({ camps, title, subtitle }: CampCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  React.useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        ref.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">{subtitle}</p>
          )}
        </div>
        
        {/* Navigation Buttons */}
        <div className="hidden md:flex gap-2">
          <Button
            isIconOnly
            size="lg"
            variant="flat"
            onPress={() => scroll("left")}
            isDisabled={!canScrollLeft}
            className="rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary-500 dark:hover:border-primary-500 disabled:opacity-30 transition-all"
          >
            <FaChevronLeft className="text-zinc-700 dark:text-zinc-300" />
          </Button>
          <Button
            isIconOnly
            size="lg"
            variant="flat"
            onPress={() => scroll("right")}
            isDisabled={!canScrollRight}
            className="rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary-500 dark:hover:border-primary-500 disabled:opacity-30 transition-all"
          >
            <FaChevronRight className="text-zinc-700 dark:text-zinc-300" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
          style={{ 
            scrollbarWidth: "none", 
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch"
          }}
        >
          {camps.map((camp) => (
            <div
              key={camp.id}
              className="flex-none w-[85%] sm:w-[45%] lg:w-[31%] snap-start"
            >
              <CampCard camp={camp} variant="compact" />
            </div>
          ))}
        </div>

        {/* Gradient Overlays for visual effect */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-zinc-50 dark:from-zinc-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-zinc-50 dark:from-zinc-950 to-transparent" />
      </div>

      {/* Mobile Navigation Indicators */}
      <div className="flex md:hidden justify-center gap-2 mt-6">
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          onPress={() => scroll("left")}
          isDisabled={!canScrollLeft}
          className="rounded-full"
        >
          <FaChevronLeft size={14} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          onPress={() => scroll("right")}
          isDisabled={!canScrollRight}
          className="rounded-full"
        >
          <FaChevronRight size={14} />
        </Button>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}