// src/components/organizer/CampDetailModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  Tab,
  Card,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
} from '@heroui/react';
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiUserCheck,
  FiClock,
  FiCheck,
  FiX,
  FiEye,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { Camp, Registration, RegistrationStatus } from '@/types';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Payment {
  _id: string;
  registrationId: string;
  userEmail: string;
  userName: string;
  amount: number;
  finalAmount: number;
  slipUrl?: string;
  slipVerified?: boolean;
  requiresManualReview?: boolean;
  slipUploadedAt?: string;
  createdAt: string;
}

interface CampDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  camp: Camp;
  registrations: Registration[];
  onRefresh?: () => void;
}

export default function CampDetailModal({
  isOpen,
  onClose,
  camp,
  registrations,
  onRefresh,
}: CampDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [viewingSlip, setViewingSlip] = useState<Payment | null>(null);
  const [viewingRegistration, setViewingRegistration] = useState<Registration | null>(null);
  const { isOpen: isSlipModalOpen, onOpen: onSlipModalOpen, onClose: onSlipModalClose } = useDisclosure();
  const { isOpen: isRegModalOpen, onOpen: onRegModalOpen, onClose: onRegModalClose } = useDisclosure();

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const response = await fetch(`/api/payments/camp/${camp._id}`);
        const data = await response.json();

        if (data.payments) {
          setPayments(data.payments);
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
      }
    };

    if (isOpen && camp._id) {
      loadPayments();
    }
  }, [isOpen, camp._id]);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/payments/camp/${camp._id}`);
      const data = await response.json();

      if (data.payments) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  const handleViewSlip = (payment: Payment) => {
    setViewingSlip(payment);
    onSlipModalOpen();
  };

  const handleApproveSlip = async (paymentId: string) => {
    if (!confirm('ยืนยันการอนุมัติสลิปนี้หรือไม่?')) return;

    try {
      const response = await fetch(`/api/payments/${paymentId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to approve');

      toast.success('อนุมัติสลิปสำเร็จ!');
      onSlipModalClose();
      fetchPayments();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error approving slip:', err);
      toast.error('เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const handleRejectSlip = async (paymentId: string) => {
    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/payments/${paymentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to reject');

      toast.success('ปฏิเสธสลิปสำเร็จ');
      onSlipModalClose();
      fetchPayments();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error rejecting slip:', err);
      toast.error('เกิดข้อผิดพลาดในการปฏิเสธ');
    }
  };

  const enrollmentPercentage = ((camp.enrolled || 0) / (camp.capacity || camp.participantCount)) * 100;
  const approvedRegs = registrations.filter(r => r.status === RegistrationStatus.APPROVED);
  const attendedRegs = registrations.filter(r => r.status === 'attended');
  const attendanceRate = approvedRegs.length > 0 ? ((attendedRegs.length / approvedRegs.length) * 100).toFixed(1) : 0;

  // แยก payments ตามสถานะ
  const pendingPayments = payments.filter(p => p.requiresManualReview && !p.slipVerified && p.slipUrl);
  const verifiedPayments = payments.filter(p => p.slipVerified);

  const getStatusColor = (status: RegistrationStatus | 'attended') => {
    switch (status) {
      case RegistrationStatus.APPROVED: return 'success';
      case 'attended': return 'secondary';
      case RegistrationStatus.PENDING: return 'warning';
      case RegistrationStatus.REJECTED: return 'danger';
      default: return 'default';
    }
  };

  const getStatusText = (status: RegistrationStatus | 'attended') => {
    switch (status) {
      case RegistrationStatus.APPROVED: return 'อนุมัติแล้ว';
      case 'attended': return 'เช็คอินแล้ว';
      case RegistrationStatus.PENDING: return 'รอดำเนินการ';
      case RegistrationStatus.REJECTED: return 'ปฏิเสธ';
      case RegistrationStatus.CANCELLED: return 'ยกเลิก';
      default: return status;
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="5xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90vh]",
          body: "p-0 min-h-[520px]",
          header: "p-0 border-b-0",
          footer: "p-4 border-t border-gray-100",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              {/* ======= HEADER ======= */}
              <ModalHeader className="flex flex-col gap-0 p-0">
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-[#F2B33D] to-orange-400 rounded-t-xl" />
                <div className="px-6 pt-5 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-black text-gray-900 truncate">{camp.name}</h2>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full border border-orange-100">
                          <FiMapPin className="w-3 h-3" />{camp.location}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100">
                          <FiCalendar className="w-3 h-3" />{camp.date}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-600 px-2.5 py-1 rounded-full border border-green-100">
                          <FiUsers className="w-3 h-3" />{camp.enrolled || 0}/{camp.capacity || camp.participantCount} คน
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full border border-purple-100">
                          <FiUserCheck className="w-3 h-3" />เช็คอิน: {attendedRegs.length}
                        </span>
                        {camp.price && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                            <FiDollarSign className="w-3 h-3" />{camp.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </ModalHeader>

              {/* ======= BODY ======= */}
              <ModalBody>
                {/* Custom Tab Bar */}
                <div className="flex gap-1 px-6 pt-4 pb-0 border-b border-gray-100">
                  {[
                    { key: 'overview', label: 'ภาพรวม' },
                    { key: 'registrations', label: `ผู้สมัคร (${registrations.length})` },
                    { key: 'stats', label: 'สถิติ' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-all border-b-2 ${activeTab === tab.key
                        ? 'text-[#F2B33D] border-[#F2B33D] bg-orange-50/50'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="px-6 py-5 min-h-[480px]">
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      {camp.image && (
                        <div className="relative rounded-2xl overflow-hidden h-52">
                          <Image
                            src={camp.image}
                            alt={camp.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1200px) 100vw, 1200px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                      )}

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gradient-to-br from-[#F2B33D]/10 to-orange-50 border border-[#F2B33D]/20 rounded-2xl p-4 text-center">
                          <p className="text-3xl font-black text-[#F2B33D]">{camp.enrolled || 0}</p>
                          <p className="text-xs text-gray-500 mt-1">ผู้สมัครทั้งหมด</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4 text-center">
                          <p className="text-3xl font-black text-green-600">{attendedRegs.length}</p>
                          <p className="text-xs text-gray-500 mt-1">เช็คอินแล้ว</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 text-center">
                          <p className="text-3xl font-black text-blue-600">{attendanceRate}%</p>
                          <p className="text-xs text-gray-500 mt-1">อัตราเข้าร่วม</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-gray-700">ความคืบหน้าการรับสมัคร</span>
                          <span className="text-sm font-black" style={{ color: enrollmentPercentage >= 90 ? '#ef4444' : '#F2B33D' }}>
                            {enrollmentPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full transition-all"
                            style={{
                              width: `${enrollmentPercentage}%`,
                              background: enrollmentPercentage >= 90 ? '#ef4444' : 'linear-gradient(to right, #F2B33D, #f97316)'
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {camp.enrolled || 0} / {camp.capacity || camp.participantCount} เท่านั้นที่รับ
                        </p>
                      </div>

                      {/* Description */}
                      {camp.description && (
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                          <h3 className="font-bold text-gray-800 mb-2 text-sm">รายละเอียดค่าย</h3>
                          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{camp.description}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab: ผู้สมัคร */}
                  {activeTab === 'registrations' && (
                    <div className="space-y-4">
                      {/* Sub-tab counts */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-green-50 border border-green-100 rounded-2xl p-3 text-center">
                          <p className="text-2xl font-black text-green-600">{verifiedPayments.length}</p>
                          <p className="text-xs text-gray-500 mt-0.5">ตรวจสอบแล้ว</p>
                        </div>
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 text-center">
                          <p className="text-2xl font-black text-orange-500">{pendingPayments.length}</p>
                          <p className="text-xs text-gray-500 mt-0.5">รอตรวจสอบ</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 text-center">
                          <p className="text-2xl font-black text-gray-700">{registrations.length}</p>
                          <p className="text-xs text-gray-500 mt-0.5">ทั้งหมด</p>
                        </div>
                      </div>

                      {/* All registrations list */}
                      {registrations.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                          <FiUsers className="w-14 h-14 mx-auto mb-3 text-gray-200" />
                          <p className="font-medium">ยังไม่มีผู้สมัคร</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {registrations.map((reg) => (
                            <div key={reg._id} className="flex items-center justify-between bg-gray-50 hover:bg-orange-50/30 border border-gray-100 hover:border-[#F2B33D]/20 rounded-xl px-4 py-3 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#F2B33D]/10 flex items-center justify-center text-[#F2B33D] font-black text-sm">
                                  {reg.userName?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-800 text-sm">{reg.userName}</p>
                                  <p className="text-xs text-gray-500">{reg.userEmail}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Chip
                                  size="sm"
                                  color={getStatusColor(reg.status as RegistrationStatus | 'attended')}
                                  variant="flat"
                                  classNames={{ base: "font-medium text-xs" }}
                                >
                                  {getStatusText(reg.status as RegistrationStatus | 'attended')}
                                </Chip>
                                <Button
                                  size="sm"
                                  variant="flat"
                                  className="bg-white border border-gray-200 text-gray-600 hover:bg-[#F2B33D]/10 hover:border-[#F2B33D]/30"
                                  startContent={<FiEye className="w-3 h-3" />}
                                  onPress={() => { setViewingRegistration(reg); onRegModalOpen(); }}
                                >
                                  ดู
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pending slips */}
                      {pendingPayments.length > 0 && (
                        <div>
                          <h3 className="font-bold text-sm text-orange-600 mb-2 flex items-center gap-1">
                            <FiAlertCircle className="w-4 h-4" /> สลิปรอตรวจสอบ
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {pendingPayments.map((payment) => (
                              <div key={payment._id} className="border border-orange-200 bg-orange-50/30 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <p className="font-bold text-gray-800 text-sm">{payment.userName}</p>
                                    <p className="text-xs text-gray-500">฿{payment.finalAmount.toLocaleString()}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="bg-[#F2B33D] text-white font-bold"
                                    startContent={<FiEye className="w-3 h-3" />}
                                    onPress={() => handleViewSlip(payment)}
                                  >
                                    ตรวจสลิป
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab: สถิติ */}
                  {activeTab === 'stats' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-gradient-to-br from-[#F2B33D]/10 to-orange-50 border border-[#F2B33D]/20 rounded-2xl p-4 text-center">
                          <p className="text-3xl font-black text-[#F2B33D]">{registrations.length}</p>
                          <p className="text-xs text-gray-500 mt-1">ผู้สมัครทั้งหมด</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4 text-center">
                          <p className="text-3xl font-black text-green-600">{approvedRegs.length}</p>
                          <p className="text-xs text-gray-500 mt-1">อนุมัติแล้ว</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-4 text-center">
                          <p className="text-3xl font-black text-purple-600">{attendedRegs.length}</p>
                          <p className="text-xs text-gray-500 mt-1">เช็คอินแล้ว</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 text-center">
                          <p className="text-3xl font-black text-orange-500">{pendingPayments.length}</p>
                          <p className="text-xs text-gray-500 mt-1">สลิปรอตรวจ</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                          <FiUserCheck className="text-[#F2B33D]" /> อัตราการเข้าร่วมจริง
                        </h3>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">เช็คอินแล้ว</span>
                          <span className="font-black text-[#F2B33D]">{attendanceRate}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full transition-all"
                            style={{ width: `${attendanceRate}%`, background: 'linear-gradient(to right, #F2B33D, #f97316)' }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {attendedRegs.length} คนเช็คอิน จาก {approvedRegs.length} คนที่อนุมัติ
                        </p>
                      </div>

                      {camp.fee && parseInt(camp.fee.toString()) > 0 && (
                        <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                          <h3 className="font-bold text-gray-800 mb-2 text-sm">รายได้โดยประมาณ</h3>
                          <p className="text-4xl font-black text-green-600">
                            ฿{(verifiedPayments.length * parseInt(camp.fee.toString())).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            จากผู้ชำระเงินแล้ว {verifiedPayments.length} คน
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ModalBody>

              {/* ======= FOOTER ======= */}
              <ModalFooter>
                <Button
                  className="bg-[#F2B33D] text-white font-bold"
                  onPress={onClose}
                >
                  ปิด
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Slip View Modal */}
      <Modal
        isOpen={isSlipModalOpen}
        onClose={onSlipModalClose}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold">ตรวจสอบสลิปการชำระเงิน</h3>
          </ModalHeader>
          <ModalBody>
            {viewingSlip && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">ผู้ชำระเงิน</p>
                    <p className="font-semibold">{viewingSlip.userName}</p>
                    <p className="text-sm text-gray-600">{viewingSlip.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ยอดเงิน</p>
                    <p className="font-bold text-xl text-blue-600">
                      ฿{viewingSlip.finalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {viewingSlip.slipUrl && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-3">สลิปการโอนเงิน:</p>
                    <div className="relative w-full h-[500px]">
                      <Image
                        src={viewingSlip.slipUrl}
                        alt="Payment Slip"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">สถานะ:</p>
                  {viewingSlip.slipVerified ? (
                    <Chip color="success" variant="flat">
                      อนุมัติแล้ว
                    </Chip>
                  ) : (
                    <Chip color="warning" variant="flat">
                      รอตรวจสอบ
                    </Chip>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {viewingSlip && !viewingSlip.slipVerified && (
              <>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => handleRejectSlip(viewingSlip._id)}
                  startContent={<FiX />}
                >
                  ปฏิเสธ
                </Button>
                <Button
                  color="success"
                  onPress={() => handleApproveSlip(viewingSlip._id)}
                  startContent={<FiCheck />}
                >
                  อนุมัติ
                </Button>
              </>
            )}
            <Button
              variant="light"
              onPress={onSlipModalClose}
            >
              ปิด
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Registration Detail Modal */}
      <Modal
        isOpen={isRegModalOpen}
        onClose={onRegModalClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="border-b">
            <h3 className="text-xl font-bold">ข้อมูลผู้สมัคร</h3>
          </ModalHeader>
          <ModalBody className="py-6">
            {viewingRegistration && (
              <div className="space-y-6">
                {/* Header Card */}
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                        {viewingRegistration.userName}
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <FiUsers className="w-4 h-4" />
                          {viewingRegistration.userEmail}
                        </p>
                        {viewingRegistration.userPhone && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <FiClock className="w-4 h-4" />
                            {viewingRegistration.userPhone}
                          </p>
                        )}
                      </div>
                    </div>
                    <Chip
                      size="lg"
                      color={getStatusColor(viewingRegistration.status as RegistrationStatus | 'attended')}
                      variant="shadow"
                      classNames={{
                        base: "font-semibold",
                      }}
                    >
                      {getStatusText(viewingRegistration.status as RegistrationStatus | 'attended')}
                    </Chip>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCalendar className="w-4 h-4" />
                      <span>สมัครเมื่อ:</span>
                      <span className="font-medium">
                        {new Date(viewingRegistration.appliedAt).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Answers Section */}
                {viewingRegistration.answers && viewingRegistration.answers.length > 0 && (
                  <div className="space-y-4">
                    <h5 className="font-semibold text-lg flex items-center gap-2">
                      <FiCheckCircle className="text-blue-500" />
                      ข้อมูลเพิ่มเติม
                    </h5>
                    <div className="space-y-3">
                      {viewingRegistration.answers.map((ans, idx) => (
                        <Card key={idx} className="p-4 hover:shadow-lg transition-shadow">
                          <p className="text-sm font-semibold text-blue-600 mb-2">
                            {ans.question}
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">
                            {ans.answer || '-'}
                          </p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                {viewingRegistration.notes && (
                  <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                      หมายเหตุ:
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">{viewingRegistration.notes}</p>
                  </Card>
                )}

                {/* Timeline */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-lg flex items-center gap-2">
                    <FiClock className="text-purple-500" />
                    ประวัติ
                  </h5>
                  <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">สมัครเข้าค่าย</p>
                        <p className="text-xs text-gray-500">
                          {new Date(viewingRegistration.appliedAt).toLocaleString('th-TH')}
                        </p>
                      </div>
                    </div>
                    {viewingRegistration.reviewedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">ตรวจสอบแล้ว</p>
                          <p className="text-xs text-gray-500">
                            {new Date(viewingRegistration.reviewedAt).toLocaleString('th-TH')}
                          </p>
                          {viewingRegistration.reviewedBy && (
                            <p className="text-xs text-gray-400">
                              โดย: {viewingRegistration.reviewedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {viewingRegistration.status === 'attended' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 animate-pulse" />
                        <div>
                          <p className="text-sm font-medium text-purple-600">เช็คอินแล้ว</p>
                          <p className="text-xs text-gray-500">เข้าร่วมค่ายเรียบร้อย</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="border-t">
            <Button
              variant="light"
              onPress={onRegModalClose}
            >
              ปิด
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
