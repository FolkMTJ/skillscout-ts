'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Tabs, Tab } from '@heroui/react';
import { FiCheck, FiX, FiEye, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
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
  requiresManualReview?: boolean;
  slipUploadedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPayments();
    }
  }, [status]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments/organizer');
      const data = await response.json();
      
      if (data.payments) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: string) => {
    if (!confirm('ยืนยันการอนุมัติสลิปนี้หรือไม่?')) return;

    try {
      const response = await fetch(`/api/payments/${paymentId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to approve');

      toast.success('✅ อนุมัติสลิปสำเร็จ!');
      setViewingPayment(null);
      fetchPayments();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const handleReject = async (paymentId: string) => {
    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/payments/${paymentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to reject');

      toast.success('✅ ปฏิเสธสลิปสำเร็จ');
      setViewingPayment(null);
      fetchPayments();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการปฏิเสธ');
    }
  };

  const pendingPayments = payments.filter(p => 
    p.requiresManualReview && !p.slipVerified && p.slipUrl
  );
  
  const approvedPayments = payments.filter(p => p.slipVerified);
  
  const allPayments = payments;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h2>
          <Button color="primary" href="/login">เข้าสู่ระบบ</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            💳 ตรวจสอบสลิปการชำระเงิน
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            จัดการและอนุมัติสลิปการชำระเงินของผู้สมัคร
          </p>
        </div>

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          className="mb-6"
        >
          <Tab
            key="pending"
            title={
              <div className="flex items-center gap-2">
                <FiClock />
                <span>รอตรวจสอบ ({pendingPayments.length})</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {pendingPayments.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <FiCheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                  <p className="text-gray-500">ไม่มีสลิปรอตรวจสอบ</p>
                </div>
              ) : (
                pendingPayments.map((payment) => (
                  <PaymentCard
                    key={payment._id}
                    payment={payment}
                    onView={() => setViewingPayment(payment)}
                  />
                ))
              )}
            </div>
          </Tab>

          <Tab
            key="approved"
            title={
              <div className="flex items-center gap-2">
                <FiCheckCircle />
                <span>อนุมัติแล้ว ({approvedPayments.length})</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {approvedPayments.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">ยังไม่มีสลิปที่อนุมัติ</p>
                </div>
              ) : (
                approvedPayments.map((payment) => (
                  <PaymentCard
                    key={payment._id}
                    payment={payment}
                    onView={() => setViewingPayment(payment)}
                  />
                ))
              )}
            </div>
          </Tab>

          <Tab
            key="all"
            title={
              <div className="flex items-center gap-2">
                <span>ทั้งหมด ({allPayments.length})</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {allPayments.map((payment) => (
                <PaymentCard
                  key={payment._id}
                  payment={payment}
                  onView={() => setViewingPayment(payment)}
                />
              ))}
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Payment Detail Modal */}
      <Modal
        isOpen={!!viewingPayment}
        onClose={() => setViewingPayment(null)}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold">ตรวจสอบสลิปการชำระเงิน</h3>
          </ModalHeader>
          <ModalBody>
            {viewingPayment && (
              <div className="space-y-6">
                {/* Payment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">ผู้ชำระเงิน</p>
                    <p className="font-semibold">{viewingPayment.userName}</p>
                    <p className="text-sm text-gray-600">{viewingPayment.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ค่าย</p>
                    <p className="font-semibold">{viewingPayment.campName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ยอดเงิน</p>
                    <p className="font-bold text-xl text-blue-600">
                      ฿{viewingPayment.finalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">อัปโหลดเมื่อ</p>
                    <p className="font-medium">
                      {viewingPayment.slipUploadedAt 
                        ? new Date(viewingPayment.slipUploadedAt).toLocaleString('th-TH')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Slip Image */}
                {viewingPayment.slipUrl && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-3">สลิปการโอนเงิน:</p>
                    <div className="relative w-full h-[500px]">
                      <Image
                        src={viewingPayment.slipUrl}
                        alt="Payment Slip"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">สถานะ:</p>
                  {viewingPayment.slipVerified ? (
                    <Chip color="success" variant="flat">
                      ✅ อนุมัติแล้ว
                    </Chip>
                  ) : (
                    <Chip color="warning" variant="flat">
                      ⏳ รอตรวจสอบ
                    </Chip>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {viewingPayment && !viewingPayment.slipVerified && (
              <>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => handleReject(viewingPayment._id)}
                  startContent={<FiX />}
                >
                  ปฏิเสธ
                </Button>
                <Button
                  color="success"
                  onPress={() => handleApprove(viewingPayment._id)}
                  startContent={<FiCheck />}
                >
                  อนุมัติ
                </Button>
              </>
            )}
            <Button
              variant="light"
              onPress={() => setViewingPayment(null)}
            >
              ปิด
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

// Payment Card Component
function PaymentCard({ 
  payment, 
  onView 
}: { 
  payment: Payment; 
  onView: () => void;
}) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-800">{payment.userName}</h3>
            <p className="text-sm text-gray-600">{payment.userEmail}</p>
          </div>
          {payment.slipVerified ? (
            <Chip size="sm" color="success" variant="flat">
              อนุมัติแล้ว
            </Chip>
          ) : (
            <Chip size="sm" color="warning" variant="flat">
              รอตรวจสอบ
            </Chip>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500">ค่าย</p>
          <p className="text-sm font-medium">{payment.campName}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">ยอดเงิน</p>
            <p className="text-lg font-bold text-blue-600">
              ฿{payment.finalAmount.toLocaleString()}
            </p>
          </div>
          {payment.slipUrl && (
            <div className="relative w-16 h-16 rounded border">
              <Image
                src={payment.slipUrl}
                alt="Slip preview"
                fill
                className="object-cover rounded"
              />
            </div>
          )}
        </div>

        <Button
          size="sm"
          color="primary"
          variant="flat"
          className="w-full"
          startContent={<FiEye />}
          onPress={onView}
        >
          ดูรายละเอียด
        </Button>
      </div>
    </Card>
  );
}
