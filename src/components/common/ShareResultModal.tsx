// src/components/common/ShareResultModal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button,
} from '@heroui/react';
import { FiDownload, FiShare2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ShareResultCard from './ShareResultCard';
import { PathFinderResultWithDetails } from '@/types';

// ── Component ─────────────────────────────────────────────────────────────

interface ShareResultModalProps {
    result: PathFinderResultWithDetails;
    isOpen: boolean;
    onClose: () => void;
    filename?: string;
    title?: string;
}

export default function ShareResultModal({
    result,
    isOpen,
    onClose,
    filename = 'skillscout-pathfinder',
    title = 'ผลลัพธ์ Path Finder - SkillScout',
}: ShareResultModalProps) {
    const previewWrapperRef = useRef<HTMLDivElement>(null);
    const captureRef = useRef<HTMLDivElement>(null);
    const [capturing, setCapturing] = useState(false);
    const [previewScale, setPreviewScale] = useState(0.25);

    useEffect(() => {
        if (!isOpen) return;
        const measure = () => {
            if (previewWrapperRef.current) {
                const containerW = previewWrapperRef.current.clientWidth;
                const maxH = window.innerHeight - 300;
                const scaleFromW = containerW / 1080;
                const scaleFromH = maxH / 1920;
                setPreviewScale(Math.min(scaleFromW, scaleFromH));
            }
        };
        const timer = setTimeout(measure, 80);
        return () => clearTimeout(timer);
    }, [isOpen]);

    // ── Capture → Blob ────────────────────────────────────────────────────
    const captureCard = async (): Promise<Blob | null> => {
        const el = captureRef.current;
        if (!el) return null;

        // รอ font โหลดก่อน
        await document.fonts.ready;

        const { toPng } = await import('html-to-image');

        const dataUrl = await toPng(el, {
            width: 1080,
            height: 1920,
            pixelRatio: 1,
            style: {
                transform: 'none',
                transformOrigin: 'unset',
                opacity: '1',
            },
            filter: (node: HTMLElement) => {
                if (node.nodeType === 1) {
                    const style = (node as Element).getAttribute('style') ?? '';
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

        // แปลง dataUrl → Blob
        const res = await fetch(dataUrl);
        return res.blob();
    };

    // ── Download ──────────────────────────────────────────────────────────
    const handleDownload = async () => {
        try {
            setCapturing(true);
            const blob = await captureCard();
            if (!blob) throw new Error('ไม่สามารถสร้างรูปภาพได้');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.png`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('บันทึกรูปภาพสำเร็จ! 🎉');
        } catch (err) {
            console.error(err);
            toast.error('ไม่สามารถบันทึกรูปภาพได้');
        } finally {
            setCapturing(false);
        }
    };

    // ── Share ─────────────────────────────────────────────────────────────
    const handleShare = async () => {
        try {
            setCapturing(true);
            const blob = await captureCard();
            if (!blob) throw new Error('ไม่สามารถสร้างรูปภาพได้');
            const file = new File([blob], `${filename}.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title,
                    text: 'ดูผลลัพธ์ Path Finder ของฉันจาก SkillScout!',
                    files: [file],
                });
                toast.success('แชร์สำเร็จ! 🎉');
            } else if (navigator.clipboard?.write) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob }),
                ]);
                toast.success('คัดลอกรูปไปยัง Clipboard แล้ว!');
            } else {
                await handleDownload();
                return;
            }
        } catch (err) {
            console.error(err);
            toast.error('แชร์ไม่สำเร็จ ลองบันทึกรูปแทน');
        } finally {
            setCapturing(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="3xl"
            scrollBehavior="inside"
            classNames={{
                base: 'bg-white border border-gray-200 rounded-2xl',
                header: 'border-b border-gray-100',
                footer: 'border-t border-gray-100',
            }}
        >
            <ModalContent>
                {/* ── Header ── */}
                <ModalHeader className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-[#1a1a1a]">แชร์ผลลัพธ์ของคุณ</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            ขนาด 1080 × 1920 px (Instagram Stories / Mobile)
                        </p>
                    </div>
                    {/* <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    >
                        <FiX size={20} />
                    </button> */}
                </ModalHeader>

                {/* ── Body ── */}
                <ModalBody className="px-6 py-4">

                    {/*
                      Hidden card สำหรับ capture — render ขนาดจริง 1080×1920
                      ใช้ opacity:0 + left นอกหน้าจอ
                      (ไม่ใช้ visibility:hidden / display:none เพราะ html-to-image จะได้ภาพขาว)
                    */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: '-1100px',
                            width: '1080px',
                            height: '1920px',
                            opacity: 0,
                            pointerEvents: 'none',
                            zIndex: -1,
                        }}
                    >
                        <ShareResultCard ref={captureRef} result={result} />
                    </div>

                    {/* Preview — scale ลงให้พอดี modal */}
                    <div ref={previewWrapperRef} className="w-full flex justify-center">
                        <div
                            className="rounded-2xl border border-gray-200 overflow-hidden"
                            style={{
                                width: `${Math.round(1080 * previewScale)}px`,
                                height: `${Math.round(1920 * previewScale)}px`,
                                position: 'relative',
                                flexShrink: 0,
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '1080px',
                                    transformOrigin: 'top left',
                                    transform: `scale(${previewScale})`,
                                }}
                            >
                                <ShareResultCard result={result} />
                            </div>
                        </div>
                    </div>

                    {/* <p className="text-xs text-gray-400 text-center mt-3">
                        รูปจริง 1080 × 1920 px
                    </p> */}
                </ModalBody>

                {/* ── Footer ── */}
                <ModalFooter className="px-6 py-4 flex gap-3 justify-end">
                    <Button
                        variant="flat"
                        onPress={onClose}
                        isDisabled={capturing}
                        className="text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200"
                    >
                        ปิด
                    </Button>
                    <Button
                        variant="bordered"
                        startContent={<FiDownload className="w-4 h-4" />}
                        onPress={handleDownload}
                        isLoading={capturing}
                        className="border-[#F2B33D] text-[#F2B33D] hover:bg-[#F2B33D] hover:text-[#1a1a1a] transition-colors font-semibold"
                    >
                        บันทึกรูป
                    </Button>
                    <Button
                        startContent={!capturing ? <FiShare2 className="w-4 h-4" /> : undefined}
                        onPress={handleShare}
                        isLoading={capturing}
                        className="bg-[#F2B33D] text-[#1a1a1a] font-bold hover:bg-[#d69a2e] transition-colors"
                    >
                        แชร์เลย
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
