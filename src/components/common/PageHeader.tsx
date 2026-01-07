// src/components/common/PageHeader.tsx
/**
 * Page Header Component
 * ส่วนหัวของหน้าที่ใช้ซ้ำ
 */

import { Button } from '@heroui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { TYPOGRAPHY } from '@/lib/design-system';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  backUrl,
  backLabel = 'กลับ',
  actions,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      {backUrl && (
        <Button
          variant="light"
          startContent={<FiArrowLeft className="w-5 h-5" />}
          onClick={() => router.push(backUrl)}
          className="mb-4"
        >
          {backLabel}
        </Button>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={TYPOGRAPHY.h1}>{title}</h1>
          {subtitle && <p className={`${TYPOGRAPHY.subtitle} mt-2`}>{subtitle}</p>}
        </div>

        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
