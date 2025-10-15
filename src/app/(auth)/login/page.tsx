'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Input, Button } from '@heroui/react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        {step === 'otp' && (
          <button
            onClick={() => setStep('email')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </button>
        )}

        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {step === 'email' ? 'เข้าสู่ระบบ' : 'ยืนยัน OTP'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
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
              startContent={<Mail className="w-4 h-4 text-gray-400" />}
              required
              size="lg"
            />

            <Button
              type="submit"
              color="primary"
              className="w-full"
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
              label="รหัส OTP"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              size="lg"
              classNames={{
                input: 'text-center text-2xl tracking-widest',
              }}
            />

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              ไม่ได้รับรหัส?{' '}
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-blue-600 hover:underline"
              >
                ส่งใหม่อีกครั้ง
              </button>
            </div>

            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={loading}
              size="lg"
            >
              ยืนยัน
            </Button>
          </form>
        )}

        <div className="mt-8 text-center border-t pt-6">
          <p className="text-gray-600 dark:text-gray-400">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-semibold">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
// cspell:disable