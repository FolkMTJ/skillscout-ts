// src/components/common/ShareResultButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { FiShare2 } from 'react-icons/fi';
import ShareResultModal from './ShareResultModal';
import { PathFinderResultWithDetails } from '@/types';

interface ShareResultButtonProps {
  result: PathFinderResultWithDetails;
  filename?: string;
  title?: string;
}

export default function ShareResultButton({
  result,
  filename = 'skillscout-pathfinder',
  title = 'ผลลัพธ์ Path Finder - SkillScout',
}: ShareResultButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="lg"
        startContent={<FiShare2 className="w-5 h-5" />}
        onPress={() => setOpen(true)}
        className="bg-[#F2B33D] text-[#1a1a1a] font-black px-8 rounded-2xl h-16 text-base border border-[#F2B33D]/60 hover:bg-[#d69a2e] transition-all"
      >
        แชร์ผลลัพธ์
      </Button>

      <ShareResultModal
        result={result}
        isOpen={open}
        onClose={() => setOpen(false)}
        filename={filename}
        title={title}
      />
    </>
  );
}
