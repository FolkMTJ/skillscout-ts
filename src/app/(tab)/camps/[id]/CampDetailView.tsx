"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    FaMapMarkerAlt, FaCalendarAlt, FaClock, FaArrowLeft, FaUsers, FaGraduationCap, FaPaintBrush, FaCheckCircle
} from "react-icons/fa";
import { Chip, Progress } from "@heroui/react";
import type { CampData, Review } from "@/lib/data"; // ✅ แก้ไขจาก @/lib/db เป็น @/lib/data

import React, { useState } from "react";
import { Button } from "@heroui/react";
import BookingModal from '@/components/camps/BookingModal';

const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
            {icon}
            <h3 className="font-bold text-gray-800 dark:text-white">{title}</h3>
        </div>
        <div className="text-gray-600 dark:text-gray-300 text-sm space-y-1">
            {children}
        </div>
    </div>
);

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-gray-800 dark:text-white">{review.author}</span>
        </div>
        <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < review.rating ? "text-amber-400" : "text-gray-300"}>★</span>
            ))}
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>
    </div>
);

export default function CampDetailView({ camp }: { camp: CampData }) {
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState(camp.galleryImages[0] || camp.image);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <section>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-5">
                            <div className="relative md:col-span-2 h-64 md:h-full min-h-[400px]">
                                <Image
                                    src={camp.image}
                                    alt={camp.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                />
                            </div>
                            <div className="md:col-span-3 p-8 md:p-10 flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <button
                                        onClick={() => router.back()}
                                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        <FaArrowLeft />
                                        ย้อนกลับ
                                    </button>
                                    <Chip
                                        size="md"
                                        variant="flat"
                                        className="bg-[#F2B33D] font-bold"
                                        classNames={{ content: "text-[#2C2C2C]" }}
                                    >
                                        {camp.category}
                                    </Chip>
                                </div>
                                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                                    {camp.name}
                                </h1>
                                <div className="space-y-3 mt-auto pt-3 dark:border-gray-700">
                                    <div className="flex items-center gap-4 text-gray-800 dark:text-gray-200">
                                        <FaCalendarAlt className="text-xl text-[#F2B33D]" />
                                        <span className="font-semibold text-lg">{camp.date}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-800 dark:text-gray-200">
                                        <FaMapMarkerAlt className="text-xl text-[#F2B33D]" />
                                        <span className="font-semibold text-lg">{camp.location}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-red-500 dark:text-red-400">
                                        <FaClock className="text-xl" />
                                        <span className="font-semibold text-lg">ปิดรับสมัคร: {camp.deadline}</span>
                                    </div>
                                    {camp.organizers && camp.organizers.length > 0 && (
                                        <div className="mt-8">
                                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">ผู้จัดค่าย</h2>
                                            <div className="flex items-center gap-4 mt-3">
                                                {camp.organizers.map((organizer) => (
                                                    <div key={organizer.name} className="flex flex-col items-center gap-2">
                                                        <div className="relative w-16 h-16">
                                                            <Image
                                                                src={organizer.imageUrl}
                                                                alt={organizer.name}
                                                                fill
                                                                className="rounded-full object-cover"
                                                                sizes="64px"
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                            {organizer.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between pt-6">
                                        <p className="text-5xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                            {camp.price}
                                        </p>
                                        <Button
                                            className="bg-[#F2B33D] font-bold text-gray-900"
                                            color="warning"
                                            variant="shadow"
                                            size="lg"
                                            onPress={() => setIsModalOpen(true)}
                                        >
                                            สมัครเข้าร่วม
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <FaPaintBrush className="text-xl text-[#F2B33D]" />
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">คำอธิบายกิจกรรม</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{camp.description}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-lg">
                                <Image
                                    src={selectedImage}
                                    alt="Selected camp image"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    sizes="(max-width: 1024px) 100vw, 66vw"
                                    className="transition-all duration-300"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {camp.galleryImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(img)}
                                        className={`relative w-full h-32 rounded-lg overflow-hidden transition-all duration-300 focus:outline-none ${
                                            selectedImage === img
                                                ? 'ring-4 ring-amber-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900'
                                                : 'opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${camp.name} gallery thumbnail ${i + 1}`}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            sizes="33vw"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <InfoCard title="รูปแบบกิจกรรม" icon={<FaPaintBrush className="text-lg text-[#F2B33D]" />}>
                            <p>{camp.activityFormat}</p>
                        </InfoCard>
                        <InfoCard title="Key Information" icon={<FaCalendarAlt className="text-lg text-[#F2B33D]" />}>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <FaCalendarAlt className="text-base text-gray-400" />
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        <div className="font-semibold">Date</div>
                                        <span>{camp.date}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaClock className="text-base text-red-500" />
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold">Deadline:</span>
                                        <div>{camp.deadline}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaUsers className="text-base text-gray-400" />
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold">Capacity:</span> {camp.participantCount} people
                                    </p>
                                </div>
                            </div>
                        </InfoCard>
                        <InfoCard title="คุณสมบัติ" icon={<FaGraduationCap className="text-lg text-[#F2B33D]" />}>
                            <p>{camp.qualifications.level}</p>
                            {camp.qualifications.fields && (
                                <p className="text-xs text-gray-500">({camp.qualifications.fields.join(", ")})</p>
                            )}
                        </InfoCard>
                        <InfoCard title="เพิ่มเติม" icon={<FaCheckCircle className="text-lg text-green-500" />}>
                            {camp.additionalInfo.map((info, i) => <p key={i}>• {info}</p>)}
                        </InfoCard>
                        <InfoCard title="สถานที่จัด" icon={<FaMapMarkerAlt className="text-lg text-[#F2B33D]" />}>
                            <p>{camp.location}</p>
                        </InfoCard>
                        <div className="rounded-2xl overflow-hidden shadow-lg h-64 mt-6">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.870425721836!2d100.52182051533816!3d13.72592020188686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e298bf3f6a2e4b%3A0x29c7c729a6b9a54!2sKnowledge%20Exchange%20(KX)!5e0!3m2!1sen!2sth!4v1678886450123!5m2!1sen!2sth" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen={false} 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                </section>

                <section className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">รีวิวจากผู้เข้าร่วม</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-4 mb-4">
                                <p className="text-5xl font-bold text-gray-800 dark:text-white">
                                    {camp.avgRating.toFixed(1)}
                                </p>
                                <div>
                                    <div className="flex items-center">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <span key={i} className={i < Math.round(camp.avgRating) ? "text-amber-400" : "text-gray-300"}>
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500">{camp.reviews.length} รีวิว</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(camp.ratingBreakdown).reverse().map(([stars, count]) => (
                                    <div key={stars} className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">{stars} ★</span>
                                        <Progress 
                                            value={(count / (camp.reviews.length || 1)) * 100} 
                                            classNames={{ indicator: "bg-amber-400" }} 
                                        />
                                    </div>
                                ))}
                            </div>
                            <Button
                                className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg mt-5 h-12"
                                fullWidth
                                isDisabled
                                radius="full"
                            >
                                เขียนรีวิว
                            </Button>
                        </div>

                        <div className="lg:col-span-2 space-y-4">
                            {camp.reviews.length > 0 ? (
                                camp.reviews.map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))
                            ) : (
                                <div className="text-center text-gray-500 pt-10">
                                    ยังไม่มีรีวิวสำหรับค่ายนี้
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
            
            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                camp={camp}
            />
        </div>
    );
}