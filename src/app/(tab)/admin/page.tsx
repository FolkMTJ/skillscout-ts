'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
} from '@heroui/react';
import { FiUsers, FiCalendar, FiShield, FiTrash2, FiEye, FiSearch, FiAlertCircle, FiXCircle, FiAlertTriangle, FiCheck, FiX, FiPlus, FiEdit2, FiBookOpen, FiToggleLeft, FiToggleRight, FiSave, FiMonitor, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { StatCard } from '@/components/common';

interface RoadmapStepForm {
  level: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  requiredSkills: string;
  recommendedCamps: string;
  duration: string;
}

interface RoadmapStepDoc {
  level: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  requiredSkills: string[];
  recommendedCamps?: string[];
  duration?: string;
}

interface HollandCareer {
  _id: string;
  id: string;
  name: string;
  nameTh: string;
  description: string;
  personality: string;
  riasecCodes: string[];
  requiredTags: string[];
  recommendedTags: string[];
  roadmapSteps: RoadmapStepDoc[];
  averageSalary?: string;
  demandLevel?: 'high' | 'medium' | 'low';
  isActive: boolean;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBanned?: boolean;
  createdAt: string;
}

interface Camp {
  _id: string;
  name: string;
  organizerName: string;
  organizerEmail: string;
  status: string;
  enrolled: number;
  capacity: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchCamp, setSearchCamp] = useState('');
  const [campStatusFilter, setCampStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');

  // Showcase Mode state
  const [showcaseMode, setShowcaseMode] = useState(false);
  const [showcaseSaving, setShowcaseSaving] = useState(false);
  const [showcaseCampCount, setShowcaseCampCount] = useState(0);
  const [showcaseSeeding, setShowcaseSeeding] = useState(false);

  // Platform Fee settings state
  const [platformPromptpayId, setPlatformPromptpayId] = useState('');
  const [platformAccountName, setPlatformAccountName] = useState('SkillScout');
  const [platformFeePercent, setPlatformFeePercent] = useState('5');
  const [platformSaving, setPlatformSaving] = useState(false);
  const [platformEnabled, setPlatformEnabled] = useState(false);

  const fetchShowcaseSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setShowcaseMode(data.showcaseMode ?? false);
      // Platform fee settings
      setPlatformPromptpayId(data.platformPromptpayId ?? '');
      setPlatformAccountName(data.platformAccountName ?? 'SkillScout');
      setPlatformFeePercent(String(data.platformFeePercent ?? 5));
      setPlatformEnabled(data.platformEnabled ?? false);
      const campRes = await fetch('/api/admin/showcase');
      const campData = await campRes.json();
      setShowcaseCampCount(campData.count ?? 0);
    } catch { /* ignore */ }
  };

  const saveShowcaseSettings = async (mode?: boolean) => {
    setShowcaseSaving(true);
    try {
      const newMode = mode !== undefined ? mode : showcaseMode;
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showcaseMode: newMode }),
      });
      setShowcaseMode(newMode);
      toast.success(newMode ? 'เปิด Showcase Mode แล้ว' : 'ปิด Showcase Mode แล้ว');
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    setShowcaseSaving(false);
  };

  const savePlatformSettings = async () => {
    setPlatformSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformPromptpayId: platformPromptpayId.trim(),
          platformAccountName: platformAccountName.trim() || 'SkillScout',
          platformFeePercent: parseFloat(platformFeePercent) || 5,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const isEnabled = !!platformPromptpayId.trim();
      setPlatformEnabled(isEnabled);
      toast.success(isEnabled ? 'บันทึกตั้งค่า Platform Fee สำเร็จ' : 'ปิดระบบ Platform Fee แล้ว');
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    setPlatformSaving(false);
  };

  const seedShowcaseCamps = async () => {
    setShowcaseSeeding(true);
    try {
      const res = await fetch('/api/admin/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      const data = await res.json();
      toast.success(`เพิ่มค่ายตัวอย่าง ${data.inserted} ค่ายสำเร็จ`);
      fetchShowcaseSettings();
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    setShowcaseSeeding(false);
  };

  const clearShowcaseCamps = async () => {
    if (!confirm('ต้องการลบค่ายตัวอย่างทั้งหมดหรือไม่?')) return;
    setShowcaseSeeding(true);
    try {
      const res = await fetch('/api/admin/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });
      const data = await res.json();
      toast.success(`ลบค่ายตัวอย่าง ${data.deleted} ค่ายสำเร็จ`);
      fetchShowcaseSettings();
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    setShowcaseSeeding(false);
  };

  // Holland Careers state
  const [hollandCareers, setHollandCareers] = useState<HollandCareer[]>([]);
  const [careerLoading, setCareerLoading] = useState(false);
  const [riasecFilter, setRiasecFilter] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<HollandCareer | null>(null);
  const [careerForm, setCareerForm] = useState({
    name: '', nameTh: '', description: '', personality: '',
    riasecCodes: '', requiredTags: '', recommendedTags: '',
    averageSalary: '', demandLevel: 'high' as 'high' | 'medium' | 'low',
  });
  const defaultRoadmapSteps = (): RoadmapStepForm[] => [
    { level: 'beginner', title: '', description: '', requiredSkills: '', recommendedCamps: '', duration: '' },
    { level: 'intermediate', title: '', description: '', requiredSkills: '', recommendedCamps: '', duration: '' },
    { level: 'advanced', title: '', description: '', requiredSkills: '', recommendedCamps: '', duration: '' },
  ];
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStepForm[]>(defaultRoadmapSteps());
  const { isOpen: isCareerModalOpen, onOpen: onCareerModalOpen, onClose: onCareerModalClose } = useDisclosure();
  const { isOpen: isDeleteCareerModalOpen, onOpen: onDeleteCareerModalOpen, onClose: onDeleteCareerModalClose } = useDisclosure();

  const { isOpen: isBanModalOpen, onOpen: onBanModalOpen, onClose: onBanModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isApproveModalOpen, onOpen: onApproveModalOpen, onClose: onApproveModalClose } = useDisclosure();
  const { isOpen: isRejectModalOpen, onOpen: onRejectModalOpen, onClose: onRejectModalClose } = useDisclosure();

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchData();
      fetchShowcaseSettings();
    }
  }, [status, session, router]);

  const fetchHollandCareers = async () => {
    try {
      setCareerLoading(true);
      const res = await fetch('/api/admin/holland-careers');
      const data = await res.json() as { careers?: HollandCareer[] };
      if (data.careers) setHollandCareers(data.careers);
    } catch (err) {
      console.error(err);
    } finally {
      setCareerLoading(false);
    }
  };

  const openAddCareer = () => {
    setSelectedCareer(null);
    setCareerForm({ name: '', nameTh: '', description: '', personality: '', riasecCodes: '', requiredTags: '', recommendedTags: '', averageSalary: '', demandLevel: 'high' });
    setRoadmapSteps(defaultRoadmapSteps());
    onCareerModalOpen();
  };

  const openEditCareer = (career: HollandCareer) => {
    setSelectedCareer(career);
    setCareerForm({
      name: career.name,
      nameTh: career.nameTh,
      description: career.description,
      personality: career.personality || '',
      riasecCodes: career.riasecCodes.join(', '),
      requiredTags: (career.requiredTags || []).join(', '),
      recommendedTags: (career.recommendedTags || []).join(', '),
      averageSalary: career.averageSalary || '',
      demandLevel: career.demandLevel || 'high',
    });
    // populate roadmapSteps from career or defaults
    const levels: Array<'beginner' | 'intermediate' | 'advanced'> = ['beginner', 'intermediate', 'advanced'];
    const steps = levels.map(level => {
      const existing = (career.roadmapSteps || []).find(s => s.level === level);
      return existing ? {
        level,
        title: existing.title || '',
        description: existing.description || '',
        requiredSkills: (existing.requiredSkills || []).join(', '),
        recommendedCamps: (existing.recommendedCamps || []).join(', '),
        duration: existing.duration || '',
      } : { level, title: '', description: '', requiredSkills: '', recommendedCamps: '', duration: '' };
    });
    setRoadmapSteps(steps);
    onCareerModalOpen();
  };

  const updateRoadmapStep = (index: number, field: keyof RoadmapStepForm, value: string) => {
    setRoadmapSteps(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const saveCareer = async () => {
    try {
      const payload = {
        name: careerForm.name,
        nameTh: careerForm.nameTh,
        description: careerForm.description,
        personality: careerForm.personality,
        riasecCodes: careerForm.riasecCodes.split(',').map(s => s.trim()).filter(Boolean),
        requiredTags: careerForm.requiredTags.split(',').map(s => s.trim()).filter(Boolean),
        recommendedTags: careerForm.recommendedTags.split(',').map(s => s.trim()).filter(Boolean),
        averageSalary: careerForm.averageSalary,
        demandLevel: careerForm.demandLevel,
        roadmapSteps: roadmapSteps
          .filter(s => s.title.trim())
          .map(s => ({
            level: s.level,
            title: s.title.trim(),
            description: s.description.trim(),
            requiredSkills: s.requiredSkills.split(',').map(x => x.trim()).filter(Boolean),
            recommendedCamps: s.recommendedCamps.split(',').map(x => x.trim()).filter(Boolean),
            duration: s.duration.trim(),
          })),
      };
      if (selectedCareer) {
        await fetch(`/api/admin/holland-careers/${selectedCareer._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        toast.success('แก้ไขอาชีพสำเร็จ');
      } else {
        await fetch('/api/admin/holland-careers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        toast.success('เพิ่มอาชีพสำเร็จ');
      }
      onCareerModalClose();
      fetchHollandCareers();
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const toggleCareerActive = async (career: HollandCareer) => {
    try {
      await fetch(`/api/admin/holland-careers/${career._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !career.isActive }) });
      fetchHollandCareers();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteCareer = async () => {
    if (!selectedCareer) return;
    try {
      await fetch(`/api/admin/holland-careers/${selectedCareer._id}`, { method: 'DELETE' });
      toast.success('ลบอาชีพสำเร็จ');
      onDeleteCareerModalClose();
      fetchHollandCareers();
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      if (usersData.users) setUsers(usersData.users);

      const campsRes = await fetch('/api/camps?includeAll=true');
      const campsData = await campsRes.json();
      setCamps(Array.isArray(campsData) ? campsData : campsData.camps || []);
      await fetchHollandCareers();
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = (user: User) => {
    setSelectedUser(user);
    onBanModalOpen();
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    onDeleteModalOpen();
  };

  const handleApproveCamp = (camp: Camp) => {
    setSelectedCamp(camp);
    onApproveModalOpen();
  };

  const handleRejectCamp = (camp: Camp) => {
    setSelectedCamp(camp);
    setRejectReason('');
    onRejectModalOpen();
  };

  const confirmBanUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}/ban`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to ban user');

      toast.success(selectedUser.isBanned ? 'ปลดแบน User สำเร็จ!' : 'แบน User สำเร็จ!');
      onBanModalClose();
      fetchData();
    } catch (err) {
      console.error('Error banning user:', err);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      toast.success('ลบ User สำเร็จ!');
      onDeleteModalClose();
      fetchData();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const confirmApproveCamp = async () => {
    if (!selectedCamp || !session?.user?.id) return;

    try {
      const response = await fetch(`/api/camps/${selectedCamp._id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: session.user.id,
          action: 'approve'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve camp');
      }

      const result = await response.json();

      toast.success('อนุมัติค่ายสำเร็จ!');

      if (result.issues && result.issues.length > 0) {
        toast(`คะแนนการตรวจสอบ: ${result.verificationScore}/100`, {
          icon: '⚠️',
        });
      }

      onApproveModalClose();
      fetchData();
    } catch (err) {
      console.error('Error approving camp:', err);
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const confirmRejectCamp = async () => {
    if (!selectedCamp || !session?.user?.id) return;

    if (!rejectReason.trim()) {
      toast.error('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }

    try {
      const response = await fetch(`/api/camps/${selectedCamp._id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: session.user.id,
          action: 'reject',
          reason: rejectReason
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject camp');
      }

      toast.success('ปฏิเสธค่ายสำเร็จ!');
      onRejectModalClose();
      setRejectReason('');
      fetchData();
    } catch (err) {
      console.error('Error rejecting camp:', err);
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการปฏิเสธ');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCamps = camps.filter(c => {
    const matchStatus = campStatusFilter === 'all' || c.status === campStatusFilter;
    const matchSearch = !searchCamp ||
      c.name.toLowerCase().includes(searchCamp.toLowerCase()) ||
      c.organizerName?.toLowerCase().includes(searchCamp.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalUsers = users.length;
  const organizers = users.filter(u => u.role === 'organizer').length;
  const bannedUsers = users.filter(u => u.isBanned).length;
  const pendingCamps = camps.filter(c => c.status === 'pending').length;
  const activeCamps = camps.filter(c => c.status === 'active').length;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="h-10 bg-gray-200 rounded w-80"></div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-64"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>

          {/* Tabs Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex gap-6 mb-6 animate-pulse">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>

            {/* Table Skeleton */}
            <div className="space-y-4 animate-pulse">
              {/* Search Bar */}
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>

              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>

              {/* Table Rows */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="grid grid-cols-6 gap-4 py-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-20"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <FiShield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ Admin)</p>
          <Button color="primary" onPress={() => router.push('/')}>
            กลับหน้าหลัก
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiShield className="text-3xl text-[#F2B33D]" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">จัดการระบบและผู้ใช้งาน</p>
        </div>

        {/* Stats Cards - ✅ แก้ไขใช้ StatCard component */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="ผู้ใช้ทั้งหมด"
            value={totalUsers}
            icon={<FiUsers />}
            color="primary"
          />

          <StatCard
            title="Organizers"
            value={organizers}
            icon={<FiShield />}
            color="secondary"
          />

          <StatCard
            title="Banned"
            value={bannedUsers}
            icon={<FiXCircle />}
            color="danger"
          />

          <StatCard
            title="ค่ายรออนุมัติ"
            value={pendingCamps}
            icon={<FiAlertCircle />}
            color="warning"
          />

          <StatCard
            title="ค่ายที่เปิด"
            value={activeCamps}
            icon={<FiCalendar />}
            color="success"
          />
        </div>

        {/* Tabs */}
        <Card className="p-6">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
          >
            <Tab key="overview" title="ภาพรวม">
              <div className="py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => { setActiveTab('camps'); setCampStatusFilter('pending'); }}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left border-2 border-transparent hover:border-orange-200"
                  >
                    <FiAlertCircle className="text-orange-500 text-2xl mb-3" />
                    <p className="text-3xl font-bold text-orange-500">{pendingCamps}</p>
                    <p className="text-sm text-gray-500 mt-1">ค่ายรออนุมัติ</p>
                    <p className="text-xs text-[#F2B33D] mt-2 font-medium">คลิกเพื่อดู →</p>
                  </button>

                  <button
                    onClick={() => router.push('/admin/payouts')}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left border-2 border-transparent hover:border-[#F2B33D]/40"
                  >
                    <FiTrendingUp className="text-[#F2B33D] text-2xl mb-3" />
                    <p className="text-xl font-bold text-[#F2B33D]">Payout</p>
                    <p className="text-sm text-gray-500 mt-1">Dashboard</p>
                    <p className="text-xs text-[#F2B33D] mt-2 font-medium">เปิด →</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('users')}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left border-2 border-transparent hover:border-blue-200"
                  >
                    <FiUsers className="text-blue-500 text-2xl mb-3" />
                    <p className="text-3xl font-bold text-blue-500">{totalUsers}</p>
                    <p className="text-sm text-gray-500 mt-1">ผู้ใช้ทั้งหมด</p>
                    <p className="text-xs text-[#F2B33D] mt-2 font-medium">จัดการ →</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('holland')}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left border-2 border-transparent hover:border-purple-200"
                  >
                    <FiBookOpen className="text-purple-500 text-2xl mb-3" />
                    <p className="text-3xl font-bold text-purple-500">{hollandCareers.length}</p>
                    <p className="text-sm text-gray-500 mt-1">อาชีพ Holland</p>
                    <p className="text-xs text-[#F2B33D] mt-2 font-medium">จัดการ →</p>
                  </button>
                </div>
              </div>
            </Tab>

            <Tab key="settings" title={<span className="flex items-center gap-1.5"><FiMonitor className={showcaseMode ? 'text-[#F2B33D]' : ''} />ตั้งค่า {showcaseMode && <span className="w-2 h-2 rounded-full bg-[#F2B33D] inline-block" />}</span>}>
              <div className="py-6 space-y-6">

                {/* Toggle Card */}
                <div className={`rounded-2xl border-2 p-6 transition-all ${showcaseMode ? 'border-[#F2B33D] bg-[#FEF6E0]' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <FiMonitor className={showcaseMode ? 'text-[#F2B33D]' : 'text-gray-400'} />
                        Showcase Mode
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">เปิดเพื่อแสดงชื่อที่กำหนดบน Discovery Path และ Path Finder (แทนชื่อ user จริง)</p>
                    </div>
                    <button
                      onClick={() => saveShowcaseSettings(!showcaseMode)}
                      disabled={showcaseSaving}
                      className={`relative w-16 h-8 rounded-full transition-all duration-300 flex items-center ${showcaseMode ? 'bg-[#F2B33D]' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${showcaseMode ? 'left-9' : 'left-1'}`} />
                    </button>
                  </div>

                  {showcaseMode && (
                    <div className="mt-4 p-3 bg-[#F2B33D]/20 rounded-xl text-sm text-[#7a5a00] flex items-center gap-2">
                      <span>Showcase Mode เปิดอยู่ — กดแชร์ผลลัพธ์ในแต่ละหน้าเพื่อใส่ชื่อบน Share Card ได้เลย</span>
                    </div>
                  )}
                </div>

                {/* QR Download Preview */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    QR สำหรับโหลดรูป Share Card
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">แสดง QR Code นี้ที่งาน Showcase เพื่อให้ผู้เข้าชมสแกนโหลดรูป Share Card ของตัวเองได้ทันที</p>
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl">
                      <img src="/skillscout-qr.png" alt="QR" className="w-32 h-32 object-contain" />
                      <p className="text-xs text-gray-500 font-medium">skillscout.site</p>
                    </div>
                    <div className="flex flex-col justify-center gap-2">
                      <p className="text-sm text-gray-600">ผู้เข้าชมทำ Path Finder เสร็จแล้วสแกน QR นี้ เพื่อ:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• เปิดหน้าผลลัพธ์บนมือถือตัวเอง</li>
                        <li>• กดโหลดรูป Share Card ได้เลย</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Showcase Camps */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-700 flex items-center gap-2">
                        ค่ายตัวอย่าง Showcase
                        <span className={`text-sm font-normal px-2 py-0.5 rounded-full ${showcaseCampCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {showcaseCampCount} ค่าย
                        </span>
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">6 ค่าย IT พร้อม Comment จำลอง สำหรับสาธิตในงาน Showcase</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="flat"
                        size="sm"
                        onPress={fetchShowcaseSettings}
                        startContent={<FiRefreshCw />}
                        isIconOnly
                        title="รีเฟรช"
                      />
                      {showcaseCampCount > 0 && (
                        <Button
                          variant="flat"
                          color="danger"
                          size="sm"
                          onPress={clearShowcaseCamps}
                          isLoading={showcaseSeeding}
                        >
                          ลบค่ายตัวอย่าง
                        </Button>
                      )}
                      <Button
                        color="warning"
                        size="sm"
                        onPress={seedShowcaseCamps}
                        isLoading={showcaseSeeding}
                        startContent={<FiPlus />}
                      >
                        {showcaseCampCount > 0 ? 'Reseed ค่าย' : 'เพิ่มค่ายตัวอย่าง'}
                      </Button>
                    </div>
                  </div>

                  {showcaseCampCount > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Web Development Bootcamp', 'Data Science & AI Workshop', 'Cybersecurity Essentials', 'Mobile App Development', 'Game Development with Unity', 'Cloud & DevOps Fundamentals'].map((name, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-sm font-medium text-gray-700 truncate">{name}</p>
                          <p className="text-xs text-gray-400 mt-1">2-3 comments · Active</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <FiMonitor className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">ยังไม่มีค่ายตัวอย่าง กด &ldquo;เพิ่มค่ายตัวอย่าง&rdquo; เพื่อ seed ข้อมูล</p>
                    </div>
                  )}
                </div>
                {/* Platform Fee Settings */}
                <div className={`rounded-2xl border-2 p-6 transition-all ${platformEnabled ? 'border-green-300 bg-green-50/30' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <FiTrendingUp className={platformEnabled ? 'text-green-500' : 'text-gray-400'} />
                        Platform Fee
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {platformEnabled
                          ? `เปิดอยู่ — QR จะชี้มา SkillScout, หัก ${platformFeePercent}%`
                          : 'ปิดอยู่ — QR ชี้ตรงหา Organizer (ไม่มีรายได้ platform)'}
                      </p>
                    </div>
                    {platformEnabled && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">เปิดใช้งาน</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        label="PromptPay ID (เบอร์หรือเลขบัตร)"
                        placeholder="0812345678 — ว่างเปล่า = ปิด Platform Fee"
                        value={platformPromptpayId}
                        onValueChange={(v) => setPlatformPromptpayId(v.replace(/\D/g, '').slice(0, 13))}
                        description={platformPromptpayId ? (platformPromptpayId.length === 10 ? 'เบอร์โทรศัพท์' : platformPromptpayId.length === 13 ? 'เลขบัตรประชาชน' : '') : 'ปล่อยว่างเพื่อปิด Platform Fee'}
                        classNames={{ inputWrapper: 'bg-white border border-gray-200' }}
                      />
                      <Input
                        label="ชื่อบัญชี"
                        placeholder="SkillScout"
                        value={platformAccountName}
                        onValueChange={setPlatformAccountName}
                        classNames={{ inputWrapper: 'bg-white border border-gray-200' }}
                      />
                      <Input
                        label="Fee % (0–30)"
                        placeholder="5"
                        value={platformFeePercent}
                        onValueChange={(v) => setPlatformFeePercent(v.replace(/[^0-9.]/g, ''))}
                        endContent={<span className="text-gray-400 text-sm">%</span>}
                        classNames={{ inputWrapper: 'bg-white border border-gray-200' }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      {/* <p className="text-xs text-gray-400">
                        {platformPromptpayId
                          ? `ตัวอย่าง: ค่าย ฿1,000 → platform รับ ฿${Math.round(1000 * parseFloat(platformFeePercent || '0') / 100)} + organizer รับ ฿${1000 - Math.round(1000 * parseFloat(platformFeePercent || '0') / 100)}`
                          : 'ใส่ PromptPay ID เพื่อเปิดระบบ หรือปล่อยว่างเพื่อปิด'}
                      </p> */}
                      <Button
                        className="bg-[#F2B33D] text-white font-semibold"
                        size="sm"
                        onPress={savePlatformSettings}
                        isLoading={platformSaving}
                        startContent={!platformSaving && <FiSave size={14} />}
                      >
                        บันทึก
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Tab>

            <Tab key="users" title={`Users (${totalUsers})`}>
              <div className="py-6">
                <div className="mb-4">
                  <Input
                    placeholder="ค้นหา User..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    startContent={<FiSearch />}
                    size="lg"
                  />
                </div>

                <Table aria-label="Users table">
                  <TableHeader>
                    <TableColumn>ชื่อ</TableColumn>
                    <TableColumn>อีเมล</TableColumn>
                    <TableColumn>Role</TableColumn>
                    <TableColumn>สถานะ</TableColumn>
                    <TableColumn>วันที่สมัคร</TableColumn>
                    <TableColumn>จัดการ</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={
                              user.role === 'admin' ? 'danger' :
                                user.role === 'organizer' ? 'primary' : 'default'
                            }
                          >
                            {user.role}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          {user.isBanned ? (
                            <Chip size="sm" color="danger" variant="flat">
                              Banned
                            </Chip>
                          ) : (
                            <Chip size="sm" color="success" variant="flat">
                              Active
                            </Chip>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('th-TH')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color={user.isBanned ? "success" : "warning"}
                              variant="flat"
                              onPress={() => handleBanUser(user)}
                              isDisabled={user.role === 'admin'}
                            >
                              {user.isBanned ? 'ปลดแบน' : 'แบน'}
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              onPress={() => handleDeleteUser(user)}
                              isDisabled={user.role === 'admin'}
                              startContent={<FiTrash2 />}
                            >
                              ลบ
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Tab>

            <Tab key="holland" title={`Holland Careers (${hollandCareers.length})`}>
              <div className="py-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-500">จัดการอาชีพ IT สำหรับ Path Finder (Holland RIASEC)</p>
                    {/* RIASEC Filter Buttons */}
                    <div className="flex gap-1">
                      {(['R', 'I', 'A', 'S', 'E', 'C'] as const).map(code => (
                        <button
                          key={code}
                          onClick={() => setRiasecFilter(riasecFilter === code ? null : code)}
                          className={`w-8 h-8 rounded-full text-xs font-black border-2 transition-all ${riasecFilter === code
                            ? 'bg-[#F2B33D] border-[#F2B33D] text-white shadow-md scale-110'
                            : 'bg-white border-gray-300 text-gray-600 hover:border-[#F2B33D]'
                            }`}
                        >
                          {code}
                        </button>
                      ))}
                      {riasecFilter && (
                        <button
                          onClick={() => setRiasecFilter(null)}
                          className="px-2 h-8 rounded-full text-xs font-medium border-2 border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-400 transition-all"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="md"
                      variant="flat"
                      color="default"
                      onPress={async () => {
                        if (!confirm('ต้องการ Reseed ข้อมูลอาชีพใหม่ 30 อาชีพหรือไม่?\n(ข้อมูลเดิมที่แก้ไขเองจะถูกลบ)')) return;
                        try {
                          const res = await fetch('/api/admin/holland-careers/seed', { method: 'POST' });
                          const data = await res.json() as { message?: string };
                          toast.success(data.message || 'Reseed สำเร็จ');
                          fetchHollandCareers();
                        } catch { toast.error('เกิดข้อผิดพลาด'); }
                      }}
                    >
                      Reseed ข้อมูล
                    </Button>
                    <Button color="warning" startContent={<FiPlus />} onPress={openAddCareer}>
                      เพิ่มอาชีพ
                    </Button>
                  </div>
                </div>
                {careerLoading ? (
                  <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>
                ) : (
                  <>
                    {riasecFilter && (
                      <p className="mb-2 text-xs text-gray-500">
                        แสดงอาชีพที่มี RIASEC: <span className="font-black text-[#F2B33D]">{riasecFilter}</span>
                        {' '}({hollandCareers.filter(c => c.riasecCodes.includes(riasecFilter)).length} อาชีพ)
                      </p>
                    )}
                    <Table aria-label="Holland Careers">
                      <TableHeader>
                        <TableColumn>ชื่ออาชีพ</TableColumn>
                        <TableColumn>RIASEC</TableColumn>
                        <TableColumn>ระดับความต้องการ</TableColumn>
                        <TableColumn>สถานะ</TableColumn>
                        <TableColumn>จัดการ</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {(riasecFilter
                          ? [...hollandCareers]
                            .filter(c => c.riasecCodes.includes(riasecFilter))
                            .sort((a, b) => {
                              const order = ['R', 'I', 'A', 'S', 'E', 'C'];
                              return order.indexOf(a.riasecCodes[0]) - order.indexOf(b.riasecCodes[0]);
                            })
                          : hollandCareers
                        ).map((career) => (
                          <TableRow key={career._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{career.nameTh}</p>
                                <p className="text-xs text-gray-500">{career.name}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {career.riasecCodes.map(c => (
                                  <Chip key={c} size="sm" className="bg-[#F2B33D] text-white text-[10px] min-w-6 h-6">{c}</Chip>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Chip size="sm" color={career.demandLevel === 'high' ? 'success' : career.demandLevel === 'medium' ? 'warning' : 'default'}>
                                {career.demandLevel === 'high' ? 'สูง' : career.demandLevel === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <Chip size="sm" color={career.isActive ? 'success' : 'default'} variant="flat">
                                {career.isActive ? 'เปิด' : 'ปิด'}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="flat" startContent={<FiEdit2 />} onPress={() => openEditCareer(career)}>แก้ไข</Button>
                                <Button size="sm" variant="flat" color={career.isActive ? 'warning' : 'success'}
                                  startContent={career.isActive ? <FiToggleLeft /> : <FiToggleRight />}
                                  onPress={() => toggleCareerActive(career)}>
                                  {career.isActive ? 'ปิด' : 'เปิด'}
                                </Button>
                                <Button size="sm" color="danger" variant="flat" startContent={<FiTrash2 />}
                                  onPress={() => { setSelectedCareer(career); onDeleteCareerModalOpen(); }}>ลบ</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </div>
            </Tab>

            <Tab key="camps" title={
              <div className="flex items-center gap-1.5">
                <span>ค่าย ({camps.length})</span>
                {pendingCamps > 0 && (
                  <span className="w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                    {pendingCamps}
                  </span>
                )}
              </div>
            }>
              <div className="py-6">
                <div className="flex flex-col md:flex-row gap-3 mb-4">
                  <Input
                    placeholder="ค้นหาค่ายหรือ Organizer..."
                    value={searchCamp}
                    onValueChange={setSearchCamp}
                    startContent={<FiSearch />}
                    size="sm"
                    className="flex-1"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {(['all', 'pending', 'active', 'rejected'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setCampStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 ${campStatusFilter === s
                          ? s === 'pending' ? 'bg-orange-500 text-white border-orange-500'
                            : s === 'active' ? 'bg-green-500 text-white border-green-500'
                              : s === 'rejected' ? 'bg-red-500 text-white border-red-500'
                                : 'bg-[#F2B33D] text-white border-[#F2B33D]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        {s === 'all' ? 'ทั้งหมด'
                          : s === 'pending' ? `รออนุมัติ (${camps.filter(c => c.status === 'pending').length})`
                            : s === 'active' ? `เปิดอยู่ (${camps.filter(c => c.status === 'active').length})`
                              : `ปฏิเสธ (${camps.filter(c => c.status === 'rejected').length})`}
                      </button>
                    ))}
                  </div>
                </div>
                <Table aria-label="Camps table">
                  <TableHeader>
                    <TableColumn>ชื่อค่าย</TableColumn>
                    <TableColumn>Organizer</TableColumn>
                    <TableColumn>สถานะ</TableColumn>
                    <TableColumn>ผู้เข้าร่วม</TableColumn>
                    <TableColumn>วันที่สร้าง</TableColumn>
                    <TableColumn>จัดการ</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {filteredCamps.map((camp) => (
                      <TableRow key={camp._id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium truncate">{camp.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{camp.organizerName}</p>
                            <p className="text-xs text-gray-500">{camp.organizerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={
                              camp.status === 'active' ? 'success' :
                                camp.status === 'pending' ? 'warning' :
                                  camp.status === 'rejected' ? 'danger' :
                                    'default'
                            }
                          >
                            {camp.status}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          {camp.enrolled || 0}/{camp.capacity}
                        </TableCell>
                        <TableCell>
                          {new Date(camp.createdAt).toLocaleDateString('th-TH')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="flat"
                              startContent={<FiEye />}
                              onPress={() => router.push(`/camps/${camp._id}`)}
                            >
                              ดู
                            </Button>
                            {camp.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  color="success"
                                  variant="flat"
                                  startContent={<FiCheck />}
                                  onPress={() => handleApproveCamp(camp)}
                                >
                                  อนุมัติ
                                </Button>
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="flat"
                                  startContent={<FiX />}
                                  onPress={() => handleRejectCamp(camp)}
                                >
                                  ปฏิเสธ
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Tab>
          </Tabs>
        </Card>
      </div>

      {/* Career Add/Edit Modal */}
      <Modal isOpen={isCareerModalOpen} onClose={onCareerModalClose} size="4xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FiBookOpen className="text-[#F2B33D]" />
              <span>{selectedCareer ? 'แก้ไขอาชีพ' : 'เพิ่มอาชีพใหม่'}</span>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-6">

              {/* ─── ข้อมูลพื้นฐาน ─── */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">ข้อมูลพื้นฐาน</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="ชื่ออาชีพ (EN)" placeholder="Software Engineer" value={careerForm.name} onValueChange={v => setCareerForm(f => ({ ...f, name: v }))} isRequired />
                    <Input label="ชื่ออาชีพ (TH)" placeholder="วิศวกรซอฟต์แวร์" value={careerForm.nameTh} onValueChange={v => setCareerForm(f => ({ ...f, nameTh: v }))} isRequired />
                  </div>
                  <Textarea label="คำอธิบายอาชีพ" placeholder="อธิบายหน้าที่และบทบาทของอาชีพนี้..." value={careerForm.description} onValueChange={v => setCareerForm(f => ({ ...f, description: v }))} minRows={3} isRequired />
                  <Textarea label="บุคลิกภาพที่เหมาะสม" placeholder="คุณชอบแก้ปัญหาเชิงตรรกะ..." value={careerForm.personality} onValueChange={v => setCareerForm(f => ({ ...f, personality: v }))} minRows={2} />
                </div>
              </div>

              {/* ─── RIASEC & Tags ─── */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">RIASEC & Tags</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                      RIASEC Codes <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {(['R', 'I', 'A', 'S', 'E', 'C'] as const).map(code => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            const current = careerForm.riasecCodes.split(',').map(s => s.trim()).filter(Boolean);
                            const idx = current.indexOf(code);
                            const next = idx >= 0
                              ? current.filter((_, i) => i !== idx)
                              : [...current, code].slice(0, 2);
                            setCareerForm(f => ({ ...f, riasecCodes: next.join(', ') }));
                          }}
                          className={`w-10 h-10 rounded-full text-sm font-black border-2 transition-all ${careerForm.riasecCodes.split(',').map(s => s.trim()).includes(code)
                            ? 'bg-[#F2B33D] border-[#F2B33D] text-white shadow-md scale-110'
                            : 'bg-white border-gray-300 text-gray-600 hover:border-[#F2B33D]'
                            }`}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">เลือกได้สูงสุด 2 รหัส (รหัสแรก = dominant type)</p>
                  </div>
                  <Input label="Required Tags (คั่นด้วยจุลภาค)" placeholder="python, javascript, html-css" value={careerForm.requiredTags} onValueChange={v => setCareerForm(f => ({ ...f, requiredTags: v }))} />
                  <Input label="Recommended Tags (คั่นด้วยจุลภาค)" placeholder="database, devops" value={careerForm.recommendedTags} onValueChange={v => setCareerForm(f => ({ ...f, recommendedTags: v }))} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="เงินเดือนเฉลี่ย" placeholder="30,000 - 80,000 บาท/เดือน" value={careerForm.averageSalary} onValueChange={v => setCareerForm(f => ({ ...f, averageSalary: v }))} />
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">ระดับความต้องการในตลาด</label>
                      <div className="flex gap-2">
                        {(['high', 'medium', 'low'] as const).map(level => (
                          <button key={level} type="button" onClick={() => setCareerForm(f => ({ ...f, demandLevel: level }))}
                            className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${careerForm.demandLevel === level
                              ? 'border-[#F2B33D] bg-[#F2B33D] text-white'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                              }`}>
                            {level === 'high' ? 'สูง' : level === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Roadmap Steps ─── */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Roadmap (3 ระดับ)</h3>
                <div className="space-y-4">
                  {roadmapSteps.map((step, idx) => {
                    const levelLabel = step.level === 'beginner' ? 'Beginner' : step.level === 'intermediate' ? 'Intermediate' : 'Advanced';
                    const levelColor = step.level === 'beginner' ? 'border-green-200 bg-green-50/50' : step.level === 'intermediate' ? 'border-yellow-200 bg-yellow-50/50' : 'border-red-200 bg-red-50/50';
                    return (
                      <div key={step.level} className={`rounded-xl border-2 ${levelColor} p-4 space-y-3`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold">{levelLabel}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="หัวข้อ (Title)"
                            placeholder={step.level === 'beginner' ? 'พื้นฐานการเขียนโปรแกรม' : step.level === 'intermediate' ? 'การพัฒนาแอปพลิเคชัน' : 'Architecture & Leadership'}
                            value={step.title}
                            onValueChange={v => updateRoadmapStep(idx, 'title', v)}
                            size="sm"
                          />
                          <Input
                            label="ระยะเวลา (Duration)"
                            placeholder="3-4 เดือน"
                            value={step.duration}
                            onValueChange={v => updateRoadmapStep(idx, 'duration', v)}
                            size="sm"
                          />
                        </div>
                        <Textarea
                          label="คำอธิบาย"
                          placeholder="อธิบายสิ่งที่จะเรียนรู้ในระดับนี้..."
                          value={step.description}
                          onValueChange={v => updateRoadmapStep(idx, 'description', v)}
                          minRows={2}
                          size="sm"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="Required Skills (คั่นด้วยจุลภาค)"
                            placeholder="Python, Git, SQL"
                            value={step.requiredSkills}
                            onValueChange={v => updateRoadmapStep(idx, 'requiredSkills', v)}
                            size="sm"
                          />
                          <Input
                            label="Camp Tags แนะนำ (คั่นด้วยจุลภาค)"
                            placeholder="python, database"
                            value={step.recommendedCamps}
                            onValueChange={v => updateRoadmapStep(idx, 'recommendedCamps', v)}
                            size="sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </ModalBody>
          <ModalFooter className="border-t border-gray-100">
            <Button variant="light" onPress={onCareerModalClose}>ยกเลิก</Button>
            <Button color="warning" startContent={<FiSave />} onPress={saveCareer}>
              {selectedCareer ? 'บันทึกการแก้ไข' : 'เพิ่มอาชีพ'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Career Modal */}
      <Modal isOpen={isDeleteCareerModalOpen} onClose={onDeleteCareerModalClose}>
        <ModalContent>
          <ModalHeader className="text-red-600">ลบอาชีพ</ModalHeader>
          <ModalBody>
            <p>คุณต้องการลบอาชีพ <strong>{selectedCareer?.nameTh}</strong> หรือไม่?</p>
            <p className="text-sm text-red-500">การลบจะไม่สามารถกู้คืนได้</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteCareerModalClose}>ยกเลิก</Button>
            <Button color="danger" startContent={<FiTrash2 />} onPress={confirmDeleteCareer}>ลบอาชีพ</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Ban Modal */}
      <Modal isOpen={isBanModalOpen} onClose={onBanModalClose}>
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold">
              {selectedUser?.isBanned ? 'ปลดแบน User' : 'แบน User'}
            </h3>
          </ModalHeader>
          <ModalBody>
            {selectedUser && (
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
                <p className="text-gray-700">
                  {selectedUser.isBanned
                    ? 'คุณต้องการปลดแบน User นี้หรือไม่? User จะสามารถเข้าใช้งานระบบได้อีกครั้ง'
                    : 'คุณต้องการแบน User นี้หรือไม่? User จะไม่สามารถเข้าใช้งานระบบได้'}
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onBanModalClose}>
              ยกเลิก
            </Button>
            <Button
              color={selectedUser?.isBanned ? "success" : "warning"}
              onPress={confirmBanUser}
            >
              {selectedUser?.isBanned ? 'ปลดแบน' : 'แบน'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
              <FiAlertTriangle />
              ลบ User
            </h3>
          </ModalHeader>
          <ModalBody>
            {selectedUser && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200">
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>คำเตือน:</strong> การลบ User จะลบข้อมูลทั้งหมดของ User นี้ออกจากระบบ
                    และไม่สามารถกู้คืนได้!
                  </p>
                </div>
                <p className="text-gray-700 font-semibold">
                  คุณแน่ใจหรือไม่ที่จะลบ User นี้?
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteModalClose}>
              ยกเลิก
            </Button>
            <Button
              color="danger"
              onPress={confirmDeleteUser}
              startContent={<FiTrash2 />}
            >
              ลบ User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Approve Camp Modal */}
      <Modal isOpen={isApproveModalOpen} onClose={onApproveModalClose}>
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold text-green-600 flex items-center gap-2">
              <FiCheck />
              อนุมัติค่าย
            </h3>
          </ModalHeader>
          <ModalBody>
            {selectedCamp && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200">
                  <p className="font-semibold text-lg">{selectedCamp.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    โดย: {selectedCamp.organizerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedCamp.organizerEmail}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>ข้อมูล:</strong> ระบบจะทำการตรวจสอบความถูกต้องของข้อมูลค่ายอัตโนมัติ
                    และให้คะแนนการตรวจสอบ
                  </p>
                </div>
                <p className="text-gray-700 font-semibold">
                  คุณต้องการอนุมัติค่ายนี้หรือไม่? ค่ายจะถูกเปิดให้ผู้ใช้สมัครได้ทันที
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onApproveModalClose}>
              ยกเลิก
            </Button>
            <Button
              color="success"
              onPress={confirmApproveCamp}
              startContent={<FiCheck />}
            >
              อนุมัติค่าย
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reject Camp Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={onRejectModalClose}>
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
              <FiX />
              ปฏิเสธค่าย
            </h3>
          </ModalHeader>
          <ModalBody>
            {selectedCamp && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200">
                  <p className="font-semibold text-lg">{selectedCamp.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    โดย: {selectedCamp.organizerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedCamp.organizerEmail}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    เหตุผลในการปฏิเสธ <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="กรุณาระบุเหตุผลที่ปฏิเสธค่ายนี้..."
                    value={rejectReason}
                    onValueChange={setRejectReason}
                    minRows={4}
                    variant="bordered"
                  />
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>หมายเหตุ:</strong> เหตุผลนี้จะถูกส่งให้ Organizer ทราบ
                  </p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onRejectModalClose}>
              ยกเลิก
            </Button>
            <Button
              color="danger"
              onPress={confirmRejectCamp}
              startContent={<FiX />}
              isDisabled={!rejectReason.trim()}
            >
              ปฏิเสธค่าย
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
