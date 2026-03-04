'use client';

import Link from 'next/link';
import { Button } from '@heroui/react';
import { FiHome, FiSearch } from 'react-icons/fi';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="relative w-64 h-64 mx-auto mb-8 flex justify-center items-center">
                    <div className="absolute inset-0 bg-[#F2B33D] rounded-full blur-[100px] opacity-20"></div>
                    <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#F2B33D] to-orange-500 relative z-10">404</h1>
                </div>

                <div className="space-y-3 relative z-10">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">ไม่พบหน้านี้</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        ขออภัย! หน้าเว็บที่คุณกำลังค้นหาอาจถูกย้าย ลบ หรือไม่มีอยู่จริงในระบบของเรา
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 relative z-10">
                    <Button
                        as={Link}
                        href="/"
                        className="bg-[#F2B33D] text-[#1a1a1a] font-bold"
                        startContent={<FiHome />}
                        size="lg"
                    >
                        กลับหน้าหลัก
                    </Button>
                    <Button
                        as={Link}
                        href="/path-finder"
                        variant="flat"
                        className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold"
                        startContent={<FiSearch />}
                        size="lg"
                    >
                        ค้นหาค่าย
                    </Button>
                </div>
            </div>
        </div>
    );
}
