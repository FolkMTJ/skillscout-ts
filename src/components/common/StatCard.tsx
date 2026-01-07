// src/components/common/StatCard.tsx
/**
 * Stat Card Component
 * Card สำหรับแสดงสถิติใน Dashboard
 * ใช้สีตาม Brand CI เท่านั้น
 */

import { Card, CardBody } from '@heroui/react';
import { STAT_CARD_COLORS } from '@/lib/design-system';
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
  const bgColor = STAT_CARD_COLORS[color];

  return (
    <Card 
      className={`shadow-lg hover:shadow-xl transition-shadow ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white/80 text-sm mb-2">{title}</p>
            <p className="text-white text-3xl font-bold">{value}</p>
          </div>
          {icon && (
            <div className="text-white/30 text-5xl">
              {icon}
            </div>
          )}
        </div>
      </CardBody>
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
