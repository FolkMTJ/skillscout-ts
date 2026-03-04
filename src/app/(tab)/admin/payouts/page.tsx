'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, Button, Chip, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure } from '@heroui/react';
import {
  FiArrowLeft, FiDollarSign, FiClock, FiCheckCircle, FiSmartphone,
  FiTrendingUp, FiUser, FiCheck, FiMaximize, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { StatCard } from '@/components/common';
import { isAdminRole } from '@/lib/auth-check';
import QRCode from 'qrcode';
import generatePayload from 'promptpay-qr';
import jsQR from 'jsqr';

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

interface OrganizerGroup {
  organizerId: string;
  organizerAccountName: string;
  organizerPromptpay: string;
  totalNet: number;
  totalPlatformFee: number;
  totalFinalAmount: number;
  payments: PayoutPayment[];
}

interface Summary {
  totalPlatformFee: number;
  totalOrganizerNet: number;
  pendingTotal: number;
  paidOutTotal: number;
  pendingCount: number;
  paidOutCount: number;
}

export default function AdminPayoutsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [pendingGrouped, setPendingGrouped] = useState<OrganizerGroup[]>([]);
  const [history, setHistory] = useState<PayoutPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const [confirmGroup, setConfirmGroup] = useState<OrganizerGroup | null>(null);
  const [payoutNote, setPayoutNote] = useState('');
  const [isMarking, setIsMarking] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (confirmGroup?.organizerPromptpay && confirmGroup.totalNet) {
      const payload = generatePayload(confirmGroup.organizerPromptpay, { amount: confirmGroup.totalNet });
      QRCode.toDataURL(payload, { width: 200, margin: 2, color: { dark: '#000000', light: '#ffffff' } }, (err, url) => {
        if (!err) setQrCodeUrl(url);
      });
    } else {
      setQrCodeUrl(null);
    }
  }, [confirmGroup]);

  // Slip scan states
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState('');
  const [slipQrPayload, setSlipQrPayload] = useState('');
  const [slipQrDetected, setSlipQrDetected] = useState(false);

  const resetSlipModal = () => {
    setConfirmGroup(null);
    setSlipFile(null);
    setSlipPreview('');
    setSlipQrPayload('');
    setSlipQrDetected(false);
    setPayoutNote('');
    onClose();
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/payouts');
      if (!res.ok) {
        if (res.status === 401) { router.push('/admin'); return; }
        throw new Error('Failed to fetch');
      }
      const data = await res.json();
      setSummary(data.summary);
      setPendingGrouped(data.pendingGrouped ?? []);
      setHistory(data.history);
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === 'authenticated') fetchData();
  }, [status, fetchData]);

  const user = session?.user as { role?: string } | undefined;
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F2B33D]" />
      </div>
    );
  }
  if (!isAdminRole(user?.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">ไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      </div>
    );
  }

  // Mark paid — send all payment IDs in the group
  const handleMarkPaidOut = async () => {
    if (!confirmGroup) return;
    setIsMarking(true);
    try {
      const paymentIds = confirmGroup.payments.map(p => p._id);
      const res = await fetch('/api/admin/payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIds, note: payoutNote }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`โอนเงินให้ ${confirmGroup.organizerAccountName || 'Organizer'} สำเร็จ (${paymentIds.length} รายการ)`);
      resetSlipModal();
      await fetchData();
    } catch {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsMarking(false);
    }
  };

  const fmt = (n: number) => `฿${n.toLocaleString('th-TH')}`;
  const fmtDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-[1536px] mx-auto px-4 py-4 flex items-center gap-3">
          <Button isIconOnly variant="light" onPress={() => router.push('/admin')} className="text-gray-600">
            <FiArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Payout Dashboard</h1>
            <p className="text-xs text-gray-500">จัดการโอนเงินให้ Organizer</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1536px] mx-auto px-4 py-5 space-y-5">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={<FiTrendingUp />}
              title="รายได้ Platform"
              value={fmt(summary.totalPlatformFee)}
              color="primary"
            />
            <StatCard
              icon={<FiClock />}
              title={`รอโอน · ${pendingGrouped.length} ค่าย`}
              value={fmt(summary.pendingTotal)}
              color="warning"
            />
            <StatCard
              icon={<FiCheckCircle />}
              title={`โอนแล้ว · ${summary.paidOutCount} รายการ`}
              value={fmt(summary.paidOutTotal)}
              color="success"
            />
            <StatCard
              icon={<FiDollarSign />}
              title="Organizer ได้รับรวม"
              value={fmt(summary.totalOrganizerNet)}
              color="neutral"
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(k) => setActiveTab(k as string)}
          classNames={{
            tabList: 'bg-white shadow-sm rounded-2xl p-1',
            tab: 'rounded-xl',
            cursor: 'bg-[#F2B33D]',
            panel: 'pt-0',
          }}
        >
          <Tab
            key="pending"
            title={
              <div className="flex items-center gap-1.5 text-sm">
                <FiClock size={13} />
                <span>รอโอน ({pendingGrouped.length})</span>
              </div>
            }
          >
            <div className="mt-2 space-y-3">
              {pendingGrouped.length === 0 ? (
                <Card className="border-none shadow-sm bg-white p-10 text-center">
                  <FiCheckCircle className="w-10 h-10 mx-auto text-green-400 mb-3" />
                  <p className="text-gray-500 text-sm font-medium">ไม่มีรายการรอโอน</p>
                  <p className="text-gray-400 text-xs mt-1">Organizer ทุกคนได้รับเงินแล้ว</p>
                </Card>
              ) : (
                pendingGrouped.map((g) => (
                  <OrganizerGroupCard
                    key={g.organizerId}
                    group={g}
                    onMark={() => { setConfirmGroup(g); setPayoutNote(''); onOpen(); }}
                    isMarking={isMarking && confirmGroup?.organizerId === g.organizerId}
                  />
                ))
              )}
            </div>
          </Tab>

          <Tab
            key="history"
            title={
              <div className="flex items-center gap-1.5 text-sm">
                <FiCheckCircle size={13} />
                <span>โอนแล้ว ({history.length})</span>
              </div>
            }
          >
            <div className="mt-2 space-y-3">
              {history.length === 0 ? (
                <Card className="border-none shadow-sm bg-white p-8 text-center">
                  <p className="text-gray-400 text-sm">ยังไม่มีประวัติการโอน</p>
                </Card>
              ) : (
                history.map((p) => (
                  <HistoryCard key={p._id} payment={p} fmtDate={fmtDate} />
                ))
              )}
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Confirm Mark Paid Out Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={(open) => { if (!open) resetSlipModal(); }}
        size="md"
        classNames={{ base: 'bg-white rounded-3xl', header: 'px-6 py-4 border-b border-gray-100', body: 'p-6', footer: 'border-t border-gray-100 px-6 py-4' }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/promptpay-logo.png" alt="PromptPay" className="h-6 object-contain" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 leading-tight">สแกนสลิปการโอนเงิน</h3>
                <p className="text-[11px] text-gray-400 font-normal">อัปโหลดสลิปเพื่อยืนยันการโอน</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {confirmGroup && (
              <div className="space-y-4">

                {/* QR + Amount Card */}
                <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  {/* Top accent bar */}
                  <div className="bg-gradient-to-r from-[#003f88] to-[#005bbd] px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-blue-200 font-medium">โอนให้</p>
                      <p className="text-sm font-bold text-white leading-tight">{confirmGroup.organizerAccountName || 'Organizer'}</p>
                      <p className="text-[10px] text-blue-300 font-mono mt-0.5">{confirmGroup.organizerPromptpay || '—'}</p>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/promptpay-logo.png" alt="PromptPay" className="h-7 object-contain opacity-90 invert brightness-200" />
                  </div>

                  {/* Amount + QR body */}
                  <div className="bg-white p-4 flex flex-col items-center gap-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-0.5">{confirmGroup.payments.length} รายการ</p>
                      <p className="text-3xl font-black text-emerald-600 tracking-tight">
                        ฿{confirmGroup.totalNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    {qrCodeUrl && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-white p-3 rounded-2xl border-2 border-gray-100 shadow-inner">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={qrCodeUrl} alt="PromptPay QR" width={160} height={160} />
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                          <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" /><rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" /><rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" /><rect x="13" y="16" width="3" height="3" fill="currentColor" /><rect x="18" y="16" width="3" height="3" fill="currentColor" /><rect x="13" y="13" width="3" height="3" fill="currentColor" /><rect x="18" y="13" width="3" height="3" fill="currentColor" /></svg>
                          สแกนด้วยแอปธนาคาร
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload area */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">📎 อัปโหลดสลิปการโอน</p>
                  <label className={`flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all ${slipPreview ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 bg-gray-50 hover:border-[#F2B33D] hover:bg-[#F2B33D]/5'}`}>
                    {slipPreview ? (
                      <div className="relative w-full p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={slipPreview} alt="slip" className="w-full rounded-xl object-contain max-h-44" />
                        {slipQrDetected ? (
                          <div className="absolute top-4 right-4 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                            <FiCheck size={10} /> พบ QR Code แล้ว
                          </div>
                        ) : slipFile && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 bg-orange-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                            ไม่พบ QR Code
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-8 flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                          <FiSmartphone size={20} className="text-gray-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-600">แตะเพื่อเลือกสลิป</p>
                          <p className="text-xs text-gray-400 mt-0.5">ระบบจะอ่าน QR Code อัตโนมัติ · สูงสุด 5MB</p>
                        </div>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleSlipFileChange} />
                  </label>
                  {slipFile && (
                    <button
                      onClick={(e) => { e.preventDefault(); setSlipFile(null); setSlipPreview(''); setSlipQrPayload(''); setSlipQrDetected(false); }}
                      className="mt-1.5 text-[11px] text-gray-400 hover:text-red-400 transition-colors float-right"
                    >
                      ลบรูปภาพ
                    </button>
                  )}
                </div>

                <div className="clear-both">
                  <Input
                    label="หมายเหตุ (ไม่บังคับ)"
                    placeholder="เช่น โอนผ่าน SCB Mobile"
                    value={payoutNote}
                    onValueChange={setPayoutNote}
                    classNames={{ inputWrapper: 'bg-gray-50 border border-gray-100 rounded-xl shadow-none' }}
                    size="sm"
                  />
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="flex gap-2">
            <Button variant="light" className="text-gray-500 font-medium flex-1 text-sm bg-gray-100 rounded-xl" onPress={resetSlipModal}>
              ยกเลิก
            </Button>
            <Button
              className="bg-[#F2B33D] text-white font-bold flex-[2] shadow-sm shadow-[#F2B33D]/30 text-sm rounded-xl"
              onPress={handleMarkPaidOut}
              isLoading={isMarking}
              startContent={!isMarking && <FiCheck size={16} />}
            >
              ยืนยันโอนแล้ว
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}


function OrganizerGroupCard({ group: g, onMark, isMarking }: {
  group: OrganizerGroup; onMark: () => void; isMarking: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <div className="p-4 space-y-3">
        {/* Header row: avatar + name + chip | QR button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#F2B33D]/10 flex items-center justify-center shrink-0">
              <FiUser size={14} className="text-[#F2B33D]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm text-gray-900 truncate">{g.organizerAccountName || 'Organizer'}</p>
                <Chip size="sm" color="warning" variant="flat" className="text-[10px] h-5">รอโอน</Chip>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <FiSmartphone size={10} />
                <span className="font-mono">{g.organizerPromptpay || '—'}</span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-[#F2B33D] text-gray-900 font-semibold text-xs shrink-0"
            onPress={onMark}
            isLoading={isMarking}
            startContent={!isMarking && <FiMaximize size={13} />}
          >
            สแกน QR
          </Button>
        </div>

        {/* Breakdown rows — borderless, flat */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>จำนวนรายการ</span>
            <span className="font-semibold text-gray-700">{g.payments.length} รายการ</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>ยอดที่รับมา (รวม)</span>
            <span className="font-semibold text-gray-800">฿{g.totalFinalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Platform fee (รวม)</span>
            <span className="text-[#F2B33D] font-semibold">-฿{g.totalPlatformFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-1.5">
            <span className="font-bold text-gray-800">ต้องโอนให้ Organizer</span>
            <span className="font-black text-green-600 text-sm">฿{g.totalNet.toLocaleString()}</span>
          </div>
        </div>

        {/* Expandable bill list */}
        {g.payments.length > 0 && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
              {expanded ? 'ซ่อนรายบิล' : `ดูรายบิล (${g.payments.length})`}
            </button>
            {expanded && (
              <div className="mt-2 space-y-1.5">
                {g.payments.map((p, i) => (
                  <div key={p._id} className="bg-gray-50 rounded-xl px-3 py-2 text-xs">
                    <div className="flex justify-between text-gray-500 mb-0.5">
                      <span className="text-gray-400">#{i + 1} · {p.userName || 'ผู้ใช้'}</span>
                      <span className="font-mono text-[10px] text-gray-300">{p._id.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ยอดโอน</span>
                      <span className="font-semibold text-green-600">฿{(p.organizerNet ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(p.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function HistoryCard({ payment: p, fmtDate }: { payment: PayoutPayment; fmtDate: (s?: string) => string }) {
  return (
    <Card className="border-none shadow-sm bg-white">
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
    </Card>
  );
}
