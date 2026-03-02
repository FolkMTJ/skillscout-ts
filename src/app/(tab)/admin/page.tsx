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
import { FiUsers, FiCalendar, FiShield, FiTrash2, FiEye, FiSearch, FiAlertCircle, FiXCircle, FiAlertTriangle, FiCheck, FiX, FiPlus, FiEdit2, FiBookOpen, FiToggleLeft, FiToggleRight, FiSave, FiMonitor, FiRefreshCw, FiTrendingUp, FiDollarSign, FiClock, FiCheckCircle, FiUser, FiSmartphone, FiUpload, FiImage, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { StatCard } from '@/components/common';
import jsQR from 'jsqr';

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

interface PayoutPayment {
  _id: string;
  campId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  organizerId: string;
  amount: number;
  finalAmount: number;
  discount: number;
  platformFeePercent?: number;
  platformFee?: number;
  organizerNet?: number;
  payoutStatus?: 'pending' | 'paid_out';
  paidOutAt?: string;
  payoutNote?: string;
  status: string;
  createdAt: string;
  organizerPromptpay?: string;
  organizerAccountName?: string;
  campName?: string;
}

interface PayoutGroup {
  organizerId: string;
  organizerAccountName: string;
  organizerPromptpay: string;
  totalNet: number;
  totalPlatformFee: number;
  totalFinalAmount: number;
  payments: PayoutPayment[];
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
  startDate?: string;
  endDate?: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [userSortKey, setUserSortKey] = useState<'name' | 'role' | 'createdAt' | 'status'>('createdAt');
  const [userSortDir, setUserSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchCamp, setSearchCamp] = useState('');
  const [campStatusFilter, setCampStatusFilter] = useState<'all' | 'pending' | 'active' | 'completed' | 'rejected'>('all');

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
  const [platformModalOpen, setPlatformModalOpen] = useState(false);

  // Site settings state
  const [visitorOffset, setVisitorOffset] = useState('59');
  const [siteSaving, setSiteSaving] = useState(false);

  // Payouts state
  const [payoutSummary, setPayoutSummary] = useState<{
    totalPlatformFee: number; totalOrganizerNet: number;
    pendingTotal: number; paidOutTotal: number; pendingCount: number; paidOutCount: number;
  } | null>(null);
  const [payoutGroups, setPayoutGroups] = useState<PayoutGroup[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<PayoutPayment[]>([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutSubTab, setPayoutSubTab] = useState('pending');
  const [payoutGroupConfirm, setPayoutGroupConfirm] = useState<PayoutGroup | null>(null);
  const [payoutNote, setPayoutNote] = useState('');
  const [payoutMarking, setPayoutMarking] = useState(false);
  // Slip scan states
  const [slipGroup, setSlipGroup] = useState<PayoutGroup | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState('');
  const [slipQrPayload, setSlipQrPayload] = useState('');
  const [slipQrDetected, setSlipQrDetected] = useState(false);
  const [slipNote, setSlipNote] = useState('');
  const [slipVerifying, setSlipVerifying] = useState(false);
  const [payoutQrUrl, setPayoutQrUrl] = useState('');
  const [payoutStep, setPayoutStep] = useState(1);

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
      // Site settings
      setVisitorOffset(String(data.visitorOffset ?? 59));
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
      // Also update visibility of sample camps
      await fetch('/api/admin/showcase', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: newMode }),
      });
      setShowcaseMode(newMode);
      toast.success(newMode ? 'แสดงค่ายตัวอย่างแล้ว' : 'ซ่อนค่ายตัวอย่างแล้ว');
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

  const saveSiteSettings = async () => {
    setSiteSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorOffset: parseInt(visitorOffset) || 0 }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('บันทึกตั้งค่าเว็บไซต์สำเร็จ');
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    setSiteSaving(false);
  };

  const fetchPayouts = async () => {
    setPayoutLoading(true);
    try {
      const res = await fetch('/api/admin/payouts');
      if (!res.ok) return;
      const data = await res.json();
      setPayoutSummary(data.summary);
      setPayoutGroups(data.pendingGrouped || []);
      setPayoutHistory(data.history || []);
    } catch { /* ignore */ }
    finally { setPayoutLoading(false); }
  };

  const handleMarkPaidOut = async () => {
    if (!payoutGroupConfirm) return;
    setPayoutMarking(true);
    try {
      const paymentIds = payoutGroupConfirm.payments.map(p => p._id);
      const res = await fetch('/api/admin/payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIds, note: payoutNote }),
      });
      if (!res.ok) throw new Error('Failed');
      const n = paymentIds.length;
      toast.success(`โอนเงินให้ ${payoutGroupConfirm.organizerAccountName || 'Organizer'} สำเร็จ (${n} รายการ)`);
      setPayoutGroupConfirm(null);
      setPayoutNote('');
      await fetchPayouts();
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    finally { setPayoutMarking(false); }
  };

  const resetSlipModal = () => {
    setSlipGroup(null);
    setSlipFile(null);
    setSlipPreview('');
    setSlipQrPayload('');
    setSlipQrDetected(false);
    setSlipNote('');
    setPayoutQrUrl('');
    setPayoutStep(1);
  };

  const openSlipModal = async (g: PayoutGroup) => {
    setSlipGroup(g);
    setSlipFile(null);
    setSlipPreview('');
    setSlipQrPayload('');
    setSlipQrDetected(false);
    setSlipNote('');
    setPayoutQrUrl('');
    if (g.organizerPromptpay) {
      try {
        const res = await fetch('/api/payment/generate-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptpayId: g.organizerPromptpay,
            accountName: g.organizerAccountName,
            amount: g.totalNet,
          }),
        });
        const data = await res.json();
        if (data.qrCode) setPayoutQrUrl(data.qrCode);
      } catch {}
    }
  };

  const handleSlipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('กรุณาเลือกไฟล์รูปภาพ'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('ไฟล์ใหญ่เกิน 5MB'); return; }
    setSlipFile(file);
    setSlipQrPayload('');
    setSlipQrDetected(false);

    const reader = new FileReader();
    reader.onloadend = () => setSlipPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Detect QR from slip image (client-side)
    const objectUrl = URL.createObjectURL(file);
    const img = document.createElement('img') as HTMLImageElement;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      if (imageData) {
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data) { setSlipQrPayload(code.data); setSlipQrDetected(true); }
      }
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  const handleVerifyPayoutSlip = async () => {
    if (!slipGroup || !slipFile) return;
    if (!slipQrPayload) { toast.error('ไม่พบ QR Code ในสลิป กรุณาลองสลิปอื่น'); return; }
    setSlipVerifying(true);
    try {
      const paymentIds = slipGroup.payments.map(p => p._id);
      const res = await fetch('/api/admin/payouts/verify-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIds, slipQrPayload, note: slipNote }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'ตรวจสอบสลิปไม่สำเร็จ', { duration: 6000 });
        setSlipFile(null); setSlipPreview(''); setSlipQrPayload(''); setSlipQrDetected(false);
        return;
      }
      toast.success(`ยืนยันโอนเงินสำเร็จ! ผู้โอน: ${data.senderName || 'Admin'} (฿${(data.receivedAmount ?? 0).toLocaleString()})`);
      resetSlipModal();
      await fetchPayouts();
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    finally { setSlipVerifying(false); }
  };

  const fmtMoney = (n: number) => `฿${n.toLocaleString('th-TH')}`;
  const fmtDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';

  const seedShowcaseCamps = async () => {
    setShowcaseSeeding(true);
    try {
      const res = await fetch('/api/admin/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed', visible: true }),
      });
      const data = await res.json();
      toast.success(`เพิ่มค่ายตัวอย่าง ${data.inserted} ค่ายสำเร็จ`);
      // Auto-enable showcase mode after seeding
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showcaseMode: true }),
      });
      setShowcaseMode(true);
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
  const { isOpen: isDeleteCampModalOpen, onOpen: onDeleteCampModalOpen, onClose: onDeleteCampModalClose } = useDisclosure();

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'admin' && session?.user?.role !== 'super_admin') {
        router.push('/');
        return;
      }
      Promise.all([fetchData(), fetchShowcaseSettings()]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.role]);

  useEffect(() => {
    if (activeTab === 'payouts') fetchPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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

      const [usersRes, campsRes, careersRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/camps?includeAll=true'),
        fetch('/api/admin/holland-careers'),
      ]);

      const [usersData, campsData, careersData] = await Promise.all([
        usersRes.json(),
        campsRes.json(),
        careersRes.json() as Promise<{ careers?: HollandCareer[] }>,
      ]);

      if (usersData.users) setUsers(usersData.users);
      setCamps(Array.isArray(campsData) ? campsData : campsData.camps || []);
      if (careersData.careers) setHollandCareers(careersData.careers);
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

  const handleDeleteCamp = (camp: Camp) => {
    setSelectedCamp(camp);
    onDeleteCampModalOpen();
  };

  const confirmDeleteCamp = async () => {
    if (!selectedCamp) return;
    try {
      const res = await fetch(`/api/camps/${selectedCamp._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'เกิดข้อผิดพลาด'); return; }
      toast.success(`ลบค่าย "${selectedCamp.name}" สำเร็จ`);
      onDeleteCampModalClose();
      fetchData();
    } catch { toast.error('เกิดข้อผิดพลาด'); }
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

  const roleOrder: Record<string, number> = { user: 0, organizer: 1, admin: 2, super_admin: 3 };
  const filteredUsers = [...users]
    .filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      if (userSortKey === 'role') {
        aVal = roleOrder[a.role] ?? 0;
        bVal = roleOrder[b.role] ?? 0;
      } else if (userSortKey === 'createdAt') {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      } else if (userSortKey === 'status') {
        aVal = a.isBanned ? 1 : 0;
        bVal = b.isBanned ? 1 : 0;
      } else {
        aVal = a.name?.toLowerCase() || '';
        bVal = b.name?.toLowerCase() || '';
      }
      if (aVal < bVal) return userSortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return userSortDir === 'asc' ? 1 : -1;
      return 0;
    });

  function effectiveCampStatus(camp: Camp): string {
    if (camp.status !== 'active') return camp.status;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = camp.endDate ? new Date(camp.endDate) : camp.startDate ? new Date(camp.startDate) : null;
    if (end) {
      end.setHours(23, 59, 59, 999);
      if (now > end) return 'completed';
    }
    return camp.status;
  }

  const filteredCamps = camps.filter(c => {
    const eff = effectiveCampStatus(c);
    const matchStatus = campStatusFilter === 'all' || eff === campStatusFilter;
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-[1536px] mx-auto px-4">
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

  if (status === 'unauthenticated' || (session?.user?.role !== 'admin' && session?.user?.role !== 'super_admin')) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-[1536px] mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiShield className={`text-3xl ${session?.user?.role === 'super_admin' ? 'text-purple-500' : 'text-[#F2B33D]'}`} />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
            {session?.user?.role === 'super_admin' && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
                Super Admin
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {session?.user?.role === 'super_admin' ? 'จัดการระบบในฐานะ Super Admin — มีสิทธิ์เต็มรูปแบบ' : 'จัดการระบบและผู้ใช้งาน'}
          </p>
        </div>

        {/* Stats Cards - แก้ไขใช้ StatCard component */}
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
                    onClick={() => setActiveTab('payouts')}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left border-2 border-transparent hover:border-[#F2B33D]/40"
                  >
                    <FiTrendingUp className="text-[#F2B33D] text-2xl mb-3" />
                    <p className="text-xl font-bold text-[#F2B33D]">Payout</p>
                    <p className="text-sm text-gray-500 mt-1">Dashboard</p>
                    <p className="text-xs text-[#F2B33D] mt-2 font-medium">จัดการ →</p>
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



            <Tab key="users" title={`Users (${totalUsers})`}>
              <div className="py-6">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <Input
                    placeholder="ค้นหา User..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    startContent={<FiSearch />}
                    size="sm"
                    className="flex-1"
                  />
                  <div className="flex gap-1.5 flex-wrap items-center">
                    <span className="text-xs text-gray-400 mr-0.5">เรียงตาม</span>
                    {([
                      { key: 'createdAt', label: 'วันที่สมัคร' },
                      { key: 'name', label: 'ชื่อ' },
                      { key: 'role', label: 'Role' },
                      { key: 'status', label: 'สถานะ' },
                    ] as const).map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => {
                          if (userSortKey === key) setUserSortDir(d => d === 'asc' ? 'desc' : 'asc');
                          else { setUserSortKey(key); setUserSortDir('asc'); }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all flex items-center gap-1 ${
                          userSortKey === key
                            ? 'bg-[#F2B33D] text-white border-[#F2B33D]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {label}
                        {userSortKey === key && (
                          <span className="text-[10px]">{userSortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    ))}
                  </div>
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
                              user.role === 'super_admin' ? 'secondary' :
                                user.role === 'admin' ? 'danger' :
                                  user.role === 'organizer' ? 'primary' : 'default'
                            }
                          >
                            {user.role === 'super_admin' ? 'Super Admin' : user.role}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          {user.isBanned ? (
                            <Chip size="sm" color="danger" variant="flat">Banned</Chip>
                          ) : (
                            <Chip size="sm" color="success" variant="flat">Active</Chip>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('th-TH')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              color={user.isBanned ? "success" : "warning"}
                              variant="flat"
                              onPress={() => handleBanUser(user)}
                              isDisabled={user.role === 'admin' || user.role === 'super_admin'}
                            >
                              {user.isBanned ? 'ปลดแบน' : 'แบน'}
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              onPress={() => handleDeleteUser(user)}
                              isDisabled={user.role === 'admin' || user.role === 'super_admin'}
                              startContent={<FiTrash2 />}
                            >
                              ลบ
                            </Button>
                            {/* Super Admin only — role changer */}
                            {session?.user?.role === 'super_admin' && user.email !== session?.user?.email && (
                              <select
                                value={user.role}
                                onChange={async (e) => {
                                  const newRole = e.target.value;
                                  try {
                                    const res = await fetch(`/api/admin/users/${user._id}/role`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ role: newRole }),
                                    });
                                    if (!res.ok) { const d = await res.json(); toast.error(d.error || 'เกิดข้อผิดพลาด'); return; }
                                    toast.success(`เปลี่ยน Role เป็น ${newRole} สำเร็จ`);
                                    fetchData();
                                  } catch { toast.error('เกิดข้อผิดพลาด'); }
                                }}
                                className="h-7 px-2 rounded-lg text-xs border border-gray-200 bg-white text-gray-700 cursor-pointer focus:outline-none focus:border-[#F2B33D]"
                              >
                                <option value="user">user</option>
                                <option value="organizer">organizer</option>
                                <option value="admin">admin</option>
                                <option value="super_admin">super_admin</option>
                              </select>
                            )}
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
                    {([
                      { key: 'all', label: 'ทั้งหมด', color: 'bg-[#F2B33D] border-[#F2B33D]' },
                      { key: 'pending', label: 'รออนุมัติ', color: 'bg-orange-500 border-orange-500' },
                      { key: 'active', label: 'เปิดอยู่', color: 'bg-green-500 border-green-500' },
                      { key: 'completed', label: 'จบแล้ว', color: 'bg-blue-500 border-blue-500' },
                      { key: 'rejected', label: 'ปฏิเสธ', color: 'bg-red-500 border-red-500' },
                    ] as const).map(({ key, label, color }) => {
                      const count = key === 'all' ? null : camps.filter(c => effectiveCampStatus(c) === key).length;
                      return (
                        <button
                          key={key}
                          onClick={() => setCampStatusFilter(key)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 ${campStatusFilter === key
                            ? `${color} text-white`
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          {count !== null ? `${label} (${count})` : label}
                        </button>
                      );
                    })}
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
                          {(() => {
                            const eff = effectiveCampStatus(camp);
                            return (
                              <Chip
                                size="sm"
                                color={
                                  eff === 'active' ? 'success' :
                                    eff === 'pending' ? 'warning' :
                                      eff === 'rejected' ? 'danger' :
                                        eff === 'completed' ? 'primary' :
                                          'default'
                                }
                              >
                                {eff === 'completed' && camp.status === 'active' ? 'จบแล้ว' : eff}
                              </Chip>
                            );
                          })()}
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
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              isIconOnly
                              title="ลบค่าย"
                              onPress={() => handleDeleteCamp(camp)}
                            >
                              <FiTrash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Tab>

            {/* ─── Payouts Tab ─── */}
            <Tab key="payouts" title={
              <div className="flex items-center gap-1.5">
                <FiDollarSign size={13} />
                <span>Payouts</span>
                {payoutGroups.length > 0 && (
                  <span className="w-4 h-4 bg-orange-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                    {payoutGroups.length}
                  </span>
                )}
              </div>
            }>
              <div className="py-6 space-y-4">
                {payoutLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F2B33D]" />
                  </div>
                ) : (
                  <>
                    {/* Header row: 2 stat cards + refresh */}
                    <div className="flex items-stretch gap-3">
                      {/* รอโอน */}
                      <div className={`flex-1 rounded-2xl border-2 p-4 transition-all cursor-pointer ${payoutSubTab === 'pending' ? 'border-[#F2B33D] bg-[#FEF6E0]' : 'border-gray-100 bg-white'}`}
                        onClick={() => setPayoutSubTab('pending')}>
                        <div className="flex items-center gap-2 mb-1">
                          <FiClock size={14} className={payoutSubTab === 'pending' ? 'text-[#F2B33D]' : 'text-gray-400'} />
                          <span className="text-xs font-medium text-gray-500">รอโอน</span>
                          {payoutGroups.length > 0 && (
                            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                              {payoutSummary?.pendingCount ?? payoutGroups.reduce((s, g) => s + g.payments.length, 0)} รายการ
                            </span>
                          )}
                        </div>
                        <p className={`text-xl font-black ${payoutSubTab === 'pending' ? 'text-[#F2B33D]' : 'text-gray-800'}`}>
                          {fmtMoney(payoutSummary?.pendingTotal ?? 0)}
                        </p>
                      </div>

                      {/* โอนแล้ว */}
                      <div className={`flex-1 rounded-2xl border-2 p-4 transition-all cursor-pointer ${payoutSubTab === 'history' ? 'border-green-400 bg-green-50' : 'border-gray-100 bg-white'}`}
                        onClick={() => setPayoutSubTab('history')}>
                        <div className="flex items-center gap-2 mb-1">
                          <FiCheckCircle size={14} className={payoutSubTab === 'history' ? 'text-green-500' : 'text-gray-400'} />
                          <span className="text-xs font-medium text-gray-500">โอนแล้ว</span>
                          {payoutHistory.length > 0 && (
                            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
                              {payoutSummary?.paidOutCount ?? payoutHistory.length} รายการ
                            </span>
                          )}
                        </div>
                        <p className={`text-xl font-black ${payoutSubTab === 'history' ? 'text-green-600' : 'text-gray-800'}`}>
                          {fmtMoney(payoutSummary?.paidOutTotal ?? 0)}
                        </p>
                      </div>

                      {/* Refresh button */}
                      <button onClick={fetchPayouts}
                        className="w-10 rounded-2xl border border-gray-100 bg-white flex items-center justify-center text-gray-400 hover:text-[#F2B33D] hover:border-[#F2B33D] transition-all"
                        title="รีเฟรช">
                        <FiRefreshCw size={15} />
                      </button>
                    </div>

                    {/* Platform fee summary (small text) */}
                    {payoutSummary && payoutSummary.totalPlatformFee > 0 && (
                      <p className="text-xs text-gray-400 px-1">
                        รายได้ Platform รวม: <span className="font-semibold text-[#F2B33D]">{fmtMoney(payoutSummary.totalPlatformFee)}</span>
                        {' · '}Organizer ได้รับรวม: <span className="font-semibold text-green-600">{fmtMoney(payoutSummary.totalOrganizerNet)}</span>
                      </p>
                    )}

                    {/* Pending — grouped by organizer */}
                    {payoutSubTab === 'pending' && (
                      <div className="space-y-3">
                        {payoutGroups.length === 0 ? (
                          <div className="rounded-2xl bg-white border border-gray-100 text-center flex flex-col items-center justify-center" style={{ minHeight: 400 }}>
                            <FiCheckCircle className="w-10 h-10 text-green-400 mb-3" />
                            <p className="text-gray-500 text-sm font-medium">ไม่มีรายการรอโอน</p>
                          </div>
                        ) : payoutGroups.map(g => (
                          <div key={g.organizerId} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                            {/* Header: organizer | total amount + button */}
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-[#F2B33D]/10 flex items-center justify-center shrink-0">
                                  <FiUser size={15} className="text-[#F2B33D]" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-sm text-gray-900 truncate">{g.organizerAccountName || 'Organizer'}</p>
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full shrink-0">รอโอน</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                    <FiSmartphone size={10} />
                                    <span className="font-mono">{g.organizerPromptpay || '—'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <p className="font-black text-green-600 text-base">฿{g.totalNet.toLocaleString()}</p>
                                <Button size="sm" className="bg-[#F2B33D] text-white font-semibold text-xs"
                                  onPress={() => openSlipModal(g)}
                                  startContent={<FiZap size={13} />}>สแกน QR</Button>
                              </div>
                            </div>
                            {/* Payment rows */}
                            <div className="bg-gray-50 rounded-xl overflow-hidden text-xs">
                              <div className="px-3 py-2 border-b border-gray-100 flex justify-between">
                                <span className="font-semibold text-gray-500">{g.payments.length} รายการ · รับรวม ฿{g.totalFinalAmount.toLocaleString()}</span>
                                <span className="text-[#F2B33D] font-semibold">Platform ฿{g.totalPlatformFee.toLocaleString()}</span>
                              </div>
                              {g.payments.map((p, i) => (
                                <div key={p._id} className={`px-3 py-2 flex items-center justify-between ${i < g.payments.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-gray-400 shrink-0">{i + 1}.</span>
                                    <span className="font-medium text-gray-700 truncate">{p.userName || '—'}</span>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0 text-gray-500">
                                    <span>{new Date(p.createdAt).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="font-semibold text-gray-800 w-14 text-right">฿{p.finalAmount.toLocaleString()}</span>
                                    <span className="text-[#F2B33D] w-10 text-right">-฿{(p.platformFee ?? 0).toLocaleString()}</span>
                                    <span className="font-bold text-green-600 w-12 text-right">฿{(p.organizerNet ?? 0).toLocaleString()}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* History */}
                    {payoutSubTab === 'history' && (
                      <div className="space-y-3">
                        {payoutHistory.length === 0 ? (
                          <div className="rounded-2xl bg-white border border-gray-100 text-center flex flex-col items-center justify-center" style={{ minHeight: 400 }}>
                            <p className="text-gray-400 text-sm">ยังไม่มีประวัติการโอน</p>
                          </div>
                        ) : payoutHistory.map(p => (
                          <div key={p._id} className="rounded-2xl bg-white border border-gray-100 shadow-sm">
                            <div className="p-4 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                <FiCheckCircle size={16} className="text-green-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900">{p.organizerAccountName || 'Organizer'}</p>
                                <p className="text-xs text-gray-500">{p.userName} · โอนเมื่อ {fmtDate(p.paidOutAt)}</p>
                                {p.payoutNote && <p className="text-xs text-gray-400 mt-0.5">หมายเหตุ: {p.payoutNote}</p>}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-black text-green-600 text-base">฿{(p.organizerNet ?? 0).toLocaleString()}</p>
                                <p className="text-[10px] text-gray-400">fee ฿{(p.platformFee ?? 0).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </Tab>

            <Tab key="settings" title={<span className="flex items-center gap-1.5"><FiMonitor />ตั้งค่า</span>}>
              <div className="py-6 space-y-6">

                {/* Sample Camps Card */}
                <div className={`rounded-2xl border-2 p-6 transition-all ${showcaseMode ? 'border-[#F2B33D] bg-[#FEF6E0]' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <FiMonitor className={showcaseMode ? 'text-[#F2B33D]' : 'text-gray-400'} />
                        ค่ายตัวอย่าง
                        <span className={`text-sm font-normal px-2 py-0.5 rounded-full ${showcaseCampCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {showcaseCampCount} ค่าย
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">20 ค่าย IT สายต่างๆ พร้อมรีวิวจำลอง สำหรับทดลองใช้งานแพลตฟอร์ม</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Toggle visibility */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{showcaseMode ? 'มองเห็น' : 'ซ่อนอยู่'}</span>
                        <button
                          onClick={() => saveShowcaseSettings(!showcaseMode)}
                          disabled={showcaseSaving || showcaseCampCount === 0}
                          className={`relative w-12 h-6 rounded-full transition-all duration-300 flex items-center disabled:opacity-40 ${showcaseMode ? 'bg-[#F2B33D]' : 'bg-gray-300'}`}
                          title={showcaseCampCount === 0 ? 'เพิ่มค่ายตัวอย่างก่อน' : (showcaseMode ? 'ซ่อนค่ายตัวอย่าง' : 'แสดงค่ายตัวอย่าง')}
                        >
                          <span className={`absolute w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${showcaseMode ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
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
                          ลบทั้งหมด
                        </Button>
                      )}
                      <Button
                        color="warning"
                        size="sm"
                        onPress={seedShowcaseCamps}
                        isLoading={showcaseSeeding}
                        startContent={<FiPlus />}
                      >
                        {showcaseCampCount > 0 ? 'Reseed' : 'เพิ่มค่ายตัวอย่าง'}
                      </Button>
                    </div>
                  </div>

                  {showcaseCampCount > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        'Web Development Bootcamp', 'Data Science & AI Workshop', 'Cybersecurity Essentials', 'Mobile App Development',
                        'Game Development with Unity', 'Cloud & DevOps Fundamentals', 'UI/UX Design Bootcamp', 'Backend Development with Node.js',
                        'Blockchain & Web3 Workshop', 'IoT & Embedded Systems', 'Machine Learning with Python', 'Database Design & SQL',
                        'Network Engineering', 'Digital Marketing & Analytics', 'Computer Vision with OpenCV', 'AR/VR Development',
                        'Competitive Programming', 'Open Source Contribution', 'System Design & Architecture', 'Full Stack Bootcamp',
                      ].map((name, i) => (
                        <div key={i} className="p-2.5 bg-white rounded-xl border border-gray-200">
                          <p className="text-xs font-medium text-gray-700 truncate">{name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">มีรีวิว · Active</p>
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
                {/* Platform Fee Settings — summary card */}
                <div className={`rounded-2xl border-2 p-5 transition-all ${platformEnabled ? 'border-green-300 bg-green-50/30' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${platformEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <FiTrendingUp size={18} className={platformEnabled ? 'text-green-600' : 'text-gray-400'} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">Platform Fee</h3>
                          {platformEnabled
                            ? <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">เปิดใช้งาน</span>
                            : <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full">ปิดอยู่</span>
                          }
                        </div>
                        {platformEnabled ? (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {platformAccountName} · {platformPromptpayId} · หัก <span className="font-semibold text-green-600">{platformFeePercent}%</span>
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 mt-0.5">QR ชี้ตรงหา Organizer (ไม่มีรายได้ platform)</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="flat"
                      className="font-semibold"
                      onPress={() => setPlatformModalOpen(true)}
                      startContent={<FiEdit2 size={13} />}
                    >
                      ตั้งค่า
                    </Button>
                  </div>
                </div>

                {/* Site Settings */}
                <div className="rounded-2xl border-2 border-gray-200 bg-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <FiMonitor className="text-gray-400" />
                        ตั้งค่าเว็บไซต์
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">จำนวนผู้เข้าชมและการแสดงผล</p>
                    </div>
                    <Button
                      className="bg-[#F2B33D] text-white font-semibold"
                      size="sm"
                      onPress={saveSiteSettings}
                      isLoading={siteSaving}
                      startContent={!siteSaving && <FiSave size={14} />}
                    >
                      บันทึก
                    </Button>
                  </div>
                  <div className="max-w-xs">
                    <Input
                      label="Visitor Offset (ตัวเลขเริ่มต้น)"
                      placeholder="59"
                      value={visitorOffset}
                      onValueChange={(v) => setVisitorOffset(v.replace(/\D/g, ''))}
                      description="ตัวเลขที่บวกเพิ่มกับจำนวนผู้เข้าชมจริง เพื่อให้ตัวเลขดูสมจริง"
                      classNames={{ inputWrapper: 'bg-white border border-gray-200' }}
                    />
                  </div>
                </div>
              </div>
            </Tab>
          </Tabs>
        </Card>
      </div>

      {/* ─── Platform Fee Settings Modal ────────────────────────────────────── */}
      <Modal isOpen={platformModalOpen} onClose={() => setPlatformModalOpen(false)} size="sm"
        classNames={{ base: 'bg-white rounded-3xl', header: 'border-b border-gray-100 px-5 py-4', body: 'p-5', footer: 'border-t border-gray-100 px-5 py-4 bg-gray-50' }}>
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <FiTrendingUp className="text-[#F2B33D]" />
              <h3 className="text-base font-bold text-gray-900">ตั้งค่า Platform Fee</h3>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <div className={`rounded-xl p-3 text-xs ${platformEnabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                {platformPromptpayId
                  ? `เปิดใช้งาน — QR จะชี้มา SkillScout, หัก ${platformFeePercent || '5'}%`
                  : 'ปล่อย PromptPay ว่างเพื่อปิดระบบ Platform Fee'}
              </div>
              <Input
                label="PromptPay ID (เบอร์หรือเลขบัตรประชาชน)"
                placeholder="0812345678 — ว่างเปล่า = ปิด"
                value={platformPromptpayId}
                onValueChange={(v) => setPlatformPromptpayId(v.replace(/\D/g, '').slice(0, 13))}
                description={
                  platformPromptpayId.length === 10 ? 'เบอร์โทรศัพท์' :
                  platformPromptpayId.length === 13 ? 'เลขบัตรประชาชน' : ''
                }
                classNames={{ inputWrapper: 'bg-gray-50 border-none' }}
              />
              <Input
                label="ชื่อบัญชี (แสดงใน QR)"
                placeholder="SkillScout"
                value={platformAccountName}
                onValueChange={setPlatformAccountName}
                classNames={{ inputWrapper: 'bg-gray-50 border-none' }}
              />
              <Input
                label="Fee % (0–30)"
                placeholder="5"
                value={platformFeePercent}
                onValueChange={(v) => setPlatformFeePercent(v.replace(/[^0-9.]/g, ''))}
                endContent={<span className="text-gray-400 text-sm">%</span>}
                classNames={{ inputWrapper: 'bg-gray-50 border-none' }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" className="text-gray-500" onPress={() => { setPlatformModalOpen(false); fetchShowcaseSettings(); }}>ยกเลิก</Button>
            <Button className="bg-[#F2B33D] text-white font-semibold"
              isLoading={platformSaving}
              startContent={!platformSaving && <FiSave size={15} />}
              onPress={async () => { await savePlatformSettings(); setPlatformModalOpen(false); }}>
              บันทึก
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ─── Payout Slip Scan Modal ─────────────────────────────────────────── */}
      <Modal isOpen={!!slipGroup} onClose={resetSlipModal} size="lg"
        scrollBehavior="inside" backdrop="opaque" isDismissable={!slipVerifying}
        classNames={{ base: 'bg-white rounded-3xl shadow-2xl', header: 'border-b border-gray-100 px-6 py-4', body: 'p-6', footer: 'border-t border-gray-100 px-6 py-4' }}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-2 items-center justify-center">
            {/* Stepper */}
            <div className="flex gap-2 mb-1">
              {[1, 2].map(s => (
                <div key={s} className={`h-2 rounded-full transition-all duration-300 ${payoutStep >= s ? 'w-8 bg-[#F2B33D]' : 'w-2 bg-gray-200'}`} />
              ))}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {payoutStep === 1 ? 'สแกน QR โอนเงิน' : 'แนบสลิปหลักฐาน'}
            </h2>
          </ModalHeader>

          <ModalBody>
            {slipGroup && (
              <>
                {/* ── Step 1: QR Code ── */}
                {payoutStep === 1 && (
                  <div className="flex flex-col items-center space-y-5 py-2 animate-appearance-in">
                    {payoutQrUrl ? (
                      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/50 w-[252px]">
                        {/* PromptPay logo banner */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/promptpay-logo.png" alt="PromptPay" className="w-full object-cover" />
                        {/* QR code */}
                        <div className="p-4 bg-white flex justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={payoutQrUrl} alt="PromptPay QR" className="w-[200px] h-[200px]" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-[252px] h-[300px] rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center">
                        <p className="text-sm text-gray-400">กำลังสร้าง QR...</p>
                      </div>
                    )}

                    <div className="text-center">
                      <p className="text-gray-500 text-sm mb-1">ยอดที่ต้องโอน</p>
                      <p className="text-4xl font-black text-[#F2B33D]">฿{slipGroup.totalNet.toLocaleString()}</p>
                    </div>

                    <p className="text-sm text-gray-500 text-center">
                      โอนให้: <strong className="text-gray-800">{slipGroup.organizerAccountName}</strong>
                      {slipGroup.organizerPromptpay && (
                        <span className="block font-mono text-xs text-gray-400 mt-0.5">{slipGroup.organizerPromptpay}</span>
                      )}
                    </p>

                    <div className="w-full bg-[#F2B33D]/10 rounded-xl p-4 flex items-start gap-3">
                      <FiSmartphone className="text-[#F2B33D] mt-0.5 shrink-0" size={18} />
                      <p className="text-sm text-gray-600">
                        สแกน QR ด้วยแอปธนาคารได้ทุกธนาคาร <strong>เมื่อโอนเสร็จแล้วกด &quot;โอนแล้ว&quot;</strong> เพื่ออัปโหลดสลิป
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Upload Slip ── */}
                {payoutStep === 2 && (
                  <div className="space-y-4 animate-appearance-in">
                    {/* QR mini reference */}
                    {payoutQrUrl && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={payoutQrUrl} alt="QR" className="w-14 h-14 rounded-lg shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">โอนให้</p>
                          <p className="text-sm font-bold text-gray-800 truncate">{slipGroup.organizerAccountName}</p>
                          <p className="text-lg font-black text-[#F2B33D]">฿{slipGroup.totalNet.toLocaleString()}</p>
                        </div>
                      </div>
                    )}

                    {/* Slip drop zone */}
                    <div className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer group ${slipPreview ? 'border-[#F2B33D] bg-[#F2B33D]/5' : 'border-gray-300 hover:border-[#F2B33D] hover:bg-gray-50'}`}>
                      <input type="file" accept="image/*" onChange={handleSlipFileChange} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                      {slipPreview ? (
                        <div className="relative flex justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={slipPreview} alt="Slip" className="max-h-56 w-auto rounded-lg shadow-sm object-contain" />
                          {slipQrDetected && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
                              <FiZap size={10} /> พบ QR Code
                            </div>
                          )}
                          {!slipQrDetected && slipFile && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-orange-400 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
                              ไม่พบ QR Code
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <span className="text-white font-medium flex items-center gap-2"><FiUpload size={14} /> เปลี่ยนรูป</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-[#F2B33D]">
                            <FiImage size={32} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-700">แตะเพื่ออัปโหลดสลิป</p>
                            <p className="text-xs text-gray-400 mt-1">รองรับไฟล์ JPG, PNG</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {slipFile && (
                      <button onClick={() => { setSlipFile(null); setSlipPreview(''); setSlipQrPayload(''); setSlipQrDetected(false); }}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors w-full text-right -mt-2">
                        ลบสลิป
                      </button>
                    )}

                    <Input label="หมายเหตุ (ไม่บังคับ)" placeholder="เช่น โอนผ่าน SCB" value={slipNote}
                      onValueChange={setSlipNote} classNames={{ inputWrapper: 'bg-gray-50 border-none' }} />
                  </div>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            {payoutStep === 2 && (
              <Button variant="light" className="text-gray-500 font-medium"
                onPress={() => setPayoutStep(1)} isDisabled={slipVerifying}>
                ย้อนกลับ
              </Button>
            )}
            {payoutStep === 1 && (
              <>
                <Button variant="light" className="text-gray-500 font-medium" onPress={resetSlipModal}>ยกเลิก</Button>
                <Button className="bg-[#F2B33D] text-white font-bold shadow-lg shadow-[#F2B33D]/20"
                  fullWidth size="lg"
                  isDisabled={!payoutQrUrl}
                  onPress={() => setPayoutStep(2)}
                  endContent={<FiUpload size={16} />}>
                  โอนแล้ว (แนบสลิป)
                </Button>
              </>
            )}
            {payoutStep === 2 && (
              <Button className="bg-[#F2B33D] text-white font-bold shadow-lg shadow-[#F2B33D]/20"
                fullWidth size="lg"
                isDisabled={!slipFile || !slipQrDetected}
                isLoading={slipVerifying}
                onPress={handleVerifyPayoutSlip}
                startContent={!slipVerifying && <FiCheck size={16} />}>
                ยืนยันการโอน
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Payout Confirm Modal */}
      <Modal isOpen={!!payoutGroupConfirm} onClose={() => { setPayoutGroupConfirm(null); setPayoutNote(''); }} size="sm"
        classNames={{ base: 'bg-white rounded-3xl', header: 'border-b border-gray-100 px-5 py-4', body: 'p-5', footer: 'border-t border-gray-100 px-5 py-4 bg-gray-50' }}>
        <ModalContent>
          <ModalHeader><h3 className="text-base font-bold text-gray-900">ยืนยันการโอนเงิน</h3></ModalHeader>
          <ModalBody>
            {payoutGroupConfirm && (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">จำนวนเงินที่โอน</p>
                  <p className="text-3xl font-black text-green-600">฿{payoutGroupConfirm.totalNet.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">จาก {payoutGroupConfirm.payments.length} รายการ · Platform ฿{payoutGroupConfirm.totalPlatformFee.toLocaleString()}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">โอนให้</span><span className="font-semibold">{payoutGroupConfirm.organizerAccountName || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">PromptPay</span><span className="font-mono">{payoutGroupConfirm.organizerPromptpay || '—'}</span></div>
                </div>
                {/* รายละเอียดผู้จ่าย */}
                <div className="bg-gray-50 rounded-xl overflow-hidden text-xs">
                  {payoutGroupConfirm.payments.map((p, i) => (
                    <div key={p._id} className={`px-3 py-2 flex justify-between ${i < payoutGroupConfirm.payments.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <span className="text-gray-600 truncate max-w-[130px]">{p.userName || '—'}</span>
                      <div className="flex items-center gap-2 shrink-0 text-gray-500">
                        <span>{new Date(p.createdAt).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="font-semibold text-green-600">฿{(p.organizerNet ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Input label="หมายเหตุ (ไม่บังคับ)" placeholder="เช่น โอนผ่าน SCB" value={payoutNote} onValueChange={setPayoutNote}
                  classNames={{ inputWrapper: 'bg-gray-50 border-none' }} />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" className="text-gray-500" onPress={() => { setPayoutGroupConfirm(null); setPayoutNote(''); }}>ยกเลิก</Button>
            <Button className="bg-green-500 text-white font-semibold" onPress={handleMarkPaidOut} isLoading={payoutMarking} startContent={!payoutMarking && <FiCheck size={16} />}>ยืนยันโอนแล้ว</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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

      {/* Delete Camp Modal */}
      <Modal isOpen={isDeleteCampModalOpen} onClose={onDeleteCampModalClose}>
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
              <FiAlertTriangle />
              ลบค่าย
            </h3>
          </ModalHeader>
          <ModalBody>
            {selectedCamp && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200">
                  <p className="font-semibold text-lg">{selectedCamp.name}</p>
                  <p className="text-sm text-gray-600 mt-1">โดย: {selectedCamp.organizerName}</p>
                  <p className="text-xs text-gray-500">{selectedCamp.organizerEmail}</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>คำเตือน:</strong> การลบค่ายจะลบข้อมูลทั้งหมดออกจากระบบและไม่สามารถกู้คืนได้
                    {selectedCamp.enrolled > 0 && ` (มีผู้สมัคร ${selectedCamp.enrolled} คน)`}
                  </p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteCampModalClose}>ยกเลิก</Button>
            <Button color="danger" startContent={<FiTrash2 />} onPress={confirmDeleteCamp}>
              ลบค่าย
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
