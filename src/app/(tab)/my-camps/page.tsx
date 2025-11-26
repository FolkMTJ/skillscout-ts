"use client";

import { useState, useEffect } from 'react';
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
  updatedAt?: string;
  reviewedAt?: string;
}

export default function MyCampsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching registrations for:', session.user.email);
        
        const response = await fetch(`/api/registrations?userId=${encodeURIComponent(session.user.email)}`);
        const data = await response.json();
        
        console.log('Registrations response:', data);
        console.log('data.registrations exists?', !!data.registrations);
        console.log('data.registrations length:', data.registrations?.length);
        console.log('data.registrations type:', typeof data.registrations);
        console.log('data.registrations is array?', Array.isArray(data.registrations));
        
        if (data.registrations && Array.isArray(data.registrations)) {
          console.log('Raw registrations from API:', data.registrations);
          const registrationsWithCamps = await Promise.all(
            data.registrations.map(async (reg: Registration) => {
              try {
                const campResponse = await fetch(`/api/camps/${reg.campId}`);
                if (!campResponse.ok) {
                  console.warn(`Camp ${reg.campId} not found, using registration data only`);
                  return reg;
                }
                const campData: CampDetails = await campResponse.json();
                console.log('Camp data for', reg.campId, ':', campData);
                return {
                  ...reg,
                  campName: campData.name,
                  campImage: campData.image,
                  campLocation: campData.location,
                  campDate: campData.date,
                };
              } catch (error) {
                console.error(`Error fetching camp ${reg.campId}:`, error);
                return reg;
              }
            })
          );
          console.log('Final registrations with camps:', registrationsWithCamps);
          console.log('About to setRegistrations with', registrationsWithCamps.length, 'items');
          setRegistrations(registrationsWithCamps);
          console.log('setRegistrations called successfully');
        }
      } catch (error) {
        console.error('Error in fetchRegistrations:', error);
        toast.error('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchRegistrations();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, session?.user?.email]);

  const handleConfirmAttendance = async (registrationId: string, campName: string) => {
    if (!confirm(`ยืนยันการเข้าร่วมค่าย "${campName}" หรือไม่?`)) return;

    try {
      const response = await fetch(`/api/registrations/${registrationId}/confirm`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to confirm');

      toast.success('ยืนยันการเข้าร่วมสำเร็จ!');
      
      // Refetch registrations
      if (session?.user?.email) {
        const regResponse = await fetch(`/api/registrations?userId=${encodeURIComponent(session.user.email)}`);
        const data = await regResponse.json();
        if (data.registrations) {
          const registrationsWithCamps = await Promise.all(
            data.registrations.map(async (reg: Registration) => {
              try {
                const campResponse = await fetch(`/api/camps/${reg.campId}`);
                if (!campResponse.ok) return reg;
                const campData: CampDetails = await campResponse.json();
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
          setRegistrations(registrationsWithCamps);
        }
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการยืนยัน');
    }
  };

  const attendedCamps = registrations.filter(r => r.status === 'attended');
  // กำลังจะมาถึง = อนุมัติแล้ว (approved) หรือยืนยันแล้ว (confirmed) แต่ยังไม่ได้เข้าร่วม (ไม่ใช่ attended)
  const upcomingCamps = registrations.filter(r => 
    r.status === 'approved' || r.status === 'confirmed'
  );
  
  console.log('=== MY CAMPS DEBUG ===');
  console.log('Total registrations:', registrations.length);
  console.log('Registrations statuses:', registrations.map(r => ({ id: r._id, status: r.status })));
  console.log('Attended camps:', attendedCamps.length);
  console.log('Upcoming camps (approved):', upcomingCamps.length);
  console.log('=====================');

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
            ค่ายของฉัน
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
        </Tabs>
      </div>
    </div>
  );
}
