// src/components/organizer/StatCard.tsx
'use client';

import { Card } from '@heroui/react';
import { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: IconType;
  gradient: string;
}

export default function StatCard({ title, value, icon: Icon, gradient }: StatCardProps) {
  return (
    <Card className={`${gradient} text-white p-6 shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <Icon className="w-12 h-12 text-white/40" />
      </div>
    </Card>
  );
}
