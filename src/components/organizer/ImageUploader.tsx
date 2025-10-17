// src/components/organizer/ImageUploader.tsx
'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { FiX, FiImage } from 'react-icons/fi';
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label: string;
  description?: string;
}

export default function ImageUploader({ value, onChange, label, description }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      
      {value ? (
        <div className="relative">
          <Image  
            src={value} 
            alt="Uploaded" 
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            isIconOnly
            size="sm"
            color="danger"
            className="absolute top-2 right-2"
            onPress={() => onChange('')}
          >
            <FiX className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <CldUploadWidget
          uploadPreset="skillscout"
          onSuccess={(result: CloudinaryUploadWidgetResults) => {
            if (typeof result.info === 'object' && 'secure_url' in result.info) {
              onChange(result.info.secure_url);
              toast.success('อัปโหลดรูปภาพสำเร็จ!');
            }

            setIsUploading(false);
          }}
          onError={() => {
            toast.error('เกิดข้อผิดพลาดในการอัปโหลด');
            setIsUploading(false);
          }}
          options={{
            folder: 'skillscout/camps',
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
              className="border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors rounded-lg p-8 text-center cursor-pointer bg-white"
            >
              <FiImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                {isUploading ? 'กำลังอัปโหลด...' : 'คลิกเพื่ออัปโหลดรูปภาพ'}
              </p>
              <p className="text-xs text-gray-500">
                รองรับ JPG, PNG, WEBP (สูงสุด 5MB)
              </p>
            </div>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}
