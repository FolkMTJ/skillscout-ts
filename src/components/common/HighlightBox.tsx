// src/components/common/HighlightBox.tsx
/**
 * Highlight Box Component
 * กล่องสำหรับเน้นข้อความสำคัญ
 */

import { HIGHLIGHT_BOX } from '@/lib/design-system';

interface HighlightBoxProps {
  children: React.ReactNode;
  variant?: 'primary' | 'info' | 'success';
  className?: string;
}

export function HighlightBox({ children, variant = 'primary', className = '' }: HighlightBoxProps) {
  return (
    <div className={`${HIGHLIGHT_BOX[variant]} ${className}`}>
      {children}
    </div>
  );
}
