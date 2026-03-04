'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    FiUsers,
    FiCalendar,
    FiShield,
    FiAlertCircle,
    FiXCircle,
    FiTrendingUp,
    FiBookOpen,
    FiTag
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { StatCard } from '@/components/common';

interface User {
    _id: string;
    role: string;
    isBanned?: boolean;
}

interface Camp {
    _id: string;
    status: string;
}

export default function AdminOverview() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [camps, setCamps] = useState<Camp[]>([]);
    const [hollandCount, setHollandCount] = useState(0);
    const [tagsCount, setTagsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, campsRes, careersRes, tagsRes] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/camps?includeAll=true'),
                fetch('/api/admin/holland-careers'),
                fetch('/api/admin/tags'),
            ]);

            const [usersData, campsData, careersData, tagsData] = await Promise.all([
                usersRes.json(),
                campsRes.json(),
                careersRes.json(),
                tagsRes.json(),
            ]);

            if (usersData.users) setUsers(usersData.users);
            setCamps(Array.isArray(campsData) ? campsData : campsData.camps || []);
            if (careersData.careers) setHollandCount(careersData.careers.length);
            if (tagsData.tags) setTagsCount(tagsData.tags.length);
        } catch (err) {
            console.error('Error fetching data:', err);
            toast.error('ไม่สามารถโหลดข้อมูลหน้าหลักได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const totalUsers = users.length;
    const organizers = users.filter((u) => u.role === 'organizer').length;
    const bannedUsers = users.filter((u) => u.isBanned).length;
    const pendingCamps = camps.filter((c) => c.status === 'pending').length;
    const activeCamps = camps.filter((c) => c.status === 'active').length;

    if (loading) {
        return (
            <div className="animate-pulse space-y-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-700">
                            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-20 mb-2"></div>
                            <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <StatCard title="ผู้ใช้ทั้งหมด" value={totalUsers} icon={<FiUsers />} color="primary" />
                <StatCard title="Organizers" value={organizers} icon={<FiShield />} color="secondary" />
                <StatCard title="Banned" value={bannedUsers} icon={<FiXCircle />} color="danger" />
                <StatCard title="ค่ายรออนุมัติ" value={pendingCamps} icon={<FiAlertCircle />} color="warning" />
                <StatCard title="ค่ายที่เปิด" value={activeCamps} icon={<FiCalendar />} color="success" />
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-zinc-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">เมนูลัด (Quick Actions)</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <button
                        onClick={() => router.push('/admin/camps')}
                        className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-5 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all text-left border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-500/30 group"
                    >
                        <FiAlertCircle className="text-orange-500 text-2xl mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-3xl font-black text-orange-500">{pendingCamps}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ค่ายรออนุมัติ</p>
                    </button>

                    <button
                        onClick={() => router.push('/admin/payouts')}
                        className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-5 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all text-left border-2 border-transparent hover:border-[#F2B33D]/40 group"
                    >
                        <FiTrendingUp className="text-[#F2B33D] text-2xl mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-xl font-black text-[#F2B33D] mt-1.5">Payout</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dashboard</p>
                    </button>

                    <button
                        onClick={() => router.push('/admin/users')}
                        className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-500/30 group"
                    >
                        <FiUsers className="text-blue-500 text-2xl mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-3xl font-black text-blue-500">{totalUsers}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ผู้ใช้ทั้งหมด</p>
                    </button>

                    <button
                        onClick={() => router.push('/admin/careers')}
                        className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-5 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-500/30 group"
                    >
                        <FiBookOpen className="text-purple-500 text-2xl mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-3xl font-black text-purple-500">{hollandCount}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">อาชีพ Holland</p>
                    </button>

                    <button
                        onClick={() => router.push('/admin/tags')}
                        className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-5 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all text-left border-2 border-transparent hover:border-teal-200 dark:hover:border-teal-500/30 group"
                    >
                        <FiTag className="text-teal-500 text-2xl mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-3xl font-black text-teal-500">{tagsCount}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tags ทักษะ</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
