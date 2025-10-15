"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Image,
} from '@heroui/react';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiUsers, 
  FiCalendar, 
  FiAlertCircle,
  FiEye,
  FiShield
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [camps, setCamps] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamp, setSelectedCamp] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        router.push('/');
      } else {
        fetchData();
      }
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all camps (including pending)
      const campsRes = await fetch('/api/camps?includeAll=true');
      const campsData = await campsRes.json();
      setCamps(campsData);

      // Fetch all users
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCamp = async (campId: string) => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/camps/${campId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          adminId: session?.user?.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to approve');

      toast.success('อนุมัติค่ายสำเร็จ!');
      fetchData();
      setIsViewModalOpen(false);
    } catch {
      toast.error('ไม่สามารถอนุมัติได้');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectCamp = async () => {
    if (!selectedCamp || !rejectReason.trim()) {
      toast.error('กรุณาระบุเหตุผล');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/camps/${selectedCamp._id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          adminId: session?.user?.id,
          reason: rejectReason,
        }),
      });

      if (!response.ok) throw new Error('Failed to reject');

      toast.success('ปฏิเสธค่ายสำเร็จ');
      fetchData();
      setIsRejectModalOpen(false);
      setIsViewModalOpen(false);
      setRejectReason('');
    } catch {
      toast.error('ไม่สามารถปฏิเสธได้');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteCamp = async (campId: string) => {
    if (!confirm('⚠️ คุณต้องการลบค่ายนี้หรือไม่?')) return;

    try {
      const response = await fetch(`/api/camps/${campId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('ลบค่ายสำเร็จ');
      fetchData();
    } catch {
      toast.error('ไม่สามารถลบได้');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    if (!confirm(`เปลี่ยนสิทธิ์เป็น ${newRole}?`)) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update');

      toast.success('อัปเดตสิทธิ์สำเร็จ');
      fetchData();
    } catch {
      toast.error('ไม่สามารถอัปเดตได้');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const pendingCamps = camps.filter(c => c.status === 'pending');
  // const activeCamps = camps.filter(c => c.status === 'active');
  // const rejectedCamps = camps.filter(c => c.status === 'rejected');
  // const adminUsers = users.filter(u => u.role === 'admin');
  const organizerUsers = users.filter(u => u.role === 'organizer');
  // const regularUsers = users.filter(u => u.role === 'user');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'เปิดรับสมัคร';
      case 'pending': return 'รอตรวจสอบ';
      case 'rejected': return 'ปฏิเสธ';
      case 'closed': return 'ปิดรับสมัคร';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiShield className="text-4xl text-orange-500" />
            <h1 className="text-4xl font-black text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">จัดการค่าย ผู้ใช้ และระบบทั้งหมด</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-500 to-amber-500">
            <CardBody className="text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">รออนุมัติ</p>
                  <p className="text-3xl font-black">{pendingCamps.length}</p>
                </div>
                <FiAlertCircle className="text-4xl opacity-50" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500">
            <CardBody className="text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">ค่ายทั้งหมด</p>
                  <p className="text-3xl font-black">{camps.length}</p>
                </div>
                <FiCalendar className="text-4xl opacity-50" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-500">
            <CardBody className="text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">ผู้ใช้ทั้งหมด</p>
                  <p className="text-3xl font-black">{users.length}</p>
                </div>
                <FiUsers className="text-4xl opacity-50" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-500">
            <CardBody className="text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Organizer</p>
                  <p className="text-3xl font-black">{organizerUsers.length}</p>
                </div>
                <FiShield className="text-4xl opacity-50" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardBody>
            <Tabs variant="underlined" color="warning">
              {/* Tab: ค่ายรออนุมัติ */}
              <Tab key="pending" title={`รออนุมัติ (${pendingCamps.length})`}>
                <div className="py-4">
                  <Table aria-label="Pending camps">
                    <TableHeader>
                      <TableColumn>ชื่อค่าย</TableColumn>
                      <TableColumn>ผู้จัด</TableColumn>
                      <TableColumn>วันที่</TableColumn>
                      <TableColumn>ค่าใช้จ่าย</TableColumn>
                      <TableColumn>สถานะ</TableColumn>
                      <TableColumn>จัดการ</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="ไม่มีค่ายรออนุมัติ">
                      {pendingCamps.map((camp) => (
                        <TableRow key={camp._id}>
                          <TableCell>
                            <div className="font-bold">{camp.name}</div>
                            <div className="text-sm text-gray-500">{camp.location}</div>
                          </TableCell>
                          <TableCell>{camp.organizerName || camp.organizerEmail}</TableCell>
                          <TableCell className="text-sm">{camp.date}</TableCell>
                          <TableCell>{camp.price}</TableCell>
                          <TableCell>
                            <Chip size="sm" color="warning" variant="flat">
                              รอตรวจสอบ
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                startContent={<FiEye />}
                                onPress={() => {
                                  setSelectedCamp(camp);
                                  setIsViewModalOpen(true);
                                }}
                              >
                                ดู
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Tab>

              {/* Tab: ค่ายทั้งหมด */}
              <Tab key="all-camps" title={`ค่ายทั้งหมด (${camps.length})`}>
                <div className="py-4">
                  <Table aria-label="All camps">
                    <TableHeader>
                      <TableColumn>ชื่อค่าย</TableColumn>
                      <TableColumn>ผู้จัด</TableColumn>
                      <TableColumn>วันที่</TableColumn>
                      <TableColumn>สถานะ</TableColumn>
                      <TableColumn>ผู้สมัคร</TableColumn>
                      <TableColumn>จัดการ</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {camps.map((camp) => (
                        <TableRow key={camp._id}>
                          <TableCell>
                            <div className="font-bold">{camp.name}</div>
                            <div className="text-sm text-gray-500">{camp.location}</div>
                          </TableCell>
                          <TableCell>{camp.organizerName || camp.organizerEmail}</TableCell>
                          <TableCell className="text-sm">{camp.date}</TableCell>
                          <TableCell>
                            <Chip size="sm" color={getStatusColor(camp.status)} variant="flat">
                              {getStatusText(camp.status)}
                            </Chip>
                          </TableCell>
                          <TableCell>{camp.enrolled || 0} / {camp.capacity}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                startContent={<FiEye />}
                                onPress={() => {
                                  setSelectedCamp(camp);
                                  setIsViewModalOpen(true);
                                }}
                              >
                                ดู
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                startContent={<FiXCircle />}
                                onPress={() => handleDeleteCamp(camp._id)}
                              >
                                ลบ
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Tab>

              {/* Tab: ผู้ใช้ทั้งหมด */}
              <Tab key="users" title={`ผู้ใช้ (${users.length})`}>
                <div className="py-4">
                  <Table aria-label="All users">
                    <TableHeader>
                      <TableColumn>ชื่อ</TableColumn>
                      <TableColumn>อีเมล</TableColumn>
                      <TableColumn>สิทธิ์</TableColumn>
                      <TableColumn>วันที่สมัคร</TableColumn>
                      <TableColumn>จัดการ</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name || '-'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              color={
                                user.role === 'admin' ? 'danger' :
                                user.role === 'organizer' ? 'warning' : 'default'
                              }
                              variant="flat"
                            >
                              {user.role}
                            </Chip>
                          </TableCell>
                          <TableCell className="text-sm">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH') : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {user.role !== 'admin' && (
                                <Button
                                  size="sm"
                                  color="warning"
                                  variant="flat"
                                  onPress={() => handleUpdateUserRole(user._id, 'organizer')}
                                  isDisabled={user.role === 'organizer'}
                                >
                                  → Organizer
                                </Button>
                              )}
                              {user.role !== 'admin' && (
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="flat"
                                  onPress={() => handleUpdateUserRole(user._id, 'admin')}
                                >
                                  → Admin
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>

      {/* View Camp Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-2xl font-bold">รายละเอียดค่าย</h3>
              </ModalHeader>
              <ModalBody>
                {selectedCamp && (
                  <div className="space-y-4">
                    {selectedCamp.image && (
                      <Image
                        src={selectedCamp.image}
                        alt={selectedCamp.name}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    )}

                    <div>
                      <h4 className="font-bold text-xl mb-2">{selectedCamp.name}</h4>
                      <p className="text-gray-600">{selectedCamp.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">ผู้จัด</p>
                        <p className="font-semibold">{selectedCamp.organizerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">อีเมล</p>
                        <p className="font-semibold">{selectedCamp.organizerEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">วันที่</p>
                        <p className="font-semibold">{selectedCamp.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">สถานที่</p>
                        <p className="font-semibold">{selectedCamp.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ค่าใช้จ่าย</p>
                        <p className="font-semibold">{selectedCamp.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">จำนวนที่รับ</p>
                        <p className="font-semibold">{selectedCamp.capacity} คน</p>
                      </div>
                    </div>

                    {selectedCamp.status === 'pending' && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          ⚠️ ค่ายนี้รอการอนุมัติจากคุณ
                        </p>
                      </div>
                    )}

                    {selectedCamp.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <p className="text-sm font-bold text-red-800 dark:text-red-200 mb-1">
                          เหตุผลที่ปฏิเสธ:
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {selectedCamp.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="flat" onPress={onClose}>
                  ปิด
                </Button>
                {selectedCamp?.status === 'pending' && (
                  <>
                    <Button
                      color="danger"
                      variant="flat"
                      startContent={<FiXCircle />}
                      onPress={() => {
                        setIsRejectModalOpen(true);
                      }}
                      isDisabled={processing}
                    >
                      ปฏิเสธ
                    </Button>
                    <Button
                      color="success"
                      startContent={<FiCheckCircle />}
                      onPress={() => handleApproveCamp(selectedCamp._id)}
                      isLoading={processing}
                    >
                      อนุมัติ
                    </Button>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>ปฏิเสธค่าย</ModalHeader>
              <ModalBody>
                <Textarea
                  label="เหตุผลในการปฏิเสธ"
                  placeholder="ระบุเหตุผลที่ปฏิเสธค่ายนี้..."
                  value={rejectReason}
                  onValueChange={setRejectReason}
                  minRows={3}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="flat" onPress={onClose}>
                  ยกเลิก
                </Button>
                <Button
                  color="danger"
                  onPress={handleRejectCamp}
                  isLoading={processing}
                  isDisabled={!rejectReason.trim()}
                >
                  ยืนยันปฏิเสธ
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
