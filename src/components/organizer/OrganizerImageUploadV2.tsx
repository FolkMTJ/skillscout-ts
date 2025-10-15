"use client";

import React, { useState } from 'react';
import { Button } from '@heroui/react';
import { FiUpload, FiX, FiUser } from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface OrganizerImageUploadV2Props {
    organizerName: string;
    imageUrl: string;
    onImageChange: (url: string) => void;
}

/**
 * คอมโพเนนต์อัปโหลดรูปผู้จัดค่าย (เวอร์ชั่น 2 - รองรับทั้ง Cloudinary และ Base64)
 * จะลองใช้ Cloudinary ก่อน ถ้าไม่สำเร็จจะใช้ Base64 แทน
 */
export default function OrganizerImageUploadV2({ 
    organizerName, 
    imageUrl, 
    onImageChange 
}: OrganizerImageUploadV2Props) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(imageUrl);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // ตรวจสอบขนาดไฟล์ (จำกัด 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('ไฟล์ใหญ่เกินไป (สูงสุด 5MB)');
            return;
        }

        // ตรวจสอบประเภทไฟล์
        if (!file.type.startsWith('image/')) {
            toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
            return;
        }

        try {
            setIsUploading(true);

            // ลองใช้ Cloudinary ก่อน
            if (cloudName) {
                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', 'skillscout');

                    const response = await fetch(
                        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                        {
                            method: 'POST',
                            body: formData,
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        if (data.secure_url) {
                            setPreviewUrl(data.secure_url);
                            onImageChange(data.secure_url);
                            toast.success('อัปโหลดรูปสำเร็จ!');
                            return;
                        }
                    }
                } catch (cloudinaryError) {
                    console.warn('Cloudinary upload failed, falling back to base64:', cloudinaryError);
                }
            }

            // Fallback: ใช้ Base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPreviewUrl(base64String);
                onImageChange(base64String);
                toast.success('อัปโหลดรูปสำเร็จ! (ใช้ Base64)');
            };
            reader.onerror = () => {
                toast.error('ไม่สามารถอ่านไฟล์ได้');
            };
            reader.readAsDataURL(file);

        } catch (error) {
            console.error('Upload error:', error);
            toast.error('เกิดข้อผิดพลาดในการอัปโหลด');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl('/api/placeholder/100/100');
        onImageChange('/api/placeholder/100/100');
        toast.success('ลบรูปแล้ว');
    };

    const isPlaceholder = previewUrl === '/api/placeholder/100/100' || !previewUrl;

    return (
        <div className="flex items-center gap-4">
            {/* แสดงรูปภาพ */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                {isPlaceholder ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <FiUser className="w-10 h-10 text-gray-400" />
                    </div>
                ) : (
                    <Image
                        src={previewUrl}
                        alt={organizerName}
                        fill
                        className="object-cover"
                        sizes="80px"
                    />
                )}
                
                {/* Loading overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                )}
            </div>

            {/* ข้อมูลและปุ่ม */}
            <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-white">{organizerName}</p>
                <div className="flex gap-2 mt-2">
                    <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<FiUpload />}
                        isLoading={isUploading}
                        onPress={() => document.getElementById(`organizer-upload-${organizerName}`)?.click()}
                    >
                        {isPlaceholder ? 'อัปโหลดรูป' : 'เปลี่ยนรูป'}
                    </Button>
                    
                    {!isPlaceholder && (
                        <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            startContent={<FiX />}
                            onPress={handleRemove}
                            isDisabled={isUploading}
                        >
                            ลบ
                        </Button>
                    )}
                </div>
                
                <input
                    id={`organizer-upload-${organizerName}`}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                />
                
                {!cloudName && (
                    <p className="text-xs text-orange-500 mt-1">
                        ⚠️ ใช้ Base64 (Cloudinary ไม่พร้อมใช้งาน)
                    </p>
                )}
            </div>
        </div>
    );
}
