// src/components/common/StatusChip.tsx
/**
 * Status Chip Component
 * ใช้แสดง status ต่างๆ เช่น demand level, registration status
 */

import { Chip } from '@heroui/react';
import { BADGE_STYLES } from '@/lib/design-system';

type StatusType = 'success' | 'warning' | 'error' | 'info';
type DemandLevel = 'high' | 'medium' | 'low';

interface StatusChipProps {
  type?: StatusType;
  demandLevel?: DemandLevel;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusChip({ type, demandLevel, children, size = 'md' }: StatusChipProps) {
  let className = '';

  if (demandLevel) {
    className = BADGE_STYLES.demand[demandLevel];
  } else if (type) {
    className = BADGE_STYLES.status[type];
  }

  return (
    <Chip size={size} className={className}>
      {children}
    </Chip>
  );
}

// Helper functions
export function DemandChip({ level }: { level: DemandLevel }) {
  const labels = {
    high: 'สูง',
    medium: 'ปานกลาง',
    low: 'ต่ำ',
  };

  return (
    <StatusChip demandLevel={level} size="lg">
      {labels[level]}
    </StatusChip>
  );
}
