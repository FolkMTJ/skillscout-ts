'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
    Textarea
} from '@heroui/react';
import { FiSearch, FiHome, FiCheck, FiX, FiTrash2, FiAlertCircle, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ConfirmModal } from '@/components/common';

interface Camp {
    _id: string;
    name: string;
    organizerName: string;
    organizerEmail: string;
    status: string;
    enrolled: number;
    capacity: number;
    createdAt: string;
    startDate?: string;
    endDate?: string;
}

export default function AdminCamps() {
    const { data: session } = useSession();
    const router = useRouter();
    const [camps, setCamps] = useState<Camp[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchCamp, setSearchCamp] = useState('');
    const [campStatusFilter, setCampStatusFilter] = useState<'all' | 'pending' | 'active' | 'completed' | 'rejected'>('all');

    const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const { isOpen: isApproveModalOpen, onOpen: onApproveModalOpen, onClose: onApproveModalClose } = useDisclosure();
    const { isOpen: isRejectModalOpen, onOpen: onRejectModalOpen, onClose: onRejectModalClose } = useDisclosure();
    const { isOpen: isDeleteCampModalOpen, onOpen: onDeleteCampModalOpen, onClose: onDeleteCampModalClose } = useDisclosure();

    const fetchCamps = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/camps?includeAll=true', { cache: 'no-store' });
            const data = await res.json();
            setCamps(Array.isArray(data) ? data : data.camps || []);
        } catch {
            toast.error('ไม่สามารถโหลดข้อมูลค่ายได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCamps();
    }, []);

    function effectiveCampStatus(camp: Camp): string {
        if (camp.status !== 'active') return camp.status;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const end = camp.endDate ? new Date(camp.endDate) : camp.startDate ? new Date(camp.startDate) : null;
        if (end) {
            end.setHours(23, 59, 59, 999);
            if (now > end) return 'completed';
        }
        return camp.status;
    }

    const filteredCamps = camps.filter(c => {
        const eff = effectiveCampStatus(c);
        const matchStatus = campStatusFilter === 'all' || eff === campStatusFilter;
        const matchSearch = !searchCamp ||
            c.name.toLowerCase().includes(searchCamp.toLowerCase()) ||
            c.organizerName?.toLowerCase().includes(searchCamp.toLowerCase()) ||
            c.organizerEmail?.toLowerCase().includes(searchCamp.toLowerCase());
        return matchStatus && matchSearch;
    });

    const handleApproveCamp = (camp: Camp) => {
        setSelectedCamp(camp);
        onApproveModalOpen();
    };

    const confirmApproveCamp = async () => {
        if (!selectedCamp || !session?.user?.id) return;
        try {
            const response = await fetch(`/api/camps/${selectedCamp._id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId: session.user.id, action: 'approve' }),
            });
            if (!response.ok) throw new Error();
            const result = await response.json();
            toast.success('อนุมัติค่ายสำเร็จ!');
            if (result.issues?.length > 0) toast(`คะแนนตรวจสอบ: ${result.verificationScore}/100`, { icon: '⚠️' });
            onApproveModalClose();
            fetchCamps();
        } catch { toast.error('เกิดข้อผิดพลาดในการอนุมัติ'); }
    };

    const handleRejectCamp = (camp: Camp) => {
        setSelectedCamp(camp);
        setRejectReason('');
        onRejectModalOpen();
    };

    const confirmRejectCamp = async () => {
        if (!selectedCamp || !session?.user?.id) return;
        if (!rejectReason.trim()) { toast.error('กรุณาระบุเหตุผล'); return; }
        try {
            const response = await fetch(`/api/camps/${selectedCamp._id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId: session.user.id, action: 'reject', reason: rejectReason }),
            });
            if (!response.ok) throw new Error();
            toast.success('ปฏิเสธค่ายสำเร็จ!');
            onRejectModalClose();
            fetchCamps();
        } catch { toast.error('เกิดข้อผิดพลาดในการปฏิเสธ'); }
    };

    const handleDeleteCamp = (camp: Camp) => {
        setSelectedCamp(camp);
        onDeleteCampModalOpen();
    };

    const confirmDeleteCamp = async () => {
        if (!selectedCamp) return;
        try {
            const res = await fetch(`/api/camps/${selectedCamp._id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            toast.success(`ลบค่าย "${selectedCamp.name}" สำเร็จ`);
            onDeleteCampModalClose();
            fetchCamps();
        } catch { toast.error('เกิดข้อผิดพลาด'); }
    };

    const pendingCount = camps.filter(c => c.status === 'pending').length;

    if (loading) {
        return (
            <div className="bg-white dark:bg-zinc-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-zinc-700 animate-pulse max-w-7xl">
                <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded mb-6 w-full max-w-md" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="h-12 bg-gray-100 dark:bg-zinc-700/50 rounded-xl" />))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-zinc-800 rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-zinc-700 animate-fade-in max-w-7xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">จัดการข้อมูลค่าย ({camps.length})</h2>
                        {pendingCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
                                <FiAlertCircle size={12} /> {pendingCount} รออนุมัติ
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <Input
                        placeholder="ค้นหาชื่อค่าย หรือ ชื่อผู้จัด..."
                        value={searchCamp}
                        onValueChange={setSearchCamp}
                        startContent={<FiSearch className="text-gray-400" />}
                        size="md"
                        className="flex-1 max-w-md"
                        classNames={{ inputWrapper: "bg-gray-50 border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700 shadow-none" }}
                    />
                    <div className="flex gap-2 flex-wrap bg-gray-50 dark:bg-zinc-800/50 p-1.5 rounded-xl border border-gray-100 dark:border-zinc-700 w-fit">
                        {([
                            { key: 'all', label: 'ทั้งหมด', color: 'bg-gray-800 text-white', hover: 'hover:bg-gray-200 text-gray-700' },
                            { key: 'pending', label: 'รออนุมัติ', color: 'bg-orange-500 text-white', hover: 'hover:bg-orange-100 text-orange-700' },
                            { key: 'active', label: 'เปิดรับสมัคร', color: 'bg-green-500 text-white', hover: 'hover:bg-green-100 text-green-700' },
                            { key: 'completed', label: 'กิจกรรมจบแล้ว', color: 'bg-blue-500 text-white', hover: 'hover:bg-blue-100 text-blue-700' },
                            { key: 'rejected', label: 'ถูกปฏิเสธ', color: 'bg-red-500 text-white', hover: 'hover:bg-red-100 text-red-700' },
                        ] as const).map(({ key, label, color, hover }) => {
                            const count = key === 'all' ? camps.length : camps.filter(c => effectiveCampStatus(c) === key).length;
                            const isActive = campStatusFilter === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setCampStatusFilter(key)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive ? `${color} shadow-sm` : `bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 ${hover} dark:text-gray-300 dark:hover:bg-zinc-700`
                                        }`}
                                >
                                    {label} {count > 0 && `(${count})`}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                    <Table aria-label="Camps table" shadow="none" classNames={{ wrapper: "p-0 rounded-none shadow-none" }}>
                        <TableHeader>
                            <TableColumn>ชื่อค่าย</TableColumn>
                            <TableColumn>ผู้จัด (Organizer)</TableColumn>
                            <TableColumn>สถานะ</TableColumn>
                            <TableColumn>ผู้เข้าร่วม / รับได้</TableColumn>
                            <TableColumn>วันที่สร้าง</TableColumn>
                            <TableColumn>ดำเนินการ</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="ไม่พบค่ายในระบบ">
                            {filteredCamps.map((camp) => {
                                const eff = effectiveCampStatus(camp);
                                const statusConfig = {
                                    active: { label: 'เปิดรับสมัคร', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
                                    pending: { label: 'รออนุมัติ', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', dot: 'bg-orange-500' },
                                    rejected: { label: 'ถูกปฏิเสธ', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
                                    completed: { label: 'จบแล้ว', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dot: 'bg-blue-500' },
                                };
                                const st = statusConfig[eff as keyof typeof statusConfig] ?? { label: eff, cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
                                const fillPct = camp.capacity > 0 ? Math.min((camp.enrolled || 0) / camp.capacity, 1) : 0;
                                return (
                                    <TableRow key={camp._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        {/* ชื่อค่าย */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-[#F2B33D]/10 flex items-center justify-center shrink-0">
                                                    <FiHome size={14} className="text-[#F2B33D]" />
                                                </div>
                                                <p className="font-bold text-gray-900 dark:text-gray-100 truncate max-w-[180px]" title={camp.name}>{camp.name}</p>
                                            </div>
                                        </TableCell>
                                        {/* ผู้จัด */}
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm leading-tight">{camp.organizerName}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{camp.organizerEmail}</p>
                                            </div>
                                        </TableCell>
                                        {/* สถานะ */}
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${st.cls}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                                {st.label}
                                            </span>
                                        </TableCell>
                                        {/* ผู้เข้าร่วม */}
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-mono text-gray-600 dark:text-gray-300">{camp.enrolled || 0} / {camp.capacity}</span>
                                                <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-zinc-700 overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all ${fillPct >= 1 ? 'bg-red-400' : fillPct >= 0.7 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${fillPct * 100}%` }} />
                                                </div>
                                            </div>
                                        </TableCell>
                                        {/* วันที่สร้าง */}
                                        <TableCell>
                                            <span className="text-xs text-gray-500">
                                                {new Date(camp.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </TableCell>
                                        {/* ดำเนินการ */}
                                        <TableCell>
                                            <div className="flex gap-1 items-center opacity-80 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => router.push(`/camps/${camp._id}`)}
                                                    className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-blue-50 hover:text-blue-500 text-gray-500 flex items-center justify-center transition-colors"
                                                    title="ดูข้อมูล"
                                                >
                                                    <FiEye size={14} />
                                                </button>
                                                {camp.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproveCamp(camp)}
                                                            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                                                            title="อนุมัติ"
                                                        >
                                                            <FiCheck size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectCamp(camp)}
                                                            className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 flex items-center justify-center transition-colors"
                                                            title="ตีกลับ"
                                                        >
                                                            <FiX size={14} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteCamp(camp)}
                                                    className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-red-50 hover:text-red-500 text-gray-500 flex items-center justify-center transition-colors"
                                                    title="ลบ"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Approve Modal */}
            <ConfirmModal
                isOpen={isApproveModalOpen}
                onClose={onApproveModalClose}
                onConfirm={confirmApproveCamp}
                title="ยืนยันอนุมัติค่าย"
                description={`คุณต้องการอนุมัติให้ค่าย ${selectedCamp?.name} เผยแพร่สู่สาธารณะหรือไม่?`}
                confirmLabel="ยืนยันการอนุมัติ"
                variant="success"
            >
                <p className="text-sm text-gray-500 p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700 mt-2">
                    ระบบจะแสดงค่ายนี้ในหน้าแรกโดยอัตโนมัติตามระยะเวลาที่ลงทะเบียนไว้
                </p>
            </ConfirmModal>

            {/* Reject Modal */}
            <ConfirmModal
                isOpen={isRejectModalOpen}
                onClose={onRejectModalClose}
                onConfirm={confirmRejectCamp}
                title="ปฏิเสธค่าย / ตีกลับ"
                description={`ระบุเหตุผลในการปฏิเสธค่าย ${selectedCamp?.name}`}
                confirmLabel="ตีกลับ (Reject)"
                variant="danger"
            >
                <div className="mt-2">
                    <Textarea
                        label="เหตุผลการปฏิเสธ"
                        placeholder="ตัวอย่าง: รูปภาพไม่เหมาะสม, ข้อมูลไม่ครบ..."
                        value={rejectReason}
                        onValueChange={setRejectReason}
                        variant="bordered"
                        color="danger"
                        minRows={3}
                        classNames={{ inputWrapper: 'bg-white dark:bg-zinc-800' }}
                    />
                </div>
            </ConfirmModal>

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={isDeleteCampModalOpen}
                onClose={onDeleteCampModalClose}
                onConfirm={confirmDeleteCamp}
                title="ลบค่ายถาวร"
                description={`คุณแน่ใจหรือไม่ที่จะลบค่าย ${selectedCamp?.name}?`}
                confirmLabel="ยืนยันการลบถาวร"
                variant="danger"
            >
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2 mt-2">
                    <FiAlertCircle className="mt-0.5 flex-shrink-0" />
                    <p>การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลการสมัครและรายได้ที่เกี่ยวข้องอาจได้รับผลกระทบ</p>
                </div>
            </ConfirmModal>
        </>
    );
}
