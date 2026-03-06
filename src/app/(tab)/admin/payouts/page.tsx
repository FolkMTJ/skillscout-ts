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
  payoutSlipUrl?: string;
  status: string;
  createdAt: string;
  organizerPromptpay?: string;
  organizerAccountName?: string;
  campName?: string;
}

interface CampGroup {
  campId: string;
  campName: string;
  endDate: string | null;
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
  const [pendingGrouped, setPendingGrouped] = useState<CampGroup[]>([]);
  const [history, setHistory] = useState<PayoutPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const [confirmGroup, setConfirmGroup] = useState<CampGroup | null>(null);
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
  const [step, setStep] = useState(1);

  const resetSlipModal = () => {
    setConfirmGroup(null);
    setSlipFile(null);
    setSlipPreview('');
    setSlipQrPayload('');
    setSlipQrDetected(false);
    setPayoutNote('');
    setStep(1);
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

    // Try multi-pass QR decoding for better success rates on high-res bank slips
    const decodeQR = (image: HTMLImageElement): string | null => {
      const attempts = [
        { width: image.naturalWidth, height: image.naturalHeight },
        { width: 800, height: 800 * (image.naturalHeight / image.naturalWidth) },
        { width: 400, height: 400 * (image.naturalHeight / image.naturalWidth) },
      ];

      for (const size of attempts) {
        // Skip upscaling
        if (size.width > image.naturalWidth && size.width !== image.naturalWidth) continue;

        const canvas = document.createElement('canvas');
        canvas.width = size.width;
        canvas.height = size.height;
        // willReadFrequently optimizes for multiple getImageData calls
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) continue;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // 1. Try default
        let code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
        if (code?.data) return code.data;

        // 2. Try invert (good for dark slips)
        code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
        if (code?.data) return code.data;

        // 3. Try high-contrast binarization (good for noisy backgrounds)
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          // threshold at 150 (slightly biased toward white to clear backgrounds)
          const v = avg > 150 ? 255 : 0;
          data[i] = data[i + 1] = data[i + 2] = v;
        }
        ctx.putImageData(imageData, 0, 0);
        code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
        if (code?.data) return code.data;
      }

      return null;
    };

    const objectUrl = URL.createObjectURL(file);
    const img = document.createElement('img') as HTMLImageElement;
    img.onload = () => {
      const decodedPayload = decodeQR(img);
      if (decodedPayload) {
        setSlipQrPayload(decodedPayload);
        setSlipQrDetected(true);
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

  // Mark paid — send all payment IDs in the group and verify slip
  const handleMarkPaidOut = async () => {
    if (!confirmGroup) return;
    setIsMarking(true);

    let slipUrl = '';
    try {
      // 1. Upload slip to Cloudinary if a slip was selected
      if (slipFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', slipFile);
        formDataUpload.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'skillscout');

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formDataUpload }
        );

        if (!uploadResponse.ok) {
          throw new Error('ไม่สามารถอัปโหลดรูปภาพสลิปได้');
        }

        const uploadData = await uploadResponse.json();
        slipUrl = uploadData.secure_url;
      }

      // 2. Call API to verify via RDCW and mark as paid
      const paymentIds = confirmGroup.payments.map(p => p._id);
      const res = await fetch('/api/admin/payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIds,
          note: payoutNote,
          slipUrl,
          slipQrPayload
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการตรวจสอบสลิป กรุณาลองใหม่');
      }

      toast.success(`โอนเงินให้ ${confirmGroup.organizerAccountName || 'Organizer'} สำเร็จ (${paymentIds.length} รายการ)\n${data.senderName ? `จาก: ${data.senderName}` : ''}`);
      resetSlipModal();
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่', { duration: 5000 });
    } finally {
      setIsMarking(false);
    }
  };

  const fmt = (n: number) => `฿${n.toLocaleString('th-TH')}`;
  const fmtDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) : '—';

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-zinc-700 animate-fade-in max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button isIconOnly variant="light" onPress={() => router.push('/admin')} className="text-gray-600 dark:text-gray-300 -ml-2">
            <FiArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Payout Dashboard</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">จัดการโอนเงินให้ Organizer</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
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
                  <CampGroupCard
                    key={g.campId}
                    group={g}
                    onMark={() => { setConfirmGroup(g); setPayoutNote(''); onOpen(); }}
                    isMarking={isMarking && confirmGroup?.campId === g.campId}
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
        size="lg"
        scrollBehavior="inside"
        classNames={{
          base: "bg-white dark:bg-gray-900 rounded-3xl shadow-2xl",
          header: "border-b border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center justify-center",
          body: "p-6",
          footer: "border-t border-gray-100 dark:border-gray-800 p-6 dark:bg-gray-900",
          closeButton: "hover:bg-gray-100 active:bg-gray-200 text-gray-500",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-2 items-center justify-center">
            <div className="flex gap-2 mb-1">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${step >= s ? "w-8 bg-[#F2B33D]" : "w-2 bg-gray-200 dark:bg-gray-700"
                    }`}
                />
              ))}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {step === 1 ? 'ยอดโอนและ QR Code' : 'แนบสลิปการโอนเงิน'}
            </h2>
          </ModalHeader>
          <ModalBody>
            {confirmGroup && (
              <div className="flex flex-col items-center justify-center space-y-6 animate-appearance-in w-full">

                {/* --- Step 1: QR Code Section --- */}
                {step === 1 && (
                  qrCodeUrl ? (
                    <div className="w-full min-h-[520px] flex flex-col justify-center space-y-5 py-2">
                      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/50 dark:shadow-none dark:border-gray-700 w-[252px] mx-auto">
                        {/* PromptPay logo */}
                        <div className="w-full h-auto flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/promptpay-logo.png" alt="PromptPay" className="w-full object-cover" width={252} height={60} />
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 flex justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={qrCodeUrl} alt="QR Code" width={200} height={200} />
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-gray-500 text-sm mb-1">ยอดโอน (สุทธิ)</p>
                        <p className="text-3xl font-black text-[#F2B33D]">
                          ฿{confirmGroup.totalNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500 text-center flex flex-col items-center gap-1 mt-2">
                        <span>โอนเบิกจ่ายค่าย: <strong className="text-gray-900">{confirmGroup.campName || 'ไม่ทราบชื่อค่าย'}</strong></span>
                        <span>ผู้รับ: <strong className="text-gray-700">{confirmGroup.organizerAccountName || 'Organizer'}</strong>
                          {confirmGroup.organizerPromptpay && ` (${confirmGroup.organizerPromptpay})`}</span>
                      </p>

                      <div className="w-full bg-[#F2B33D]/10 rounded-xl p-4 flex items-start gap-3 text-left">
                        <svg className="text-[#F2B33D] mt-1 shrink-0" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          สแกนด้วยแอปธนาคารได้ทุกธนาคาร <strong>เมื่อโอนเสร็จแล้วให้บันทึกสลิป</strong> เพื่อใช้อัปโหลดในย่อหน้าถัดไป
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 w-full min-h-[520px] flex flex-col justify-center">
                      <p className="text-[32px] leading-none font-black text-[#F2B33D] tracking-tight mb-3">
                        ฿{confirmGroup.totalNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-gray-600 mt-2 font-medium">โอนค่าย: <strong className="text-gray-900">{confirmGroup.campName || 'ไม่ทราบชื่อค่าย'}</strong></p>
                      <p className="text-xs text-gray-500 mt-1">ผู้รับ: {confirmGroup.organizerAccountName || 'Organizer'} <span className="font-mono text-[10px] ml-1">{confirmGroup.organizerPromptpay || '—'}</span></p>
                      <p className="text-red-500 text-sm mt-4 font-medium">ไม่สามารถดึงข้อมูล QR Code ได้</p>
                    </div>
                  ))}

                {/* --- Step 2: Upload Area --- */}
                {step === 2 && (
                  <div className="w-full min-h-[520px] flex flex-col justify-between pt-2">
                    <div
                      className={`relative border-2 border-dashed rounded-3xl text-center transition-all cursor-pointer group flex-1 flex flex-col justify-center
                    ${slipPreview ? 'border-[#F2B33D] bg-[#F2B33D]/5 p-2' : 'border-gray-300 hover:border-[#F2B33D] hover:bg-gray-50 dark:hover:bg-gray-800 p-8'}
                  `}
                    >
                      <input type="file" title="Upload Slip" accept="image/*" onChange={handleSlipFileChange} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />

                      {slipPreview ? (
                        <div className="relative flex justify-center w-full h-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={slipPreview} alt="Slip" className="max-h-[380px] w-auto rounded-[16px] shadow-sm object-contain" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[16px]">
                            <span className="text-white font-medium flex items-center gap-2">
                              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                              เปลี่ยนรูป
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-[#F2B33D]">
                            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="32" width="32" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                          </div>
                          <div>
                            <p className="font-bold text-gray-700 dark:text-gray-200">แตะเพื่ออัปโหลดสลิป</p>
                            <p className="text-xs text-gray-400 mt-1">รองรับไฟล์ JPG, PNG</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {slipQrDetected && (
                      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-xl mt-4">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="13" width="13" xmlns="http://www.w3.org/2000/svg"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                        <span>พบ QR Code ในสลิป</span>
                      </div>
                    )}

                    <div className="clear-both w-full mt-6 text-left">
                      <Input
                        label="หมายเหตุ (ไม่บังคับ)"
                        placeholder="เช่น โอนผ่านระบบ..."
                        value={payoutNote}
                        onValueChange={setPayoutNote}
                        variant="bordered"
                        classNames={{
                          inputWrapper: 'border-gray-200 focus-within:!border-[#F2B33D] rounded-[16px] shadow-none',
                          label: 'text-gray-600 font-medium'
                        }}
                        size="md"
                        labelPlacement="outside"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {step === 1 && (
              <Button
                className="bg-[#F2B33D] text-white font-bold shadow-lg shadow-[#F2B33D]/20"
                fullWidth
                size="lg"
                onPress={() => setStep(2)}
                isDisabled={!qrCodeUrl}
                endContent={<svg className="ml-1" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
              >
                โอนเงินแล้ว (แนบสลิปถัดไป)
              </Button>
            )}
            {step === 2 && (
              <div className="w-full flex gap-3">
                <Button variant="light" className="text-gray-500 font-medium px-6 text-base hover:bg-gray-100" onPress={() => setStep(1)} isDisabled={isMarking} size="lg">
                  ย้อนกลับ
                </Button>
                <Button
                  className="bg-[#F2B33D] text-white font-bold ml-auto shadow-lg shadow-[#F2B33D]/20 flex-1"
                  size="lg"
                  onPress={handleMarkPaidOut}
                  isDisabled={!slipQrDetected}
                  isLoading={isMarking}
                  endContent={!isMarking && <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                >
                  {isMarking ? 'กำลังโอนเงินและตรวจสอบสลิป...' : 'ยืนยันการโอนเงิน'}
                </Button>
              </div>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}


function CampGroupCard({ group: g, onMark, isMarking }: {
  group: CampGroup; onMark: () => void; isMarking: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isCampEnded = g.endDate ? new Date(g.endDate) < new Date() : false;

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <div className="p-4 space-y-3">
        {/* Header row: avatar + name + chip | QR button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-full ${isCampEnded ? 'bg-[#F2B33D]/10' : 'bg-gray-100'} flex items-center justify-center shrink-0`}>
              {isCampEnded ? <FiCheck size={14} className="text-[#F2B33D]" /> : <FiClock size={14} className="text-gray-400" />}
            </div>
            <div className="min-w-0 flex flex-col pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm text-gray-900 truncate">{g.campName || 'ไม่ทราบชื่อค่าย'}</p>
                <Chip size="sm" color={isCampEnded ? "warning" : "default"} variant="flat" className="text-[10px] h-5 px-1 font-medium">
                  {isCampEnded ? 'รอโอน' : 'รอค่ายจบ'}
                </Chip>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                <FiUser size={10} className="mt-0.5" />
                <span className="truncate">{g.organizerAccountName || 'Organizer'}</span>
                <span>·</span>
                <FiSmartphone size={10} className="mt-0.5" />
                <span className="font-mono">{g.organizerPromptpay || '—'}</span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            className={isCampEnded ? "bg-[#F2B33D] text-gray-900 font-semibold text-xs shrink-0" : "bg-gray-100 text-gray-400 font-medium text-xs shrink-0"}
            onPress={onMark}
            isLoading={isMarking}
            isDisabled={!isCampEnded}
            startContent={!isMarking && isCampEnded && <FiMaximize size={13} />}
          >
            {isCampEnded ? 'สแกน QR' : 'รอค่ายจบ'}
          </Button>
        </div>

        {/* Breakdown rows — borderless, flat */}
        <div className="space-y-1.5 text-xs pt-2">
          <div className="flex justify-between text-gray-500">
            <span>จำนวนรายการของค่ายนี้</span>
            <span className="font-semibold text-gray-700">{g.payments.length} บิลออเดอร์</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>ยอดที่รับมา (รวม)</span>
            <span className="font-semibold text-gray-800">฿{g.totalFinalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Platform fee (รวม)</span>
            <span className="text-[#F2B33D] font-semibold">-฿{g.totalPlatformFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 pb-1 mt-1">
            <span className="font-bold text-gray-800">ยอดสุทธิที่ต้องโอนเบิก</span>
            <span className="font-black text-green-600 text-[13px]">฿{g.totalNet.toLocaleString()}</span>
          </div>
        </div>

        {/* Expandable bill list */}
        {g.payments.length > 0 && (
          <div className="pt-1">
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
                      {new Date(p.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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
          <p className="font-semibold text-sm text-gray-900">{p.campName || 'ไม่ทราบชื่อค่าย'}</p>
          <p className="text-xs text-gray-500">ผู้รับ: {p.organizerAccountName || 'Organizer'} · {p.userName}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">โอนเมื่อ {fmtDate(p.paidOutAt)}</p>
          {p.payoutNote && <p className="text-[10px] text-gray-400">หมายเหตุ: {p.payoutNote}</p>}
        </div>
        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
          <div>
            <p className="font-black text-green-600 text-base">฿{(p.organizerNet ?? 0).toLocaleString()}</p>
            <p className="text-[10px] text-gray-400">fee ฿{(p.platformFee ?? 0).toLocaleString()}</p>
          </div>
          {p.payoutSlipUrl && (
            <Button
              as="a"
              href={p.payoutSlipUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              variant="flat"
              className="h-6 px-2.5 min-w-0 text-[10px] font-medium bg-[#F2B33D]/10 text-[#F2B33D]"
            >
              ดูสลิปโอนเงิน
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
