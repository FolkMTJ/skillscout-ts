'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiArrowLeft, FiStar, FiCalendar, FiMapPin, FiUsers, FiAward } from 'react-icons/fi';
import Pagination from '@/components/Pagination';

interface OrganizerCamp {
  _id: string;
  name: string;
  image: string;
  date: string;
  location: string;
  price: string;
  category: string;
  enrolled: number;
  capacity: number;
  avgRating: number;
  reviewCount: number;
  status: string;
  slug: string;
}

interface OrganizerProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
}

interface OrganizerStats {
  totalCamps: number;
  totalReviews: number;
  avgRating: number;
}

interface RecentReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  campName: string;
  campId: string;
}

interface OrganizerData {
  organizer: OrganizerProfile;
  camps: OrganizerCamp[];
  stats: OrganizerStats;
  recentReviews: RecentReview[];
}

export default function OrganizerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<OrganizerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentCampPage, setCurrentCampPage] = useState(1);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/organizers/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setData)
      .catch(() => setError('ไม่พบข้อมูลผู้จัดค่าย'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-950">
        <div className="max-w-[1536px] mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 h-20" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl h-48" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error || 'ไม่พบข้อมูล'}</p>
          <button onClick={() => router.back()} className="text-[#F2B33D] font-medium hover:underline">
            ย้อนกลับ
          </button>
        </div>
      </div>
    );
  }

  const { organizer, camps, stats, recentReviews } = data;
  const initials = organizer.name?.charAt(0)?.toUpperCase() || 'O';

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-950">
      <div className="max-w-[1536px] mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#F2B33D] transition-colors"
        >
          <FiArrowLeft size={15} />
          ย้อนกลับ
        </button>

        {/* Profile header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex items-center gap-5 shadow-sm">
          <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#F2B33D]/40">
            {organizer.image ? (
              <Image src={organizer.image} alt={organizer.name} fill className="object-cover" sizes="80px" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{initials}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-black text-[#2C2C2C] dark:text-white truncate">{organizer.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">ผู้จัดค่าย</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-[#F2B33D]">{stats.totalCamps}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ค่ายที่จัด</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-[#F2B33D]">{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">คะแนนเฉลี่ย</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-[#F2B33D]">{stats.totalReviews}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">รีวิวทั้งหมด</p>
          </div>
        </div>

        {/* Camps list */}
        {camps.length > 0 && (() => {
          const campsPerPage = 6;
          const totalCampPages = Math.ceil(camps.length / campsPerPage);
          const paginatedCamps = camps.slice((currentCampPage - 1) * campsPerPage, currentCampPage * campsPerPage);

          return (
            <div>
              <h2 className="text-base font-bold text-[#2C2C2C] dark:text-white mb-3 flex items-center gap-2">
                <FiAward className="text-[#F2B33D]" />
                ค่ายที่จัดมาแล้ว
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedCamps.map(camp => (
                  <button
                    key={camp._id}
                    onClick={() => router.push(`/camps/${camp._id}`)}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md hover:border-[#F2B33D]/40 transition-all text-left"
                  >
                    <div className="relative aspect-video">
                      <Image src={camp.image} alt={camp.name} fill className="object-cover" sizes="400px" />
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-sm text-[#2C2C2C] dark:text-white line-clamp-2 mb-2">{camp.name}</p>
                      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <FiCalendar size={11} />
                          <span>{camp.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiMapPin size={11} />
                          <span className="truncate">{camp.location}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <FiUsers size={11} />
                            <span>{camp.enrolled}/{camp.capacity} คน</span>
                          </div>
                          {camp.avgRating > 0 && (
                            <div className="flex items-center gap-1 text-amber-500">
                              <FiStar size={11} className="fill-amber-500" />
                              <span className="font-medium">{camp.avgRating.toFixed(1)}</span>
                              <span className="text-gray-400">({camp.reviewCount})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {totalCampPages > 1 && (
                <Pagination
                  currentPage={currentCampPage}
                  totalPages={totalCampPages}
                  onPageChange={setCurrentCampPage}
                />
              )}
            </div>
          );
        })()}

        {/* Recent reviews */}
        {recentReviews.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-[#2C2C2C] dark:text-white mb-3 flex items-center gap-2">
              <FiStar className="text-[#F2B33D]" />
              รีวิวล่าสุด
            </h2>
            <div className="space-y-3">
              {recentReviews.map((review, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-[#2C2C2C] dark:text-white">{review.author}</p>
                      <p className="text-xs text-gray-400">จากค่าย: {review.campName}</p>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <FiStar
                          key={idx}
                          size={12}
                          className={idx < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {camps.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FiAward className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>ยังไม่มีประวัติค่ายที่จัด</p>
          </div>
        )}

      </div>
    </div>
  );
}
