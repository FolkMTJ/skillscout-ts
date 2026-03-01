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
} from '@heroui/react';
import { FiCheckCircle, FiTag, FiUpload, FiImage, FiSmartphone, FiX, FiCheck, FiZap, FiLink, FiClock } from 'react-icons/fi';
import jsQR from 'jsqr';
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
  requiresPortfolio?: boolean;
  portfolioInstructions?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  camp: CampData;
  onRegistrationSuccess?: () => void;
  existingPaymentId?: string;
  existingRegistrationId?: string;
}

export default function BookingModal({ isOpen, onClose, camp, onRegistrationSuccess, existingPaymentId, existingRegistrationId }: BookingModalProps) {
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
  const [, setPromoMessage] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [paymentId, setPaymentId] = useState('');
  const [registrationId, setRegistrationId] = useState('');

  const [slipQrPayload, setSlipQrPayload] = useState('');
  const [qrDetected, setQrDetected] = useState(false);
  const [rdcwSenderName, setRdcwSenderName] = useState('');
  const [organizerName, setOrganizerName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Portfolio
  const [portfolioText, setPortfolioText] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState(['', '', '']);
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [portfolioSubmitted, setPortfolioSubmitted] = useState(false);

  const basePrice = camp.fee || parseFloat(camp.price.replace(/[^0-9]/g, '')) || 0;
  const finalPrice = Math.max(0, basePrice - discount);
  const isFree = finalPrice === 0;
  // Portfolio mode: camp requires portfolio AND user hasn't been approved yet (no existingRegistrationId means new submission)
  const isPortfolioMode = !!(camp.requiresPortfolio && !existingRegistrationId && !existingPaymentId);

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

  // เปิด modal สำหรับการชำระเงินที่ค้างอยู่ → ข้ามไป step 2 ทันที
  useEffect(() => {
    if (isOpen && existingPaymentId && existingRegistrationId) {
      setPaymentId(existingPaymentId);
      setRegistrationId(existingRegistrationId);
      setStep(2);
      generateQRCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, existingPaymentId, existingRegistrationId]);

  // ready_to_pay: portfolio approved, no payment yet → go to step 2 to show QR
  useEffect(() => {
    if (isOpen && existingRegistrationId && !existingPaymentId) {
      setRegistrationId(existingRegistrationId);
      setStep(2);
      generateQRCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, existingRegistrationId, existingPaymentId]);

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

    if (isPortfolioMode) {
      await handlePortfolioRegistration();
      return;
    }

    if (isFree) {
      await handleFreeRegistration();
      return;
    }

    setStep(2);
    await generateQRCode();
  };

  const handlePortfolioRegistration = async () => {
    if (!portfolioText.trim()) {
      toast.error('กรุณากรอกรายละเอียด Portfolio');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Optional file upload
      let fileUrl = '';
      if (portfolioFile) {
        const fd = new FormData();
        fd.append('file', portfolioFile);
        fd.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'skillscout');
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
          { method: 'POST', body: fd }
        );
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          fileUrl = uploadData.secure_url;
        }
      }

      const regResponse = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campId: camp._id,
          userName: formData.name,
          userEmail: formData.email,
          userPhone: formData.phone,
          portfolioText: portfolioText.trim(),
          portfolioLinks: portfolioLinks.filter(l => l.trim()),
          portfolioFileUrl: fileUrl || undefined,
        }),
      });

      if (!regResponse.ok) {
        const errorData = await regResponse.json();
        throw new Error(errorData.error || 'ไม่สามารถส่ง Portfolio ได้');
      }

      toast.success('ส่ง Portfolio สำเร็จ! รอ Organizer ตรวจสอบ');
      setPortfolioSubmitted(true);
      setStep(4);
      onRegistrationSuccess?.();
      setTimeout(() => handleClose(), 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFreeRegistration = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // สร้าง Registration
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
      const newRegistrationId = registration.registration._id;

      // PATCH สถานะเป็น approved ทันที (ไม่ต้องรอชำระเงิน)
      const patchResponse = await fetch(`/api/registrations/${newRegistrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          reviewedBy: 'system',
          reviewedAt: new Date().toISOString(),
          notes: promoApplied
            ? `อนุมัติอัตโนมัติ: ใช้โค้ด ${promoCode} ลด ฿${discount} (ราคาสุทธิ ฿0)`
            : 'อนุมัติอัตโนมัติสำหรับค่ายฟรี'
        })
      });

      if (!patchResponse.ok) {
        console.error('PATCH status failed:', await patchResponse.text());
        // ไม่ throw error - registration ถูกสร้างแล้ว แต่ status อาจไม่ถูก update
      }

      // สร้าง Payment record (สำหรับ tracking promo usage)
      if (promoApplied && discount > 0) {
        await fetch('/api/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationId: newRegistrationId,
            campId: camp._id,
            userId: session?.user?.email || formData.email,
            userEmail: formData.email,
            userName: formData.name,
            organizerId: camp.organizerId || 'default-organizer',
            amount: basePrice,
            discount: discount,
            finalAmount: 0,
            promoCode: promoCode,
            status: 'verified', // อนุมัติอัตโนมัติเพราะ 0 บาท
          }),
        });
      }

      toast.success('สมัครสำเร็จ! ได้รับ Ticket แล้ว');
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
          organizerId: camp.organizerId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setQrCodeUrl(data.qrCode);
        if (data.accountName) setOrganizerName(data.accountName);
      } else {
        throw new Error(data.error || 'ไม่สามารถสร้าง QR Code ได้');
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
      setSlipQrPayload('');
      setQrDetected(false);

      const reader = new FileReader();
      reader.onloadend = () => setSlipPreview(reader.result as string);
      reader.readAsDataURL(file);

      // Try to decode QR code from slip image (client-side)
      const objectUrl = URL.createObjectURL(file);
      const img = document.createElement('img') as HTMLImageElement;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code?.data) {
            setSlipQrPayload(code.data);
            setQrDetected(true);
          }
        }
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;

      setError('');
    }
  };

  const handleProceedToUpload = async () => {
    if (registrationId && paymentId) {
      setStep(3);
      return;
    }

    // ready_to_pay: registration exists (portfolio approved) but no payment yet
    if (registrationId && !paymentId) {
      setIsSubmitting(true);
      setError('');
      try {
        const paymentResponse = await fetch('/api/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationId,
            campId: camp._id,
            userId: session?.user?.email || formData.email,
            userEmail: formData.email || session?.user?.email,
            userName: formData.name || session?.user?.name,
            organizerId: camp.organizerId || 'default-organizer',
            amount: basePrice,
            discount: 0,
            finalAmount: basePrice,
          }),
        });
        if (!paymentResponse.ok) throw new Error('ไม่สามารถสร้างรายการชำระเงินได้');
        const payment = await paymentResponse.json();
        setPaymentId(payment.payment._id);
        setStep(3);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
        setError(message);
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
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
          slipQrPayload: slipQrPayload || undefined,
          status: 'pending'
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('ไม่สามารถบันทึกข้อมูลได้');
      }

      // Verify slip via RDCW — required, no manual fallback
      const verifyRes = await fetch('/api/payment/verify-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, slipQrPayload: slipQrPayload || undefined }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        // Verification failed — show specific error, let user retry
        const errMsg = verifyData.error || 'การตรวจสอบสลิปล้มเหลว กรุณาลองใหม่';
        toast.error(errMsg, { duration: 6000 });
        setError(errMsg);
        setSlipFile(null);
        setSlipPreview('');
        setSlipQrPayload('');
        setQrDetected(false);
        setUploadProgress(0);
        return;
      }

      if (verifyData.senderName) setRdcwSenderName(verifyData.senderName);

      toast.success('ชำระเงินสำเร็จ!');
      setStep(4);
      onRegistrationSuccess?.();
      setTimeout(() => handleClose(), 4000);
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
      setSlipQrPayload('');
      setQrDetected(false);
      setRdcwSenderName('');
      setOrganizerName('');
      setPaymentId('');
      setRegistrationId('');
      setUploadProgress(0);
      setError('');
      setPortfolioText('');
      setPortfolioLinks(['', '', '']);
      setPortfolioFile(null);
      setPortfolioSubmitted(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
      isDismissable={!isSubmitting && !isUploading}
      backdrop="opaque"
      classNames={{
        base: "bg-white dark:bg-gray-900 rounded-3xl shadow-2xl",
        header: "border-b border-gray-100 dark:border-gray-800 p-6",
        body: "p-6",
        footer: "border-t border-gray-100 dark:border-gray-800 p-6 dark:bg-gray-900",
        closeButton: "hover:bg-gray-100 active:bg-gray-200 text-gray-500",
      }}
    >
      <ModalContent>
        {/* --- Step 4: Success State (Full Screen Override) --- */}
        {step === 4 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 animate-appearance-in">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${portfolioSubmitted ? 'bg-orange-50' : 'bg-[#F2B33D]/10'}`}>
              {portfolioSubmitted
                ? <FiClock className="text-5xl text-orange-400" />
                : <FiCheckCircle className="text-5xl text-[#F2B33D]" />}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {portfolioSubmitted ? 'ส่ง Portfolio สำเร็จ!' : isFree ? 'ลงทะเบียนสำเร็จ!' : 'ชำระเงินสำเร็จ!'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-4">
              {portfolioSubmitted
                ? 'รอ Organizer ตรวจสอบ Portfolio ของคุณ เมื่อผ่านการตรวจสอบระบบจะแจ้งผลทางอีเมล'
                : isFree
                  ? 'ขอบคุณที่เข้าร่วมกิจกรรม เตรียมตัวให้พร้อมแล้วเจอกัน!'
                  : 'ระบบยืนยันการชำระเงินแล้ว เตรียมตัวสำหรับค่ายได้เลย!'}
            </p>

            {/* RDCW verified detail */}
            {!isFree && !portfolioSubmitted && rdcwSenderName && (
              <div className="w-full max-w-xs mx-auto mb-6 rounded-xl px-4 py-3 text-sm text-left bg-green-50 border border-green-200">
                <p className="font-semibold text-green-700 mb-1">✓ ตรวจสอบสลิปสำเร็จ</p>
                <p className="text-gray-600">ชื่อผู้โอน: <span className="font-medium">{rdcwSenderName}</span></p>
              </div>
            )}

            <Button
              fullWidth
              className="max-w-xs font-bold bg-[#F2B33D] text-white shadow-lg shadow-[#F2B33D]/20"
              size="lg"
              onPress={handleClose}
            >
              ตกลง, ปิดหน้าต่าง
            </Button>
          </div>
        ) : (
          <>
            {/* --- Header & Stepper --- */}
            <ModalHeader className="flex flex-col gap-2 items-center justify-center">
              {!isFree && !isPortfolioMode && (
                <div className="flex gap-2 mb-1">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`h-2 rounded-full transition-all duration-300 ${step >= s ? "w-8 bg-[#F2B33D]" : "w-2 bg-gray-200 dark:bg-gray-700"
                        }`}
                    />
                  ))}
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {step === 1 && (isPortfolioMode ? "สมัครและส่ง Portfolio" : "กรอกข้อมูลผู้สมัคร")}
                {step === 2 && "ชำระเงิน"}
                {step === 3 && "ยืนยันการโอน"}
              </h2>
            </ModalHeader>

            <ModalBody>
              {/* --- Step 1: Form --- */}
              {step === 1 && (
                <form id="regis-form" onSubmit={handleSubmitForm} className="space-y-6">
                  {/* Camp Info (Small Card) */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                    {camp.image ? (
                      <Image src={camp.image} alt="camp" className="w-14 h-14 rounded-xl object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <FiTag className="text-[#F2B33D]" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{camp.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{camp.date} • {camp.location}</p>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="space-y-4">
                    <Input
                      label="ชื่อ-นามสกุล"
                      placeholder="กรอกชื่อจริง"
                      value={formData.name}
                      onValueChange={(v) => setFormData({ ...formData, name: v })}
                      required
                      variant="bordered"
                      labelPlacement="outside"
                      classNames={{ inputWrapper: "border-gray-200 focus-within:!border-[#F2B33D]" }}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="email"
                        label="อีเมล"
                        placeholder="name@example.com"
                        value={formData.email}
                        onValueChange={(v) => setFormData({ ...formData, email: v })}
                        required
                        variant="bordered"
                        labelPlacement="outside"
                        classNames={{ inputWrapper: "border-gray-200 focus-within:!border-[#F2B33D]" }}
                      />
                      <Input
                        type="tel"
                        label="เบอร์โทรศัพท์"
                        placeholder="0xx-xxx-xxxx"
                        value={formData.phone}
                        onValueChange={(v) => setFormData({ ...formData, phone: v })}
                        required
                        variant="bordered"
                        labelPlacement="outside"
                        classNames={{ inputWrapper: "border-gray-200 focus-within:!border-[#F2B33D]" }}
                      />
                    </div>
                  </div>

                  {/* Portfolio Section */}
                  {isPortfolioMode && (
                    <div className="space-y-4">
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-bold text-gray-700 mb-1">Portfolio</p>
                        {camp.portfolioInstructions && (
                          <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl text-sm text-gray-600 mb-3">
                            <p className="font-semibold text-orange-700 mb-1">คำแนะนำจาก Organizer</p>
                            <p className="whitespace-pre-wrap">{camp.portfolioInstructions}</p>
                          </div>
                        )}
                        <Textarea
                          label="รายละเอียด Portfolio"
                          placeholder="อธิบายประสบการณ์ ทักษะ และผลงานที่เกี่ยวข้อง..."
                          value={portfolioText}
                          onValueChange={setPortfolioText}
                          minRows={4}
                          required
                          variant="bordered"
                          classNames={{ inputWrapper: "border-gray-200 focus-within:!border-[#F2B33D]" }}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <FiLink size={13} /> ลิงก์ผลงาน (ถ้ามี)
                        </label>
                        {portfolioLinks.map((link, i) => (
                          <Input
                            key={i}
                            placeholder="https://github.com/... หรือ Behance, YouTube ฯลฯ"
                            value={link}
                            onValueChange={(v) => {
                              const updated = [...portfolioLinks];
                              updated[i] = v;
                              setPortfolioLinks(updated);
                            }}
                            variant="bordered"
                            size="sm"
                            classNames={{ inputWrapper: "border-gray-200 focus-within:!border-[#F2B33D]" }}
                          />
                        ))}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">ไฟล์แนบ (ถ้ามี)</label>
                        <div className="relative border-2 border-dashed rounded-xl p-4 text-center hover:border-[#F2B33D] transition-colors cursor-pointer">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 10 * 1024 * 1024) { toast.error('ไฟล์ใหญ่เกิน 10MB'); return; }
                                setPortfolioFile(file);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                          />
                          {portfolioFile ? (
                            <div className="flex items-center justify-center gap-2 text-sm text-[#F2B33D] font-medium">
                              <FiCheck /> {portfolioFile.name}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1 py-1 text-gray-400">
                              <FiUpload size={18} />
                              <span className="text-xs">PDF หรือรูปภาพ (ไม่เกิน 10MB)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pricing Section - แสดงเมื่อค่ายมีค่าใช้จ่าย (แม้จะลดเหลือ 0 แล้ว) */}
                  {basePrice > 0 && !isPortfolioMode && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl shadow-sm space-y-4">
                      {/* Promo Input */}
                      <div className="flex gap-2">
                        {promoApplied ? (
                          <div className="flex-1 flex items-center justify-between bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800">
                            <span className="flex items-center gap-2"><FiCheckCircle /> {promoCode}</span>
                            <button onClick={handleRemovePromo} className="hover:text-green-900"><FiX /></button>
                          </div>
                        ) : (
                          <>
                            <Input
                              placeholder="กรอกโค้ดส่วนลด (ถ้ามี)"
                              value={promoCode}
                              onValueChange={setPromoCode}
                              size="sm"
                              variant="flat"
                              classNames={{ input: "text-sm", inputWrapper: "bg-gray-100 dark:bg-gray-700" }}
                            />
                            <Button
                              size="sm"
                              onPress={handleValidatePromo}
                              isLoading={isValidatingPromo}
                              isDisabled={!promoCode}
                              className="bg-gray-800 dark:bg-gray-600 text-white min-w-[80px]"
                            >
                              ใช้โค้ด
                            </Button>
                          </>
                        )}
                      </div>

                      <Divider className="my-2" />

                      {/* Total Price */}
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-gray-500">ยอดชำระสุทธิ</p>
                          {discount > 0 && <p className="text-xs text-green-600">ลดไป ฿{discount.toLocaleString()}</p>}
                        </div>
                        <span className="text-3xl font-black tracking-tight text-[#F2B33D]">
                          ฿{finalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* --- Step 2: Payment QR --- */}
              {step === 2 && (
                <div className="flex flex-col items-center justify-center py-4 space-y-6 animate-appearance-in">
                  {isGeneratingQR ? (
                    <div className="py-12 flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F2B33D]"></div>
                      <p className="text-gray-400 text-sm mt-4">กำลังสร้าง QR Code...</p>
                    </div>
                  ) : qrCodeUrl ? (
                    <>
                      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 dark:shadow-none dark:bg-gray-800 dark:border-gray-700">
                        <Image src={qrCodeUrl} alt="QR Code" width={220} height={220} className="rounded-xl" />
                      </div>

                      <div className="text-center">
                        <p className="text-gray-500 text-sm mb-1">ยอดชำระ</p>
                        <p className="text-3xl font-black text-[#F2B33D]">฿{finalPrice.toLocaleString()}</p>
                      </div>

                      {organizerName && (
                        <p className="text-xs text-gray-500">โอนให้: <strong className="text-gray-700">{organizerName}</strong></p>
                      )}

                      <div className="w-full bg-[#F2B33D]/10 rounded-xl p-4 flex items-start gap-3">
                        <FiSmartphone className="text-[#F2B33D] mt-1 shrink-0" size={18} />
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          สแกนด้วยแอปธนาคารได้ทุกธนาคาร <strong>เมื่อโอนเสร็จแล้วให้บันทึกสลิป</strong> เพื่อใช้อัปโหลดในขั้นตอนถัดไป
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-red-500">ไม่สามารถสร้าง QR Code ได้</p>
                  )}
                </div>
              )}

              {/* --- Step 3: Upload Slip --- */}
              {step === 3 && (
                <div className="space-y-6 animate-appearance-in">
                  <div
                    className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer group
                    ${slipPreview ? 'border-[#F2B33D] bg-[#F2B33D]/5' : 'border-gray-300 hover:border-[#F2B33D] hover:bg-gray-50 dark:hover:bg-gray-800'}
                  `}
                  >
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />

                    {slipPreview ? (
                      <div className="relative flex justify-center">
                        <Image src={slipPreview} alt="Slip" className="max-h-64 w-auto rounded-lg shadow-sm object-contain" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <span className="text-white font-medium flex items-center gap-2"><FiUpload /> เปลี่ยนรูป</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-[#F2B33D]">
                          <FiImage size={32} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-700 dark:text-gray-200">แตะเพื่ออัปโหลดสลิป</p>
                          <p className="text-xs text-gray-400 mt-1">รองรับไฟล์ JPG, PNG</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {qrDetected && !isUploading && (
                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-xl">
                      <FiZap size={13} />
                      <span>พบ QR Code ในสลิป — จะตรวจสอบอัตโนมัติ</span>
                    </div>
                  )}

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-gray-500">
                        <span>กำลังอัปโหลด...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} size="sm" classNames={{ indicator: "bg-[#F2B33D]" }} aria-label="uploading" />
                    </div>
                  )}

                  {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>}
                </div>
              )}
            </ModalBody>

            {/* --- Footer Buttons --- */}
            <ModalFooter>
              {step > 1 && (
                <Button
                  variant="light"
                  onPress={() => setStep(step - 1)}
                  isDisabled={isSubmitting || isUploading}
                  className="text-gray-500 font-medium"
                >
                  ย้อนกลับ
                </Button>
              )}

              {step === 1 && (
                <Button
                  className="bg-[#F2B33D] text-white font-bold shadow-lg shadow-[#F2B33D]/20"
                  fullWidth
                  size="lg"
                  onPress={() => (document.getElementById('regis-form') as HTMLFormElement)?.requestSubmit()}
                  isLoading={isSubmitting}
                >
                  {isPortfolioMode ? 'ส่ง Portfolio' : isFree ? 'ยืนยันการสมัครฟรี' : 'ดำเนินการต่อ'}
                </Button>
              )}

              {step === 2 && (
                <Button
                  className="bg-[#F2B33D] text-white font-bold shadow-lg shadow-[#F2B33D]/20"
                  fullWidth
                  size="lg"
                  onPress={handleProceedToUpload}
                  isDisabled={!qrCodeUrl}
                  endContent={<FiUpload />}
                >
                  โอนเงินแล้ว (แนบสลิป)
                </Button>
              )}

              {step === 3 && (
                <Button
                  className="bg-[#F2B33D] text-white font-bold shadow-lg shadow-[#F2B33D]/20"
                  fullWidth
                  size="lg"
                  onPress={handleUploadSlip}
                  isDisabled={!slipFile}
                  isLoading={isUploading}
                  endContent={<FiCheck />}
                >
                  ยืนยันการโอนเงิน
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
