// src/app/organizer/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, Button, Input, Textarea, Chip } from '@heroui/react';
import { Calendar, Users, CheckCircle, XCircle, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { Camp, Registration, RegistrationStatus } from '@/types/camp';
import toast from 'react-hot-toast';

export default function OrganizerDashboard() {
  const { data: session, status } = useSession();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCamp, setEditingCamp] = useState<Camp | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    location: '',
    capacity: '',
    fee: '0',
    tags: [] as string[],
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchData();
    }
  }, [status, session?.user?.id]); // ✅ เพิ่ม dependency array

  const fetchData = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      
      // Fetch camps
      const campsRes = await fetch('/api/camps');
      
      if (!campsRes.ok) {
        throw new Error('Failed to fetch camps');
      }

      const campsData = await campsRes.json();
      
      console.log('=== DEBUG INFO ===');
      console.log('All Camps:', campsData);
      console.log('Session User ID:', session.user.id);
      console.log('Session User:', session.user);
      
      // ✅ ตรวจสอบ structure ก่อนใช้
      const allCamps = Array.isArray(campsData) ? campsData : (campsData.camps || []);
      console.log('All Camps Array:', allCamps);
      console.log('First Camp:', allCamps[0]);
      
      const myCamps = allCamps.filter((c: Camp) => {
        console.log(`Camp "${c.name}" organizerId: ${c.organizerId}, Match: ${c.organizerId === session.user.id}`);
        return c.organizerId === session.user.id;
      });
      console.log('My Camps:', myCamps);
      console.log('===================');
      setCamps(myCamps);

      // Fetch registrations for my camps
      if (myCamps.length > 0) {
        const regPromises = myCamps.map((camp: Camp) =>
          fetch(`/api/registrations?campId=${camp._id}`)
            .then(r => r.json())
            .catch(() => ({ registrations: [] }))
        );
        const regResults = await Promise.all(regPromises);
        const allRegs = regResults.flatMap(r => r.registrations || []);
        setRegistrations(allRegs);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }
    
    try {
      // สร้าง slug จากชื่อค่าย
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const campPayload = {
        name: formData.name,
        category: formData.tags[0] || 'General', // ใช้ tag แรกเป็น category
        date: `${new Date(formData.startDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })} - ${new Date(formData.endDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        location: formData.location,
        price: `฿${parseInt(formData.fee).toLocaleString()}`,
        image: '/api/placeholder/800/600', // ใส่ URL รูปภาพ default
        galleryImages: [],
        description: formData.description,
        deadline: new Date(formData.registrationDeadline).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }),
        participantCount: parseInt(formData.capacity),
        activityFormat: 'On-site',
        qualifications: {
          level: 'ทุกระดับ',
          fields: formData.tags,
        },
        additionalInfo: [],
        organizers: [{
          name: session.user.name || 'Organizer',
          imageUrl: session.user.image || '/api/placeholder/100/100',
        }],
        reviews: [],
        avgRating: 0,
        ratingBreakdown: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
        featured: false,
        slug,
        // ข้อมูล organizer (ไม่ได้อยู่ใน Camp schema แต่เก็บใน types)
        organizerId: session.user.id,
        organizerName: session.user.name,
        organizerEmail: session.user.email,
        // ข้อมูลเพิ่มเติมจาก form
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        registrationDeadline: new Date(formData.registrationDeadline),
        capacity: parseInt(formData.capacity),
        enrolled: 0,
        fee: parseInt(formData.fee),
        tags: formData.tags,
        status: 'active' as const,
      };

      const response = await fetch('/api/camps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Create camp error:', errorData);
        console.error('Response status:', response.status);
        throw new Error(errorData.error || 'Failed to create camp');
      }

      toast.success('สร้างค่ายสำเร็จ!');
      setShowCreateForm(false);
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
      const response = await fetch(`/api/camps/${editingCamp._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update camp');

      toast.success('อัพเดทค่ายสำเร็จ!');
      setEditingCamp(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error updating camp:', error);
      toast.error('เกิดข้อผิดพลาดในการอัพเดทค่าย');
    }
  };

  const handleDeleteCamp = async (campId: string) => {
    if (!confirm('คุณต้องการลบค่ายนี้หรือไม่?')) return;

    try {
      const response = await fetch(`/api/camps/${campId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete camp');

      toast.success('ลบค่ายสำเร็จ!');
      fetchData();
    } catch (error) {
      console.error('Error deleting camp:', error);
      toast.error('เกิดข้อผิดพลาดในการลบค่าย');
    }
  };

  const handleApproveRegistration = async (regId: string) => {
    try {
      const response = await fetch(`/api/registrations/${regId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: RegistrationStatus.APPROVED,
          reviewedBy: session?.user?.id 
        }),
      });

      if (!response.ok) throw new Error('Failed to approve registration');

      toast.success('อนุมัติการสมัครสำเร็จ!');
      fetchData();
    } catch (error) {
      console.error('Error approving registration:', error);
      toast.error('เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const handleRejectRegistration = async (regId: string) => {
    try {
      const response = await fetch(`/api/registrations/${regId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: RegistrationStatus.REJECTED,
          reviewedBy: session?.user?.id  
        }),
      });

      if (!response.ok) throw new Error('Failed to reject registration');

      toast.success('ปฏิเสธการสมัครสำเร็จ!');
      fetchData();
    } catch (error) {
      console.error('Error rejecting registration:', error);
      toast.error('เกิดข้อผิดพลาดในการปฏิเสธ');
    }
  };

  const handleEditCamp = (camp: Camp) => {
    setEditingCamp(camp);
    setFormData({
      name: camp.name,
      description: camp.description,
      startDate: camp.startDate ? new Date(camp.startDate).toISOString().split('T')[0] : '',
      endDate: camp.endDate ? new Date(camp.endDate).toISOString().split('T')[0] : '',
      registrationDeadline: camp.registrationDeadline ? new Date(camp.registrationDeadline).toISOString().split('T')[0] : '',
      location: camp.location,
      capacity: camp.capacity?.toString() || camp.participantCount.toString(),
      fee: camp.fee?.toString() || '0',
      tags: camp.tags || camp.qualifications?.fields || [],
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      location: '',
      capacity: '',
      fee: '0',
      tags: [],
    });
    setEditingCamp(null);
    setShowCreateForm(false);
  };

  // Check authentication
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
          <Button color="primary" href="/login">
            เข้าสู่ระบบ
          </Button>
        </Card>
      </div>
    );
  }

  // Statistics
  const totalEnrolled = camps.reduce((sum, c) => sum + (c.enrolled || 0), 0);
  const pendingRegs = registrations.filter(r => r.status === RegistrationStatus.PENDING).length;
  const approvedRegs = registrations.filter(r => r.status === RegistrationStatus.APPROVED).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Organizer Dashboard
          </h1>
          <p className="text-gray-600">จัดการค่ายและผู้สมัครของคุณ</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">ค่ายทั้งหมด</p>
                <p className="text-3xl font-bold">{camps.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">ผู้เข้าร่วมทั้งหมด</p>
                <p className="text-3xl font-bold">{totalEnrolled}</p>
              </div>
              <Users className="w-12 h-12 text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">รออนุมัติ</p>
                <p className="text-3xl font-bold">{pendingRegs}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">อนุมัติแล้ว</p>
                <p className="text-3xl font-bold">{approvedRegs}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-purple-200" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Create/Edit Form */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingCamp ? 'แก้ไขค่าย' : 'สร้างค่ายใหม่'}
                </h2>
                {!showCreateForm && !editingCamp && (
                  <Button
                    color="primary"
                    startContent={<Plus className="w-4 h-4" />}
                    onPress={() => setShowCreateForm(true)}
                  >
                    สร้างค่าย
                  </Button>
                )}
              </div>

              {(showCreateForm || editingCamp) && (
                <form onSubmit={editingCamp ? handleUpdateCamp : handleCreateCamp} className="space-y-4">
                  <Input
                    label="ชื่อค่าย"
                    placeholder="เช่น Web Development Bootcamp"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />

                  <Textarea
                    label="รายละเอียด"
                    placeholder="รายละเอียดของค่าย"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    minRows={3}
                  />

                  <Input
                    label="สถานที่"
                    placeholder="เช่น มหาวิทยาลัย X"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="date"
                      label="วันเริ่มต้น"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />

                    <Input
                      type="date"
                      label="วันสิ้นสุด"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>

                  <Input
                    type="date"
                    label="ปิดรับสมัคร"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="จำนวนที่รับ"
                      placeholder="30"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      required
                    />

                    <Input
                      type="number"
                      label="ค่าใช้จ่าย (บาท)"
                      placeholder="0"
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      color="primary"
                      className="flex-1"
                    >
                      {editingCamp ? 'บันทึกการแก้ไข' : 'สร้างค่าย'}
                    </Button>

                    {(showCreateForm || editingCamp) && (
                      <Button
                        type="button"
                        color="default"
                        variant="flat"
                        onPress={resetForm}
                      >
                        ยกเลิก
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </Card>

            {/* Pending Registrations */}
            <Card className="p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                คำขอรอดำเนินการ
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {registrations
                  .filter(r => r.status === RegistrationStatus.PENDING)
                  .map(reg => {
                    const camp = camps.find(c => c._id === reg.campId);
                    return (
                      <div key={reg._id} className="border border-gray-200 rounded-lg p-4">
                        <p className="font-semibold text-gray-800">{reg.userName}</p>
                        <p className="text-sm text-gray-600 mb-2">{camp?.name}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="success"
                            startContent={<CheckCircle className="w-4 h-4" />}
                            onPress={() => handleApproveRegistration(reg._id)}
                            className="flex-1"
                          >
                            อนุมัติ
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            startContent={<XCircle className="w-4 h-4" />}
                            onPress={() => handleRejectRegistration(reg._id)}
                            className="flex-1"
                          >
                            ปฏิเสธ
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                {registrations.filter(r => r.status === RegistrationStatus.PENDING).length === 0 && (
                  <p className="text-gray-500 text-center py-8">ไม่มีคำขอรอดำเนินการ</p>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Camps List */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">ค่ายของฉัน</h2>
              <div className="grid grid-cols-1 gap-4">
                {camps.map(camp => {
                  const campRegs = registrations.filter(r => r.campId === camp._id);
                  const pending = campRegs.filter(r => r.status === RegistrationStatus.PENDING).length;

                  return (
                    <Card key={camp._id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 mb-1">{camp.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{camp.description}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => handleEditCamp(camp)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="danger"
                            onPress={() => handleDeleteCamp(camp._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Chip size="sm" variant="flat" color="primary">
                          📍 {camp.location}
                        </Chip>
                        <Chip size="sm" variant="flat" color="secondary">
                          📅 {camp.startDate ? new Date(camp.startDate).toLocaleDateString('th-TH') : camp.date}
                        </Chip>
                        <Chip size="sm" variant="flat" color="success">
                          👥 {camp.enrolled || 0}/{camp.capacity || camp.participantCount}
                        </Chip>
                        {pending > 0 && (
                          <Chip size="sm" variant="flat" color="warning">
                            ⏳ รออนุมัติ {pending}
                          </Chip>
                        )}
                      </div>

                      <div className="bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${((camp.enrolled || 0) / (camp.capacity || camp.participantCount)) * 100}%` }}
                        />
                      </div>

                      <p className="text-xs text-gray-500 text-right">
                        {(((camp.enrolled || 0) / (camp.capacity || camp.participantCount)) * 100).toFixed(0)}% เต็ม
                      </p>
                    </Card>
                  );
                })}

                {camps.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">คุณยังไม่มีค่าย</p>
                    <Button
                      color="primary"
                      startContent={<Plus className="w-4 h-4" />}
                      onPress={() => setShowCreateForm(true)}
                    >
                      สร้างค่ายแรกของคุณ
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
