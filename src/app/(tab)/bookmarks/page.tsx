'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaBookmark } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import HeroBanner from '@/components/HeroBanner';
import CampCard, { CampData } from '@/components/(card)/CampCard';
import { Review } from '@/types/camp';

interface ApiCamp {
  _id: string;
  name: string;
  image: string;
  date: string;
  location: string;
  price: string;
  deadline: string;
  registrationDeadline?: string;
  description: string;
  category: string;
  avgRating?: number;
  reviews?: Review[];
  capacity?: number;
  participantCount?: number;
  enrolled?: number;
}

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [camps, setCamps] = useState<CampData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    try {
      const bmRes = await fetch('/api/user/bookmarks');
      const { bookmarks } = await bmRes.json() as { bookmarks: string[] };
      if (!bookmarks || bookmarks.length === 0) {
        setCamps([]);
        return;
      }

      const campsRes = await fetch('/api/camps');
      const allCamps = await campsRes.json() as ApiCamp[];

      const bookmarkedCamps: CampData[] = allCamps
        .filter((c) => bookmarks.includes(c._id))
        .map((c): CampData => {
          const deadline = c.registrationDeadline || c.deadline;
          let daysLeft = 0;
          if (deadline) {
            const diff = new Date(deadline).getTime() - new Date().setHours(0, 0, 0, 0);
            daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
          }
          return {
            id: c._id,
            name: c.name,
            image: c.image,
            date: c.date,
            location: c.location,
            price: c.price,
            deadline: c.deadline,
            daysLeft,
            description: c.description,
            category: c.category,
            avgRating: c.avgRating,
            reviews: c.reviews,
            capacity: c.capacity || c.participantCount,
            enrolled: c.enrolled || 0,
            initialBookmarked: true,
          };
        });

      setCamps(bookmarkedCamps);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchBookmarks();
    }
  }, [status, router, fetchBookmarks]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <HeroBanner
          badge="Saved Camps"
          title="BOOK"
          titleHighlight="MARK"
          subtitle="ค่ายที่บันทึกไว้"
          description="กำลังโหลด..."
          showButtons={false}
          />
          <div className="max-w-[1536px] mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <HeroBanner
        badge="Saved Camps"
        title="BOOK"
        titleHighlight="MARK"
        subtitle="ค่ายที่บันทึกไว้"
        description={
          camps.length > 0
            ? `${camps.length} ค่ายที่คุณสนใจ • กดเพื่อดูรายละเอียดและสมัครได้เลย`
            : 'บันทึกค่ายที่สนใจเพื่อดูทีหลัง'
        }
        showButtons={false}
      />

      <div className="max-w-[1536px] mx-auto px-6 py-10">
        {camps.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#F2B33D] to-orange-400" />
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF3D0] flex items-center justify-center mb-4">
                <FaBookmark className="text-[#F2B33D]" size={28} />
              </div>
              <h2 className="text-xl font-bold text-[#2C2C2C] mb-2">ยังไม่มีค่ายที่บันทึกไว้</h2>
              <p className="text-gray-400 text-sm mb-8 max-w-xs">
                กด Bookmark ที่การ์ดค่ายใดก็ได้ เพื่อบันทึกไว้ดูทีหลัง
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {camps.map((camp) => (
              <CampCard key={camp.id} camp={camp} variant="compact" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
