// src/components/common/IconContainer.tsx
/**
 * Icon Container Component
 * วงกลมสำหรับใส่ icon
 */

import { ICON_CONTAINER } from '@/lib/design-system';

interface IconContainerProps {
  children: React.ReactNode;
  size?: 'small' | 'default' | 'large';
  className?: string;
}

export function IconContainer({ children, size = 'default', className = '' }: IconContainerProps) {
  const sizeClasses = {
    small: 'w-10 h-10',
    default: 'w-16 h-16',
    large: 'w-20 h-20',
  };

  return (
    <div
      className={`bg-[#F2B33D] rounded-full flex items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      {children}
    </div>
  );
}
