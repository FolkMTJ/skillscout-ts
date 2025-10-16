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
  Textarea,
  Divider,
  Image,
  Progress,
  Card, // Add Card here
} from '@heroui/react';
import { FaCheckCircle, FaTag, FaQrcode, FaUpload, FaImage, FaClock, FaLightbulb, FaMobileAlt } from 'react-icons/fa';

interface CampData {
  _id: string;
  name: string;
  date: string;
  location: string;
  price: string;
  deadline: string;
  fee?: number;
  organizerId?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  camp: CampData;
}

export default function BookingModal({ isOpen, onClose, camp }: BookingModalProps) {
  const { data: session } = useSession();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    university: '',
    reason: '',
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
  // const [registrationId, setRegistrationId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const basePrice = camp.fee || parseFloat(camp.price.replace(/[^0-9]/g, '')) || 0;
  const finalPrice = basePrice - discount;

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || prev.name,
        email: session.user.email || prev.email,
      }));
    }
  }, [session]);

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return;
    setIsValidatingPromo(true);
    setPromoMessage('');
    
    try {
      const response = await fetch('/api/payment/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, amount: basePrice, campId: camp._id }),
      });
      const result = await response.json();
      if (result.valid) {
        setDiscount(result.discount);
        setPromoApplied(true);
        setPromoMessage(`✓ ส่วนลด ฿${result.discount.toLocaleString()}`);
      } else {
        setDiscount(0);
        setPromoApplied(false);
        setPromoMessage(result.message || 'รหัสไม่ถูกต้อง');
      }
    } catch {
      setPromoMessage('เกิดข้อผิดพลาด');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    await generateQRCode();
  };

  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      const response = await fetch('/api/payment/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalPrice, phoneNumber: '0813259525' }),
      });
      const data = await response.json();
      if (response.ok) setQrCodeUrl(data.qrCode);
      else throw new Error('Failed to generate QR code');
    } catch {
      setError('ไม่สามารถสร้าง QR Code ได้');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('ไฟล์ใหญ่เกิน 5MB');
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
          university: formData.address,
          year: formData.university,
          reason: formData.reason,
        }),
      });
      
      if (!regResponse.ok) {
        const errorData = await regResponse.json();
        throw new Error(errorData.error || 'Failed to create registration');
      }
      
      const registration = await regResponse.json();
      // setRegistrationId(registration.registration._id);

      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: registration.registration._id,
          campId: camp._id,
          userId: session?.user?.email || formData.email,
          userEmail: formData.email, // เพิ่ม
          userName: formData.name, // เพิ่ม
          organizerId: camp.organizerId || 'default-organizer',
          amount: basePrice,
          discount: discount,
          finalAmount: finalPrice,
          promoCode: promoApplied ? promoCode : undefined,
        }),
      });
      if (!paymentResponse.ok) throw new Error('Failed to create payment');
      const payment = await paymentResponse.json();
      setPaymentId(payment.payment._id);
      setStep(3);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSlip = async () => {
    if (!slipFile) {
      setError('กรุณาเลือกไฟล์สลิป');
      return;
    }
    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', slipFile);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'skillscout');

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!uploadResponse.ok) throw new Error('Failed to upload slip');
      const uploadData = await uploadResponse.json();
      const slipUrl = uploadData.secure_url;

      const updateResponse = await fetch(`/api/payment/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slipUrl: slipUrl, status: 'completed' }),
      });
      if (!updateResponse.ok) throw new Error('Failed to update payment');

      setStep(4);
      setTimeout(() => handleClose(), 3000);
    } catch {
      setError('ไม่สามารถอัปโหลดสลิปได้ กรุณาลองใหม่');
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
        address: '',
        university: '',
        reason: '',
      });
      setPromoCode('');
      setPromoApplied(false);
      setDiscount(0);
      setPromoMessage('');
      setQrCodeUrl('');
      setSlipFile(null);
      setSlipPreview('');
      setPaymentId('');
      // setRegistrationId('');
      setUploadProgress(0);
      setError('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      scrollBehavior="inside"
      isDismissable={!isSubmitting && !isUploading}
      classNames={{
        base: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800",
        header: "border-b border-orange-200 dark:border-gray-700",
        body: "py-6",
        footer: "border-t border-orange-200 dark:border-gray-700",
      }}
    >
      <ModalContent>
        {/* Step 4: Success */}
        {step === 4 && (
          <div className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-bounce">
                <FaCheckCircle className="text-green-500 text-5xl" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">อัปโหลดสลิปสำเร็จ!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">เรากำลังตรวจสอบการชำระเงินของคุณ</p>
            <p className="text-sm text-gray-500">คุณจะได้รับอีเมลยืนยันภายใน 24 ชั่วโมง</p>
            <div className="mt-6 p-4 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-start gap-3 text-left">
                <FaClock className="text-amber-600 mt-1 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-bold mb-1">ระบบ Escrow Protection</p>
                  <p>เงินจะถูกโอนให้ผู้จัดค่ายหลังจาก:</p>
                  <p>• คุณยืนยันการเข้าร่วมค่ายเสร็จสิ้น หรือ</p>
                  <p>• 15 วันนับจากวันจบค่าย (อัตโนมัติ)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Upload Slip */}
        {step === 3 && (
          <>
            <ModalHeader>
              <div className="w-full">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">อัปโหลดหลักฐานการโอนเงิน</h2>
                <p className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">กรุณาแนบสลิปการโอนเงินเพื่อยืนยันการชำระ</p>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:border-orange-400 transition-all">
                  {slipPreview ? (
                    <div className="space-y-4">
                      <Image src={slipPreview} alt="Slip Preview" className="mx-auto max-h-64 rounded-lg" />
                      <Button color="warning" variant="flat" onPress={() => { setSlipFile(null); setSlipPreview(''); }}>เปลี่ยนไฟล์</Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">คลิกเพื่ออัปโหลดสลิป</p>
                      <p className="text-sm text-gray-500">รองรับไฟล์ JPG, PNG (สูงสุด 5MB)</p>
                    </label>
                  )}
                </div>
                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} color="warning" className="w-full" />
                    <p className="text-sm text-center text-gray-600">กำลังอัปโหลด... {uploadProgress}%</p>
                  </div>
                )}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-start gap-2">
                  <FaLightbulb className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>เคล็ดลับ:</strong> ตรวจสอบให้แน่ใจว่าสลิปแสดงยอดเงิน ฿{finalPrice.toLocaleString()} ชัดเจน
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={() => setStep(2)} isDisabled={isUploading}>ย้อนกลับ</Button>
              <Button color="warning" className="bg-orange-500 font-bold text-white" onPress={handleUploadSlip} isLoading={isUploading} isDisabled={!slipFile} endContent={<FaImage />}>
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
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">สแกน QR Code เพื่อชำระเงิน</h2>
                <p className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">ชำระเงินผ่าน PromptPay</p>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="text-center space-y-6">
                {isGeneratingQR ? (
                  <div className="py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">กำลังสร้าง QR Code...</p>
                  </div>
                ) : qrCodeUrl ? (
                  <>
                    <div className="bg-white p-6 rounded-2xl shadow-xl inline-block">
                      <Image src={qrCodeUrl} alt="QR Code" width={300} height={300} className="mx-auto" />
                    </div>
                    <div className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ยอดชำระ</p>
                      <p className="text-5xl font-black text-orange-600 dark:text-orange-400">฿{finalPrice.toLocaleString()}</p>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <p className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                        <FaMobileAlt className="text-blue-500" />
                        วิธีการชำระเงิน:
                      </p>
                      <p>1. เปิดแอพธนาคารของคุณ</p>
                      <p>2. เลือกเมนู สแกน QR Code</p>
                      <p>3. สแกน QR Code ด้านบน</p>
                      <p>4. ตรวจสอบยอดเงินให้ถูกต้อง</p>
                      <p>5. ยืนยันการโอนเงิน</p>
                      <p>6. ถ่ายภาพสลิปหรือบันทึกหน้าจอ</p>
                    </div>
                  </>
                ) : (
                  <div className="py-12"><p className="text-red-600">ไม่สามารถสร้าง QR Code ได้</p></div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={() => setStep(1)} isDisabled={isSubmitting}>ย้อนกลับ</Button>
              <Button color="warning" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold" onPress={handleProceedToUpload} isLoading={isSubmitting} isDisabled={!qrCodeUrl} endContent={<FaUpload />}>
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
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">ข้อมูลผู้สมัคร</h2>
                <p className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">{camp.name}</p>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200">ข้อมูลผู้สมัคร</h3>
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  <Input label="ชื่อ - นามสกุล" placeholder="ชื่อ - นามสกุล" value={formData.name} onValueChange={(v) => setFormData({...formData, name: v})} required size="lg" classNames={{inputWrapper: "border-2"}} />
                  <Input type="email" label="อีเมล" placeholder="yourmail@mail.com" value={formData.email} onValueChange={(v) => setFormData({...formData, email: v})} required size="lg" classNames={{inputWrapper: "border-2"}} />
                  <Input type="tel" label="เบอร์โทร" placeholder="0812345678" value={formData.phone} onValueChange={(v) => setFormData({...formData, phone: v})} required size="lg" classNames={{inputWrapper: "border-2"}} />
                  <Input label="ที่อยู่" placeholder="ที่อยู่ของคุณ" value={formData.address} onValueChange={(v) => setFormData({...formData, address: v})} required size="lg" classNames={{inputWrapper: "border-2"}} />
                  <Input label="มหาวิทยาลัย/สถาบัน" placeholder="มหาวิทยาลัยศิลปากร" value={formData.university} onValueChange={(v) => setFormData({...formData, university: v})} required size="lg" classNames={{inputWrapper: "border-2"}} />
                  <Textarea label="เหตุผลที่ต้องการเข้าร่วม" placeholder="บอกเราว่าทำไมคุณถึงสนใจค่ายนี้..." value={formData.reason} onValueChange={(v) => setFormData({...formData, reason: v})} required minRows={3} classNames={{inputWrapper: "border-2"}} />
                </div>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
                    <Image src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400" alt={camp.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">รายละเอียดค่าย</h3>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>วันที่:</strong> {camp.date}</p>
                      <p><strong>สถานที่:</strong> {camp.location}</p>
                      <p><strong>ปิดรับสมัคร:</strong> {camp.deadline}</p>
                    </div>
                  </div>
                  <Divider />
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <FaTag className="text-orange-500" />
                      มีรหัสโปรโมชั่นหรือไม่?
                    </h3>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="กรอกรหัสโปรโมชั่น" 
                        value={promoCode} 
                        onValueChange={setPromoCode} 
                        disabled={promoApplied} 
                        classNames={{inputWrapper: "border-2"}}
                        size="sm" 
                      />
                      <Button 
                        color="warning" 
                        className="font-bold" 
                        onPress={handleValidatePromo} 
                        isLoading={isValidatingPromo} 
                        isDisabled={promoApplied || !promoCode.trim()}
                        size="sm"
                      >
                        ตรวจสอบ
                      </Button>
                    </div>
                    {promoMessage && (
                      <p className={`text-sm mt-2 font-semibold ${
                        promoApplied ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {promoApplied && <FaCheckCircle className="inline mr-1" />}
                        {promoMessage}
                      </p>
                    )}
                  </div>

                  <Divider />

                  <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 shadow-lg">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">ค่าค่าย</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">฿{basePrice.toLocaleString()}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                          <span>ส่วนลด</span>
                          <span className="font-semibold">-฿{discount.toLocaleString()}</span>
                        </div>
                      )}
                      <Divider />
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-base">รวมทั้งหมด</span>
                        <span className="font-black text-orange-600 dark:text-orange-400 text-2xl">฿{finalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={handleClose}>ยกเลิก</Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg" 
                endContent={<FaQrcode />}
              >
                ยืนยันและชำระเงิน
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
