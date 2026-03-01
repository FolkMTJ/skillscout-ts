"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Chip } from '@heroui/react';
import { FiCalendar, FiMapPin, FiCheckCircle, FiClock, FiStar, FiSearch, FiArrowRight } from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import HeroBanner from '@/components/HeroBanner';

interface CampDetails {
  name?: string;
  image?: string;
  location?: string;
  date?: string;
}

interface Registration {
  _id: string;
  campId: string;
  campName?: string;
  campImage?: string;
  campLocation?: string;
  campDate?: string;
  status: string;
  appliedAt: string;
  updatedAt?: string;
  reviewedAt?: string;
}

const STATUS_MAP: Record<string, { label: string; color: 'warning' | 'primary' | 'success' | 'danger' | 'default'; dot: string }> = {
  pending:   { label: 'รอตรวจสอบ',    color: 'warning', dot: 'bg-yellow-400' },
  approved:  { label: 'อนุมัติแล้ว',  color: 'primary', dot: 'bg-blue-500' },
  confirmed: { label: 'ยืนยันแล้ว',   color: 'success', dot: 'bg-green-500' },
  attended:  { label: 'จบไปแล้ว',    color: 'default', dot: 'bg-gray-400' },
  rejected:  { label: 'ไม่อนุมัติ',   color: 'danger',  dot: 'bg-red-500' },
  cancelled: { label: 'ยกเลิก',       color: 'danger',  dot: 'bg-red-400' },
};

function isCampDatePast(campDate?: string): boolean {
  if (!campDate) return false;
  try {
    const d = new Date(campDate);
    d.setHours(23, 59, 59, 999);
    return d < new Date();
  } catch { return false; }
}

function getDisplayStatus(reg: Registration): string {
  if ((reg.status === 'approved' || reg.status === 'confirmed' || reg.status === 'attended') && isCampDatePast(reg.campDate)) {
    return 'attended'; // จบไปแล้ว
  }
  return reg.status;
}

type TabKey = 'all' | 'upcoming' | 'completed' | 'pending';

export default function MyCampsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const fetchRegistrations = useCallback(async () => {
    if (!session?.user?.email) { setLoading(false); return; }
    try {
      setLoading(true);
      const response = await fetch(`/api/registrations?userId=${encodeURIComponent(session.user.email)}`);
      const data = await response.json();
      if (data.registrations && Array.isArray(data.registrations)) {
        const withCamps = await Promise.all(
          data.registrations.map(async (reg: Registration) => {
            try {
              const campResponse = await fetch(`/api/camps/${reg.campId}`);
              if (!campResponse.ok) return reg;
              const campData: CampDetails = await campResponse.json();
              return { ...reg, campName: campData.name, campImage: campData.image, campLocation: campData.location, campDate: campData.date };
            } catch { return reg; }
          })
        );
        // Filter out registrations where camp data could not be fetched
        setRegistrations(withCamps.filter(reg => reg.campName));
      }
    } catch { toast.error('ไม่สามารถโหลดข้อมูลได้'); }
    finally { setLoading(false); }
  }, [session?.user?.email]);

  useEffect(() => {
    if (status === 'authenticated') fetchRegistrations();
    else if (status === 'unauthenticated') setLoading(false);
  }, [status, fetchRegistrations]);

  const handleConfirmAttendance = async (registrationId: string, campName: string) => {
    if (!confirm(`ยืนยันการเข้าร่วมค่าย "${campName}" หรือไม่?`)) return;
    try {
      const response = await fetch(`/api/registrations/${registrationId}/confirm`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to confirm');
      toast.success('ยืนยันการเข้าร่วมสำเร็จ!');
      fetchRegistrations();
    } catch { toast.error('เกิดข้อผิดพลาดในการยืนยัน'); }
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'all',       label: 'ทั้งหมด',          icon: <FaBookmark size={13} /> },
    { key: 'pending',   label: 'รอตรวจสอบ',        icon: <FiClock size={13} /> },
    { key: 'upcoming',  label: 'กำลังจะมาถึง',     icon: <FiCalendar size={13} /> },
    { key: 'completed', label: 'จบไปแล้ว',         icon: <FiCheckCircle size={13} /> },
  ];

  const getFiltered = () => {
    if (activeTab === 'all') return registrations;
    if (activeTab === 'pending') return registrations.filter(r => r.status === 'pending' || r.status === 'rejected' || r.status === 'cancelled');
    if (activeTab === 'upcoming') return registrations.filter(r =>
      (r.status === 'approved' || r.status === 'confirmed') && !isCampDatePast(r.campDate)
    );
    if (activeTab === 'completed') return registrations.filter(r =>
      r.status === 'attended' ||
      ((r.status === 'approved' || r.status === 'confirmed') && isCampDatePast(r.campDate))
    );
    return registrations;
  };

  const filtered = getFiltered();

  const counts = {
    all: registrations.length,
    pending: registrations.filter(r => r.status === 'pending' || r.status === 'rejected' || r.status === 'cancelled').length,
    upcoming: registrations.filter(r => (r.status === 'approved' || r.status === 'confirmed') && !isCampDatePast(r.campDate)).length,
    completed: registrations.filter(r =>
      r.status === 'attended' ||
      ((r.status === 'approved' || r.status === 'confirmed') && isCampDatePast(r.campDate))
    ).length,
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <HeroBanner badge="My Journey" title="MY" titleHighlight="CAMPS" subtitle="ค่ายของคุณ" showButtons={false} />
        <div className="max-w-[1536px] mx-auto px-3 md:px-6 py-6 md:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">กรุณาเข้าสู่ระบบ</h2>
          <button onClick={() => router.push('/login')} className="bg-[#F2B33D] text-white font-bold py-3 px-6 rounded-2xl">
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <HeroBanner
        badge="My Journey"
        title="MY"
        titleHighlight="CAMPS"
        subtitle="ค่ายของคุณ"
        description={registrations.length > 0 ? `${registrations.length} ค่ายที่คุณสมัคร • ติดตามสถานะและจัดการได้ที่นี่` : 'ยังไม่มีค่ายที่สมัคร'}
        showButtons={false}
      />

      <div className="max-w-[1536px] mx-auto px-3 md:px-6 py-6 md:py-10 pb-16 md:pb-20">

        {/* Tab Bar — dropdown on mobile, pills on desktop */}
        <div className="mb-6 md:mb-8">

          {/* Mobile: select dropdown */}
          <div className="md:hidden relative">
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value as TabKey)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-4 py-3 pr-10 text-sm font-semibold text-[#2C2C2C] shadow-sm focus:outline-none focus:border-[#F2B33D]"
            >
              {tabs.map(tab => (
                <option key={tab.key} value={tab.key}>
                  {tab.label} ({counts[tab.key]})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F2B33D] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Desktop: pill tabs */}
          <div className="hidden md:flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-[#F2B33D] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.key ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#F2B33D] to-orange-400" />
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF3D0] flex items-center justify-center mb-4">
                <FiSearch className="text-[#F2B33D]" size={28} />
              </div>
              <h2 className="text-xl font-bold text-[#2C2C2C] mb-2">
                {activeTab === 'all' ? 'ยังไม่มีค่ายที่สมัคร' : `ไม่มีค่ายใน "${tabs.find(t => t.key === activeTab)?.label}"`}
              </h2>
              <p className="text-gray-400 text-sm mb-8 max-w-xs">
                {activeTab === 'all' ? 'ค้นหาค่ายที่สนใจและเริ่มสมัครได้เลย' : 'ลองดูที่แท็บอื่น หรือค้นหาค่ายใหม่'}
              </p>
              <button
                onClick={() => router.push('/allcamps')}
                className="flex items-center gap-2 bg-[#F2B33D] hover:bg-[#e0a530] text-white font-bold py-3 px-6 rounded-2xl transition-all text-sm shadow-sm hover:shadow-md"
              >
                ค้นหาค่ายที่น่าสนใจ
                <FiArrowRight />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(reg => {
              const displayStatus = getDisplayStatus(reg);
              const statusInfo = STATUS_MAP[displayStatus] ?? { label: reg.status, color: 'default' as const, dot: 'bg-gray-400' };
              const isUpcoming = (reg.status === 'approved' || reg.status === 'confirmed') && !isCampDatePast(reg.campDate);
              const isCompleted = displayStatus === 'attended';

              return (
                <div key={reg._id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-[#F2B33D]/30 transition-all duration-200 group flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={reg.campImage || '/placeholder.png'}
                      alt={reg.campName || 'Camp'}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <Chip
                        size="sm"
                        color={statusInfo.color}
                        variant="shadow"
                        startContent={<span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} inline-block`} />}
                        classNames={{ base: "h-6 text-xs font-semibold" }}
                      >
                        {statusInfo.label}
                      </Chip>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1 gap-3">
                    <h3 className="font-bold text-[#2C2C2C] text-base leading-snug line-clamp-2 group-hover:text-[#F2B33D] transition-colors">
                      {reg.campName || 'ชื่อค่าย'}
                    </h3>

                    <div className="space-y-1.5">
                      {reg.campLocation && (
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <FiMapPin size={11} className="text-[#F2B33D] flex-shrink-0" />
                          <span className="truncate">{reg.campLocation}</span>
                        </div>
                      )}
                      {reg.campDate && (
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <FiCalendar size={11} className="text-[#F2B33D] flex-shrink-0" />
                          <span>{reg.campDate}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <FiClock size={11} className="flex-shrink-0" />
                        <span>สมัครเมื่อ {new Date(reg.appliedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-gray-50">
                      <button
                        onClick={() => router.push(`/camps/${reg.campId}`)}
                        className="w-full bg-gray-50 hover:bg-[#FFF3D0] text-[#2C2C2C] hover:text-[#F2B33D] font-semibold py-2.5 px-4 rounded-xl text-sm transition-all"
                      >
                        ดูรายละเอียดค่าย
                      </button>

                      {isUpcoming && (
                        <button
                          onClick={() => handleConfirmAttendance(reg._id, reg.campName || 'ค่าย')}
                          className="w-full bg-[#F2B33D] hover:bg-[#e0a530] text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <FiCheckCircle size={14} />
                          ยืนยันการเข้าร่วม
                        </button>
                      )}

                      {isCompleted && (
                        <button
                          onClick={() => router.push(`/camps/${reg.campId}#reviews`)}
                          className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-bold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <FiStar size={14} />
                          เขียนรีวิว
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
