// src/app/organizer/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, Button, useDisclosure, Chip } from '@heroui/react';
import { FiCalendar, FiUsers, FiCheckCircle, FiPlus, FiTrendingUp, FiUserCheck } from 'react-icons/fi';
import { Camp, Registration, RegistrationStatus } from '@/types/camp';
import { 
  CampFormModal, CampDetailModal, CampCardWithImage, StatCard, RegistrationCard, EmptyState 
} from '@/components/organizer';
import toast from 'react-hot-toast';

export default function OrganizerDashboard() {
  const { data: session, status } = useSession();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCamp, setEditingCamp] = useState<Camp | null>(null);
  const [viewingCamp, setViewingCamp] = useState<Camp | null>(null);

  const { isOpen: isFormModalOpen, onOpen: onFormModalOpen, onClose: onFormModalClose } = useDisclosure();
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onClose: onDetailModalClose } = useDisclosure();

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
      const campsRes = await fetch('/api/camps?includeAll=true'); // ดึงค่ายทุกสถานะ
      if (!campsRes.ok) throw new Error('Failed to fetch camps');
      const campsData = await campsRes.json();
      const allCamps = Array.isArray(campsData) ? campsData : (campsData.camps || []);
      const myCamps = allCamps.filter((c: Camp) => c.organizerId === session.user.id);
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
  }, [session?.user?.id]);

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
        status: 'pending' as const, // รอ Admin อนุมัติก่อน
      };

      const response = await fetch('/api/camps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to create camp');
      }

      toast.success('✅ สร้างค่ายสำเร็จ!');
      onFormModalClose();
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างค่าย');
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
      };

      const response = await fetch(`/api/camps/${editingCamp._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) throw new Error((await response.json()).error || 'Failed to update camp');

      toast.success('✅ อัพเดทค่ายสำเร็จ!');
      onFormModalClose();
      setEditingCamp(null);
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัพเดทค่าย');
    }
  };

  const handleDeleteCamp = async (campId: string) => {
    if (!confirm('⚠️ คุณต้องการลบค่ายนี้หรือไม่?')) return;
    try {
      const response = await fetch(`/api/camps/${campId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      toast.success('✅ ลบค่ายสำเร็จ!');
      fetchData();
    } catch {
      toast.error('เกิดข้อผิดพลาดในการลบค่าย');
    }
  };

  // ลบฟังก์ชันอนุมัติ/ปฏิเสธ - ไม่ใช้แล้ว

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
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
  const pendingRegs = registrations.filter(r => r.status === RegistrationStatus.PENDING).length;
  const approvedRegs = registrations.filter(r => r.status === RegistrationStatus.APPROVED).length;
  const attendedRegs = registrations.filter(r => r.status === 'attended').length;
  const pendingRegistrations = registrations.filter(r => r.status === RegistrationStatus.PENDING);
  const pendingCamps = camps.filter(c => c.status === 'pending'); // ค่ายรออนุมัติ

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎯 Organizer Dashboard</h1>
          <p className="text-gray-600">จัดการค่ายและผู้สมัครของคุณ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard title="ค่ายทั้งหมด" value={camps.length} icon={FiCalendar} gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
          <StatCard title="ผู้เข้าร่วมทั้งหมด" value={totalEnrolled} icon={FiUsers} gradient="bg-gradient-to-br from-green-500 to-green-600" />
          <StatCard title="รออนุมัติ" value={pendingRegs} icon={FiTrendingUp} gradient="bg-gradient-to-br from-orange-500 to-orange-600" />
          <StatCard title="อนุมัติแล้ว" value={approvedRegs} icon={FiCheckCircle} gradient="bg-gradient-to-br from-purple-500 to-purple-600" />
          <StatCard title="เช็คอินแล้ว" value={attendedRegs} icon={FiUserCheck} gradient="bg-gradient-to-br from-pink-500 to-purple-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ Quick Actions</h2>
              <Button color="primary" size="lg" startContent={<FiPlus className="w-5 h-5" />} onPress={handleOpenCreateModal} className="w-full">
                สร้างค่ายใหม่
              </Button>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">⏳ ค่ายรอตรวจสอบ</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingCamps.map(camp => (
                  <Card key={camp._id} className="p-4 border-2 border-orange-200 bg-orange-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{camp.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <FiCalendar className="inline mr-1" />
                          {camp.date}
                        </p>
                        <Chip size="sm" color="warning" variant="flat" className="mt-2">
                          รอ Admin ตรวจสอบ
                        </Chip>
                      </div>
                    </div>
                  </Card>
                ))}
                {pendingCamps.length === 0 && (
                  <EmptyState 
                    icon={FiCheckCircle} 
                    title="ไม่มีค่ายรอตรวจสอบ" 
                    description="ค่ายทั้งหมดได้รับการอนุมัติแล้ว" 
                  />
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">📚 ค่ายของฉัน</h2>
                {camps.length > 0 && <p className="text-sm text-gray-500">{camps.length} ค่าย</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {camps.map(camp => {
                  const campRegs = registrations.filter(r => r.campId === camp._id);
                  const pending = campRegs.filter(r => r.status === RegistrationStatus.PENDING).length;
                  return (
                    <CampCardWithImage
                      key={camp._id} camp={camp} pendingCount={pending}
                      onEdit={() => handleEditCamp(camp)}
                      onDelete={() => handleDeleteCamp(camp._id)}
                      onView={() => handleViewCamp(camp)}
                    />
                  );
                })}

                {camps.length === 0 && (
                  <div className="col-span-2">
                    <EmptyState
                      icon={FiCalendar} title="ยังไม่มีค่าย"
                      description="เริ่มต้นสร้างค่ายแรกของคุณเพื่อเข้าถึงผู้เรียน"
                      actionLabel="สร้างค่ายแรก" onAction={handleOpenCreateModal}
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <CampFormModal
        isOpen={isFormModalOpen} onClose={onFormModalClose}
        formData={formData} onFormDataChange={setFormData}
        onSubmit={editingCamp ? handleUpdateCamp : handleCreateCamp}
        isEditing={!!editingCamp}
      />

      {viewingCamp && (
        <CampDetailModal
          isOpen={isDetailModalOpen} onClose={onDetailModalClose}
          camp={viewingCamp}
          registrations={registrations.filter(r => r.campId === viewingCamp._id)}
        />
      )}
    </div>
  );
}
