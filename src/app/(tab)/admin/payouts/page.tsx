'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, Button, Chip, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from '@heroui/react';
import {
  FiArrowLeft, FiDollarSign, FiClock, FiCheckCircle, FiSmartphone,
  FiTrendingUp, FiUser, FiCheck,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { StatCard } from '@/components/common';

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
  if (user?.role !== 'admin') {
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
      const res = await fetch('/api/admin/payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: confirmPayment._id, note: payoutNote }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`โอนเงินให้ ${confirmPayment.organizerAccountName || 'Organizer'} สำเร็จ`);
      setConfirmPayment(null);
      setPayoutNote('');
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
                    onMark={() => { setConfirmPayment(p); setMarkingId(p._id); setPayoutNote(''); }}
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
        isOpen={!!confirmPayment}
        onClose={() => { setConfirmPayment(null); setPayoutNote(''); }}
        size="sm"
        classNames={{ base: 'bg-white rounded-3xl', header: 'border-b border-gray-100 px-5 py-4', body: 'p-5', footer: 'border-t border-gray-100 px-5 py-4 bg-gray-50' }}
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-base font-bold text-gray-900">ยืนยันการโอนเงิน</h3>
          </ModalHeader>
          <ModalBody>
            {confirmPayment && (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">จำนวนเงินที่โอน</p>
                  <p className="text-3xl font-black text-green-600">
                    ฿{(confirmPayment.organizerNet ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    หัก {confirmPayment.platformFeePercent}% platform fee (฿{(confirmPayment.platformFee ?? 0).toLocaleString()})
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">โอนให้</span>
                    <span className="font-semibold text-gray-900">{confirmPayment.organizerAccountName || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">PromptPay</span>
                    <span className="font-mono text-gray-800">{confirmPayment.organizerPromptpay || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ผู้จ่าย</span>
                    <span className="text-gray-700">{confirmPayment.userName}</span>
                  </div>
                </div>

                <Input
                  label="หมายเหตุ (ไม่บังคับ)"
                  placeholder="เช่น โอนผ่าน SCB"
                  value={payoutNote}
                  onValueChange={setPayoutNote}
                  classNames={{ inputWrapper: 'bg-gray-50 border-none' }}
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" className="text-gray-500" onPress={() => { setConfirmPayment(null); setPayoutNote(''); }}>
              ยกเลิก
            </Button>
            <Button
              className="bg-green-500 text-white font-semibold"
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
              className="bg-green-500 text-white font-semibold text-xs"
              onPress={onMark}
              isLoading={isMarking}
              startContent={!isMarking && <FiCheck size={13} />}
            >
              โอนแล้ว
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
