"use client";

import React from "react";
import { Card, CardBody, Chip, Badge } from "@heroui/react";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock } from "react-icons/fa";

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
      <Card
        isPressable
        className={`w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}
      >
        <CardBody className="p-0 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            {/* Image Section */}
            <div className="relative col-span-2 h-[280px] md:h-full overflow-hidden group">
              <div 
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${camp.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Category Badge */}
              <Chip
                size="sm"
                variant="flat"
                className="absolute top-4 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm font-semibold"
                classNames={{
                  content: "text-primary-600 dark:text-primary-400"
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
                    badge: "text-xs font-bold px-2 py-1"
                  }}
                >
                  <Chip
                    size="sm"
                    variant="solid"
                    color="danger"
                    className="font-semibold"
                  >
                    ปิดรับเร็วๆนี้
                  </Chip>
                </Badge>
              )}
            </div>

            {/* Content Section */}
            <div className="col-span-3 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3 line-clamp-2">
                  {camp.name}
                </h3>
                
                <p className="text-zinc-600 dark:text-zinc-400 mb-6 line-clamp-2 leading-relaxed">
                  {camp.description}
                </p>

                {/* Info Grid */}
                <div className="grid grid-cols-1 gap-3 mb-6">
                  <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
                      <FaCalendarAlt className="text-primary-600 dark:text-primary-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">วันที่จัด</p>
                      <p className="font-semibold">{camp.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
                      <FaMapMarkerAlt className="text-primary-600 dark:text-primary-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">สถานที่</p>
                      <p className="font-semibold">{camp.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                    <div className="w-10 h-10 rounded-xl bg-danger-50 dark:bg-danger-950 flex items-center justify-center">
                      <FaClock className="text-danger-600 dark:text-danger-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">หมดเขตสมัคร</p>
                      <p className="font-semibold">{camp.deadline}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-1">ราคา</p>
                  <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {camp.price}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Compact Card with Hover Effect
  return (
    <Card
      isPressable
      className={`group relative w-full h-[450px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-transparent hover:border-primary-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${className}`}
    >
      <CardBody className="p-0 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${camp.image})` }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
        
        {/* Category Badge */}
        <Chip
          size="sm"
          variant="flat"
          className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-black/90 backdrop-blur-sm font-semibold"
          classNames={{
            content: "text-primary-600 dark:text-primary-400"
          }}
        >
          {camp.category}
        </Chip>

        {/* Deadline Badge */}
        {camp.daysLeft <= 2 && (
          <Chip
            size="sm"
            variant="solid"
            color="danger"
            className="absolute top-4 right-4 z-20 font-semibold animate-pulse"
          >
            หมดเขตใน {camp.daysLeft} วัน
          </Chip>
        )}

        {/* Content - Always Visible */}
        <div className="absolute inset-x-0 bottom-0 p-6 z-10 translate-y-0 group-hover:translate-y-[-20px] transition-transform duration-300">
          <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2">
            {camp.name}
          </h3>
          
          {/* Basic Info */}
          <div className="space-y-2 mb-4 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
            <div className="flex items-center gap-2 text-white/90">
              <FaCalendarAlt size={14} className="text-primary-400" />
              <span className="text-sm">{camp.date}</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <FaMapMarkerAlt size={14} className="text-primary-400" />
              <span className="text-sm">{camp.location}</span>
            </div>
          </div>

          {/* Hover Details */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-x-6 bottom-6">
            <p className="text-white/90 text-sm mb-4 line-clamp-3 leading-relaxed">
              {camp.description}
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-white">
                <FaCalendarAlt size={14} className="text-primary-400" />
                <span className="text-sm">{camp.date}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <FaMapMarkerAlt size={14} className="text-primary-400" />
                <span className="text-sm">{camp.location}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <FaClock size={14} className="text-danger-400" />
                <span className="text-sm">หมดเขต: {camp.deadline}</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <span className="text-white/80 text-sm">ราคา</span>
            <span className="text-2xl font-bold text-primary-400">{camp.price}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}