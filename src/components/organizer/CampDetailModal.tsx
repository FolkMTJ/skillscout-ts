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
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [viewingSlip, setViewingSlip] = useState<Payment | null>(null);
  const { isOpen: isSlipModalOpen, onOpen: onSlipModalOpen, onClose: onSlipModalClose } = useDisclosure();

  useEffect(() => {
    if (isOpen && camp._id) {
      fetchPayments();
    }
  }, [isOpen, camp._id]);

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);
      const response = await fetch(`/api/payments/camp/${camp._id}`);
      const data = await response.json();
      
      if (data.payments) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoadingPayments(false);
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

      toast.success('✅ อนุมัติสลิปสำเร็จ!');
      onSlipModalClose();
      fetchPayments();
      if (onRefresh) onRefresh();
    } catch (error) {
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

      toast.success('✅ ปฏิเสธสลิปสำเร็จ');
      onSlipModalClose();
      fetchPayments();
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการปฏิเสธ');
    }
  };

  const enrollmentPercentage = ((camp.enrolled || 0) / (camp.capacity || camp.participantCount)) * 100;
  const pendingRegs = registrations.filter(r => r.status === RegistrationStatus.PENDING);
  const approvedRegs = registrations.filter(r => r.status === RegistrationStatus.APPROVED);
  const rejectedRegs = registrations.filter(r => r.status === RegistrationStatus.REJECTED);
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
        classNames={{ base: "max-h-[90vh]" }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{camp.name}</h2>
                    <div className="flex flex-wrap gap-2">
                      <Chip size="sm" startContent={<FiMapPin />} variant="flat" color="primary">
                        {camp.location}
                      </Chip>
                      <Chip size="sm" startContent={<FiCalendar />} variant="flat" color="secondary">
                        {camp.date}
                      </Chip>
                      <Chip size="sm" startContent={<FiUsers />} variant="flat" color="success">
                        {camp.enrolled || 0}/{camp.capacity || camp.participantCount}
                      </Chip>
                      <Chip size="sm" startContent={<FiUserCheck />} variant="flat" color="secondary">
                        เช็คอิน: {attendedRegs.length}
                      </Chip>
                      {camp.price && (
                        <Chip size="sm" startContent={<FiDollarSign />} variant="flat">
                          {camp.price}
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody>
                <Tabs
                  selectedKey={activeTab}
                  onSelectionChange={(key) => setActiveTab(key as string)}
                  variant="underlined"
                >
                  {/* Tab: ภาพรวม */}
                  <Tab key="overview" title="ภาพรวม">
                    <div className="space-y-6 py-4">
                      {camp.image && (
                        <div className="relative rounded-lg overflow-hidden h-64">
                          <Image 
                            src={camp.image} 
                            alt={camp.name} 
                            fill
                            className="object-cover"
                            sizes="(max-width: 1200px) 100vw, 1200px"
                          />
                        </div>
                      )}

                      <Card className="p-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-semibold">ความคืบหน้าการรับสมัคร</span>
                          <span className="text-sm text-gray-600">{enrollmentPercentage.toFixed(0)}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              enrollmentPercentage >= 90 ? 'bg-red-500' :
                              enrollmentPercentage >= 70 ? 'bg-orange-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${enrollmentPercentage}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-blue-500">{camp.enrolled || 0}</p>
                            <p className="text-xs text-gray-600">ผู้สมัครทั้งหมด</p>
                          </div>
                          <div className="text-center">
                            <p className="text-3xl font-bold text-purple-500">{attendedRegs.length}</p>
                            <p className="text-xs text-gray-600">เช็คอินแล้ว</p>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">อัตราการเข้าร่วมจริง</p>
                            <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{attendanceRate}%</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {attendedRegs.length} / {approvedRegs.length} คน
                            </p>
                          </div>
                          <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <FiUserCheck className="text-3xl text-purple-600" />
                          </div>
                        </div>
                      </Card>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">รายละเอียดค่าย</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{camp.description}</p>
                      </div>
                    </div>
                  </Tab>

                  {/* Tab: ผู้สมัคร - แยกเป็น Sub-tabs */}
                  <Tab key="registrations" title={`ผู้สมัคร (${registrations.length})`}>
                    <Tabs variant="bordered" className="mt-4">
                      <Tab
                        key="verified"
                        title={
                          <div className="flex items-center gap-2">
                            <FiCheckCircle />
                            <span>ตรวจสอบแล้ว ({verifiedPayments.length})</span>
                          </div>
                        }
                      >
                        <div className="py-4">
                          {verifiedPayments.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                              <FiCheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                              <p>ยังไม่มีผู้ที่ตรวจสอบสลิปแล้ว</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {verifiedPayments.map((payment) => (
                                <Card key={payment._id} className="p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="font-bold text-gray-800">{payment.userName}</h4>
                                      <p className="text-sm text-gray-600">{payment.userEmail}</p>
                                    </div>
                                    <Chip size="sm" color="success" variant="flat">
                                      <FiCheck className="mr-1" /> อนุมัติแล้ว
                                    </Chip>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">ยอดเงิน:</span>
                                      <span className="font-semibold">฿{payment.finalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">ยืนยันเมื่อ:</span>
                                      <span className="text-xs">
                                        {payment.slipUploadedAt && new Date(payment.slipUploadedAt).toLocaleDateString('th-TH')}
                                      </span>
                                    </div>
                                  </div>
                                  {payment.slipUrl && (
                                    <Button
                                      size="sm"
                                      variant="flat"
                                      color="primary"
                                      className="mt-3 w-full"
                                      startContent={<FiEye />}
                                      onPress={() => handleViewSlip(payment)}
                                    >
                                      ดูสลิป
                                    </Button>
                                  )}
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </Tab>

                      <Tab
                        key="pending"
                        title={
                          <div className="flex items-center gap-2">
                            <FiAlertCircle />
                            <span>รอตรวจสอบ ({pendingPayments.length})</span>
                          </div>
                        }
                      >
                        <div className="py-4">
                          {pendingPayments.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                              <FiCheckCircle className="w-16 h-16 mx-auto mb-4 text-green-300" />
                              <p>ไม่มีสลิปรอตรวจสอบ</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {pendingPayments.map((payment) => (
                                <Card key={payment._id} className="p-4 border-2 border-orange-200">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="font-bold text-gray-800">{payment.userName}</h4>
                                      <p className="text-sm text-gray-600">{payment.userEmail}</p>
                                    </div>
                                    <Chip size="sm" color="warning" variant="flat">
                                      <FiClock className="mr-1" /> รอตรวจสอบ
                                    </Chip>
                                  </div>
                                  <div className="space-y-2 text-sm mb-3">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">ยอดเงิน:</span>
                                      <span className="font-bold text-blue-600">฿{payment.finalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">อัปโหลดเมื่อ:</span>
                                      <span className="text-xs">
                                        {payment.slipUploadedAt && new Date(payment.slipUploadedAt).toLocaleDateString('th-TH')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Button
                                      size="sm"
                                      variant="flat"
                                      color="primary"
                                      className="w-full"
                                      startContent={<FiEye />}
                                      onPress={() => handleViewSlip(payment)}
                                    >
                                      ดูและตรวจสอบสลิป
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </Tab>

                      <Tab key="all" title={`ทั้งหมด (${registrations.length})`}>
                        <div className="py-4">
                          <Table aria-label="รายชื่อผู้สมัคร">
                            <TableHeader>
                              <TableColumn>ชื่อ</TableColumn>
                              <TableColumn>อีเมล</TableColumn>
                              <TableColumn>วันที่สมัคร</TableColumn>
                              <TableColumn>สถานะ</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="ยังไม่มีผู้สมัคร">
                              {registrations.map((reg) => (
                                <TableRow key={reg._id}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {reg.status === 'attended' && (
                                        <FiUserCheck className="text-purple-500" />
                                      )}
                                      {reg.userName}
                                    </div>
                                  </TableCell>
                                  <TableCell>{reg.userEmail}</TableCell>
                                  <TableCell>
                                    {new Date(reg.appliedAt).toLocaleDateString('th-TH')}
                                  </TableCell>
                                  <TableCell>
                                    <Chip size="sm" color={getStatusColor(reg.status as RegistrationStatus | 'attended')} variant="flat">
                                      {getStatusText(reg.status as RegistrationStatus | 'attended')}
                                    </Chip>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </Tab>
                    </Tabs>
                  </Tab>

                  {/* Tab: สถิติ */}
                  <Tab key="stats" title="สถิติ">
                    <div className="py-4 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-4 text-center">
                          <p className="text-3xl font-bold text-blue-500">{registrations.length}</p>
                          <p className="text-sm text-gray-600">ผู้สมัครทั้งหมด</p>
                        </Card>
                        <Card className="p-4 text-center">
                          <p className="text-3xl font-bold text-green-500">{approvedRegs.length}</p>
                          <p className="text-sm text-gray-600">อนุมัติแล้ว</p>
                        </Card>
                        <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-pink-50">
                          <p className="text-3xl font-bold text-purple-500">{attendedRegs.length}</p>
                          <p className="text-sm text-gray-600">เช็คอินแล้ว</p>
                        </Card>
                        <Card className="p-4 text-center border-2 border-orange-200">
                          <p className="text-3xl font-bold text-orange-500">{pendingPayments.length}</p>
                          <p className="text-sm text-gray-600">สลิปรอตรวจ</p>
                        </Card>
                      </div>

                      <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <FiUserCheck /> อัตราการเข้าร่วมจริง
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>เช็คอินแล้ว</span>
                            <span className="font-bold">{attendanceRate}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                              style={{ width: `${attendanceRate}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            {attendedRegs.length} คนเช็คอิน จาก {approvedRegs.length} คนที่อนุมัติ
                          </p>
                        </div>
                      </Card>

                      {camp.fee && parseInt(camp.fee.toString()) > 0 && (
                        <Card className="p-4">
                          <h3 className="font-semibold mb-3">รายได้โดยประมาณ</h3>
                          <p className="text-3xl font-bold text-green-600">
                            ฿{(verifiedPayments.length * parseInt(camp.fee.toString())).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            จากผู้ชำระเงินแล้ว {verifiedPayments.length} คน
                          </p>
                        </Card>
                      )}
                    </div>
                  </Tab>
                </Tabs>
              </ModalBody>

              <ModalFooter className="border-t">
                <Button color="default" variant="flat" onPress={onClose}>
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
    </>
  );
}
