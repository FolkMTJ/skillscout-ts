"use client";

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
  DatePicker,
} from '@heroui/react';
import { FiTag, FiPercent, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DiscountType } from '@/types';

interface Camp {
  _id: string;
  name: string;
}

interface PromoCodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userRole: 'admin' | 'organizer';
  organizerCamps?: Camp[];
}

export default function PromoCodeFormModal({
  isOpen,
  onClose,
  onSuccess,
  userRole,
  organizerCamps = [],
}: PromoCodeFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 0,
    minAmount: 0,
    maxDiscount: 0,
    usageLimit: 0,
    validFrom: '',
    validUntil: '',
    isActive: true,
    applicableCamps: [] as string[],
  });

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setFormData({
        code: '',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 0,
        minAmount: 0,
        maxDiscount: 0,
        usageLimit: 0,
        validFrom: '',
        validUntil: '',
        isActive: true,
        applicableCamps: [],
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.code.trim()) {
        toast.error('กรุณากรอกรหัสโปรโมชั่น');
        return;
      }

      if (formData.discountValue <= 0) {
        toast.error('มูลค่าส่วนลดต้องมากกว่า 0');
        return;
      }

      if (formData.discountType === DiscountType.PERCENTAGE && formData.discountValue > 100) {
        toast.error('เปอร์เซ็นต์ส่วนลดไม่เกิน 100%');
        return;
      }

      if (!formData.validFrom || !formData.validUntil) {
        toast.error('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด');
        return;
      }

      if (userRole === 'organizer' && formData.applicableCamps.length === 0) {
        toast.error('กรุณาเลือกค่ายที่ใช้โค้ดได้อย่างน้อย 1 ค่าย');
        return;
      }

      const response = await fetch('/api/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          minAmount: formData.minAmount || undefined,
          maxDiscount: formData.maxDiscount || undefined,
          usageLimit: formData.usageLimit || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาด');
      }

      toast.success('สร้างโค้ดสำเร็จ!');
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-white dark:bg-gray-900",
        header: "border-b-3 border-orange-400",
        body: "py-6",
        footer: "border-t-3 border-orange-400",
      }}
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <FiTag className="text-orange-500 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  สร้างโค้ดโปรโมชั่น
                </h2>
                <p className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                  {userRole === 'admin' ? 'ใช้ได้ทั้งเว็บ' : 'เฉพาะค่ายของคุณ'}
                </p>
              </div>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="space-y-6">
              {/* รหัสโปรโมชั่น */}
              <Input
                label="รหัสโปรโมชั่น"
                placeholder="SUMMER2024"
                value={formData.code}
                onValueChange={(v) => setFormData({ ...formData, code: v.toUpperCase() })}
                required
                variant="bordered"
                startContent={<FiTag className="text-gray-400" />}
                description="ตัวอักษร A-Z และตัวเลข 0-9 เท่านั้น"
              />

              {/* ประเภทส่วนลด */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="ประเภทส่วนลด"
                  selectedKeys={[formData.discountType]}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
                  variant="bordered"
                  required
                >
                  <SelectItem key={DiscountType.PERCENTAGE} startContent={<FiPercent />}>
                    เปอร์เซ็นต์ (%)
                  </SelectItem>
                  <SelectItem key={DiscountType.FIXED} startContent={<FiDollarSign />}>
                    จำนวนเงิน (฿)
                  </SelectItem>
                </Select>

                <Input
                  label="มูลค่าส่วนลด"
                  type="number"
                  placeholder="0"
                  value={formData.discountValue.toString()}
                  onValueChange={(v) => setFormData({ ...formData, discountValue: parseFloat(v) || 0 })}
                  required
                  variant="bordered"
                  endContent={
                    <span className="text-gray-400">
                      {formData.discountType === DiscountType.PERCENTAGE ? '%' : '฿'}
                    </span>
                  }
                />
              </div>

              {/* เงื่อนไขการใช้งาน */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="ยอดขั้นต่ำ (฿)"
                  type="number"
                  placeholder="0"
                  value={formData.minAmount?.toString() || '0'}
                  onValueChange={(v) => setFormData({ ...formData, minAmount: parseFloat(v) || 0 })}
                  variant="bordered"
                  description="0 = ไม่จำกัด"
                />

                {formData.discountType === DiscountType.PERCENTAGE && (
                  <Input
                    label="ส่วนลดสูงสุด (฿)"
                    type="number"
                    placeholder="0"
                    value={formData.maxDiscount?.toString() || '0'}
                    onValueChange={(v) => setFormData({ ...formData, maxDiscount: parseFloat(v) || 0 })}
                    variant="bordered"
                    description="0 = ไม่จำกัด"
                  />
                )}

                <Input
                  label="จำนวนครั้งที่ใช้ได้"
                  type="number"
                  placeholder="0"
                  value={formData.usageLimit?.toString() || '0'}
                  onValueChange={(v) => setFormData({ ...formData, usageLimit: parseInt(v) || 0 })}
                  variant="bordered"
                  description="0 = ไม่จำกัด"
                />
              </div>

              {/* วันที่ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="วันที่เริ่มต้น"
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  required
                  variant="bordered"
                />

                <Input
                  label="วันที่สิ้นสุด"
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  required
                  variant="bordered"
                />
              </div>

              {/* เลือกค่าย */}
              {userRole === 'organizer' && organizerCamps.length > 0 && (
                <Select
                  label="ค่ายที่ใช้โค้ดได้"
                  placeholder="เลือกค่าย"
                  selectionMode="multiple"
                  selectedKeys={formData.applicableCamps}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys) as string[];
                    setFormData({ ...formData, applicableCamps: selected });
                  }}
                  variant="bordered"
                  required
                  description="เลือกอย่างน้อย 1 ค่าย"
                >
                  {organizerCamps.map((camp) => (
                    <SelectItem key={camp._id} value={camp._id}>
                      {camp.name}
                    </SelectItem>
                  ))}
                </Select>
              )}

              {userRole === 'admin' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Admin:</strong> โค้ดนี้จะใช้ได้กับทุกค่ายในเว็บ
                  </p>
                </div>
              )}

              {/* สถานะ */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">เปิดใช้งาน</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">โค้ดสามารถใช้งานได้ทันที</p>
                </div>
                <Switch
                  isSelected={formData.isActive}
                  onValueChange={(v) => setFormData({ ...formData, isActive: v })}
                  color="success"
                />
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
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold"
              isLoading={isSubmitting}
            >
              สร้างโค้ด
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
