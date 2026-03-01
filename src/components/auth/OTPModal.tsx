// src/components/auth/OTPModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  InputOtp,
} from '@heroui/react';
import { FiMail, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  name: string;
  onVerified: () => void;
  isLogin?: boolean;
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
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(60);
      setOtp('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (timeLeft > 0 && isOpen) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isOpen]);

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
      setTimeLeft(60);
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
      backdrop="opaque"
      size="md"
      classNames={{
        base: "bg-white dark:bg-gray-900 border border-orange-100 dark:border-gray-800 min-h-[400px] w-full max-w-[450px] overflow-hidden",
        header: "border-b border-gray-100 dark:border-gray-800",
        footer: "border-t border-gray-100 dark:border-gray-800",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 items-center pt-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">ยืนยันรหัส OTP</h3>
            </ModalHeader>

            <ModalBody className="py-2 px-6">
              <div className="text-center mb-4">
                <p className="text-base text-gray-600 dark:text-gray-400">
                  รหัส OTP ถูกส่งไปยัง <span className="font-bold text-gray-900 dark:text-white">{email}</span>
                </p>
              </div>

              <div className="flex justify-center mb-4">
                <InputOtp
                  length={6}
                  value={otp}
                  onValueChange={setOtp}
                  color="warning"
                  size="lg"
                  autoFocus
                  classNames={{
                    segment: "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-xl font-bold border-2",
                    segmentWrapper: "gap-x-1 sm:gap-x-2"
                  }}
                />
              </div>

              <div className="text-center mb-6">
                {timeLeft > 0 ? (
                  <p className="text-sm text-gray-500">
                    ขอรหัสใหม่ได้ในอีก {timeLeft} วินาที
                  </p>
                ) : (
                  <Button
                    variant="light"
                    className="text-orange-600 font-medium p-0 h-auto data-[hover=true]:bg-transparent"
                    startContent={<FiRefreshCw className="w-4 h-4" />}
                    onClick={handleResendOTP}
                    isLoading={resending}
                    size="sm"
                    disableRipple
                  >
                    ส่งรหัสใหม่
                  </Button>
                )}

              </div>

              <Button
                color="success"
                variant="solid"
                className="w-full text-white font-bold text-lg h-12 shadow-md mb-4 bg-[#22c55e]"
                onPress={handleVerifyOTP}
                isLoading={loading}
                isDisabled={otp.length !== 6}
              >
                ยืนยันรหัส OTP
              </Button>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
