"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PromoCodeList from '@/components/promo/PromoCodeList';
import toast from 'react-hot-toast';
import { isAdminRole } from '@/lib/auth-check';

interface Camp {
  [x: string]: string;
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
      return; // หยุดการทำงาน
    }
    
    if (status === 'authenticated') {
      if (session?.user.role !== 'organizer' && !isAdminRole(session?.user.role)) {
        router.push('/');
        toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        return; // หยุดการทำงาน
      }
      
      // เรียก fetchCamps แค่ครั้งเดียว
      if (loading) {
        fetchCamps();
      }
    }
  }); // ลบ session และ router ออกจาก dependencies

  const fetchCamps = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/camps?includeAll=true');
      const data = await response.json();
      const allCamps = Array.isArray(data) ? data : (data.camps || []);
      
      // Organizer เห็นเฉพาะค่ายของตัวเอง, Admin/Super Admin เห็นทั้งหมด
      if (session?.user.role === 'organizer') {
        const myCamps = allCamps.filter((c: Camp) => c.organizerId === session.user.id);
        setCamps(myCamps);
      } else {
        setCamps(allCamps);
      }
    } catch (error) {
      console.error('Error fetching camps:', error);
      toast.error('ไม่สามารถโหลดข้อมูลค่ายได้');
    } finally {
      setLoading(false);
    }
  };

  // ใช้ useMemo เพื่อป้องกัน re-render ของ PromoCodeList
  const memoizedCamps = useMemo(() => camps, [camps]);
  const memoizedUserRole = useMemo(() => (isAdminRole(session?.user?.role) ? 'admin' : 'organizer') as 'admin' | 'organizer', [session?.user?.role]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!session || (session.user.role !== 'organizer' && !isAdminRole(session.user.role))) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-[1536px] mx-auto">
        <PromoCodeList
          userRole={memoizedUserRole}
          organizerCamps={memoizedCamps}
        />
      </div>
    </div>
  );
}
