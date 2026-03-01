// src/components/profile/ProfileModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalContent, Button, Input, Textarea } from '@heroui/react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiUpload, FiTrash2, FiAlertCircle, FiInfo, FiX, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { User } from '@/types';
import Image from 'next/image';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: () => void;
}

type TabKey = 'profile' | 'address' | 'danger';

const TABS: { key: TabKey; label: string; icon: typeof FiUser; danger?: boolean }[] = [
  { key: 'profile', label: 'โปรไฟล์', icon: FiUser },
  { key: 'address', label: 'ที่อยู่', icon: FiMapPin },
  { key: 'danger', label: 'ลบบัญชี', icon: FiAlertCircle, danger: true },
];

const inp = {
  inputWrapper: 'border border-gray-200 hover:border-[#F2B33D] focus-within:!border-[#F2B33D] !bg-white rounded-xl h-12',
  label: 'font-medium text-gray-500 text-xs pb-0.5',
  input: 'text-sm text-[#2C2C2C] font-medium',
};

export default function ProfileModal({ isOpen, onClose, user, onUpdate }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || '',
    lineId: user.lineId || '',
    bio: user.bio || '',
    organization: user.organization || '',
    address: user.address || '',
    province: user.province || '',
    district: user.district || '',
    profileImage: user.profileImage || '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name, phone: user.phone || '', lineId: user.lineId || '',
        bio: user.bio || '', organization: user.organization || '',
        address: user.address || '', province: user.province || '',
        district: user.district || '', profileImage: user.profileImage || '',
      });
      setShowDeleteConfirm(false);
      setActiveTab('profile');
    }
  }, [isOpen, user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('กรุณาเลือกไฟล์รูปภาพ'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB'); return; }
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file); fd.append('upload_preset', 'skillscout');
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) throw new Error('Cloudinary not configured');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData(prev => ({ ...prev, profileImage: data.secure_url }));
      toast.success('อัปโหลดรูปภาพสำเร็จ');
    } catch { toast.error('เกิดข้อผิดพลาดในการอัปโหลด'); }
    finally { setIsUploading(false); }
  };

  const handleUpdateProfile = async () => {
    if (!formData.name.trim()) { toast.error('กรุณากรอกชื่อ'); return; }
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      toast.success('อัปเดตโปรไฟล์สำเร็จ');
      onUpdate(); onClose();
    } catch { toast.error('เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์'); }
    finally { setIsLoading(false); }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/profile', { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('ลบบัญชีสำเร็จ');
      window.location.href = '/login';
    } catch { toast.error('เกิดข้อผิดพลาดในการลบบัญชี'); setIsLoading(false); }
  };

  const initials = formData.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <Modal
      isOpen={isOpen} onClose={onClose} size="2xl"
      scrollBehavior="normal" backdrop="opaque" hideCloseButton
      classNames={{ base: 'rounded-3xl overflow-hidden shadow-2xl', wrapper: '!z-[100]' }}
      motionProps={{
        variants: {
          enter: { y: 0, opacity: 1, transition: { duration: 0.22, ease: 'easeOut' } },
          exit: { y: -12, opacity: 0, transition: { duration: 0.16, ease: 'easeIn' } },
        }
      }}
    >
      <ModalContent>
        {(onModalClose) => (
          <div className="flex flex-col bg-white rounded-3xl overflow-hidden">

            {/* ─── HEADER ─── */}
            <div className="bg-[#2C2C2C] px-5 pt-5 pb-0 flex-shrink-0">
              {/* Top row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar mini — circular */}
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#F2B33D]/20 flex-shrink-0 ring-2 ring-[#F2B33D]">
                    {formData.profileImage ? (
                      <Image src={formData.profileImage} alt={formData.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#F2B33D] font-black text-sm">{initials}</div>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-0.5">ตั้งค่าบัญชี</p>
                    <h2 className="text-base font-black text-white leading-tight">{formData.name || 'โปรไฟล์'}</h2>
                  </div>
                </div>
                <button
                  onClick={onModalClose}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors flex-shrink-0"
                >
                  <FiX size={15} />
                </button>
              </div>

              {/* Tab strip */}
              <div className="flex gap-0.5">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-bold rounded-t-xl transition-all ${active
                        ? tab.danger ? 'bg-white text-red-500' : 'bg-white text-[#2C2C2C]'
                        : tab.danger
                          ? 'text-red-400/70 hover:bg-white/10 hover:text-red-400'
                          : 'text-white/50 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <Icon size={13} />{tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── BODY (fixed height = no size jump) ─── */}
            <div className="h-[460px] overflow-y-auto bg-white">

              {/* ── Profile Tab ── */}
              {activeTab === 'profile' && (
                <div className="p-5 space-y-4">

                  {/* Avatar row */}
                  <div className="flex items-center gap-4 py-3 px-4 bg-[#F2B33D]/6 rounded-2xl border border-[#F2B33D]/20">
                    <div className="relative flex-shrink-0">
                      {/* Circular avatar */}
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-[#F2B33D]/15 ring-3 ring-[#F2B33D]/50 ring-offset-2">
                        {formData.profileImage ? (
                          <Image src={formData.profileImage} alt={formData.name} width={64} height={64} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#F2B33D] font-black text-xl">{initials}</div>
                        )}
                      </div>
                      <button
                        className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-[#2C2C2C] rounded-full flex items-center justify-center text-white hover:bg-[#F2B33D] transition-colors shadow-md"
                        onClick={() => document.getElementById('profile-image-upload')?.click()}
                      >
                        <FiCamera size={11} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[#2C2C2C] text-base truncate">{formData.name || 'ยังไม่ได้ตั้งชื่อ'}</p>
                      <p className="text-xs text-gray-400 truncate mb-2">{user.email}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => document.getElementById('profile-image-upload')?.click()}
                          className="flex items-center gap-1 text-[11px] font-semibold text-[#2C2C2C] bg-[#F2B33D]/20 hover:bg-[#F2B33D]/35 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <FiUpload size={10} /> เปลี่ยนรูป
                        </button>
                        {formData.profileImage && (
                          <button
                            onClick={() => { setFormData(prev => ({ ...prev, profileImage: '' })); toast.success('ลบรูปแล้ว'); }}
                            className="flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <FiTrash2 size={10} /> ลบรูป
                          </button>
                        )}
                      </div>
                    </div>
                    <input id="profile-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>

                  {/* Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="ชื่อ-นามสกุล" placeholder="ชื่อที่ใช้แสดงในระบบ" isRequired
                      value={formData.name} onValueChange={v => setFormData(p => ({ ...p, name: v }))}
                      startContent={<FiUser size={14} className="text-gray-400" />}
                      variant="bordered" classNames={inp}
                    />
                    <Input
                      label="อีเมล" value={user.email} isDisabled
                      startContent={<FiMail size={14} className="text-gray-400" />}
                      variant="flat"
                      classNames={{ ...inp, inputWrapper: 'bg-gray-100 rounded-xl h-12 border border-transparent' }}
                    />
                    <Input
                      label="เบอร์โทรศัพท์" placeholder="0xx-xxx-xxxx"
                      value={formData.phone} onValueChange={v => setFormData(p => ({ ...p, phone: v }))}
                      startContent={<FiPhone size={14} className="text-gray-400" />}
                      variant="bordered" classNames={inp}
                    />
                    <Input
                      label="Line ID" placeholder="@line_id"
                      value={formData.lineId} onValueChange={v => setFormData(p => ({ ...p, lineId: v }))}
                      startContent={<span className="text-[11px] font-black text-[#06C755]">LINE</span>}
                      variant="bordered" classNames={inp}
                    />
                  </div>

                  <Textarea
                    label="แนะนำตัว" placeholder="เขียนแนะนำตัวสั้นๆ ให้เรารู้จักคุณมากขึ้น..."
                    value={formData.bio} onValueChange={v => setFormData(p => ({ ...p, bio: v }))}
                    minRows={2} maxRows={4} variant="bordered"
                    classNames={{ ...inp, inputWrapper: 'border border-gray-200 hover:border-[#F2B33D] focus-within:!border-[#F2B33D] !bg-white rounded-xl' }}
                  />

                  {user.role === 'organizer' && (
                    <Input
                      label="องค์กร / หน่วยงาน" placeholder="ระบุชื่อหน่วยงาน"
                      value={formData.organization} onValueChange={v => setFormData(p => ({ ...p, organization: v }))}
                      variant="bordered" classNames={inp}
                      description="สำหรับผู้จัดกิจกรรม"
                    />
                  )}
                </div>
              )}

              {/* ── Address Tab ── */}
              {activeTab === 'address' && (
                <div className="p-5 space-y-4">
                  {/* Info banner */}
                  <div className="flex gap-3 items-start bg-[#F2B33D]/8 border border-[#F2B33D]/25 rounded-2xl px-4 py-3">
                    <div className="w-7 h-7 rounded-full bg-[#F2B33D]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiInfo size={13} className="text-[#d49a28]" />
                    </div>
                    <p className="text-[13px] text-gray-600 leading-relaxed">
                      ข้อมูลที่อยู่จะถูกใช้สำหรับการจัดส่งเอกสารหรือของรางวัล (ถ้ามี)
                    </p>
                  </div>

                  <Input
                    label="ที่อยู่" placeholder="บ้านเลขที่, หมู่, ซอย, ถนน"
                    value={formData.address} onValueChange={v => setFormData(p => ({ ...p, address: v }))}
                    startContent={<FiMapPin size={14} className="text-gray-400" />}
                    variant="bordered" classNames={inp}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="จังหวัด" placeholder="ระบุจังหวัด"
                      value={formData.province} onValueChange={v => setFormData(p => ({ ...p, province: v }))}
                      variant="bordered" classNames={inp}
                    />
                    <Input
                      label="อำเภอ / เขต" placeholder="ระบุอำเภอ"
                      value={formData.district} onValueChange={v => setFormData(p => ({ ...p, district: v }))}
                      variant="bordered" classNames={inp}
                    />
                  </div>
                </div>
              )}

              {/* ── Delete Tab ── */}
              {activeTab === 'danger' && (
                <div className="p-5 space-y-4">
                  {/* Warning banner — same style as address tab info */}
                  <div className="flex gap-3 items-start bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiAlertCircle size={13} className="text-red-500" />
                    </div>
                    <p className="text-[13px] text-red-600 leading-relaxed">
                      การลบบัญชีจะลบข้อมูลทั้งหมดออกจากระบบอย่างถาวร <strong>ไม่สามารถกู้คืนได้</strong>
                    </p>
                  </div>

                  {/* What gets deleted */}
                  <div className="border border-gray-100 rounded-2xl divide-y divide-gray-50">
                    {[
                      { label: 'โปรไฟล์และข้อมูลส่วนตัว', icon: FiUser },
                      { label: 'ประวัติการสมัครค่าย', icon: FiMapPin },
                      { label: 'รีวิวและคะแนนที่เขียนไว้', icon: FiAlertCircle },
                    ].map(({ label, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-7 h-7 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                          <Icon size={13} className="text-gray-400" />
                        </div>
                        <span className="text-[13px] text-gray-600">{label}</span>
                        <FiTrash2 size={12} className="text-red-300 ml-auto flex-shrink-0" />
                      </div>
                    ))}
                  </div>

                  {/* Confirm dialog — shows when triggered from footer */}
                  {showDeleteConfirm && (
                    <div className="bg-[#2C2C2C] rounded-2xl p-4 space-y-3">
                      <p className="text-sm font-black text-white text-center">ยืนยันการลบบัญชีถาวร?</p>
                      <p className="text-[11px] text-white/50 text-center">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm" color="danger" variant="solid"
                          onPress={handleDeleteAccount} isLoading={isLoading}
                          className="flex-1 font-black h-10 text-sm"
                        >
                          ยืนยัน ลบถาวร
                        </Button>
                        <Button
                          size="sm" variant="flat"
                          onPress={() => setShowDeleteConfirm(false)}
                          className="flex-1 h-10 text-sm bg-white/10 text-white font-semibold"
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── FOOTER ─── */}
            <div className="flex-shrink-0 bg-white border-t border-gray-100 px-5 py-4 flex items-center justify-end gap-3">
              {activeTab === 'danger' ? (
                !showDeleteConfirm ? (
                  <Button
                    onPress={() => setShowDeleteConfirm(true)}
                    variant="bordered"
                    className="border-2 border-red-200 hover:border-red-400 text-red-500 hover:text-red-600 font-semibold px-7 h-11 rounded-2xl text-sm"
                  >
                    ดำเนินการลบบัญชี
                  </Button>
                ) : (
                  <div className="h-11" />
                )
              ) : (
                <Button
                  onPress={handleUpdateProfile} isLoading={isLoading}
                  className="bg-[#F2B33D] text-[#2C2C2C] font-black px-7 h-11 rounded-2xl shadow-md shadow-[#F2B33D]/25 hover:bg-[#e0a331] text-sm"
                >
                  บันทึกการเปลี่ยนแปลง
                </Button>
              )}
            </div>

          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
