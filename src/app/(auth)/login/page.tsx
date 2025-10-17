'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Input, Button } from '@heroui/react';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success('ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว');
      setStep('otp');
    } catch (error) {
      toast.error((error as Error).message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('otp', {
        email,
        otp,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('เข้าสู่ระบบสำเร็จ!');
        router.push('/');
        router.refresh();
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200/30 dark:bg-amber-500/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-md p-8 shadow-2xl border-2 border-orange-200 dark:border-orange-900/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl relative z-10">
        {step === 'otp' && (
          <button
            onClick={() => setStep('email')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 mb-4 font-semibold transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            กลับ
          </button>
        )}

        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl">
              <Image
                width={150}
                height={40}
                src="/skillscoutLogo-black.png"
                alt="SkillScout"
                className="block dark:hidden"
              />
              <Image
                width={150}
                height={40}
                src="/skillscoutLogo.png"
                alt="SkillScout"
                className="hidden dark:block"
              />
            </div>
          </div>

          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            {step === 'email' ? 'เข้าสู่ระบบ' : 'ยืนยัน OTP'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {step === 'email'
              ? 'กรอกอีเมลเพื่อรับรหัส OTP'
              : `เราส่งรหัส OTP ไปที่ ${email}`}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <Input
              type="email"
              label="อีเมล"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<FaEnvelope className="w-4 h-4 text-black-400" />}
              required
              size="lg"
              classNames={{
                inputWrapper: "border-2 hover:border-orange-400 focus-within:border-orange-500"
              }}
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              isLoading={loading}
              size="lg"
            >
              ส่งรหัส OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <Input
              type="text"
              label="รหัส OTP (6 หลัก)"
              placeholder="● ● ● ● ● ●"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              size="lg"
              classNames={{
                input: 'text-center text-2xl tracking-widest font-bold',
                inputWrapper: "border-2 hover:border-orange-400 focus-within:border-orange-500"
              }}
            />

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                ไม่ได้รับรหัส?
              </p>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-orange-600 dark:text-orange-400 hover:underline font-semibold"
              >
                ส่งใหม่อีกครั้ง
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              isLoading={loading}
              size="lg"
            >
              ยืนยันและเข้าสู่ระบบ
            </Button>
          </form>
        )}

        <div className="mt-8 text-center border-t-2 border-orange-200 dark:border-orange-900/30 pt-6">
          <p className="text-gray-600 dark:text-gray-400">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="text-orange-600 dark:text-orange-400 hover:underline font-bold">
              สมัครสมาชิก
            </Link>
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
            เข้าสู่ระบบด้วยรหัส OTP ที่ส่งไปยังอีเมลของคุณ<br />
            ปลอดภัยและไม่ต้องจำรหัสผ่าน
          </p>
        </div>
      </Card>
    </div>
  );
}
