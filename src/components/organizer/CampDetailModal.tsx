// src/components/organizer/CampDetailModal.tsx
'use client';

import { useState } from 'react';
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
} from '@heroui/react';
import {
  FiX,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiTag,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { Camp, Registration, RegistrationStatus } from '@/types/camp';

interface CampDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  camp: Camp;
  registrations: Registration[];
  onApprove?: (regId: string) => void;
  onReject?: (regId: string) => void;
}

export default function CampDetailModal({
  isOpen,
  onClose,
  camp,
  registrations,
  onApprove,
  onReject,
}: CampDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const enrollmentPercentage = ((camp.enrolled || 0) / (camp.capacity || camp.participantCount)) * 100;
  const pendingRegs = registrations.filter(r => r.status === RegistrationStatus.PENDING);
  const approvedRegs = registrations.filter(r => r.status === RegistrationStatus.APPROVED);
  const rejectedRegs = registrations.filter(r => r.status === RegistrationStatus.REJECTED);

  const getStatusColor = (status: RegistrationStatus) => {
    switch (status) {
      case RegistrationStatus.APPROVED: return 'success';
      case RegistrationStatus.PENDING: return 'warning';
      case RegistrationStatus.REJECTED: return 'danger';
      default: return 'default';
    }
  };

  const getStatusText = (status: RegistrationStatus) => {
    switch (status) {
      case RegistrationStatus.APPROVED: return 'อนุมัติแล้ว';
      case RegistrationStatus.PENDING: return 'รอดำเนินการ';
      case RegistrationStatus.REJECTED: return 'ปฏิเสธ';
      case RegistrationStatus.CANCELLED: return 'ยกเลิก';
      default: return status;
    }
  };

  return (
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
                      <div className="rounded-lg overflow-hidden">
                        <img src={camp.image} alt={camp.name} className="w-full h-64 object-cover" />
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
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-500">{pendingRegs.length}</p>
                          <p className="text-xs text-gray-600">รอดำเนินการ</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-500">{approvedRegs.length}</p>
                          <p className="text-xs text-gray-600">อนุมัติแล้ว</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-500">{rejectedRegs.length}</p>
                          <p className="text-xs text-gray-600">ปฏิเสธ</p>
                        </div>
                      </div>
                    </Card>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">รายละเอียดค่าย</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{camp.description}</p>
                    </div>

                    {camp.tags && camp.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <FiTag /> Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {camp.tags.map((tag) => (
                            <Chip key={tag} color="primary" variant="flat">{tag}</Chip>
                          ))}
                        </div>
                      </div>
                    )}

                    {camp.qualifications && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">คุณสมบัติผู้สมัคร</h3>
                        <p className="text-gray-700">{camp.qualifications.level}</p>
                        {camp.qualifications.fields && camp.qualifications.fields.length > 0 && (
                          <ul className="list-disc list-inside mt-2 text-gray-600">
                            {camp.qualifications.fields.map((field, i) => (
                              <li key={i}>{field}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {camp.additionalInfo && camp.additionalInfo.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">ข้อมูลเพิ่มเติม</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {camp.additionalInfo.map((info, i) => (
                            <li key={i}>{info}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {camp.galleryImages && camp.galleryImages.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">รูปภาพเพิ่มเติม</h3>
                        <div className="grid grid-cols-3 gap-3">
                          {camp.galleryImages.map((img, i) => (
                            <img key={i} src={img} alt={`Gallery ${i}`} className="w-full h-32 object-cover rounded-lg" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Tab>

                {/* Tab: รายชื่อผู้สมัคร */}
                <Tab key="registrations" title={`ผู้สมัคร (${registrations.length})`}>
                  <div className="py-4">
                    <Table aria-label="รายชื่อผู้สมัคร">
                      <TableHeader>
                        <TableColumn>ชื่อ</TableColumn>
                        <TableColumn>อีเมล</TableColumn>
                        <TableColumn>วันที่สมัคร</TableColumn>
                        <TableColumn>สถานะ</TableColumn>
                        <TableColumn>จัดการ</TableColumn>
                      </TableHeader>
                      <TableBody emptyContent="ยังไม่มีผู้สมัคร">
                        {registrations.map((reg) => (
                          <TableRow key={reg._id}>
                            <TableCell>{reg.userName}</TableCell>
                            <TableCell>{reg.userEmail}</TableCell>
                            <TableCell>
                              {new Date(reg.appliedAt).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell>
                              <Chip size="sm" color={getStatusColor(reg.status)} variant="flat">
                                {getStatusText(reg.status)}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              {reg.status === RegistrationStatus.PENDING && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    color="success"
                                    variant="flat"
                                    startContent={<FiCheckCircle />}
                                    onPress={() => onApprove?.(reg._id)}
                                  >
                                    อนุมัติ
                                  </Button>
                                  <Button
                                    size="sm"
                                    color="danger"
                                    variant="flat"
                                    startContent={<FiXCircle />}
                                    onPress={() => onReject?.(reg._id)}
                                  >
                                    ปฏิเสธ
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
                        <p className="text-3xl font-bold text-orange-500">{pendingRegs.length}</p>
                        <p className="text-sm text-gray-600">รอดำเนินการ</p>
                      </Card>
                      <Card className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-500">{approvedRegs.length}</p>
                        <p className="text-sm text-gray-600">อนุมัติแล้ว</p>
                      </Card>
                      <Card className="p-4 text-center">
                        <p className="text-3xl font-bold text-red-500">{rejectedRegs.length}</p>
                        <p className="text-sm text-gray-600">ปฏิเสธแล้ว</p>
                      </Card>
                    </div>

                    <Card className="p-4">
                      <h3 className="font-semibold mb-3">อัตราการอนุมัติ</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>อนุมัติ</span>
                          <span>{approvedRegs.length > 0 ? ((approvedRegs.length / registrations.length) * 100).toFixed(1) : 0}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(approvedRegs.length / registrations.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </Card>

                    {camp.fee && parseInt(camp.fee.toString()) > 0 && (
                      <Card className="p-4">
                        <h3 className="font-semibold mb-3">รายได้โดยประมาณ</h3>
                        <p className="text-3xl font-bold text-green-600">
                          ฿{(approvedRegs.length * parseInt(camp.fee.toString())).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          จากผู้เข้าร่วม {approvedRegs.length} คน × {camp.price}
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
  );
}
