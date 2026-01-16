// src/components/auth/OTPModal.tsx
'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from '@heroui/react';
import { FiMail, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  name: string;
  onVerified: () => void;
}

export default function OTPModal({
  isOpen,
  onClose,
  email,
  name,
  onVerified,
}: OTPModalProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('กรุณากรอกรหัส OTP 6 หลัก');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'รหัส OTP ไม่ถูกต้อง');
      }

      toast.success('ยืนยันรหัส OTP สำเร็จ');
      onVerified();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถส่ง OTP ได้');
      }

      toast.success('ส่งรหัส OTP ใหม่แล้ว');
      setOtp('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setResending(false);
    }
  };

  const handleClose = () => {
    setOtp('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      backdrop="blur"
      size="md"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">ยืนยันรหัส OTP</h3>
          <p className="text-sm text-gray-600 font-normal">
            เราได้ส่งรหัส OTP ไปที่อีเมล
          </p>
        </ModalHeader>

        <ModalBody>
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg mb-4">
            <FiMail className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">{email}</span>
          </div>

          <Input
            type="text"
            label="รหัส OTP (6 หลัก)"
            placeholder="● ● ● ● ● ●"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            size="lg"
            classNames={{
              input: 'text-center text-2xl tracking-widest font-bold',
              inputWrapper: 'border-2 hover:border-orange-400 focus-within:border-orange-500',
            }}
            autoFocus
          />

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 mb-2">ไม่ได้รับรหัส?</p>
            <Button
              variant="light"
              color="warning"
              startContent={<FiRefreshCw className="w-4 h-4" />}
              onClick={handleResendOTP}
              isLoading={resending}
              size="sm"
            >
              ส่งรหัสใหม่อีกครั้ง
            </Button>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            ยกเลิก
          </Button>
          <Button
            color="warning"
            onPress={handleVerifyOTP}
            isLoading={loading}
            isDisabled={otp.length !== 6}
          >
            ยืนยัน
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}