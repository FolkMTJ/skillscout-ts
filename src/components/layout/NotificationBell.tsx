'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, X } from 'lucide-react';
import { Notification } from '@/lib/db/models/Notification';

export default function NotificationBell() {
    const { data: session } = useSession();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [visible, setVisible] = useState(false); // ใช้ควบคุม animation
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchNotifications = useCallback(async () => {
        if (!session?.user?.id) return;
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch {
            // silent
        }
    }, [session?.user?.id]);

    useEffect(() => {
        fetchNotifications();
        pollingRef.current = setInterval(fetchNotifications, 60_000);
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [fetchNotifications]);

    // ปิด dropdown เมื่อ click นอก
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                handleClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const openDropdown = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setIsOpen(true);
        // delay เล็กน้อยเพื่อให้ DOM mount ก่อน trigger animation
        requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    };

    const handleClose = () => {
        setVisible(false);
        closeTimer.current = setTimeout(() => setIsOpen(false), 200);
    };

    const handleToggle = () => {
        if (isOpen) handleClose();
        else openDropdown();
    };

    const handleMarkAllRead = async () => {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markAll: true }),
        });
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const handleClickNotification = async (n: Notification) => {
        if (!n.isRead) {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: String(n._id) }),
            });
            setNotifications(prev =>
                prev.map(x => (x._id === n._id ? { ...x, isRead: true } : x))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        if (n.campId) router.push(`/camps/${n.campId}`);
        handleClose();
    };

    const getIcon = (type: Notification['type']) => {
        const icons: Record<string, string> = {
            portfolio_approved: '✅',
            portfolio_rejected: '❌',
            camp_confirmed: '🎉',
            review_reminder: '⭐',
        };
        return icons[type] ?? '🔔';
    };

    const formatTime = (date: Date | string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'เมื่อกี้';
        if (mins < 60) return `${mins} นาทีที่แล้ว`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
        return `${Math.floor(hrs / 24)} วันที่แล้ว`;
    };

    if (!session) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <button
                className="relative flex items-center justify-center w-8 h-8 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all"
                aria-label="การแจ้งเตือน"
                onClick={handleToggle}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown — fade + slide เหมือน HeroUI */}
            {isOpen && (
                <div
                    className={`absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden
            transition-all duration-200 ease-out origin-top-right
            ${visible
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-95 -translate-y-1'
                        }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="font-bold text-gray-800 text-sm">การแจ้งเตือน</span>
                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="flex items-center gap-1 text-xs text-[#F2B33D] hover:text-[#e0a530] font-medium transition-colors"
                                >
                                    <CheckCheck size={12} />
                                    อ่านทั้งหมด
                                </button>
                            )}
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <Bell className="mx-auto text-gray-300 mb-2" size={28} />
                                <p className="text-sm text-gray-400">ไม่มีการแจ้งเตือน</p>
                            </div>
                        ) : (
                            notifications.slice(0, 10).map(n => (
                                <button
                                    key={String(n._id)}
                                    onClick={() => handleClickNotification(n)}
                                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-[#F2B33D]/5' : ''}`}
                                >
                                    <div className="flex gap-3 items-start">
                                        <span className="text-lg mt-0.5 flex-shrink-0">{getIcon(n.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <p className={`text-xs font-semibold truncate ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {n.title}
                                                </p>
                                                {!n.isRead && (
                                                    <span className="w-2 h-2 rounded-full bg-[#F2B33D] flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
