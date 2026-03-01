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
    const [hasAttended, setHasAttended] = useState(false);
    const [ticketData, setTicketData] = useState<TicketData | null>(null);
    const [checkingRegistration, setCheckingRegistration] = useState(true);
    const [canGetTicket, setCanGetTicket] = useState(false);
    const [, setTicketStatus] = useState('');
    const [ticketMessage, setTicketMessage] = useState('');
    const [currentCamp, setCurrentCamp] = useState(camp);
    const [showReviewForm, setShowReviewForm] = useState(false);

    // สำหรับ payment ที่ค้างอยู่
    const [pendingPaymentId, setPendingPaymentId] = useState('');
    const [pendingRegistrationId, setPendingRegistrationId] = useState('');
    const [paymentCreatedAt, setPaymentCreatedAt] = useState<Date | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null); // วินาทีที่เหลือ

    // สำหรับ portfolio flow
    const [portfolioStatus, setPortfolioStatus] = useState('');
    const [readyToPayRegistrationId, setReadyToPayRegistrationId] = useState('');

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
                            // clear all pending state
                            setPendingPaymentId('');
                            setPendingRegistrationId('');
                            setPaymentCreatedAt(null);
                            setPortfolioStatus('');
                            setReadyToPayRegistrationId('');
                        } else {
                            // ยังไม่สามารถรับ ticket ได้
                            setCanGetTicket(false);
                            setTicketStatus(data.status || 'pending');
                            setTicketMessage(data.message || 'รอการดำเนินการ');

                            if (data.status === 'attended') {
                                setHasAttended(true);
                            } else if (data.status === 'pending_payment' && data.paymentId) {
                                setPendingPaymentId(data.paymentId);
                                setPendingRegistrationId(data.registrationId || '');
                                setPaymentCreatedAt(new Date(data.paymentCreatedAt));
                            } else if (data.status === 'pending_portfolio_review') {
                                setPortfolioStatus('pending_portfolio_review');
                            } else if (data.status === 'portfolio_rejected') {
                                setPortfolioStatus('portfolio_rejected');
                            } else if (data.status === 'ready_to_pay') {
                                setPortfolioStatus('ready_to_pay');
                                setReadyToPayRegistrationId(data.registrationId || '');
                            }
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
        // Optimistic update: ตั้ง isRegistered ทันทีเพื่อไม่ให้ปุ่ม "สมัครเข้าร่วม" กลับมา
        setIsRegistered(true);

        // รอ 1.5 วิ ให้ DB write เสร็จ (async operations: registration + payment + status PATCH)
        await new Promise((resolve) => setTimeout(resolve, 1500));

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
                        setPendingPaymentId('');
                        setPendingRegistrationId('');
                        setPaymentCreatedAt(null);
                        setPortfolioStatus('');
                        setReadyToPayRegistrationId('');
                    } else {
                        setCanGetTicket(false);
                        setTicketStatus(data.status || 'pending');
                        setTicketMessage(data.message || 'รอการดำเนินการ');
                        if (data.status === 'attended') {
                            setHasAttended(true);
                        } else if (data.status === 'pending_payment' && data.paymentId) {
                            setPendingPaymentId(data.paymentId);
                            setPendingRegistrationId(data.registrationId || '');
                            setPaymentCreatedAt(new Date(data.paymentCreatedAt));
                        } else if (data.status === 'pending_portfolio_review') {
                            setPortfolioStatus('pending_portfolio_review');
                        } else if (data.status === 'portfolio_rejected') {
                            setPortfolioStatus('portfolio_rejected');
                        } else if (data.status === 'ready_to_pay') {
                            setPortfolioStatus('ready_to_pay');
                            setReadyToPayRegistrationId(data.registrationId || '');
                        }
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

    // Countdown timer — 20 นาทีหลังสร้าง payment
    useEffect(() => {
        if (!paymentCreatedAt) {
            setTimeLeft(null);
            return;
        }

        const TWENTY_MIN_MS = 20 * 60 * 1000;

        const tick = () => {
            const remaining = TWENTY_MIN_MS - (Date.now() - paymentCreatedAt.getTime());
            if (remaining <= 0) {
                setTimeLeft(0);
            } else {
                setTimeLeft(Math.floor(remaining / 1000));
            }
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [paymentCreatedAt]);

    // Auto-cancel เมื่อหมดเวลา
    useEffect(() => {
        if (timeLeft !== 0 || !pendingPaymentId || !pendingRegistrationId) return;

        const cancelExpired = async () => {
            try {
                await fetch('/api/payment/cancel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentId: pendingPaymentId,
                        registrationId: pendingRegistrationId,
                    }),
                });
            } catch { /* silent */ }
            // Reset state ให้ user register ใหม่ได้
            setIsRegistered(false);
            setCanGetTicket(false);
            setPendingPaymentId('');
            setPendingRegistrationId('');
            setPaymentCreatedAt(null);
            setTimeLeft(null);
        };

        cancelExpired();
    }, [timeLeft, pendingPaymentId, pendingRegistrationId]);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-3 sm:px-4 py-4 md:py-12">
                <section>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden max-w-10xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-7">

                            {/* 1. ส่วนรูปภาพ: 16:9 */}
                            <div className="relative md:col-span-4 aspect-video md:aspect-auto md:h-full">
                                <Image
                                    src={camp.image}
                                    alt={camp.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                />
                            </div>

                            {/* 2. ส่วนเนื้อหา */}
                            <div className="md:col-span-3 p-4 md:p-8 flex flex-col">

                                {/* Header: Back Button & Tags */}
                                <div className="flex items-center justify-between mb-3">
                                    <button
                                        onClick={() => router.back()}
                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        <FaArrowLeft />
                                        ย้อนกลับ
                                    </button>
                                    {camp.tags && camp.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 max-w-[60%] justify-end">
                                            {camp.tags.slice(0, 3).map((tag, index) => (
                                                <Chip
                                                    key={`${tag}-${index}`}
                                                    size="sm"
                                                    variant="flat"
                                                    className="bg-gray-100 dark:bg-gray-700 h-5"
                                                    classNames={{ content: "text-[10px] text-gray-600 dark:text-gray-300 px-1" }}
                                                >
                                                    {tag}
                                                </Chip>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
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
                                        <div className="flex items-center justify-between mb-2">
                                            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400">ผู้จัดค่าย</h2>
                                            {camp.organizerId && (
                                                <button
                                                    onClick={() => router.push(`/organizer/${camp.organizerId}`)}
                                                    className="text-xs text-[#F2B33D] hover:text-[#e0a530] font-medium transition-colors"
                                                >
                                                    ดูประวัติ →
                                                </button>
                                            )}
                                        </div>
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

                                {/* Footer: Price & Button */}
                                <div className="mt-4 flex flex-col gap-3">
                                    {/* Price */}
                                    <div className="flex items-end gap-3">
                                        <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                            {camp.price === '฿0' ? 'ฟรี' : camp.price}
                                        </p>
                                        {camp.originalFee != null && camp.fee != null && camp.originalFee > camp.fee && (
                                            <>
                                                <p className="text-base text-gray-400 line-through mb-1">
                                                    ฿{camp.originalFee.toLocaleString()}
                                                </p>
                                                <span className="mb-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                                                    ลด {Math.round((1 - camp.fee / camp.originalFee) * 100)}%
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Button */}
                                    <div className="w-full">
                                        {checkingRegistration ? (
                                            <Button isDisabled className="w-full bg-gray-200 dark:bg-gray-700" size="md">
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                                                    <span className="text-sm">กำลังตรวจสอบ...</span>
                                                </div>
                                            </Button>
                                        ) : isRegistered ? (
                                            canGetTicket ? (
                                                <Button
                                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 font-bold text-white shadow-md"
                                                    size="md"
                                                    startContent={<FaTicketAlt />}
                                                    onPress={handleTicketClick}
                                                >
                                                    รับ Ticket
                                                </Button>
                                            ) : portfolioStatus === 'pending_portfolio_review' ? (
                                                <Button
                                                    isDisabled
                                                    className="w-full bg-orange-100 font-bold text-orange-600"
                                                    size="md"
                                                    startContent={<FaHourglassHalf className="animate-pulse" />}
                                                >
                                                    รอตรวจสอบ Portfolio
                                                </Button>
                                            ) : portfolioStatus === 'portfolio_rejected' ? (
                                                <Button
                                                    isDisabled
                                                    className="w-full bg-red-100 font-bold text-red-500"
                                                    size="md"
                                                >
                                                    Portfolio ไม่ผ่าน
                                                </Button>
                                            ) : portfolioStatus === 'ready_to_pay' ? (
                                                <Button
                                                    className="w-full bg-[#F2B33D] font-bold text-gray-900"
                                                    size="md"
                                                    startContent={<FaTicketAlt />}
                                                    onPress={() => setIsModalOpen(true)}
                                                >
                                                    ชำระเงิน
                                                </Button>
                                            ) : pendingPaymentId ? (
                                                <Button
                                                    className="w-full bg-[#F2B33D] font-bold text-gray-900"
                                                    size="md"
                                                    startContent={<FaHourglassHalf />}
                                                    onPress={() => setIsModalOpen(true)}
                                                >
                                                    ยืนยันการชำระเงิน
                                                </Button>
                                            ) : (
                                                <Button
                                                    isDisabled
                                                    className="w-full bg-gray-200 font-bold text-gray-500"
                                                    size="md"
                                                    startContent={<FaHourglassHalf />}
                                                >
                                                    รอการอนุมัติ
                                                </Button>
                                            )
                                        ) : session?.user?.role === 'organizer' ? (
                                            <Button
                                                isDisabled
                                                className="w-full bg-gray-200 dark:bg-gray-700 font-bold text-gray-500 dark:text-gray-400"
                                                size="md"
                                            >
                                                ผู้จัดค่ายไม่สามารถสมัครได้
                                            </Button>
                                        ) : (
                                            <Button
                                                className="w-full bg-[#F2B33D] font-bold text-gray-900"
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
                                    <div className={`mt-3 px-3 py-2 rounded border flex items-center gap-2 text-xs ${
                                        canGetTicket
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 text-green-700 dark:text-green-400'
                                            : portfolioStatus === 'portfolio_rejected'
                                                ? 'bg-red-50 border-red-200 text-red-600'
                                                : portfolioStatus === 'ready_to_pay'
                                                    ? 'bg-[#F2B33D]/10 border-[#F2B33D]/30 text-amber-700'
                                                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 text-yellow-700 dark:text-yellow-400'
                                    }`}>
                                        {canGetTicket ? <FaCheckCircle /> : <FaHourglassHalf className="animate-pulse" />}
                                        <span className="flex-1 text-xs">
                                            {canGetTicket
                                                ? 'สมัครสำเร็จ: กดปุ่ม "รับ Ticket" เพื่อดาวน์โหลดบัตร'
                                                : portfolioStatus === 'pending_portfolio_review'
                                                    ? 'รอ Organizer ตรวจสอบ Portfolio ของคุณ'
                                                    : portfolioStatus === 'portfolio_rejected'
                                                        ? (ticketMessage || 'Portfolio ไม่ผ่านการตรวจสอบ')
                                                        : portfolioStatus === 'ready_to_pay'
                                                            ? 'Portfolio ผ่านแล้ว กรุณาชำระเงิน'
                                                            : pendingPaymentId && timeLeft !== null && timeLeft > 0
                                                                ? `กรุณายืนยันการชำระเงินภายใน ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')} นาที`
                                                                : (ticketMessage || 'รอการดำเนินการ')
                                            }
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-5 md:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                    <div className="lg:col-span-2 space-y-4 md:space-y-8">
                        <div className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <FaPaintBrush className="text-xl text-[#F2B33D]" />
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">คำอธิบายกิจกรรม</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{camp.description}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
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
                                        className={`relative w-full aspect-video rounded-lg overflow-hidden transition-all duration-300 focus:outline-none ${selectedImage === img
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

                    <div className="lg:col-span-1 space-y-3 md:space-y-6">
                        {/* Mobile: compact info grid (hidden on desktop) */}
                        <div className="grid grid-cols-2 gap-2 lg:hidden">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100">
                                <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wide">รูปแบบ</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-white">{camp.activityFormat}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100">
                                <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wide">ที่นั่ง</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-white">{camp.participantCount} คน</p>
                            </div>
                            {camp.qualifications.level && (
                                <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100">
                                    <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wide">คุณสมบัติ</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{camp.qualifications.level}</p>
                                    {camp.qualifications.fields && camp.qualifications.fields.length > 0 && (
                                        <p className="text-xs text-gray-400 mt-0.5">{camp.qualifications.fields.join(', ')}</p>
                                    )}
                                </div>
                            )}
                            {camp.additionalInfo && camp.additionalInfo.length > 0 && (
                                <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100">
                                    <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wide">เพิ่มเติม</p>
                                    {camp.additionalInfo.map((info: string, i: number) => (
                                        <p key={i} className="text-sm text-gray-700 dark:text-gray-300">• {info}</p>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Desktop: full InfoCards (hidden on mobile) */}
                        <div className="hidden lg:block space-y-6">
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
                        </div>

                        {camp.activityFormat !== 'Online' && (
                            <LocationMap
                                location={camp.location}
                                height="h-52 md:h-64"
                                className=""
                            />
                        )}
                    </div>

                </section>

                <section className="mt-6 md:mt-12">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">รีวิวจากผู้เข้าร่วม</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm">
                            {/* Rating summary row */}
                            <div className="flex items-stretch gap-4 mb-4">
                                {/* Big score */}
                                <div className="flex flex-col items-center justify-center shrink-0">
                                    <p className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white leading-none">
                                        {currentCamp.avgRating.toFixed(1)}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <span key={i} className={`text-sm ${i < Math.round(currentCamp.avgRating) ? "text-amber-400" : "text-gray-300"}`}>
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{currentCamp.reviews.length} รีวิว</p>
                                </div>

                                {/* Progress bars */}
                                <div className="flex-1 space-y-1.5">
                                    {Object.entries(currentCamp.ratingBreakdown).reverse().map(([stars, count]) => (
                                        <div key={stars} className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 w-6 shrink-0">{stars}★</span>
                                            <Progress
                                                value={((count as number) / (currentCamp.reviews.length || 1)) * 100}
                                                size="sm"
                                                classNames={{ indicator: "bg-amber-400", track: "bg-gray-100" }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {session?.user?.name && hasAttended ? (
                                <Button
                                    className="bg-[#F2B33D] text-gray-900 font-bold shadow-md mt-2 h-10"
                                    fullWidth
                                    radius="full"
                                    onPress={() => setShowReviewForm(!showReviewForm)}
                                >
                                    {showReviewForm ? 'ซ่อนฟอร์ม' : 'เขียนรีวิว'}
                                </Button>
                            ) : (
                                <Button
                                    className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 mt-2 h-10 text-xs"
                                    fullWidth
                                    radius="md"
                                    isDisabled
                                >
                                    {!session ? 'เข้าสู่ระบบเพื่อเขียนรีวิว' : 'เข้าร่วมค่ายเพื่อเขียนรีวิว'}
                                </Button>
                            )}
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            {showReviewForm && session?.user?.name && hasAttended && (
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
                existingPaymentId={pendingPaymentId || undefined}
                existingRegistrationId={pendingRegistrationId || readyToPayRegistrationId || undefined}
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
