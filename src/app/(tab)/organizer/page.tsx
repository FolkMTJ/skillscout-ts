// src/app/organizer/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Button, useDisclosure, Chip, Modal, ModalContent, ModalHeader, ModalBody, Input } from '@heroui/react';
import { FiCalendar, FiUsers, FiCheckCircle, FiPlus, FiClock, FiUserCheck, FiCreditCard, FiZap, FiBook, FiAlertCircle, FiTag, FiSearch } from 'react-icons/fi';
import { Camp, Registration, RegistrationStatus } from '@/types';
import {
  CampFormModal, CampDetailModal, CampCardWithImage, EmptyState
} from '@/components/organizer';
import PromoCodeManager from '@/components/organizer/PromoCodeManager';
import toast from 'react-hot-toast';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType; // ใช้สำหรับ Component Icon (เช่น FiCalendar)
  colorClass: string;
  trend?: string; // เครื่องหมาย ? หมายถึงมีหรือไม่มีก็ได้ (Optional)
}

export default function OrganizerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCamp, setEditingCamp] = useState<Camp | null>(null);
  const [viewingCamp, setViewingCamp] = useState<Camp | null>(null);

  const { isOpen: isFormModalOpen, onOpen: onFormModalOpen, onClose: onFormModalClose } = useDisclosure();
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onClose: onDetailModalClose } = useDisclosure();
  const { isOpen: isPromoModalOpen, onOpen: onPromoModalOpen, onClose: onPromoModalClose } = useDisclosure();

  const [formData, setFormData] = useState({
    name: '', description: '', startDate: '', endDate: '', registrationDeadline: '',
    location: '', capacity: '', fee: '0', tags: [] as string[], image: '', galleryImages: [] as string[],
    activityFormat: 'On-site', qualificationLevel: 'ทุกระดับ', qualificationDetails: '',
    additionalInfo: [] as string[], organizers: [] as Array<{ name: string; imageUrl: string }>,
    hasCertificate: false, allowVocational: false,
  });

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const campsRes = await fetch('/api/camps?includeAll=true');
      if (!campsRes.ok) throw new Error('Failed to fetch camps');
      const campsData = await campsRes.json();
      const allCamps = Array.isArray(campsData) ? campsData : (campsData.camps || []);

      // Admin สามารถดูค่ายทั้งหมด, Organizer ดูเฉพาะค่ายของตัวเอง
      const myCamps = session.user.role === 'admin'
        ? allCamps
        : allCamps.filter((c: Camp) => c.organizerId === session.user.id);

      console.log('=== ORGANIZER DASHBOARD ===');
      console.log('Total camps loaded:', myCamps.length);
      console.log('Camps with status:', myCamps.map((c: Camp) => ({ name: c.name, status: c.status || 'NO STATUS' })));
      console.log('==========================');

      setCamps(myCamps);

      if (myCamps.length > 0) {
        const regPromises = myCamps.map((camp: Camp) =>
          fetch(`/api/registrations?campId=${camp._id}`)
            .then(r => r.json())
            .then(data => {
              console.log(`Registrations for camp ${camp._id}:`, data);
              return data;
            })
            .catch(err => {
              console.error(`Error fetching registrations for camp ${camp._id}:`, err);
              return { registrations: [] };
            })
        );
        const regResults = await Promise.all(regPromises);
        const allRegs = regResults.flatMap(r => r.registrations || []);
        console.log('Total registrations loaded:', allRegs.length);
        setRegistrations(allRegs);
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, session?.user?.role]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) fetchData();
  }, [status, session?.user?.id, fetchData]);

  const handleCreateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return toast.error('กรุณาเข้าสู่ระบบก่อน');
    if (!formData.name || !formData.description || !formData.location || !formData.startDate || !formData.endDate || !formData.registrationDeadline) {
      return toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
    }

    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const registrationDeadline = new Date(formData.registrationDeadline);

      const qualificationInfo = [];
      if (formData.qualificationDetails) qualificationInfo.push(formData.qualificationDetails);
      if (formData.allowVocational) qualificationInfo.push('สายอาชีวะสามารถสมัครได้');

      const additionalInfo = [...formData.additionalInfo];
      if (formData.hasCertificate) additionalInfo.push('มีประกาศนียบัตร');

      const campPayload = {
        name: formData.name,
        category: formData.tags[0] || 'General',
        date: `${startDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })} - ${endDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        location: formData.location,
        price: `฿${parseInt(formData.fee || '0').toLocaleString()}`,
        image: formData.image || '/api/placeholder/800/600',
        galleryImages: formData.galleryImages,
        description: formData.description,
        deadline: registrationDeadline.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }),
        participantCount: parseInt(formData.capacity || '0'),
        activityFormat: formData.activityFormat,
        qualifications: { level: formData.qualificationLevel, fields: qualificationInfo },
        additionalInfo,
        organizers: formData.organizers.length > 0 ? formData.organizers : [{ name: session.user.name || 'Organizer', imageUrl: session.user.image || '/api/placeholder/100/100' }],
        reviews: [],
        avgRating: 0,
        ratingBreakdown: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
        featured: false,
        slug,
        organizerId: session.user.id,
        organizerName: session.user.name,
        organizerEmail: session.user.email,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        registrationDeadline: registrationDeadline.toISOString(),
        capacity: parseInt(formData.capacity || '0'),
        enrolled: 0,
        fee: parseInt(formData.fee || '0'),
        tags: formData.tags,
        status: 'pending' as const,
      };

      const response = await fetch('/api/camps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);

        // แสดง validation errors ถ้ามี
        if (errorData.issues && Array.isArray(errorData.issues)) {
          const errorMessages = errorData.issues.map((issue: { path: string[]; message: string }) => {
            const field = issue.path.join('.');
            const fieldNames: Record<string, string> = {
              'name': 'ชื่อค่าย',
              'description': 'คำอธิบาย',
              'location': 'สถานที่',
              'fee': 'ค่าธรรมเนียม',
              'capacity': 'จำนวนที่รับ'
            };
            return `${fieldNames[field] || field}: ${issue.message}`;
          }).join('\n');

          toast.error(
            <div>
              <div className="font-bold mb-2">ข้อมูลไม่ถูกต้อง:</div>
              <div className="text-sm whitespace-pre-line">{errorMessages}</div>
            </div>,
            { duration: 5000 }
          );
          return;
        }

        throw new Error(errorData.message || errorData.error || 'Failed to create camp');
      }

      toast.success('สร้างค่ายสำเร็จ! รอ Admin ตรวจสอบก่อนเปิดใช้งาน', {
        duration: 4000,
        icon: '⏳',
      });
      onFormModalClose();
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating camp:', error);
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างค่าย');
    }
  };

  const handleUpdateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCamp) return;

    try {
      const slug = formData.name !== editingCamp.name
        ? formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : editingCamp.slug;

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const registrationDeadline = new Date(formData.registrationDeadline);

      const qualificationInfo = [];
      if (formData.qualificationDetails) qualificationInfo.push(formData.qualificationDetails);
      if (formData.allowVocational) qualificationInfo.push('สายอาชีวะสามารถสมัครได้');

      const additionalInfo = [...formData.additionalInfo];
      if (formData.hasCertificate) additionalInfo.push('มีประกาศนียบัตร');

      const updatePayload = {
        name: formData.name, description: formData.description, location: formData.location,
        startDate: startDate.toISOString(), endDate: endDate.toISOString(),
        registrationDeadline: registrationDeadline.toISOString(),
        capacity: parseInt(formData.capacity), fee: parseInt(formData.fee), tags: formData.tags, slug,
        image: formData.image, galleryImages: formData.galleryImages, activityFormat: formData.activityFormat,
        date: `${startDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })} - ${endDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        deadline: registrationDeadline.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }),
        participantCount: parseInt(formData.capacity),
        price: `฿${parseInt(formData.fee).toLocaleString()}`,
        qualifications: { level: formData.qualificationLevel, fields: qualificationInfo },
        additionalInfo, organizers: formData.organizers.length > 0 ? formData.organizers : editingCamp.organizers,
        // ถ้าค่ายถูกปฏิเสธ เมื่อแก้ไขให้เปลี่ยน status เป็น pending อีกครั้ง
        ...(editingCamp.status === 'rejected' && { status: 'pending' }),
      };

      const response = await fetch(`/api/camps/${editingCamp._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) throw new Error((await response.json()).error || 'Failed to update camp');

      if (editingCamp.status === 'rejected') {
        toast.success('อัพเดทค่ายสำเร็จ! ค่ายถูกส่งไปตรวจสอบอีกครั้ง');
      } else {
        toast.success('อัพเดทค่ายสำเร็จ!');
      }
      onFormModalClose();
      setEditingCamp(null);
      resetForm();
      fetchData();
    } catch (updateError) {
      console.error('Error updating camp:', updateError);
      toast.error(updateError instanceof Error ? updateError.message : 'เกิดข้อผิดพลาดในการอัพเดทค่าย');
    }
  };

  const handleDeleteCamp = async (campId: string) => {
    if (!confirm('คุณต้องการลบค่ายนี้หรือไม่?')) return;
    try {
      const response = await fetch(`/api/camps/${campId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      toast.success('ลบค่ายสำเร็จ!');
      fetchData();
    } catch {
      toast.error('เกิดข้อผิดพลาดในการลบค่าย');
    }
  };

  const handleCompleteCamp = async (campId: string, campName: string) => {
    const message = 'ยืนยันจบค่าย "' + campName + '" หรือไม่?\n\nหมายเหตุ: ค่ายจะถูกตั้งเป็นสถานะ "จบแล้ว" และไม่สามารถรับสมัครเพิ่มได้';
    if (!confirm(message)) return;

    try {
      const response = await fetch('/api/camps/' + campId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          endDate: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Failed to complete camp');

      toast.success('จบค่ายสำเร็จ!');
      fetchData();
    } catch (completeError) {
      console.error('Error completing camp:', completeError);
      toast.error('เกิดข้อผิดพลาดในการจบค่าย');
    }
  };

  const handleEditCamp = (camp: Camp) => {
    setEditingCamp(camp);
    const qualificationFields = camp.qualifications?.fields || [];
    const allowVocational = qualificationFields.some(f => f.includes('อาชีวะ'));
    const qualificationDetails = qualificationFields.filter(f => !f.includes('อาชีวะ')).join(', ');
    const additionalInfo = camp.additionalInfo || [];
    const hasCertificate = additionalInfo.some(info => info.includes('ประกาศนียบัตร'));
    const filteredAdditionalInfo = additionalInfo.filter(info => !info.includes('ประกาศนียบัตร'));

    setFormData({
      name: camp.name, description: camp.description,
      startDate: camp.startDate ? new Date(camp.startDate).toISOString().split('T')[0] : '',
      endDate: camp.endDate ? new Date(camp.endDate).toISOString().split('T')[0] : '',
      registrationDeadline: camp.registrationDeadline ? new Date(camp.registrationDeadline).toISOString().split('T')[0] : '',
      location: camp.location,
      capacity: camp.capacity?.toString() || camp.participantCount.toString(),
      fee: camp.fee?.toString() || '0', tags: camp.tags || [],
      image: camp.image || '', galleryImages: camp.galleryImages || [],
      activityFormat: camp.activityFormat || 'On-site',
      qualificationLevel: camp.qualifications?.level || 'ทุกระดับ',
      qualificationDetails, additionalInfo: filteredAdditionalInfo,
      organizers: camp.organizers || [], hasCertificate, allowVocational,
    });
    onFormModalOpen();
  };

  const handleViewCamp = (camp: Camp) => {
    setViewingCamp(camp);
    onDetailModalOpen();
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', startDate: '', endDate: '', registrationDeadline: '',
      location: '', capacity: '', fee: '0', tags: [], image: '', galleryImages: [],
      activityFormat: 'On-site', qualificationLevel: 'ทุกระดับ', qualificationDetails: '',
      additionalInfo: [], organizers: [], hasCertificate: false, allowVocational: false,
    });
    setEditingCamp(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    onFormModalOpen();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-96 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-64"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1 space-y-6 animate-pulse">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>

              {/* Pending Camps */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>

                {/* Camp Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="flex gap-2 pt-2">
                          <div className="h-8 bg-gray-200 rounded-lg flex-1"></div>
                          <div className="h-8 bg-gray-200 rounded-lg flex-1"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-gray-600 mb-6">คุณต้องเข้าสู่ระบบเพื่อเข้าถึงหน้านี้</p>
          <Button color="primary" href="/login">เข้าสู่ระบบ</Button>
        </Card>
      </div>
    );
  }

  const totalEnrolled = camps.reduce((sum, c) => sum + (c.enrolled || 0), 0);

  // กรองค่ายรอตรวจสอบ (status = pending หรือไม่มี status)
  const pendingCamps = camps.filter(c => c.status === 'pending');

  // กรองค่ายที่จบแล้ว
  const completedCamps = camps.filter(c => {
    return c.status === 'completed' || (c.endDate && new Date(c.endDate) < new Date());
  });

  // กรองค่ายที่ถูกปฏิเสธ
  const rejectedCamps = camps.filter(c => c.status === 'rejected');

  const attendedRegs = registrations.filter(r => r.status === RegistrationStatus.CONFIRMED).length;

  const ModernStatCard = ({ title, value, icon: Icon, colorClass}: StatCardProps) => {
    // Map สีเพื่อให้ icon ชัดเจน
    const iconColorMap: Record<string, string> = {
      'bg-[#F2B33D]': 'text-[#F2B33D]',
      'bg-green-500': 'text-green-600',
      'bg-orange-500': 'text-orange-600',
      'bg-gray-500': 'text-gray-600',
      'bg-purple-500': 'text-purple-600',
    };
    
    const iconColor = iconColorMap[colorClass] || colorClass.replace('bg-', 'text-');
    
    return (
      <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white">
        <div className="p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
          </div>
          {/* ลบ bg-opacity-10 และ ${colorClass} ออกจาก background */}
          <div className="p-3 rounded-xl">
            <Icon className={`w-10 h-10 ${iconColor}`} />
          </div>
        </div>
        {/* Optional: Add a subtle progress bar or trend line at bottom */}
        <div className={`h-1 w-full bg-opacity-20 ${colorClass}`}>
          <div className={`h-full ${colorClass} w-[70%]`}></div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-50 to-transparent -z-10" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              Organizer Dashboard
              {/* <Chip color="warning" variant="flat" size="sm" className="bg-[#F2B33D]/20 text-[#F2B33D]">PRO</Chip> */}
            </h1>
            <p className="text-gray-500 mt-1">ยินดีต้อนรับกลับ! จัดการค่ายและติดตามผลลัพธ์ของคุณได้ที่นี่</p>
          </div>
          <div className="flex gap-3">
            {/* <Button
              className="bg-white text-gray-700 font-medium shadow-sm border border-gray-200"
              startContent={<FiSettings />}
            >
              ตั้งค่า
            </Button> */}
            <Button
              className="bg-[#F2B33D] text-white font-bold shadow-lg shadow-orange-200"
              startContent={<FiPlus />}
              onPress={handleOpenCreateModal}
            >
              สร้างค่ายใหม่
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <ModernStatCard
            title="ค่ายทั้งหมด"
            value={camps.length}
            icon={FiCalendar}
            colorClass="bg-[#F2B33D]"
          />
          <ModernStatCard
            title="ผู้เข้าร่วมรวม"
            value={totalEnrolled}
            icon={FiUsers}
            colorClass="bg-green-500"
          />
          <ModernStatCard
            title="รอตรวจสอบ"
            value={pendingCamps.length}
            icon={FiClock}
            colorClass="bg-orange-500"
          />
          <ModernStatCard
            title="จบกิจกรรมแล้ว"
            value={completedCamps.length}
            icon={FiCheckCircle}
            colorClass="bg-gray-500"
          />
          <ModernStatCard
            title="เช็คอินแล้ว"
            value={attendedRegs}
            icon={FiUserCheck}
            colorClass="bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

          {/* --- Left Sidebar Column (Actions & Alerts) --- */}
          <div className="xl:col-span-1 space-y-6">

            {/* Quick Actions Panel */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <FiZap className="text-[#F2B33D]" />
                  เมนูด่วน
                </h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                <Button
                  variant="flat"
                  className="h-auto py-4 flex flex-col gap-2 bg-orange-50 text-orange-700 hover:bg-orange-100"
                  onPress={handleOpenCreateModal}
                >
                  <div className="p-2 bg-white rounded-full shadow-sm"><FiPlus /></div>
                  <span className="text-xs font-semibold">สร้างค่าย</span>
                </Button>
                <Button
                  variant="flat"
                  className="h-auto py-4 flex flex-col gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  onPress={onPromoModalOpen}
                >
                  <div className="p-2 bg-white rounded-full shadow-sm"><FiTag /></div>
                  <span className="text-xs font-semibold">คูปอง</span>
                </Button>
                <Button
                  variant="flat"
                  className="h-auto py-4 flex flex-col gap-2 bg-green-50 text-green-700 hover:bg-green-100 col-span-2"
                  onPress={() => router.push('/organizer/payments')}
                >
                  <div className="p-2 bg-white rounded-full shadow-sm"><FiCreditCard /></div>
                  <span className="text-xs font-semibold">ตรวจสอบการชำระเงิน</span>
                </Button>
              </div>
            </Card>

            {/* Pending Camps Feed */}
            <Card className="border-none shadow-sm bg-white h-fit">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <FiClock className="text-gray-400" />
                  สถานะการตรวจสอบ
                </h2>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">{pendingCamps.length}</span>
              </div>
              <div className="p-0">
                {pendingCamps.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <FiCheckCircle className="w-12 h-12 mx-auto mb-2 text-green-100" />
                    <p className="text-sm">ไม่มีค่ายรอตรวจสอบ</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {pendingCamps.map(camp => (
                      <div key={camp._id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-[#F2B33D] transition-colors">
                            {camp.name}
                          </h3>
                          <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5"></div>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                          <FiCalendar size={10} /> {camp.date}
                        </p>
                        <Chip size="sm" className="bg-orange-100 text-orange-600 text-[10px] h-6">รอ Admin</Chip>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Rejected Camps Alert */}
            {rejectedCamps.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <h3 className="text-red-700 font-bold flex items-center gap-2 mb-3">
                  <FiAlertCircle /> ต้องแก้ไข ({rejectedCamps.length})
                </h3>
                <div className="space-y-2">
                  {rejectedCamps.map(camp => (
                    <div key={camp._id} className="bg-white p-3 rounded-lg shadow-sm border border-red-100">
                      <p className="text-sm font-semibold text-gray-800 mb-1">{camp.name}</p>
                      <Button
                        size="sm"
                        className="w-full bg-red-100 text-red-600 font-medium"
                        onPress={() => handleEditCamp(camp)}
                      >
                        แก้ไขทันที
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* --- Main Content Column (Camp Grid) --- */}
          <div className="xl:col-span-3">
            <Card className="border-none shadow-sm bg-white min-h-[600px]">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FiBook className="text-[#F2B33D]" />
                    ค่ายของฉัน
                  </h2>
                  <p className="text-sm text-gray-500">จัดการรายละเอียดและผู้สมัครในค่ายของคุณ</p>
                </div>

                {/* Filter / Search Placeholder */}
                <div className="flex gap-2">
                  <Input
                    placeholder="ค้นหาค่าย..."
                    startContent={<FiSearch className="text-gray-400" />}
                    size="sm"
                    variant="bordered"
                    className="w-full sm:w-64"
                    classNames={{ inputWrapper: "border-gray-200" }}
                  />
                </div>
              </div>

              <div className="p-6">
                {camps.length === 0 ? (
                  <EmptyState
                    icon={FiCalendar}
                    title="ยังไม่มีค่ายที่สร้างไว้"
                    description="เริ่มต้นสร้างค่ายแรกของคุณเพื่อเปิดโอกาสให้ผู้เรียน"
                    actionLabel="สร้างค่ายแรก"
                    onAction={handleOpenCreateModal}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {camps.map(camp => {
                      const campRegs = registrations.filter(r => r.campId === camp._id);
                      const pending = campRegs.filter(r => r.status === RegistrationStatus.PENDING).length;
                      return (
                        // Wrapper to ensure specific spacing/hover effects if needed
                        <div key={camp._id} className="h-full">
                          <CampCardWithImage
                            camp={camp}
                            pendingCount={pending}
                            onEdit={() => handleEditCamp(camp)}
                            onDelete={() => handleDeleteCamp(camp._id)}
                            onView={() => handleViewCamp(camp)}
                            onComplete={() => handleCompleteCamp(camp._id, camp.name)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>

        </div>
      </div>

      {/* Modals */}
      <CampFormModal
        isOpen={isFormModalOpen}
        onClose={onFormModalClose}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={editingCamp ? handleUpdateCamp : handleCreateCamp}
        isEditing={!!editingCamp}
      />

      {viewingCamp && (
        <CampDetailModal
          isOpen={isDetailModalOpen}
          onClose={onDetailModalClose}
          camp={viewingCamp}
          registrations={registrations.filter(r => r.campId === viewingCamp._id)}
        />
      )}

      <Modal isOpen={isPromoModalOpen} onClose={onPromoModalClose} size="4xl" scrollBehavior="inside" backdrop="blur">
        <ModalContent>
          <ModalHeader className="border-b border-gray-100 p-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-orange-100 rounded-lg text-[#F2B33D]">
                <FiTag />
              </div>
              จัดการรหัสโปรโมชั่น
            </h2>
          </ModalHeader>
          <ModalBody className="p-0 bg-gray-50/50">
            <div className="p-6">
              <PromoCodeManager
                userId={session?.user?.id || ''}
                userRole={(session?.user?.role as 'admin' | 'organizer') || 'organizer'}
                camps={camps}
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
