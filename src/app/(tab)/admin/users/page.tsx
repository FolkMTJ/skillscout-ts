'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    Chip,
    useDisclosure,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from '@heroui/react';
import { FiSearch, FiTrash2, FiUserX, FiUserCheck } from 'react-icons/fi';
import { ConfirmModal } from '@/components/common';
import toast from 'react-hot-toast';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isBanned?: boolean;
    createdAt: string;
}

export default function AdminUsers() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userSortKey, setUserSortKey] = useState<'name' | 'role' | 'createdAt' | 'status'>('createdAt');
    const [userSortDir, setUserSortDir] = useState<'asc' | 'desc'>('desc');

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const { isOpen: isBanModalOpen, onOpen: onBanModalOpen, onClose: onBanModalClose } = useDisclosure();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.users) setUsers(data.users);
        } catch {
            toast.error('ไม่สามารถโหลดข้อมูลผู้ใช้งานได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBanUser = (user: User) => {
        setSelectedUser(user);
        onBanModalOpen();
    };

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user);
        onDeleteModalOpen();
    };

    const confirmBanUser = async () => {
        if (!selectedUser) return;
        try {
            const response = await fetch(`/api/admin/users/${selectedUser._id}/ban`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to ban user');
            toast.success(selectedUser.isBanned ? 'ปลดแบน User สำเร็จ!' : 'แบน User สำเร็จ!');
            onBanModalClose();
            fetchUsers();
        } catch {
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const confirmDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            const response = await fetch(`/api/admin/users/${selectedUser._id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete user');
            toast.success('ลบ User สำเร็จ!');
            onDeleteModalClose();
            fetchUsers();
        } catch {
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const roleOrder: Record<string, number> = { user: 0, organizer: 1, admin: 2, super_admin: 3 };

    const filteredUsers = [...users]
        .filter(user =>
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            let aVal: string | number;
            let bVal: string | number;

            if (userSortKey === 'role') {
                aVal = roleOrder[a.role] ?? 0;
                bVal = roleOrder[b.role] ?? 0;
            } else if (userSortKey === 'createdAt') {
                aVal = new Date(a.createdAt).getTime();
                bVal = new Date(b.createdAt).getTime();
            } else if (userSortKey === 'status') {
                aVal = a.isBanned ? 1 : 0;
                bVal = b.isBanned ? 1 : 0;
            } else {
                aVal = a.name?.toLowerCase() || '';
                bVal = b.name?.toLowerCase() || '';
            }

            if (aVal < bVal) return userSortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return userSortDir === 'asc' ? 1 : -1;
            return 0;
        });

    if (loading) {
        return (
            <div className="bg-white dark:bg-zinc-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-zinc-700 animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded mb-6 w-full max-w-md" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 dark:bg-zinc-700/50 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-zinc-800 rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-zinc-700 animate-fade-in max-w-7xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">จัดการรายชื่อผู้ใช้ ({users.length})</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <Input
                        placeholder="ค้นหา User หรือ Email..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        startContent={<FiSearch className="text-gray-400" />}
                        size="md"
                        className="flex-1"
                        classNames={{ inputWrapper: "bg-gray-50 border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700 shadow-none" }}
                    />
                    <div className="flex gap-2 flex-wrap items-center bg-gray-50 dark:bg-zinc-800/50 p-1.5 rounded-xl border border-gray-100 dark:border-zinc-700">
                        <span className="text-sm text-gray-400 font-medium px-2">เรียงตาม:</span>
                        {([
                            { key: 'createdAt', label: 'สมัครใหม่สุด' },
                            { key: 'name', label: 'ชื่อ' },
                            { key: 'role', label: 'Role' },
                            { key: 'status', label: 'สถานะ' },
                        ] as const).map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => {
                                    if (userSortKey === key) setUserSortDir(d => d === 'asc' ? 'desc' : 'asc');
                                    else { setUserSortKey(key); setUserSortDir('asc'); }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${userSortKey === key
                                    ? 'bg-[#F2B33D] text-white shadow-sm'
                                    : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-600'
                                    }`}
                            >
                                {label}
                                {userSortKey === key && (
                                    <span className="text-[10px] ml-1">{userSortDir === 'asc' ? '↑' : '↓'}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                    <Table aria-label="Users management table" shadow="none" classNames={{ wrapper: "p-0 rounded-none shadow-none" }}>
                        <TableHeader>
                            <TableColumn>ชื่อ</TableColumn>
                            <TableColumn>อีเมล</TableColumn>
                            <TableColumn>Role</TableColumn>
                            <TableColumn>สถานะ</TableColumn>
                            <TableColumn>วันที่สมัคร</TableColumn>
                            <TableColumn>จัดการ</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="ไม่พบข้อมูลผู้ใช้งาน">
                            {filteredUsers.map((user) => {
                                const roleConfig: Record<string, { label: string; cls: string }> = {
                                    super_admin: { label: 'Super Admin', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
                                    admin: { label: 'Admin', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
                                    organizer: { label: 'Organizer', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
                                    user: { label: 'User', cls: 'bg-gray-100 text-gray-600 dark:bg-zinc-700 dark:text-gray-300' },
                                };
                                const rc = roleConfig[user.role] ?? { label: user.role, cls: 'bg-gray-100 text-gray-600' };
                                const initials = user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
                                const isProtected = user.role === 'admin' || user.role === 'super_admin';
                                return (
                                    <TableRow key={user._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        {/* ชื่อ */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[#F2B33D]/20 flex items-center justify-center shrink-0">
                                                    <span className="text-xs font-bold text-[#F2B33D]">{initials}</span>
                                                </div>
                                                <span className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</span>
                                            </div>
                                        </TableCell>
                                        {/* อีเมล */}
                                        <TableCell>
                                            <span className="text-xs text-gray-500 font-mono">{user.email}</span>
                                        </TableCell>
                                        {/* Role */}
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold ${rc.cls}`}>
                                                {rc.label}
                                            </span>
                                        </TableCell>
                                        {/* สถานะ */}
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.isBanned ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                                <span className={`text-xs font-semibold ${user.isBanned ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                    {user.isBanned ? 'Banned' : 'Active'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        {/* วันที่สมัคร */}
                                        <TableCell>
                                            <span className="text-xs text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </TableCell>
                                        {/* จัดการ */}
                                        <TableCell>
                                            <div className="flex gap-1 items-center opacity-70 group-hover:opacity-100 transition-opacity">
                                                {!isProtected && (
                                                    <button
                                                        onClick={() => handleBanUser(user)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${user.isBanned
                                                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                            : 'bg-gray-100 dark:bg-zinc-700 text-gray-500 hover:bg-orange-50 hover:text-orange-500'
                                                            }`}
                                                        title={user.isBanned ? 'ปลดแบน' : 'แบน'}
                                                    >
                                                        {user.isBanned ? <FiUserCheck size={14} /> : <FiUserX size={14} />}
                                                    </button>
                                                )}
                                                {!isProtected && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-red-50 hover:text-red-500 text-gray-500 flex items-center justify-center transition-colors"
                                                        title="ลบบัญชี"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                )}
                                                {session?.user?.role === 'super_admin' && user.email !== session?.user?.email && (
                                                    <select
                                                        value={user.role}
                                                        onChange={async (e) => {
                                                            const newRole = e.target.value;
                                                            try {
                                                                const res = await fetch(`/api/admin/users/${user._id}/role`, {
                                                                    method: 'PATCH',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ role: newRole }),
                                                                });
                                                                if (!res.ok) throw new Error();
                                                                toast.success(`เปลี่ยน Role เป็น ${newRole} สำเร็จ`);
                                                                fetchUsers();
                                                            } catch { toast.error('เกิดข้อผิดพลาด'); }
                                                        }}
                                                        className="h-8 px-2 rounded-lg text-xs font-medium border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:border-[#F2B33D] focus:ring-1 focus:ring-[#F2B33D] ml-1"
                                                    >
                                                        <option value="user">user (นักเรียน)</option>
                                                        <option value="organizer">organizer (ผู้จัด)</option>
                                                        <option value="admin">admin (ผู้ดูแล)</option>
                                                        <option value="super_admin">super_admin (ระบบ)</option>
                                                    </select>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Ban Modal */}
            <ConfirmModal
                isOpen={isBanModalOpen}
                onClose={onBanModalClose}
                onConfirm={confirmBanUser}
                title={selectedUser?.isBanned ? 'ยืนยันปลดแบนผู้ใช้' : 'ยืนยันแบนผู้ใช้'}
                description={`คุณแน่ใจหรือไม่ที่จะ${selectedUser?.isBanned ? 'ปลดแบน' : 'แบน'}บัญชีของ ${selectedUser?.name}?`}
                confirmLabel={selectedUser?.isBanned ? 'ปลดแบน' : 'แบนผู้ใช้'}
                variant={selectedUser?.isBanned ? 'success' : 'warning'}
            />

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={onDeleteModalClose}
                onConfirm={confirmDeleteUser}
                title="ลบบัญชีผู้ใช้"
                description={`จะลบบัญชี ${selectedUser?.name} อย่างถาวรหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
                confirmLabel="ลบถาวร"
                variant="danger"
            />
        </>
    );
}
