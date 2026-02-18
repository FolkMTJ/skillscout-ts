'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input, Button, Link, Image, InputOtp } from '@heroui/react';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (step === 'otp') {
      setTimeLeft(60);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'otp' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, step]);

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
    <div className="min-h-screen w-full flex">
      {/* Left Side - Hero/Branding */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden bg-[#2C2C2C] p-12 text-white">
        {/* Background Patterns - Minimal & Solid */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F2B33D]/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#F2B33D]/5 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150 mix-blend-overlay" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
              <Image
                src="/skillscoutLogo.png"
                alt="SkillScout Logo"
                width={42}
                height={42}
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">SkillScout</span>
          </div>

          <div className="mt-16 relative">
            <div className="absolute -left-4 -top-4 w-12 h-12 border-l-4 border-t-4 border-[#F2B33D] rounded-tl-xl"></div>
            <h1 className="text-6xl font-black leading-[1.1] mb-6 tracking-tight text-white">
              เปลี่ยน <br />
              <span className="text-[#F2B33D]">
                ความชอบ
              </span><br />
              ให้เป็นทักษะ
            </h1>
            <p className="text-lg text-gray-300 max-w-md font-light leading-relaxed">
              ค้นพบตัวตน พัฒนาทักษะ และเปิดประสบการณ์ใหม่<br />
              กับค่ายกิจกรรมคุณภาพที่คัดสรรมาเพื่อคุณ
            </p>
          </div>
        </div>

        {/* Floating Glass Stats Card */}
        <div className="relative z-10 mt-auto">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#F2B33D] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`w-6 h-6 rounded-full border-2 border-[#2C2C2C] bg-gray-300`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-300">+12k เข้าร่วมแล้ว</span>
                </div>
                <div className="text-xs text-[#F2B33D] font-medium mt-1">Trusted by Students</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Total Camps</span>
                <span className="text-white font-bold">500+</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#F2B33D] w-3/4 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-black">
        <div className="w-full max-w-md space-y-6">
          {/* Back Button */}
          {step === 'otp' ? (
            <button
              onClick={() => setStep('email')}
              className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors"
            >
              <FaArrowLeft />
              <span className="text-sm font-medium">ย้อนกลับ</span>
            </button>
          ) : (
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors mb-4">
              <FaArrowLeft className="w-3 h-3" />
              <span className="text-sm font-medium">กลับหน้าหลัก</span>
            </Link>
          )}

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#2C2C2C] dark:text-white mb-2">
              {step === 'email' ? 'ยินดีต้อนรับกลับมา!' : 'ยืนยันรหัส OTP'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {step === 'email'
                ? 'กรอกอีเมลของคุณเพื่อเข้าสู่ระบบแบบไร้รหัสผ่าน'
                : `รหัส OTP ถูกส่งไปที่ ${email}`}
            </p>
          </div>

          {/* Form Section */}
          <div>
            {step === 'email' ? (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <Input
                  label="อีเมล"
                  placeholder="yourname@example.com"
                  type="email"
                  variant="bordered"
                  radius="lg"
                  size="lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  startContent={<FaEnvelope className="text-[#F2B33D]" />}
                  classNames={{
                    inputWrapper: "border-1 hover:border-[#F2B33D] group-data-[focus=true]:border-[#F2B33D]",
                    label: "text-gray-500",
                  }}
                  isRequired
                />

                <Button
                  type="submit"
                  color="warning"
                  variant="shadow"
                  className="w-full text-white font-bold"
                  size="lg"
                  radius="lg"
                  isLoading={loading}
                >
                  ส่งรหัส OTP
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6 flex flex-col items-center">
                <div className="flex justify-center mb-4">
                  <InputOtp
                    length={6}
                    value={otp}
                    onValueChange={setOtp}
                    color="warning"
                    size="lg"
                    classNames={{
                      segment: "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-xl font-bold border-2",
                      segmentWrapper: "gap-x-1 sm:gap-x-2"
                    }}
                  />
                </div>

                <div className="text-center mb-6 w-full">
                  {timeLeft > 0 ? (
                    <p className="text-sm text-gray-500">
                      ขอรหัสใหม่ได้ในอีก {timeLeft} วินาที
                    </p>
                  ) : (
                    <Button
                      variant="light"
                      className="text-orange-600 font-medium p-0 h-auto data-[hover=true]:bg-transparent mx-auto"
                      startContent={<FiRefreshCw className="w-3 h-3" />}
                      onPress={() => handleSendOTP({ preventDefault: () => { } } as React.FormEvent)}
                      isLoading={loading}
                      size="sm"
                      disableRipple
                    >
                      ส่งรหัสใหม่
                    </Button>
                  )}
                </div>

                <Button
                  type="submit"
                  color="warning"
                  variant="shadow"
                  className="w-full text-white font-bold"
                  size="lg"
                  radius="lg"
                  isLoading={loading}
                >
                  ยืนยัน OTP
                </Button>
              </form>
            )}
          </div>

          {/* Footer Link */}
          <p className="text-center lg:text-right text-sm text-gray-500">
            ยังไม่มีบัญชีสมาชิก?{' '}
            <Link href="/register" className="font-semibold text-[#F2B33D] hover:text-[#d49a2a]">
              สมัครสมาชิกเลย
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
