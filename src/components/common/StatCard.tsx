// src/components/common/StatCard.tsx
/**
 * Stat Card Component
 * Card สำหรับแสดงสถิติใน Dashboard
 */

import { Card } from '@heroui/react';
import { ReactNode } from 'react';

type StatCardColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: StatCardColor;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  color = 'primary',
  className = ''
}: StatCardProps) {
  // Map สี icon ตาม color
  const colorMap: Record<StatCardColor, string> = {
    'primary': 'text-[#F2B33D]',
    'secondary': 'text-[#F97316]',
    'success': 'text-green-600',
    'danger': 'text-red-600',
    'warning': 'text-orange-600',
    'neutral': 'text-gray-600',
  };

  const iconColor = colorMap[color] || 'text-gray-600';
  const progressColor = color === 'primary' ? 'bg-[#F2B33D]' :
    color === 'secondary' ? 'bg-[#F97316]' :
      color === 'success' ? 'bg-green-500' :
        color === 'danger' ? 'bg-red-500' :
          color === 'warning' ? 'bg-orange-500' :
            'bg-gray-500';

  return (
    <Card className={`border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 ${className}`}>
      <div className="p-5 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{value}</h3>
        </div>
        {icon && (
          <div className="p-3 rounded-xl">
            <div className={`text-3xl ${iconColor}`}>
              {icon}
            </div>
          </div>
        )}
      </div>
      {/* Progress bar */}
      <div className={`h-1 w-full bg-opacity-20 ${progressColor}`}>
        <div className={`h-full ${progressColor} w-[70%]`}></div>
      </div>
    </Card>
  );
}

/**
 * Usage Example:
 * 
 * import { StatCard } from '@/components/common';
 * import { FiUsers } from 'react-icons/fi';
 * 
 * <StatCard 
 *   title="ค่ายทั้งหมด" 
 *   value={20}
 *   icon={<FiUsers />}
 *   color="primary"
 * />
 */
