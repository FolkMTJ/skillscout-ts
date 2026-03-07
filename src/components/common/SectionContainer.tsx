// src/components/common/SectionContainer.tsx
/**
 * Section Container Component
 * Container มาตรฐานสำหรับแต่ละ section
 */

import { SPACING, SECTION_STYLES } from '@/lib/design-system';

interface SectionContainerProps {
  children: React.ReactNode;
  background?: 'gradient' | 'primary' | 'white' | 'gray';
  size?: 'default' | 'large';
  className?: string;
}

export function SectionContainer({
  children,
  background = 'gradient',
  size = 'default',
  className = '',
}: SectionContainerProps) {
  const bgClass = SECTION_STYLES[background];
  const paddingClass = size === 'large' ? SPACING.sectionPaddingLarge : SPACING.sectionPadding;

  return (
    <div className={`${bgClass} ${paddingClass} ${className}`}>
      <div className={`${SPACING.containerMaxWidth} ${SPACING.containerPadding}`}>
        {children}
      </div>
    </div>
  );
}
