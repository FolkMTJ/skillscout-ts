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
  FiUserCheck, FiRefreshCw,
} from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Camp {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  location?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  deadline?: string;
  capacity?: number;
  enrolled?: number;
  fee?: number;
  price?: string;
  status?: string;
  tags?: string[];
  activityFormat?: string;
}

interface Registration {
  _id: string;
  campId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  status: string;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  answers?: { question: string; answer: string }[];
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
  { key: 'all',       label: 'ทั้งหมด' },
  { key: 'confirmed', label: 'ชำระเงิน' },
  { key: 'attended',  label: 'เข้าร่วม' },
  { key: 'completed', label: 'จบค่าย' },
  { key: 'pending',   label: 'ยังไม่ชำระ' },
  { key: 'rejected',  label: 'ปฏิเสธ' },
];

function statusChip(status: string) {
  const map: Record<string, { color: 'warning' | 'primary' | 'success' | 'danger' | 'default' | 'secondary'; label: string }> = {
    pending:   { color: 'warning',   label: 'ยังไม่ชำระ' },
    approved:  { color: 'warning',   label: 'ยังไม่ชำระ' },
    confirmed: { color: 'success',   label: 'ชำระเงิน' },
    attended:  { color: 'primary',   label: 'เข้าร่วม' },
    completed: { color: 'secondary', label: 'จบค่าย' },
    rejected:  { color: 'danger',    label: 'ปฏิเสธ' },
    cancelled: { color: 'default',   label: 'ยกเลิก' },
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
    const pending   = registrations.filter(r => ['pending', 'approved'].includes(r.status)).length;
    const attended  = registrations.filter(r => ['attended', 'completed'].includes(r.status)).length;
    const revenue   = payments
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
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  const handleBulkApprove = async () => {
    if (selected.size === 0) return;
    setIsActioning(true);
    let ok = 0;
    for (const rid of selected) {
      try { await updateStatus(rid, 'approved'); ok++; } catch {}
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
    ];
    const rows = registrationsWithPayment.map(r => [
      r.userName, r.userEmail, r.userPhone || '',
      STATUS_OPTIONS.find(s => s.key === r.status)?.label ?? r.status,
      new Date(r.appliedAt).toLocaleDateString('th-TH'),
      r.payment?.slipVerified ? 'ชำระแล้ว' : r.payment ? 'รอชำระ' : 'ยังไม่ชำระ',
      r.payment?.finalAmount?.toString() ?? '0',
      r.payment?.slipSenderName ?? '',
      ...(r.answers?.filter(a => !isExcluded(a.question)).map(a => a.answer) ?? []),
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F2B33D]" />
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-[1536px] mx-auto px-4 py-3 flex items-center gap-3">
          <Button isIconOnly variant="light" onPress={() => router.push('/organizer')} className="text-gray-600 shrink-0">
            <FiArrowLeft size={20} />
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-gray-900 truncate">{camp.name}</h1>
              {camp.status && (
                <Chip size="sm" variant="flat"
                  color={camp.status === 'active' ? 'success' : camp.status === 'completed' ? 'default' : 'warning'}
                  className="text-xs shrink-0">
                  {camp.status === 'active' ? 'เปิดรับสมัคร' : camp.status === 'completed' ? 'จบแล้ว' : camp.status}
                </Chip>
              )}
              {pendingCount > 0 && (
                <Chip size="sm" color="danger" variant="flat" className="text-xs shrink-0">
                  {pendingCount} รอพิจารณา
                </Chip>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{camp.location}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Tooltip content="รีเฟรชข้อมูล">
              <Button isIconOnly size="sm" variant="flat" onPress={fetchAll} className="text-gray-500">
                <FiRefreshCw size={14} />
              </Button>
            </Tooltip>
            <Button
              size="sm" variant="flat"
              startContent={<FiDownload size={14} />}
              onPress={handleExport}
              className="text-gray-700 bg-gray-100"
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              startContent={<FiEdit2 size={14} />}
              onPress={() => router.push(`/organizer?edit=${camp._id}`)}
              className="bg-[#F2B33D] text-white font-semibold"
            >
              แก้ไขค่าย
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1536px] mx-auto px-4 py-4 space-y-4">

        {/* ── Stats Row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-none shadow-sm bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F2B33D]/10 flex items-center justify-center shrink-0">
                <FiUsers size={18} className="text-[#F2B33D]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">ผู้สมัครทั้งหมด</p>
                <p className="text-xl font-black text-gray-900">
                  {stats.total}
                  {capacity > 0 && <span className="text-sm font-normal text-gray-400">/{capacity}</span>}
                </p>
              </div>
            </div>
            {capacity > 0 && (
              <Progress value={enrollPct} size="sm" className="mt-2"
                classNames={{ indicator: 'bg-[#F2B33D]', track: 'bg-[#F2B33D]/10' }} />
            )}
          </Card>

          <Card className="border-none shadow-sm bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <FiCheckCircle size={18} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">ยืนยันชำระเงิน</p>
                <p className="text-xl font-black text-gray-900">{stats.confirmed}</p>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FiUserCheck size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">เข้าร่วมจริง</p>
                <p className="text-xl font-black text-gray-900">{stats.attended}</p>
                {stats.confirmed > 0 && (
                  <p className="text-[10px] text-gray-400">
                    {Math.round((stats.attended / stats.confirmed) * 100)}% จากที่ยืนยัน
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                <FiDollarSign size={18} className="text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">รายได้รวม</p>
                <p className="text-xl font-black text-gray-900">
                  ฿{stats.revenue.toLocaleString('th-TH')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={k => setActiveTab(k as string)}
          classNames={{ tabList: 'bg-white shadow-sm rounded-xl p-1', cursor: 'bg-[#F2B33D]', tab: 'rounded-xl' }}
        >
          {/* ─── Registrations Tab ─────────────────────────────────────── */}
          <Tab key="registrations" title={
            <div className="flex items-center gap-1.5 text-sm">
              <FiUsers size={13} />
              <span>ผู้สมัคร ({registrations.length})</span>
            </div>
          }>
            <div className="space-y-3 mt-3">
              {/* Toolbar */}
              <div className="bg-white rounded-2xl shadow-sm p-3 flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="ค้นหา ชื่อ / อีเมล / เบอร์โทร..."
                  startContent={<FiSearch size={15} className="text-gray-400" />}
                  value={search}
                  onValueChange={v => { setSearch(v); setPage(1); }}
                  classNames={{ inputWrapper: 'bg-gray-50 border-none shadow-none', base: 'flex-1' }}
                  size="sm"
                />
                <Select
                  placeholder="สถานะ"
                  selectedKeys={new Set([statusFilter])}
                  onSelectionChange={k => { setStatusFilter([...k][0] as string); setPage(1); }}
                  classNames={{ trigger: 'bg-gray-50 border-none shadow-none min-h-unit-8', base: 'w-full sm:w-44' }}
                  size="sm"
                >
                  {STATUS_OPTIONS.map(o => <SelectItem key={o.key}>{o.label}</SelectItem>)}
                </Select>
              </div>

              {/* Bulk action bar */}
              {selected.size > 0 && (
                <div className="bg-[#F2B33D]/10 border border-[#F2B33D]/30 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#B8860B]">เลือก {selected.size} คน</span>
                  <Button size="sm" className="bg-[#F2B33D] text-white font-semibold"
                    startContent={<FiCheck size={13} />}
                    onPress={handleBulkApprove} isLoading={isActioning}>
                    อนุมัติทั้งหมดที่เลือก
                  </Button>
                  <Button size="sm" variant="flat" className="text-gray-600"
                    onPress={() => setSelected(new Set())}>
                    ยกเลิก
                  </Button>
                </div>
              )}

              {/* Table */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[2rem_1fr_1fr_7rem_7rem_6rem_3rem] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 items-center">
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
                  <div className="py-16 text-center">
                    <FiUsers className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">ไม่พบผู้สมัคร</p>
                  </div>
                ) : (
                  paginated.map(r => (
                    <div
                      key={r._id}
                      className={`grid grid-cols-[2rem_1fr_1fr_7rem_7rem_6rem_3rem] gap-2 px-4 py-3 border-b border-gray-50 items-center transition-colors ${selected.has(r._id) ? 'bg-[#F2B33D]/5' : ''}`}
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
                        {r.userPhone && <p className="text-xs text-gray-400">{r.userPhone}</p>}
                      </div>

                      {/* Status */}
                      <div>{statusChip(r.status)}</div>

                      {/* Payment */}
                      <div>{paymentChip(r.payment)}</div>

                      {/* Date */}
                      <div className="text-xs text-gray-400">
                        {new Date(r.appliedAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {r.status === 'pending' && (
                          <>
                            <Tooltip content="อนุมัติ">
                              <Button isIconOnly size="sm" variant="flat"
                                className="w-7 h-7 min-w-0 bg-green-50 text-green-600"
                                onPress={() => handleApprove(r._id)} isLoading={isActioning}>
                                <FiCheck size={13} />
                              </Button>
                            </Tooltip>
                            <Tooltip content="ปฏิเสธ">
                              <Button isIconOnly size="sm" variant="flat"
                                className="w-7 h-7 min-w-0 bg-red-50 text-red-500"
                                onPress={() => { setRejectTarget(r._id); setRejectReason(''); }}>
                                <FiX size={13} />
                              </Button>
                            </Tooltip>
                          </>
                        )}
                        {r.status === 'confirmed' && (
                          <Tooltip content="บันทึกการเข้าร่วม">
                            <Button isIconOnly size="sm" variant="flat"
                              className="w-7 h-7 min-w-0 bg-blue-50 text-blue-600"
                              onPress={() => handleMarkAttended(r._id)}>
                              <FiUserCheck size={13} />
                            </Button>
                          </Tooltip>
                        )}
                        {r.status === 'attended' && (
                          <Tooltip content="จบค่าย">
                            <Button isIconOnly size="sm" variant="flat"
                              className="w-7 h-7 min-w-0 bg-purple-50 text-purple-600"
                              onPress={() => handleMarkCompleted(r._id)}>
                              <FiCheckCircle size={13} />
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip content="ดูรายละเอียด">
                          <Button isIconOnly size="sm" variant="flat"
                            className="w-7 h-7 min-w-0 bg-gray-100 text-gray-600"
                            onPress={() => setViewingReg(r)}>
                            <FiEye size={13} />
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center py-2">
                  <Pagination total={totalPages} page={page} onChange={setPage}
                    classNames={{ cursor: 'bg-[#F2B33D] text-white' }} />
                </div>
              )}
            </div>
          </Tab>

          {/* ─── Overview Tab ──────────────────────────────────────────── */}
          <Tab key="overview" title={<span className="text-sm">ภาพรวมค่าย</span>}>
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
              <div className="w-10 h-10 rounded-full bg-[#F2B33D]/10 flex items-center justify-center">
                <FiUser size={18} className="text-[#F2B33D]" />
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
            <Button variant="light" className="text-gray-500" onPress={() => setViewingReg(null)}>ปิด</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
