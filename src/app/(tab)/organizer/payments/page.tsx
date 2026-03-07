'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Card, Button, Chip, Modal, ModalContent, ModalHeader,
  ModalBody, ModalFooter, Tabs, Tab,
} from '@heroui/react';
import {
  FiArrowLeft, FiEye, FiCheckCircle, FiCreditCard, FiUser, FiZap, FiClock, FiTrendingUp,
} from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Payment {
  _id: string;
  registrationId: string;
  userId: string;
  userEmail: string;
  userName: string;
  campId: string;
  campName: string;
  amount: number;
  finalAmount: number;
  status: string;
  slipUrl?: string;
  slipVerified?: boolean;
  slipSenderName?: string;
  slipReceivedAmount?: number;
  slipUploadedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Platform fee
  platformFeePercent?: number;
  platformFee?: number;
  organizerNet?: number;
  payoutStatus?: 'pending' | 'paid_out';
  paidOutAt?: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const { status } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState('completed');

  useEffect(() => {
    if (status === 'authenticated') fetchPayments();
  }, [status]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payments/organizer');
      const data = await res.json();
      if (data.payments) setPayments(data.payments);
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const completedPayments = payments.filter(
    p => p.status === 'completed' || p.slipVerified
  );
  const pendingPayments = payments.filter(
    p => p.status === 'pending' && !p.slipVerified
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F2B33D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-[1536px] mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            isIconOnly variant="light"
            onPress={() => router.push('/organizer')}
            className="text-gray-600"
          >
            <FiArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">การชำระเงิน</h1>
            <p className="text-xs text-gray-500">รายการชำระเงินของผู้สมัคร</p>
          </div>
          <div className="ml-auto">
            <span className="text-sm text-gray-500 font-medium">
              ชำระแล้ว {completedPayments.length} รายการ
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1536px] mx-auto px-4 py-4">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          classNames={{
            tabList: 'bg-white shadow-sm rounded-2xl p-1',
            tab: 'rounded-xl',
            cursor: 'bg-[#F2B33D]',
          }}
        >
          <Tab
            key="completed"
            title={
              <div className="flex items-center gap-1.5 text-sm">
                <FiCheckCircle size={13} />
                <span>ชำระแล้ว ({completedPayments.length})</span>
              </div>
            }
          >
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {completedPayments.length === 0 ? (
                <Card className="border-none shadow-sm bg-white p-8 text-center col-span-full">
                  <p className="text-gray-400 text-sm">ยังไม่มีรายการชำระเงิน</p>
                </Card>
              ) : (
                completedPayments.map(p => (
                  <PaymentCard key={p._id} payment={p} onView={() => setViewingPayment(p)} />
                ))
              )}
            </div>
          </Tab>

          <Tab
            key="pending"
            title={
              <div className="flex items-center gap-1.5 text-sm">
                <FiClock size={13} />
                <span>รอชำระ ({pendingPayments.length})</span>
              </div>
            }
          >
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingPayments.length === 0 ? (
                <Card className="border-none shadow-sm bg-white p-8 text-center col-span-full">
                  <FiCheckCircle className="w-10 h-10 mx-auto text-green-400 mb-3" />
                  <p className="text-gray-500 text-sm font-medium">ทุกคนชำระเงินแล้ว!</p>
                </Card>
              ) : (
                pendingPayments.map(p => (
                  <PaymentCard key={p._id} payment={p} onView={() => setViewingPayment(p)} />
                ))
              )}
            </div>
          </Tab>

          <Tab
            key="all"
            title={<span className="text-sm">ทั้งหมด ({payments.length})</span>}
          >
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {payments.length === 0 ? (
                <Card className="border-none shadow-sm bg-white p-8 text-center col-span-full">
                  <p className="text-gray-400 text-sm">ยังไม่มีรายการ</p>
                </Card>
              ) : (
                payments.map(p => (
                  <PaymentCard key={p._id} payment={p} onView={() => setViewingPayment(p)} />
                ))
              )}
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Payment Detail Modal */}
      <Modal
        isOpen={!!viewingPayment}
        onClose={() => setViewingPayment(null)}
        size="lg"
        scrollBehavior="inside"
        backdrop="opaque"
        classNames={{
          base: 'bg-white rounded-3xl',
          header: 'border-b border-gray-100 px-6 py-4',
          body: 'p-6',
          footer: 'border-t border-gray-100 px-6 py-4 bg-gray-50/50',
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-base font-bold text-gray-900">รายละเอียดการชำระเงิน</h3>
          </ModalHeader>
          <ModalBody>
            {viewingPayment && (
              <div className="space-y-5">
                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-2xl p-3">
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FiUser size={11} />ผู้ชำระเงิน</p>
                    <p className="font-semibold text-sm text-gray-900">{viewingPayment.userName}</p>
                    <p className="text-xs text-gray-500">{viewingPayment.userEmail}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-3">
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FiCreditCard size={11} />ค่าย</p>
                    <p className="font-semibold text-sm text-gray-900 line-clamp-2">{viewingPayment.campName}</p>
                  </div>
                  <div className="bg-[#F2B33D]/10 rounded-2xl p-3">
                    <p className="text-xs text-gray-400 mb-1">ยอดชำระ</p>
                    <p className="text-2xl font-black text-[#F2B33D]">฿{viewingPayment.finalAmount.toLocaleString()}</p>
                    {viewingPayment.platformFee !== undefined && viewingPayment.platformFee > 0 && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        หัก fee {viewingPayment.platformFeePercent}% = ฿{viewingPayment.platformFee.toLocaleString()}
                      </p>
                    )}
                  </div>
                  {viewingPayment.organizerNet !== undefined && viewingPayment.platformFee !== undefined && viewingPayment.platformFee > 0 && (
                    <div className="bg-green-50 rounded-2xl p-3">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FiTrendingUp size={11} />คุณได้รับ</p>
                      <p className="text-2xl font-black text-green-600">฿{viewingPayment.organizerNet.toLocaleString()}</p>
                      {viewingPayment.payoutStatus === 'paid_out' ? (
                        <p className="text-[10px] text-green-500 mt-1 font-medium">โอนแล้ว ✓</p>
                      ) : (
                        <p className="text-[10px] text-orange-500 mt-1">รอโอน</p>
                      )}
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-2xl p-3">
                    <p className="text-xs text-gray-400 mb-1">ชำระเมื่อ</p>
                    <p className="text-sm font-medium text-gray-700">
                      {viewingPayment.verifiedAt
                        ? new Date(viewingPayment.verifiedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
                        : viewingPayment.slipUploadedAt
                        ? new Date(viewingPayment.slipUploadedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
                        : '—'}
                    </p>
                  </div>
                </div>

                {/* RDCW verification detail */}
                {viewingPayment.slipVerified && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <FiZap size={14} className="text-green-600" />
                      <p className="text-sm font-semibold text-green-700">ยืนยันโดยระบบ RDCW</p>
                    </div>
                    {viewingPayment.slipSenderName && (
                      <p className="text-sm text-gray-600">ชื่อผู้โอน: <span className="font-medium">{viewingPayment.slipSenderName}</span></p>
                    )}
                    {viewingPayment.slipReceivedAmount !== undefined && (
                      <p className="text-sm text-gray-600">จำนวนเงินในสลิป: <span className="font-medium">฿{viewingPayment.slipReceivedAmount.toLocaleString()}</span></p>
                    )}
                  </div>
                )}

                {/* Slip Image */}
                {viewingPayment.slipUrl && (
                  <div className="rounded-2xl overflow-hidden border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 px-4 py-3 border-b border-gray-100 bg-gray-50">
                      สลิปการโอนเงิน
                    </p>
                    <div className="relative w-full" style={{ height: 420 }}>
                      <Image
                        src={viewingPayment.slipUrl}
                        alt="Payment Slip"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" className="text-gray-500" onPress={() => setViewingPayment(null)}>
              ปิด
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

function PaymentCard({ payment, onView }: { payment: Payment; onView: () => void }) {
  const isPaid = payment.status === 'completed' || payment.slipVerified;

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        {/* Slip thumbnail */}
        <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100 relative">
          {payment.slipUrl ? (
            <Image src={payment.slipUrl} alt="slip" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiCreditCard className="text-gray-300" size={20} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="font-semibold text-sm text-gray-900 truncate">{payment.userName}</p>
            {isPaid ? (
              <Chip size="sm" color="success" variant="flat" className="shrink-0 h-5 text-[10px]">
                ชำระแล้ว
              </Chip>
            ) : (
              <Chip size="sm" color="default" variant="flat" className="shrink-0 h-5 text-[10px] text-gray-500">
                รอชำระ
              </Chip>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{payment.campName}</p>
          {payment.organizerNet !== undefined && payment.platformFee !== undefined && payment.platformFee > 0 ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm font-bold text-green-600">฿{payment.organizerNet.toLocaleString()}</p>
              <span className="text-[10px] text-gray-400">(จาก ฿{payment.finalAmount.toLocaleString()})</span>
              {payment.payoutStatus === 'paid_out' ? (
                <span className="text-[10px] text-green-500 font-medium">โอนแล้ว</span>
              ) : (
                <span className="text-[10px] text-orange-400">รอโอน</span>
              )}
            </div>
          ) : (
            <p className="text-sm font-bold text-[#F2B33D] mt-0.5">฿{payment.finalAmount.toLocaleString()}</p>
          )}
        </div>

        {/* View button */}
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          className="bg-gray-100 text-gray-600 shrink-0"
          onPress={onView}
        >
          <FiEye size={15} />
        </Button>
      </div>
    </Card>
  );
}
