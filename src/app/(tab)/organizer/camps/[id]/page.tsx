'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Button, Chip, Input, Select, SelectItem, Modal, ModalContent,
  ModalHeader, ModalBody, ModalFooter, Textarea, Progress,
  Pagination, Tabs, Tab, Card, Tooltip,
} from '@heroui/react';
import {
  FiArrowLeft, FiDownload, FiSearch, FiUser, FiCheckCircle,
  FiXCircle, FiEye, FiUsers, FiDollarSign, FiEdit2, FiCheck,
  FiX, FiMapPin, FiCalendar, FiClock, FiAlertCircle, FiZap,
  FiUserCheck, FiRefreshCw, FiFileText, FiImage, FiTrash2,
} from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';
import CampFormModal from '@/components/organizer/CampFormModal';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Camp {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  galleryImages?: string[];
  location?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  deadline?: string;
  capacity?: number;
  participantCount?: number;
  enrolled?: number;
  fee?: number;
  originalFee?: number;
  price?: string;
  status?: string;
  tags?: string[];
  activityFormat?: string;
  requiresPortfolio?: boolean;
  portfolioInstructions?: string;
  qualifications?: { level?: string; fields?: string[] };
  additionalInfo?: string[];
  organizers?: Array<{ name: string; imageUrl: string }>;
}

interface Registration {
  _id: string;
  campId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userImage?: string;
  status: string;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  answers?: { question: string; answer: string }[];
  portfolioText?: string;
  portfolioLinks?: string[];
  portfolioFileUrl?: string;
}

interface Payment {
  _id: string;
  registrationId: string;
  finalAmount: number;
  status: string;
  slipVerified?: boolean;
  slipSenderName?: string;
  slipReceivedAmount?: number;
  verifiedBy?: string;
  verifiedAt?: string;
}

interface RegWithPayment extends Registration {
  payment: Payment | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'confirmed', label: 'ชำระเงิน' },
  { key: 'attended', label: 'เข้าร่วม' },
  { key: 'completed', label: 'จบค่าย' },
  { key: 'absent', label: 'ขาดค่าย' },
  { key: 'pending', label: 'ยังไม่ชำระ' },
  { key: 'rejected', label: 'ปฏิเสธ' },
];

function statusChip(status: string) {
  const map: Record<string, { color: 'warning' | 'primary' | 'success' | 'danger' | 'default' | 'secondary'; label: string }> = {
    pending: { color: 'warning', label: 'ยังไม่ชำระ' },
    approved: { color: 'warning', label: 'ยังไม่ชำระ' },
    confirmed: { color: 'success', label: 'ชำระเงิน' },
    attended: { color: 'primary', label: 'เข้าร่วม' },
    completed: { color: 'secondary', label: 'จบค่าย' },
    absent: { color: 'danger', label: 'ขาดค่าย' },
    rejected: { color: 'danger', label: 'ปฏิเสธ' },
    cancelled: { color: 'default', label: 'ยกเลิก' },
  };
  const s = map[status] ?? { color: 'default' as const, label: status };
  return <Chip size="sm" color={s.color} variant="flat" className="text-xs">{s.label}</Chip>;
}

function paymentChip(payment: Payment | null) {
  if (!payment) return <span className="text-xs text-gray-400">—</span>;
  if (payment.slipVerified || payment.status === 'completed')
    return (
      <Chip size="sm" color="success" variant="flat" className="text-[10px] gap-1"
        startContent={payment.verifiedBy === 'rdcw-auto' ? <FiZap size={10} /> : <FiCheckCircle size={10} />}>
        ชำระแล้ว
      </Chip>
    );
  if (payment.status === 'pending')
    return <Chip size="sm" color="warning" variant="flat" className="text-[10px]">รอชำระ</Chip>;
  return <Chip size="sm" color="default" variant="flat" className="text-[10px]">{payment.status}</Chip>;
}

const PAGE_SIZE = 25;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CampManagePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();

  const [camp, setCamp] = useState<Camp | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registrations');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewingReg, setViewingReg] = useState<RegWithPayment | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isActioning, setIsActioning] = useState(false);

  // ── Edit Modal ─────────────────────────────────────────────────────────────
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '', description: '', startDate: '', endDate: '', registrationDeadline: '',
    location: '', capacity: '', fee: '', tags: [] as string[], image: '', galleryImages: [] as string[],
    activityFormat: 'On-site', qualificationLevel: 'ทุกระดับ', qualificationDetails: '',
    additionalInfo: [] as string[], organizers: [] as Array<{ name: string; imageUrl: string }>,
    hasCertificate: false, allowVocational: false, requiresPortfolio: false,
    portfolioInstructions: '', originalFee: '',
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [campRes, regRes, payRes] = await Promise.all([
        fetch(`/api/camps/${id}`),
        fetch(`/api/registrations?campId=${id}`),
        fetch(`/api/payments/camp/${id}`),
      ]);
      const [campData, regData, payData] = await Promise.all([
        campRes.json(), regRes.json(), payRes.json(),
      ]);
      setCamp(campData._id ? campData : null);
      setRegistrations(regData.registrations || []);
      setPayments(payData.payments || []);
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchAll(); }, [id]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const registrationsWithPayment = useMemo<RegWithPayment[]>(() => {
    const pm = new Map(payments.map(p => [p.registrationId, p]));
    return registrations.map(r => ({ ...r, payment: pm.get(r._id) ?? null }));
  }, [registrations, payments]);

  const stats = useMemo(() => {
    const confirmed = registrations.filter(r => ['confirmed', 'attended', 'completed'].includes(r.status)).length;
    const pending = registrations.filter(r => ['pending', 'approved'].includes(r.status)).length;
    const attended = registrations.filter(r => ['attended', 'completed'].includes(r.status)).length;
    const revenue = payments
      .filter(p => p.slipVerified || p.status === 'completed')
      .reduce((s, p) => s + (p.finalAmount || 0), 0);
    return { total: registrations.length, confirmed, pending, attended, revenue };
  }, [registrations, payments]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return registrationsWithPayment.filter(r => {
      const matchSearch = !q
        || r.userName.toLowerCase().includes(q)
        || r.userEmail.toLowerCase().includes(q)
        || (r.userPhone || '').includes(q);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [registrationsWithPayment, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingCount = registrations.filter(r => r.status === 'pending').length;

  // ── Actions ────────────────────────────────────────────────────────────────

  const updateStatus = async (regId: string, status: string, notes?: string) => {
    const res = await fetch(`/api/registrations/${regId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewedBy: session?.user?.email, notes }),
    });
    if (!res.ok) throw new Error();
  };

  const handleApprove = async (regId: string) => {
    setIsActioning(true);
    try {
      await updateStatus(regId, 'approved');
      toast.success('อนุมัติสำเร็จ');
      fetchAll();
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    finally { setIsActioning(false); }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) {
      toast.error('กรุณาระบุเหตุผล'); return;
    }
    setIsActioning(true);
    try {
      await updateStatus(rejectTarget, 'rejected', rejectReason);
      toast.success('ปฏิเสธแล้ว');
      setRejectTarget(null); setRejectReason('');
      fetchAll();
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    finally { setIsActioning(false); }
  };

  const handleMarkAttended = async (regId: string) => {
    setIsActioning(true);
    try {
      await updateStatus(regId, 'attended');
      toast.success('บันทึกการเข้าร่วมแล้ว');
      fetchAll();
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    finally { setIsActioning(false); }
  };

  const handleMarkCompleted = async (regId: string) => {
    setIsActioning(true);
    try {
      await updateStatus(regId, 'completed');
      toast.success('บันทึกจบค่ายแล้ว');
      fetchAll();
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    finally { setIsActioning(false); }
  };

  const handleRemoveRegistration = async (regId: string, userName: string) => {
    if (!confirm(`ลบ "${userName}" ออกจากค่ายนี้หรือไม่?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`)) return;
    try {
      const res = await fetch(`/api/registrations/${regId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success('ลบผู้สมัครออกแล้ว');
      setViewingReg(null);
      fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    }
  };


  const handleOpenEditModal = () => {
    if (!camp) return;
    const qualificationFields = camp.qualifications?.fields || [];
    const allowVocational = qualificationFields.some(f => f.includes('อาชีวะ'));
    const qualificationDetails = qualificationFields.filter(f => !f.includes('อาชีวะ')).join(', ');
    const additionalInfo = camp.additionalInfo || [];
    const hasCertificate = additionalInfo.some(info => info.includes('ประกาศนียบัตร'));
    setEditFormData({
      name: camp.name, description: camp.description || '',
      startDate: camp.startDate ? new Date(camp.startDate).toISOString().split('T')[0] : '',
      endDate: camp.endDate ? new Date(camp.endDate).toISOString().split('T')[0] : '',
      registrationDeadline: camp.registrationDeadline ? new Date(camp.registrationDeadline).toISOString().split('T')[0] : '',
      location: camp.location || '', capacity: (camp.capacity ?? camp.participantCount ?? 0).toString(),
      fee: (camp.fee ?? 0).toString(), tags: camp.tags || [],
      image: camp.image || '', galleryImages: camp.galleryImages || [],
      activityFormat: camp.activityFormat || 'On-site',
      qualificationLevel: camp.qualifications?.level || 'ทุกระดับ',
      qualificationDetails, additionalInfo: additionalInfo.filter(i => !i.includes('ประกาศนียบัตร')),
      organizers: camp.organizers || [], hasCertificate, allowVocational,
      requiresPortfolio: camp.requiresPortfolio || false,
      portfolioInstructions: camp.portfolioInstructions || '',
      originalFee: camp.originalFee?.toString() || '',
    });
    setIsEditOpen(true);
  };

  const handleUpdateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!camp) return;
    try {
      const slug = editFormData.name !== camp.name
        ? editFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : camp.slug;
      const startDate = new Date(editFormData.startDate);
      const endDate = new Date(editFormData.endDate);
      const registrationDeadline = new Date(editFormData.registrationDeadline);
      const qualificationInfo = [];
      if (editFormData.qualificationDetails) qualificationInfo.push(editFormData.qualificationDetails);
      if (editFormData.allowVocational) qualificationInfo.push('สายอาชีวะสามารถสมัครได้');
      const additionalInfo = [...editFormData.additionalInfo];
      if (editFormData.hasCertificate) additionalInfo.push('มีประกาศนียบัตร');
      const payload = {
        name: editFormData.name, description: editFormData.description, location: editFormData.location,
        startDate: startDate.toISOString(), endDate: endDate.toISOString(),
        registrationDeadline: registrationDeadline.toISOString(),
        capacity: parseInt(editFormData.capacity), fee: parseInt(editFormData.fee),
        originalFee: editFormData.originalFee ? parseInt(editFormData.originalFee) : undefined,
        tags: editFormData.tags, slug,
        image: editFormData.image, galleryImages: editFormData.galleryImages,
        activityFormat: editFormData.activityFormat,
        date: `${startDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })} - ${endDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        deadline: registrationDeadline.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }),
        participantCount: parseInt(editFormData.capacity),
        price: `฿${parseInt(editFormData.fee).toLocaleString()}`,
        qualifications: { level: editFormData.qualificationLevel, fields: qualificationInfo },
        additionalInfo, organizers: editFormData.organizers.length > 0 ? editFormData.organizers : camp.organizers,
        requiresPortfolio: editFormData.requiresPortfolio,
        portfolioInstructions: editFormData.requiresPortfolio ? editFormData.portfolioInstructions : undefined,
        ...(camp.status === 'rejected' && { status: 'pending' }),
      };
      const res = await fetch(`/api/camps/${camp._id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success('อัพเดทค่ายสำเร็จ!');
      setIsEditOpen(false);
      fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    }
  };

  const handleBulkApprove = async () => {
    if (selected.size === 0) return;
    setIsActioning(true);
    let ok = 0;
    for (const rid of selected) {
      try { await updateStatus(rid, 'approved'); ok++; } catch { }
    }
    toast.success(`อนุมัติ ${ok}/${selected.size} คน`);
    setSelected(new Set());
    setIsActioning(false);
    fetchAll();
  };

  // ── Export ─────────────────────────────────────────────────────────────────

  // Questions to exclude from CSV export
  const EXCLUDED_Q = ['เหตุผล', 'มหาวิทยาลัย', 'สถาบัน'];
  const isExcluded = (q: string) => EXCLUDED_Q.some(kw => q.includes(kw));

  const handleExport = () => {
    const allAnswers = registrations[0]?.answers?.filter(a => !isExcluded(a.question)) ?? [];
    const headers = [
      'ชื่อ', 'อีเมล', 'เบอร์โทร', 'สถานะ', 'วันที่สมัคร', 'สถานะชำระเงิน',
      'ยอดชำระ (฿)', 'ชื่อในสลิป',
      ...allAnswers.map(a => a.question),
      ...(camp?.requiresPortfolio ? ['Portfolio คำอธิบาย', 'Portfolio ลิงก์', 'Portfolio ไฟล์'] : []),
    ];
    const rows = registrationsWithPayment.map(r => [
      r.userName, r.userEmail, r.userPhone || '',
      STATUS_OPTIONS.find(s => s.key === r.status)?.label ?? r.status,
      new Date(r.appliedAt).toLocaleDateString('th-TH'),
      r.payment?.slipVerified ? 'ชำระแล้ว' : r.payment ? 'รอชำระ' : 'ยังไม่ชำระ',
      r.payment?.finalAmount?.toString() ?? '0',
      r.payment?.slipSenderName ?? '',
      ...(r.answers?.filter(a => !isExcluded(a.question)).map(a => a.answer) ?? []),
      ...(camp?.requiresPortfolio ? [
        r.portfolioText ?? '',
        (r.portfolioLinks ?? []).filter(l => l).join(' | '),
        r.portfolioFileUrl ?? '',
      ] : []),
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${camp?.name ?? 'camp'}_ผู้สมัคร.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('ส่งออกข้อมูลแล้ว');
  };

  // ── Checkbox helpers ───────────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const pendingIds = paginated.filter(r => r.status === 'pending').map(r => r._id);
    const allSelected = pendingIds.every(id => selected.has(id));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) pendingIds.forEach(id => next.delete(id));
      else pendingIds.forEach(id => next.add(id));
      return next;
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F2B33D]" />
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">ไม่พบข้อมูลค่าย</p>
          <Button onPress={() => router.push('/organizer')} variant="flat">กลับ</Button>
        </div>
      </div>
    );
  }

  const capacity = camp.capacity ?? 0;
  const enrollPct = capacity > 0 ? Math.round(((camp.enrolled ?? 0) / capacity) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-50 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* ── Page Header ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button isIconOnly variant="flat" onPress={() => router.push('/organizer')}
              className="text-gray-600 bg-white shadow-sm mt-0.5 shrink-0">
              <FiArrowLeft size={18} />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900">{camp.name}</h1>
                {camp.status && (
                  <Chip size="sm" variant="flat"
                    color={camp.status === 'active' ? 'success' : camp.status === 'completed' ? 'default' : 'warning'}
                    className="text-xs">
                    {camp.status === 'active' ? 'เปิดรับสมัคร' : camp.status === 'completed' ? 'จบแล้ว' : camp.status}
                  </Chip>
                )}
                {pendingCount > 0 && (
                  <Chip size="sm" color="danger" variant="flat" className="text-xs">
                    {pendingCount} รอพิจารณา
                  </Chip>
                )}
              </div>
              {camp.location && <p className="text-sm text-gray-500 mt-0.5">{camp.location}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
            <Tooltip content="รีเฟรชข้อมูล">
              <Button isIconOnly variant="flat" onPress={fetchAll}
                className="bg-white shadow-sm text-gray-500">
                <FiRefreshCw size={16} />
              </Button>
            </Tooltip>
            <Button
              variant="flat"
              startContent={<FiDownload size={15} />}
              onPress={handleExport}
              className="bg-white shadow-sm text-gray-700 font-medium"
            >
              Export CSV
            </Button>
            <Button
              startContent={<FiEdit2 size={15} />}
              onPress={handleOpenEditModal}
              className="bg-[#F2B33D] text-white font-bold shadow-lg shadow-orange-200"
            >
              แก้ไขค่าย
            </Button>
          </div>
        </div>

        {/* ── Stats Row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* ผู้สมัครทั้งหมด */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">ผู้สมัครทั้งหมด</p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {stats.total}
                  {capacity > 0 && <span className="text-base font-normal text-gray-400 ml-1">/{capacity}</span>}
                </h3>
              </div>
              <FiUsers className="w-10 h-10 text-[#F2B33D]" />
            </div>
            <div className="h-1 w-full bg-[#F2B33D]" />
          </Card>

          {/* ยืนยันชำระเงิน */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">ยืนยันชำระเงิน</p>
                <h3 className="text-3xl font-bold text-gray-800">{stats.confirmed}</h3>
              </div>
              <FiCheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div className="h-1 w-full bg-green-500" />
          </Card>

          {/* เข้าร่วมจริง */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">เข้าร่วมจริง</p>
                <h3 className="text-3xl font-bold text-gray-800">{stats.attended}</h3>
              </div>
              <FiUserCheck className="w-10 h-10 text-blue-500" />
            </div>
            <div className="h-1 w-full bg-blue-500" />
          </Card>

          {/* รายได้รวม */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">รายได้รวม</p>
                <h3 className="text-3xl font-bold text-gray-800">
                  ฿{stats.revenue.toLocaleString('th-TH')}
                </h3>
              </div>
              <FiDollarSign className="w-10 h-10 text-purple-500" />
            </div>
            <div className="h-1 w-full bg-purple-500" />
          </Card>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={k => setActiveTab(k as string)}
          classNames={{
            tabList: 'bg-white shadow-sm rounded-2xl p-1',
            cursor: 'bg-[#F2B33D]',
            tab: 'rounded-xl font-medium',
            tabContent: 'group-data-[selected=true]:text-white',
          }}
        >
          {/* ─── Registrations Tab ─────────────────────────────────────── */}
          <Tab key="registrations" title={
            <div className="flex items-center gap-2">
              <FiUsers size={15} />
              <span>ผู้สมัคร ({registrations.length})</span>
            </div>
          }>
            <div className="space-y-4 mt-4">
              {/* Toolbar */}
              <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="ค้นหา ชื่อ / อีเมล / เบอร์โทร..."
                  startContent={<FiSearch size={16} className="text-gray-400" />}
                  value={search}
                  onValueChange={v => { setSearch(v); setPage(1); }}
                  classNames={{ inputWrapper: 'bg-gray-50 border-none shadow-none', base: 'flex-1' }}
                />
                <Select
                  placeholder="ทั้งหมด"
                  selectedKeys={new Set([statusFilter])}
                  onSelectionChange={k => { setStatusFilter([...k][0] as string); setPage(1); }}
                  classNames={{ trigger: 'bg-gray-50 border-none shadow-none', base: 'w-full sm:w-44' }}
                >
                  {STATUS_OPTIONS.map(o => <SelectItem key={o.key}>{o.label}</SelectItem>)}
                </Select>
              </div>

              {/* Bulk action bar */}
              {selected.size > 0 && (
                <div className="bg-[#F2B33D]/10 border border-[#F2B33D]/30 rounded-2xl px-5 py-3 flex items-center gap-3">
                  <span className="text-sm font-bold text-[#B8860B]">เลือก {selected.size} คน</span>
                  <Button className="bg-[#F2B33D] text-white font-bold shadow-md shadow-orange-100"
                    startContent={<FiCheck size={14} />}
                    onPress={handleBulkApprove} isLoading={isActioning}>
                    อนุมัติทั้งหมดที่เลือก
                  </Button>
                  <Button variant="flat" className="text-gray-600 bg-white"
                    onPress={() => setSelected(new Set())}>
                    ยกเลิก
                  </Button>
                </div>
              )}

              {/* Table */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[2rem_1fr_1fr_8rem_8rem_7rem_4rem] gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide items-center">
                  <input
                    type="checkbox"
                    className="rounded"
                    onChange={toggleAll}
                    checked={paginated.filter(r => r.status === 'pending').length > 0
                      && paginated.filter(r => r.status === 'pending').every(r => selected.has(r._id))}
                  />
                  <span>ผู้สมัคร</span>
                  <span className="hidden md:block">อีเมล / เบอร์โทร</span>
                  <span>สถานะ</span>
                  <span>ชำระเงิน</span>
                  <span>วันที่สมัคร</span>
                  <span />
                </div>

                {/* Rows */}
                {paginated.length === 0 ? (
                  <div className="py-20 text-center">
                    <FiUsers className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 font-medium">ไม่พบผู้สมัคร</p>
                  </div>
                ) : (
                  paginated.map(r => (
                    <div
                      key={r._id}
                      className={`grid grid-cols-[2rem_1fr_1fr_8rem_8rem_7rem_4rem] gap-2 px-5 py-3.5 border-b border-gray-50 items-center transition-colors hover:bg-gray-50/50 ${selected.has(r._id) ? 'bg-[#F2B33D]/5' : ''}`}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selected.has(r._id)}
                        onChange={() => toggleSelect(r._id)}
                        disabled={r.status !== 'pending'}
                      />

                      {/* Name */}
                      <div>
                        <p className="font-semibold text-sm text-gray-900 truncate">{r.userName}</p>
                        <p className="text-xs text-gray-400 md:hidden truncate">{r.userEmail}</p>
                      </div>

                      {/* Email/Phone */}
                      <div className="hidden md:block">
                        <p className="text-sm text-gray-600 truncate">{r.userEmail}</p>
                        {r.userPhone && <p className="text-xs text-gray-400 mt-0.5">{r.userPhone}</p>}
                      </div>

                      {/* Status */}
                      <div>{statusChip(r.status)}</div>

                      {/* Payment */}
                      <div>{paymentChip(r.payment)}</div>

                      {/* Date */}
                      <div className="text-sm text-gray-400">
                        {new Date(r.appliedAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        {r.status === 'pending' && (
                          <>
                            <Button size="sm" variant="flat"
                              className="bg-green-50 text-green-700 font-semibold px-3"
                              startContent={<FiCheck size={14} />}
                              onPress={() => handleApprove(r._id)} isLoading={isActioning}>
                              อนุมัติ
                            </Button>
                            <Button size="sm" variant="flat"
                              className="bg-red-50 text-red-500 font-semibold px-3"
                              startContent={<FiX size={14} />}
                              onPress={() => { setRejectTarget(r._id); setRejectReason(''); }}>
                              ปฏิเสธ
                            </Button>
                          </>
                        )}
                        {r.status === 'confirmed' && (
                          <Button size="sm" variant="flat"
                            className="bg-blue-50 text-blue-600 font-semibold px-3"
                            startContent={<FiUserCheck size={14} />}
                            onPress={() => handleMarkAttended(r._id)}>
                            เข้าร่วม
                          </Button>
                        )}
                        {r.status === 'attended' && (
                          <Button size="sm" variant="flat"
                            className="bg-purple-50 text-purple-600 font-semibold px-3"
                            startContent={<FiCheckCircle size={14} />}
                            onPress={() => handleMarkCompleted(r._id)}>
                            จบค่าย
                          </Button>
                        )}
                        <Button isIconOnly size="sm" variant="flat"
                          className="w-9 h-9 min-w-0 bg-gray-100 text-gray-600"
                          onPress={() => setViewingReg(r)}>
                          <FiEye size={16} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center py-3">
                  <Pagination total={totalPages} page={page} onChange={setPage}
                    classNames={{ cursor: 'bg-[#F2B33D] text-white' }} />
                </div>
              )}
            </div>
          </Tab>

          {/* ─── Overview Tab ──────────────────────────────────────────── */}
          <Tab key="overview" title={
            <div className="flex items-center gap-2">
              <FiAlertCircle size={15} />
              <span>ภาพรวมค่าย</span>
            </div>
          }>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Camp image */}
              {camp.image && (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm">
                  <Image src={camp.image} alt={camp.name} fill className="object-cover" />
                </div>
              )}

              {/* Right: Details + Status breakdown */}
              <div className="space-y-4">
                <Card className="border-none shadow-sm bg-white p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <FiMapPin size={15} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">สถานที่</p>
                      <p className="text-sm font-medium text-gray-800">{camp.location || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiCalendar size={15} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">วันที่จัดค่าย</p>
                      <p className="text-sm font-medium text-gray-800">{camp.date || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiClock size={15} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">ปิดรับสมัคร</p>
                      <p className="text-sm font-medium text-gray-800">{camp.deadline || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiUsers size={15} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">รับสมัคร</p>
                      <p className="text-sm font-medium text-gray-800">
                        {camp.enrolled ?? 0} / {capacity || '∞'} คน ({enrollPct}%)
                      </p>
                      {capacity > 0 && (
                        <Progress value={enrollPct} size="sm" className="mt-1 max-w-[160px]"
                          classNames={{ indicator: 'bg-[#F2B33D]', track: 'bg-[#F2B33D]/10' }} />
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiDollarSign size={15} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">ค่าสมัคร</p>
                      <p className="text-sm font-medium text-gray-800">
                        {camp.fee ? `฿${camp.fee.toLocaleString('th-TH')}` : camp.price || 'ฟรี'}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Status breakdown */}
                <Card className="border-none shadow-sm bg-white p-5">
                  <p className="text-xs font-semibold text-gray-400 mb-3">สรุปสถานะผู้สมัคร</p>
                  <div className="space-y-2">
                    {STATUS_OPTIONS.filter(s => s.key !== 'all').map(s => {
                      const count = registrations.filter(r => r.status === s.key).length;
                      if (count === 0 && !['pending', 'confirmed'].includes(s.key)) return null;
                      return (
                        <div key={s.key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{s.label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#F2B33D]"
                                style={{ width: registrations.length > 0 ? `${(count / registrations.length) * 100}%` : '0%' }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-800 w-6 text-right">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Description: full width */}
              {camp.description && (
                <Card className="border-none shadow-sm bg-white p-5 md:col-span-2">
                  <p className="text-xs font-semibold text-gray-400 mb-2">รายละเอียดค่าย</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{camp.description}</p>
                </Card>
              )}
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* ── Registration Detail Modal ──────────────────────────────────────── */}
      <Modal
        isOpen={!!viewingReg}
        onClose={() => setViewingReg(null)}
        size="lg"
        scrollBehavior="inside"
        classNames={{ base: 'bg-white rounded-3xl', header: 'border-b border-gray-100 px-6 py-4', body: 'p-6', footer: 'border-t border-gray-100 px-6 py-4' }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F2B33D]/10 flex items-center justify-center overflow-hidden shrink-0">
                {viewingReg?.userImage ? (
                  <Image src={viewingReg.userImage} alt={viewingReg.userName} width={40} height={40} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <FiUser size={18} className="text-[#F2B33D]" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{viewingReg?.userName}</h3>
                <p className="text-xs text-gray-500">{viewingReg?.userEmail}</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {viewingReg && (
              <div className="space-y-4">
                {/* Status + Payment */}
                <div className="flex items-center gap-2 flex-wrap">
                  {statusChip(viewingReg.status)}
                  {paymentChip(viewingReg.payment)}
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">เบอร์โทร</p>
                    <p className="text-sm font-medium">{viewingReg.userPhone || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">วันที่สมัคร</p>
                    <p className="text-sm font-medium">
                      {new Date(viewingReg.appliedAt).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  {viewingReg.payment && (
                    <>
                      <div className="bg-[#F2B33D]/10 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">ยอดชำระ</p>
                        <p className="text-lg font-black text-[#F2B33D]">฿{viewingReg.payment.finalAmount?.toLocaleString()}</p>
                      </div>
                      {viewingReg.payment.slipSenderName && (
                        <div className="bg-green-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-1">ชื่อในสลิป</p>
                          <p className="text-sm font-medium">{viewingReg.payment.slipSenderName}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Portfolio */}
                {camp?.requiresPortfolio && (viewingReg.portfolioText || viewingReg.portfolioLinks?.some(l => l) || viewingReg.portfolioFileUrl) && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-orange-700">Portfolio ที่ส่งมา</p>
                    {viewingReg.portfolioText && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">คำอธิบาย</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{viewingReg.portfolioText}</p>
                      </div>
                    )}
                    {viewingReg.portfolioLinks && viewingReg.portfolioLinks.filter(l => l).length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">ลิงก์ผลงาน</p>
                        <div className="space-y-1">
                          {viewingReg.portfolioLinks.filter(l => l).map((link, i) => (
                            <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                              className="block text-sm text-blue-600 underline truncate">{link}</a>
                          ))}
                        </div>
                      </div>
                    )}
                    {viewingReg.portfolioFileUrl && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">ไฟล์แนบ</p>
                        {(() => {
                          const url = viewingReg.portfolioFileUrl!;
                          const isPdf = url.includes('/raw/upload/') || url.toLowerCase().endsWith('.pdf');
                          return isPdf ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-red-600 underline font-medium hover:text-red-700">
                              <FiFileText size={14} /> เปิด / ดาวน์โหลด PDF
                            </a>
                          ) : (
                            <div className="space-y-2">
                              <a href={url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-blue-600 underline">
                                <FiImage size={14} /> ดูรูปภาพขนาดเต็ม
                              </a>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="Portfolio" className="rounded-lg max-h-48 object-contain border border-gray-200" />
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {viewingReg.notes && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-yellow-700 mb-1">หมายเหตุ Organizer</p>
                    <p className="text-sm text-gray-800">{viewingReg.notes}</p>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {viewingReg?.status === 'pending' && (
              <>
                <Button variant="flat" className="bg-red-50 text-red-500"
                  startContent={<FiXCircle size={14} />}
                  onPress={() => { setRejectTarget(viewingReg._id); setViewingReg(null); }}>
                  ปฏิเสธ
                </Button>
                <Button className="bg-[#F2B33D] text-white font-semibold"
                  startContent={<FiCheckCircle size={14} />}
                  onPress={() => { handleApprove(viewingReg._id); setViewingReg(null); }}>
                  อนุมัติ
                </Button>
              </>
            )}
            {viewingReg?.status === 'confirmed' && (
              <Button className="bg-blue-500 text-white font-semibold"
                startContent={<FiUserCheck size={14} />}
                onPress={() => { handleMarkAttended(viewingReg._id); setViewingReg(null); }}>
                เข้าร่วม
              </Button>
            )}
            {viewingReg?.status === 'attended' && (
              <Button className="bg-purple-500 text-white font-semibold"
                startContent={<FiCheckCircle size={14} />}
                onPress={() => { handleMarkCompleted(viewingReg._id); setViewingReg(null); }}>
                จบค่าย
              </Button>
            )}
            {session?.user && (session.user as { role?: string }).role === 'super_admin' && viewingReg && (
              <Button
                variant="flat"
                className="bg-red-50 text-red-600 font-semibold mr-auto"
                startContent={<FiTrash2 size={14} />}
                onPress={() => handleRemoveRegistration(viewingReg._id, viewingReg.userName)}
              >
                ลบออกจากค่าย
              </Button>
            )}
            <Button variant="light" className="text-gray-500" onPress={() => setViewingReg(null)}>ปิด</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Edit Camp Modal ─────────────────────────────────────────────────── */}
      <CampFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        formData={editFormData}
        onFormDataChange={setEditFormData}
        onSubmit={handleUpdateCamp}
        isEditing
      />

      {/* ── Reject Reason Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        size="sm"
        backdrop="opaque"
        classNames={{ base: 'bg-white rounded-3xl', header: 'border-b border-gray-100 px-6 py-4', body: 'p-6', footer: 'border-t border-gray-100 px-6 py-4' }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <FiAlertCircle className="text-red-500" size={18} />
              <h3 className="text-base font-bold text-gray-900">ระบุเหตุผลการปฏิเสธ</h3>
            </div>
          </ModalHeader>
          <ModalBody>
            <Textarea
              label="เหตุผล"
              placeholder="เช่น ข้อมูลไม่ครบถ้วน, ไม่ผ่านคุณสมบัติ..."
              value={rejectReason}
              onValueChange={setRejectReason}
              minRows={3}
              classNames={{ inputWrapper: 'bg-gray-50 border-none' }}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" className="text-gray-500" onPress={() => setRejectTarget(null)}>ยกเลิก</Button>
            <Button className="bg-red-500 text-white font-semibold"
              startContent={<FiX size={14} />}
              onPress={handleReject} isLoading={isActioning}>
              ยืนยันปฏิเสธ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
