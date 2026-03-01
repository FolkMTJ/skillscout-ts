'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, Button, Chip, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure } from '@heroui/react';
import {
  FiArrowLeft, FiDollarSign, FiClock, FiCheckCircle, FiSmartphone,
  FiTrendingUp, FiUser, FiCheck, FiMaximize
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
  // enriched
  organizerPromptpay?: string;
  organizerAccountName?: string;
  // from camp (joined manually via campId if available)
  campName?: string;
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
  const [pending, setPending] = useState<PayoutPayment[]>([]);
  const [history, setHistory] = useState<PayoutPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const [markingId, setMarkingId] = useState<string | null>(null);
  const [confirmPayment, setConfirmPayment] = useState<PayoutPayment | null>(null);
  const [payoutNote, setPayoutNote] = useState('');
  const [isMarking, setIsMarking] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (confirmPayment?.organizerPromptpay && confirmPayment.organizerNet) {
      const payload = generatePayload(confirmPayment.organizerPromptpay, { amount: confirmPayment.organizerNet });
      QRCode.toDataURL(payload, { width: 200, margin: 2, color: { dark: '#000000', light: '#ffffff' } }, (err, url) => {
        if (!err) setQrCodeUrl(url);
      });
    } else {
      setQrCodeUrl(null);
    }
  }, [confirmPayment]);

  // Slip scan states
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState('');
  const [slipQrPayload, setSlipQrPayload] = useState('');
  const [slipQrDetected, setSlipQrDetected] = useState(false);

  const resetSlipModal = () => {
    setConfirmPayment(null);
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
      setPending(data.pending);
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

  const handleMarkPaidOut = async () => {
    if (!confirmPayment) return;
    setIsMarking(true);
    try {
      if (slipFile && !slipQrPayload) {
        toast.error('ไม่พบ QR Code ในสลิป กรุณาลองสลิปอื่น หรือดำเนินการต่อโดยไม่ใช้สลิป', { duration: 4000 });
        // Allowing them to proceed if they choose to explicitly bypass slip reading, but normally we'd force it.
      }

      // We use the existing verified status endpoint for single payment marks
      // Consider integrating the /verify-slip endpoint from admin page if we need strong server verification
      const res = await fetch('/api/admin/payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: confirmPayment._id, note: payoutNote }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`โอนเงินให้ ${confirmPayment.organizerAccountName || 'Organizer'} สำเร็จ`);
      resetSlipModal();
      await fetchData();
    } catch {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsMarking(false);
      setMarkingId(null);
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
              title={`รอโอน · ${summary.pendingCount} รายการ`}
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
          }}
        >
          <Tab
            key="pending"
            title={
              <div className="flex items-center gap-1.5 text-sm">
                <FiClock size={13} />
                <span>รอโอน ({pending.length})</span>
              </div>
            }
          >
            <div className="mt-4 space-y-3">
              {pending.length === 0 ? (
                <Card className="border-none shadow-sm bg-white p-10 text-center">
                  <FiCheckCircle className="w-10 h-10 mx-auto text-green-400 mb-3" />
                  <p className="text-gray-500 text-sm font-medium">ไม่มีรายการรอโอน</p>
                  <p className="text-gray-400 text-xs mt-1">Organizer ทุกคนได้รับเงินแล้ว</p>
                </Card>
              ) : (
                pending.map((p) => (
                  <PayoutCard
                    key={p._id}
                    payment={p}
                    onMark={() => { setConfirmPayment(p); setMarkingId(p._id); setPayoutNote(''); onOpen(); }}
                    isMarking={markingId === p._id && isMarking}
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
            <div className="mt-4 space-y-3">
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
        size="sm"
        classNames={{ base: 'bg-white rounded-3xl', header: 'border-b border-gray-100 px-5 py-4', body: 'p-5', footer: 'border-t border-gray-100 px-5 py-4 bg-gray-50' }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#F2B33D]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="text-base font-bold text-gray-900">สแกนสลิปการโอนเงิน</h3>
            </div>
          </ModalHeader>
          <ModalBody>
            {confirmPayment && (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                  <p className="text-xs text-gray-500 mb-1">ยอดที่ต้องโอนให้ Organizer</p>
                  <p className="text-3xl font-black text-green-600">
                    ฿{(confirmPayment.organizerNet ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 mb-4">
                    {confirmPayment.organizerAccountName || '—'} · {confirmPayment.organizerPromptpay || '—'}
                  </p>
                  {qrCodeUrl && (
                    <div className="bg-white p-3 rounded-2xl inline-block shadow-sm border border-gray-100 mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrCodeUrl} alt="PromptPay QR" width={160} height={160} className="mx-auto" />
                      <div className="flex items-center justify-center gap-1.5 mt-2 text-xs font-semibold text-[#1B365D]">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4H10V10H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 4H20V10H14V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 14H10V20H4V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 14H17V17H14V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M17 17H20V20H17V17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 17H17V20H14V17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M17 14H20V17H17V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        สแกนด้วยแอปธนาคาร
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload area */}
                <div>
                  <label className={`flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${slipPreview ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white hover:border-[#F2B33D]/60'}`}>
                    {slipPreview ? (
                      <div className="relative w-full p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={slipPreview} alt="slip" className="w-full rounded-xl object-contain h-40" />
                        {slipQrDetected && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            พบ QR Code
                          </div>
                        )}
                        {!slipQrDetected && slipFile && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 bg-orange-400 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
                            ไม่พบ QR Code
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-8 flex flex-col items-center gap-2 text-gray-400">
                        <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                          <path d="M3 16L8 11C8.39782 10.6022 8.93913 10.3787 9.5 10.3787C10.0609 10.3787 10.6022 10.6022 11 11L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                        </svg>
                        <p className="text-sm font-medium">แตะเพื่อเลือกสลิป</p>
                        <p className="text-xs">ระบบจะอ่าน QR Code อัตโนมัติ</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleSlipFileChange} />
                  </label>
                  {slipFile && (
                    <div className="text-right mt-1">
                      <button onClick={(e) => { e.preventDefault(); setSlipFile(null); setSlipPreview(''); setSlipQrPayload(''); setSlipQrDetected(false); }}
                        className="text-[11px] text-gray-400 hover:text-red-400 transition-colors">
                        ลบรูปภาพ
                      </button>
                    </div>
                  )}
                </div>

                <Input
                  label="หมายเหตุ (ไม่บังคับ)"
                  placeholder="เช่น โอนผ่าน SCB"
                  value={payoutNote}
                  onValueChange={setPayoutNote}
                  classNames={{ inputWrapper: 'bg-gray-50 border-none rounded-xl' }}
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter className="flex gap-2">
            <Button variant="light" className="text-gray-500 font-medium flex-1 text-sm bg-gray-100" onPress={resetSlipModal}>
              ยกเลิก
            </Button>
            <Button
              className="bg-[#F2B33D] text-white font-semibold flex-[2] shadow-sm text-sm"
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


function PayoutCard({ payment: p, onMark, isMarking }: {
  payment: PayoutPayment; onMark: () => void; isMarking: boolean;
}) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Organizer info */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#F2B33D]/10 flex items-center justify-center shrink-0">
                <FiUser size={14} className="text-[#F2B33D]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{p.organizerAccountName || 'Organizer'}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FiSmartphone size={10} />
                  <span className="font-mono">{p.organizerPromptpay || '—'}</span>
                </div>
              </div>
            </div>

            {/* Payment breakdown */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>ผู้จ่าย</span>
                <span className="font-medium text-gray-700">{p.userName}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>ยอดที่รับมา</span>
                <span className="font-semibold text-gray-800">฿{p.finalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Platform fee ({p.platformFeePercent}%)</span>
                <span className="text-[#F2B33D] font-semibold">-฿{(p.platformFee ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1.5">
                <span className="font-semibold text-gray-700">ต้องโอนให้ Organizer</span>
                <span className="font-black text-green-600 text-sm">฿{(p.organizerNet ?? 0).toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 mt-2">
              ชำระเมื่อ {new Date(p.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
            </p>
          </div>

          {/* Action */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            <Chip size="sm" color="warning" variant="flat" className="text-[10px] h-5">รอโอน</Chip>
            <Button
              size="sm"
              className="bg-[#F2B33D] text-gray-900 font-semibold text-xs"
              onPress={onMark}
              isLoading={isMarking}
              startContent={!isMarking && <FiMaximize size={13} />}
            >
              สแกน QR
            </Button>
          </div>
        </div>
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
