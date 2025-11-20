"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PromoCodeList from '@/components/promo/PromoCodeList';
import toast from 'react-hot-toast';

interface Camp {
  _id: string;
  name: string;
}

export default function PromoCodesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'organizer' && session.user.role !== 'admin') {
        router.push('/');
        toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      } else {
        fetchCamps();
      }
    }
  }, [status, session, router]);

  const fetchCamps = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/camps?includeAll=true');
      const data = await response.json();
      const allCamps = Array.isArray(data) ? data : (data.camps || []);
      
      // Organizer เห็นเฉพาะค่ายของตัวเอง
      if (session?.user.role === 'organizer') {
        const myCamps = allCamps.filter((c: Camp) => c.organizerId === session.user.id);
        setCamps(myCamps);
      } else {
        // Admin เห็นทั้งหมด (แต่ไม่จำเป็นต้องใช้ในการสร้างโค้ด)
        setCamps([]);
      }
    } catch (error) {
      console.error('Error fetching camps:', error);
      toast.error('ไม่สามารถโหลดข้อมูลค่ายได้');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!session || (session.user.role !== 'organizer' && session.user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <PromoCodeList
          userRole={session.user.role as 'admin' | 'organizer'}
          organizerCamps={camps}
        />
      </div>
    </div>
  );
}
