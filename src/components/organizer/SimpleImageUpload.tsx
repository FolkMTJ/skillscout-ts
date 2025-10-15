// src/components/organizer/SimpleImageUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@heroui/react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface SimpleImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label: string;
}

export default function SimpleImageUpload({ value, onChange, label }: SimpleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'skillscout');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error('Cloudinary not configured');
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Upload error:', error);
        throw new Error(error.error?.message || 'Upload failed');
      }

      const data = await response.json();
      onChange(data.secure_url);
      toast.success('อัปโหลดสำเร็จ!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('เกิดข้อผิดพลาด: ' + (error instanceof Error ? error.message : 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      
      {value ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
          <Button isIconOnly size="sm" color="danger" className="absolute top-2 right-2" onPress={() => onChange('')}>
            <FiX />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
          <FiImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <Button color="primary" variant="flat" startContent={<FiUpload />} onPress={() => fileInputRef.current?.click()} isLoading={uploading}>
            {uploading ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพ'}
          </Button>
          <p className="text-xs text-gray-500 mt-2">JPG, PNG, WEBP (สูงสุด 5MB)</p>
        </div>
      )}
    </div>
  );
}
