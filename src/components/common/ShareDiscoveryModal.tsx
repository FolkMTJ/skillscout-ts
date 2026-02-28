// src/components/common/ShareDiscoveryModal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Modal, ModalContent, Button } from '@heroui/react';
import { FiDownload, FiShare2, FiEdit2, FiCheck, FiX, FiBriefcase } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
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
    const [previewScale, setPreviewScale] = useState(0.3);

    const [displayName, setDisplayName] = useState(userName ?? '');
    const [editingName, setEditingName] = useState(false);
    const [tempName, setTempName] = useState('');

    const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setDisplayName(userName ?? '');
            setEditingName(false);
            setQrImageUrl(null);
        }
    }, [isOpen, userName]);

    useEffect(() => {
        if (!isOpen) return;
        const measure = () => {
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                if (previewWrapperRef.current) {
                    const containerW = previewWrapperRef.current.clientWidth;
                    const maxH = window.innerHeight * 0.32;
                    setPreviewScale(Math.min(containerW / 1080, maxH / 1920, 0.26));
                }
            } else {
                const availableH = window.innerHeight * 0.92 - 48;
                setPreviewScale(Math.min(availableH / 1920, 0.3));
            }
        };
        const timer = setTimeout(measure, 80);
        window.addEventListener('resize', measure);
        return () => { clearTimeout(timer); window.removeEventListener('resize', measure); };
    }, [isOpen]);

    const captureDataUrl = async (): Promise<string> => {
        const el = captureRef.current;
        if (!el) throw new Error('No element');
        await document.fonts.ready;
        const { toPng } = await import('html-to-image');
        return toPng(el, {
            width: 1080, height: 1920, pixelRatio: 1,
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
    };

    const captureBlob = async (): Promise<Blob> => {
        const res = await fetch(await captureDataUrl());
        return res.blob();
    };

    const handleDownload = async () => {
        try {
            setCapturing(true);
            const blob = await captureBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${filename}.png`; a.click();
            URL.revokeObjectURL(url);
            toast.success('บันทึกรูปภาพสำเร็จ!');
        } catch { toast.error('ไม่สามารถบันทึกรูปภาพได้'); }
        finally { setCapturing(false); }
    };

    const handleShare = async () => {
        try {
            setCapturing(true);
            const blob = await captureBlob();
            const file = new File([blob], `${filename}.png`, { type: 'image/png' });
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({ title, text: 'ดูอาชีพที่เหมาะกับฉันจาก SkillScout!', files: [file] });
                toast.success('แชร์สำเร็จ!');
            } else if (navigator.clipboard?.write) {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                toast.success('คัดลอกรูปไปยัง Clipboard แล้ว!');
            } else { await handleDownload(); return; }
        } catch { toast.error('แชร์ไม่สำเร็จ ลองบันทึกรูปแทน'); }
        finally { setCapturing(false); }
    };

    const generateQR = async () => {
        if (qrImageUrl) return;
        try {
            setQrLoading(true);
            const dataUrl = await captureDataUrl();
            const res = await fetch('/api/share/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: dataUrl }),
            });
            const json = await res.json() as { url?: string };
            if (json.url) setQrImageUrl(json.url);
            else toast.error('ไม่สามารถสร้าง QR ได้');
        } catch { toast.error('เกิดข้อผิดพลาดในการสร้าง QR'); }
        finally { setQrLoading(false); }
    };

    const effectiveName = displayName || undefined;
    const topCareers = data.recommendedCareers.slice(0, 2);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="4xl"
            scrollBehavior="normal"
            classNames={{
                base: 'bg-white rounded-3xl overflow-hidden my-auto mx-2 md:mx-auto max-h-[92dvh]',
                wrapper: '!fixed !inset-0 !z-50 !flex !items-center !justify-center !p-2 md:!p-4',
            }}
            hideCloseButton
        >
            <ModalContent>
                {() => (<>
                    {/* ── Zoom Overlay ── */}
                    {isZoomed && (
                        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col" onClick={() => setIsZoomed(false)}>
                            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                                <span className="text-white/60 text-sm">แตะนอกรูปเพื่อปิด</span>
                                <button
                                    onClick={() => setIsZoomed(false)}
                                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto flex justify-center px-4 pb-4" onClick={e => e.stopPropagation()}>
                                {(() => {
                                    const zoomScale = Math.min((window.innerWidth - 32) / 1080, 0.85);
                                    return (
                                        <div style={{ width: `${Math.round(1080 * zoomScale)}px`, height: `${Math.round(1920 * zoomScale)}px`, position: 'relative', flexShrink: 0 }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: '1080px', transformOrigin: 'top left', transform: `scale(${zoomScale})` }}>
                                                <ShareDiscoveryCard data={data} userName={effectiveName} />
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    {/* ── Modal Layout ── */}
                    <div className="flex flex-col md:flex-row max-h-[92dvh]">

                        {/* Hidden capture element */}
                        <div style={{ position: 'fixed', top: 0, left: '-1100px', width: '1080px', height: '1920px', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
                            <ShareDiscoveryCard ref={captureRef} data={data} userName={effectiveName} />
                        </div>

                        {/* ── MOBILE: Sticky Header ── */}
                        <div className="md:hidden flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                            <div>
                                <h2 className="text-xl font-black text-[#1a1a1a]">แชร์ผลลัพธ์</h2>
                                <p className="text-xs text-gray-400 mt-0.5">บันทึกหรือแชร์เพื่อบอกเพื่อนๆ ของคุณ</p>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-all flex-shrink-0">
                                <FiX size={16} />
                            </button>
                        </div>

                        {/* ── Scrollable Body ── */}
                        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:min-h-[520px]">

                            {/* Left: Card Preview */}
                            <div className="flex-shrink-0 bg-gray-100 flex flex-col items-center justify-center px-4 py-4 md:px-6 md:py-6 md:rounded-l-3xl">
                                <div ref={previewWrapperRef} className="w-full flex justify-center">
                                    <div
                                        className="rounded-2xl overflow-hidden shadow-lg cursor-zoom-in active:scale-95 transition-transform"
                                        style={{ width: `${Math.round(1080 * previewScale)}px`, height: `${Math.round(1920 * previewScale)}px`, position: 'relative', flexShrink: 0 }}
                                        onClick={() => setIsZoomed(true)}
                                    >
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '1080px', transformOrigin: 'top left', transform: `scale(${previewScale})` }}>
                                            <ShareDiscoveryCard data={data} userName={effectiveName} />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-2">แตะเพื่อขยายดูรายละเอียด</p>
                            </div>

                            {/* Right: Controls */}
                            <div className="flex-1 flex flex-col px-4 py-4 md:px-8 md:py-8 gap-4 md:gap-5">

                                {/* Desktop Header */}
                                <div className="hidden md:flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black text-[#1a1a1a]">แชร์ผลลัพธ์</h2>
                                        <p className="text-sm text-gray-400 mt-1">บันทึกหรือแชร์เพื่อบอกเพื่อนๆ ของคุณ</p>
                                    </div>
                                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-all flex-shrink-0">
                                        <FiX size={16} />
                                    </button>
                                </div>

                                {/* Name Box */}
                                <div className="border border-gray-200 rounded-2xl px-5 py-4">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">ชื่อบนรูปภาพ</p>
                                    {editingName ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                autoFocus
                                                value={tempName}
                                                onChange={e => setTempName(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') { setDisplayName(tempName); setEditingName(false); setQrImageUrl(null); }
                                                    if (e.key === 'Escape') setEditingName(false);
                                                }}
                                                className="flex-1 text-lg font-bold text-[#1a1a1a] border-b-2 border-[#F2B33D] outline-none bg-transparent pb-1"
                                                placeholder="ใส่ชื่อ..."
                                            />
                                            <button
                                                onClick={() => { setDisplayName(tempName); setEditingName(false); setQrImageUrl(null); }}
                                                className="flex items-center gap-1 bg-[#F2B33D] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#d69a2e] transition-all"
                                            >
                                                <FiCheck size={12} /> ตกลง
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-black text-[#1a1a1a]">
                                                {displayName || <span className="text-gray-300 font-normal text-base">ไม่ระบุ</span>}
                                            </span>
                                            <button
                                                onClick={() => { setTempName(displayName); setEditingName(true); }}
                                                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#F2B33D] transition-colors"
                                            >
                                                <FiEdit2 size={13} /> เปลี่ยนชื่อ
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Career Preview */}
                                <div className="border border-gray-100 rounded-2xl px-4 py-3 md:px-5 md:py-4 bg-gray-50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FiBriefcase className="text-[#F2B33D]" size={16} />
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">อาชีพแนะนำสำหรับคุณ</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {topCareers.map((career, idx) => (
                                            <div key={career.id} className="flex items-center gap-2.5">
                                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${idx === 0 ? 'bg-[#F2B33D] text-[#2C2C2C]' : 'bg-[#2C2C2C] text-[#F2B33D]'}`}>
                                                    {idx + 1}
                                                </span>
                                                <span className="text-sm font-bold text-[#2C2C2C] flex-1 truncate">{career.name}</span>
                                                <span className="flex items-center gap-1 text-xs font-semibold text-[#F2B33D] flex-shrink-0">
                                                    <FaStar size={10} /> {career.matchScore}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Desktop Actions */}
                                <div className="hidden md:flex flex-col gap-3 mt-auto">
                                    <Button size="lg" onPress={handleShare} isLoading={capturing}
                                        startContent={!capturing ? <FiShare2 size={18} /> : undefined}
                                        className="w-full bg-[#F2B33D] text-[#1a1a1a] font-black text-base rounded-2xl h-14">
                                        แชร์ให้เพื่อนเลย!
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button variant="bordered" onPress={handleDownload} isLoading={capturing}
                                            startContent={!capturing ? <FiDownload size={16} /> : undefined}
                                            className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl h-12 hover:border-[#F2B33D] hover:text-[#F2B33D] transition-colors">
                                            บันทึกรูป
                                        </Button>
                                        <Button isIconOnly onPress={generateQR} isLoading={qrLoading}
                                            className="w-12 h-12 rounded-2xl bg-[#1a1a1a] text-white flex-shrink-0" title="สร้าง QR โหลดรูป">
                                            {!qrLoading && <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3 3h7v7H3zm1 1v5h5V4zm1 1h3v3H5zm9-2h7v7h-7zm1 1v5h5V4zm1 1h3v3h-3zM3 14h7v7H3zm1 1v5h5v-5zm1 1h3v3H5zm9 0h2v2h-2zm2 0h2v2h-2zm-2 2h2v2h-2zm2 0h2v2h-2zm2-4h2v2h-2zm-4 4h2v2h-2zm2 0h2v2h-2z"/></svg>}
                                        </Button>
                                    </div>
                                    <div className="bg-[#1a1a1a] rounded-2xl px-5 py-4 cursor-pointer hover:bg-[#222] transition-colors"
                                        onClick={!qrImageUrl && !qrLoading ? generateQR : undefined}>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0 bg-white rounded-xl border-4 border-[#F2B33D] w-[84px] h-[84px] flex items-center justify-center overflow-hidden p-1.5">
                                                {qrLoading ? <div className="w-9 h-9 border-[3px] border-[#F2B33D] border-t-transparent rounded-full animate-spin" />
                                                    : qrImageUrl ? <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrImageUrl)}&margin=2`} alt="QR" className="w-full h-full object-contain" />
                                                    : <svg viewBox="0 0 24 24" fill="#d1d5db" className="w-9 h-9"><path d="M3 3h7v7H3zm1 1v5h5V4zm1 1h3v3H5zm9-2h7v7h-7zm1 1v5h5V4zm1 1h3v3h-3zM3 14h7v7H3zm1 1v5h5v-5zm1 1h3v3H5zm9 0h2v2h-2zm2 0h2v2h-2zm-2 2h2v2h-2zm2 0h2v2h-2zm2-4h2v2h-2zm-4 4h2v2h-2zm2 0h2v2h-2z"/></svg>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-bold text-[15px]">แชร์ผ่านมือถือ</p>
                                                <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                                                    {qrImageUrl ? 'สแกนเพื่อเปิดรูปบนมือถือ แล้วบันทึกหรือแชร์ Story ได้เลย'
                                                        : qrLoading ? 'กำลังสร้าง QR...'
                                                        : 'แตะปุ่ม QR เพื่อสร้างลิงค์โหลดรูปบนมือถือ'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* ── MOBILE: Sticky Footer ── */}
                        <div className="md:hidden flex-shrink-0 border-t border-gray-100 px-4 pt-3 pb-4 bg-white flex flex-col gap-2">
                            <Button size="lg" onPress={handleShare} isLoading={capturing}
                                startContent={!capturing ? <FiShare2 size={18} /> : undefined}
                                className="w-full bg-[#F2B33D] text-[#1a1a1a] font-black text-base rounded-2xl h-13">
                                แชร์ให้เพื่อนเลย!
                            </Button>
                            <Button variant="bordered" onPress={handleDownload} isLoading={capturing}
                                startContent={!capturing ? <FiDownload size={16} /> : undefined}
                                className="w-full border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl h-11 hover:border-[#F2B33D] hover:text-[#F2B33D] transition-colors">
                                บันทึกรูป
                            </Button>
                        </div>

                    </div>
                </>)}
            </ModalContent>
        </Modal>
    );
}
