"use client";

import React, { useState } from 'react';
import { FiUser, FiCamera } from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface OrganizerImageUploadProps {
    organizerName: string;
    imageUrl: string;
    onImageChange: (url: string) => void;
}

/**
 * Avatar อัปโหลดรูปผู้จัด — คลิกที่รูปเพื่ออัปโหลด
 */
export default function OrganizerImageUpload({
    organizerName,
    imageUrl,
    onImageChange,
}: OrganizerImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(imageUrl);
    const inputId = `org-upload-${organizerName.replace(/\s/g, '-')}`;
    const isPlaceholder = !previewUrl || previewUrl.includes('/api/placeholder');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('ไฟล์ใหญ่เกินไป (สูงสุด 5MB)'); return; }
        if (!file.type.startsWith('image/')) { toast.error('กรุณาเลือกไฟล์รูปภาพ'); return; }

        try {
            setIsUploading(true);
            const fd = new FormData();
            fd.append('file', file);
            fd.append('upload_preset', 'skillscout');
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            if (!cloudName) throw new Error('Cloudinary ไม่ได้ตั้งค่า');

            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
            if (!res.ok) throw new Error('อัปโหลดไม่สำเร็จ');
            const data = await res.json();
            if (data.secure_url) {
                setPreviewUrl(data.secure_url);
                onImageChange(data.secure_url);
                toast.success('อัปโหลดรูปสำเร็จ!');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'อัปโหลดไม่สำเร็จ');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => document.getElementById(inputId)?.click()}
                disabled={isUploading}
                className="group relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center shrink-0 cursor-pointer hover:border-[#F2B33D] transition-colors"
            >
                {isPlaceholder ? (
                    <FiUser className="w-5 h-5 text-gray-400 group-hover:text-[#F2B33D] transition-colors" />
                ) : (
                    <Image src={previewUrl} alt={organizerName} fill className="object-cover" sizes="40px" />
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiCamera className="w-3.5 h-3.5 text-white" />
                </div>
                {/* Loading overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    </div>
                )}
            </button>
            <input id={inputId} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isUploading} />
        </>
    );
}
