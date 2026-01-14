"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Divider,
  Image,
  Progress,
  Card,
} from '@heroui/react';
import { FiCheckCircle, FiTag, FiCreditCard, FiUpload, FiImage, FiClock, FiInfo, FiSmartphone, FiGift, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CampData {
  _id: string;
  name: string;
  date: string;
  location: string;
  price: string;
  deadline: string;
  fee?: number;
  organizerId?: string;
  image?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  camp: CampData;
  onRegistrationSuccess?: () => void;
}

export default function BookingModal({ isOpen, onClose, camp, onRegistrationSuccess }: BookingModalProps) {
  const { data: session } = useSession();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [paymentId, setPaymentId] = useState('');
  const [registrationId, setRegistrationId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const basePrice = camp.fee || parseFloat(camp.price.replace(/[^0-9]/g, '')) || 0;
  const finalPrice = Math.max(0, basePrice - discount);
  const isFree = finalPrice === 0;

  // 🔧 FIX: Fetch user data including phone number
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              setFormData(prev => ({
                ...prev,
                name: data.user.name || prev.name,
                email: data.user.email || prev.email,
                phone: data.user.phone || prev.phone,
              }));
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to session data
          setFormData(prev => ({
            ...prev,
            name: session.user.name || prev.name,
            email: session.user.email || prev.email,
          }));
        }
      }
    };

    if (session?.user && isOpen) {
      fetchUserData();
    }
  }, [session, isOpen]);

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      toast.error('กรุณากรอกรหัสโปรโมชั่น');
      return;
    }
    
    setIsValidatingPromo(true);
    setPromoMessage('');

    try {
      const response = await fetch('/api/payment/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: promoCode, 
          amount: basePrice, 
          campId: camp._id 
        }),
      });
      
      const result = await response.json();
      
      if (result.valid) {
        setDiscount(result.discount);
        setPromoApplied(true);
        setPromoMessage(`ส่วนลด ฿${result.discount.toLocaleString()}`);
        toast.success(`ใช้โค้ดสำเร็จ! ลด ฿${result.discount.toLocaleString()}`);
      } else {
        setDiscount(0);
        setPromoApplied(false);
        setPromoMessage(result.message || 'รหัสไม่ถูกต้อง');
        toast.error(result.message || 'รหัสโปรโมชั่นไม่ถูกต้อง');
      }
    } catch (err) {
      console.error('Promo validation error:', err);
      setPromoMessage('เกิดข้อผิดพลาด');
      toast.error('ไม่สามารถตรวจสอบโค้ดได้');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoApplied(false);
    setDiscount(0);
    setPromoMessage('');
    toast.success('ยกเลิกโค้ดส่วนลด');
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isFree) {
      await handleFreeRegistration();
      return;
    }
    
    setStep(2);
    await generateQRCode();
  };

  const handleFreeRegistration = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const regResponse = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campId: camp._id,
          userName: formData.name,
          userEmail: formData.email,
          userPhone: formData.phone,
        }),
      });

      if (!regResponse.ok) {
        const errorData = await regResponse.json();
        throw new Error(errorData.error || 'ไม่สามารถสมัครได้');
      }

      const registration = await regResponse.json();
      
      const registrationId = registration.registration._id;
      await fetch(`/api/registrations/${registrationId}`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'approved',
          reviewedBy: 'system',
          reviewedAt: new Date().toISOString(),
          notes: 'อนุมัติอัตโนมัติสำหรับค่ายฟรี'
        })
      });
      
      toast.success('สมัครสำเร็จ!');
      setStep(4);
      onRegistrationSuccess?.();
      setTimeout(() => handleClose(), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      const response = await fetch('/api/payment/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: finalPrice, 
          phoneNumber: '0813259525' 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setQrCodeUrl(data.qrCode);
      } else {
        throw new Error('ไม่สามารถสร้าง QR Code ได้');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ไม่สามารถสร้าง QR Code ได้';
      setError(message);
      toast.error(message);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ไฟล์ใหญ่เกิน 5MB');
        return;
      }
      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSlipPreview(reader.result as string);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleProceedToUpload = async () => {
    if (registrationId && paymentId) {
      setStep(3);
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const regResponse = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campId: camp._id,
          userName: formData.name,
          userEmail: formData.email,
          userPhone: formData.phone,
        }),
      });

      if (!regResponse.ok) {
        const errorData = await regResponse.json();
        throw new Error(errorData.error || 'ไม่สามารถสมัครได้');
      }

      const registration = await regResponse.json();
      setRegistrationId(registration.registration._id);

      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: registration.registration._id,
          campId: camp._id,
          userId: session?.user?.email || formData.email,
          userEmail: formData.email,
          userName: formData.name,
          organizerId: camp.organizerId || 'default-organizer',
          amount: basePrice,
          discount: discount,
          finalAmount: finalPrice,
          promoCode: promoApplied ? promoCode : undefined,
        }),
      });
      
      if (!paymentResponse.ok) {
        throw new Error('ไม่สามารถสร้างรายการชำระเงินได้');
      }
      
      const payment = await paymentResponse.json();
      setPaymentId(payment.payment._id);
      setStep(3);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSlip = async () => {
    if (!slipFile) {
      toast.error('กรุณาเลือกไฟล์สลิป');
      return;
    }
    
    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', slipFile);
      formDataUpload.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'skillscout');

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formDataUpload }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!uploadResponse.ok) {
        throw new Error('ไม่สามารถอัปโหลดสลิปได้');
      }
      
      const uploadData = await uploadResponse.json();
      const slipUrl = uploadData.secure_url;

      const updateResponse = await fetch(`/api/payment/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          slipUrl: slipUrl, 
          status: 'pending' 
        }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('ไม่สามารถบันทึกข้อมูลได้');
      }

      toast.success('อัปโหลดสลิปสำเร็จ!');
      setStep(4);
      onRegistrationSuccess?.();
      setTimeout(() => handleClose(), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถอัปโหลดสลิปได้';
      setError(message);
      toast.error(message);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isUploading) {
      setStep(1);
      setFormData({
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        phone: '',
      });
      setPromoCode('');
      setPromoApplied(false);
      setDiscount(0);
      setPromoMessage('');
      setQrCodeUrl('');
      setSlipFile(null);
      setSlipPreview('');
      setPaymentId('');
      setRegistrationId('');
      setUploadProgress(0);
      setError('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
      isDismissable={!isSubmitting && !isUploading}
      classNames={{
        base: "bg-white dark:bg-gray-900",
        header: "border-b-3 border-orange-400",
        body: "py-6",
        footer: "border-t-3 border-orange-400",
      }}
    >
      <ModalContent>
        {/* Step 4: Success */}
        {step === 4 && (
          <div className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FiCheckCircle className="text-green-500 text-6xl" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
              {isFree ? '🎉 สมัครสำเร็จ!' : '✅ อัปโหลดสลิปสำเร็จ!'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {isFree 
                ? 'คุณได้ลงทะเบียนเข้าร่วมค่ายเรียบร้อยแล้ว' 
                : 'เรากำลังตรวจสอบการชำระเงินของคุณ'}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              คุณจะได้รับอีเมลยืนยัน{isFree ? 'ในไม่ช้า' : 'ภายใน 24 ชั่วโมง'}
            </p>
            
            {!isFree && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3 text-left">
                  <FiClock className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-bold mb-2">🔒 ระบบ Escrow Protection</p>
                    <p className="text-xs leading-relaxed">
                      เงินจะถูกโอนให้ผู้จัดค่ายหลังจาก:<br/>
                      • คุณยืนยันการเข้าร่วมค่ายเสร็จสิ้น หรือ<br/>
                      • 15 วันนับจากวันจบค่าย (อัตโนมัติ)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Upload Slip */}
        {step === 3 && (
          <>
            <ModalHeader>
              <div className="w-full">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  📤 อัปโหลดสลิปการโอนเงิน
                </h2>
                <p className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                  แนบสลิปเพื่อยืนยันการชำระเงิน ฿{finalPrice.toLocaleString()}
                </p>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm font-semibold">{error}</p>
                  </div>
                )}
                
                <div className="border-3 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-all">
                  {slipPreview ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <Image 
                          src={slipPreview} 
                          alt="Slip Preview" 
                          className="mx-auto max-h-80 rounded-xl border-3 border-orange-300" 
                        />
                      </div>
                      <Button 
                        color="warning" 
                        variant="flat"
                        onPress={() => { 
                          setSlipFile(null); 
                          setSlipPreview(''); 
                        }}
                        startContent={<FiX />}
                      >
                        เปลี่ยนไฟล์
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          <FiUpload className="text-4xl text-orange-500" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">
                            คลิกเพื่ออัปโหลดสลิป
                          </p>
                          <p className="text-sm text-gray-500">
                            รองรับ JPG, PNG (สูงสุด 5MB)
                          </p>
                        </div>
                      </div>
                    </label>
                  )}
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <Progress 
                      value={uploadProgress} 
                      color="warning" 
                      className="w-full" 
                      size="lg"
                    />
                    <p className="text-sm text-center text-gray-600 font-semibold">
                      กำลังอัปโหลด... {uploadProgress}%
                    </p>
                  </div>
                )}
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-bold mb-1">💡 เคล็ดลับ:</p>
                      <p>ตรวจสอบให้แน่ใจว่าสลิปแสดงยอดเงิน <strong>฿{finalPrice.toLocaleString()}</strong> และข้อมูลชัดเจน</p>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                color="danger" 
                variant="light" 
                onPress={() => setStep(2)} 
                isDisabled={isUploading}
              >
                ย้อนกลับ
              </Button>
              <Button 
                color="warning" 
                className="bg-gradient-to-r from-orange-500 to-amber-500 font-bold text-white shadow-lg" 
                onPress={handleUploadSlip} 
                isLoading={isUploading} 
                isDisabled={!slipFile} 
                endContent={<FiImage />}
              >
                {isUploading ? 'กำลังอัปโหลด...' : 'ยืนยันและอัปโหลด'}
              </Button>
            </ModalFooter>
          </>
        )}

        {/* Step 2: Payment QR */}
        {step === 2 && (
          <>
            <ModalHeader>
              <div className="w-full">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  สแกน QR เพื่อชำระเงิน
                </h2>
                <p className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                  ชำระผ่าน PromptPay
                </p>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="text-center space-y-6">
                {isGeneratingQR ? (
                  <div className="py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">กำลังสร้าง QR Code...</p>
                  </div>
                ) : qrCodeUrl ? (
                  <>
                    <div className="bg-white p-8 rounded-2xl shadow-2xl inline-block border-3 border-orange-300">
                      <Image 
                        src={qrCodeUrl} 
                        alt="QR Code" 
                        width={280} 
                        height={280} 
                        className="mx-auto" 
                      />
                    </div>
                    
                    <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-3 border-orange-300">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ยอดชำระ</p>
                      <p className="text-5xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                        ฿{finalPrice.toLocaleString()}
                      </p>
                    </Card>
                    
                    <div className="text-sm text-left bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                      <p className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <FiSmartphone className="text-blue-500" />
                        วิธีการชำระเงิน:
                      </p>
                      <ol className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>1. เปิดแอพธนาคารของคุณ</li>
                        <li>2. เลือกเมนู <strong>สแกน QR Code</strong></li>
                        <li>3. สแกน QR Code ด้านบน</li>
                        <li>4. ตรวจสอบยอดเงินให้ถูกต้อง</li>
                        <li>5. ยืนยันการโอนเงิน</li>
                        <li>6. <strong>ถ่ายภาพสลิป</strong>หรือบันทึกหน้าจอ</li>
                      </ol>
                    </div>
                  </>
                ) : (
                  <div className="py-12">
                    <p className="text-red-600 font-semibold">❌ ไม่สามารถสร้าง QR Code ได้</p>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                color="danger" 
                variant="light" 
                onPress={() => setStep(1)} 
                isDisabled={isSubmitting}
              >
                ย้อนกลับ
              </Button>
              <Button 
                color="warning" 
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg" 
                onPress={handleProceedToUpload} 
                isLoading={isSubmitting} 
                isDisabled={!qrCodeUrl} 
                endContent={<FiUpload />}
              >
                {isSubmitting ? 'กำลังดำเนินการ...' : 'โอนเงินแล้ว - อัปโหลดสลิป'}
              </Button>
            </ModalFooter>
          </>
        )}

        {/* Step 1: Form */}
        {step === 1 && (
          <form onSubmit={handleSubmitForm}>
            <ModalHeader>
              <div className="w-full">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  ข้อมูลผู้สมัคร
                </h2>
                <p className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                  {camp.name}
                </p>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm font-semibold">{error}</p>
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="w-full">
                    <Input 
                      label="ชื่อ - นามสกุล" 
                      placeholder="กรอกชื่อ - นามสกุล" 
                      value={formData.name} 
                      onValueChange={(v) => setFormData({ ...formData, name: v })} 
                      required 
                      size="lg"
                      variant="bordered"
                      classNames={{ 
                        base: "max-w-full",
                        inputWrapper: "border-2 border-gray-300 hover:border-orange-400" 
                      }} 
                    />
                  </div>
                  
                  <div className="w-full">
                    <Input 
                      type="email" 
                      label="อีเมล" 
                      placeholder="yourmail@example.com" 
                      value={formData.email} 
                      onValueChange={(v) => setFormData({ ...formData, email: v })} 
                      required 
                      size="lg"
                      variant="bordered"
                      classNames={{ 
                        base: "max-w-full",
                        inputWrapper: "border-2 border-gray-300 hover:border-orange-400" 
                      }} 
                    />
                  </div>
                  
                  <div className="w-full">
                    <Input 
                      type="tel" 
                      label="เบอร์โทรศัพท์" 
                      placeholder="0812345678" 
                      value={formData.phone} 
                      onValueChange={(v) => setFormData({ ...formData, phone: v })} 
                      required 
                      size="lg"
                      variant="bordered"
                      classNames={{ 
                        base: "max-w-full",
                        inputWrapper: "border-2 border-gray-300 hover:border-orange-400" 
                      }}
                      description={formData.phone ? "ใช้เบอร์จากการตั้งค่าโปรไฟล์" : "กรุณาตั้งค่าเบอร์โทรศัพท์ในโปรไฟล์"}
                    />
                  </div>
                </div>

                <Divider className="my-2" />

                {/* Camp Info Card */}
                <Card className="p-4 border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex gap-3">
                    {camp.image && (
                      <Image 
                        src={camp.image} 
                        alt={camp.name} 
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0" 
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 truncate">
                        {camp.name}
                      </h3>
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <p>📅 {camp.date}</p>
                        <p>📍 {camp.location}</p>
                        <p>⏰ ปิดรับ: {camp.deadline}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Promo Code Section */}
                {!isFree && (
                  <>
                    <Divider className="my-2" />
                    
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <FiTag className="text-orange-500" />
                        รหัสโปรโมชั่น
                      </h3>
                      
                      {!promoApplied ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="กรอกรหัสส่วนลด"
                            value={promoCode}
                            onValueChange={setPromoCode}
                            variant="bordered"
                            classNames={{ 
                              inputWrapper: "border-2 border-gray-300" 
                            }}
                            size="lg"
                          />
                          <Button
                            color="warning"
                            className="font-bold px-6"
                            onPress={handleValidatePromo}
                            isLoading={isValidatingPromo}
                            isDisabled={!promoCode.trim()}
                            size="lg"
                            endContent={<FiCheck />}
                          >
                            ใช้
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FiCheckCircle className="text-green-600" />
                            <div>
                              <p className="font-bold text-green-700 dark:text-green-400">
                                {promoCode}
                              </p>
                              <p className="text-sm text-green-600 dark:text-green-500">
                                {promoMessage}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            isIconOnly
                            onPress={handleRemovePromo}
                          >
                            <FiX />
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <Divider className="my-2" />

                {/* Price Summary */}
                <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-3 border-orange-300 shadow-lg">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">ค่าค่าย</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {basePrice === 0 ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <FiGift />
                            ฟรี!
                          </span>
                        ) : (
                          `฿${basePrice.toLocaleString()}`
                        )}
                      </span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-400">
                        <span>ส่วนลด</span>
                        <span className="font-semibold">-฿{discount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <Divider />
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-gray-800 dark:text-gray-200">รวมทั้งหมด</span>
                      <span className="text-3xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                        {isFree ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <FiGift />
                            ฟรี!
                          </span>
                        ) : (
                          `฿${finalPrice.toLocaleString()}`
                        )}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </ModalBody>
            <ModalFooter className="flex-wrap gap-2">
              
              <Button
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg flex-1 min-w-0"
                endContent={isFree ? <FiGift /> : <FiCreditCard />}
                isLoading={isSubmitting}
                size="lg"
              >
                <span className="truncate">
                  {isSubmitting ? 'กำลังดำเนินการ...' : (isFree ? 'ยืนยันการสมัคร (ฟรี)' : 'ยืนยันและชำระเงิน')}
                </span>
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
