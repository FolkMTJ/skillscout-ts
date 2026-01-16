// src/components/profile/ProfileModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Avatar,
  Tabs,
  Tab,
  Divider,
} from '@heroui/react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiUpload, FiTrash2, FiAlertCircle, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { User } from '@/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: () => void;
}

export default function ProfileModal({ isOpen, onClose, user, onUpdate }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState('profile');
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
      setShowDeleteConfirm(false);
    }
  }, [isOpen, user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', 'skillscout');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error('Cloudinary not configured');
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formDataUpload,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setFormData({ ...formData, profileImage: data.secure_url });
      toast.success('อัปโหลดรูปภาพสำเร็จ');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, profileImage: '' });
    toast.success('ลบรูปภาพแล้ว');
  };

  const handleUpdateProfile = async () => {
    if (!formData.name.trim()) {
      toast.error('กรุณากรอกชื่อ');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('อัปเดตโปรไฟล์สำเร็จ');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/user/profile`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      toast.success('ลบบัญชีสำเร็จ');

      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('เกิดข้อผิดพลาดในการลบบัญชี');
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      backdrop="blur" // เพิ่ม Blur ให้พื้นหลังดูทันสมัย
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        }
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-default-100 p-6 bg-content1/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F2B33D]/10 rounded-lg text-[#F2B33D]">
                  <FiUser className="text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-default-900">จัดการโปรไฟล์</h2>
                  <p className="text-sm text-default-500">แก้ไขข้อมูลส่วนตัวและการตั้งค่าบัญชีของคุณ</p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="p-0"> {/* Reset padding for Tabs to fit nicely */}
              <Tabs
                aria-label="Profile tabs"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key.toString())}
                // color="primary"
                variant="underlined"
                classNames={{
                  tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider px-6 bg-content1",
                  cursor: "w-full bg-[#F2B33D]",
                  tab: "max-w-fit px-2 h-12 text-default-500",
                  tabContent: "group-data-[selected=true]:text-[#F2B33D] font-medium"
                }}
              >
                {/* --- TAB: PROFILE --- */}
                <Tab
                  key="profile"
                  title={
                    <div className="flex items-center space-x-2">
                      <FiUser />
                      <span>โปรไฟล์</span>
                    </div>
                  }
                >
                  <div className="space-y-6 p-6">
                    {/* Profile Image Section - Centered & Clean */}
                    <div className="flex flex-col items-center gap-5">
                      <div className="relative group">
                        <Avatar
                          src={formData.profileImage}
                          name={formData.name}
                          className="w-32 h-32 text-4xl shadow-lg transition-transform group-hover:scale-105 bg-[#F2B33D]"
                          isBordered
                        />
                        <button
                          className="absolute bottom-0 right-0 p-2 bg-content1 rounded-full shadow-md border border-default-200 text-default-600 hover:text-primary transition-colors"
                          onClick={() => document.getElementById('profile-image-upload')?.click()}
                          title="เปลี่ยนรูปโปรไฟล์"
                        >
                          <FiUpload size={18} />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        {/* Hidden Input */}
                        <input
                          id="profile-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        {formData.profileImage && (
                          <Button
                            size="sm"
                            color="danger"
                            variant="light"
                            startContent={<FiTrash2 />}
                            onPress={handleRemoveImage}
                            className="text-danger-500"
                          >
                            ลบรูปภาพ
                          </Button>
                        )}
                      </div>
                    </div>

                    <Divider className="my-2" />

                    {/* Form Inputs - Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input
                        label="ชื่อ-นามสกุล"
                        placeholder="ชื่อที่ใช้แสดงในระบบ"
                        value={formData.name}
                        onValueChange={(v) => setFormData({ ...formData, name: v })}
                        startContent={<FiUser className="text-default-400" />}
                        variant="bordered"
                        isRequired
                        classNames={{ inputWrapper: "bg-content1" }}
                      />
                      <Input
                        label="อีเมล"
                        value={user.email}
                        startContent={<FiMail className="text-default-400" />}
                        isDisabled
                        variant="flat"
                        className="opacity-75"
                        description="อีเมลไม่สามารถเปลี่ยนแปลงได้"
                      />
                      <Input
                        label="เบอร์โทรศัพท์"
                        placeholder="0xx-xxx-xxxx"
                        value={formData.phone}
                        onValueChange={(v) => setFormData({ ...formData, phone: v })}
                        startContent={<FiPhone className="text-default-400" />}
                        variant="bordered"
                      />
                      <Input
                        label="Line ID"
                        placeholder="@line_id"
                        value={formData.lineId}
                        onValueChange={(v) => setFormData({ ...formData, lineId: v })}
                        startContent={<span className="text-default-400 text-sm font-bold">LINE</span>}
                        variant="bordered"
                      />
                    </div>

                    <Textarea
                      label="แนะนำตัว"
                      placeholder="เขียนแนะนำตัวสั้นๆ ให้เรารู้จักคุณมากขึ้น..."
                      value={formData.bio}
                      onValueChange={(v) => setFormData({ ...formData, bio: v })}
                      minRows={3}
                      variant="bordered"
                    />

                    {user.role === 'organizer' && (
                      <Input
                        label="องค์กร / หน่วยงาน"
                        placeholder="ระบุชื่อหน่วยงาน"
                        value={formData.organization}
                        onValueChange={(v) => setFormData({ ...formData, organization: v })}
                        variant="bordered"
                        description="สำหรับผู้จัดกิจกรรม"
                      />
                    )}
                  </div>
                </Tab>

                {/* --- TAB: ADDRESS --- */}
                <Tab
                  key="address"
                  title={
                    <div className="flex items-center space-x-2">
                      <FiMapPin />
                      <span>ที่อยู่</span>
                    </div>
                  }
                >
                  <div className="space-y-5 p-6">
                    <div className="p-4 bg-default-50 rounded-lg border border-dashed border-default-200 flex gap-3 items-start">
                      <FiInfo className="text-[#F2B33D] mt-1 flex-shrink-0" />
                      <p className="text-sm text-default-500">ข้อมูลที่อยู่จะถูกใช้สำหรับการจัดส่งเอกสารหรือของรางวัล (ถ้ามี) กรุณาระบุให้ชัดเจน</p>
                    </div>

                    <Input
                      label="ที่อยู่"
                      placeholder="บ้านเลขที่, หมู่, ซอย, ถนน"
                      value={formData.address}
                      onValueChange={(v) => setFormData({ ...formData, address: v })}
                      startContent={<FiMapPin className="text-default-400" />}
                      variant="bordered"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input
                        label="จังหวัด"
                        placeholder="ระบุจังหวัด"
                        value={formData.province}
                        onValueChange={(v) => setFormData({ ...formData, province: v })}
                        variant="bordered"
                      />
                      <Input
                        label="อำเภอ / เขต"
                        placeholder="ระบุอำเภอ"
                        value={formData.district}
                        onValueChange={(v) => setFormData({ ...formData, district: v })}
                        variant="bordered"
                      />
                    </div>
                  </div>
                </Tab>

                {/* --- TAB: DANGER ZONE --- */}
                <Tab
                  key="danger"
                  title={
                    <div className="flex items-center space-x-2 text-danger">
                      <FiAlertCircle />
                      <span>ลบบัญชี</span>
                    </div>
                  }
                >
                  <div className="p-6">
                    <div className="border border-danger-200 bg-danger-50 dark:bg-danger-900/10 rounded-xl p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-danger-100 dark:bg-danger-900/30 rounded-full text-danger-600">
                          <FiTrash2 size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-danger-700 dark:text-danger-400 mb-2">
                            ต้องการลบบัญชีถาวรใช่ไหม?
                          </h3>
                          <p className="text-sm text-danger-600/80 dark:text-danger-300 mb-4 leading-relaxed">
                            การดำเนินการนี้จะลบข้อมูลทั้งหมดของคุณออกจากระบบ <strong>ไม่สามารถกู้คืนได้</strong>
                            <br />สิ่งที่ได้รับผลกระทบ: โปรไฟล์, ประวัติกิจกรรม, และข้อมูลการชำระเงิน
                          </p>

                          <Divider className="my-4 bg-danger-200/50" />

                          {!showDeleteConfirm ? (
                            <Button
                              color="danger"
                              variant="flat"
                              onPress={() => setShowDeleteConfirm(true)}
                              className="font-medium"
                            >
                              ฉันเข้าใจ, ดำเนินการลบบัญชี
                            </Button>
                          ) : (
                            <div className="animate-appearance-in bg-white dark:bg-black/20 p-4 rounded-lg border border-danger-100">
                              <p className="text-sm font-semibold text-danger-600 mb-3">
                                ยืนยันครั้งสุดท้าย: คุณแน่ใจหรือไม่?
                              </p>
                              <div className="flex gap-3">
                                <Button
                                  color="danger"
                                  variant="solid"
                                  onPress={handleDeleteAccount}
                                  isLoading={isLoading}
                                  className="shadow-lg shadow-danger/20"
                                >
                                  ยืนยันลบถาวร
                                </Button>
                                <Button
                                  variant="light"
                                  onPress={() => setShowDeleteConfirm(false)}
                                >
                                  ยกเลิก
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </ModalBody>

            <ModalFooter className="border-t border-default-100 px-6 py-4">
              <Button variant="light" onPress={onClose} className="font-medium text-default-500">
                ยกเลิก
              </Button>
              {activeTab !== 'danger' && (
                <Button
                  // color="primary"
                  className="shadow-lg shadow-[#F2B33D]/30 font-medium bg-[#F2B33D]"
                  onPress={handleUpdateProfile}
                  isLoading={isLoading}
                >
                  บันทึกการเปลี่ยนแปลง
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
