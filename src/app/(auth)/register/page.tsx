'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Select, SelectItem, Textarea, Tabs, Tab, Link, Image, InputOtp } from '@heroui/react';
import { Mail, User, Phone, Building, CreditCard, MapPin, FileText, ArrowLeft, Camera } from 'lucide-react';
import { FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { UserRole } from '@/types';

const provinces = [
  'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา',
  'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก',
  'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน',
  'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา',
  'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต',
  'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี',
  'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ',
  'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี',
  'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อุดรธานี', 'อุทัยธานี', 'อุตรดิตถ์', 'อุบลราชธานี', 'อำนาจเจริญ'
];

type Step = 'form' | 'otp';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [role, setRole] = useState<'user' | 'organizer'>('user');
  const [profileImage, setProfileImage] = useState('');
  const [profilePreview, setProfilePreview] = useState('');
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    lineId: '',
    organization: '',
    idCard: '',
    address: '',
    province: '',
    district: '',
  });

  const startTimer = () => {
    setTimeLeft(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ไฟล์ใหญ่เกิน 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setProfilePreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'skillscout');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formDataUpload }
      );
      const data = await res.json() as { secure_url?: string };
      if (data.secure_url) {
        setProfileImage(data.secure_url);
        toast.success('อัปโหลดรูปสำเร็จ');
      }
    } catch {
      toast.error('อัปโหลดรูปไม่สำเร็จ');
      setProfilePreview('');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.email || !formData.name) throw new Error('กรุณากรอกอีเมลและชื่อ');

      if (role === 'organizer') {
        if (!formData.organization || !formData.idCard || !formData.phone || !formData.lineId || !formData.address || !formData.province || !formData.district) {
          throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
        }
      }

      const otpResponse = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, name: formData.name }),
      });

      const otpData = await otpResponse.json() as { error?: string };
      if (!otpResponse.ok) throw new Error(otpData.error || 'ไม่สามารถส่ง OTP ได้');

      toast.success('ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว');
      setOtp('');
      startTimer();
      setStep('otp');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, name: formData.name }),
      });
      if (!response.ok) throw new Error('ไม่สามารถส่ง OTP ได้');
      toast.success('ส่งรหัส OTP ใหม่แล้ว');
      setOtp('');
      startTimer();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('กรุณากรอกรหัส OTP 6 หลัก');
      return;
    }
    setLoading(true);
    try {
      // 1. Verify OTP
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const verifyData = await verifyRes.json() as { error?: string };
      if (!verifyRes.ok) throw new Error(verifyData.error || 'รหัส OTP ไม่ถูกต้อง');

      // 2. Register user
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: role === 'organizer' ? UserRole.ORGANIZER : UserRole.USER,
          profileImage: profileImage || undefined,
        }),
      });
      const registerData = await registerRes.json() as { error?: string };
      if (!registerRes.ok) throw new Error(registerData.error);

      toast.success('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      router.push('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 fixed left-0 top-0 bottom-0 flex-col justify-between overflow-hidden bg-[#2C2C2C] p-12 text-white z-0">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F2B33D]/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#F2B33D]/5 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
              <Image src="/skillscoutLogo.png" alt="SkillScout Logo" width={40} height={40} className="object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">SkillScout</span>
          </div>

          <div className="mt-12 relative">
            <div className="absolute -left-4 -top-4 w-12 h-12 border-l-4 border-t-4 border-[#F2B33D] rounded-tl-xl"></div>
            <h1 className="text-6xl font-black leading-[1.1] mb-6 tracking-tight text-white">
              เปลี่ยน <br />
              <span className="text-[#F2B33D]">ความชอบ</span><br />
              ให้เป็นทักษะ
            </h1>
            <p className="text-gray-300 font-light">เข้าร่วมกับเราวันนี้ เพื่อค้นพบค่ายและกิจกรรมที่น่าสนใจมากมาย</p>
          </div>
        </div>

        <div className="relative z-10 mt-auto">
          <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#2C2C2C] bg-gray-300" />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-[#2C2C2C] bg-[#F2B33D] flex items-center justify-center text-[10px] font-bold text-white">+2k</div>
              </div>
            </div>
            <div className="text-sm text-gray-300">
              <span className="text-[#F2B33D] font-bold">2,500+</span> ผู้ใช้งานใหม่ในเดือนนี้
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] flex items-center justify-center bg-white dark:bg-black min-h-screen">
        <div className="w-full max-w-2xl p-6 lg:p-12">

          {/* ===== STEP: OTP ===== */}
          {step === 'otp' ? (
            <div className="w-full max-w-md mx-auto space-y-6">
              <button
                onClick={() => setStep('form')}
                className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">ย้อนกลับ</span>
              </button>

              <div>
                <h2 className="text-3xl font-bold text-[#2C2C2C] dark:text-white mb-2">ยืนยันรหัส OTP</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  รหัส OTP ถูกส่งไปที่ <span className="font-semibold text-[#2C2C2C] dark:text-white">{formData.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6 flex flex-col items-center">
                <div className="flex justify-center w-full">
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

                <div className="text-center w-full">
                  {timeLeft > 0 ? (
                    <p className="text-sm text-gray-500">ขอรหัสใหม่ได้ในอีก {timeLeft} วินาที</p>
                  ) : (
                    <Button
                      variant="light"
                      className="text-orange-600 font-medium p-0 h-auto data-[hover=true]:bg-transparent mx-auto"
                      startContent={<FiRefreshCw className="w-3 h-3" />}
                      onPress={handleResendOTP}
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
                  ยืนยัน OTP และสมัครสมาชิก
                </Button>
              </form>

              <p className="text-center text-sm text-gray-500">
                มีบัญชีแล้ว?{' '}
                <Link href="/login" className="font-semibold text-[#F2B33D] hover:text-[#d49a2a]">
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          ) : (
            /* ===== STEP: FORM ===== */
            <>
              <Link href="/login" className="mb-8 text-gray-500 hover:text-orange-600 flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> กลับไปหน้าเข้าสู่ระบบ
              </Link>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">สร้างบัญชีผู้ใช้</h2>
                <p className="text-gray-500">เลือกประเภทผู้ใช้งานและกรอกข้อมูลเพื่อเริ่มต้น</p>
              </div>

              <div className="mb-8">
                <Tabs
                  aria-label="User Roles"
                  selectedKey={role}
                  onSelectionChange={(key) => setRole(key as 'user' | 'organizer')}
                  color="warning"
                  variant="bordered"
                  classNames={{
                    cursor: "w-full bg-orange-400",
                    tabContent: "group-data-[selected=true]:text-white"
                  }}
                >
                  <Tab key="user" title={<div className="flex items-center gap-2"><User className="w-4 h-4" /><span>ผู้ใช้งานทั่วไป</span></div>} />
                  <Tab key="organizer" title={<div className="flex items-center gap-2"><Building className="w-4 h-4" /><span>ผู้จัดค่าย (Organizer)</span></div>} />
                </Tabs>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="relative">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-full border-2 border-dashed border-[#F2B33D] cursor-pointer hover:border-orange-500 transition-colors overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center"
                      >
                        {profilePreview ? (
                          <img src={profilePreview} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-gray-400">
                            <Camera className="w-7 h-7" />
                            <span className="text-[10px]">รูปโปรไฟล์</span>
                          </div>
                        )}
                      </div>
                      {uploadingImage && (
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                    <p className="text-[10px] text-gray-400 text-center leading-tight mt-1">คลิกเพื่ออัปโหลด<br />รูปโปรไฟล์ (ไม่บังคับ)</p>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="อีเมล" placeholder="your@email.com" type="email" variant="bordered" radius="lg"
                      value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      startContent={<Mail className="w-4 h-4 text-gray-400" />} isRequired
                      classNames={{ inputWrapper: "border-1 hover:border-[#F2B33D] group-data-[focus=true]:border-[#F2B33D]" }}
                    />
                    <Input
                      label="ชื่อ-นามสกุล" placeholder="ชื่อจริง นามสกุลจริง" type="text" variant="bordered" radius="lg"
                      value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      startContent={<User className="w-4 h-4 text-gray-400" />} isRequired
                      classNames={{ inputWrapper: "border-1 hover:border-[#F2B33D] group-data-[focus=true]:border-[#F2B33D]" }}
                    />
                    <Input
                      label={role === 'user' ? 'เบอร์โทรศัพท์ (ไม่บังคับ)' : 'เบอร์โทรศัพท์'} placeholder="08x-xxx-xxxx" variant="bordered" radius="lg"
                      value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      startContent={<Phone className="w-4 h-4 text-gray-400" />} isRequired={role === 'organizer'}
                      classNames={{ inputWrapper: "border-1 hover:border-[#F2B33D] group-data-[focus=true]:border-[#F2B33D]" }}
                    />
                    <Input
                      label={role === 'user' ? 'LINE ID (ไม่บังคับ)' : 'LINE ID'} placeholder="ไอดีไลน์" variant="bordered" radius="lg"
                      value={formData.lineId} onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                      startContent={<FileText className="w-4 h-4 text-gray-400" />} isRequired={role === 'organizer'}
                      classNames={{ inputWrapper: "border-1 hover:border-[#F2B33D] group-data-[focus=true]:border-[#F2B33D]" }}
                    />
                  </div>
                </div>

                {role === 'organizer' && (
                  <div className="space-y-4 animate-appearance-in">
                    <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                      <h3 className="font-semibold text-orange-800 dark:text-orange-400 mb-4 flex items-center gap-2">
                        <Building className="w-4 h-4" /> ข้อมูลผู้จัดค่าย
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="ชื่อองค์กร/หน่วยงาน" placeholder="ใส่ชื่อองค์กร" variant="bordered" radius="lg"
                          value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          isRequired classNames={{ inputWrapper: "bg-white dark:bg-black border-1 hover:border-orange-500 group-data-[focus=true]:border-orange-500" }}
                        />
                        <Input
                          label="เลขบัตรประชาชน" placeholder="13 หลัก" variant="bordered" radius="lg"
                          value={formData.idCard} onChange={(e) => setFormData({ ...formData, idCard: e.target.value.replace(/\D/g, '').slice(0, 13) })}
                          maxLength={13} startContent={<CreditCard className="w-4 h-4 text-gray-400" />} isRequired
                          classNames={{ inputWrapper: "bg-white dark:bg-black border-1 hover:border-orange-500 group-data-[focus=true]:border-orange-500" }}
                        />
                      </div>
                      <div className="mt-4">
                        <Textarea
                          label="ที่อยู่" placeholder="บ้านเลขที่ ถนน..." variant="bordered" radius="lg" minRows={2}
                          value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          isRequired classNames={{ inputWrapper: "bg-white dark:bg-black border-1 hover:border-orange-500 group-data-[focus=true]:border-orange-500" }}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Select
                          label="จังหวัด" placeholder="เลือกจังหวัด" variant="bordered" radius="lg"
                          selectedKeys={formData.province ? [formData.province] : []}
                          onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                          startContent={<MapPin className="w-4 h-4 text-gray-400" />} isRequired
                          classNames={{ trigger: "bg-white dark:bg-black border-1 hover:border-orange-500" }}
                        >
                          {provinces.map((p) => <SelectItem key={p}>{p}</SelectItem>)}
                        </Select>
                        <Input
                          label="อำเภอ/เขต" placeholder="ระบุอำเภอ" variant="bordered" radius="lg"
                          value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          isRequired classNames={{ inputWrapper: "bg-white dark:bg-black border-1 hover:border-orange-500 group-data-[focus=true]:border-orange-500" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 items-start text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                  <div className="mt-1 min-w-4 w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-[10px]">i</div>
                  <p>
                    การสมัครสมาชิกถือว่าคุณยอมรับ{' '}
                    <Link href="#" className="text-[#F2B33D] text-xs">ข้อกำหนดการใช้งาน</Link> และ{' '}
                    <Link href="#" className="text-[#F2B33D] text-xs">นโยบายความเป็นส่วนตัว</Link> ของเรา
                  </p>
                </div>

                <Button
                  type="submit" color="warning" variant="shadow"
                  className="w-full text-white font-bold" size="lg" radius="lg"
                  isLoading={loading || uploadingImage}
                >
                  {uploadingImage ? 'กำลังอัปโหลดรูป...' : 'สมัครสมาชิก'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
