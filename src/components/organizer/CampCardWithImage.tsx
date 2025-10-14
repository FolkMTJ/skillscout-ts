// src/components/organizer/CampCardWithImage.tsx
'use client';

import { Card, Button, Chip } from '@heroui/react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { Camp } from '@/types/camp';

interface CampCardWithImageProps {
  camp: Camp;
  pendingCount?: number;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export default function CampCardWithImage({ 
  camp, 
  pendingCount = 0, 
  onEdit, 
  onDelete,
  onView 
}: CampCardWithImageProps) {
  const enrollmentPercentage = ((camp.enrolled || 0) / (camp.capacity || camp.participantCount)) * 100;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all border border-gray-100">
      {/* รูปปก */}
      <div className="relative h-48 bg-gray-200">
        {camp.image ? (
          <img
            src={camp.image}
            alt={camp.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-gray-400 text-lg">ไม่มีรูปภาพ</span>
          </div>
        )}
        
        {/* Action Buttons Overlay */}
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            isIconOnly
            size="sm"
            color="primary"
            variant="shadow"
            onPress={onView}
            className="bg-white/90 backdrop-blur-sm"
          >
            <FiEye className="w-4 h-4 text-primary" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            color="default"
            variant="shadow"
            onPress={onEdit}
            className="bg-white/90 backdrop-blur-sm"
          >
            <FiEdit2 className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            color="danger"
            variant="shadow"
            onPress={onDelete}
            className="bg-white/90 backdrop-blur-sm"
          >
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Status Badge */}
        {camp.status && (
          <div className="absolute top-2 left-2">
            <Chip
              size="sm"
              variant="shadow"
              color={camp.status === 'active' ? 'success' : 'default'}
              className="bg-white/90 backdrop-blur-sm"
            >
              {camp.status === 'active' ? 'เปิดรับสมัคร' : camp.status}
            </Chip>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
          {camp.name}
        </h3>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[2.5rem]">
          {camp.description}
        </p>

        {/* Info Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Chip size="sm" variant="flat" color="primary">
            📍 {camp.location}
          </Chip>
          <Chip size="sm" variant="flat" color="secondary">
            📅 {camp.startDate ? new Date(camp.startDate).toLocaleDateString('th-TH', { 
              day: '2-digit', 
              month: 'short' 
            }) : camp.date}
          </Chip>
          <Chip size="sm" variant="flat" color="success">
            👥 {camp.enrolled || 0}/{camp.capacity || camp.participantCount}
          </Chip>
          {pendingCount > 0 && (
            <Chip size="sm" variant="flat" color="warning">
              ⏳ รออนุมัติ {pendingCount}
            </Chip>
          )}
        </div>

        {/* Tags */}
        {camp.tags && camp.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {camp.tags.slice(0, 3).map((tag) => (
              <Chip key={tag} size="sm" variant="flat" color="default">
                {tag}
              </Chip>
            ))}
            {camp.tags.length > 3 && (
              <Chip size="sm" variant="flat" color="default">
                +{camp.tags.length - 3}
              </Chip>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>ความคืบหน้า</span>
            <span className="font-semibold">{enrollmentPercentage.toFixed(0)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                enrollmentPercentage >= 90
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : enrollmentPercentage >= 70
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
              style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-xs text-gray-500">
            {camp.registrationDeadline ? (
              <span>
                ปิดรับ: {new Date(camp.registrationDeadline).toLocaleDateString('th-TH', {
                  day: '2-digit',
                  month: 'short',
                })}
              </span>
            ) : (
              <span>ปิดรับ: {camp.deadline}</span>
            )}
          </div>
          {camp.price && (
            <div className="text-sm font-bold text-primary">
              {camp.price}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
