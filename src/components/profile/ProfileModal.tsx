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
import { FiUser, FiMail, FiPhone, FiMapPin, FiUpload, FiTrash2, FiAlertCircle } from 'react-icons/fi';
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
  const [isUploading, setIsUploading] = useState(false);
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
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b">
              <h2 className="text-2xl font-bold">จัดการโปรไฟล์</h2>
              <p className="text-sm text-gray-500">แก้ไขข้อมูลส่วนตัวและการตั้งค่าบัญชี</p>
            </ModalHeader>

            <ModalBody className="py-6">
              <Tabs
                aria-label="Profile tabs"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key.toString())}
                classNames={{
                  tabList: 'gap-6 w-full relative rounded-none p-0 border-b border-divider',
                  cursor: 'w-full bg-primary',
                  tab: 'max-w-fit px-0 h-12',
                }}
              >
                <Tab key="profile" title="โปรไฟล์">
                  <div className="space-y-6 py-4">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center gap-4">
                      <Avatar
                        src={formData.profileImage}
                        name={formData.name}
                        className="w-32 h-32 text-4xl"
                        isBordered
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          startContent={<FiUpload />}
                          isLoading={isUploading}
                          onPress={() => document.getElementById('profile-image-upload')?.click()}
                        >
                          อัปโหลดรูปภาพ
                        </Button>
                        {formData.profileImage && (
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            startContent={<FiTrash2 />}
                            onPress={handleRemoveImage}
                          >
                            ลบรูปภาพ
                          </Button>
                        )}
                      </div>
                      <input
                        id="profile-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>

                    <Divider />

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="ชื่อ-นามสกุล"
                        placeholder="กรอกชื่อ-นามสกุล"
                        value={formData.name}
                        onValueChange={(v) => setFormData({ ...formData, name: v })}
                        startContent={<FiUser className="text-gray-400" />}
                        isRequired
                      />
                      <Input
                        label="อีเมล"
                        value={user.email}
                        startContent={<FiMail className="text-gray-400" />}
                        isDisabled
                        description="ไม่สามารถเปลี่ยนแปลงอีเมลได้"
                      />
                      <Input
                        label="เบอร์โทรศัพท์"
                        placeholder="กรอกเบอร์โทรศัพท์"
                        value={formData.phone}
                        onValueChange={(v) => setFormData({ ...formData, phone: v })}
                        startContent={<FiPhone className="text-gray-400" />}
                      />
                      <Input
                        label="Line ID"
                        placeholder="กรอก Line ID"
                        value={formData.lineId}
                        onValueChange={(v) => setFormData({ ...formData, lineId: v })}
                      />
                    </div>

                    {/* Bio */}
                    <Textarea
                      label="แนะนำตัว"
                      placeholder="เขียนแนะนำตัวสั้นๆ"
                      value={formData.bio}
                      onValueChange={(v) => setFormData({ ...formData, bio: v })}
                      minRows={3}
                    />

                    {/* Organization */}
                    {user.role === 'organizer' && (
                      <Input
                        label="องค์กร / หน่วยงาน"
                        placeholder="กรอกชื่อองค์กรหรือหน่วยงาน"
                        value={formData.organization}
                        onValueChange={(v) => setFormData({ ...formData, organization: v })}
                      />
                    )}
                  </div>
                </Tab>

                <Tab key="address" title="ที่อยู่">
                  <div className="space-y-4 py-4">
                    <Input
                      label="ที่อยู่"
                      placeholder="กรอกที่อยู่"
                      value={formData.address}
                      onValueChange={(v) => setFormData({ ...formData, address: v })}
                      startContent={<FiMapPin className="text-gray-400" />}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="จังหวัด"
                        placeholder="กรอกจังหวัด"
                        value={formData.province}
                        onValueChange={(v) => setFormData({ ...formData, province: v })}
                      />
                      <Input
                        label="อำเภอ / เขต"
                        placeholder="กรอกอำเภอหรือเขต"
                        value={formData.district}
                        onValueChange={(v) => setFormData({ ...formData, district: v })}
                      />
                    </div>
                  </div>
                </Tab>

                <Tab key="danger" title="ลบบัญชี">
                  <div className="space-y-6 py-4">
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <FiAlertCircle className="text-red-500 text-2xl flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
                            ลบบัญชีถาวร
                          </h3>
                          <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                            การลบบัญชีเป็นการดำเนินการที่<strong>ไม่สามารถย้อนกลับได้</strong> 
                            ข้อมูลทั้งหมดของคุณจะถูกลบออกจากระบบอย่างถาวร รวมถึง:
                          </p>
                          <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300 space-y-1 mb-6">
                            <li>ข้อมูลโปรไฟล์ทั้งหมด</li>
                            <li>ประวัติการสมัครค่าย</li>
                            <li>รีวิวและความคิดเห็นที่เคยเขียน</li>
                            <li>ข้อมูลการชำระเงิน</li>
                          </ul>

                          {!showDeleteConfirm ? (
                            <Button
                              color="danger"
                              variant="solid"
                              startContent={<FiTrash2 />}
                              onPress={() => setShowDeleteConfirm(true)}
                            >
                              ยืนยันการลบบัญชี
                            </Button>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-sm font-semibold text-red-700 dark:text-red-200">
                                คุณแน่ใจหรือไม่ที่จะลบบัญชีของคุณ?
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  color="danger"
                                  variant="solid"
                                  startContent={<FiTrash2 />}
                                  onPress={handleDeleteAccount}
                                  isLoading={isLoading}
                                >
                                  ยืนยันลบบัญชี
                                </Button>
                                <Button
                                  variant="flat"
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

            <ModalFooter className="border-t">
              <Button variant="flat" onPress={onClose}>
                ยกเลิก
              </Button>
              {activeTab !== 'danger' && (
                <Button
                  color="primary"
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
