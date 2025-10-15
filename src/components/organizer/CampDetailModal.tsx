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
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiTag,
  FiUserCheck,
  FiClock,
} from 'react-icons/fi';
import { Camp, Registration, RegistrationStatus } from '@/types/camp';
import Image from 'next/image';

interface CampDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  camp: Camp;
  registrations: Registration[];
  // ลบ onApprove และ onReject - ไม่ใช้แล้ว
}

export default function CampDetailModal({
  isOpen,
  onClose,
  camp,
  registrations,
}: CampDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const enrollmentPercentage = ((camp.enrolled || 0) / (camp.capacity || camp.participantCount)) * 100;
  const pendingRegs = registrations.filter(r => r.status === RegistrationStatus.PENDING);
  const approvedRegs = registrations.filter(r => r.status === RegistrationStatus.APPROVED);
  const rejectedRegs = registrations.filter(r => r.status === RegistrationStatus.REJECTED);
  const attendedRegs = registrations.filter(r => r.status === 'attended'); // เช็คอินแล้ว
  const attendanceRate = approvedRegs.length > 0 ? ((attendedRegs.length / approvedRegs.length) * 100).toFixed(1) : 0;

  const getStatusColor = (status: RegistrationStatus | 'attended') => {
    switch (status) {
      case RegistrationStatus.APPROVED: return 'success';
      case 'attended': return 'secondary'; // สีม่วงสำหรับเช็คอินแล้ว
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
                      <div className="rounded-lg overflow-hidden">
                        <Image src={camp.image} alt={camp.name} className="w-full h-64 object-cover" />
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
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-500">{pendingRegs.length}</p>
                          <p className="text-xs text-gray-600">รอดำเนินการ</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-500">{approvedRegs.length}</p>
                          <p className="text-xs text-gray-600">อนุมัติแล้ว</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-500">{attendedRegs.length}</p>
                          <p className="text-xs text-gray-600">เช็คอินแล้ว</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-500">{rejectedRegs.length}</p>
                          <p className="text-xs text-gray-600">ปฏิเสธ</p>
                        </div>
                      </div>
                    </Card>

                    {/* Card: อัตราการเข้าร่วม */}
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
                            <Image key={i} src={img} alt={`Gallery ${i}`} className="w-full h-32 object-cover rounded-lg" />
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
                        <TableColumn>เช็คอิน</TableColumn>
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
                              {new Date(reg.appliedAt).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell>
                              <Chip size="sm" color={getStatusColor(reg.status as any)} variant="flat">
                                {getStatusText(reg.status as any)}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              {reg.status === 'attended' ? (
                                <div className="text-xs text-gray-500">
                                  <FiClock className="inline mr-1" />
                                  {new Date(reg.updatedAt).toLocaleString('th-TH', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">ยังไม่เช็คอิน</span>
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
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                      <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-pink-50">
                        <p className="text-3xl font-bold text-purple-500">{attendedRegs.length}</p>
                        <p className="text-sm text-gray-600">เช็คอินแล้ว</p>
                      </Card>
                      <Card className="p-4 text-center">
                        <p className="text-3xl font-bold text-red-500">{rejectedRegs.length}</p>
                        <p className="text-sm text-gray-600">ปฏิเสธแล้ว</p>
                      </Card>
                    </div>

                    {/* อัตราการเข้าร่วมจริง */}
                    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <FiUserCheck /> อัตราการเข้าร่วมจริง (Check-in Rate)
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
                        <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <FiUserCheck className="inline mr-1 text-purple-500" />
                            <strong>มีผู้เช็คอินแล้ว {attendedRegs.length} คน</strong>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            (เงินจะถูกโอนหลังจากผู้เข้าร่วมยืนยันหรือครบ 15 วัน)
                          </p>
                        </div>
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
