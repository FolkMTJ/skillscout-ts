'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FiUsers,
  FiCalendar,
  FiTrendingUp,
  FiMonitor,
  FiBookOpen,
  FiZap
} from 'react-icons/fi';

const adminTabs = [
  { id: 'overview', label: 'ภาพรวมระบบ', icon: FiMonitor, path: '/admin/overview' },
  { id: 'users', label: 'ผู้ใช้งาน', icon: FiUsers, path: '/admin/users' },
  { id: 'camps', label: 'จัดการค่าย', icon: FiCalendar, path: '/admin/camps' },
  { id: 'payouts', label: 'การเงิน & โอนเงิน', icon: FiTrendingUp, path: '/admin/payouts' },
  { id: 'careers', label: 'อาชีพแนะนำ', icon: FiBookOpen, path: '/admin/careers' },
  { id: 'tags', label: 'ทักษะ & Tags', icon: FiZap, path: '/admin/tags' },
  { id: 'settings', label: 'ตั้งค่าระบบ', icon: FiMonitor, path: '/admin/settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F4F4F5] dark:bg-zinc-900 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#F2B33D] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!session?.user?.email || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
    router.replace('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-zinc-900 py-4 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-[1536px] mx-auto">

        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-700">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">จัดการข้อมูลระบบ, ผู้ใช้งาน, รายได้ และตั้งค่าแพลตฟอร์ม</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-amber-500/20 text-orange-600 dark:text-amber-500 flex items-center justify-center font-bold text-lg">
              {session?.user?.name?.[0] || 'A'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{session?.user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{session?.user?.role || 'Admin'}</p>
            </div>
          </div>
        </div>

        {/* Modular Shell */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700 sticky top-24">
              <nav className="flex flex-col gap-1">
                {adminTabs.map((tab) => {
                  const Icon = tab.icon;
                  // Handle exact match or nested paths under the same module
                  const isActive = pathname === tab.path || pathname.startsWith(tab.path + '/');
                  return (
                    <button
                      key={tab.id}
                      onClick={() => router.push(tab.path)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-bold transition-all ${isActive
                        ? 'bg-[#F2B33D] text-white shadow-md shadow-[#F2B33D]/20 translate-x-1'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                      <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Dynamic Content Frame */}
          <div className="flex-1 min-w-0">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}
