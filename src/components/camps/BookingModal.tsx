"use client";

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from '@heroui/react';
import type { CampData } from '@/lib/data';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  camp: CampData;
}

export default function BookingModal({ isOpen, onClose, camp }: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    university: '',
    year: '',
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement booking API
      console.log('Booking data:', {
        ...formData,
        campId: camp._id,
        campName: camp.name,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('สมัครเข้าร่วมสำเร็จ! เราจะติดต่อกลับทางอีเมล');
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        university: '',
        year: '',
        reason: '',
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-white dark:bg-gray-800",
        header: "border-b border-gray-200 dark:border-gray-700",
        body: "py-6",
        footer: "border-t border-gray-200 dark:border-gray-700",
      }}
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              สมัครเข้าร่วม
            </h2>
            <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
              {camp.name}
            </p>
          </ModalHeader>

          <ModalBody>
            <div className="space-y-4">
              {/* Name */}
              <Input
                label="ชื่อ-นามสกุล"
                placeholder="กรอกชื่อ-นามสกุล"
                value={formData.name}
                onValueChange={(value) => setFormData({ ...formData, name: value })}
                required
                size="lg"
              />

              {/* Email */}
              <Input
                type="email"
                label="อีเมล"
                placeholder="example@email.com"
                value={formData.email}
                onValueChange={(value) => setFormData({ ...formData, email: value })}
                required
                size="lg"
              />

              {/* Phone */}
              <Input
                type="tel"
                label="เบอร์โทรศัพท์"
                placeholder="0xx-xxx-xxxx"
                value={formData.phone}
                onValueChange={(value) => setFormData({ ...formData, phone: value })}
                required
                size="lg"
              />

              {/* University */}
              <Input
                label="มหาวิทยาลัย/สถาบัน"
                placeholder="กรอกชื่อมหาวิทยาลัย"
                value={formData.university}
                onValueChange={(value) => setFormData({ ...formData, university: value })}
                required
                size="lg"
              />

              {/* Year */}
              <Input
                label="ชั้นปี"
                placeholder="เช่น ปี 2"
                value={formData.year}
                onValueChange={(value) => setFormData({ ...formData, year: value })}
                required
                size="lg"
              />

              {/* Reason */}
              <Textarea
                label="เหตุผลที่ต้องการเข้าร่วม"
                placeholder="บอกเราว่าทำไมคุณถึงสนใจค่ายนี้..."
                value={formData.reason}
                onValueChange={(value) => setFormData({ ...formData, reason: value })}
                required
                minRows={4}
                size="lg"
              />

              {/* Camp Info Summary */}
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mt-6">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  รายละเอียดค่าย
                </h3>
                <div className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                  <p><strong>วันที่:</strong> {camp.date}</p>
                  <p><strong>สถานที่:</strong> {camp.location}</p>
                  <p><strong>ค่าใช้จ่าย:</strong> {camp.price}</p>
                  <p><strong>ปิดรับสมัคร:</strong> {camp.deadline}</p>
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={onClose}
              isDisabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              color="warning"
              className="bg-amber-500 font-bold"
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการสมัคร'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}