// src/components/organizer/CampCard.tsx
'use client';

import { Card, Button, Chip } from '@heroui/react';
import { Edit, Trash2 } from 'lucide-react';
import { Camp } from '@/types/camp';

interface CampCardProps {
  camp: Camp;
  pendingCount?: number;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CampCard({ camp, pendingCount = 0, onEdit, onDelete }: CampCardProps) {
  const enrollmentPercentage = ((camp.enrolled || 0) / (camp.capacity || camp.participantCount)) * 100;

  return (
    <Card className="p-4 hover:shadow-lg transition-all border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800 mb-1">{camp.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{camp.description}</p>
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            color="primary"
            onPress={onEdit}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            color="danger"
            onPress={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Chip size="sm" variant="flat" color="primary">
          📍 {camp.location}
        </Chip>
        <Chip size="sm" variant="flat" color="secondary">
          📅 {camp.startDate ? new Date(camp.startDate).toLocaleDateString('th-TH') : camp.date}
        </Chip>
        <Chip size="sm" variant="flat" color="success">
          👥 {camp.enrolled || 0}/{camp.capacity || camp.participantCount}
        </Chip>
        {pendingCount > 0 && (
          <Chip size="sm" variant="flat" color="warning">
            ⏳ รออนุมัติ {pendingCount}
          </Chip>
        )}
        {camp.tags && camp.tags.length > 0 && (
          <Chip size="sm" variant="flat" color="default">
            🏷️ {camp.tags[0]}
          </Chip>
        )}
      </div>

      <div className="bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all ${
            enrollmentPercentage >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
            enrollmentPercentage >= 70 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
            'bg-gradient-to-r from-blue-500 to-blue-600'
          }`}
          style={{ width: `${enrollmentPercentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          {enrollmentPercentage.toFixed(0)}% เต็ม
        </p>
        {camp.price && (
          <p className="text-xs font-semibold text-primary">
            {camp.price}
          </p>
        )}
      </div>
    </Card>
  );
}
