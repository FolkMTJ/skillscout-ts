'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
} from '@heroui/react';
import { FiUsers, FiCalendar, FiShield, FiTrash2, FiEye, FiSearch, FiAlertCircle, FiXCircle, FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBanned?: boolean;
  createdAt: string;
}

interface Camp {
  _id: string;
  name: string;
  organizerName: string;
  organizerEmail: string;
  status: string;
  enrolled: number;
  capacity: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const { isOpen: isBanModalOpen, onOpen: onBanModalOpen, onClose: onBanModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isApproveModalOpen, onOpen: onApproveModalOpen, onClose: onApproveModalClose } = useDisclosure();
  const { isOpen: isRejectModalOpen, onOpen: onRejectModalOpen, onClose: onRejectModalClose } = useDisclosure();

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchData();
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      if (usersData.users) setUsers(usersData.users);

      const campsRes = await fetch('/api/camps?includeAll=true');
      const campsData = await campsRes.json();
      setCamps(Array.isArray(campsData) ? campsData : campsData.camps || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = (user: User) => {
    setSelectedUser(user);
    onBanModalOpen();
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    onDeleteModalOpen();
  };

  const handleApproveCamp = (camp: Camp) => {
    setSelectedCamp(camp);
    onApproveModalOpen();
  };

  const handleRejectCamp = (camp: Camp) => {
    setSelectedCamp(camp);
    setRejectReason('');
    onRejectModalOpen();
  };

  const confirmBanUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}/ban`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to ban user');

      toast.success(selectedUser.isBanned ? 'ปลดแบน User สำเร็จ!' : 'แบน User สำเร็จ!');
      onBanModalClose();
      fetchData();
    } catch (err) {
      console.error('Error banning user:', err);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      toast.success('ลบ User สำเร็จ!');
      onDeleteModalClose();
      fetchData();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const confirmApproveCamp = async () => {
    if (!selectedCamp || !session?.user?.id) return;

    try {
      const response = await fetch(`/api/camps/${selectedCamp._id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: session.user.id,
          action: 'approve'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve camp');
      }

      const result = await response.json();
      
      toast.success('อนุมัติค่ายสำเร็จ!');
      
      if (result.issues && result.issues.length > 0) {
        toast(`คะแนนการตรวจสอบ: ${result.verificationScore}/100`, {
          icon: '⚠️',
        });
      }
      
      onApproveModalClose();
      fetchData();
    } catch (err) {
      console.error('Error approving camp:', err);
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const confirmRejectCamp = async () => {
    if (!selectedCamp || !session?.user?.id) return;
    
    if (!rejectReason.trim()) {
      toast.error('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }

    try {
      const response = await fetch(`/api/camps/${selectedCamp._id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: session.user.id,
          action: 'reject',
          reason: rejectReason
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject camp');
      }

      toast.success('ปฏิเสธค่ายสำเร็จ!');
      onRejectModalClose();
      setRejectReason('');
      fetchData();
    } catch (err) {
      console.error('Error rejecting camp:', err);
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการปฏิเสธ');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const organizers = users.filter(u => u.role === 'organizer').length;
  const bannedUsers = users.filter(u => u.isBanned).length;
  const pendingCamps = camps.filter(c => c.status === 'pending').length;
  const activeCamps = camps.filter(c => c.status === 'active').length;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <FiShield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ Admin)</p>
          <Button color="primary" onPress={() => router.push('/')}>
            กลับหน้าหลัก
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiShield className="text-3xl text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">จัดการระบบและผู้ใช้งาน</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">ผู้ใช้ทั้งหมด</p>
                <p className="text-3xl font-bold mt-1">{totalUsers}</p>
              </div>
              <FiUsers className="text-4xl opacity-80" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Organizers</p>
                <p className="text-3xl font-bold mt-1">{organizers}</p>
              </div>
              <FiShield className="text-4xl opacity-80" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Banned</p>
                <p className="text-3xl font-bold mt-1">{bannedUsers}</p>
              </div>
              <FiXCircle className="text-4xl opacity-80" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">ค่ายรออนุมัติ</p>
                <p className="text-3xl font-bold mt-1">{pendingCamps}</p>
              </div>
              <FiAlertCircle className="text-4xl opacity-80" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">ค่ายที่เปิด</p>
                <p className="text-3xl font-bold mt-1">{activeCamps}</p>
              </div>
              <FiCalendar className="text-4xl opacity-80" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="p-6">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
          >
            <Tab key="overview" title="ภาพรวม">
              <div className="py-6 space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">สถิติระบบ</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
                      <p className="text-sm text-gray-600">Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{activeCamps}</p>
                      <p className="text-sm text-gray-600">Active Camps</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-600">{pendingCamps}</p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">{organizers}</p>
                      <p className="text-sm text-gray-600">Organizers</p>
                    </div>
                  </div>
                </Card>
              </div>
            </Tab>

            <Tab key="users" title={`Users (${totalUsers})`}>
              <div className="py-6">
                <div className="mb-4">
                  <Input
                    placeholder="ค้นหา User..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    startContent={<FiSearch />}
                    size="lg"
                  />
                </div>

                <Table aria-label="Users table">
                  <TableHeader>
                    <TableColumn>ชื่อ</TableColumn>
                    <TableColumn>อีเมล</TableColumn>
                    <TableColumn>Role</TableColumn>
                    <TableColumn>สถานะ</TableColumn>
                    <TableColumn>วันที่สมัคร</TableColumn>
                    <TableColumn>จัดการ</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={
                              user.role === 'admin' ? 'danger' :
                              user.role === 'organizer' ? 'primary' : 'default'
                            }
                          >
                            {user.role}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          {user.isBanned ? (
                            <Chip size="sm" color="danger" variant="flat">
                              Banned
                            </Chip>
                          ) : (
                            <Chip size="sm" color="success" variant="flat">
                              Active
                            </Chip>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('th-TH')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color={user.isBanned ? "success" : "warning"}
                              variant="flat"
                              onPress={() => handleBanUser(user)}
                              isDisabled={user.role === 'admin'}
                            >
                              {user.isBanned ? 'ปลดแบน' : 'แบน'}
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              onPress={() => handleDeleteUser(user)}
                              isDisabled={user.role === 'admin'}
                              startContent={<FiTrash2 />}
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

            <Tab key="camps" title={`ค่าย (${camps.length})`}>
              <div className="py-6">
                <Table aria-label="Camps table">
                  <TableHeader>
                    <TableColumn>ชื่อค่าย</TableColumn>
                    <TableColumn>Organizer</TableColumn>
                    <TableColumn>สถานะ</TableColumn>
                    <TableColumn>ผู้เข้าร่วม</TableColumn>
                    <TableColumn>วันที่สร้าง</TableColumn>
                    <TableColumn>จัดการ</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {camps.map((camp) => (
                      <TableRow key={camp._id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium truncate">{camp.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{camp.organizerName}</p>
                            <p className="text-xs text-gray-500">{camp.organizerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={
                              camp.status === 'active' ? 'success' :
                              camp.status === 'pending' ? 'warning' :
                              camp.status === 'rejected' ? 'danger' :
                              'default'
                            }
                          >
                            {camp.status}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          {camp.enrolled || 0}/{camp.capacity}
                        </TableCell>
                        <TableCell>
                          {new Date(camp.createdAt).toLocaleDateString('th-TH')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="flat"
                              startContent={<FiEye />}
                              onPress={() => router.push(`/camps/${camp._id}`)}
                            >
                              ดู
                            </Button>
                            {camp.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  color="success"
                                  variant="flat"
                                  startContent={<FiCheck />}
                                  onPress={() => handleApproveCamp(camp)}
                                >
                                  อนุมัติ
                                </Button>
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="flat"
                                  startContent={<FiX />}
                                  onPress={() => handleRejectCamp(camp)}
                                >
                                  ปฏิเสธ
                                </Button>
                              </>
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
        </Card>
      </div>

      {/* Ban Modal */}
      <Modal isOpen={isBanModalOpen} onClose={onBanModalClose}>
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold">
              {selectedUser?.isBanned ? 'ปลดแบน User' : 'แบน User'}
            </h3>
          </ModalHeader>
          <ModalBody>
            {selectedUser && (
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
                <p className="text-gray-700">
                  {selectedUser.isBanned
                    ? 'คุณต้องการปลดแบน User นี้หรือไม่? User จะสามารถเข้าใช้งานระบบได้อีกครั้ง'
                    : 'คุณต้องการแบน User นี้หรือไม่? User จะไม่สามารถเข้าใช้งานระบบได้'}
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onBanModalClose}>
              ยกเลิก
            </Button>
            <Button
              color={selectedUser?.isBanned ? "success" : "warning"}
              onPress={confirmBanUser}
            >
              {selectedUser?.isBanned ? 'ปลดแบน' : 'แบน'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
              <FiAlertTriangle />
              ลบ User
            </h3>
          </ModalHeader>
          <ModalBody>
            {selectedUser && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200">
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>คำเตือน:</strong> การลบ User จะลบข้อมูลทั้งหมดของ User นี้ออกจากระบบ
                    และไม่สามารถกู้คืนได้!
                  </p>
                </div>
                <p className="text-gray-700 font-semibold">
                  คุณแน่ใจหรือไม่ที่จะลบ User นี้?
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteModalClose}>
              ยกเลิก
            </Button>
            <Button
              color="danger"
              onPress={confirmDeleteUser}
              startContent={<FiTrash2 />}
            >
              ลบ User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Approve Camp Modal */}
      <Modal isOpen={isApproveModalOpen} onClose={onApproveModalClose}>
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold text-green-600 flex items-center gap-2">
              <FiCheck />
              อนุมัติค่าย
            </h3>
          </ModalHeader>
          <ModalBody>
            {selectedCamp && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200">
                  <p className="font-semibold text-lg">{selectedCamp.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    โดย: {selectedCamp.organizerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedCamp.organizerEmail}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>ข้อมูล:</strong> ระบบจะทำการตรวจสอบความถูกต้องของข้อมูลค่ายอัตโนมัติ
                    และให้คะแนนการตรวจสอบ
                  </p>
                </div>
                <p className="text-gray-700 font-semibold">
                  คุณต้องการอนุมัติค่ายนี้หรือไม่? ค่ายจะถูกเปิดให้ผู้ใช้สมัครได้ทันที
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onApproveModalClose}>
              ยกเลิก
            </Button>
            <Button
              color="success"
              onPress={confirmApproveCamp}
              startContent={<FiCheck />}
            >
              อนุมัติค่าย
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reject Camp Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={onRejectModalClose}>
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
              <FiX />
              ปฏิเสธค่าย
            </h3>
          </ModalHeader>
          <ModalBody>
            {selectedCamp && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200">
                  <p className="font-semibold text-lg">{selectedCamp.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    โดย: {selectedCamp.organizerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedCamp.organizerEmail}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    เหตุผลในการปฏิเสธ <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="กรุณาระบุเหตุผลที่ปฏิเสธค่ายนี้..."
                    value={rejectReason}
                    onValueChange={setRejectReason}
                    minRows={4}
                    variant="bordered"
                  />
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>หมายเหตุ:</strong> เหตุผลนี้จะถูกส่งให้ Organizer ทราบ
                  </p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onRejectModalClose}>
              ยกเลิก
            </Button>
            <Button
              color="danger"
              onPress={confirmRejectCamp}
              startContent={<FiX />}
              isDisabled={!rejectReason.trim()}
            >
              ปฏิเสธค่าย
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
