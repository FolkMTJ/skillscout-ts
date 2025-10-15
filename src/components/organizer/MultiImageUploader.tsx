// src/components/organizer/MultiImageUploader.tsx
'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { FiPlus, FiX } from 'react-icons/fi';
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import toast from 'react-hot-toast';

interface MultiImageUploaderProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label: string;
  maxImages?: number;
}

export default function MultiImageUploader({ 
  values, 
  onChange, 
  label, 
  maxImages = 10 
}: MultiImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleRemove = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  const canAddMore = values.length < maxImages;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
        <span className="text-xs text-gray-500">
          {values.length}/{maxImages}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {values.map((url, index) => (
          <div key={index} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={url} 
              alt={`Gallery ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <Button
              isIconOnly
              size="sm"
              color="danger"
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onPress={() => handleRemove(index)}
            >
              <FiX className="w-3 h-3" />
            </Button>
          </div>
        ))}

        {canAddMore && (
          <CldUploadWidget
            uploadPreset="skillscout"
            onSuccess={(result: CloudinaryUploadWidgetResults) => {
              if (typeof result.info === 'object' && 'secure_url' in result.info) {
                onChange([...values, result.info.secure_url]);
                toast.success('อัปโหลดรูปภาพสำเร็จ!');
              }
              setIsUploading(false);
            }}
            onError={() => {
              toast.error('เกิดข้อผิดพลาดในการอัปโหลด');
              setIsUploading(false);
            }}
            options={{
              folder: 'skillscout/camps/gallery',
              resourceType: 'image',
              maxFileSize: 5000000,
              clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
            }}
          >
            {({ open }) => (
              <div 
                onClick={() => {
                  setIsUploading(true);
                  open();
                }}
                className="border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors h-32 flex items-center justify-center rounded-lg cursor-pointer bg-white"
              >
                <div className="text-center">
                  <FiPlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">
                    {isUploading ? 'กำลังอัปโหลด...' : 'เพิ่มรูป'}
                  </p>
                </div>
              </div>
            )}
          </CldUploadWidget>
        )}
      </div>

      {values.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          ยังไม่มีรูปภาพในแกลเลอรี
        </p>
      )}
    </div>
  );
}
