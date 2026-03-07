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
    Checkbox
} from '@heroui/react';
import { FiTag, FiEdit2, FiTrash2, FiPlus, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ConfirmModal } from '@/components/common';

interface Tag {
    _id: string;
    id: string;
    nameEn: string;
    nameTh: string;
    category: string;
    riasecMapping: { code: string; weight: number }[];
    isCore: boolean;
    isActive: boolean;
    createdAt: string;
}

const TAG_CATEGORIES = {
    hard_skill: 'Hard Skills (ทักษะสายอาชีพ)',
    soft_skill: 'Soft Skills (ทักษะสังคม)',
    tool: 'Tools & Software (เครื่องมือ)',
    interest: 'Interests (ความสนใจ)',
    value: 'Work Values (คุณค่าในการทำงาน)'
};

export default function AdminTags() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [tagCategoryFilter, setTagCategoryFilter] = useState<string | null>(null);

    // Modal States
    const { isOpen: isTagModalOpen, onOpen: onTagModalOpen, onClose: onTagModalClose } = useDisclosure();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const { isOpen: isSeedModalOpen, onOpen: onSeedModalOpen, onClose: onSeedModalClose } = useDisclosure();
    const [isSeeding, setIsSeeding] = useState(false);

    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const [tagForm, setTagForm] = useState<Partial<Tag>>({
        id: '', nameEn: '', nameTh: '', category: 'hard_skill', isCore: false, isActive: true, riasecMapping: []
    });
    const [tagSaving, setTagSaving] = useState(false);

    const fetchTags = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/tags');
            const data = await res.json();
            if (data.tags) setTags(data.tags);
        } catch {
            toast.error('ไม่สามารถโหลดข้อมูล Tags ได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const openAddTag = () => {
        setSelectedTag(null);
        setTagForm({ id: '', nameEn: '', nameTh: '', category: 'hard_skill', isCore: false, isActive: true, riasecMapping: [] });
        onTagModalOpen();
    };

    const openEditTag = (tag: Tag) => {
        setSelectedTag(tag);
        setTagForm(tag);
        onTagModalOpen();
    };

    const saveTag = async () => {
        try {
            setTagSaving(true);
            if (!tagForm.id || !tagForm.nameEn || !tagForm.nameTh || !tagForm.category) {
                toast.error('กรุณากรอกข้อมูลบังคับให้ครบ (ID, ชื่อ TH/EN, หมวดหมู่)');
                return;
            }

            const duplicateId = tags.find(t => t.id === tagForm.id && t._id !== selectedTag?._id);
            if (duplicateId) {
                toast.error('ID นี้ถูกใช้งานแล้ว กรุณาใช้ ID อื่น');
                return;
            }

            const url = selectedTag ? `/api/admin/tags/${selectedTag._id}` : '/api/admin/tags';
            const method = selectedTag ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tagForm),
            });

            if (!res.ok) throw new Error();
            toast.success(selectedTag ? 'แก้ไข Tag สำเร็จ' : 'เพิ่ม Tag ใหม่สำเร็จ');
            onTagModalClose();
            fetchTags();
        } catch {
            toast.error('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setTagSaving(false);
        }
    };

    const toggleTagActive = async (tag: Tag) => {
        try {
            const res = await fetch(`/api/admin/tags/${tag._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !tag.isActive })
            });
            if (!res.ok) throw new Error();
            toast.success(!tag.isActive ? 'เปิดใช้งาน Tag แล้ว' : 'ปิดใช้งาน Tag แล้ว');
            fetchTags();
        } catch { toast.error('เกิดข้อผิดพลาด'); }
    };

    const deleteTag = async () => {
        if (!selectedTag) return;
        try {
            const res = await fetch(`/api/admin/tags/${selectedTag._id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            toast.success('ลบ Tag สำเร็จ');
            onDeleteModalClose();
            fetchTags();
        } catch { toast.error('ลบล้มเหลว'); }
    };

    const addRiasecMapping = () => {
        const current = tagForm.riasecMapping || [];
        setTagForm(f => ({
            ...f,
            riasecMapping: [...current, { code: 'R', weight: 5 }]
        }));
    };

    const updateRiasecMapping = (index: number, field: 'code' | 'weight', value: any) => {
        const newMapping = [...(tagForm.riasecMapping || [])];
        newMapping[index] = { ...newMapping[index], [field]: value };
        setTagForm(f => ({ ...f, riasecMapping: newMapping }));
    };

    const removeRiasecMapping = (index: number) => {
        const current = tagForm.riasecMapping || [];
        setTagForm(f => ({
            ...f,
            riasecMapping: current.filter((_, i) => i !== index)
        }));
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-zinc-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-zinc-700 animate-pulse max-w-7xl">
                <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded mb-6 w-full max-w-md" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (<div key={i} className="h-12 bg-gray-100 dark:bg-zinc-700/50 rounded-xl" />))}
                </div>
            </div>
        );
    }

    const filteredTags = tagCategoryFilter ? tags.filter(t => t.category === tagCategoryFilter) : tags;

    return (
        <>
            <div className="bg-white dark:bg-zinc-800 rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-zinc-700 animate-fade-in max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <FiTag className="text-teal-500" />
                            Tags & ทักษะ ({tags.length})
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">จัดการข้อมูล Tags และค่าน้ำหนัก RIASEC สำหรับการประเมินทักษะค่าย</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <div className="flex gap-1 flex-wrap shrink-0">
                            {Object.entries(TAG_CATEGORIES).map(([key, name]) => (
                                <button
                                    key={key}
                                    onClick={() => setTagCategoryFilter(tagCategoryFilter === key ? null : key)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${tagCategoryFilter === key
                                        ? 'bg-teal-500 border-teal-500 text-white shadow-md'
                                        : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-teal-400'
                                        }`}
                                >
                                    {name.split(' (')[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
                    <div className="flex gap-2 w-full justify-end">
                        <Button
                            size="md"
                            variant="flat"
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
                            onPress={onSeedModalOpen}
                        >
                            Seed ข้อมูลตัวอย่าง
                        </Button>
                        <Button className="bg-teal-500 text-white font-medium shadow-sm shadow-teal-500/30" startContent={<FiPlus />} onPress={openAddTag}>
                            เพิ่ม Tag ใหม่
                        </Button>
                    </div>
                </div>

                <div className="border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                    <Table aria-label="Tags Table" shadow="none" classNames={{ wrapper: "p-0 rounded-none shadow-none text-left" }}>
                        <TableHeader>
                            <TableColumn>ชื่อทักษะ / Tag</TableColumn>
                            <TableColumn>หมวดหมู่</TableColumn>
                            <TableColumn>RIASEC Weights</TableColumn>
                            <TableColumn>สถานะ</TableColumn>
                            <TableColumn>จัดการ</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="ไม่พบ Tag ในระบบ">
                            {filteredTags.map(tag => (
                                <TableRow key={tag._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    {/* ชื่อทักษะ */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0">
                                                <FiTag size={14} className="text-teal-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-100 leading-tight flex items-center gap-1.5">
                                                    {tag.nameTh}
                                                    {tag.isCore && <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Core</span>}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-mono mt-0.5 select-all">{tag.id}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    {/* หมวดหมู่ */}
                                    <TableCell>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                                            {TAG_CATEGORIES[tag.category as keyof typeof TAG_CATEGORIES]?.split(' (')[0] || tag.category}
                                        </span>
                                    </TableCell>
                                    {/* RIASEC Weights */}
                                    <TableCell>
                                        <div className="flex gap-1 flex-wrap">
                                            {tag.riasecMapping.length === 0
                                                ? <span className="text-xs text-gray-400 italic">—</span>
                                                : tag.riasecMapping.map((m, i) => (
                                                    <span key={i} className="inline-flex items-center gap-0.5 bg-gray-100 dark:bg-zinc-800 text-[10px] font-mono px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-zinc-700">
                                                        <strong className="text-teal-600 dark:text-teal-400">{m.code}</strong>
                                                        <span className="text-gray-400">×{m.weight}</span>
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    </TableCell>
                                    {/* สถานะ */}
                                    <TableCell>
                                        <button
                                            onClick={() => toggleTagActive(tag)}
                                            className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${tag.isActive ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-zinc-600'}`}
                                        >
                                            <span className={`inline-block w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${tag.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </TableCell>
                                    {/* จัดการ */}
                                    <TableCell>
                                        <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditTag(tag)}
                                                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-teal-50 hover:text-teal-600 text-gray-500 flex items-center justify-center transition-colors"
                                                title="แก้ไข"
                                            >
                                                <FiEdit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedTag(tag); onDeleteModalOpen(); }}
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
            <Modal isOpen={isTagModalOpen} onClose={onTagModalClose} size="2xl" scrollBehavior="inside" classNames={{ base: "bg-white dark:bg-zinc-900 rounded-[2rem]", header: "border-b border-gray-100 dark:border-zinc-800 px-6 py-4", body: "p-6", footer: "border-t border-gray-100 dark:border-zinc-800 px-6 py-4" }}>
                <ModalContent>
                    <ModalHeader className="gap-2 items-center flex">
                        <FiTag className="text-teal-500" />
                        <h3 className="font-bold text-gray-900 dark:text-white">{selectedTag ? 'แก้ไขข้อมูล Tag' : 'เพิ่ม Tag ใหม่'}</h3>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-6">

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Tag ID (ภาษาอังกฤษตัวพิมพ์เล็ก)"
                                        placeholder="e.g. react_js, leadership"
                                        value={tagForm.id}
                                        onValueChange={v => setTagForm(f => ({ ...f, id: v.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                                        isRequired
                                        isDisabled={!!selectedTag}
                                        classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-none" }}
                                        description={!selectedTag ? "ใช้ตัวอักษรพิมพ์เล็ก ตัวเลข และ _ เท่านั้น ห้ามแก้ไขหลังสร้าง" : "ID ไม่สามารถแก้ไขได้"}
                                    />
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1">หมวดหมู่ <span className="text-red-500">*</span></label>
                                        <select
                                            className="h-10 px-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-sm text-gray-700 dark:text-gray-200 outline-none"
                                            value={tagForm.category}
                                            onChange={e => setTagForm(f => ({ ...f, category: e.target.value }))}
                                        >
                                            {Object.entries(TAG_CATEGORIES).map(([key, name]) => (
                                                <option key={key} value={key}>{name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="ชื่อ Tag (TH)" placeholder="การเป็นผู้นำ" value={tagForm.nameTh} onValueChange={v => setTagForm(f => ({ ...f, nameTh: v }))} isRequired classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-none" }} />
                                    <Input label="ชื่อ Tag (EN)" placeholder="Leadership" value={tagForm.nameEn} onValueChange={v => setTagForm(f => ({ ...f, nameEn: v }))} isRequired classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-none" }} />
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <Checkbox
                                        isSelected={tagForm.isCore}
                                        onValueChange={v => setTagForm(f => ({ ...f, isCore: v }))}
                                    >
                                        <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">เป็น Core Skill (ทักษะหลักระดับสากล)</span>
                                    </Checkbox>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-3 mt-2 border-t border-gray-100 dark:border-zinc-800 pt-6">
                                    <div>
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                            RIASEC Weight Mapping
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">ตั้งค่าน้ำหนักความสัมพันธ์ของ Tag นี้กับคุณลักษณะ <span className="font-mono text-teal-600 font-bold">RIASEC</span></p>
                                    </div>
                                    <Button size="sm" color="default" variant="flat" onPress={addRiasecMapping} startContent={<FiPlus />}>
                                        เพิ่มตัวคูณ
                                    </Button>
                                </div>

                                {(!tagForm.riasecMapping || tagForm.riasecMapping.length === 0) ? (
                                    <div className="text-center py-6 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-gray-200 dark:border-zinc-700 text-sm text-gray-400">
                                        ยังไม่ได้ตั้งค่าน้ำหนัก (ผลประเมินจะไม่มีผลจาก Tag นี้)
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {tagForm.riasecMapping.map((mapping, idx) => (
                                            <div key={idx} className="flex gap-3 items-end p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700 border-l-4 border-l-teal-500">
                                                <div className="flex-1">
                                                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">ตัวอักษร RIASEC</label>
                                                    <select
                                                        className="w-full h-10 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-sm text-gray-700 dark:text-gray-200 outline-none"
                                                        value={mapping.code}
                                                        onChange={(e) => updateRiasecMapping(idx, 'code', e.target.value)}
                                                    >
                                                        <option value="R">R - Realistic (นักปฏิบัติ)</option>
                                                        <option value="I">I - Investigative (นักคิดวิเคราะห์)</option>
                                                        <option value="A">A - Artistic (ศิลปิน/ครีเอทีฟ)</option>
                                                        <option value="S">S - Social (ผู้ช่วยเหลือ/บริการสังคม)</option>
                                                        <option value="E">E - Enterprising (ผู้นำ/นักบริหาร)</option>
                                                        <option value="C">C - Conventional (นักจัดการระบบ)</option>
                                                    </select>
                                                </div>
                                                <div className="w-1/3">
                                                    <Input
                                                        type="number"
                                                        label="ค่าน้ำหนัก (1-10)"
                                                        labelPlacement="outside"
                                                        placeholder="e.g. 7"
                                                        min={1}
                                                        max={10}
                                                        value={mapping.weight.toString()}
                                                        onValueChange={(v) => {
                                                            const num = Math.min(10, Math.max(1, parseInt(v) || 1));
                                                            updateRiasecMapping(idx, 'weight', num);
                                                        }}
                                                    />
                                                </div>
                                                <Button isIconOnly color="danger" variant="light" onPress={() => removeRiasecMapping(idx)} className="h-10 mb-0.5">
                                                    <FiTrash2 />
                                                </Button>
                                            </div>
                                        ))}
                                        <div className="bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-600 text-xs p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex items-start gap-2">
                                            <FiAlertCircle className="mt-0.5 shrink-0 text-yellow-600" />
                                            <p>ถ้าน้ำหนักเยอะ (เช่น ยิ่งค่ายไหนมี Tag React JS ผู้เข้าร่วมจะได้ค่า I - Investigative และ C - Conventional เพิ่มเยอะ)</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onTagModalClose}>ยกเลิก</Button>
                        <Button className="bg-teal-500 text-white font-medium shadow-sm shadow-teal-500/30" onPress={saveTag} isLoading={tagSaving}>
                            {selectedTag ? 'อัปเดต Tag' : 'เพิ่ม Tag'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={onDeleteModalClose}
                onConfirm={deleteTag}
                title="ยืนยันการลบแบบมรณะ"
                description={`คุณต้องการลบ Tag ${selectedTag?.id} ออกจากระบบอย่างถาวรใช่หรือไม่? รายวิชาและค่ายต่างๆ ที่ใช้ Tag นี้จะได้รับผลกระทบทันที`}
                confirmLabel="ลบถาวร"
                variant="danger"
            />

            {/* Seed Confirm Modal */}
            <ConfirmModal
                isOpen={isSeedModalOpen}
                onClose={onSeedModalClose}
                onConfirm={async () => {
                    try {
                        setIsSeeding(true);
                        const res = await fetch('/api/admin/tags/seed', { method: 'POST' });
                        if (!res.ok) throw new Error();
                        toast.success('Seed ข้อมูลสำเร็จ');
                        fetchTags();
                        onSeedModalClose();
                    } catch {
                        toast.error('เกิดข้อผิดพลาดในการ Seed ข้อมูล');
                    } finally {
                        setIsSeeding(false);
                    }
                }}
                title="Seed ข้อมูล Tags มาตรฐาน"
                description="ต้องการเพิ่มข้อมูล Tags พื้นฐาน 20 ทักษะเข้าสู่ระบบหรือไม่? (เพื่อใช้งานระบบ AI Recommendation ทันที)"
                confirmLabel="ยืนยัน Seed ข้อมูล"
                variant="info"
                isLoading={isSeeding}
            />
        </>
    );
}
