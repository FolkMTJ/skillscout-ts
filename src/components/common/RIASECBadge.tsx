// src/components/common/RIASECBadge.tsx
/**
 * RIASEC Badge Component
 * ใช้แสดง RIASEC codes ทั้งระบบ
 */

import { BADGE_STYLES } from '@/lib/design-system';

interface RIASECBadgeProps {
  code: string;
  size?: 'small' | 'default' | 'large';
  className?: string;
}

export function RIASECBadge({ code, size = 'default', className = '' }: RIASECBadgeProps) {
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    default: 'w-10 h-10 text-base',
    large: 'w-12 h-12 text-lg',
  };

  return (
    <div
      className={`bg-[#F2B33D] rounded-full flex items-center justify-center font-bold text-white ${sizeClasses[size]} ${className}`}
    >
      {code}
    </div>
  );
}
