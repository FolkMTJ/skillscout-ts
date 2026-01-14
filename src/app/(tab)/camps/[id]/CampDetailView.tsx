"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    FaMapMarkerAlt, FaCalendarAlt, FaClock, FaArrowLeft, FaUsers, FaGraduationCap, FaPaintBrush, FaCheckCircle, FaTicketAlt, FaHourglassHalf
} from "react-icons/fa";
import { Chip, Progress } from "@heroui/react";
import { Camp, Organizer } from "@/types";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import BookingModal from '@/components/camps/BookingModal';
import TicketModal from '@/components/ticket/TicketModal';
import LocationMap from '@/components/maps/LocationMap';
import { ReviewForm, ReviewList } from '@/components/reviews';

interface TicketData {
    _id: string;
    userId: string;
    campId: string;
    campName: string;
    userEmail: string;
    userName: string;
    qrCode: string;
    registrationDate: string;
    status: string;
    campDate: string;
    campLocation: string;
    registrationId: string;
    createdAt: string;
}

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



export default function CampDetailView({ camp }: { camp: Camp }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [selectedImage, setSelectedImage] = useState(camp.galleryImages[0] || camp.image);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

    const [isRegistered, setIsRegistered] = useState(false);
    const [ticketData, setTicketData] = useState<TicketData | null>(null);
    const [checkingRegistration, setCheckingRegistration] = useState(true);
    const [canGetTicket, setCanGetTicket] = useState(false);
    const [, setTicketStatus] = useState('');
    const [ticketMessage, setTicketMessage] = useState('');
    const [currentCamp, setCurrentCamp] = useState(camp);
    const [showReviewForm, setShowReviewForm] = useState(false);

    // 🔧 FIX: ตรวจสอบการลงทะเบียนและสิทธิ์ในการรับ Ticket
    useEffect(() => {
        let isMounted = true;

        const checkRegistration = async () => {
            if (!session?.user?.email) {
                if (isMounted) setCheckingRegistration(false);
                return;
            }

            try {
                const response = await fetch(
                    `/api/ticket?userId=${encodeURIComponent(session.user.email)}&campId=${camp._id}`,
                    {
                        cache: 'no-store',
                        next: { revalidate: 0 }
                    }
                );
                const data = await response.json();

                if (isMounted) {
                    if (data.registered) {
                        setIsRegistered(true);

                        // ถ้ามี ticket แปลว่าสามารถรับ ticket ได้
                        if (data.canGetTicket && data.ticket) {
                            setCanGetTicket(true);
                            setTicketData(data.ticket);
                        } else {
                            // ยังไม่สามารถรับ ticket ได้
                            setCanGetTicket(false);
                            setTicketStatus(data.status || 'pending');
                            setTicketMessage(data.message || 'รอการดำเนินการ');
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking registration:', error);
            } finally {
                if (isMounted) setCheckingRegistration(false);
            }
        };

        checkRegistration();

        return () => {
            isMounted = false;
        };
    }, [session?.user?.email, camp._id]);

    const handleRegistrationSuccess = async () => {
        // Refetch registration status
        if (session?.user?.email) {
            try {
                const response = await fetch(
                    `/api/ticket?userId=${encodeURIComponent(session.user.email)}&campId=${camp._id}`,
                    {
                        cache: 'no-store',
                        next: { revalidate: 0 }
                    }
                );
                const data = await response.json();

                if (data.registered) {
                    setIsRegistered(true);

                    if (data.canGetTicket && data.ticket) {
                        setCanGetTicket(true);
                        setTicketData(data.ticket);
                    } else {
                        setCanGetTicket(false);
                        setTicketStatus(data.status || 'pending');
                        setTicketMessage(data.message || 'รอการดำเนินการ');
                    }
                }
            } catch (error) {
                console.error('Error refreshing registration status:', error);
            }
        }
    };

    const handleTicketClick = () => {
        if (ticketData) {
            setIsTicketModalOpen(true);
        }
    };

    const handleReviewSubmitted = async () => {
        try {
            const response = await fetch(`/api/camps/${camp._id}`);
            const updatedCamp = await response.json();
            setCurrentCamp(updatedCamp);
            setShowReviewForm(false);
        } catch (error) {
            console.error('Error refreshing camp data:', error);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <section>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden max-w-10xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-7">

                            {/* 1. ส่วนรูปภาพ: ลบ min-h-400px ออกเพื่อให้ไม่สูงเกินไป ปรับเป็น h-56 สำหรับมือถือ */}
                            <div className="relative md:col-span-4 h-56 md:h-auto">
                                <Image
                                    src={camp.image}
                                    alt={camp.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                />
                            </div>

                            {/* 2. ส่วนเนื้อหา: ลด Padding ลง */}
                            <div className="md:col-span-3 p-5 md:p-10 flex flex-col">

                                {/* Header: Back Button & Tags */}
                                <div className="flex justify-between items-start mb-4">
                                    <button
                                        onClick={() => router.back()}
                                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        <FaArrowLeft />
                                        ย้อนกลับ
                                    </button>
                                    {camp.tags && camp.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {camp.tags.map((tag, index) => (
                                                <Chip
                                                    key={`${tag}-${index}`}
                                                    size="sm"
                                                    variant="flat"
                                                    className="bg-gray-100 dark:bg-gray-700 h-6"
                                                    classNames={{ content: "text-xs text-gray-600 dark:text-gray-300 px-1" }}
                                                >
                                                    {tag}
                                                </Chip>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Title: ลดขนาด Font */}
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                                    {camp.name}
                                </h1>

                                {/* Details: ลด Gap และ Font size */}
                                <div className="space-y-2 mt-2 dark:border-gray-700">
                                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <FaCalendarAlt className="text-base text-[#F2B33D]" />
                                        <span className="font-medium text-sm">{camp.date}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <FaMapMarkerAlt className="text-base text-[#F2B33D]" />
                                        <span className="font-medium text-sm">{camp.location}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-red-500 dark:text-red-400">
                                        <FaClock className="text-base" />
                                        <span className="font-medium text-sm">ปิดรับ: {camp.deadline}</span>
                                    </div>
                                </div>

                                {/* Organizers: ลดขนาดรูปและพื้นที่ */}
                                {camp.organizers && camp.organizers.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">ผู้จัดค่าย</h2>
                                        <div className="flex flex-wrap items-center gap-3">
                                            {camp.organizers.map((organizer: Organizer, index: number) => {
                                                const isPlaceholder = organizer.imageUrl === '/api/placeholder/100/100' || !organizer.imageUrl;
                                                return (
                                                    <div key={`${organizer.name}-${index}`} className="flex items-center gap-2">
                                                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm">
                                                            {isPlaceholder ? (
                                                                <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                                                    <span className="text-white text-xs font-bold">
                                                                        {organizer.name.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <Image
                                                                    src={organizer.imageUrl}
                                                                    alt={organizer.name}
                                                                    fill
                                                                    className="object-cover"
                                                                    sizes="32px"
                                                                />
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 max-w-[80px] truncate">
                                                            {organizer.name}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Footer: Price & Button (ดันลงล่างสุดถ้ามีความสูงเหลือ) */}
                                <div className="mt-6 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                                    {/* Price: ลดขนาด */}
                                    <p className="text-3xl font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                        {camp.price === '฿0' ? 'ฟรี' : camp.price}
                                    </p>

                                    {/* Buttons: ลด size เป็น md */}
                                    <div className="w-full sm:w-auto">
                                        {checkingRegistration ? (
                                            <Button isDisabled className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700" size="md">
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                                                    <span className="text-sm">กำลังตรวจสอบ...</span>
                                                </div>
                                            </Button>
                                        ) : isRegistered ? (
                                            canGetTicket ? (
                                                <Button
                                                    className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 font-bold text-white shadow-md"
                                                    size="md"
                                                    startContent={<FaTicketAlt />}
                                                    onPress={handleTicketClick}
                                                >
                                                    รับ Ticket
                                                </Button>
                                            ) : (
                                                <Button
                                                    isDisabled
                                                    className="w-full sm:w-auto bg-yellow-500/50 font-bold text-gray-700"
                                                    size="md"
                                                    startContent={<FaHourglassHalf />}
                                                >
                                                    รอตรวจสอบ
                                                </Button>
                                            )
                                        ) : (
                                            <Button
                                                className="w-full sm:w-auto bg-[#F2B33D] font-bold text-gray-900"
                                                color="warning"
                                                variant="shadow"
                                                size="md"
                                                onPress={() => setIsModalOpen(true)}
                                            >
                                                สมัครเข้าร่วม
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Status Message: ทำให้ Compact ขึ้น */}
                                {isRegistered && (
                                    <div className={`mt-3 px-3 py-2 rounded border flex items-center gap-2 text-xs ${canGetTicket
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 text-green-700 dark:text-green-400'
                                            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 text-yellow-700 dark:text-yellow-400'
                                        }`}>
                                        {canGetTicket ? <FaCheckCircle /> : <FaHourglassHalf className="animate-pulse" />}
                                        <span className="truncate flex-1">
                                            {canGetTicket
                                                ? 'สมัครสำเร็จ: กดปุ่ม "รับ Ticket" เพื่อดาวน์โหลดบัตร'
                                                : (ticketMessage || 'สมัครแล้ว: รอ Organizer ตรวจสอบสลิป')
                                            }
                                        </span>
                                    </div>
                                )}
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
                                {camp.galleryImages.map((img: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(img)}
                                        className={`relative w-full h-32 rounded-lg overflow-hidden transition-all duration-300 focus:outline-none ${selectedImage === img
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
                            {camp.additionalInfo.map((info: string, i: number) => <p key={i}>• {info}</p>)}
                        </InfoCard>
                        <InfoCard title="สถานที่จัด" icon={<FaMapMarkerAlt className="text-lg text-[#F2B33D]" />}>
                            <p>{camp.location}</p>
                        </InfoCard>
                        {camp.activityFormat !== 'Online' && (
                            <LocationMap
                                location={camp.location}
                                height="h-64"
                                className="mt-6"
                            />
                        )}
                    </div>
                </section>

                <section className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">รีวิวจากผู้เข้าร่วม</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-4 mb-4">
                                <p className="text-5xl font-bold text-gray-800 dark:text-white">
                                    {currentCamp.avgRating.toFixed(1)}
                                </p>
                                <div>
                                    <div className="flex items-center">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <span key={i} className={i < Math.round(currentCamp.avgRating) ? "text-amber-400" : "text-gray-300"}>
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500">{currentCamp.reviews.length} รีวิว</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(currentCamp.ratingBreakdown).reverse().map(([stars, count]) => (
                                    <div key={stars} className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">{stars} ★</span>
                                        <Progress
                                            value={((count as number) / (currentCamp.reviews.length || 1)) * 100}
                                            classNames={{ indicator: "bg-amber-400" }}
                                        />
                                    </div>
                                ))}
                            </div>
                            {session?.user?.name && isRegistered ? (
                                <Button
                                    className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg mt-5 h-12"
                                    fullWidth
                                    radius="full"
                                    onPress={() => setShowReviewForm(!showReviewForm)}
                                >
                                    {showReviewForm ? 'ซ่อนฟอร์ม' : 'เขียนรีวิว'}
                                </Button>
                            ) : (
                                <Button
                                    className="bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 mt-5 h-12"
                                    fullWidth
                                    radius="full"
                                    isDisabled
                                >
                                    {!session ? 'เข้าสู่ระบบเพื่อเขียนรีวิว' : 'สมัครค่ายเพื่อเขียนรีวิว'}
                                </Button>
                            )}
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            {showReviewForm && session?.user?.name && isRegistered && (
                                <ReviewForm
                                    campId={currentCamp._id}
                                    campName={currentCamp.name}
                                    userName={session.user.name}
                                    onReviewSubmitted={handleReviewSubmitted}
                                />
                            )}
                            <ReviewList reviews={currentCamp.reviews} />
                        </div>
                    </div>
                </section>
            </div>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                camp={camp}
                onRegistrationSuccess={handleRegistrationSuccess}
            />

            {ticketData && (
                <TicketModal
                    isOpen={isTicketModalOpen}
                    onClose={() => setIsTicketModalOpen(false)}
                    ticket={ticketData}
                />
            )}
        </div>
    );
}
