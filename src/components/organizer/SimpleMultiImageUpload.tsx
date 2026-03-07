// src/components/organizer/SimpleMultiImageUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { FiPlus, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface SimpleMultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  maxImages?: number;
}

export default function SimpleMultiImageUpload({
  values,
  onChange,
  label,
  maxImages = 8,
}: SimpleMultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) { toast.error(`${file.name}: ไม่ใช่ไฟล์รูปภาพ`); return null; }
    if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name}: ขนาดเกิน 5MB`); return null; }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) { toast.error('Cloudinary ไม่ได้ตั้งค่า'); return null; }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'skillscout');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.secure_url || null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = maxImages - values.length;
    const toUpload = files.slice(0, remaining);
    if (files.length > remaining) toast(`เพิ่มได้อีก ${remaining} รูป (ถูกตัดให้เหลือ ${remaining} รูป)`, { icon: 'ℹ️' });

    setUploading(true);
    setUploadingCount(toUpload.length);

    const newUrls: string[] = [];
    for (const file of toUpload) {
      try {
        const url = await uploadFile(file);
        if (url) newUrls.push(url);
      } catch {
        toast.error(`อัปโหลด ${file.name} ไม่สำเร็จ`);
      }
      setUploadingCount(prev => prev - 1);
    }

    if (newUrls.length > 0) {
      onChange([...values, ...newUrls]);
      toast.success(`อัปโหลด ${newUrls.length} รูปสำเร็จ!`);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const isFull = values.length >= maxImages;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        {label && <span className="text-sm font-semibold text-gray-600">{label}</span>}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-auto ${isFull ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
          {values.length}/{maxImages}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* Existing images */}
        {values.map((url, index) => (
          <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
            >
              <FiX size={12} />
            </button>
            <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
              #{index + 1}
            </span>
          </div>
        ))}

        {/* Upload slots / placeholders */}
        {!isFull && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-white hover:border-[#F2B33D] hover:bg-orange-50 transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#F2B33D]" />
                {uploadingCount > 0 && (
                  <span className="text-[10px] text-gray-400">{uploadingCount} รูป</span>
                )}
              </>
            ) : (
              <>
                <FiPlus size={20} className="text-gray-400 group-hover:text-[#F2B33D] transition-colors" />
                <span className="text-[10px] text-gray-400 group-hover:text-[#F2B33D] transition-colors">เพิ่มรูป</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Empty state */}
      {values.length === 0 && !uploading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:border-[#F2B33D] hover:bg-orange-50 transition-all group"
        >
          <FiImage size={28} className="text-gray-300 group-hover:text-[#F2B33D] mb-2 transition-colors" />
          <p className="text-sm text-gray-400 font-medium group-hover:text-[#F2B33D] transition-colors">คลิกเพื่อเพิ่มรูปบรรยากาศ</p>
          <p className="text-xs text-gray-300 mt-1">รองรับหลายไฟล์พร้อมกัน · สูงสุด {maxImages} รูป</p>
        </div>
      )}

      {/* Full state hint */}
      {isFull && (
        <p className="text-xs text-center text-red-400">ครบ {maxImages} รูปแล้ว — ลบรูปเก่าก่อนเพิ่มรูปใหม่</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
