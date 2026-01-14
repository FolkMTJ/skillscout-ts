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

// Map gradient to color scheme
const getColorScheme = (gradient: string) => {
  if (gradient.includes('blue')) return {
    border: 'border-blue-500',
    iconBg: 'bg-blue-50',
    icon: 'text-blue-500',
    title: 'text-blue-600',
    value: 'text-blue-700'
  };
  if (gradient.includes('green')) return {
    border: 'border-green-500',
    iconBg: 'bg-green-50',
    icon: 'text-green-500',
    title: 'text-green-600',
    value: 'text-green-700'
  };
  if (gradient.includes('orange')) return {
    border: 'border-orange-500',
    iconBg: 'bg-orange-50',
    icon: 'text-orange-500',
    title: 'text-orange-600',
    value: 'text-orange-700'
  };
  if (gradient.includes('purple')) return {
    border: 'border-purple-500',
    iconBg: 'bg-purple-50',
    icon: 'text-purple-500',
    title: 'text-purple-600',
    value: 'text-purple-700'
  };
  if (gradient.includes('pink')) return {
    border: 'border-pink-500',
    iconBg: 'bg-pink-50',
    icon: 'text-pink-500',
    title: 'text-pink-600',
    value: 'text-pink-700'
  };
  return {
    border: 'border-gray-500',
    iconBg: 'bg-gray-50',
    icon: 'text-gray-500',
    title: 'text-gray-600',
    value: 'text-gray-700'
  };
};

export default function StatCard({ title, value, icon: Icon, gradient }: StatCardProps) {
  const colors = getColorScheme(gradient);
  
  return (
    <Card className={`border-2 ${colors.border} bg-white p-6 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${colors.title} text-sm font-medium mb-2`}>{title}</p>
          <p className={`text-3xl font-bold ${colors.value}`}>{value}</p>
        </div>
        <div className={`${colors.iconBg} p-4 rounded-xl`}>
          <Icon className={`w-8 h-8 ${colors.icon}`} />
        </div>
      </div>
    </Card>
  );
}
