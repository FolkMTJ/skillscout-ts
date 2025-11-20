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
    const [ticketStatus, setTicketStatus] = useState('');
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
                                    {camp.tags && camp.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {camp.tags.map((tag, index) => (
                                                <Chip
                                                    key={`${tag}-${index}`}
                                                    size="sm"
                                                    variant="flat"
                                                    className="bg-gray-200 dark:bg-gray-700"
                                                    classNames={{ content: "text-gray-700 dark:text-gray-300" }}
                                                >
                                                    {tag}
                                                </Chip>
                                            ))}
                                        </div>
                                    )}
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
                                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">ผู้จัดค่าย</h2>
                                            <div className="flex flex-wrap items-center gap-4">
                                                {camp.organizers.map((organizer: Organizer, index: number) => {
                                                    const isPlaceholder = organizer.imageUrl === '/api/placeholder/100/100' || !organizer.imageUrl;
                                                    return (
                                                        <div key={`${organizer.name}-${index}`} className="flex flex-col items-center gap-2">
                                                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-3 border-amber-400/30 shadow-md hover:border-amber-400 transition-all">
                                                                {isPlaceholder ? (
                                                                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                                                        <span className="text-white text-2xl font-bold">
                                                                            {organizer.name.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <Image
                                                                        src={organizer.imageUrl}
                                                                        alt={organizer.name}
                                                                        fill
                                                                        className="object-cover"
                                                                        sizes="64px"
                                                                    />
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center max-w-[80px] truncate">
                                                                {organizer.name}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between pt-6">
                                        <p className="text-5xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                            <p>{camp.price === '฿0' ? 'ฟรี' : camp.price}</p>
                                        </p>
                                        
                                        {/* 🔧 FIX: แสดงปุ่มตามสถานะที่ถูกต้อง */}
                                        {checkingRegistration ? (
                                            <Button
                                                isDisabled
                                                className="bg-gray-200 dark:bg-gray-700"
                                                size="lg"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                                    <span>กำลังตรวจสอบ...</span>
                                                </div>
                                            </Button>
                                        ) : isRegistered ? (
                                            canGetTicket ? (
                                                <Button
                                                    className="bg-gradient-to-r from-green-500 to-emerald-500 font-bold text-white shadow-lg"
                                                    size="lg"
                                                    startContent={<FaTicketAlt />}
                                                    onPress={handleTicketClick}
                                                >
                                                    รับ Ticket
                                                </Button>
                                            ) : (
                                                <Button
                                                    isDisabled
                                                    className="bg-yellow-500/50 font-bold text-gray-700"
                                                    size="lg"
                                                    startContent={<FaHourglassHalf />}
                                                >
                                                    รอตรวจสอบ
                                                </Button>
                                            )
                                        ) : (
                                            <Button
                                                className="bg-[#F2B33D] font-bold text-gray-900"
                                                color="warning"
                                                variant="shadow"
                                                size="lg"
                                                onPress={() => setIsModalOpen(true)}
                                            >
                                                สมัครเข้าร่วม
                                            </Button>
                                        )}
                                    </div>
                                    
                                    {/* แสดงข้อความสถานะ */}
                                    {isRegistered && (
                                        <div className={`mt-4 p-3 rounded-lg border-2 ${
                                            canGetTicket 
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                                        }`}>
                                            <div className={`flex items-center gap-2 ${
                                                canGetTicket 
                                                    ? 'text-green-700 dark:text-green-400'
                                                    : 'text-yellow-700 dark:text-yellow-400'
                                            }`}>
                                                {canGetTicket ? <FaCheckCircle /> : <FaHourglassHalf className="animate-pulse" />}
                                                <span className="font-semibold">
                                                    {canGetTicket ? 'คุณได้สมัครค่ายนี้แล้ว' : 'สมัครแล้ว - รอการตรวจสอบ'}
                                                </span>
                                            </div>
                                            <p className={`text-sm mt-1 ${
                                                canGetTicket 
                                                    ? 'text-green-600 dark:text-green-500'
                                                    : 'text-yellow-600 dark:text-yellow-500'
                                            }`}>
                                                {canGetTicket 
                                                    ? 'กดปุ่ม "รับ Ticket" เพื่อดาวน์โหลดบัตรเข้าค่าย'
                                                    : ticketMessage
                                                }
                                            </p>
                                        </div>
                                    )}
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
                                {camp.galleryImages.map((img: string, i: number) => (
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
