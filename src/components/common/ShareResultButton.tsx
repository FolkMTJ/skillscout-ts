// src/components/common/ShareResultButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { FiShare2 } from 'react-icons/fi';
import ShareResultModal from './ShareResultModal';
import { PathFinderResultWithDetails } from '@/types';
import toast from 'react-hot-toast';

interface ShareResultButtonProps {
  result?: PathFinderResultWithDetails;
  targetRef?: React.RefObject<HTMLDivElement | null>;
  filename?: string;
  title?: string;
  userName?: string;
}

export default function ShareResultButton({
  result,
  targetRef,
  filename = 'skillscout-pathfinder',
  title = 'ผลลัพธ์ Path Finder - SkillScout',
  userName,
}: ShareResultButtonProps) {
  const [open, setOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const handleCustomShare = async () => {
    if (!targetRef?.current) return;
    try {
      setCapturing(true);
      // รอ font โหลดก่อน
      await document.fonts.ready;
      const { toPng } = await import('html-to-image');

      const el = targetRef.current;
      const dataUrl = await toPng(el, {
        pixelRatio: 1,
        style: {
          transform: 'none',
          transformOrigin: 'unset',
          opacity: '1',
        },
        filter: (node: HTMLElement) => {
          if (node.nodeType === 1) {
            const style = (node as Element).getAttribute('style') ?? '';
            // ลบ oklch/lab ออกเพราะ html-to-image มีปัญหากับสี CSS ใหม่
            if (
              style.includes('oklch(') ||
              style.includes('oklab(') ||
              style.includes('lch(') ||
              style.includes('lab(')
            ) {
              (node as Element).removeAttribute('style');
            }
          }
          return true;
        },
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `${filename}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text: 'ดูผลลัพธ์ของฉันจาก SkillScout!',
          files: [file],
        });
        toast.success('แชร์สำเร็จ!');
      } else if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        toast.success('คัดลอกรูปไปยัง Clipboard แล้ว!');
      } else {
        // fallback เป็นดาวน์โหลด
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('บันทึกรูปภาพสำเร็จ!');
      }
    } catch (err) {
      console.error(err);
      toast.error('ไม่สามารถแชร์หรือบันทึกรูปภาพได้');
    } finally {
      setCapturing(false);
    }
  };

  const onPress = () => {
    if (targetRef) {
      handleCustomShare();
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <Button
        size="lg"
        startContent={!capturing ? <FiShare2 className="w-5 h-5" /> : undefined}
        onPress={onPress}
        isLoading={capturing}
        className="bg-[#F2B33D] text-[#1a1a1a] font-black px-8 rounded-2xl h-16 text-base hover:bg-[#d69a2e] transition-all"
      >
        แชร์ผลลัพธ์
      </Button>

      {result && (
        <ShareResultModal
          result={result}
          isOpen={open}
          onClose={() => setOpen(false)}
          filename={filename}
          title={title}
          userName={userName}
        />
      )}
    </>
  );
}
