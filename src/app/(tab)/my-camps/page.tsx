"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, Button, Chip, Tabs, Tab } from '@heroui/react';
import { FiCalendar, FiMapPin, FiCheckCircle, FiClock, FiStar } from 'react-icons/fi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
  updatedAt: string;
}

export default function MyCampsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attended');

  const fetchRegistrations = useCallback(async () => {
    if (!session?.user?.email) return;
    
    try {
      setLoading(true);
      console.log('Fetching registrations for:', session.user.email);
      
      const response = await fetch(`/api/registrations?userId=${encodeURIComponent(session.user.email)}`);
      const data = await response.json();
      
      console.log('Registrations response:', data);
      
      if (data.registrations) {
        const registrationsWithCamps = await Promise.all(
          data.registrations.map(async (reg: Registration) => {
            try {
              const campResponse = await fetch(`/api/camps/${reg.campId}`);
              const campData: CampDetails = await campResponse.json();
              console.log('Camp data for', reg.campId, ':', campData);
              return {
                ...reg,
                campName: campData.name,
                campImage: campData.image,
                campLocation: campData.location,
                campDate: campData.date,
              };
            } catch {
              return reg;
            }
          })
        );
        console.log('Final registrations with camps:', registrationsWithCamps);
        setRegistrations(registrationsWithCamps);
      }
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchRegistrations();
    }
  }, [status, session, fetchRegistrations]);

  const handleConfirmAttendance = async (registrationId: string, campName: string) => {
    if (!confirm(`ยืนยันการเข้าร่วมค่าย "${campName}" หรือไม่?`)) return;

    try {
      const response = await fetch(`/api/registrations/${registrationId}/confirm`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to confirm');

      toast.success('✅ ยืนยันการเข้าร่วมสำเร็จ!');
      fetchRegistrations();
    } catch {
      toast.error('เกิดข้อผิดพลาดในการยืนยัน');
    }
  };

  const attendedCamps = registrations.filter(r => r.status === 'attended');
  const upcomingCamps = registrations.filter(r => r.status === 'approved');

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h2>
          <Button color="primary" onPress={() => router.push('/login')}>
            เข้าสู่ระบบ
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            🎯 ค่ายของฉัน
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            จัดการและยืนยันการเข้าร่วมค่าย
          </p>
        </div>

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          className="mb-6"
        >
          <Tab
            key="attended"
            title={
              <div className="flex items-center gap-2">
                <FiCheckCircle />
                <span>เข้าร่วมแล้ว ({attendedCamps.length})</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {attendedCamps.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">ยังไม่มีค่ายที่เข้าร่วม</p>
                </div>
              ) : (
                attendedCamps.map((reg) => (
                  <Card key={reg._id} className="overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={reg.campImage || '/api/placeholder/400/300'}
                        alt={reg.campName || 'Camp'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-2 right-2">
                        <Chip size="sm" color="success" variant="shadow">
                          เข้าร่วมแล้ว
                        </Chip>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{reg.campName}</h3>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <FiMapPin />
                          <span>{reg.campLocation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiCalendar />
                          <span>{reg.campDate}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          color="primary"
                          className="w-full"
                          onPress={() => router.push(`/camps/${reg.campId}`)}
                        >
                          ดูรายละเอียด
                        </Button>
                        <Button
                          size="sm"
                          color="warning"
                          variant="flat"
                          className="w-full"
                          startContent={<FiStar />}
                        >
                          เขียนรีวิว
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Tab>

          <Tab
            key="upcoming"
            title={
              <div className="flex items-center gap-2">
                <FiClock />
                <span>กำลังจะมาถึง ({upcomingCamps.length})</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {upcomingCamps.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">ไม่มีค่ายที่กำลังจะมาถึง</p>
                </div>
              ) : (
                upcomingCamps.map((reg) => (
                  <Card key={reg._id} className="overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={reg.campImage || '/api/placeholder/400/300'}
                        alt={reg.campName || 'Camp'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-2 right-2">
                        <Chip size="sm" color="primary" variant="shadow">
                          อนุมัติแล้ว
                        </Chip>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{reg.campName}</h3>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <FiMapPin />
                          <span>{reg.campLocation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiCalendar />
                          <span>{reg.campDate}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          color="primary"
                          className="w-full"
                          onPress={() => router.push(`/camps/${reg.campId}`)}
                        >
                          ดูรายละเอียด
                        </Button>
                        <Button
                          size="sm"
                          color="success"
                          variant="flat"
                          className="w-full"
                          startContent={<FiCheckCircle />}
                          onPress={() => handleConfirmAttendance(reg._id, reg.campName || 'ค่าย')}
                        >
                          ยืนยันการเข้าร่วม
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
