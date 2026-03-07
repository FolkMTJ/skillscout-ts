'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Input,
    Button,
    Textarea,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from '@heroui/react';
import {
    FiMonitor,
    FiTrendingUp,
    FiSave,
    FiUsers,
    FiTag,
    FiBookOpen,
    FiPlus,
    FiTrash2,
    FiUpload,
    FiX,
    FiRefreshCw,
    FiEdit2
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { ConfirmModal } from '@/components/common';

interface Testimonial {
    id: number;
    name: string;
    camp: string;
    text: string;
    rating: number;
    avatar?: string;
}

export default function AdminSettings() {
    const { data: session } = useSession();

    // Settings State
    const [visitorOffset, setVisitorOffset] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [socialFacebook, setSocialFacebook] = useState('');
    const [socialTwitter, setSocialTwitter] = useState('');
    const [socialInstagram, setSocialInstagram] = useState('');
    const [socialLinkedin, setSocialLinkedin] = useState('');
    const [socialGithub, setSocialGithub] = useState('');
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

    // Platform Fee State
    const [platformEnabled, setPlatformEnabled] = useState(false);
    const [platformPromptpayId, setPlatformPromptpayId] = useState('');
    const [platformAccountName, setPlatformAccountName] = useState('');
    const [platformFeePercent, setPlatformFeePercent] = useState('5');
    const [platformModalOpen, setPlatformModalOpen] = useState(false);

    // Showcase Modes (Demo camps)
    const [showcaseMode, setShowcaseMode] = useState(true);
    const [showcaseCampCount, setShowcaseCampCount] = useState(0);

    // Loading States
    const [loading, setLoading] = useState(true);
    const [siteSaving, setSiteSaving] = useState(false);
    const [contactSaving, setContactSaving] = useState(false);
    const [socialSaving, setSocialSaving] = useState(false);
    const [testimonialsSaving, setTestimonialsSaving] = useState(false);
    const [showcaseSaving, setShowcaseSaving] = useState(false);
    const [platformSaving, setPlatformSaving] = useState(false);
    const [showcaseSeeding, setShowcaseSeeding] = useState(false);
    const [showcaseModalOpen, setShowcaseModalOpen] = useState(false);
    const [showcaseModalType, setShowcaseModalType] = useState<'seed' | 'clear'>('seed');
    const [uploadingAvatarIds, setUploadingAvatarIds] = useState<Record<number, boolean>>({});

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const [settingsRes, showcaseRes] = await Promise.all([
                fetch('/api/admin/settings'),
                fetch('/api/admin/showcase')
            ]);

            const s = await settingsRes.json();
            const showcaseData = await showcaseRes.json();

            setVisitorOffset(s.visitorOffset?.toString() || '');
            setContactEmail(s.contactEmail || '');
            setContactPhone(s.contactPhone || '');
            setSocialFacebook(s.socialFacebook || '');
            setSocialTwitter(s.socialTwitter || '');
            setSocialInstagram(s.socialInstagram || '');
            setSocialLinkedin(s.socialLinkedin || '');
            setSocialGithub(s.socialGithub || '');
            setTestimonials(s.testimonials || []);

            setPlatformEnabled(!!s.platformEnabled);
            setPlatformPromptpayId(s.platformPromptpayId || '');
            setPlatformAccountName(s.platformAccountName || '');
            setPlatformFeePercent(s.platformFeePercent?.toString() || '5');

            setShowcaseMode(s.showcaseMode ?? true);

            if (showcaseData.count !== undefined) {
                setShowcaseCampCount(showcaseData.count);
            }
        } catch {
            toast.error('โหลดตั้งค่าไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const saveSettings = async (payload: any, setSavingState: (s: boolean) => void, successMsg: string) => {
        try {
            setSavingState(true);
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error();
            toast.success(successMsg);
            return true;
        } catch {
            toast.error('บันทึกไม่สำเร็จ');
            return false;
        } finally {
            setSavingState(false);
        }
    };

    const saveSiteSettings = () => saveSettings({ visitorOffset: parseInt(visitorOffset) || 0 }, setSiteSaving, 'บันทึกตั้งค่าเว็บสำเร็จ');

    const saveContactSettings = () => saveSettings({ contactEmail, contactPhone }, setContactSaving, 'บันทึกข้อมูลติดต่อสำเร็จ');

    const saveSocialSettings = () => saveSettings({
        socialLinks: { facebook: socialFacebook, twitter: socialTwitter, instagram: socialInstagram, linkedin: socialLinkedin, github: socialGithub }
    }, setSocialSaving, 'บันทึกโซเชียลมีเดียสำเร็จ');

    const saveTestimonialsSettings = (newTestimonials: Testimonial[]) => saveSettings({ testimonials: newTestimonials }, setTestimonialsSaving, 'บันทึกรีวิวสำเร็จ');

    const savePlatformSettings = async () => {
        const isEnabled = platformPromptpayId.trim() !== '';
        const payload = {
            platformFee: {
                enabled: isEnabled,
                promptpayId: platformPromptpayId,
                accountName: platformAccountName,
                feePercent: parseFloat(platformFeePercent) || 5
            }
        };
        const success = await saveSettings(payload, setPlatformSaving, isEnabled ? 'เปิดใช้งาน Platform Fee สำเร็จ' : 'ลดสถานะ Platform Fee ปิดไว้');
        if (success) setPlatformEnabled(isEnabled);
    };

    const saveShowcaseSettings = async (newMode: boolean) => {
        setShowcaseSaving(true);
        const success = await saveSettings({ showcaseMode: newMode }, setShowcaseSaving, newMode ? 'แสดง Showcase' : 'ซ่อน Showcase');
        if (success) {
            try {
                await fetch('/api/admin/showcase', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ visible: newMode }),
                });
                setShowcaseMode(newMode);
                // Fetch just the count secretly without causing a full page reload spinner
                const countRes = await fetch('/api/admin/showcase');
                const countData = await countRes.json();
                if (countData.count !== undefined) {
                    setShowcaseCampCount(countData.count);
                }
            } catch (err) {
                console.error("Failed to sync camp statuses", err);
            }
        }
    };

    const seedShowcaseCamps = () => {
        setShowcaseModalType('seed');
        setShowcaseModalOpen(true);
    };

    const clearShowcaseCamps = () => {
        setShowcaseModalType('clear');
        setShowcaseModalOpen(true);
    };

    const confirmShowcaseAction = async () => {
        setShowcaseModalOpen(false);
        try {
            setShowcaseSeeding(true);
            const res = await fetch('/api/admin/showcase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    showcaseModalType === 'seed'
                        ? { action: 'seed', visible: showcaseMode }
                        : { action: 'clear' }
                ),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            toast.success(data.message || (showcaseModalType === 'seed' ? 'Seed สำเร็จ' : 'ลบสำเร็จ'));
            fetchSettings();
        } catch {
            toast.error(showcaseModalType === 'seed' ? 'Seed ล้มเหลว' : 'ลบล้มเหลว');
        } finally {
            setShowcaseSeeding(false);
        }
    };

    const handleAvatarUpload = async (file: File, tId: number) => {
        if (!file.type.startsWith('image/')) { toast.error('ต้องเป็นไฟล์รูปภาพเท่านั้น'); return; }
        if (file.size > 2 * 1024 * 1024) { toast.error('ไฟล์ต้องขนาดไม่เกิน 2MB'); return; }

        try {
            setUploadingAvatarIds(prev => ({ ...prev, [tId]: true }));
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('อัปโหลดล้มเหลว');
            const data = await res.json();

            setTestimonials(prev => prev.map(t => t.id === tId ? { ...t, avatar: data.url } : t));
            toast.success('อัปโหลดรูปสำเร็จ');
        } catch (error) {
            console.error(error);
            toast.error('อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่');
        } finally {
            setUploadingAvatarIds(prev => ({ ...prev, [tId]: false }));
        }
    };


    if (loading) {
        return (
            <div className="bg-white dark:bg-zinc-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-zinc-700 animate-pulse max-w-7xl">
                <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded mb-6 w-full max-w-md" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (<div key={i} className="h-32 bg-gray-100 dark:bg-zinc-700/50 rounded-xl" />))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl animate-fade-in pb-20">

            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">การตั้งค่าระบบ</h2>
            </div>

            {/* Showcase Demo Camps */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl border-2 border-dashed border-orange-200 dark:border-orange-900/40 p-5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2 text-yellow-500 dark:text-yellow-400">
                            <FiMonitor /> Showcase Mode (ค่ายตัวอย่าง)
                            <span className={`text-sm font-normal px-2 py-0.5 rounded-full ${showcaseCampCount > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                {showcaseCampCount} ค่าย
                            </span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">ค่าย IT พร้อมรีวิวจำลอง สำหรับทดลองใช้งานแพลตฟอร์ม</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{showcaseMode ? 'มองเห็น' : 'ซ่อนอยู่'}</span>
                            <button
                                onClick={() => saveShowcaseSettings(!showcaseMode)}
                                disabled={showcaseSaving || showcaseCampCount === 0}
                                className={`relative w-12 h-6 rounded-full transition-all duration-300 flex items-center disabled:opacity-40 ${showcaseMode ? 'bg-[#F2B33D]' : 'bg-gray-300'}`}
                                title={showcaseCampCount === 0 ? 'เพิ่มค่ายตัวอย่างก่อน' : (showcaseMode ? 'ซ่อน' : 'แสดง')}
                            >
                                <span className={`absolute w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${showcaseMode ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        <Button variant="flat" size="sm" onPress={fetchSettings} startContent={<FiRefreshCw />} isIconOnly />
                        {showcaseCampCount > 0 && (
                            <Button variant="flat" color="danger" size="sm" onPress={clearShowcaseCamps} isLoading={showcaseSeeding}>ลบทั้งหมด</Button>
                        )}
                        <Button color="warning" size="sm" onPress={seedShowcaseCamps} isLoading={showcaseSeeding} startContent={<FiPlus />}>
                            {showcaseCampCount > 0 ? 'Reseed' : 'เพิ่มค่ายตัวอย่าง'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Platform Fee Settings */}
            <div className={`rounded-2xl border-2 p-5 transition-all ${platformEnabled ? 'border-green-300 bg-green-50/30' : 'border-gray-200 bg-white dark:bg-zinc-800'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${platformEnabled ? 'bg-green-100' : 'bg-gray-100 dark:bg-zinc-900'}`}>
                            <FiTrendingUp size={18} className={platformEnabled ? 'text-green-600' : 'text-gray-400'} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100">Platform Fee</h3>
                                {platformEnabled
                                    ? <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">เปิดใช้งาน</span>
                                    : <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full">ปิดอยู่</span>
                                }
                            </div>
                            {platformEnabled ? (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {platformAccountName} · {platformPromptpayId} · หัก <span className="font-semibold text-green-600">{platformFeePercent}%</span>
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400 mt-0.5">QR ชี้ตรงหา Organizer (ไม่มีรายได้ platform)</p>
                            )}
                        </div>
                    </div>
                    <Button size="sm" variant="flat" className="font-semibold" onPress={() => setPlatformModalOpen(true)} startContent={<FiEdit2 size={13} />}>
                        ตั้งค่า
                    </Button>
                </div>
            </div>

            {/* General Settings */}
            <div className="rounded-2xl border border-gray-100 bg-white dark:bg-zinc-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2"><FiMonitor className="text-gray-400" /> ตั้งค่าเว็บไซต์</h3>
                        <p className="text-sm text-gray-500 mt-0.5">จำนวนผู้เข้าชมและการแสดงผล</p>
                    </div>
                    <Button className="bg-[#F2B33D] text-white font-semibold" size="sm" onPress={saveSiteSettings} isLoading={siteSaving} startContent={!siteSaving && <FiSave size={14} />}>
                        บันทึก
                    </Button>
                </div>
                <div className="max-w-xs">
                    <Input
                        label="Visitor Offset"
                        placeholder="59"
                        value={visitorOffset}
                        onValueChange={(v) => setVisitorOffset(v.replace(/\D/g, ''))}
                        description="ตัวเลข+เพิ่มกับคนเข้าชมจริง"
                        classNames={{ inputWrapper: 'bg-white border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700' }}
                    />
                </div>

                {/* Contacts */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2"><FiUsers className="text-gray-400" /> ช่องทางการติดต่อ</h3>
                            <p className="text-sm text-gray-500 mt-0.5">แสดงข้อมูลติดต่อในส่วน Footer</p>
                        </div>
                        <Button className="bg-[#F2B33D] text-white font-semibold" size="sm" onPress={saveContactSettings} isLoading={contactSaving} startContent={!contactSaving && <FiSave size={14} />}>
                            บันทึก
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="อีเมลติดต่อ" placeholder="contact@skillscout.com" value={contactEmail} onValueChange={setContactEmail} classNames={{ inputWrapper: 'bg-white border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700' }} />
                        <Input label="เบอร์โทรศัพท์" placeholder="02-xxx-xxxx" value={contactPhone} onValueChange={setContactPhone} classNames={{ inputWrapper: 'bg-white border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700' }} />
                    </div>
                </div>

                {/* Social */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2"><FiTag className="text-gray-400" /> โซเชียลมีเดีย</h3>
                        </div>
                        <Button className="bg-[#F2B33D] text-white font-semibold" size="sm" onPress={saveSocialSettings} isLoading={socialSaving} startContent={!socialSaving && <FiSave size={14} />}>
                            บันทึก
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="Facebook" value={socialFacebook} onValueChange={setSocialFacebook} classNames={{ inputWrapper: 'bg-white border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700' }} />
                        <Input label="Twitter / X" value={socialTwitter} onValueChange={setSocialTwitter} classNames={{ inputWrapper: 'bg-white border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700' }} />
                        <Input label="Instagram" value={socialInstagram} onValueChange={setSocialInstagram} classNames={{ inputWrapper: 'bg-white border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700' }} />
                        <Input label="LinkedIn" value={socialLinkedin} onValueChange={setSocialLinkedin} classNames={{ inputWrapper: 'bg-white border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700' }} />
                        <Input label="GitHub" value={socialGithub} onValueChange={setSocialGithub} classNames={{ inputWrapper: 'bg-white border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700' }} />
                    </div>
                </div>

                {/* Testimonials */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2"><FiBookOpen className="text-gray-400" /> รีวิวหน้าแรก (Testimonials)</h3>
                        </div>
                        <div className="flex gap-2">
                            <Button color="success" variant="flat" size="sm" onPress={() => setTestimonials([...testimonials, { id: Date.now(), name: '', camp: '', text: '', rating: 5, avatar: '' }])} startContent={<FiPlus size={14} />}>เพิ่มรีวิว</Button>
                            <Button className="bg-[#F2B33D] text-white font-semibold" size="sm" onPress={() => saveTestimonialsSettings(testimonials)} isLoading={testimonialsSaving} startContent={!testimonialsSaving && <FiSave size={14} />}>บันทึก</Button>
                        </div>
                    </div>

                    {testimonials.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">ยังไม่มีข้อมูลรีวิว</div>
                    ) : (
                        <div className="space-y-4">
                            {testimonials.map((t, index) => (
                                <div key={t.id || index} className="p-4 border border-gray-200 dark:border-zinc-700 rounded-xl relative group">
                                    <Button isIconOnly size="sm" color="danger" variant="light" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onPress={() => setTestimonials(testimonials.filter((_, i) => i !== index))}>
                                        <FiTrash2 size={16} />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <Input label="ชื่อผู้รีวิว" value={t.name} onValueChange={(val) => setTestimonials(testimonials.map((x, i) => i === index ? { ...x, name: val } : x))} size="sm" />
                                        <Input label="ชื่อค่าย" value={t.camp} onValueChange={(val) => setTestimonials(testimonials.map((x, i) => i === index ? { ...x, camp: val } : x))} size="sm" />
                                        <Input label="คะแนน (1-5)" type="number" min={1} max={5} value={t.rating?.toString()} onValueChange={(val) => setTestimonials(testimonials.map((x, i) => i === index ? { ...x, rating: parseFloat(val) || 5 } : x))} size="sm" />

                                        <div className="relative w-full h-[48px] bg-[#f4f4f5] dark:bg-zinc-800 hover:bg-[#e4e4e7] dark:hover:bg-zinc-700 transition-colors rounded-[12px] px-3 flex flex-col justify-center shrink-0">
                                            <label className="text-[12px] text-gray-500 font-medium leading-[14px] pointer-events-none select-none mt-1">รูปโปรไฟล์</label>
                                            <div className="w-full flex items-center justify-between mt-[2px] h-[20px] mb-1">
                                                {t.avatar ? (
                                                    <div className="flex items-center gap-2 w-full z-20">
                                                        <Image src={t.avatar} alt="Avatar" width={16} height={16} className="w-4 h-4 rounded-full object-cover shadow-sm bg-white shrink-0" />
                                                        <p className="text-sm text-green-600 font-medium flex-1 truncate leading-none">อัปโหลดแล้ว</p>
                                                        <button onClick={() => setTestimonials(testimonials.map((x, i) => i === index ? { ...x, avatar: '' } : x))} className="text-gray-400 hover:text-red-500 transition-colors p-1" type="button" title="ลบภาพ"><FiX size={14} /></button>
                                                    </div>
                                                ) : (
                                                    <div className="relative w-full flex items-center gap-2 cursor-pointer h-full group/up">
                                                        <input type="file" accept="image/jpeg, image/png, image/webp" className="absolute inset-0 w-[200%] h-[48px] -top-6 -left-3 opacity-0 cursor-pointer z-10" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleAvatarUpload(file, t.id); }} disabled={uploadingAvatarIds[t.id]} />
                                                        {uploadingAvatarIds[t.id] ? <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 border-t-[#F2B33D] animate-spin" /> : <FiUpload className="text-gray-400" size={14} />}
                                                        <span className="text-sm text-gray-600">เลือกรูป 1:1</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                    <Textarea label="เนื้อหารีวิว" value={t.text} onValueChange={(val) => setTestimonials(testimonials.map((x, i) => i === index ? { ...x, text: val } : x))} minRows={2} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Platform Fee Modal */}
            <Modal isOpen={platformModalOpen} onClose={() => setPlatformModalOpen(false)} size="sm" classNames={{ base: 'bg-white dark:bg-zinc-900 rounded-3xl', header: 'border-b border-gray-100 dark:border-zinc-800 px-5 py-4', body: 'p-5', footer: 'border-t border-gray-100 dark:border-zinc-800 px-5 py-4 bg-gray-50 dark:bg-zinc-900' }}>
                <ModalContent>
                    <ModalHeader>
                        <div className="flex items-center gap-2"><FiTrendingUp className="text-[#F2B33D]" /><h3 className="text-base font-bold text-gray-900 dark:text-white">ตั้งค่า Platform Fee</h3></div>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-3">
                            <div className={`rounded-xl p-3 text-xs ${platformEnabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500 dark:bg-zinc-800'}`}>
                                {platformPromptpayId ? `เปิดใช้งาน — QR จะชี้มา SkillScout, หัก ${platformFeePercent || '5'}%` : 'ปล่อย PromptPay ว่างเพื่อปิดระบบ Platform Fee'}
                            </div>
                            <Input label="PromptPay ID (เบอร์หรือเลขบัตรประชาชน)" placeholder="0812345678 — ว่างเปล่า = ปิด" value={platformPromptpayId} onValueChange={(v) => setPlatformPromptpayId(v.replace(/\D/g, '').slice(0, 13))} classNames={{ inputWrapper: 'bg-gray-50 border-none dark:bg-zinc-800' }} />
                            <Input label="ชื่อบัญชี (แสดงใน QR)" placeholder="SkillScout" value={platformAccountName} onValueChange={setPlatformAccountName} classNames={{ inputWrapper: 'bg-gray-50 border-none dark:bg-zinc-800' }} />
                            <Input label="Fee % (0–30)" placeholder="5" value={platformFeePercent} onValueChange={(v) => setPlatformFeePercent(v.replace(/[^0-9.]/g, ''))} endContent={<span className="text-gray-400 text-sm">%</span>} classNames={{ inputWrapper: 'bg-gray-50 border-none dark:bg-zinc-800' }} />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" className="text-gray-500" onPress={() => setPlatformModalOpen(false)}>ยกเลิก</Button>
                        <Button className="bg-[#F2B33D] text-white font-semibold" isLoading={platformSaving} startContent={!platformSaving && <FiSave size={15} />} onPress={async () => { await savePlatformSettings(); setPlatformModalOpen(false); }}>บันทึก</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Showcase Confirm Modal */}
            <ConfirmModal
                isOpen={showcaseModalOpen}
                onClose={() => setShowcaseModalOpen(false)}
                onConfirm={confirmShowcaseAction}
                title={showcaseModalType === 'seed' ? 'Seed ค่ายตัวอย่าง 20 ค่าย' : 'ลบค่ายตัวอย่างทั้งหมด'}
                description={
                    showcaseModalType === 'seed'
                        ? 'ระบบจะสร้างค่ายตัวอย่าง 20 ค่าย พร้อมรีวิวจำลอง เพื่อให้ระบบ AI Recommendation ทำงานได้ทันที'
                        : `ค่ายตัวอย่าง ${showcaseCampCount} ค่ายจะถูกลบออกจากระบบอย่างถาวร ไม่สามารถย้อนกลับได้`
                }
                confirmLabel={showcaseModalType === 'seed' ? 'ยืนยัน Seed' : 'ยืนยันลบทั้งหมด'}
                variant={showcaseModalType === 'seed' ? 'info' : 'danger'}
                isLoading={showcaseSeeding}
            />

        </div>
    );
}
