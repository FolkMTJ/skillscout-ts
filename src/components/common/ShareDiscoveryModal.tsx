// src/components/common/ShareDiscoveryModal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Modal, ModalContent,
    Button,
} from '@heroui/react';
import { FiDownload, FiShare2, FiEdit2, FiX } from 'react-icons/fi';
import { FaQrcode } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ShareDiscoveryCard, { DiscoveryShareData } from './ShareDiscoveryCard';

interface ShareDiscoveryModalProps {
    data: DiscoveryShareData;
    isOpen: boolean;
    onClose: () => void;
    filename?: string;
    title?: string;
    userName?: string;
}

export default function ShareDiscoveryModal({
    data,
    isOpen,
    onClose,
    filename = 'skillscout-discovery-path',
    title = 'Discovery Path - SkillScout',
    userName,
}: ShareDiscoveryModalProps) {
    const previewWrapperRef = useRef<HTMLDivElement>(null);
    const captureRef = useRef<HTMLDivElement>(null);
    const [capturing, setCapturing] = useState(false);
    const [previewScale, setPreviewScale] = useState(0.25);

    // Name state
    const [displayName, setDisplayName] = useState(userName ?? '');
    const [editingName, setEditingName] = useState(false);
    const [tempName, setTempName] = useState('');

    // QR panel
    const [showQR, setShowQR] = useState(false);
    const [qrUrl, setQrUrl] = useState('https://skillscout.site/discovery');

    // Init 
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setQrUrl(window.location.href);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setDisplayName(userName ?? '');
            setEditingName(false);
            setShowQR(false);
        }
    }, [isOpen, userName]);

    useEffect(() => {
        if (!isOpen) return;
        const measure = () => {
            if (previewWrapperRef.current) {
                const containerW = previewWrapperRef.current.clientWidth;
                // Height based on visual port to avoid scroll
                const maxH = window.innerHeight * 0.75;
                const scaleFromW = (containerW - 32) / 1080;
                const scaleFromH = (maxH - 32) / 1920;
                setPreviewScale(Math.min(scaleFromW, scaleFromH));
            }
        };
        const timer = setTimeout(measure, 100);
        window.addEventListener('resize', measure);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', measure);
        }
    }, [isOpen]);

    const captureCard = async (): Promise<Blob | null> => {
        const el = captureRef.current;
        if (!el) return null;
        await document.fonts.ready;
        const { toPng } = await import('html-to-image');
        const dataUrl = await toPng(el, {
            width: 1080,
            height: 1920,
            pixelRatio: 1,
            style: { transform: 'none', transformOrigin: 'unset', opacity: '1' },
            filter: (node: HTMLElement) => {
                if (node.nodeType === 1) {
                    const style = (node as Element).getAttribute('style') ?? '';
                    if (style.includes('oklch(') || style.includes('oklab(') || style.includes('lch(') || style.includes('lab(')) {
                        (node as Element).removeAttribute('style');
                    }
                }
                return true;
            },
        });
        const res = await fetch(dataUrl);
        return res.blob();
    };

    const handleDownload = async () => {
        try {
            setCapturing(true);
            const blob = await captureCard();
            if (!blob) throw new Error();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.png`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('บันทึกรูปภาพสำเร็จ!');
        } catch { toast.error('ไม่สามารถบันทึกรูปภาพได้'); }
        finally { setCapturing(false); }
    };

    const handleShare = async () => {
        try {
            setCapturing(true);
            const blob = await captureCard();
            if (!blob) throw new Error();
            const file = new File([blob], `${filename}.png`, { type: 'image/png' });
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({ title, text: 'ดูอาชีพที่เหมาะกับฉันจาก SkillScout!', files: [file] });
                toast.success('แชร์สำเร็จ!');
            } else if (navigator.clipboard?.write) {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                toast.success('คัดลอกรูปไปยัง Clipboard แล้ว!');
            } else {
                await handleDownload(); return;
            }
        } catch { toast.error('แชร์ไม่สำเร็จ ลองบันทึกรูปแทน'); }
        finally { setCapturing(false); }
    };

    const effectiveName = displayName || undefined;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="5xl"
            hideCloseButton
            classNames={{
                base: 'bg-white rounded-[32px] overflow-hidden m-4',
            }}
        >
            <ModalContent>
                <div className="flex flex-col md:flex-row w-full bg-white max-h-[90vh]">

                    {/* LEFT: Preview Block */}
                    <div className="w-full md:w-[45%] bg-[#F7F7F5] border-b md:border-b-0 md:border-r border-gray-200 relative flex flex-col items-center justify-center p-6 lg:p-10 shrink-0">
                        <div className="absolute top-6 left-6 text-sm font-bold text-gray-400 bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-200 z-10 hidden md:block">
                            ขนาด Story 1080×1920
                        </div>

                        <div ref={previewWrapperRef} className="w-full h-[300px] md:h-full flex items-center justify-center">
                            <div
                                className="rounded-[24px] border-2 border-[#EBEBEB] shadow-xl overflow-hidden bg-white"
                                style={{
                                    width: `${Math.round(1080 * previewScale)}px`,
                                    height: `${Math.round(1920 * previewScale)}px`,
                                    position: 'relative',
                                    flexShrink: 0
                                }}
                            >
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '1080px', transformOrigin: 'top left', transform: `scale(${previewScale})` }}>
                                    <ShareDiscoveryCard data={data} userName={effectiveName} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Controls Block */}
                    <div className="w-full md:w-[55%] flex flex-col p-6 lg:p-10 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-black text-[#2C2C2C] mb-2 tracking-tight">แชร์ผลลัพธ์</h2>
                                <p className="text-gray-500 font-medium text-base sm:text-lg">บันทึกหรือแชร์เพื่อบอกเพื่อนๆ ของคุณ</p>
                            </div>
                            <button onClick={onClose} className="w-12 h-12 shrink-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Name Edit Section */}
                        <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 mb-8 flex flex-col gap-3 shadow-sm">
                            <span className="text-sm font-black text-gray-400 uppercase tracking-wider">ชื่อบนรูปภาพ</span>
                            {editingName ? (
                                <div className="flex bg-gray-50 rounded-xl overflow-hidden border-2 border-[#F2B33D] focus-within:ring-4 focus-within:ring-[#F2B33D]/20 transition-all">
                                    <input
                                        autoFocus
                                        value={tempName}
                                        onChange={e => setTempName(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') { setDisplayName(tempName); setEditingName(false); }
                                            if (e.key === 'Escape') setEditingName(false);
                                        }}
                                        className="flex-1 bg-transparent px-4 py-3 text-[#2C2C2C] font-bold outline-none text-lg"
                                        placeholder="ใส่ชื่อที่ต้องการแสดง..."
                                    />
                                    <button
                                        onClick={() => { setDisplayName(tempName); setEditingName(false); }}
                                        className="bg-[#F2B33D] text-[#1a1a1a] font-black px-6 py-3 hover:bg-[#d69a2e] transition-colors"
                                    >
                                        ตกลง
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-gray-50 px-5 py-4 rounded-xl border-2 border-transparent">
                                    <span className="text-xl font-black text-[#2C2C2C] truncate">
                                        {displayName || <span className="text-gray-400 font-medium">ไม่ระบุชื่อ</span>}
                                    </span>
                                    <button
                                        onClick={() => { setTempName(displayName); setEditingName(true); }}
                                        className="flex shrink-0 items-center gap-2 text-gray-600 font-bold hover:text-[#F2B33D] transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
                                    >
                                        <FiEdit2 size={16} /> เปลี่ยนชื่อ
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4 mt-auto">
                            <Button
                                onPress={handleShare}
                                isLoading={capturing}
                                className="w-full h-auto bg-[#F2B33D] text-[#1a1a1a] font-black text-xl py-5 rounded-2xl border-b-4 border-[#d69a2e] active:border-b-0 active:translate-y-1 transition-all"
                                startContent={!capturing && <FiShare2 className="w-6 h-6" />}
                            >
                                แชร์ให้เพื่อนเลย!
                            </Button>

                            <div className="flex gap-4">
                                <Button
                                    onPress={handleDownload}
                                    isLoading={capturing}
                                    className="flex-1 h-auto bg-white border-2 border-gray-200 text-[#2C2C2C] font-bold text-lg py-4 rounded-2xl hover:border-[#2C2C2C] transition-all"
                                    startContent={!capturing && <FiDownload className="w-5 h-5" />}
                                >
                                    บันทึกรูป
                                </Button>
                                <Button
                                    onPress={() => setShowQR(v => !v)}
                                    className={`w-[100px] sm:w-[120px] h-auto font-bold py-4 rounded-2xl border-2 transition-all ${showQR ? 'bg-[#2C2C2C] text-[#F2B33D] border-[#2C2C2C]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent'
                                        }`}
                                >
                                    <FaQrcode className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>

                        {/* QR Panel */}
                        {showQR && (
                            <div className="mt-4 p-5 border-2 border-[#2C2C2C] bg-[#2C2C2C] rounded-2xl flex flex-col sm:flex-row items-center gap-5 animate-fade-in shadow-xl">
                                <div className="bg-white rounded-xl p-2 shrink-0">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrUrl)}`}
                                        alt="QR"
                                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                                    />
                                </div>
                                <div className="text-white space-y-1.5 text-center sm:text-left">
                                    <p className="font-black text-lg sm:text-xl text-[#F2B33D]">แชร์ผ่านมือถือ</p>
                                    <p className="text-sm text-gray-300 font-medium">สแกนเพื่อเปิดผลลัพธ์บนมือถือ แล้วบันทึกหรือแชร์ลง Story ได้เลย</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hidden capture card */}
                <div style={{ position: 'fixed', top: 0, left: '-2000px', width: '1080px', height: '1920px', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
                    <ShareDiscoveryCard ref={captureRef} data={data} userName={effectiveName} />
                </div>
            </ModalContent>
        </Modal>
    );
}
