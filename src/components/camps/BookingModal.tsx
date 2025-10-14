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
import { FaCheckCircle } from 'react-icons/fa';

interface CampData {
  _id: string;
  name: string;
  date: string;
  location: string;
  price: string;
  deadline: string;
}

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
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campId: camp._id,
          userName: formData.name,
          userEmail: formData.email,
          userPhone: formData.phone,
          university: formData.university,
          year: formData.year,
          reason: formData.reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit registration');
      }

      console.log('Registration successful:', data);
      setSubmitSuccess(true);

      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          university: '',
          year: '',
          reason: '',
        });
        setSubmitSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting registration:', error);
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        university: '',
        year: '',
        reason: '',
      });
      setError('');
      setSubmitSuccess(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
      isDismissable={!isSubmitting}
      classNames={{
        base: "bg-white dark:bg-gray-800",
        header: "border-b border-gray-200 dark:border-gray-700",
        body: "py-6",
        footer: "border-t border-gray-200 dark:border-gray-700",
      }}
    >
      <ModalContent>
        {submitSuccess ? (
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <FaCheckCircle className="text-green-500 text-6xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              สมัครเข้าร่วมสำเร็จ!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              เราจะติดต่อกลับทางอีเมลที่คุณระบุไว้
            </p>
          </div>
        ) : (
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
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Name */}
                <Input
                  label="ชื่อ-นามสกุล"
                  placeholder="กรอกชื่อ-นามสกุล"
                  value={formData.name}
                  onValueChange={(value) => setFormData({ ...formData, name: value })}
                  required
                  size="lg"
                  isDisabled={isSubmitting}
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
                  isDisabled={isSubmitting}
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
                  isDisabled={isSubmitting}
                />

                {/* University */}
                <Input
                  label="มหาวิทยาลัย/สถาบัน"
                  placeholder="กรอกชื่อมหาวิทยาลัย"
                  value={formData.university}
                  onValueChange={(value) => setFormData({ ...formData, university: value })}
                  required
                  size="lg"
                  isDisabled={isSubmitting}
                />

                {/* Year */}
                <Input
                  label="ชั้นปี"
                  placeholder="เช่น ปี 2"
                  value={formData.year}
                  onValueChange={(value) => setFormData({ ...formData, year: value })}
                  required
                  size="lg"
                  isDisabled={isSubmitting}
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
                  isDisabled={isSubmitting}
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
                onPress={handleClose}
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
        )}
      </ModalContent>
    </Modal>
  );
}
