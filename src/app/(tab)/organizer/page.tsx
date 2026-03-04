// src/app/organizer/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Button, useDisclosure, Chip, Modal, ModalContent, ModalHeader, ModalBody, Input, Checkbox, ModalFooter } from '@heroui/react';
import { FiCalendar, FiUsers, FiCheckCircle, FiPlus, FiClock, FiUserCheck, FiZap, FiBook, FiAlertCircle, FiTag, FiSearch, FiDollarSign } from 'react-icons/fi';
import { Camp, Registration, RegistrationStatus } from '@/types';
import {
  CampFormModal, CampCardWithImage, EmptyState
} from '@/components/organizer';
import PromoCodeManager from '@/components/organizer/PromoCodeManager';
import { ConfirmModal } from '@/components/common';
import toast from 'react-hot-toast';
import { isAdminRole } from '@/lib/auth-check';

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
  const [hasPayoutInfo, setHasPayoutInfo] = useState(false);

  const { isOpen: isFormModalOpen, onOpen: onFormModalOpen, onClose: onFormModalClose } = useDisclosure();
  const { isOpen: isPromoModalOpen, onOpen: onPromoModalOpen, onClose: onPromoModalClose } = useDisclosure();
  const { isOpen: isFeeInfoModalOpen, onOpen: onFeeInfoModalOpen, onClose: onFeeInfoModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isCompleteModalOpen, onOpen: onCompleteModalOpen, onClose: onCompleteModalClose } = useDisclosure();

  const [targetCampId, setTargetCampId] = useState<string | null>(null);
  const [targetCampName, setTargetCampName] = useState<string>('');

  const [platformFeePercent, setPlatformFeePercent] = useState<number>(0);
  const [hideFeeInfoNextTime, setHideFeeInfoNextTime] = useState(false);

  // Tab + Pagination + Search สำหรับ ค่ายของฉัน
  const [campTab, setCampTab] = useState<'active' | 'completed' | 'all'>('active');
  const [campPage, setCampPage] = useState(1);
  const [campSearch, setCampSearch] = useState('');
  const CAMPS_PER_PAGE = 6;

  const [formData, setFormData] = useState({
    name: '', description: '', startDate: '', endDate: '', registrationDeadline: '',
    location: '', capacity: '', fee: '0', tags: [] as string[], image: '', galleryImages: [] as string[],
    activityFormat: 'On-site', qualificationLevel: 'ทุกระดับ', qualificationDetails: '',
    additionalInfo: [] as string[], organizers: [] as Array<{ name: string; imageUrl: string }>,
    hasCertificate: false, allowVocational: false,
    requiresPortfolio: false, portfolioInstructions: '',
    originalFee: '',
  });

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const [campsRes, payoutRes, settingsRes] = await Promise.all([
        fetch('/api/camps?includeAll=true'),
        fetch('/api/organizer/payout'),
        fetch('/api/admin/settings'),
      ]);
      if (!campsRes.ok) throw new Error('Failed to fetch camps');
      const payoutData = await payoutRes.json().catch(() => ({}));
      setHasPayoutInfo(!!(payoutData.success && payoutData.payoutInfo));

      const settingsData = await settingsRes.json().catch(() => ({}));
      setPlatformFeePercent(settingsData.platformFeePercent || 0);

      const campsData = await campsRes.json();
      const allCamps = Array.isArray(campsData) ? campsData : (campsData.camps || []);

      // Admin/Super Admin สามารถดูค่ายทั้งหมด, Organizer ดูเฉพาะค่ายของตัวเอง
      const myCamps = isAdminRole(session.user.role)
        ? allCamps
        : allCamps.filter((c: Camp) => c.organizerId === session.user.id);

      setCamps(myCamps);

      if (myCamps.length > 0) {
        const campIds = myCamps.map((c: Camp) => c._id).join(',');
        const regRes = await fetch(`/api/registrations?campIds=${campIds}`);
        const regData = await regRes.json().catch(() => ({ registrations: [] }));
        setRegistrations(regData.registrations || []);
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
        originalFee: formData.originalFee ? parseInt(formData.originalFee) : undefined,
        tags: formData.tags,
        status: 'pending' as const,
        requiresPortfolio: formData.requiresPortfolio,
        portfolioInstructions: formData.requiresPortfolio ? formData.portfolioInstructions : undefined,
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
        capacity: parseInt(formData.capacity), fee: parseInt(formData.fee),
        originalFee: formData.originalFee ? parseInt(formData.originalFee) : undefined,
        tags: formData.tags, slug,
        image: formData.image, galleryImages: formData.galleryImages, activityFormat: formData.activityFormat,
        date: `${startDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })} - ${endDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        deadline: registrationDeadline.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }),
        participantCount: parseInt(formData.capacity),
        price: `฿${parseInt(formData.fee).toLocaleString()}`,
        qualifications: { level: formData.qualificationLevel, fields: qualificationInfo },
        additionalInfo, organizers: formData.organizers.length > 0 ? formData.organizers : editingCamp.organizers,
        requiresPortfolio: formData.requiresPortfolio,
        portfolioInstructions: formData.requiresPortfolio ? formData.portfolioInstructions : undefined,
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

  const confirmDeleteCamp = async () => {
    if (!targetCampId) return;
    try {
      const response = await fetch(`/api/camps/${targetCampId}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || 'เกิดข้อผิดพลาดในการลบค่าย');
        return;
      }
      toast.success('ลบค่ายสำเร็จ!');
      onDeleteModalClose();
      fetchData();
    } catch {
      toast.error('เกิดข้อผิดพลาดในการลบค่าย');
    }
  };

  const handleDeleteCamp = (campId: string) => {
    setTargetCampId(campId);
    onDeleteModalOpen();
  };

  const confirmCompleteCamp = async () => {
    if (!targetCampId) return;
    try {
      const response = await fetch('/api/camps/' + targetCampId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          endDate: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Failed to complete camp');

      toast.success('จบค่ายสำเร็จ!');
      onCompleteModalClose();
      fetchData();
    } catch (completeError) {
      console.error('Error completing camp:', completeError);
      toast.error('เกิดข้อผิดพลาดในการจบค่าย');
    }
  };

  const handleCompleteCamp = (campId: string, campName: string) => {
    setTargetCampId(campId);
    setTargetCampName(campName);
    onCompleteModalOpen();
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
      requiresPortfolio: camp.requiresPortfolio || false,
      portfolioInstructions: camp.portfolioInstructions || '',
      originalFee: camp.originalFee?.toString() || '',
    });
    onFormModalOpen();
  };

  const handleViewCamp = (camp: Camp) => {
    router.push(`/organizer/camps/${camp._id}`);
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', startDate: '', endDate: '', registrationDeadline: '',
      location: '', capacity: '', fee: '0', tags: [], image: '', galleryImages: [],
      activityFormat: 'On-site', qualificationLevel: 'ทุกระดับ', qualificationDetails: '',
      additionalInfo: [], organizers: [], hasCertificate: false, allowVocational: false,
      requiresPortfolio: false, portfolioInstructions: '', originalFee: '',
    });
    setEditingCamp(null);
  };

  const handleOpenCreateModal = () => {
    if (!hasPayoutInfo) {
      toast('กรุณาตั้งค่า PromptPay ก่อนสร้างค่าย', { icon: '💳', duration: 4000 });
      router.push('/organizer/payout-settings');
      return;
    }

    const hideInfo = localStorage.getItem('hidePlatformFeeInfo');
    if (hideInfo === 'true') {
      resetForm();
      onFormModalOpen();
    } else {
      onFeeInfoModalOpen();
    }
  };

  const handleProceedCreateCamp = () => {
    if (hideFeeInfoNextTime) {
      localStorage.setItem('hidePlatformFeeInfo', 'true');
    }
    onFeeInfoModalClose();
    resetForm();
    onFormModalOpen();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-[1536px] mx-auto px-4">
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

  const ModernStatCard = ({ title, value, icon: Icon, colorClass }: StatCardProps) => {
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

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">

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
                  className="h-auto py-4 flex flex-col gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 col-span-2"
                  onPress={() => router.push('/organizer/payout-settings')}
                >
                  <div className="p-2 bg-white rounded-full shadow-sm"><FiDollarSign /></div>
                  <span className="text-xs font-semibold">ตั้งค่า PromptPay</span>
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
                {/* Search */}
                <div className="flex gap-2">
                  <Input
                    placeholder="ค้นหาค่าย..."
                    startContent={<FiSearch className="text-gray-400" />}
                    size="sm"
                    variant="bordered"
                    className="w-full sm:w-64"
                    classNames={{ inputWrapper: "border-gray-200" }}
                    value={campSearch}
                    onValueChange={(v) => { setCampSearch(v); setCampPage(1); }}
                  />
                </div>
              </div>

              {/* Tab Bar */}
              <div className="flex gap-1 px-6 pt-4">
                {([
                  { key: 'active', label: 'เปิดรับสมัคร', count: camps.filter(c => c.status === 'active').length },
                  { key: 'completed', label: 'จบแล้ว', count: completedCamps.length },
                  { key: 'all', label: 'ทั้งหมด', count: camps.length },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => { setCampTab(tab.key); setCampPage(1); }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${campTab === tab.key
                      ? 'bg-[#F2B33D] text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100'
                      }`}
                  >
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${campTab === tab.key ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>{tab.count}</span>
                  </button>
                ))}
              </div>

              <div className="p-6">
                {(() => {
                  // กรองค่ายตาม tab แล้ว search
                  const tabCamps = campTab === 'active'
                    ? camps.filter(c => c.status === 'active')
                    : campTab === 'completed'
                      ? completedCamps
                      : camps;
                  const q = campSearch.trim().toLowerCase();
                  const filteredCamps = q
                    ? tabCamps.filter(c =>
                      c.name.toLowerCase().includes(q) ||
                      c.location?.toLowerCase().includes(q) ||
                      (c.tags ?? []).some(t => t.toLowerCase().includes(q))
                    )
                    : tabCamps;

                  const totalPages = Math.ceil(filteredCamps.length / CAMPS_PER_PAGE);
                  const paginated = filteredCamps.slice((campPage - 1) * CAMPS_PER_PAGE, campPage * CAMPS_PER_PAGE);

                  if (filteredCamps.length === 0) {
                    return (
                      <EmptyState
                        icon={FiCalendar}
                        title={
                          campTab === 'active' ? 'ยังไม่มีค่ายที่เปิดรับสมัคร'
                            : campTab === 'completed' ? 'ยังไม่มีค่ายที่จบแล้ว'
                              : 'ยังไม่มีค่ายที่สร้างไว้'
                        }
                        description="เริ่มต้นสร้างค่ายแรกของคุณเพื่อเปิดโอกาสให้ผู้เรียน"
                        actionLabel="สร้างค่ายแรก"
                        onAction={handleOpenCreateModal}
                      />
                    );
                  }

                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                        {paginated.map(camp => {
                          const campRegs = registrations.filter(r => r.campId === camp._id);
                          const pending = campRegs.filter(r => r.status === RegistrationStatus.PENDING).length;
                          return (
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

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 pt-2">
                          <button
                            onClick={() => setCampPage(p => Math.max(1, p - 1))}
                            disabled={campPage === 1}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            ←
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCampPage(page)}
                              className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${campPage === page
                                ? 'bg-[#F2B33D] text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => setCampPage(p => Math.min(totalPages, p + 1))}
                            disabled={campPage === totalPages}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            →
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </Card>
          </div>

        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={isFeeInfoModalOpen} onClose={onFeeInfoModalClose}>
        <ModalContent>
          <ModalHeader className="border-b border-gray-100 flex flex-col gap-1">
            <span className="text-xl font-bold flex items-center gap-2">
              <FiAlertCircle className="text-[#F2B33D]" />นโยบายค่าธรรมเนียม
            </span>
          </ModalHeader>
          <ModalBody className="py-6 space-y-4 text-gray-700">
            <p>
              สำหรับการสร้างค่ายผ่านแพลตฟอร์ม SkillScout ทางเราจะมีการหักค่าธรรมเนียมแพลตฟอร์มในอัตรา <strong className="text-[#F2B33D]">{platformFeePercent}%</strong> จากยอดรายได้ของการสมัครค่ายของคุณ
            </p>
            <div className="bg-orange-50 p-4 rounded-xl text-sm border border-orange-100">
              <p className="font-semibold text-orange-800 mb-2">ตัวอย่างการคำนวณ:</p>
              <ul className="list-inside list-disc text-orange-700 space-y-1 ml-2">
                <li>สมมติคุณตั้งราคาค่าย 1,000 บาท</li>
                <li>
                  แพลตฟอร์มหัก <strong>{platformFeePercent}%</strong> ({(1000 * platformFeePercent / 100).toFixed(0)} บาท)
                </li>
                <li>
                  รายได้สุทธิที่คุณจะได้รับ: <strong>{(1000 - (1000 * platformFeePercent / 100)).toFixed(0)} บาท</strong>
                </li>
              </ul>
            </div>
            <p className="text-xs text-gray-500">
              หมายเหตุ: อัตราค่าธรรมเนียมแพลตฟอร์มสามารถเปลี่ยนแปลงได้ตามประกาศของเว็บ คุณสามารถตรวจสอบยอดรายได้หลังหักค่าธรรมเนียมได้ที่หน้า Dashboard พาร์ทเนอร์
            </p>

            <div className="pt-2">
              <Checkbox
                isSelected={hideFeeInfoNextTime}
                onValueChange={setHideFeeInfoNextTime}
                size="sm"
                color="warning"
              >
                ไม่ต้องแสดงข้อความนี้อีก
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-gray-100">
            <Button variant="light" onPress={onFeeInfoModalClose}>
              ยกเลิก
            </Button>
            <Button color="warning" onPress={handleProceedCreateCamp} className="text-white font-semibold">
              รับทราบและดำเนินการต่อ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <CampFormModal
        isOpen={isFormModalOpen}
        onClose={onFormModalClose}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={editingCamp ? handleUpdateCamp : handleCreateCamp}
        isEditing={!!editingCamp}
      />

      <Modal isOpen={isPromoModalOpen} onClose={onPromoModalClose} size="4xl" scrollBehavior="inside"
        classNames={{ base: 'min-h-[500px] max-h-[85vh]', body: 'overflow-y-auto' }}>
        <ModalContent>
          <ModalHeader className="border-b border-gray-100 p-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-orange-100 rounded-lg text-[#F2B33D]">
                <FiTag />
              </div>
              จัดการรหัสโปรโมชั่น
            </h2>
          </ModalHeader>
          <ModalBody className="p-0">
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

      {/* Delete Camp Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        onConfirm={confirmDeleteCamp}
        title="ยืนยันการลบ"
        description="คุณต้องการลบค่ายนี้หรือไม่? ข้อมูลทั้งหมดที่เกี่ยวข้องจะถูกลบและไม่สามารถกู้คืนได้"
        confirmLabel="ลบค่าย"
        variant="danger"
      />

      {/* Complete Camp Confirm Modal */}
      <ConfirmModal
        isOpen={isCompleteModalOpen}
        onClose={onCompleteModalClose}
        onConfirm={confirmCompleteCamp}
        title="ปิดรับสมัครและจบค่าย"
        description={`ยืนยันจบค่าย "${targetCampName}" หรือไม่? ค่ายจะถูกตั้งเป็นสถานะ "จบแล้ว" และไม่สามารถรับสมัครเพิ่มได้`}
        confirmLabel="ยืนยันจบค่าย"
        variant="info"
      />
    </div>
  );
}
