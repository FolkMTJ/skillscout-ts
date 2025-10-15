// src/components/organizer/SimpleMultiImageUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@heroui/react';
import { FiPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface SimpleMultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label: string;
  maxImages?: number;
}

export default function SimpleMultiImageUpload({ values, onChange, label, maxImages = 10 }: SimpleMultiImageUploadProps) {
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
      if (!cloudName) throw new Error('Cloudinary not configured');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Upload failed');
      }

      const data = await response.json();
      onChange([...values, data.secure_url]);
      toast.success('อัปโหลดสำเร็จ!');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด: ' + (error instanceof Error ? error.message : 'Upload failed'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        <span className="text-xs text-gray-500">{values.length}/{maxImages}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {values.map((url, index) => (
          <div key={index} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
            <Button isIconOnly size="sm" color="danger" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" onPress={() => onChange(values.filter((_, i) => i !== index))}>
              <FiX className="w-3 h-3" />
            </Button>
          </div>
        ))}

        {values.length < maxImages && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center bg-white">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <Button isIconOnly color="primary" variant="flat" onPress={() => fileInputRef.current?.click()} isLoading={uploading}>
              <FiPlus />
            </Button>
          </div>
        )}
      </div>

      {values.length === 0 && <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีรูปภาพ</p>}
    </div>
  );
}
