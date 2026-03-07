'use client';

import { useState, useEffect } from 'react';
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
    ModalFooter,
    Textarea
} from '@heroui/react';
import { FiBookOpen, FiEdit2, FiTrash2, FiPlus, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ConfirmModal } from '@/components/common';

interface HollandCareer {
    _id: string;
    name: string;
    nameTh: string;
    description: string;
    personality: string;
    riasecCodes: string[];
    tags: string[];
    demandLevel: 'high' | 'medium' | 'low';
    minimumSalary: number;
    maximumSalary: number;
    isActive: boolean;
}

export default function AdminCareers() {
    const [hollandCareers, setHollandCareers] = useState<HollandCareer[]>([]);
    const [loading, setLoading] = useState(true);
    const [riasecFilter, setRiasecFilter] = useState<string | null>(null);

    // Modal States
    const { isOpen: isCareerModalOpen, onOpen: onCareerModalOpen, onClose: onCareerModalClose } = useDisclosure();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const { isOpen: isReseedModalOpen, onOpen: onReseedModalOpen, onClose: onReseedModalClose } = useDisclosure();
    const [isReseeding, setIsReseeding] = useState(false);

    const [selectedCareer, setSelectedCareer] = useState<HollandCareer | null>(null);
    const [careerForm, setCareerForm] = useState<Partial<HollandCareer>>({
        name: '', nameTh: '', description: '', personality: '',
        riasecCodes: [], tags: [], demandLevel: 'high', minimumSalary: 0, maximumSalary: 0, isActive: true
    });
    const [saving, setSaving] = useState(false);

    const fetchHollandCareers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/holland-careers');
            const data = await res.json();
            if (data.careers) setHollandCareers(data.careers);
        } catch {
            toast.error('ไม่สามารถโหลดข้อมูลอาชีพ Holland ได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHollandCareers();
    }, []);

    const openAddCareer = () => {
        setSelectedCareer(null);
        setCareerForm({
            name: '', nameTh: '', description: '', personality: '',
            riasecCodes: [], tags: [], demandLevel: 'high', minimumSalary: 25000, maximumSalary: 50000, isActive: true
        });
        onCareerModalOpen();
    };

    const openEditCareer = (career: HollandCareer) => {
        setSelectedCareer(career);
        setCareerForm(career);
        onCareerModalOpen();
    };

    const saveCareer = async () => {
        try {
            setSaving(true);
            if (!careerForm.name || !careerForm.nameTh || !careerForm.description || !careerForm.riasecCodes?.length) {
                toast.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
                return;
            }
            const url = selectedCareer ? `/api/admin/holland-careers/${selectedCareer._id}` : '/api/admin/holland-careers';
            const method = selectedCareer ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(careerForm),
            });

            if (!res.ok) throw new Error();
            toast.success(selectedCareer ? 'แก้ไขอาชีพสำเร็จ' : 'เพิ่มอาชีพใหม่สำเร็จ');
            onCareerModalClose();
            fetchHollandCareers();
        } catch {
            toast.error('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setSaving(false);
        }
    };

    const toggleCareerActive = async (career: HollandCareer) => {
        try {
            const res = await fetch(`/api/admin/holland-careers/${career._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !career.isActive })
            });
            if (!res.ok) throw new Error();
            toast.success(!career.isActive ? 'เปิดการใช้งานอาชีพ' : 'ปิดการใช้งานอาชีพ');
            fetchHollandCareers();
        } catch { toast.error('เกิดข้อผิดพลาด'); }
    };

    const deleteCareer = async () => {
        if (!selectedCareer) return;
        try {
            const res = await fetch(`/api/admin/holland-careers/${selectedCareer._id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            toast.success('ลบอาชีพสำเร็จ');
            onDeleteModalClose();
            fetchHollandCareers();
        } catch { toast.error('ลบล้มเหลว'); }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-zinc-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-zinc-700 animate-pulse max-w-7xl">
                <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded mb-6 w-full max-w-md" />
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (<div key={i} className="h-12 bg-gray-100 dark:bg-zinc-700/50 rounded-xl" />))}
                </div>
            </div>
        );
    }

    const filteredCareers = riasecFilter
        ? [...hollandCareers].filter(c => c.riasecCodes.includes(riasecFilter)).sort((a, b) => {
            const order = ['R', 'I', 'A', 'S', 'E', 'C'];
            return order.indexOf(a.riasecCodes[0]) - order.indexOf(b.riasecCodes[0]);
        })
        : hollandCareers;

    return (
        <>
            <div className="bg-white dark:bg-zinc-800 rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-zinc-700 animate-fade-in max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                    {/* Title */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <FiBookOpen className="text-[#F2B33D]" />
                            อาชีพ Holland ({hollandCareers.length})
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">จัดการอาชีพ IT สำหรับ Path Finder (Holland RIASEC)</p>
                        {riasecFilter && (
                            <div className="mt-1.5 inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-xl text-xs">
                                <FiInfo size={11} />
                                <span>แสดง <strong>{riasecFilter}</strong> · {filteredCareers.length} อาชีพ</span>
                            </div>
                        )}
                    </div>

                    {/* Controls row */}
                    <div className="flex gap-2 items-center flex-wrap md:flex-nowrap">
                        <span className="text-xs text-gray-400 whitespace-nowrap">กรองตามตัวอักษร:</span>
                        {(['R', 'I', 'A', 'S', 'E', 'C'] as const).map(code => (
                            <button
                                key={code}
                                onClick={() => setRiasecFilter(riasecFilter === code ? null : code)}
                                className={`w-8 h-8 rounded-full text-xs font-black border-2 transition-all shrink-0 ${riasecFilter === code
                                    ? 'bg-[#F2B33D] border-[#F2B33D] text-white shadow-md'
                                    : 'bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-gray-300 hover:border-[#F2B33D]'
                                    }`}
                            >
                                {code}
                            </button>
                        ))}
                        <Button
                            size="sm"
                            variant="flat"
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700 shrink-0"
                            onPress={onReseedModalOpen}
                        >
                            Reseed ข้อมูลตั้งต้น
                        </Button>
                        <Button size="sm" className="bg-[#F2B33D] text-white font-medium shadow-sm shadow-[#F2B33D]/30 shrink-0" startContent={<FiPlus />} onPress={openAddCareer}>
                            เพิ่มอาชีพ
                        </Button>
                    </div>
                </div>

                <div className="border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                    <Table aria-label="Holland Careers" shadow="none" classNames={{ wrapper: "p-0 rounded-none shadow-none" }}>
                        <TableHeader>
                            <TableColumn>ชื่ออาชีพ</TableColumn>
                            <TableColumn>RIASEC</TableColumn>
                            <TableColumn>ระดับความต้องการ</TableColumn>
                            <TableColumn>สถานะ</TableColumn>
                            <TableColumn>จัดการ</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="ไม่พบอาชีพในระบบ">
                            {filteredCareers.map((career) => (
                                <TableRow key={career._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    {/* ชื่ออาชีพ */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-[#F2B33D]/10 flex items-center justify-center shrink-0">
                                                <FiBookOpen size={15} className="text-[#F2B33D]" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-100 leading-tight">{career.nameTh}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{career.name}</p>
                                                {(career.minimumSalary > 0 || career.maximumSalary > 0) && (
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        ฿{career.minimumSalary.toLocaleString()} – ฿{career.maximumSalary.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    {/* RIASEC */}
                                    <TableCell>
                                        <div className="flex gap-1 flex-wrap">
                                            {career.riasecCodes.map((c, idx) => (
                                                <span
                                                    key={c}
                                                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-[11px] font-black border-2 ${idx === 0
                                                        ? 'bg-[#F2B33D] border-[#F2B33D] text-white'
                                                        : 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400'
                                                        }`}
                                                >
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    {/* ระดับความต้องการ */}
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${career.demandLevel === 'high' ? 'bg-emerald-500' : career.demandLevel === 'medium' ? 'bg-amber-400' : 'bg-gray-400'}`} />
                                            <span className={`text-xs font-semibold ${career.demandLevel === 'high' ? 'text-emerald-600 dark:text-emerald-400' : career.demandLevel === 'medium' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'}`}>
                                                {career.demandLevel === 'high' ? 'สูง' : career.demandLevel === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    {/* สถานะ */}
                                    <TableCell>
                                        <button
                                            onClick={() => toggleCareerActive(career)}
                                            className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${career.isActive ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-zinc-600'}`}
                                        >
                                            <span className={`inline-block w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${career.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </TableCell>
                                    {/* จัดการ */}
                                    <TableCell>
                                        <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditCareer(career)}
                                                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-[#F2B33D]/10 hover:text-[#F2B33D] text-gray-500 flex items-center justify-center transition-colors"
                                                title="แก้ไข"
                                            >
                                                <FiEdit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedCareer(career); onDeleteModalOpen(); }}
                                                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-red-50 hover:text-red-500 text-gray-500 flex items-center justify-center transition-colors"
                                                title="ลบ"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Editor Modal */}
            <Modal isOpen={isCareerModalOpen} onClose={onCareerModalClose} size="3xl" scrollBehavior="inside" classNames={{ base: "bg-white dark:bg-zinc-900 rounded-[2rem]", header: "border-b border-gray-100 dark:border-zinc-800 px-6 py-4", body: "p-6", footer: "border-t border-gray-100 dark:border-zinc-800 px-6 py-4" }}>
                <ModalContent>
                    <ModalHeader className="gap-2 items-center flex">
                        <FiBookOpen className="text-[#F2B33D]" />
                        <h3 className="font-bold">{selectedCareer ? 'แก้ไขข้อมูลอาชีพ' : 'เพิ่มอาชีพใหม่'}</h3>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">ข้อมูลพื้นฐาน</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="ชื่ออาชีพ (EN)" placeholder="Software Engineer" value={careerForm.name} onValueChange={v => setCareerForm(f => ({ ...f, name: v }))} isRequired classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-none" }} />
                                        <Input label="ชื่ออาชีพ (TH)" placeholder="วิศวกรซอฟต์แวร์" value={careerForm.nameTh} onValueChange={v => setCareerForm(f => ({ ...f, nameTh: v }))} isRequired classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-none" }} />
                                    </div>
                                    <Textarea label="คำอธิบายหน้าที่และยทบาทอาชีพ" value={careerForm.description} onValueChange={v => setCareerForm(f => ({ ...f, description: v }))} minRows={3} isRequired classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-none" }} />
                                    <Textarea label="บุคลิกภาพที่เหมาะสม" value={careerForm.personality} onValueChange={v => setCareerForm(f => ({ ...f, personality: v }))} minRows={2} classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-none" }} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-4">RIASEC Codes</h3>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">โค้ด RIASEC <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2 flex-wrap">
                                        {(['R', 'I', 'A', 'S', 'E', 'C'] as const).map(code => (
                                            <button
                                                key={code}
                                                onClick={() => {
                                                    const current = careerForm.riasecCodes || [];
                                                    if (current.includes(code)) {
                                                        setCareerForm(f => ({ ...f, riasecCodes: current.filter(c => c !== code) }));
                                                    } else if (current.length < 3) {
                                                        setCareerForm(f => ({ ...f, riasecCodes: [...current, code] }));
                                                    } else {
                                                        toast.error('เลือก RIASEC Code ได้สูงสุด 3 ตัว');
                                                    }
                                                }}
                                                className={`w-12 h-12 rounded-xl text-lg font-black border-2 transition-all ${(careerForm.riasecCodes || []).includes(code)
                                                    ? 'bg-[#F2B33D] border-[#F2B33D] text-white shadow-md'
                                                    : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-400 hover:border-[#F2B33D]/50'
                                                    }`}
                                            >
                                                {code}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1.5">เลือกโค้ด RIASEC ที่สอดคล้องกับอาชีพนี้ (สูงสุด 3 ตัว)</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-4">ตลาดเงินเดือน</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <Input type="number" label="เงินเดือนเริ่มต้น (ต่ำสุด)" value={careerForm.minimumSalary?.toString()} onValueChange={v => setCareerForm(f => ({ ...f, minimumSalary: parseInt(v) || 0 }))} startContent={<span className="text-gray-400 text-sm">฿</span>} classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-none" }} />
                                    <Input type="number" label="เงินเดือนสูงสุด" value={careerForm.maximumSalary?.toString()} onValueChange={v => setCareerForm(f => ({ ...f, maximumSalary: parseInt(v) || 0 }))} startContent={<span className="text-gray-400 text-sm">฿</span>} classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-none" }} />
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1">ระดับความต้องการตลาด</label>
                                        <select
                                            className="h-10 px-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-sm text-gray-700 dark:text-gray-200 outline-none"
                                            value={careerForm.demandLevel}
                                            onChange={e => setCareerForm(f => ({ ...f, demandLevel: e.target.value as 'high' | 'medium' | 'low' }))}
                                        >
                                            <option value="high">สูง (เติบโตเร็ว)</option>
                                            <option value="medium">ปานกลาง (คงที่)</option>
                                            <option value="low">ต่ำ (เฉพาะทาง)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onCareerModalClose}>ยกเลิก</Button>
                        <Button className="bg-[#F2B33D] text-white font-medium shadow-sm shadow-[#F2B33D]/30" onPress={saveCareer} isLoading={saving}>บันทึกข้อมูล</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={onDeleteModalClose}
                onConfirm={deleteCareer}
                title="ยืนยันการลบ"
                description={`คุณต้องการลบอาชีพ ${selectedCareer?.nameTh} ออกจากระบบอย่างถาวรใช่หรือไม่?`}
                confirmLabel="ลบอาชีพถาวร"
                variant="danger"
            />

            {/* Reseed Modal */}
            <ConfirmModal
                isOpen={isReseedModalOpen}
                onClose={onReseedModalClose}
                onConfirm={async () => {
                    try {
                        setIsReseeding(true);
                        await fetch('/api/admin/holland-careers/seed', { method: 'POST' });
                        toast.success('Reseed ข้อมูลสำเร็จ');
                        fetchHollandCareers();
                        onReseedModalClose();
                    } catch {
                        toast.error('เกิดข้อผิดพลาดในการ Reseed ข้อมูล');
                    } finally {
                        setIsReseeding(false);
                    }
                }}
                title="Reseed ข้อมูลอาชีพมาตรฐาน"
                description="ต้องการรีเซ็ตข้อมูลอาชีพมาตรฐาน 30 อาชีพใหม่หรือไม่? (ข้อมูลเดิมที่แก้ไขเองจะถูกลบทั้งหมด)"
                confirmLabel="ยืนยัน Reseed"
                variant="warning"
                isLoading={isReseeding}
            />
        </>
    );
}
